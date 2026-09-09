<template>
  <div class="layout">
    <nav class="navbar">
      <div class="container">
        <NuxtLink to="/" class="logo">
          <span class="logo-text">Blog</span>
        </NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink v-if="isLoggedIn" to="/admin" class="nav-link">Admin</NuxtLink>
          <NuxtLink v-else to="/admin/login" class="btn-subscribe">Sign In</NuxtLink>
        </div>
      </div>
    </nav>
    
    <main class="main">
      <slot />
    </main>
    
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p class="copyright">&copy; {{ new Date().getFullYear() }} Blog. All rights reserved.</p>
          <p class="powered-by">Powered by Nuxt</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const isLoggedIn = ref(false)

onMounted(async () => {
  try {
    await $fetch('/api/admin/posts')
    isLoggedIn.value = true
  } catch {
    isLoggedIn.value = false
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.navbar {
  background: var(--color-card-bg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.2s;
}

.nav-link:hover::after {
  width: 100%;
}

.btn-subscribe {
  background: linear-gradient(135deg, #6c5ce7 0%, #8a2be2 100%);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.btn-subscribe:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
}

.main {
  flex: 1;
}

.footer {
  background: var(--color-card-bg);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 2rem 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.powered-by {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
    height: 60px;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.85rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
