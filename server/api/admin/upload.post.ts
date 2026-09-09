import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)
  
  if (!files || files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded'
    })
  }
  
  const file = files.find(f => f.type === 'file' && f.name === 'file')
  
  if (!file || !file.filename || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file'
    })
  }
  
  const ext = file.filename.split('.').pop() || 'jpg'
  const finalFilename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const uploadDir = join(process.cwd(), 'public/uploads')
  const filepath = join(uploadDir, finalFilename)
  
  // Ensure upload directory exists
  await mkdir(uploadDir, { recursive: true })
  
  await writeFile(filepath, file.data)
  
  return { url: `/uploads/${finalFilename}` }
})
