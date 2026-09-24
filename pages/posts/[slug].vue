<template>
  <article class="post">
    <NuxtLink to="/" class="back-link">← 全部文章</NuxtLink>

    <header class="post-header">
      <span class="chip">{{ post.category }}</span>
      <h1>{{ post.title }}</h1>
      <p class="meta">{{ formatDate(post.createdAt) }} · 约 {{ readMinutes }} 分钟 · {{ charCount }} 字</p>
    </header>

    <div class="cover-image" v-if="post.coverImage">
      <img :src="post.coverImage" :alt="post.title" />
    </div>

    <div class="content" v-html="renderedContent"></div>

    <div class="tags" v-if="post.tags">
      <span v-for="tag in post.tags.split(',')" :key="tag" class="chip tag-chip">{{ tag.trim() }}</span>
    </div>

    <footer class="post-footer">
      <NuxtLink to="/" class="back-link">← 返回全部文章</NuxtLink>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { marked } from 'marked'

const route = useRoute()
const slug = route.params.slug as string

const { data: post } = await useFetch(`/api/posts/${slug}`)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const renderedContent = computed(() => {
  if (!post.value) return ''
  return marked(post.value.content)
})

const charCount = computed(() => {
  if (!post.value) return 0
  return post.value.content.replace(/\s/g, '').length
})

const readMinutes = computed(() => Math.max(1, Math.ceil(charCount.value / 400)))

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: post.value?.title,
  meta: [{ name: 'description', content: post.value?.excerpt }]
})
</script>

<style scoped>
.post {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.back-link {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--color-primary);
}

.post-header {
  margin-top: 32px;
}

.chip {
  display: inline-block;
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

.post-header h1 {
  font-size: clamp(1.75rem, 4vw, 2.375rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: var(--color-text);
  margin: 16px 0;
}

.meta {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
}

.cover-image {
  margin: 28px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.cover-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* ---- 正文 prose ---- */
.content {
  font-size: 16px;
  line-height: 1.85;
  color: var(--color-text);
}

.content :deep(p) {
  margin: 1.35em 0;
}

.content :deep(h2) {
  font-size: 22px;
  font-weight: 600;
  margin: 2.75em 0 1em;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.35;
}

.content :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  margin: 2.25em 0 0.75em;
  line-height: 1.4;
}

.content :deep(h4),
.content :deep(h5),
.content :deep(h6) {
  font-size: 16px;
  font-weight: 600;
  margin: 2em 0 0.75em;
}

.content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 2px 6px;
}

.content :deep(pre) {
  background: var(--color-code-bg);
  color: var(--color-code-text);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 18px 20px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13.5px;
  line-height: 1.7;
  margin: 1.5em 0;
}

.content :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}

.content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 12px 20px;
  border-left: 3px solid var(--color-border-strong);
  background: var(--color-bg-subtle);
  border-radius: 0 8px 8px 0;
  color: var(--color-text-secondary);
}

.content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.content :deep(ul),
.content :deep(ol) {
  padding-left: 1.5em;
  margin: 1.35em 0;
}

.content :deep(li) {
  margin: 0.5em 0;
}

.content :deep(li::marker) {
  color: var(--color-text-muted);
}

.content :deep(img) {
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin: 1.5em 0;
}

.content :deep(th),
.content :deep(td) {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

.content :deep(th) {
  background: var(--color-bg-subtle);
}

.content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 3em 0;
}

.content :deep(strong) {
  font-weight: 600;
}

/* ---- 标签与文末 ---- */
.tags {
  margin-top: 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
}

.post-footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}
</style>
