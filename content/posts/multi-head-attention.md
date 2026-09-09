---
title: "Multi-Head Attention：为什么需要一个头变多个头？"
slug: "multi-head-attention"
excerpt: "深入理解 Transformer 的核心设计——多头注意力的直觉、原理和必要性"
category: "教程"
tags:
  - 教程
  - Transformer
  - 注意力机制
  - 深度学习
  - 早期文章
published: true
createdAt: "2026-03-24 00:00:00"
updatedAt: "2026-03-24 00:00:00"
postId: 107
---

# Multi-Head Attention：为什么需要一个头变多个头？

## 先回顾：单头 Attention

Self-Attention 让序列中每个位置都能"看到"其他所有位置：

```python
scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
weights = torch.softmax(scores, dim=-1)
output = torch.matmul(weights, V)
```

## 单头的缺陷：信息瓶颈

单头只有一个 attention 权重矩阵。每个位置必须在**一次** softmax 中同时处理语法结构、语义关联、位置关系……

**就像一个人同时听十个人说话，还要求对每个人都做出不同反应。**

### 一个具体例子

> "The animal didn't cross the street because **it** was too tired." → "it" = animal
> "The animal didn't cross the street because **it** was too wide." → "it" = street

两句话语法几乎一样，但 "it" 的指代取决于语义。单头很容易顾此失彼。

## 多头的直觉

把 Q、K、V 分别投影到 h 个子空间，每个子空间独立计算 attention，最后拼接：

```
MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O
```

**类比**：一个审稿人（单头）要同时评判创新性、实验、写作、相关工作的覆盖度。四个审稿人（四头）各管一摊，质量更高。

不同的头学到不同的"关注模式"：
- 头 A → 语法依赖关系
- 头 B → 远距离共指（代词指代）
- 头 C → 固定搭配和习语
- 头 D → 位置信息

## 为什么不直接用更大的单头？

softmax 的特性：$d_k$ 增大时点积方差增大，趋向极端值，梯度消失加重。多头用多个"小头"替代一个"大头"，每个头的维度更小，softmax 更健康。

## 关键洞察

多头 Attention 的本质不是性能技巧，而是**表达力的结构性需求**——让模型在同一层中并行建模多种不同类型的关系。
