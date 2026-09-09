import { defineEventHandler, readBody, getRouterParam } from 'h3'
import { prisma } from '../../../lib/prisma'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)
  const { title, content, excerpt, coverImage, category, tags, published } = body
  
  const updateData: Record<string, unknown> = {
    content,
    excerpt,
    coverImage,
    category,
    tags,
    published
  }
  
  if (title) {
    updateData.title = title
    updateData.slug = slugify(title, { lower: true, strict: true })
  }
  
  const post = await prisma.post.update({
    where: { id },
    data: updateData
  })
  
  return post
})
