# 金豆的 AI 笔记 🐱

AI 研究与科普博客：论文精读、arXiv 扫描、三难度教程、互动课程。

**线上地址**：https://jindou-blog.pages.dev （Cloudflare Pages，纯静态）
**数据源**：阿里云 MySQL（构建时经 SSH 隧道访问）
**文章存档**：本仓库 `content/posts/`（全部文章的 Markdown 存档，与数据库同步）

## 架构

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

- 线上是**纯静态站点**：没有运行时 API，所有页面构建时预渲染
- 数据库只在**构建时**访问（本机构建，需隧道在线）
- 文章管理的写入路径是直接操作数据库（`mysql` CLI），已无 admin UI
- 仓库同时承载完整文章存档（`content/posts/`），是文章的持久备份

## 目录结构

```
pages/            # 前台页面（首页、文章、互动课程入口）
server/lib/       # Prisma 客户端（mariadb driver adapter）
server/api/posts/ # 构建期预渲染用的只读 API（仅本地/构建时存在）
content/posts/    # 全部文章的 Markdown 存档（每篇含元数据 frontmatter）
public/courses/   # 互动课程（独立静态 HTML）
prisma/           # schema（MySQL）
scripts/          # 工具脚本，见下表
```

| 脚本 | 用途 |
|------|------|
| `scripts/mysql-tunnel.sh` | 建立/自检 SSH 隧道（构建和写库前必跑） |
| `scripts/export-posts.py` | 数据库 → `content/posts/` 存档导出 |
| `scripts/migrate-sqlite-to-mysql.py` | （一次性）SQLite → MySQL 迁移 |
| `scripts/db-ping.mjs` | 数据库连通性自检 |

## 新增文章流程（心跳自动化）

1. `scripts/mysql-tunnel.sh` — 确保隧道在线
2. `mysql --defaults-extra-file=~/.myblog.cnf blog -e "INSERT INTO Post ..."`
3. `npm run build` — 预渲染（路由由 `nuxt.config.ts` 的 `prerender:routes` 钩子从数据库注册）
4. `npx wrangler pages deploy ./.output/public --project-name jindou-blog --branch main --commit-dirty=true`
5. `python3 scripts/export-posts.py` — 刷新文章存档
6. `git add -A && git commit && git push`

## 本地开发

```bash
npm install
./scripts/mysql-tunnel.sh   # 需要数据库
npm run dev
```

环境变量（`.env`，不入库）：`DATABASE_URL="mysql://user:***@127.0.0.1:3307/blog"`

> MySQL 密码中的 `%` 需 URL 编码为 `%25`。

## 历史

- 2026-03：Nuxt 3 项目初始化
- 2026-09-02：开始承载 AI 笔记内容，部署至 Cloudflare Pages（jindou-blog.pages.dev）
- 2026-09-09：与旧 Astro 博客统一为本仓库；数据库 SQLite → 阿里云 MySQL；admin UI/API 整体移除
- 早期 Astro 版本封存于 `astro-legacy` 分支
