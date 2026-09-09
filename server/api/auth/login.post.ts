import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../lib/auth'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body
  
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password required'
    })
  }
  
  const user = await prisma.user.findUnique({
    where: { username }
  })
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
  
  const valid = await bcrypt.compare(password, user.password)
  
  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
  
  const token = signToken({ userId: user.id, username: user.username })
  
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })
  
  return { success: true, user: { id: user.id, username: user.username } }
})
