---
title: "综述：Agent 工具调用可靠性与 API Schema 形式化（2024-2026）"
slug: "survey-agent-tool-reliability-schema"
excerpt: "梳理 agent 工具调用四级失效谱系、主流 benchmark 的覆盖缺口与干预方案局限，确认「形式化程度作为自变量的受控干预研究」仍是空白。"
category: "研究综述"
tags:
  - agent
  - tool-calling
  - schema
  - SilentProbe
  - reliability
published: true
createdAt: "2026-09-03 15:23:03"
updatedAt: "2026-09-03 15:23:03"
postId: 8
---

# 综述笔记：Agent 工具调用可靠性 / API Schema 形式化（2024–2026）

> 目的：为「Schema 形式化干预实验」研究想法打文献基础。
> 日期：2026-09-03。检索方式：arXiv 摘要直读 + 百度搜索（web_search 不可用）。

## 1. 问题定义：工具调用的失效模式分类

综合文献，LLM agent 工具调用的失效可归为四类：

- **格式错误（malformed call）**：JSON 语法漂移、类型错、弯引号破坏语法。工程实践中最常见的表层故障，由 schema 校验即可捕获（CSDN 工程实践总结：tool calling 死循环与 Schema 防线，2026）。
- **参数幻觉（parameter hallucination）**：凭空发明不存在的工具名/参数，或编造字段值。Gorilla（arXiv:2305.15334）、ToolLLM（arXiv:2307.16789）等早期工作即在 API 大规模场景下暴露此问题。
- **静默失败（silent failure）**：核心且最难发现的一类。SilentProbe（arXiv:2609.00035）将其精确定义为：API 返回 HTTP 200 + 可解析 body，agent 无法区分"查询没命中"与"服务器没理解查询"，无异常可 catch、无字段可分支。
- **奖励式成功/虚报成功（asserted false success）**：agent 在工具失败后向用户断言假阴性结果甚至编造数字。SilentProbe 实测：全 agent loop 下模型仅在 12% 案例中检测到静默失败，0% 修复，41% 向用户虚报，12% 编造数字。

这四类构成一条"越来越隐蔽"的谱系：格式错误必然暴露 → 参数幻觉易被校验暴露 → 静默失败只在下游显形 → 虚报成功把失败转嫁为用户的错误信念。

## 2. 已有测量工作：各 benchmark 覆盖什么、漏掉什么

- **BFCL（Berkeley Function Calling Leaderboard，ICML 2025）**：函数调用评测事实标准，用 AST 方法不需执行即验证调用正确性；V3 起扩展到多轮 agentic 评测。覆盖：单步/并行/多轮调用的"格式与参数正确性"。漏掉：不触达真实 API 侧的约束执行，因而完全测不到静默失败。
- **τ-bench（arXiv:2406.12045，Sierra）**：Tool–Agent–User 三方交互，客服域（Retail/Airline），pass^k 衡量可靠性。τ²-bench（arXiv:2506.07982）引入 dual-control（用户也能操作）。覆盖：多轮对话中的规则遵循与端到端任务成败。漏掉：工具 API 是模拟的、约束由环境作者设定，schema 形式本身不是自变量。
- **ToolSandbox（arXiv:2408.04682，Apple）**：有状态、对话式、交互式工具评测。覆盖：状态依赖的动态交互。漏掉：同上，schema 为固定背景变量。
- **MCP 系（2025 起爆发）**：MCP-Bench（arXiv:2508.20453，Accenture）用 26 个真实 MCP server 测跨工具协调与精确参数控制；MCPVerse（arXiv:2508.16260）；MCPToolBench++。覆盖：真实 server、真实工具生态。漏掉：作为"能力排名"工具，不以 schema 形式化为受控变量。
- **SilentProbe（arXiv:2609.00035）**：唯一直接测量静默失败的工作。审计 2,501 份 OpenAPI 文档共 721,320 个参数：仅 7.5% 声明枚举、15.2% 有任何机器可校验约束，40.1% 的文档在 prose 中写了 schema 未编码的约束。对 27 家厂商 live 端点做 schema 派生扰动：机器可校验约束 111/111 返回诚实错误，prose-only 约束 61 例中 44 例静默失败（p=2e-13）——**约束形式而非厂商身份预测诚实性**。

