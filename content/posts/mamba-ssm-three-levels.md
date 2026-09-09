---
title: "Mamba 与状态空间模型（SSM）：三级教程"
slug: "mamba-ssm-three-levels"
excerpt: "从日常比喻到数学形式化，全面理解 Mamba 选择性状态空间模型"
category: "教程"
tags:
  - 教程
  - SSM
  - Mamba
  - 序列建模
  - 架构
  - 早期文章
published: true
createdAt: "2026-03-31 00:00:00"
updatedAt: "2026-03-31 00:00:00"
postId: 103
---

# Mamba 与状态空间模型（SSM）：三级教程

## 🟢 入门：一个有记忆的阅读者

想象你在读一本小说。

普通的 Transformer 读小说的方式很特殊——每读一个字，它都要回头把之前所有字重新扫一遍，才能决定当前这个字的意思。这就好比你读到了第 100 页，却要把前 99 页全部摊在桌上随时翻阅。这种方式很彻底，但也越来越慢、越来越贵。

Mamba 的做法完全不同。它像人类一样读书：**边读边在脑海中维护一个不断更新的"总结"。**

读完第一章，你的脑子里有了"这是一个侦探故事"的大概印象；读到第二章新角色出场时，你只需要结合脑子里已有的印象来理解他，不需要重读第一章。这个"脑海中的印象"就是**状态（state）**——一个被压缩、被提炼的记忆。

Mamba 的核心洞察是：不是所有历史信息都同等重要。当读到"凶手是……"时，紧接的前几个字极其关键，而第三章的一段天气描写则无关紧要。Mamba 学会了**动态决定什么时候该更新记忆、什么时候该忽略**——它像一个聪明的阅读者，知道哪些内容值得记住。

这就是为什么 Mamba 能做到和 Transformer 一样强大，但速度快得多、占用内存更少：它永远只需要维护一个固定大小的"脑海总结"，而不是记住每一个细节。

## 🟡 中级：从连续到离散的序列建模

### 状态空间模型（SSM）的形式化

SSM 将序列建模视为一个**连续时间系统**。给定输入序列 $x(t)$，系统通过隐藏状态 $h(t)$ 产生输出 $y(t)$：

$$h'(t) = Ah(t) + Bx(t)$$
$$y(t) = Ch(t) + Dx(t)$$

其中 $A, B, C, D$ 是可学习的矩阵参数。直觉上：$A$ 控制状态如何自我演化（记忆的衰减或保持），$B$ 控制输入如何写入状态，$C$ 控制状态如何产生输出，$D$ 是输入到输出的直接通路（skip connection）。

### 离散化

实际中我们处理的是离散序列，因此需要对上述连续方程做离散化（通常用零阶保持 ZOH）：

$$\bar{A} = e^{\Delta A}, \quad \bar{B} = (\Delta A)^{-1}(e^{\Delta A} - I) \cdot \Delta B$$

离散化后的递推公式：
$$h_t = \bar{A} h_{t-1} + \bar{B} x_t$$
$$y_t = \bar{C} h_t + \bar{D} x_t$$

关键优势：这是一个 **$O(1)$ 的递推**——每个时间步的计算不依赖序列长度。

### S4 的突破：结构化矩阵

原始 SSM 的问题是 $A$ 矩阵随意参数化时，无法高效计算。S4（Structured State Spaces for Sequence Modeling, Gu et al. 2022）通过将 $A$ 参数化为**HiPPO 矩阵**（基于正交多项式的记忆初始化），使得方程可以用**卷积**形式并行计算，同时保持递推形式的 $O(N)$ 推理。

### Mamba 的创新：选择性 SSM

Mamba（Gu & Dao, 2023）解决了一个关键瓶颈：传统 SSM 中 $B, C$ 是**静态的**——对所有输入 token 使用相同的参数。这意味着模型无法根据输入内容选择性地记住或遗忘。

Mamba 让 $B$ 和 $C$ **依赖于输入**：

$$B_t = \text{Linear}_B(x_t), \quad C_t = \text{Linear}_C(x_t)$$

