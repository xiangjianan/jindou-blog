<template>
  <div class="dashboard">
    <div class="header">
      <h1>Posts</h1>
      <NuxtLink to="/admin/posts/new" class="btn-primary">New Post</NuxtLink>
    </div>
    
    <div class="posts-list" v-if="posts && posts.length > 0">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <div class="post-info">
          <h2>{{ post.title }}</h2>
          <div class="meta">
            <span :class="['status', post.published ? 'published' : 'draft']">
              {{ post.published ? 'Published' : 'Draft' }}
            </span>
            <span class="category">{{ post.category }}</span>
            <span class="date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="actions">
          <NuxtLink :to="`/admin/posts/${post.id}`" class="btn-edit">Edit</NuxtLink>
          <button @click="deletePost(post.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty">
      <p>No posts yet. Create your first post!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

interface Post {
  id: number
  title: string
  category: string
  published: boolean
  createdAt: string
}

const { data: posts, refresh } = await useFetch<Post[]>('/api/admin/posts', {
  default: () => []
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const deletePost = async (id: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return
  
  await $fetch(`/api/admin/posts/${id}`, {
    method: 'DELETE'
  })
  
  refresh()
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3436;
}

.btn-primary {
  background: #6c5ce7;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  text-decoration: none;
  font-weight: 500;
}

.btn-primary:hover {
  background: #5b4cdb;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #dfe6e9;
}

.post-info h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 0.5rem;
}

.meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.published {
  background: #00b894;
  color: white;
}

.status.draft {
  background: #fdcb6e;
  color: #2d3436;
}

.category {
  color: #636e72;
  font-size: 0.875rem;
}

.date {
  color: #b2bec3;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 0.25rem;
  color: #2d3436;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-edit:hover {
  background: #f5f5f5;
}

.btn-delete {
  padding: 0.5rem 0.75rem;
  background: #d63031;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-delete:hover {
  background: #c0392b;
}

.empty {
  text-align: center;
  padding: 4rem 0;
  color: #636e72;
}
</style>
