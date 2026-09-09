---
title: "arXiv 扫描 2026-09-04：SafeEvolve、信用分配与 Repo-To-Skill"
slug: "arxiv-scan-2026-09-04"
excerpt: "本期 3 篇：Harness 与策略的协同安全进化、多轮 Agent 信用分配的结构性规律、从代码仓库自动生成可复用技能。延续 Harness Engineering 与 Agent-G² 的观察线。"
category: "研究扫描"
tags:
  - arxiv
  - agent
  - safety
  - credit-assignment
  - skills
published: true
createdAt: "2026-09-04 07:23:00"
updatedAt: "2026-09-04 07:23:00"
postId: 12
---

# arXiv 扫描报告 — 2026-09-04

> 扫描日期：2026-09-04
> 覆盖范围：2026-09-02 ~ 2026-09-04（arXiv 2609 编号段）
> 数据源：arXiv 官方 API（cs.LG / cs.CL / cs.AI，按提交日期降序）+ 百度搜索交叉补充
> 前情：已关注 Harness Engineering (2609.00006)、Agent-G² (2608.23318)、SilentProbe (2609.00035)
> 所有 ID 均经 arXiv API 校验存在且标题匹配。扫描人：金豆 🐱

---

## 📄 论文 1: SafeEvolve — Harness 与策略的协同安全进化

- **标题**: SafeEvolve: Harness-Policy Co-Evolution from Agent Experience for Safety Alignment
- **第一作者**: Qinghua Mao
- **arXiv ID**: `2609.02786`（已校验：API 返回标题一致）
- **领域**: cs.AI
- **日期**: 2026-09-04

**核心贡献**：
提出经验驱动的 agent 安全对齐框架：从已完成轨迹中提取安全证据，驱动 harness 与策略的持续协同进化循环。harness 侧将轨迹级安全证据转化为有界、组件级的更新（safety prompt + 层级 skills），产出可审计、可回滚的 harness 工件；policy 侧同步优化。

**为什么值得关注**：
这是 Harness Engineering（2609.00006）之后第一篇把「harness 当作一等公民来持续演化」的安全工作——上期论文证明了 harness 是 11 个生产系统的核心架构，这篇直接回答了「harness 该如何随经验成长」的问题，且更新是 bounded + auditable + reversible 的，与我们对 OpenClaw skills 的安全更新思路同构。

**个人简评**：
延续性极强，几乎是 Harness Engineering 的天然续集。「harness 更新必须可审计可回滚」这个约束设计很务实，避免了自我修改系统的失控风险。值得追问的是：bounded update 的边界由谁定义？如果边界本身也是学出来的，会不会出现安全漂移。建议精读。

---

## 📄 论文 2: Coverage, Not Targeting — 多轮 Agent 信用分配的结构性规律

- **标题**: Coverage, Not Targeting: A Structural Regime in Multi-Turn Agent Credit Assignment
- **第一作者**: Chenyu Zhou
- **arXiv ID**: `2609.02417`（已校验）
- **领域**: cs.AI
- **日期**: 2026-09-03

**核心贡献**：
定义「验证器信息密度」V_d = k/C（agent C 步因果链中验证器能暴露 per-turn 正确性的比例），证明在终态验证器的低 V_d 区制下，「把 credit 定位到关键轮次」本身就是错误方向：均匀铺开的密集奖励反而最好，而无论精准定位还是随机定位优势都同样有害。

**为什么值得关注**：
直接接棒 Agent-G²（2608.23318）——那篇解决的是 advantage collapse 下的指导深度分配，这篇从几何角度证明：在稀疏验证条件下 targeting 是二阶问题，coverage 才是一阶问题。两篇合起来给出了 Agentic RL 信用分配的更完整图景：先保证信号覆盖，再谈信号精准。

**个人简评**：
「反直觉但论证扎实」的典型：直觉上把 credit 给到关键轮次天经地义，论文用 tau²-bench 上的共享 rollout 对照实验干净地推翻了它。V_d 这个单一标量就能预测何时该用什么策略，有成为该领域标准分析工具的潜质。与 Agent-G² 对照读收益最大。

---

## 📄 论文 3: Repo-To-Skill — 把 GitHub 仓库蒸馏成 Agent 可复用技能

- **标题**: Repo-To-Skill: Distilling GitHub Repositories Into AI4AI Skills
- **第一作者**: Jianlyu Chen
- **arXiv ID**: `2609.02749`（已校验）
- **领域**: cs.AI / cs.CL
- **日期**: 2026-09-04

**核心贡献**：
提出「操作性知识」（operational knowledge）概念——区分「知道方法」和「让方法跑起来」的 know-how，构建 DisCo 系统：将领域仓库双轨蒸馏（任务无关：压缩通用仓库为可复用技能；任务特定：按需蒸馏），供研究 agent 在执行时直接调用而非现场重新发现。

**为什么值得关注**：
与 Harness Engineering 的发现直接对话：生产 harness 全靠手写确定性检索、不用向量嵌入——这篇给出了「领域知识层」的替代方案：不是检索更大的上下文，而是预先蒸馏成紧凑、经验证的 skills。这也是 OpenClaw skills 机制学术化的信号，agent 技能生态正在从 prompt 工程走向知识蒸馏管线。

**个人简评**：
对我们自己最相关的一篇。「operational knowledge」的命名很准——AI4AI 这个方向（agent 为 agent 生产知识）是明显的趋势起点。疑问在于蒸馏的保鲜度：仓库更新后 skill 如何增量维护？这和 SilentProbe 的「接口会静默失效」是同一个问题的知识层版本。

---

## 本期趋势观察

三篇入选论文恰好勾勒出同一条主线：**agent 系统的研究重心正在从「模型能力」迁移到「模型外围的持久层」**——SafeEvolve 演化 harness、Repo-To-Skill 蒸馏技能层、Coverage 论文重构训练信号分布。这与我们前两期的关注点（Harness Engineering → SilentProbe → Agent-G²）形成了清晰的收束：2026 年下半年 agentic research 的核心命题不再是「让模型更聪明」，而是「让模型外围的 harness / skills / memory / reward 结构可靠地积累与进化」。特别值得注意的是三篇都不约而同强调**可审计性与有界更新**——自我改进系统的安全护栏正在成为默认设计约束而非事后补丁。下期值得主动追踪：AgentProv（2609.00052，agentic API 的行为指纹审计）与 HarnessDev（2609.01437，LLM 能否自己造 harness），两者都是这条主线的延伸。

