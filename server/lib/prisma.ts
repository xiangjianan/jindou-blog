import { PrismaClient } from '../../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// MySQL 连接（凭据只从 DATABASE_URL 读取，不落代码）。
// 格式: mysql://user:pass@host:port/blog —— 本机构建经 SSH 隧道 127.0.0.1:3307
function adapterFromEnv() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL is not set')
  const url = new URL(raw)
  // eslint-disable-next-line no-console
  console.warn(`[prisma] adapter target: ${url.hostname}:${url.port || 3306} db=${url.pathname.replace(/^\//, '')}`)
  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 5,
    // 注意：mariadb 池按设计常驻 ≥minimumIdle 条连接（minimumIdle=0 则拒绝建连，
    // 默认值=connectionLimit 则永不回收），因此 nuxt build 结束后进程不会自然退出。
    // 发布收尾由 scripts/deploy.sh 的构建看门狗处理（2026-09-18 定位）。
    // 预渲染环境首连较慢（SSH 隧道 + worker 调度），给足超时
    connectTimeout: 30000,
    initializationTimeout: 60000,
    acquireTimeout: 60000,
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: adapterFromEnv() })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
