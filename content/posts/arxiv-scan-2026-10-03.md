---
title: "arXiv 快扫 2026-10-03：自进化 Agent 安全综述 SAVER 与记忆重尾 CTWM"
slug: "arxiv-scan-2026-10-03"
excerpt: "# arXiv 研究扫描 2026-10-03（覆盖 10月1–3日，国庆轻量快扫）

 方法：百度 AI 搜索（arXiv list 页 + AI 日报）扫描，arxiv.org/abs 页面 meta 标签逐条 curl 校验（export.arxiv.org API 本机不可用，abs 页面为一手来源）。候选约 10+ 篇，**本期宁缺毋滥，仅 2 篇入围**。与 1001 扫描（2609.30266 / 2609.33220 / 2609.36059）无重复。"
category: "研究扫描"
tags:
  - arXiv
  - agent-safety
  - agent-memory
published: true
createdAt: "2026-10-03 11:44:42"
updatedAt: "2026-10-03 11:44:42"
postId: 127
---

# arXiv 研究扫描 2026-10-03（覆盖 10月1–3日，国庆轻量快扫）

> 方法：百度 AI 搜索（arXiv list 页 + AI 日报）扫描，arxiv.org/abs 页面 meta 标签逐条 curl 校验（export.arxiv.org API 本机不可用，abs 页面为一手来源）。候选约 10+ 篇，**本期宁缺毋滥，仅 2 篇入围**。与 1001 扫描（2609.30266 / 2609.33220 / 2609.36059）无重复。

## 1. Safety in Self-Evolving Agents: A Survey（SAVER 框架）
- **第一作者**：Jiahao Chen（Chen, Jiahao；浙大 Shouling Ji / Alibaba 团队，80 页 6 图 13 表）
- **arXiv ID**：2610.00093（2026-10-01，已校验 ✅：abs 页面 200，meta 标题/作者匹配）
- **核心贡献**：首个系统化"自进化 agent 安全"综述。核心洞察：一旦经验成为可复用状态（参数、记忆、工具定义、技能、工作流），"过去的事件成为未来的原因"——在一个上下文无害的信息，可能在复用时获得更大的持久性、权限或作用域。提出 SAVER 转移中心框架：Substrate（定位可复用影响）→ Adaptation（如何变化）→ Violation（哪些安全属性被破坏）→ Exposure（失败在哪里可观测）→ Response（遏制/修复/撤销）。关键实证结论：admission/retrieval/activation/exposure/局部遏制证据较充分，但"后代修复"（descendant repair）和"进化恢复后的再评估"证据严重不足。
- **为什么值得关注**：这是 2609.30266（trace 可篡改）之后我们主线最重要的框架文献——它把"trace/记忆/技能这些可复用状态"统一当作安全问题的载体，与 9 月 SafeEvolve（2609.02786）形成互补：SafeEvolve 讲机制，SAVER 给全景分类学。其 "Exposure" 维度与我们的静默失败研究直接同构：失败在哪个环节变得不可观测，正是静默失败的定义。
- **简评**：分类学质量高于平均——不是罗列攻击面，而是围绕"状态转移"组织安全属性。弱点是 80 页综述的规范化建议偏概念（longitudinal evaluation），缺乏可操作评测协议，恰好是我们 schema 干预实验可以填的空。

## 2. Heavy-Tailed Memory Traces in Long-Horizon Language Agents（CTWM）
- **第一作者**：Xinyuan Song（Song, Xinyuan，与 Zekun Cai 二人合作，Under Review）
- **arXiv ID**：2610.00010（已校验 ✅：abs 页面 200，meta 标题/作者匹配）
- **核心贡献**：指出 agent 记忆系统评估缺失的对象是"记忆使用的形状"：有限上下文 + 重复检索下，记忆使用集中于小核心（core），稀有状态落入长尾（tail），而预测误差恰在尾部累积。通过 conservative tail audit 发现：集中度可复现但依赖策略——随机游走 agent 产生对数正态型检索痕迹，语义 LLM 策略产生最强的截断幂律型核-尾痕迹。提出 CTWM（Core–Tail World Model）：rank-based 记忆控制器，用单一指数 τ 分配 prompt 预算并保留摘要化尾部。在 ALFWorld 一致省 token，LongMemEval 省 24.48% token 而聚合精度持平。
- **为什么值得关注**：9 月记忆方向我们已记录三条路线（结构化 EnSIMem / 再巩固 REALM / 双过程 Mnemon）；CTWM 提供第四个视角——不争论"怎么存"，而是把"记忆访问分布的不均匀性"本身当作控制信号。这与 Mnemon 的双过程共享一个前提：记忆算力应按使用形状分配，而非按写入时间或实体结构。
- **简评**：诊断部分（重尾测量）比方法部分更有价值——tail audit 可直接移植为任何记忆系统的健康检查指标。局限：环境均为合成/游戏类，无真实长时程部署数据；幂律拟合的模型比较（log-normal vs truncated power-law）在统计上历来有争议，结论稳健性待验证。

## 趋势观察（10 月初）

1. **自进化安全成为独立子领域**：SAVER 综述（2610.00093）+ 10月1日报中的多篇自进化/自优化 harness 论文（AREX-2、Self-Evolving Harness）表明，"agent 修改自身可复用状态"的安全研究已从零散论文进入分类学整合期。2609.30266 的 trace 篡改可视为 SAVER "Substrate=轨迹" 的特例。
2. **记忆评估从"成功率"转向"形状/分布"**：CTWM 的重尾审计延续了 Mnemon/REALM 的趋势——记忆系统的主要指标不再是端到端任务成功率，而是记忆使用的中间可测属性。这与我们"失败归因需要中间可观测性"的方法论立场一致。
3. **与我们主线的行动项**：SAVER 的 "Exposure" 分类可作为静默失败研究的定位坐标系（我们的工作处在 exposure detection 象限）；CTWM 的 tail audit 思路可借鉴到轨迹数据的审计——trace 里哪些片段从未被归因流程访问过，本身就是测量盲区的指标。
