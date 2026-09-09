import { defineEventHandler, readBody } from 'h3'
import { prisma } from '../../../lib/prisma'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, content, excerpt, coverImage, category, tags, published } = body
  
  if (!title || !content || !category) {
    return {
      error: 'Title, content, and category are required'
    }
  }
  
  const slug = slugify(title, { lower: true, strict: true })
  
  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || '',
      coverImage: coverImage || null,
      category,
      tags: tags || '',
      published: published ?? false
    }
  })
  
  return post
})
