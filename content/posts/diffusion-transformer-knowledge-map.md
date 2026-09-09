---
title: "Diffusion Transformer（DiT）知识体系结构图"
slug: "diffusion-transformer-knowledge-map"
excerpt: "从 U-Net 到 Transformer：扩散模型骨干架构的范式转换，涵盖 DiT 核心思想、关键论文脉络、变体分支与训练范式演进。"
category: "知识图谱"
tags:
  - 早期文章
published: true
createdAt: "2026-04-11 00:00:00"
updatedAt: "2026-04-11 00:00:00"
postId: 39
---

# Diffusion Transformer（DiT）知识体系结构图

> 创建日期：2026-04-11
> 定位：知识脉络梳理，非入门级解释

---

## 一、整体知识树

```
扩散生成模型 (Diffusion Models)
│
├── 传统骨干：U-Net（DDPM, LDM, Stable Diffusion 1.x/2.x）
│
└── 新一代骨干：DiT（Diffusion Transformer）
    │
    ├── 核心思想：用 Transformer 替换 U-Net 作为去噪骨干
    │
    ├── 架构要点
    │   ├── Patchify：将噪声潜变量切分为 patch token
    │   ├── 条件注入：adaLN-Zero（自适应 LayerNorm + 零初始化）
    │   ├── Scalability：模型规模（S/B/L/XL）+ 采样步数可预测地提升质量
    │   └── 位置编码：learned positional embedding
    │
    ├── 关键论文与里程碑
    │   ├── Peebles & Xie (2023) —— DiT 原始论文
    │   ├── Sora (OpenAI, 2024) —— 视频生成的 DiT 变体（Spacetime Patch）
    │   ├── Stable Diffusion 3 (2024) —— MMDiT（多模态 DiT）
    │   ├── FLUX (Black Forest Labs, 2024) —— 流匹配 + DiT
    │   ├── PixArt-Σ / Π —— 高分辨率图像 DiT
    │   └── HunyuanVideo, CogVideoX —— 视频 DiT 代表
    │
    ├── 变体分支
    │   ├── 图像生成：DiT-XL/2, SD3, FLUX, PixArt
    │   ├── 视频生成：Sora, Open-Sora, CogVideoX, HunyuanVideo, MovieGen
    │   ├── 3D 生成：Point-E → 当代 3D DiT 方法
    │   └── 统一架构：Emu3 (自回归+扩散统一)
    │
    └── 训练范式
        ├── 标准扩散训练（ε-prediction / v-prediction）
        ├── Flow Matching（流匹配，FLUX/SD3 采用）
        ├── Rectified Flow
        └── 连续时间一致性
```

---

## 二、核心思想：为什么用 Transformer 替换 U-Net？

| 维度 | U-Net（传统） | DiT（新一代） |
|------|--------------|--------------|
| 架构 | 卷积 + 跳跃连接 | 纯 Transformer |
| 归纳偏置 | 强（局部性、平移等变性） | 弱（通用序列建模） |
| 可扩展性 | 受限，规模增大收益递减 | 近似幂律，规模越大越好 |
| 条件注入 | 交叉注意力 / Adaptive Conv | adaLN-Zero |
| 代表作 | SD 1.5/2.1, DALL-E 2 | Sora, SD3, FLUX |

**关键洞察**：U-Net 的卷积归纳偏置在低数据量时有益，但数据量足够大时反而限制了模型上限。Transformer 的通用性使其在大规模下展现出更优的 scaling behavior。

---

## 三、架构要点详解

### 3.1 Patchify

- 输入：噪声潜变量 z ∈ ℝ^(H×W×C)
- 操作：将 z 切分为 p×p 的 patch，每个 patch 线性投影为一个 token
- 结果：序列长度 N = (H/p) × (W/p)，p 常取 2
- 本质：与 ViT 完全相同的策略，将 2D 特征图转为 1D token 序列

### 3.2 条件注入：adaLN-Zero

- **adaLN（自适应 LayerNorm）**：将条件信息（时间步 $t$、类别/文本 embedding）通过 MLP 映射为 scale (γ) 和 shift (β) 参数，调制 LayerNorm
- **Zero 初始化**：每个 DiT block 中条件调制的输出层初始化为零 → 训练初期该 block 等价于恒等映射
- **效果**：比交叉注意力更高效，条件信号直接作用于每一层的主路径

### 3.3 模型规模与 Scalability

DiT 定义了四个规模等级：

