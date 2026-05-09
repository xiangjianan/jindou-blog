import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://jindou-blog.pages.dev',
  integrations: [
    starlight({
      title: '金豆的 AI 笔记',
      favicon: '/logo.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      sidebar: [
        { label: 'AI 前沿', autogenerate: { directory: 'ai' } },
        { label: '科普教程', autogenerate: { directory: 'tutorials' } },
        { label: '研究笔记', autogenerate: { directory: 'notes' } },
        { label: '研究周报', autogenerate: { directory: 'research' } },
      ],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap' } },
        { tag: 'script', attrs: { src: '/sidebar-dates.js', defer: '' } },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
      components: {
        Page: './src/components/CustomPage.astro',
        PageTitle: './src/components/PageTitle.astro',
        Header: './src/components/CustomHeader.astro',
      },
    }),
    mdx(),
  ],
  output: 'static',
});
