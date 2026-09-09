<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <NuxtLink to="/" class="logo">
          <span class="logo-text">Blog</span>
          <span class="admin-badge">Admin</span>
        </NuxtLink>
      </div>
      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="nav-item" exact>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
          </svg>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/admin/posts/new" class="nav-item">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
          </svg>
          <span>New Post</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <NuxtLink to="/" class="nav-item">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
          </svg>
          <span>Back to Site</span>
        </NuxtLink>
        <button @click="logout" class="logout-btn">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
    
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const logout = async () => {
  await $fetch('/api/auth/logout', {
    method: 'POST'
  })
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.sidebar {
  width: 260px;
  background: var(--color-card-bg);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.admin-badge {
  background: linear-gradient(135deg, #6c5ce7 0%, #8a2be2 100%);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  margin: 0.25rem 0.75rem;
  border-radius: 8px;
}

.nav-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: rgba(108, 92, 231, 0.08);
  color: var(--color-primary);
}

.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(138, 43, 226, 0.1) 100%);
  color: var(--color-primary);
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: calc(100% - 1.5rem);
  margin: 0 0.75rem;
  padding: 0.9rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.logout-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(214, 48, 49, 0.08);
  color: #d63031;
}

.content {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }
  
  .content {
    margin-left: 220px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .content {
    margin-left: 0;
  }
}
</style>
