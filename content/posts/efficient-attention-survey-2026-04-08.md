---
title: "高效注意力机制研究综述（2024-2026）"
slug: "efficient-attention-survey-2026-04-08"
excerpt: "从 Flash Attention 到稀疏注意力、线性注意力和 SSM 替代架构，梳理四大技术路线的演进与趋势"
category: "研究"
tags:
  - 研究
  - 综述
  - 注意力机制
  - Flash Attention
  - Mamba
  - SSM
  - 早期文章
published: true
createdAt: "2026-04-08 00:00:00"
updatedAt: "2026-04-08 00:00:00"
postId: 60
---

# 高效注意力机制（Efficient Attention）研究综述

> 整理日期：2026-04-08 | 背景：精读 Focus 论文后的方向梳理

## 一、问题定义

标准 Self-Attention 的时间与空间复杂度均为 $O(N^2d)$，其中 $N$ 为序列长度、$d$ 为维度。当 $N$ 增长（长文档、高分辨率图像、视频理解）时，计算与显存开销成为核心瓶颈。高效注意力旨在降低这一复杂度，同时尽量保持模型表达能力。

## 二、四大技术路线

### 2.1 IO 感知优化：Flash Attention 系列

**核心思想：** 不改变 Attention 的数学定义，而是通过优化 GPU 内存层次（HBM ↔ SRAM）的访存模式，实现实际 2-4× 的 wall-clock 加速。

| 工作 | 时间 | 关键创新 |
|------|------|----------|
| Flash Attention (Tri Dao et al.) | 2022 | Tiling + online softmax，无需 materialize $N \times N$ 矩阵 |
| Flash Attention 2 | 2023 | 更好的 work partitioning，适配 A100/H100，达到理论 FLOPs 利用率 |
| Flash Attention 3 | 2024 | 利用 Hopper 架构的 TMA（Tensor Memory Accelerator）和异步 pipeline |

**评价：** 这不是算法层面的复杂度降低，而是系统工程层面的极致优化。它证明了 $O(N^2)$ 的精确 Attention 在实际中可以跑得很快。已成为所有 Transformer 训练的基础设施。

**局限：** 无法突破 $N^2$ 内存上界，超长序列（$N > 128K$）仍需配合序列并行或稀疏化。

### 2.2 稀疏注意力模式（Sparse Attention）

**核心思想：** 仅计算部分 query-key 对的注意力，将复杂度降至 $O(N \cdot k)$，其中 $k$ 为每个 query 的 top-k 注意力头数。

**两大子路线：**

**(a) 固定模式（Fixed Pattern）**
- **Longformer (Beltagy et al., 2020):** 局部窗口 + 少量全局 token
- **BigBird (Zaheer et al., 2020):** 随机 + 窗口 + 全局，证明 Turing 完备
- **Sparse Transformer (Child et al., 2019):** strided pattern（早期工作）

优点：硬件友好、推理可预测。缺点：模式固定，无法适配不同输入。

**(b) 学习型路由（Learned Routing）**
- **Routing Transformer (Roy et al., 2020):** k-means 聚类 token，block 内做 attention
- **Reformer (Kitaev et al., 2020):** LSH-based 路由
- ****Focus (2024)**:** Centroid routing — 先计算 key 的聚类中心，每个 query 只 attend 到最近的 centroid 对应的 key subset。核心优势：路由开销小（$O(Nk)$），质量接近 full attention
- **Quest (Shen et al., 2024):** 利用 query-key 相似度的在线 top-k 选择

**评价：** Focus 论文代表了 learned routing 的最新水平——centroid 方法比 LSH 更稳定，比 token-level routing 更高效。稀疏注意力的核心权衡始终是 **sparsity vs quality**：更高的稀疏度意味着更快的速度，但可能损失重要信息。

### 2.3 线性注意力 / 核方法

**核心思想：** 利用核分解 $Attention(Q,K,V) = \phi(Q)(\phi(K)^T V)$，将 $O(N^2d)$ 降至 $O(Nd^2)$。当 $N \gg d$ 时显著加速。

| 工作 | 核函数 $\phi$ | 特点 |
|------|--------------|------|
| Performer (Choromanski et al., 2021) | Random Feature (FAVOR+) | 无偏估计，但需要较大的特征维度 |
| Linear Transformer (Katharopoulos et al., 2020) | $\phi(x) = elu(x) + 1$ | 简单但近似质量有限 |
| Fastformer (Wu et al., 2021) | additive attention | 在线性复杂度下加 query interaction |
| RWKV (Peng et al., 2023-2025) | 数据依赖的线性 RNN | 训练可并行，推理 $O(1)$ |

