<template>
  <NuxtLink :to="`/posts/${post.slug}`" class="post-card">
    <div class="cover" v-if="post.coverImage">
      <img :src="post.coverImage" :alt="post.title" />
    </div>
    <div class="content">
      <span class="category">{{ post.category }}</span>
      <h2>{{ post.title }}</h2>
      <p class="excerpt">{{ post.excerpt }}</p>
      <span class="date">{{ formatDate(post.createdAt) }}</span>
    </div>
  </NuxtLink>
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

defineProps<{
  post: Post
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.post-card {
  display: block;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #dfe6e9;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover {
  aspect-ratio: 16/9;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .cover img {
  transform: scale(1.05);
}

.content {
  padding: 1.25rem;
}

.category {
  display: inline-block;
  background: #6c5ce7;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.excerpt {
  color: #636e72;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  color: #b2bec3;
  font-size: 0.75rem;
}
</style>
