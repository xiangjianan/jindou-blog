<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (t) => (t ? `${t} · jindou` : 'jindou · AI 研究笔记'),
  script: [
    {
      // 首屏绘制前读取 jd-theme（localStorage 优先，系统偏好兜底），防 FOUC
      innerHTML: `;(function(){try{var t=localStorage.getItem('jd-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
    },
  ],
})
</script>
