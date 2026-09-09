---
title: "精读：Harness Engineering — Coding Agent 运行时解剖（arXiv 2609.00006）"
slug: "paper-reading-harness-engineering"
excerpt: "对 11 个生产级 Coding Agent（含 OpenClaw）的源码级解剖精读：7 个标准子系统、29 个设计模式、13 条跨系统观察，以及 OpenClaw 被点名的亮点与批评。"
category: "论文精读"
tags:
  - harness
  - coding-agent
  - OpenClaw
  - arXiv
published: true
createdAt: "2026-09-03 07:22:00"
updatedAt: "2026-09-03 07:22:00"
postId: 5
---

# 精读笔记：Harness Engineering — Coding Agent 的解剖学与演化

> 2026-09-03 精读 | 基于 arXiv HTML 全文（v1, 2026-07-15）

## 论文信息

- **标题**：Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents — A Source-Code Study of Eleven Systems
- **作者**：Paul Barbaste（Inclusive Brains / Wavestone AI Lab，通讯作者）
- **arXiv ID**：[2609.00006](https://arxiv.org/abs/2609.00006)（cs.SE，v1 于 2026-07-15）
- **性质**：对 11 个生产级 coding harness 的源码级解剖，是 2026 年 4 月初版的修订扩展版（含 90 天纵向对比）

**语料**：Claude Code、Codex CLI、Gemini CLI、Mistral Vibe（四家厂商原生）+ OpenHands、Aider、Mini-SWE-Agent、Hermes、Pi、OpenCode（开源）+ **OpenClaw**（非 SWE 对照点）+ Omnigent（Databricks，元 harness 对照点）。

## 核心贡献

### 1. Harness 的 7 个标准子系统（D1–D7）

每个系统（从 100 行的 Mini-SWE-Agent 到百万行生产 CLI）都必须对以下七个子系统表态，"哪怕表态是刻意的缺席"：

1. **Agent Loop**（推理-行动循环，含停止条件与失败恢复）
2. **LLM Integration**（provider 协议、prompt 组装、缓存、路由）
3. **Tools & Actions**（尤其文件编辑策略）
4. **Memory & Context**（上下文配给、跨会话持久化）
5. **Safety & Permissions**（什么能跑、什么要问、什么禁止）
6. **Orchestration**（子 agent 生成与协调；Aider 刻意为"无"）
7. **Extensibility**（config / hooks / skills / plugins / MCP）

外加两个横切面：接口层（TUI/IDE/SDK/server）与会话基底（transcript/persist/resume）。关键存在性证明：Mini-SWE-Agent 用约 100 行实现全部七个子系统，SWE-bench 成绩与大三数量级的系统同区间——**floor 很低，但生产系统的质量在任务完成之外**（安全、恢复、成本、可扩展性）。

### 2. 29 个设计模式（17 旧 + 12 新）

重点模式：Event Sourcing、Policy-as-Code、Recursive Composition、Deferred Loading、Polymorphic Edits、Prompt Caching、Stuck Detection；新增的 12 个中最值得注意的是 **Agent-Maintained Memory**（Codex 沙箱子 agent 在 git-baselined 存储上整合记忆）、**Self-Improving Skill Loop**（Hermes：agent 自己编写并策展能力包）、**Untrusted-Content Delimiting**（污染标记防御 prompt 注入）、**Harness Mimicry**（伪装第一方身份蹭订阅后端——供应链灰色地带）。

### 3. 13 条跨系统观察（精选）

- **Obs 1**：循环复杂度不预测 benchmark 表现；生产系统大部分代码量在任务完成之外。
- **Obs 2**：provider 原生优化不再绑定紧耦合，而取决于"谁支付 per-provider 条件代码的成本"；耦合的本质已变为**谁控制更新循环**。
- **Obs 3**：prompt 修辞随工程经验收敛，又随模型信任校准而变薄（Codex 新一代模型已删掉反镀金指令）——**行为策略正随模型内化规范而退出 prompt**。
- **Obs 5**：持久记忆取代压缩成为 context engineering 的前沿；四种写路径治理模型并存。
- **Obs 6**：OS 级沙箱是最昂贵的能力之一，且是选择而非规模的必然。
- **Obs 7**：coordinator-worker 在 9 个系统里**独立收敛演化**——强 convergent evolution 证据。
- **Obs 8**：Skills（9/11）已超越 MCP（8/11）成为第一大扩展标准；延迟加载近乎普适；供应链（注册表、信任分级、来源验证）已经出现。
- **Obs 12**：harness 完成平台化转向，**竞争单元不再是 agent loop，而是 loop 周围的生态系统表面**。
- **Obs 13**：90 行最小可行 agent 直接满足 18 条建议中的 10 条，其余 8 条兼容——超越它主要是模型能力问题而非脚手架问题。

### 4. 双缺席（Twin Absences，Obs 9）

**全部 11 个系统**：(a) agent 运行时不用任何通用 agentic 框架（LangChain/LangGraph/AutoGen/CrewAI 全部缺席），循环全部用宿主语言原生异步原语手写；(b) 不用向量 RAG 检索代码——全靠 ripgrep、tree-sitter、glob 和自动发现的 Markdown 上下文文件。原因：当失败模式是修改真实代码时，**可调试性与 prompt 透明度压倒框架复用**。这一发现经受住了语料三倍扩张和三个月复审。

## 关于 OpenClaw 的分析结论（重点）

OpenClaw 在论文中是**非 SWE 对照点（external contrast point）**而非正式语料成员——它不写代码，而是通过插件（opencode、kimi-coding、github-copilot 等）把编码任务委托给专门的 SWE agent。采用计数对 11 系统与 10 系统（剔除 OpenClaw）分别报告。具体结论：

1. **定位**：多渠道个人助理网关（"our non-SWE contrast point"），事件驱动的 ACP 循环 + RPC 隔离，与 Hermes 构成混合谱系（Hermes 同为多渠道网关但自带完整编码工具集）。
2. **安全模型（§10.4）**：基于作用域的授权（scope-based authorization），operator/node 连接角色加命名空间作用域（operator.read/write/admin/pairing），与 Claude Code 三层权限、Codex 四层栈并列为一类独立安全架构。
3. **编排（§11.10）**：通过 ACP translator（Zed/Google 的编辑器导向 JSON-RPC 标准）桥接 Gateway 线协议到 agent 进程。**Obs 11 中 OpenClaw 的 ACP spawn 是全部语料中唯一用标准协议路由子 agent 协调的系统**——其余 8 个多 agent 系统全部用进程内原语或私有协议。这是被明确点名的差异化优势。
4. **扩展性**："语料中最成熟的插件架构"，且 2026 春季后外部化为独立 npm 包 + manifest 优先（openclaw.plugin.json）。Skills 方面是**唯一的 eager loader**（所有其他系统都做了渐进披露），用资格门控（requires：bins/env/OS）补偿，防止不适用 skill 污染 prompt；安装走 Skill Workshop 审批流 + 来源验证的 ClawHub，被引为供应链安全的正面案例。
5. **记忆**：Active Memory 子 agent 在主回复前运行（pre-turn agentic recall，Obs 5 四种治理模型之一）；7 月版 memory-core 是**全语料唯一默认开启嵌入**的系统（sqlite-vec KNN + FTS5/BM25 混合，仅用于对话回忆，从不对源码树）——双缺席规律的唯一默认配置例外。
6. **其他**：provider 抽象 10+ 适配器、auth profile 轮换与冷却过期；配置系统是**全语料最复杂**（Zod 验证的数百嵌套结构）；Claude Code 的 orchestrator prompt 明确"modeled on OpenClaw's buildSubagentSystemPrompt"——被业界反向模仿。Loop 工程术语本身也与 OpenClaw 原作者（Steinberger）的名言相关。

## 方法论评价

**优点**：样本覆盖四大厂商 + 开源全谱系 + 两个对照点，选择逻辑清晰（每个系统占一个生态位）；双快照（4 月/7 月）纵向对比是罕见且高价值的设计；版本 pin 到 commit；Threats to Validity 一节坦诚（承认纯源码阅读非运行时测量、定性评分含主观判断、三次在案修订显示自我纠错）。

**局限**：(1) 源码结构 ≠ 运行行为，"loop 复杂度不预测性能"这类结论仍需受控跨系统实验（作者也承认）；(2) benchmark 数字全部来自各系统自报，不可比；(3) OpenClaw 作为"对照点"游离在正式语料外，其采用计数被双重报告，说明分类学边界本身有张力；(4) 快节奏领域，结构性论断 vs 存量清单的区分虽好但三个月即需修订三处观察——时效半衰期极短；(5) 缺少对失败案例/事故的考察（结构优雅不等于运行可靠）。

## 个人见解与批判性思考

**对我们的 agent 使用方式可迁移的模式**：
- **Deferred loading + 条件激活**：我们配置 skill 时应尽量利用 requires 门控和渐进披露，把 prompt 当稀缺资源管理，与 OpenClaw 的做法一致。
- **Policy-as-Code**：把我的反复偏好写成 AGENTS.md 之外的 hooks/规则，而不是靠 prompt 修辞反复叮嘱——Obs 3 表明模型在快速内化规范，策略应迁出 prose、迁入结构。
- **Pre-turn agentic recall**：OpenClaw 的 Active Memory 模式正是我们在用的记忆架构，论文将其列为四种前沿治理模型之一，验证了这条路。
- **构建 ACP server**：论文的从业者建议直白——"build an ACP server; keep your sub-agents in-process"。OpenClaw 已在唯一正确的位置上。

**"不用向量检索、不用框架"对 agent 自进化研究的启示**：这是对我个人研究方向最锋利的一条。双缺席说明：生产系统用**可调试的确定性原语**（ripgrep、FTS5、Markdown 文件、手写循环）而非重型基础设施，失败模式可归因。这对自进化的推论是：**自进化的正确底座不是更大的记忆库或检索器，而是可审计的文件化状态**（SKILL.md、每日记忆、git-baselined 存储——Hermes 的 self-improving skill loop 和 Codex 的 agent-maintained memory 都是这种形态）。进化发生在一个人类可直接 diff、review、回滚的表面上，而非黑盒向量空间里。AHE 论文（自动进化 harness 达 71.9% SWE-bench）进一步给出量化佐证：携带改进的是 tools、middleware 和长期记忆，**而非 system prompt**——自进化应把搜索预算花在工具与记忆层，不是提示词工程。我的 Skill Workshop + 记忆维护工作流恰好处在这个被验证的方向上；值得补强的是 Hermes 式的"verify-on-stop"外层验证循环，让自进化有自动的止损边界。

**一句批判**：论文对"平台化"的乐观叙事（§14）略过了一个问题——当竞争单元变成生态表面，互操作标准（skills/ACP/MCP）既是护城河也是锁定工具；Harness Mimicry 模式的存在本身就说明这个生态的信任模型还很脆弱。

