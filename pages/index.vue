<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-text">
          <p class="hero-kicker">// AI RESEARCH NOTES</p>
          <h1 class="hero-title">把前沿 AI，讲到真正理解。</h1>
          <p class="hero-subtitle">深度学习 · LLM · Agent 的长文研究笔记。每一篇都追到原理层，拒绝浅尝辄止。</p>
          <p class="hero-stats">{{ posts.length }} 篇文章<template v-if="latest"> · 最近更新 {{ formatDate(latest) }}</template></p>
        </div>
      </div>
    </section>

    <section v-if="posts.length > 0" class="post-list">
      <div class="container">
        <section v-for="group in groups" :key="group.year" class="year-group">
          <header class="year-header">
            <span class="year-label">{{ group.year }}</span>
            <span class="year-rule" aria-hidden="true"></span>
            <span class="year-count">{{ group.posts.length }} 篇</span>
          </header>

          <div class="year-posts">
            <NuxtLink v-for="post in group.posts" :key="post.id" :to="`/posts/${post.slug}`" class="post-row">
              <span class="post-date">{{ formatMonthDay(post.createdAt) }}</span>
              <span class="post-main">
                <span class="post-title">{{ post.title }}</span>
                <span class="post-excerpt">{{ post.excerpt }}</span>
              </span>
              <span class="post-side">
                <span class="post-arrow" aria-hidden="true">→</span>
                <span class="chip">{{ post.category }}</span>
              </span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </section>

    <div v-else class="empty-state">
      <p class="empty-mark">// 暂无文章</p>
      <p class="empty-note">文章正在路上。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  category: string
  createdAt: string
}

const { data: posts } = await useFetch<Post[]>('/api/posts', {
  default: () => []
})

// 接口按 createdAt 倒序返回，首条即最新
const latest = computed(() => posts.value[0]?.createdAt)

interface PostGroup {
  year: number
  posts: Post[]
}

// 按 createdAt 年份倒序分组，组内按时间倒序
const groups = computed<PostGroup[]>(() => {
  const byYear = new Map<number, Post[]>()
  for (const post of posts.value) {
    const year = new Date(post.createdAt).getFullYear()
    byYear.set(year, [...(byYear.get(year) ?? []), post])
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({
      year,
      posts: [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    }))
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatMonthDay = (date: string) => {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
</script>

<style scoped>
.home {
  padding-bottom: 4rem;
}

/* ---- Hero ---- */
.hero {
  padding: 88px 0 40px;
}

.hero-text {
  max-width: 720px;
}

.hero-kicker {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-primary);
}

.hero-title {
  margin-top: 20px;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--color-text);
}

.hero-subtitle {
  margin-top: 20px;
  font-size: 17px;
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 560px;
}

.hero-stats {
  margin-top: 28px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ---- 年份分组列表 ---- */
.year-group:first-child .year-header {
  margin-top: 48px;
}

.year-header {
  margin: 48px 0 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.year-label {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
}

.year-rule {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.year-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
}

.post-row {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  grid-template-areas: "date main side";
  gap: 20px;
  align-items: baseline;
  padding: 20px 20px;
  margin: 0 -20px;
  border-radius: 12px;
  transition: background-color 0.15s ease;
}

/* 相邻行之间的细分隔线 */
.year-posts > .post-row + .post-row {
  border-top: 1px solid var(--color-border);
}

.post-date {
  grid-area: date;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
}

.post-main {
  grid-area: main;
  display: block;
  min-width: 0;
}

.post-title {
  display: block;
  font-size: 16.5px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.5;
  transition: color 0.15s ease;
}

.post-excerpt {
  display: block;
  margin-top: 4px;
  font-size: 14px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-side {
  grid-area: side;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chip {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  color: var(--color-text-secondary);
  background: transparent;
  white-space: nowrap;
}

.post-arrow {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-primary);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.post-row:hover {
  background: var(--color-bg-subtle);
}

.post-row:hover .post-title {
  color: var(--color-primary);
}

.post-row:hover .post-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ---- 空状态 ---- */
.empty-state {
  text-align: center;
  padding: 6rem 1rem;
}

.empty-mark {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-text-muted);
}

.empty-note {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* ---- 移动端 ---- */
@media (max-width: 640px) {
  .hero {
    padding: 56px 0 24px;
  }

  .post-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "date side"
      "main main";
    gap: 10px 16px;
    padding: 16px 0;
    margin: 0;
    border-radius: 0;
  }

  .post-arrow {
    display: none;
  }
}
</style>
