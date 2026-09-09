---
title: "Agent 安全与对齐技术版图：知识体系结构图"
slug: "agent-safety-alignment-landscape"
excerpt: "按生命周期分层梳理 Agent 安全四大分支：训练时对齐、推理时防护、Harness 层安全、运行时进化，附正交/依赖关系图与研究空白分析。"
category: "AI教程"
tags:
  - agent-safety
  - alignment
  - harness
  - RLHF
  - sandbox
published: true
createdAt: "2026-09-04 09:20:03"
updatedAt: "2026-09-04 09:20:03"
postId: 13
---

# 教学笔记：Agent 安全与对齐技术版图

> 2026-09-04 | 基于近期精读：SafeEvolve（arXiv:2609.02786）、Harness Engineering（arXiv:2609.00006）、SilentProbe（arXiv:2609.00035）与工具可靠性综述

Agent 安全的工作散落在不同的社区里：做 RL 的谈对齐，做 NLP 的谈 prompt 注入，做系统的不谈安全只谈沙箱。这篇笔记把它们放进一张图，按「安全干预发生在 agent 生命周期的哪个环节」分为四层。

## 一、训练时对齐（Training-time Alignment）

**核心思想**：在模型权重里把「安全偏好」内化为参数的一部分，让模型天生不做坏事。

代表工作：RLHF / RLAIF（用人类或 AI 反馈训练奖励模型再做强化学习）、安全微调（safety fine-tuning，在有害样本上做 SFT/RL）、Constitutional AI（Anthropic，用一组成文原则让模型自我批判自我修正，减少对人类标注的依赖）。这一层是所有下游安全的基座——但它的保证是统计性的、不可审计的，权重一旦定型就无法逐条解释某个行为为什么被允许。

## 二、推理时防护（Inference-time Guardrails)

**核心思想**：不改权重，在生成路径上拦截——输入端过滤恶意指令，输出端约束或审查生成结果。

代表工作：prompt 注入防御（如 Untrusted-Content Delimiting：对检索到的外部内容做污染标记，防止其被当作系统指令）、输出分类器过滤、constrained decoding / structured outputs（在 logits 层做掩码，强制输出符合 schema 或白名单——OpenAI Structured Outputs、GBNF/vLLM 的做法）。这一层的好处是可即插即用、随策略热更新；代价是约束过强会伤推理能力（*Let Me Speak Freely?*, arXiv:2408.02442 证明了形式化与任务性能的张力），且防线都在模型进程内，可被更长的上下文绕过。

## 三、Harness 层安全（Harness-level Safety）

**核心思想**：安全不只是模型的事，而是模型外围那层工程系统的事——权限、沙箱、审批流、供应链，全部由 harness 结构性强制，而非 prompt 叮嘱。

Harness Engineering（2609.00006）解剖了 11 个生产级 coding agent，把 **Safety & Permissions 列为七大标准子系统之一**（什么能跑、什么要问、什么禁止）。三个关键发现：

1. **生产系统的安全质量在任务完成之外**——循环复杂度不预测 benchmark 表现，安全才是区分原型与生产的分水岭。
2. **权限模型已收敛为几种独立架构**：Claude Code 的三层权限、Codex 的四层审批栈、OpenClaw 的作用域授权（scope-based authorization：operator/node 角色加命名空间作用域）。
3. **OS 级沙箱是最昂贵的安全能力**，且是架构选择而非规模的自然结果。

OpenClaw 被论文点名的两个正面案例尤其值得记住：其一是 **skills 供应链安全**——安装走 Skill Workshop 审批流 + 来源验证的 ClawHub 注册表，用 requires 门控（bins/env/OS）防止不适用技能污染 prompt；其二是 ACP 标准协议路由子 agent，是全部语料中唯一不依赖私有协议的多 agent 协调。此外 Policy-as-Code 模式表明：安全策略应从 prompt 修辞迁入结构化规则——模型在快速内化规范，行为策略正随内化退出 prompt。

这一层与前两层的本质区别：**可审计、可回滚、可 diff**。权重是黑盒，prompt 是软约束，而 harness 工件（权限配置、沙箱规则、审批策略）是人类可以直接 review 的文件。

