<template>
  <article class="post">
    <header class="post-header">
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <span class="category">{{ post.category }}</span>
        <span class="date">{{ formatDate(post.createdAt) }}</span>
      </div>
    </header>
    
    <div class="cover-image" v-if="post.coverImage">
      <img :src="post.coverImage" :alt="post.title" />
    </div>
    
    <div class="content" v-html="renderedContent"></div>
    
    <div class="tags" v-if="post.tags">
      <span v-for="tag in post.tags.split(',')" :key="tag" class="tag">{{ tag.trim() }}</span>
    </div>
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: post.value?.title
})
</script>

<style scoped>
.post {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-header {
  margin-bottom: 2rem;
}

.post-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  gap: 1rem;
  color: #636e72;
}

.category {
  background: #6c5ce7;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.cover-image {
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: auto;
}

.content {
  line-height: 1.8;
  color: #2d3436;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.content :deep(p) {
  margin-bottom: 1rem;
}

.content :deep(code) {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.content :deep(pre) {
  background: #2d3436;
  color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.content :deep(pre code) {
  background: none;
  padding: 0;
}

.content :deep(a) {
  color: #6c5ce7;
  text-decoration: underline;
}

.content :deep(ul),
.content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.content :deep(li) {
  margin-bottom: 0.5rem;
}

.content :deep(blockquote) {
  border-left: 4px solid #6c5ce7;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #636e72;
}

.tags {
  margin-top: 2rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: #f5f5f5;
  color: #636e72;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