**共同缺口**：所有 benchmark 都把 API schema 当作"给定的环境属性"，没有人把它作为自变量系统操纵。

## 3. 已有干预方案及其局限

- **Structured output / constrained decoding**：OpenAI Structured Outputs、GBNF/vLLM logits masking 等保证语法与 schema 合法（CSDN 工程综述多篇，2025–2026）。局限：只保证"输出格式对"，不保证参数语义正确，更不触及服务端对约束的执行。且 *Let Me Speak Freely?*（arXiv:2408.02442）表明格式约束过严反而降低推理性能——形式化并非免费。
- **Schema 校验层 / 容错防线**：Zod/Pydantic 校验、JSON auto-repair、幂等哈希、振荡检测、token 预算闸门（生产工程实践，2026）。局限：全是客户端防线，对 HTTP 200 型静默失败无能为力——校验通过但语义失败。
- **重试策略**：对显式报错有效，但对静默失败无触发信号，重试无从谈起；甚至产生报错→调参→再报错的振荡。
- **SilentProbe 的干预**：把 prose 词汇表提升进 schema 枚举（一行改动），失败从 88/88 降到 0/89。局限：单一干预点、单一测量框架，未做成可泛化的"形式化梯度"实验。

## 4. 研究空白

截至 2026-09，**"形式化程度作为自变量的受控干预研究"不存在**。相关但不同的工作：

- 形式化程度与模型推理能力的张力（2408.02442，格式约束 vs 任务性能）；
- 形式化程度与服务端诚实执行的因果证据（2609.00035，但只有"有枚举/无枚举"二值对比 + 一条提升路径）；
- 各 benchmark 用固定 schema 测能力排名。

没有人系统地在 L0（纯 prose）→ L1（类型+描述）→ L2（枚举/正则/范围）→ L3（语义约束 + 服务端可校验）这条梯度上，同时测 agent 侧（调用正确性、静默失败检出率、虚报率）与 API 侧（诚实错误率），并给出形式化程度的最优区间与成本曲线。这就是我们的空间。

## 5. 对我们想法的修正建议

1. **双端测量是差异化核心**：SilentProbe 已占"API 侧诚实性"与"一行修复"的贡献，我们应把它扩展为形式化梯度的 dose-response 曲线（每级梯度 × agent 检出/虚报 × API 诚实错误率），而非重复二值对比。
2. **纳入形式化的推理成本维度**：借 2408.02442 的发现，把"更强 schema 约束是否损害 agent 规划/推理"作为第二个因变量——这把工程直觉变成科学问题。
3. **区分约束可执行性来源**：SilentProbe 显示关键是"机器可校验"，建议细分：静态可校验（枚举/正则）vs 需服务端状态的校验（范围依赖前序调用结果），后者可能是静默失败残留区。
4. **指标上直接对齐四类失效谱系**：格式错误率、参数幻觉率、静默失败率、虚报成功率，用同一受控平台测，形成可比矩阵。
5. **实验平台可复用 MCP 生态**：用 MCP server 包一层可控 API（仿 MCP-Bench），避免自建聚合层；SilentProbe 已开源 perturbation sets 与 transcripts 可作种子。
6. **虚报行为值得单独建模**：41% 虚报率 + 12% 编造数字是 agent-用户信任问题的直接证据，可作为独立子研究（形式化干预能否降低虚报而不只是降低失败）。

## 引用清单

- SilentProbe: Measuring Silent Failure in Production APIs Used as Agent Tools — arXiv:2609.00035
- τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains — arXiv:2406.12045
- τ²-Bench: Evaluating Conversational Agents in a Dual-Control Environment — arXiv:2506.07982
- BFCL: From Tool Use to Agentic Evaluation of LLMs — ICML 2025, https://gorilla.cs.berkeley.edu/leaderboard.html
- ToolSandbox — arXiv:2408.04682
- MCP-Bench — arXiv:2508.20453
- MCPVerse — arXiv:2508.16260
- Let Me Speak Freely? Impact of Format Restrictions on LLM Performance — arXiv:2408.02442
- Gorilla — arXiv:2305.15334
- ToolLLM — arXiv:2307.16789
- MCP 协议规范（Anthropic, 2024）— https://modelcontextprotocol.io

