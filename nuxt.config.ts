export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  },

  nitro: {
    prerender: {
      routes: ['/'],
      // 2026-09 两次线上事故根因：DB 不可达时预渲染把 500/空首页烤进静态页，
      // 然后照常部署覆盖线上。failOnError 让硬失败的预渲染路由直接导致构建失败。
      failOnError: true
    },
    hooks: {
      // 文章卡片是 JS 跳转（无 <a href>），爬虫发现不了 /posts/*，
      // 必须在构建时从数据库显式注册全部文章路由
      'prerender:routes': async (routes) => {
        // 构建期数据库是唯一数据源：连不上就中止构建，绝不发布空站。
        const raw = process.env.DATABASE_URL
        if (!raw) throw new Error('[prerender] DATABASE_URL 未设置 —— 先运行 scripts/mysql-tunnel.sh 再构建')
        const url = new URL(raw)
        const mariadb = await import('mariadb')
        const conn = await mariadb.default.createConnection({
          host: url.hostname,
          port: Number(url.port || 3306),
          user: decodeURIComponent(url.username),
          password: decodeURIComponent(url.password),
          database: url.pathname.replace(/^\//, ''),
          connectTimeout: 30000,
          // caching_sha2_password 认证需要 RSA 公钥；连接已经 SSH 隧道加密，允许检索是安全的
          allowPublicKeyRetrieval: true
        })
        try {
          const rows = await conn.query('SELECT slug FROM Post WHERE published = 1')
          if (!rows.length) throw new Error('[prerender] Post 表查询结果为空 —— 数据库异常，拒绝构建发布')
          for (const r of rows) routes.add(`/posts/${r.slug}`)
          // eslint-disable-next-line no-console
          console.info(`[prerender] registered ${rows.length} post routes from DB`)
        } finally {
          await conn.end()
        }
      }
    }
  }
})