| 变体 | 参数量 | patch 大小 | GFLOPs |
|------|--------|-----------|--------|
| DiT-S/2 | 33M | 2×2 | ~4.6 |
| DiT-B/2 | 130M | 2×2 | ~16.9 |
| DiT-L/2 | 458M | 2×2 | ~59.5 |
| DiT-XL/2 | 675M | 2×2 | ~85.4 |

**核心发现**：FID 与总计算量（GFLOPs）呈可预测的幂律关系，规模越大、采样步数越多 → 质量越好。

### 3.4 输出头

- **最终处理**：token 序列 → 反 patchify（reshape 回 2D）→ 线性层预测噪声 / 速度场
- 无 U-Net 的解码器结构，更简洁

---

## 四、关键论文脉络

### 4.1 DiT（Peebles & Xie, 2023）

- 论文：*Scalable Diffusion Models with Transformers*
- 贡献：首次系统证明 Transformer 可作为扩散模型骨干，且 scaling 性能优于 U-Net
- 关键实验：ImageNet 类条件生成，DiT-XL/2 达到 SOTA FID

### 4.2 Sora（OpenAI, 2024）

- 技术：Spacetime Patch Tokenization（时空 patch），3D 变分自编码器压缩视频
- 意义：将 DiT 从图像扩展到视频，证明了统一的 patch 化策略可处理任意分辨率/时长
- 影响：引爆了视频生成领域的 DiT 潮流

### 4.3 Stable Diffusion 3 / MMDiT（2024）

- 技术：**M**ulti-**M**odal **DiT** — 文本和图像 token 在同一 Transformer 中联合处理
- 创新：双流架构（文本流 + 图像流）共享权重，比简单拼接更高效
- 训练：Flow Matching 替代传统扩散训练

### 4.4 FLUX（Black Forest Labs, 2024）

- 团队：原 SD 核心作者（Robin Rombach 等）
- 技术：流匹配 + DiT 骨干 + 旋转位置编码（RoPE）
- 特点：极高的图像质量和文本遵循能力

### 4.5 其他重要工作

| 工作 | 方向 | 特点 |
|------|------|------|
| PixArt-α/Σ | 图像 | 高分辨率，高效训练 |
| Open-Sora / Open-Sora-Plan | 视频 | 开源复现 Sora |
| CogVideoX | 视频 | 智谱开源，3D RoPE |
| HunyuanVideo | 视频 | 腾讯，高保真 |
| Emu3 | 统一 | 自回归 + 扩散统一框架 |
| Lumina-T2X | 统一 | Flow + DiT，任意分辨率 |

---

## 五、变体分支与扩展

### 5.1 Latent DiT

- 大多数实际系统（Sora, SD3, FLUX）都在**潜空间**操作（继承 LDM 思想）
- VAE/VAE-3D 编码器先压缩像素空间 → DiT 在低维潜空间去噪 → 解码回像素
- 大幅降低计算成本，使高分辨率生成可行

### 5.2 图像 → 视频 → 3D 的扩展路径

```
图像 DiT（2D patches）
  └─→ 视频 DiT（时空 patches / 3D VAE）
        └─→ 3D DiT（体素/点云 patches）
```

- **视频**：时间维度建模（3D attention 或 temporal attention 层）
- **3D**：将 3D 数据结构化为 patch 序列（类似 Point-ViT 思路）

### 5.3 训练范式演进

```
传统扩散（DDPM/DDIM）
  └─→ Flow Matching（连续归一化流视角）
        └─→ Rectified Flow（更直的 ODE 路径，更少步数）
```

Flow Matching 正在成为 DiT 系列的主流训练范式（SD3、FLUX 均采用）。

---

## 六、与已有笔记的关联

本笔记接续**[扩散模型知识体系](/docs/diffusion-model-knowledge-map)**中的扩散模型知识脉络。

- **扩散模型笔记** 梳理了 DDPM → DDIM → LDM（Stable Diffusion）的主线，以 U-Net 为默认骨干
- **本笔记** 聚焦于扩散模型的**骨干架构演进**：从 U-Net 到 Transformer 的范式转换
- 两篇笔记的关系：扩散模型笔记 = 基础理论框架；DiT 笔记 = 骨干架构的当代演进
- 扩散模型笔记中的 LDM（潜空间扩散）概念在 DiT 生态中被全面继承（Latent DiT）

建议阅读顺序：先理解扩散模型基础 → 再看 DiT 如何用 Transformer 替换骨干。
