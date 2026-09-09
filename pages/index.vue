<template>
  <div class="home">
    <header class="hero">
      <h1>Blog</h1>
      <p class="subtitle">Thoughts, ideas, and stories about technology and life</p>
    </header>
    
    <div v-if="posts && posts.length > 0" class="posts-grid">
      <article v-for="post in posts" :key="post.id" class="post-card" @click="navigateTo(post.slug)">
        <div class="card-cover">
          <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" />
          <div v-else class="placeholder-illustration" :style="{ background: getRandomGradient(post.id) }">
            <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="75" r="30" fill="rgba(255,255,255,0.3)" />
              <circle cx="100" cy="50" r="40" fill="rgba(255,255,255,0.2)" />
              <circle cx="150" cy="80" r="25" fill="rgba(255,255,255,0.25)" />
              <path d="M20 120 Q60 80 100 120 T180 120" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="none" />
            </svg>
          </div>
        </div>
        <div class="card-content">
          <span class="category-tag">{{ post.category }}</span>
          <h2 class="card-title">{{ post.title }}</h2>
          <p class="card-excerpt">{{ post.excerpt }}</p>
          <div class="card-footer">
            <time class="post-date">{{ formatDate(post.createdAt) }}</time>
            <span class="read-more">Read more →</span>
          </div>
        </div>
      </article>
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="40" width="140" height="120" rx="8" fill="#e0e0e0" />
          <rect x="45" y="60" width="80" height="8" rx="4" fill="#bdbdbd" />
          <rect x="45" y="80" width="110" height="6" rx="3" fill="#e0e0e0" />
          <rect x="45" y="95" width="90" height="6" rx="3" fill="#e0e0e0" />
          <rect x="45" y="110" width="100" height="6" rx="3" fill="#e0e0e0" />
          <circle cx="150" cy="130" r="25" fill="#6c5ce7" opacity="0.8" />
          <path d="M143 130 L150 137 L160 125" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h2>No posts yet</h2>
      <p>Check back soon for new content!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

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

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]

const getRandomGradient = (id: number) => {
  return gradients[id % gradients.length]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateTo = (slug: string) => {
  router.push(`/posts/${slug}`)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.hero {
  text-align: center;
  padding: 6rem 2rem 4rem;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (min-width: 1200px) {
  .posts-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.post-card {
  background: var(--color-card-bg);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.card-cover {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  position: relative;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-card:hover .card-cover img {
  transform: scale(1.05);
}

.placeholder-illustration {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-illustration svg {
  width: 80%;
  height: 80%;
}

.card-content {
  padding: 1.5rem;
}

.category-tag {
  display: inline-block;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-excerpt {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.post-date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.read-more {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  transition: transform 0.2s;
}

.post-card:hover .read-more {
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.empty-illustration {
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .hero {
    padding: 4rem 1rem 3rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .posts-grid {
    padding: 0 1rem;
    gap: 1.5rem;
  }
}
</style>
