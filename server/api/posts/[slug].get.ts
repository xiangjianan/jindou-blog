import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '../../lib/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }
  
  const post = await prisma.post.findUnique({
    where: { slug }
  })
  
  if (!post || !post.published) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found'
    })
  }
  
  return post
})
