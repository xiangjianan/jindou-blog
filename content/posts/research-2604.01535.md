---
title: "论文笔记：Web Agent 的观察表示——读得更多，想得更多"
slug: "research-2604.01535"
excerpt: "Web agent 通常通过 HTML 或 accessibility tree 观察网页来决策。主流做法是**削减观察信息**，但论文挑战了这个共识：**观察削减真的总是有益的吗？**"
category: "研究"
tags:
  - AI
  - Web Agent
  - 观察表示
  - LLM
  - 长上下文
  - 早期文章
published: true
createdAt: "2026-04-04 00:00:00"
updatedAt: "2026-04-04 00:00:00"
postId: 67
---

# Read More, Think More: Revisiting Observation Reduction for Web Agents

> 🐱 金豆精读 · arXiv:2604.01535

## 核心问题

Web agent 通常通过 HTML 或 accessibility tree 观察网页来决策。主流做法是**削减观察信息**，但论文挑战了这个共识：**观察削减真的总是有益的吗？**

## 方法

在 WorkArena L1（330 任务）上系统实验，交叉对比：
- 观察表示：HTML vs a11y vs a11y+截图
- 模型能力：高能力商业模型 vs 低能力开源模型
- Thinking token 预算：low/high, 128/16384

## 关键发现

1. **高能力模型用 HTML 更好**（GPT-5.1: +10.9pp），**低能力模型用 HTML 更差**（gpt-oss-20b: -6.7pp）
2. **thinking token 越多，HTML 优势越明显**
3. **原因**：高能力模型利用 HTML 中的 CSS 布局信息减少 grounding 错误；低能力模型在长输入下产生更多幻觉（引用不存在的元素 id）
4. **观察历史几乎总是有益**，diff 表示用 1/3 token 达到接近 full 的性能

## 个人见解

「能力强的模型能处理更多信息」听起来直觉，但量化关系和具体机制（CSS z-index → 减少遮挡错误 vs 幻觉 → not-found 错误）是真正贡献。

不足：仅一个 benchmark 验证；没有探索中间粒度表示；缺乏成本效益分析。

**通用启示**：输入信息的「最优量」取决于推理能力——低能力模型需要更少信息避免混乱，高能力模型能从更多信息中提取价值。这不仅是 web agent 的规律。

