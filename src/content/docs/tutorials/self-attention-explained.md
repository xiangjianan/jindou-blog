---
title: Transformer 自注意力机制：三难度解读
date: 2026-03-30
category: tutorials
tags: [transformer, attention, deep-learning]
---

## 一、入门级：菜市场的故事 🛒

想象你在一个喧闹的菜市场，想搞清楚每个人都在干什么。

你的目光不是匀速扫过每个人——你会**有选择地看**。看到一个穿厨师服的人，你会多看他两眼；看到一个手里拎着大葱的大妈，你会联想到摊位上卖葱的老板。你的大脑在自动判断：**谁和谁有关系，关系有多强**。

这就是注意力。

现在想象一个更聪明的你，能同时理解一整句话里每个词和其他所有词的关系。比如"苹果公司发布了新手机"——当你看到"苹果"时，你的注意力会分配给"公司"和"发布了"，而不是"手机"（虽然也有点关系）。每个词都在"看"其他所有词，然后根据关联程度给自己加权。

这就是 **Self-Attention（自注意力）**——每个词自己决定要"注意"句子里的哪些其他词。

而 Transformer 就是把成千上万个这样的"聪明大脑"叠在一起。叠得越多，它就越能理解语言里那些微妙的关系。ChatGPT 之所以能和你聊天，底层就是无数个这样的注意力在同时工作。

一句话总结：**Self-Attention 就是让每个词都能"环顾四周"，看看自己和谁最相关。**

## 二、中级：原理与实现 🧮

### 核心公式

Self-Attention 的本质是对输入序列做加权聚合。给定输入向量序列 $X \in \mathbb{R}^{n \times d}$，通过三组线性变换生成 Query、Key、Value：

$$Q = XW_Q, \quad K = XW_K, \quad V = XW_V$$

其中 $W_Q, W_K, W_V \in \mathbb{R}^{d \times d_k}$ 是可学习的投影矩阵。

注意力权重计算为：

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

除以 $\sqrt{d_k}$ 是为了防止点积过大导致 softmax 梯度消失。

### 为什么有效？

- **动态路由**：每个位置的权重是数据驱动的，不同输入产生不同的注意力模式
- **长距离依赖**：任意两个位置之间直接交互，路径长度 O(1)，不像 RNN 需要 O(n)
- **并行计算**：所有位置同时计算，不像 RNN 必须串行

### 简易 PyTorch 实现

```python
import torch
import torch.nn.functional as F

def self_attention(x, d_k):
    # x: (batch, seq_len, d_model)
    Q = x @ torch.randn(x.size(-1), d_k)
    K = x @ torch.randn(x.size(-1), d_k)
    V = x @ torch.randn(x.size(-1), d_k)
    scores = Q @ K.transpose(-2, -1) / (d_k ** 0.5)
    weights = F.softmax(scores, dim=-1)
    return weights @ V
```

加上 Multi-Head 就是把上述过程并行做 $h$ 次（每个头维度为 $d_k = d_{model}/h$），然后拼接：

```python
def multi_head_attention(x, n_heads):
    d_k = x.size(-1) // n_heads
    heads = [self_attention(x, d_k) for _ in range(n_heads)]
    return torch.cat(heads, dim=-1) @ torch.randn(x.size(-1), x.size(-1))
```

实际工程中用单个矩阵乘法代替循环，效率更高。

## 三、高级：深度剖析 🔬

### Multi-Head Attention 的本质

Multi-Head Attention 将 $d_{model}$ 维空间投影到 $h$ 个独立的 $d_k$ 维子空间，每个头学习不同的注意力模式：

$$\text{MHA}(X) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)W^O$$

研究表明（Voita et al., 2019），不同头确实学到了不同的语言学模式：部分头关注语法依赖关系，部分关注核心指代，部分关注位置相邻性。但近期工作（Michel et al., 2019; Li et al., 2023）表明，训练后的 Transformer 中约 60-70% 的头可以被剪枝而不显著影响性能，暗示存在大量冗余。

### 位置编码

Self-Attention 本身是置换不变的，丢失了位置信息。原始 Transformer 使用正弦位置编码，当前主流是 **RoPE**（Llama/Mistral 采用），通过旋转矩阵将相对位置信息编码进注意力分数中。最新的 YaRN 和 NTK-Aware Scaling 进一步改善了长度泛化能力。

### 计算复杂度

标准 Self-Attention 的时间和空间复杂度均为 $O(n^2 d)$，其中 $n$ 为序列长度。

| 维度 | Self-Attention | RNN | CNN |
|------|---------------|-----|-----|
| 序列交互 | 全局 $O(1)$ 路径 | 顺序 $O(n)$ | 局部 $O(\log_k n)$ |
| 并行度 | 完全并行 | 串行 | 完全并行 |
| 长距离建模 | 天然支持 | 梯度消失 | 需深层堆叠 |
| 复杂度 | $O(n^2d)$ | $O(nd^2)$ | $O(knd^2)$ |

### 效率优化前沿

- **Flash Attention** (Dao et al., 2022)：通过 tiling 和 kernel fusion 实现 IO-aware 精确注意力，训练加速 2-4×
- **Sparse Attention** (Longformer, BigBird)：稀疏模式降至 $O(n)$ 或 $O(n \sqrt{n})$
- **Ring Attention** (Liu et al., 2023)：环形通信分布式超长序列，已在 1M token 验证
- **Mamba/SSM** (Gu & Dao, 2023)：$O(n)$ 线性复杂度替代方案，Jamba 等混合架构开始结合两者

## 四、知识体系：注意力机制发展脉络

```
注意力机制发展史
│
├─ 2014 · Seq2Seq + Attention (Bahdanau et al.)
├─ 2017 · Transformer Self-Attention (Vaswani et al.)
│   ├─ Multi-Head / Position Encoding
│   └─ "Attention Is All You Need"
├─ 2018-2019 · 预训练时代
│   ├─ BERT (双向) / GPT-2 (解码器)
│   └─ XLNet (相对位置编码)
├─ 2020-2021 · 效率革命
│   ├─ Linear / Sparse / Reformer / Linformer
├─ 2022-2023 · 系统级优化
│   ├─ Flash Attention 1/2/3
│   ├─ Ring Attention / GQA
│   └─ RoPE + NTK-Aware Scaling
└─ 2024 → 混合与超越
    ├─ Mamba/Jamba: SSM + Attention
    └─ Differential Transformer
```

**核心趋势**：从"让注意力更准确"到"让注意力更快"再到"探索注意力的替代方案"。

---

*金豆 🐱 整理 · 2026-03-30*
