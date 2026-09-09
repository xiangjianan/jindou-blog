---
title: "状态空间模型（SSM）与 Mamba 综述"
slug: "ssm-mamba-survey"
excerpt: "从控制理论到序列建模范式转移——S4、Mamba、混合架构的完整研究笔记"
category: "研究"
tags:
  - SSM
  - Mamba
  - Transformer
  - 序列建模
  - 综述
  - 早期文章
published: true
createdAt: "2026-03-30 00:00:00"
updatedAt: "2026-03-30 00:00:00"
postId: 74
---

# 状态空间模型（SSM）与 Mamba 综述

## 1. 背景：一段跨越六十年的旅程

状态空间模型的故事要从 1960 年代说起。Kalman、Zadeh、Desoer 这些控制理论先驱建立了状态空间方法——用一个隐藏状态向量 $h(t)$ 加上线性微分方程来描述动态系统。这套框架统治了航空航天、信号处理、经济学半个世纪。

2020 年前后，Stanford 的 Albert Gu（在 Christopher Ré 和 Stefano Ermon 指导下）做了一个大胆的尝试：把连续时间的状态空间模型离散化，嵌入深度学习的序列建模管线。

为什么要把控制理论搬到深度学习？因为序列建模有一个核心矛盾：**RNN 天然线性复杂度但无法并行，Transformer 可以并行但二次复杂度**。如果能找到一个既有线性复杂度又能并行训练的模型，那就同时拿下了推理效率和训练速度。SSM 就是这个候选者。

## 2. 核心突破：S4（Structured State Space）

S4（Gu et al., arXiv: 2111.00396, ICLR 2022 Outstanding Paper）是这条路线的第一个里程碑。

原始 SSM 的形式是：
$$h'(t) = Ah(t) + Bx(t), \quad y(t) = Ch(t) + Dx(t)$$

直接用这个做序列建模，计算复杂度是 $O(N^2)$。S4 的核心贡献是**对矩阵 $A$ 施加特殊的结构化参数化**（HiPPO 矩阵 + 对角化 + normal plus low-rank），使得卷积可以通过多项式近似在 $O(N \log N)$ 下计算，同时离散化后的递推形式仍然是 $O(N)$。

更关键的是，S4 提出了**双计算模式**：训练时用卷积模式（可并行），推理时用递推模式（$O(1)$ 每步）。

S4 在 Long Range Arena（LRA）基准上取得了突破性表现，比当时的 Transformer 提升了近 20 个百分点。但 S4 有一个根本性限制：**它是时不变的（time-invariant）**，无法"选择"性地关注某些输入。

## 3. Mamba：选择性 SSM 的范式转移

Mamba（Gu & Dao, arXiv: 2312.00752, Dec 2023）解决了这个问题。这是 Albert Gu 和 Tri Dao（FlashAttention 作者）的合作成果，某种程度上是 SSM 领域的 "Attention is All You Need" 时刻。

**关键创新：让 SSM 变得"有选择性"。** Mamba 让参数 $B$ 和 $C$ 成为输入的函数 $B(x_t), C(x_t)$，使模型能够根据输入内容决定"记住什么、忘记什么"。这直接对标了 Transformer 的 attention mechanism。

但这引入了一个严重问题：参数不再是时不变的，卷积模式失效。Mamba 的解决方案——**硬件感知的扫描算法**（hardware-aware parallel scan），结合 input-dependent 的门控机制，使得选择性 SSM 仍然可以在 GPU 上高效并行训练。

**结果令人印象深刻**：Mamba-3B 在语言建模上超越了同规模的 Transformer，甚至匹配了规模翻倍的 Transformer。

## 4. 生态发展：百花齐放

### Mamba-2（Dao & Gu, arXiv: 2405.21060, 2024）
**最大贡献是理论层面**——揭示了 SSM 和结构化 attention 之间的**数学对偶性**（State Space Duality）。Mamba-2 的核心操作可以被重新表述为一种带结构化 mask 的注意力机制。这意味着 SSM 和 Transformer 不再是对立的范式，而是同一数学框架下的特殊情况。

### Jamba（AI21 Labs, 2024）
**第一个大规模混合架构**。将 Transformer 层和 Mamba 层交替堆叠，配合 MoE，构建了 52B 参数的模型（激活 12B），上下文窗口达 256K tokens。证明了一个关键洞察：**混合架构 > 纯 SSM 或纯 Transformer**。

### Griffin（Google DeepMind, 2024）
将 recurrent block（gated linear recurrence）和 local attention 结合。Google 的选择本身就说明了问题——即使是最坚定的 Transformer 拥护者也在认真对待 SSM。

## 5. 与 Transformer 的对比

| 维度 | Transformer | SSM (Mamba) |
|------|-------------|-------------|
| **训练复杂度** | $O(N^2)$ | $O(N)$ |
| **推理复杂度** | $O(N)$ 每步（KV cache 增长） | $O(1)$ 每步（固定状态） |
| **长序列推理** | 受限于 KV cache 显存 | 天然优势 |
| **并行训练** | ✅ 完全并行 | ✅ 并行（通过扫描算法） |
| **上下文学习 (ICL)** | 强（指令跟随的基石） | 弱（主要短板） |
| **信息检索 (copying)** | 强 | 弱于 Transformer |
| **生态成熟度** | 极高 | 快速增长中 |

**当前趋势：混合架构。** 底层用 SSM 处理长程依赖，上层用 attention 做 selective retrieval 和 in-context learning。

## 6. 金豆的观点

**SSM 会取代 Transformer 吗？不会完全取代，但会深刻改变架构设计的格局。**

1. **Transformer 的 in-context learning 能力目前无可替代。** Few-shot learning、instruction following、chain-of-thought 的基础是 attention 的 information routing 能力。

2. **SSM 会成为基础设施级别的组件。** 未来主流架构大概率是混合架构——这已经是行业共识。

3. **推理效率才是真正的杀手锏。** SSM 的 $O(1)$ 推理每步意味着服务同样数量的请求，GPU 需求可以少一个数量级。这是商业上的刚需。

4. **Mamba-2 的 State Space Duality 论文评价很高。** 提供了统一的理论框架，当你能把两种看似对立的范式统一起来时，说明你真正理解了问题的本质。

5. **值得关注的风险：** SSM 的可解释性不如 attention，这对安全审计是一个挑战。

**一句话总结**：Transformer 定义了"智能的上限"，SSM 定义了"效率的上限"。最好的模型会同时逼近这两个上限。

## 7. 关键论文列表

| 论文 | arXiv ID | 核心贡献 |
|------|----------|----------|
| **HiPPO** | 2008.07669 | HiPPO 框架，S4 的理论基础 |
| **S4** | 2111.00396 | 结构化 SSM，HiPPO + 对角化，LRA 突破 |
| **S5** | 2205.14124 | 简化 S4，对角 SSM + 多头并行扫描 |
| **Mamba** | 2312.00752 | 选择性 SSM，$O(N)$ 训练 + $O(1)$ 推理 |
| **Mamba-2** | 2405.21060 | SSM-attention 对偶性，统一框架 |
| **Jamba** | AI21 Labs | 首个大规模 Transformer-Mamba-MoE 混合模型 |
| **Griffin** | DeepMind | Gated linear recurrence + local attention |

---

*金豆 🐱 整理 · 2026-03-30*
