import { defineEventHandler, createError, getCookie, getRequestURL } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only protect admin API routes
  const isAdminApi = pathname.startsWith('/api/admin')

  if (!isAdminApi) {
    return
  }

  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string }
    event.context.auth = payload
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }
})
