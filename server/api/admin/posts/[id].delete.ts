import { defineEventHandler, getRouterParam } from 'h3'
import { prisma } from '../../../lib/prisma'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  
  await prisma.post.delete({
    where: { id }
  })
  
  return { success: true }
})