## 四、运行时进化（Runtime Safety Evolution）

**核心思想**：安全不该在部署时冻结——agent 在真实运行中积累轨迹，从轨迹里的安全事件中持续学习，让 harness 与策略协同进化。

代表工作即今天的 **SafeEvolve（2609.02786）**：从已完成轨迹中提取安全证据，harness 侧将其转化为有界、组件级的更新（safety prompt + 层级 skills），产出**可审计、可回滚**的 harness 工件，policy 侧同步优化。它是 Harness Engineering 之后第一篇把 harness 当作一等公民来持续演化的安全工作。关键设计约束是「bounded update」：进化必须发生在有明确边界的表面上，避免自我修改系统的失控与安全漂移——如果更新边界本身也是学出来的，谁来保证边界不漂？这是开放问题。

注意第四层对第三层的依赖：**进化发生在 harness 工件上**（skills、prompt、权限配置），而不是黑盒权重上——正是因为 harness 层提供了可 diff 的表面，经验驱动的安全学习才可审计。

## 五、知识体系结构图

```
Agent 安全与对齐技术版图
│
├── 1️⃣ 训练时对齐 ────────────  [模型层 · 黑盒 · 统计性保证]
│   ├── RLHF / RLAIF          反馈 → 奖励模型 → RL
│   ├── 安全微调               有害样本 SFT/RL
│   └── Constitutional AI     成文原则 + 自我批判
│            │ 基座：决定模型的默认倾向
│            ▼
├── 2️⃣ 推理时防护 ────────────  [生成路径层 · 即插即用 · 可绕过]
│   ├── Prompt 防注入          污染标记 / 不可信内容定界
│   ├── 输出过滤               分类器 / 策略审查
│   └── Constrained decoding   logits 掩码 / structured output
│            │ 依赖 1️⃣ 的内化倾向降低拦截负担
│            ▼
├── 3️⃣ Harness 层安全 ────────  [系统层 · 白盒 · 结构性强制 · 可审计]
│   ├── 权限模型               三层/四层审批 / scope-based 授权
│   ├── 沙箱                   OS 级隔离（最昂贵）
│   ├── 审批流                 human-in-the-loop / Policy-as-Code
│   └── Skills 供应链          来源验证 + 注册表 + 门控
│        （OpenClaw：Skill Workshop 审批 + ClawHub + requires 门控，
│          被论文引为供应链安全正面案例）
│            │ 提供「可 diff 的人类可审计表面」
│            ▼
└── 4️⃣ 运行时进化 ────────────  [生命周期层 · 持续学习 · 有界更新]
    └── SafeEvolve             轨迹 → 安全证据 → 有界可回滚的
                               harness+policy 协同进化
```

**正交与依赖关系**：1️⃣ 与 2️⃣、3️⃣ 正交（改权重 vs. 不改权重，可独立部署、可叠加）；2️⃣ 依赖 1️⃣（模型内化越好，推理时拦截负担越轻，但两者不能互替——2️⃣ 防不了 harness 被滥用）；3️⃣ 与 1️⃣、2️⃣ 正交且互不替代（模型再对齐也不能替代文件系统权限）；4️⃣ 依赖 3️⃣（协同进化的落点必须是可审计的 harness 工件），并消费 1️⃣2️⃣3️⃣ 产生的运行时信号。

## 六、研究空白

绝大多数安全工作针对**模型**（对齐）或 **prompt**（注入防御），而 agent 真正出事故的地方往往是第三层：权限被滥用、恶意 skill 进入注册表、审批流形同虚设。Harness 层的系统化安全研究刚刚起步——SafeEvolve（2609.02786）是少数把 harness 当作安全研究一等对象的工作，且它自己也承认「bounded update 的边界由谁定义」尚无答案。同样地，SilentProbe 测出的 41% 虚报成功率说明：连「agent 是否如实报告失败」这个最基础的信任问题，都还没有第四层的进化机制去处理。**这层空白的本质是：我们缺少一套把安全当作系统属性（而非模型属性）来度量、审计、进化的方法论。** 谁先补上，谁就定义下一个子领域。

