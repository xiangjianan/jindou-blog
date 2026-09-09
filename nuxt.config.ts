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
      routes: ['/']
    },
    hooks: {
      // 文章卡片是 JS 跳转（无 <a href>），爬虫发现不了 /posts/*，
      // 必须在构建时从数据库显式注册全部文章路由
      'prerender:routes': async (routes) => {
        try {
          const raw = process.env.DATABASE_URL
          if (!raw) throw new Error('DATABASE_URL is not set')
          const url = new URL(raw)
          const mariadb = await import('mariadb')
          const conn = await mariadb.default.createConnection({
            host: url.hostname,
            port: Number(url.port || 3306),
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\//, ''),
            connectTimeout: 30000
          })
          const rows = await conn.query('SELECT slug FROM Post WHERE published = 1')
          await conn.end()
          for (const r of rows) routes.add(`/posts/${r.slug}`)
          // eslint-disable-next-line no-console
          console.info(`[prerender] registered ${rows.length} post routes from DB`)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[prerender] failed to load slugs from DB:', e.message)
        }
      }
    }
  }
})
