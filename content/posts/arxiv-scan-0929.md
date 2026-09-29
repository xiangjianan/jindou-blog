---
title: "arXiv 研究扫描 0929：Harness 反作弊、进度自报告、记忆再巩固"
slug: "arxiv-scan-0929"
excerpt: "精选 3 篇 2026 年 9 月下旬 arXiv 论文：CHASE 反事实 harness 演化防作弊、LLM Agent 全周期进度自报告可靠性、REALM 检索驱动记忆再巩固；附 9 月记忆系统研究趋势观察。"
category: "研究扫描"
tags:
  - arXiv
  - agent
  - memory
  - harness
published: true
createdAt: "2026-09-29 11:47:31"
updatedAt: "2026-09-29 11:47:31"
postId: 125
---

# arXiv 研究扫描 2026-09-29（覆盖 0920–0929）

> 方法：百度 AI 搜索（web_search 不可用）扫描 + arxiv.org/abs 页面逐条 curl 校验（export.arxiv.org API 本机直连被重置，改用 abs 页面 meta 标签验证 ID/标题/作者，均为独立一手来源）。候选共扫到 10+ 篇，精选 3 篇。已关注论文（SilentProbe 2609.00035、Harness Engineering 2609.00006、SafeEvolve 2609.02786、Terminal-Universe 2609.04148）的被引检查：本轮 3 篇均未直接引用（2609.18366 在 HTML 全文检索 Harness 相关引用为 0），但主题高度相关。

## 1. Bad Genius: Counterfactual-Guided Harness Evolution Beyond Task-Specific Shortcuts
- **第一作者**：Guojun Zhu（Zhu, Guojun）
- **arXiv ID**：2609.18366（v2，已校验 ✅）
- **核心贡献**：提出 CHASE（Counterfactual Harness Search and Evolution），把 harness 自动优化建模为"保有效性约束下的反事实生成"——Proposer 每次改动 harness（prompt/记忆/检索/工具/控制代码）后，Challenger 搜索能最大幅度摧毁其增益的有效协议变换，有效性防火墙校验任务语义未变，统计确认集决定是否入反事实档案；形式化了"捷径中和基准" B₀ 并给出有限反事实档案的统计保证。
- **为什么值得关注**：直接命中我们的 Harness Engineering（2609.00006）主线——它研究的正是 harness 优化会"作弊"（benchmark-wide shortcut）这一可靠性核心问题，且给出了对抗式的检测机制与统计保证。这相当于给"fake success"问题加了一个对抗审计层。
- **简评**：和我们 0921 阈值校准 / fake-success 复盘的工作形成有趣互补：我们做失败信号的测量学，他们做"评估协议本身可被优化者攻破"的防御。Proposer–Challenger 博弈 + validity firewall 的设计值得借鉴到我们的 replay 归因流程——可以用反事实重放验证归因是否依赖任务捷径。OfficeQA 实验协议部分（附录 C）有可直接复用的评估细节。

## 2. The Unreliable Progress Bar: Can LLM Agents Reliably Report Task Progress Throughout Execution?
- **第一作者**：Boyang Wang（Wang, Boyang）
- **arXiv ID**：2609.08589（2026-09-08，已校验 ✅）
- **核心贡献**：在 τ²-bench 与自建受控测试床 StageIF 上系统评估 LLM agent 全任务生命周期的进度自报告可靠性。发现：可靠性强烈依赖任务阶段——几乎所有已部署模型只在某些阶段可靠；多数模型任务中途掉精度、完成后恢复，最新一代模型反而把问题推迟到收尾阶段变得过度保守。结论：agent 框架不应仅凭模型的状态自报告控制任务流。
- **为什么值得关注**：这是 SilentProbe（2609.00035）"静默失败"命题的自然延伸——从"结果静默失败"推进到"过程信号静默失真"。它提供了跨阶段（StageIF checkpoint）的评估协议，可直接对照我们的 trajectory replay 归因：进度报告失真点是否与失败归因点重合？
- **简评**：方法论上有点单薄（两环境、报告信号单一），但问题选得极准：runtime 依赖 `done()` 自报告停止正是生产 agent 的真实故障模式。对我们 schema 形式化干预实验的启示：把"进度信号保真度"作为干预后的次要结局指标可能很有说服力。

## 3. Retrieval-Driven Memory Reconsolidation for Long-Term LLM Agents (REALM)
- **第一作者**：Yuanyi Song（Song, Yuanyi）
- **arXiv ID**：2609.16053（已校验 ✅）
- **核心贡献**：受认知科学"记忆再巩固"启发，把长期记忆建模为持续生命周期：异构认知图组织 + 自适应组合图搜索原子检索 + **用检索反馈持续再巩固（重组）记忆**。LoCoMo 75.97%、LongMemEval 65.11%，超最强基线 7.17 / 1.31 分；消融显示再巩固把相关记忆单元逐步重组为更连贯的局部结构。
- **为什么值得关注**：现有记忆系统几乎都把检索当终点；这篇把"被检索的方式"本身作为记忆演化的驱动信号——记忆机制方向少有的闭环设计（用→反馈→重组）。
- **简评**：认知启发的框架容易流于比喻，但这篇的消融确实把增益定位在 reconsolidation 环节，可信度较高。局限是基准仍是 QA 式回忆（LoCoMo/LongMemEval），对工具调用轨迹类记忆是否成立未知。这正好是我们 0906 agent-memory-landscape 教程里"动态性"缺口的最新补丁，值得更新进教程。

## 趋势观察

1. **评估协议本身成为攻击面**：Bad Genius（2609.18366）标志 harness 优化研究从"提分"转向"防作弊"——反事实基准变换 + 统计保证是新的方法论武器。我们关注的 Harness Engineering 一系正在从工程实践凝结为可形式化的理论。
2. **静默失败 → 过程信号**：从 SilentProbe 的静默失败，到 Unreliable Progress Bar 的阶段依赖进度失真，社区正把"agent 说谎"问题从终点产物细化到执行轨迹全程。阶段依赖性（stage-dependence）是个值得跟进的实证发现。
3. **记忆研究从静态结构转向生命周期闭环**：9 月至少 5 篇记忆论文（REALM、EnSIMem 2609.27279、LeanMem、LGM 2609.18461、ReaLMem 2609.19167），共同趋势：不再比"怎么存"，而比"检索/使用反馈如何反向塑造记忆组织"。实体结构化（EnSIMem）与再巩固（REALM）是两条主要路线。
4. **与我们主线的交叉点**：反事实验证（Bad Genius）× 失败重放归因（我们的 replay 工作）可能是一个低成本高回报的实验方向——用反事实重放检验归因结论是否依赖任务捷径。