**评价：** 线性注意力在理论上优雅，但实践中近似误差在深层网络中会累积，导致长距离依赖建模能力弱于标准 Attention。最新趋势是与标准 Attention 混合使用。

### 2.4 替代架构：Mamba/SSM 与线性 RNN

**核心思想：** 完全绕开 Attention，用状态空间模型（SSM）或线性 RNN 建模序列。

| 工作 | 时间 | 关键创新 |
|------|------|----------|
| Mamba (Gu & Dao, 2023) | 2023 | 选择性 SSM，输入依赖的参数化 |
| Mamba-2 (Dao & Gu, 2024) | 2024 | 结构化 SSM = 线性 Attention 的特例， unify 了 SSM 与 Attention |
| RWKV-6 (2024) | 2024 | Data-dependent recurrence + linear attention 混合 |
| Griffin (De et al., 2024) | 2024 | Gated linear recurrence + local attention 混合 |
| JetMamba (2024) | 2024 | 针对 jet finding 等物理任务的 Mamba 变体 |
| Mamba-3 / BlackMamba | 2025 | MoE + Mamba 架构融合，混合专家 |

**关键发现：** Mamba-2 证明了 SSM 可以看作线性 Attention 的特例（对角 + 低秩结构）。这为理解 Attention 与 RNN 的关系提供了统一视角。

**实践趋势（2025-2026）：**
- **混合架构成为主流：** Jamba（Mamba + Transformer layers 交替）、Griffin（linear RNN + local attention）
- **纯 Mamba 在语言建模上追赶 Transformer 但尚未超越**
- **SSM 在长上下文（100K+ tokens）推理场景有明显优势**

## 三、综合对比

| 路线 | 复杂度 | 表达能力 | 硬件友好 | 长序列优势 | 代表工作 |
|------|--------|---------|---------|-----------|---------|
| IO 感知优化 | $O(N^2d)$ | ★★★★★ | ★★★★★ | ★★ | Flash Attention 3 |
| 固定稀疏 | $O(Nk)$ | ★★★☆☆ | ★★★★☆ | ★★★★ | Longformer, BigBird |
| 学习路由 | $O(Nk)$ | ★★★★☆ | ★★★☆☆ | ★★★★ | Focus, Quest |
| 线性注意力 | $O(Nd^2)$ | ★★★☆☆ | ★★★☆☆ | ★★★☆ | Performer |
| SSM/线性 RNN | $O(Nd)$ | ★★★★☆ | ★★★★☆ | ★★★★★ | Mamba-2, RWKV-6 |

## 四、趋势判断

1. **Flash Attention 是基线，不是终点。** 它解决了「如何高效计算精确 Attention」的问题，但 $N^2$ 上界仍在。未来长序列任务必须结合稀疏化或替代架构。

2. **学习型稀疏注意力（如 Focus）是最有前景的 Attention 优化方向。** 相比固定模式和线性近似，learned routing 在保持 $O(Nk)$ 复杂度的同时最大程度保留了表达能力。关键挑战在于路由的计算开销——Focus 的 centroid 方法是目前较好的解决方案。

3. **混合架构是中期赢家。** 纯 SSM 尚未全面超越 Transformer，纯稀疏 Attention 有质量损失，但混合使用（local attention + global sparse + SSM layers）在各 benchmark 上表现稳健。Jamba、Griffin 等架构已验证这一路线。

4. **统一视角正在形成。** Mamba-2 揭示了 SSM 与线性 Attention 的深层联系，Flash Attention 3 利用硬件特性逼近理论极限。未来可能出现更深层的理论统一——Attention、SSM、RNN 或许只是同一数学对象的不同参数化。

5. **对于 Focus 论文的定位：** Centroid routing 稀疏注意力属于「学习型稀疏注意力」路线，其贡献在于用简单的聚类方法实现了高质量的路由。在混合架构的背景下，它适合作为 Transformer block 中的全局注意力替代模块，配合 local attention 使用效果更佳。

---

*注：本综述基于截至 2026 年初的公开文献，部分 2025-2026 年工作细节可能需进一步核实。*

