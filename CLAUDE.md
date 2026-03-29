# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

金豆的 AI 笔记 — a Chinese-language personal blog about AI research and tutorials, built with Astro + Starlight and deployed to Cloudflare Pages. Designed as a modern wiki/doc site with top navigation bar and dynamic category pages.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Static build to ./dist
npm run preview   # Preview built site locally
```

No test or lint commands are configured.

## Architecture

**Framework**: Astro 6 + Starlight (docs-mode site generator) + MDX. Static output only (`output: 'static'`).

### Navigation Structure

- **Top nav bar** (`CustomHeader.astro`): Logo + category links (AI前沿, 科普教程, 研究笔记, 研究周报, 关于). Overrides Starlight's default header.
- **Sidebar**: Auto-generated from content directories via `autogenerate` in `astro.config.mjs`.
- **Category index pages** (`src/pages/{category}/index.astro`): Standalone pages listing posts in that category with cards.
- **Homepage** (`src/pages/index.astro`): Custom landing page with hero section, category grid, and latest posts.

### Content System

All blog posts live in `src/content/docs/` organized by category:
- `ai/` — AI paper readings and research notes
- `tutorials/` — Educational tutorials (attention, CoT, hallucination, etc.)
- `notes/` — Research notes and scans
- `research/` — Weekly arXiv paper digests

Content uses Starlight's `docsSchema()` via `src/content.config.ts` with a glob loader. Frontmatter fields: `title`, `description`, `date`, `tags`.

### Key Files

- `astro.config.mjs` — Starlight config with `autogenerate` sidebar, custom components
- `src/components/CustomHeader.astro` — Top navigation bar (replaces Starlight default header)
- `src/components/CustomPage.astro` — Wraps Starlight's Page + injects Mermaid support
- `src/components/MermaidScript.astro` — Client-side Mermaid diagram rendering
- `src/pages/index.astro` — Homepage (custom, bypasses Starlight)
- `src/pages/{ai,tutorials,notes,research}/index.astro` — Category listing pages
- `src/styles/custom.css` — Warm amber/sepia palette, hides default Starlight header

### Styling

Warm amber/sepia palette with light/dark theme support. CSS variables override Starlight's `--sl-*` tokens. Google Fonts: Noto Serif SC (headings), Noto Sans SC (body). The default Starlight header is hidden via CSS since the custom header replaces it.

### Deployment

Cloudflare Pages. `wrangler.toml` points `pages_build_output_dir` to `./dist`.

## Key Conventions

- Content is written in Chinese (zh-CN locale). Code terms and paper names stay in English.
- Mermaid diagrams are supported in MDX via `MermaidScript.astro` — use ` ```mermaid ` code blocks.
- Sidebar auto-generates from directories — no manual sidebar config needed for new posts.
- Adding a new post: create MDX file in the appropriate `src/content/docs/{category}/` directory.
- Category index pages and the homepage use shared inline styles (not Tailwind) for zero-dependency rendering.
