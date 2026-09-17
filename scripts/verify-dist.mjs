#!/usr/bin/env node
// 构建产物校验：部署前最后一道防线（2026-09 两次线上事故的产物签名检测）。
// 检查 .output/public 首页没有被烤入 API 500 / "No posts yet"，且文章路由真实生成。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = '.output/public'
const problems = []

const indexHtml = join(dist, 'index.html')
if (!existsSync(indexHtml)) {
  console.error('[verify-dist] 缺少 .output/public/index.html —— 构建产物不完整')
  process.exit(1)
}
const html = readFileSync(indexHtml, 'utf8')

if (html.includes('No posts yet')) {
  problems.push('首页被烤入 "No posts yet"（构建时数据库不可用的典型症状）')
}
if (/500 Server Error|NuxtError/.test(html)) {
  problems.push('首页 payload 被烤入 API 500 错误（构建时 /api/posts 失败）')
}

const postsDir = join(dist, 'posts')
let routeCount = 0
if (existsSync(postsDir) && statSync(postsDir).isDirectory()) {
  routeCount = readdirSync(postsDir).filter((d) =>
    existsSync(join(postsDir, d, 'index.html'))
  ).length
}
if (routeCount === 0) {
  problems.push('没有任何 /posts/* 路由被预渲染（prerender:routes 未从数据库注册到路由）')
}

if (problems.length) {
  console.error('[verify-dist] 构建产物异常，禁止部署：')
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log(`[verify-dist] OK：首页正常，${routeCount} 篇文章路由已预渲染`)
