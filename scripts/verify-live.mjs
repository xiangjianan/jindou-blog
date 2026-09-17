#!/usr/bin/env node
// 部署后线上校验：确认真实站点有文章、无空站症状。失败返回非零（用于心跳任务告警）。
// slug 从构建产物目录读取，不依赖数据库/隧道；首页检查带 CDN 缓存击穿回退。
import { execSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.LIVE_BASE_URL || 'https://jindou-blog.pages.dev'
const DIST = '.output/public'

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' })

// 1. 从构建产物取真实 slug（部署的就是这份产物，无需 DB）
const postsDir = join(DIST, 'posts')
if (!existsSync(postsDir)) {
  console.error('[verify-live] .output/public/posts 不存在 —— 先完成构建')
  process.exit(1)
}
const slugs = readdirSync(postsDir).filter((d) =>
  existsSync(join(postsDir, d, 'index.html'))
)
if (!slugs.length) {
  console.error('[verify-live] 构建产物里没有任何文章路由 —— 拒绝校验通过')
  process.exit(1)
}

// 2. 首页不能是空站；裸 URL 失败时用 cache-buster 复核（排除 CDN 边缘缓存旧条目误报）
const checkHome = (suffix) => {
  const html = sh(`curl -sS --max-time 30 ${BASE}/${suffix}`)
  if (html.includes('No posts yet')) return '首页显示 "No posts yet"（部署的是坏产物或旧缓存）'
  if (/500 Server Error|NuxtError/.test(html)) return '首页 payload 含 API 500 错误'
  return null
}
let problem = checkHome('')
let note = ''
if (problem) {
  const busted = checkHome(`?_cb=${Date.now()}`)
  if (!busted) {
    note = '（裸 URL 命中 CDN 边缘缓存旧条目，cache-buster 复核通过）'
    problem = null
  }
}
if (problem) {
  console.error(`[verify-live] 线上校验失败（${BASE}）：${problem}`)
  process.exit(1)
}

// 3. 抽查一篇产物内文章真实可访问（带 -L：尾斜杠 308 重定向属正常）
const slug = slugs[0]
const status = sh(
  `curl -sS -o /dev/null -w "%{http_code}" -L --max-time 30 ${BASE}/posts/${slug}/`
).trim()
if (status !== '200') {
  console.error(`[verify-live] 线上校验失败：/posts/${slug}/ 返回 HTTP ${status}（预期 200）`)
  process.exit(1)
}

console.log(
  `[verify-live] OK：首页正常${note}，抽查文章 /posts/${slug}/ 可访问（产物内共 ${slugs.length} 篇路由）`
)