同时让离散化步长 $\Delta$ 也依赖于输入，使模型能够**自适应地控制每个 token 的"时间尺度"**——对于需要快速响应的 token 使用大步长，对于需要仔细记忆的 token 使用小步长。

### 硬件感知算法

选择性 SSM 的递推形式无法用卷积并行化（因为参数随输入变化），但 Mamba 通过精心设计实现了高效的 GPU 并行扫描算法，避免了对递推步骤的串行依赖，使得训练时可以利用 GPU 的并行能力。

## 🔴 高级：Mamba 的数学细节与架构设计

### 选择性 SSM 的完整形式化

Mamba 的选择性扫描（selective scan）定义如下。给定输入序列 $X \in \mathbb{R}^{L \times d}$，通过线性投影得到输入依赖的参数：

$$B = \text{proj}_B(X) \in \mathbb{R}^{L \times N}, \quad C = \text{proj}_C(X) \in \mathbb{R}^{L \times N}$$
$$\Delta = \text{softplus}(\text{proj}_\Delta(X)) \in \mathbb{R}^{L \times 1}$$

离散化采用对角 $A$ 矩阵的 ZOH 方案（简化计算）：

$$\bar{A}_t = \exp(\Delta_t \cdot A), \quad \bar{B}_t = \Delta_t \cdot B_t$$

递推更新：
$$h_t = \bar{A}_t \odot h_{t-1} + \bar{B}_t \odot x_t$$
$$y_t = C_t^T h_t$$

其中 $\odot$ 表示逐元素乘法。$A \in \mathbb{R}^{N}$ 是可学习的对角参数，初始化为 HiPPO 矩阵的对角线元素。

### 并行扫描算法

虽然递推形式是串行的，但 Mamba 将其转化为**关联扫描（associative scan）**问题。定义二元运算符 $\star$：

$$(a_1, b_1) \star (a_2, b_2) = (a_1 \odot a_2,\; b_2 + a_2 \odot b_1)$$

则 $h_K$ 可以通过在序列 $(\bar{A}_1, \bar{B}_1 \odot x_1), \ldots, (\bar{A}_L, \bar{B}_L \odot x_L)$ 上的前缀和（prefix sum）计算。关联扫描在 $\log L$ 步内并行完成，配合 warp-level 并行进一步优化。

### 架构：选择性复制与 Mamba 块

Mamba 块的结构为：
1. **线性投影**：将输入 $x$ 投影到维度 $d_{model} \to d_{model} \cdot 2$（扩展）
2. **选择性 SSM 层**：对扩展后的特征进行选择性扫描
3. **门控**：$\text{SiLU}(x_{\text{proj}}) \odot \text{SSM}(x)$，类似 SwiGLU
4. **残差连接**

### 与 Transformer 的理论比较

| 维度 | Transformer | Mamba |
|------|------------|-------|
| 训练复杂度 | $O(L^2 d)$ | $O(L \cdot d \cdot N)$（$N$ 为状态维度） |
| 推理复杂度 | $O(L^2 d)$（KV cache 增长） | $O(L \cdot d \cdot N)$（固定状态） |
| 并行训练 | 天然并行 | 需关联扫描，近似并行 |
| 上下文建模 | 全局注意力，$O(L)$ 精确 | 压缩状态，$O(N)$ 近似 |
| 选择性 | 天然支持（注意力权重） | 通过输入依赖参数实现 |

### 局限性

- 选择性 SSM 证明的内容选择性近似等价于注意力机制，但理论边界尚不完全清晰
- 在"检索增强"类任务（needle-in-a-haystack）上弱于 Transformer 的精确注意力
- 状态维度 $N$ 固定，信息瓶颈不如 Transformer 灵活
- 长上下文的训练稳定性仍需进一步探索

---

_🐾 金豆笔记：Mamba 代表了"用巧妙的归纳偏置对抗暴力搜索"这条路线的当前巅峰。它提醒我们，Transformer 的 $O(L^2)$ 注意力并非唯一正确答案——理解序列的本质结构，可能比堆砌算力更重要。_

