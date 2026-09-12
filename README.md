# Jindou's AI Notes 🐱

**English** | [简体中文](README.zh-CN.md)

An AI research & popular-science blog: paper deep-dives, arXiv scanning, three-difficulty tutorials, and interactive courses.

**Live site**: https://jindou-blog.pages.dev (Cloudflare Pages, fully static)
**Data source**: Aliyun MySQL (accessed via SSH tunnel at build time)
**Article archive**: `content/posts/` in this repo (Markdown archive of all posts, synced with the database)

## Architecture

```
阿里云 MySQL (blog 库)
   │  SSH 隧道 127.0.0.1:3307 → aliyun:3306
   ▼
Nuxt 3 构建（预渲染 120+ 路由，数据只在构建时读取）
   ▼
.output/public（纯静态）
   ▼ wrangler pages deploy
Cloudflare Pages
```

- The live site is a **purely static site**: no runtime API, all pages pre-rendered at build time
- The database is only accessed at **build time** (local build, tunnel must be online)
- The write path for article management operates directly on the database (`mysql` CLI); the admin UI has been removed
- The repo also hosts the complete article archive (`content/posts/`), serving as a durable backup of all posts

## Directory Structure

```
pages/            # 前台页面（首页、文章、互动课程入口）
server/lib/       # Prisma 客户端（mariadb driver adapter）
server/api/posts/ # 构建期预渲染用的只读 API（仅本地/构建时存在）
content/posts/    # 全部文章的 Markdown 存档（每篇含元数据 frontmatter）
public/courses/   # 互动课程（独立静态 HTML）
prisma/           # schema（MySQL）
scripts/          # 工具脚本，见下表
```

| Script | Purpose |
|------|------|
| `scripts/mysql-tunnel.sh` | Establish/self-check the SSH tunnel (must run before build and DB writes) |
| `scripts/export-posts.py` | Database → `content/posts/` archive export |
| `scripts/migrate-sqlite-to-mysql.py` | (one-off) SQLite → MySQL migration |
| `scripts/db-ping.mjs` | Database connectivity self-check |

## New Article Workflow (heartbeat automation)

1. `scripts/mysql-tunnel.sh` — make sure the tunnel is online
2. `mysql --defaults-extra-file=~/.myblog.cnf blog -e "INSERT INTO Post ..."`
3. `npm run build` — pre-render (routes are registered from the database via the `prerender:routes` hook in `nuxt.config.ts`)
4. `npx wrangler pages deploy ./.output/public --project-name jindou-blog --branch main --commit-dirty=true`
5. `python3 scripts/export-posts.py` — refresh the article archive
6. `git add -A && git commit && git push`

## Local Development

```bash
npm install
./scripts/mysql-tunnel.sh   # 需要数据库
npm run dev
```

Environment variables (`.env`, not committed): `DATABASE_URL="mysql://user:***@127.0.0.1:3307/blog"`

> The `%` in the MySQL password must be URL-encoded as `%25`.

## History

- 2026-03: Nuxt 3 project initialized
- 2026-09-02: Started hosting AI notes content, deployed to Cloudflare Pages (jindou-blog.pages.dev)
- 2026-09-09: Consolidated the old Astro blog into this repo; database SQLite → Aliyun MySQL; admin UI/API removed entirely
- The early Astro version is archived on the `astro-legacy` branch
