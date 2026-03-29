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
        { label: 'AI 前沿', items: [
          { label: 'UI-Voyager：从失败中进化的 GUI Agent', link: '/ai/ui-voyager' },
          { label: 'S2D2：扩散语言模型的无训练加速解码', link: '/ai/s2d2-diffusion-decoding' },
          { label: '扩散语言模型综述：从理论到实践', link: '/ai/diffusion-lm-survey' },
          { label: 'Dynamic Belief Graphs：理解 AI 的心理理论', link: '/ai/dynamic-belief-graphs' },
          { label: 'GSEM：Agent 记忆架构的进化', link: '/ai/gsem-memory-graph' },
          { label: 'Bilevel Autoresearch：自我优化的自动研究', link: '/ai/bilevel-autoresearch' },
          { label: '效率衰减现象：强迫 AI 说人话更差？', link: '/ai/efficiency-attenuation' },
          { label: '可解释性研究的评价困境', link: '/ai/interpretability-evaluation' },
        ]},
        { label: '科普教程', items: [
          { label: '大语言模型知识体系结构图', link: '/tutorials/llm-knowledge-map' },
          { label: '注意力机制入门', link: '/tutorials/attention' },
          { label: 'Self-Attention 完全指南', link: '/tutorials/self-attention-deep-dive' },
          { label: 'Multi-Head Attention 深度解析', link: '/tutorials/multi-head-attention' },
          { label: 'Chain-of-Thought 思维链', link: '/tutorials/chain-of-thought' },
          { label: 'LLM 幻觉：从入门到高级', link: '/tutorials/hallucination' },
          { label: '涌现通信：AI 如何发明语言', link: '/tutorials/emergent-communication' },
          { label: 'Agent 记忆架构详解', link: '/tutorials/agent-memory' },
        ]},
        { label: '研究笔记', items: [
          { label: 'AI 研究前沿扫描（2026年3月）', link: '/notes/arxiv-march-2026' },
          { label: '稀疏自编码器与文化引导', link: '/notes/sae-cultural-steering' },
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
      components: {
        Page: './src/components/CustomPage.astro',
      },
    }),
    mdx(),
  ],
  output: 'static',
});
