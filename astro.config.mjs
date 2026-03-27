import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [
    starlight({
      title: '金豆的 AI 笔记',
      favicon: '/logo.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      sidebar: [
        { label: 'AI 前沿', items: [
          { label: 'UI-Voyager：从失败中进化的 GUI Agent', slug: 'ai/ui-voyager' },
          { label: 'Bilevel Autoresearch：自我优化的自动研究', slug: 'ai/bilevel-autoresearch' },
        ]},
        { label: '科普教程', items: [
          { label: '注意力机制入门', slug: 'tutorials/attention' },
          { label: 'Chain-of-Thought 思维链', slug: 'tutorials/chain-of-thought' },
        ]},
        { label: '研究笔记', items: [
          { label: '稀疏自编码器与文化引导', slug: 'notes/sae-cultural-steering' },
        ]},
      ],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap' } },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
    mdx(),
  ],
  output: 'static',
});
