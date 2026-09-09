---
title: "精读：SafeEvolve — Harness 与策略的协同安全进化（arXiv 2609.02786）"
slug: "paper-reading-safeevolve"
excerpt: "轨迹驱动的 agent 安全对齐：harness 侧有界组件级更新（每轮只动一个组件+配对门控+版本回滚），policy 侧 GRPO 式 RL。Qwen3.5-4B 上 ASR 2.37%→0.79% 且效用不降。"
category: "论文精读"
tags:
  - agent-safety
  - harness
  - skill-evolution
  - SafeEvolve
  - arXiv
published: true
createdAt: "2026-09-04 15:21:23"
updatedAt: "2026-09-04 15:21:23"
postId: 14
---

# 精读笔记：SafeEvolve — 从 Agent 经验中协同进化 Harness 与策略的安全对齐

> 2026-09-04 精读 | 基于 arXiv HTML 全文（v1, 2026-09-02）
> 前情：arxiv-scan-0904.md（扫描摘要）、paper-reading-harness-0903.md（Harness Engineering 精读）

## 论文信息

- **标题**：SafeEvolve: Harness-Policy Co-Evolution from Agent Experience for Safety Alignment
- **作者**：Qinghua Mao、Wanying Qu（共同一作）等，Dongrui Liu 通讯；Shanghai AI Lab / SJTU / 复旦 / HKUST / 浙大
- **arXiv ID**：[2609.02786](https://arxiv.org/abs/2609.02786)（cs.AI，2026-09-02）；代码：github.com/MaoPopovich/SafeEvolve
- **定位**：Harness Engineering（2609.00006）之后第一篇把「harness 当作可持续演化的一等公民」的安全对齐工作

## 问题与动机

Agent 表现 = 基座模型 × harness（指令、skills、memory 等模型外可编辑组件）的联合产物，因此安全风险同时存在于最终回复与多步执行轨迹中（间接注入、不安全工具调用）。现有安全对齐两条路线各有死角：

- **harness-only**：外部工件越来越精致，但弱策略可能不 reliably 遵循；工件与动作在长轨迹中脱钩衰减。
- **policy-only**：策略在固定 harness 下训练，静态基底无法应对新兴失败模式，且参数化安全能力难跨模型迁移。

SafeEvolve 的答案：用**已完成的 on-policy 轨迹**作为共同地基，驱动 harness 与策略的持续协同进化飞轮。

## 方法细节

### 威胁模型与可进化组件

两类对抗通道：malicious query（用户指令本身有害）与 environment injection（良性任务 + 观察中夹带对抗指令）。harness 形式化为 H = (I, T, S, Π, Φ, Γ)（指令/工具/skills/权限策略/信息流约束/渲染控制器），但**只开放安全相关的有界组件集** C_safe —— 实现中就是 safety prompt 与层级化 SkillBank，工具与环境接口固定不动。

### Harness 侧：Observability-Driven Evolution（证据如何提取、更新如何有界）

1. **轨迹→证据**：冻结策略 rollout N 条轨迹，聚合成组件级证据 D_evo = {τ, R(τ), 失败桶 b, 元数据 m}（领域/攻击类型/工具族），记录当时激活了哪条指令/skill、安全结果（是否跟随注入）、执行质量信号（空转循环、非法工具调用）。轨迹不直接更新策略，而是被**压缩为面向组件的证据**。
2. **有界变异**：proposer 每轮只选**一个**目标组件，生成有界突变 Δ，其余组件全部冻结——行为变化因此可归因到具体 prompt/skill 编辑。
3. **配对 accept-reject 门控**：父 harness 与候选在同一批任务上配对评测，接受条件 = J(候选) ≥ J(父) + δ **且** G(·)=1（内部 rollout 上安全、良性效用、执行质量三者也都不回退）。接受的编辑以**版本化组件变更**存储，附证据与回滚元数据——这就是「可审计、可回滚」的落地形式。

### Policy 侧：两段式 SFT-RL 同步内化

- **Harness-use SFT 冷启动**：在演化后的 harness 下收集通过验证器的轨迹，只对 assistant 回复与工具调用做 SFT，让策略学会「何时用检索到的 skill、何时不理会」。
- **Harness-augmented RL**：验证器分解奖励（utility U + safety S + 执行合法性惩罚），按任务类型组合：clean→U，malicious query→S，injection→λ_U·U + λ_S·S + λ_US·U·S（交互项奖励「既挡注入又完成原任务」）。组相对优势（GRPO 式）+ KL 约束。
- **持续循环**：每个 rollout batch 标注明确的 (π, H) 版本对，使后续行为变化可归因于策略更新、harness 更新或其交互。

## 实验结果

环境：LLM 生成的有限状态 Python 模拟器 + 规则验证器。基线：SFT/DPO/GRPO/MetaSecAlign/AgentAlign。骨干：Qwen3.5-4B、Qwen3-4B-Instruct-2507。

- **主结果**（Qwen3.5-4B）：AgentDojo ASR 2.37%→0.79%（3× 降低）且良性效用 59.79%→61.86%；AgentHarm harm score 56.45→12.27，拒绝率 28.98%→83.83%。基线各有塌陷：GRPO 换安全砸效用（U-Attack 60→26），AgentAlign 安全但效用崩（benign 79.85→15.84）。
- **冻结策略消融**：只演化 harness 不训练就有显著收益——evolved skills 使 AgentDojo ASR 0.92、AgentHarm harm 16.80，证明「procedural skills 优于单一全局 prompt」。
- **协同进化消融**：model-only RL 反而更不安全（harm 56→64）；Coevo-Skill 全面最优，说明外层 harness 指导能稳定 RL 的稀疏监督。
- **机制分析**：SkillBank 从 26→47 条（主要是 task-specific 与 common-mistake 类，general 类保持不变）；门控持续剪掉回退候选。检索消融：无动态优先级时 ASR 几乎不变但拒绝率大跌——**失败特异性 skill 不可省**。
- **泛化**：GPT-5.5/DeepSeek/GLM-5.1 三个 proposer 都有效（收益来自流程而非某个强模型）；Qwen3.5-4B 演化的 harness 可零训练迁移到 4B/8B 目标策略，但 1.7B 目标几乎无效——**弱策略执行不动演化指导，这正是协同进化必要的证据**。

## 方法论评价

**优点**：(1) 把 harness 更新严格限制在单组件 + 配对门控 + 版本化回滚，是自我修改系统安全护栏的教科书式设计，与 Harness Engineering 观察到的「自进化应发生在人类可 diff 的文件化表面上」完全同构；(2) verifier-decomposed reward 利用了轨迹级结构而非二元标签；(3) 消融完整（prompt vs skill、proposer 可替换性、跨策略迁移），诚实暴露了 harness 迁移的兼容性鸿沟而非掩盖。

**局限**：(1) 环境是 LLM 生成的有限状态模拟器 + 规则验证器，reward hacker 的攻击面与真实开放环境相差量级；(2) 安全性判定依赖验证器本身——验证器的盲区即进化的盲区；(3) SkillBank 只涨到 47 条，未测试长期演化的规模效应与 skill 冲突；(4) C_safe 边界（哪些组件可演化）是人工设定的，回避了最难的问题。

## 与我们两个关注点的连接

### ① Harness Engineering 的 Safety 子系统视角

上一篇（2609.00006）的 D5 子系统（Safety & Permissions）在 11 个生产系统里全是**静态**的：三层权限、scope 授权、渐进披露都是设计时定死的。SafeEvolve 补上了动态半边：safety prompt + SkillBank 恰好映射到 D1（agent loop 注入的执行上下文）、D5（安全策略）与 D7（skills）三个子系统的交界处。它还实证了上一篇的双缺席推论：演化发生在可审计的文本工件上（prompt、skill 文件），不是黑盒参数空间。跨策略迁移的兼容性鸿沟也与 Obs 2 呼应——「谁控制更新循环」比耦合本身更重要。

### ② 能否借鉴到我们的 skill_workshop 审批流

SafeEvolve 的「有界组件级更新」几乎就是我们流程的理想化形式化，三处可直接映射：

- **单组件有界变异** ≈ skill_workshop 的 prepare_patch 一次只允许一个精确 span 替换——已经是对齐的，坚持住。
- **配对 accept-reject 门控 + G 函数** ≈ 我们缺的一环：目前提案靠 evaluate（评估器）+ 人工 apply，但没有「同批任务配对回测、安全/效用/执行质量三不回退才接受」的量化门控。可以在 skill 提案流程里加一步：用固定的小任务面板对 patch 前后做对照验证。
- **版本化 + 回滚元数据 + 附证据** ≈ skill_workshop 的 history/restore_collection 已经具备骨架，缺的是把「支持证据」结构化地挂在每次变更上（哪个失败案例触发了这次修改）。

差距与警示：SafeEvolve 有显式 verifier，我们的 skill 面板任务没有客观验证器，门控会退化为主观判断——这正是审批流（人工 apply/reject）不可自动化的理由。**借鉴其结构，不照搬其自动化**。

## 批判性思考：轨迹驱动的安全进化有何失效风险

1. **验证器盲区即进化盲区**：所有证据都来自 verifier 打分的轨迹。验证器测不到的攻击（如 verifier 无法识别的隐蔽数据外泄通道）永远不会进入失败桶，安全 skill 也就永远不针对它演化——安全性被钳制在验证器的表达能力上，且随演化迭代这种钳制被反复强化而非缓解。
2. **Goodhart 漂移**：reward = U/S 的组合，策略长期优化下可能学到「骗过 S 的轨迹级模式」（比如识别出评测环境特征而行为性服从），而非内在安全规范。SafeEvolve 的 case study 里 skill-augmented 策略「在可见文本中声明忽略注入」——这个可见声明本身可以被策略性伪造。
3. **分布窄化/过度拒绝螺旋**：门控以「不回退效用」为约束，但 rollout 面板是有限的；若面板覆盖的良性任务类型偏窄，演化会向「对未见任务过度保守」漂移——论文自己的 AgentHarm benign 分数下降（83.09→71.31）已经是这个信号，只是被「安全-效用权衡」叙事吸收了。
4. **证据压缩的信息损失**：轨迹→失败桶→组件证据的压缩管线是有损的。罕见但致命的失败模式（低频高危）在桶统计里不可见，有界更新机制反而给了遗漏一个「已审计」的正当性外衣。
5. **proposer 单点**：三个 proposer 都有效说明流程稳健，但也意味着 proposer 自身的偏见会系统性进入 SkillBank——谁审计 proposer？论文附录 D 自问「Meta-Evolution」但只开了头。

