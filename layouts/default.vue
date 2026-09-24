<template>
  <div class="layout">
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="wordmark">jindou<span class="wordmark-cursor">_</span></NuxtLink>

        <nav class="header-nav">
          <NuxtLink to="/" class="nav-link">文章</NuxtLink>
          <a
            href="https://github.com/xiangjianan"
            target="_blank"
            rel="noopener"
            class="nav-link"
          >GitHub ↗</a>
          <button
            type="button"
            class="theme-toggle"
            aria-label="切换深色模式"
            @click="toggleTheme"
          >
            <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </nav>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <p class="footer-note">&copy; {{ year }} 金豆 · 把前沿 AI 讲到真正理解</p>
        <p class="footer-domain">aiblog.helloxjn.com</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

const toggleTheme = () => {
  const el = document.documentElement
  const dark = !el.classList.contains('dark')
  el.classList.toggle('dark', dark)
  try {
    localStorage.setItem('jd-theme', dark ? 'dark' : 'light')
  } catch {
    /* localStorage 不可用时静默降级为会话内切换 */
  }
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-header-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wordmark {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.wordmark-cursor {
  color: var(--color-primary);
  animation: blink 1.4s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}

.theme-toggle {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.theme-toggle:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

/* 两个图标都渲染，纯 CSS 控制显隐，避免 hydration 闪烁 */
.icon-sun {
  display: none;
}

html.dark .icon-sun {
  display: block;
}

html.dark .icon-moon {
  display: none;
}

.main {
  flex: 1;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  padding: 32px 0;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-note {
  font-size: 13px;
  color: var(--color-text-muted);
}

.footer-domain {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
