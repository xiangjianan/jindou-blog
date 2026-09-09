import { defineEventHandler } from 'h3'
import { prisma } from '../../../lib/prisma'

export default defineEventHandler(async () => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return posts
})
