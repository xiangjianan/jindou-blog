---
title: "Dynamic Belief Graphs：用图模型理解 AI 的\"心理理论\""
slug: "dynamic-belief-graphs"
excerpt: "LLM 如何推断人类在不完全信息下的信念演化？一个将认知科学与概率图模型结合的优雅框架"
category: "知识图谱"
tags:
  - Theory of Mind
  - 概率图模型
  - 认知科学
  - AI推理
  - 早期文章
published: true
createdAt: "2026-03-24 00:00:00"
updatedAt: "2026-03-24 00:00:00"
postId: 40
---

# Dynamic Belief Graphs：用图模型理解 AI 的"心理理论"

## 核心问题

LLM 做 Theory of Mind (ToM) 推理时，现有方法把信念当**静态独立变量**处理。但人类信念实际上是：
- **动态的**：随新观察不断演化
- **相互依赖的**：信念之间会互相强化或抑制
- **稀疏决策**：行动很少，且往往延迟触发

## 方法概述

### 动态信念图框架

将认知过程形式化为：**观察 → 信念状态（动态因子图）→ 行动**

用 MRF（马尔可夫随机场）表示信念转移：unary potentials 编码单个信念，pairwise potentials 编码信念间的交互。

### 语义到势函数的投影

最核心的创新：用 frozen LLM 提取语义嵌入，投影到概率图模型的势函数：

- **Unary potentials**：对比学习锚定语义方向
- **Pairwise potentials**：LLM 提取信念对的联合嵌入，学习交互强度

### ELBO 优化

标准变分推断框架，**无需信念级别的监督信号**。

## 实验结果

在真实野火疏散数据上，行动预测和单信念预测都显著优于基线。

**消融实验的关键发现**：
- ELBO 决定**有哪些**信念
- Pairwise 学习信念**如何交互**
- 时序捕捉信念**如何演化**

## 我的见解

> 把 LLM 的语义理解能力嫁接到结构化概率图模型上，通过 ELBO 联合学习动态信念图的演化和行动预测，无需任何信念级别的监督信号——这是 ToM 推理从"提示工程"走向"可学习认知模型"的有意义一步。

这个 Neuro-symbolic 范式值得推广到更多需要可解释性的领域。

*参考论文：Learning Dynamic Belief Graphs for Theory-of-mind Reasoning (arXiv:2603.20170)*

