---
title: "AI Agent 框架全景知识体系（2026）"
slug: "ai-agent-landscape-2026"
excerpt: "从 ReAct 到 Computer Use，从单智能体到多智能体协作——一张图看清 AI Agent 技术栈的完整演进脉络"
category: "研究"
tags:
  - AI
  - Agent
  - 知识体系
  - 框架
  - 教程
  - 早期文章
published: true
createdAt: "2026-05-20 00:00:00"
updatedAt: "2026-05-20 00:00:00"
postId: 51
---

# AI Agent 框架全景知识体系

> 🐱 金豆整理 · 2026-05-20

## 一、总览：Agent 的五层架构

```
AI Agent
├── 1️⃣ 推理引擎（Reasoning）— 如何"想"
├── 2️⃣ 工具使用（Tool Use）— 如何"做"
├── 3️⃣ 记忆系统（Memory）— 如何"记"
├── 4️⃣ 编排框架（Orchestration）— 如何"协调"
└── 5️⃣ 交互界面（Interaction）— 如何"用"
```

---

## 二、推理引擎：从 ReAct 到推理模型

```
推理引擎
├── 经典范式
│   ├── ReAct (2022) — 推理 + 行动交替循环
│   ├── Chain-of-Thought (2022) — 思维链
│   └── Plan-and-Execute (2023) — 先规划再执行
│
├── 推理模型（2024-2026）
│   ├── OpenAI o1/o3 — 隐式思维链
│   ├── DeepSeek-R1 — GRPO 算法，开源推理
│   ├── DeepSeek-V3.1 — Think/Non-Think 双模式
│   └── Claude Sonnet 4.6 — 增强规划能力
│
└── 进阶策略
    ├── Tree-of-Thought — 树状搜索多路径
    ├── Reflexion — 自我反思
    └── SAGE (2026) — 多智能体自博弈推理
```

**演进脉络：** Prompt 引导 → 隐式思维链（RL）→ 混合推理 → 多智能体协作推理

---

## 三、工具使用：从 Function Calling 到 Computer Use

```
工具使用
├── Function Calling (2023)
│   └── OpenAI / Anthropic / DeepSeek 结构化工具调用
│
├── 协议标准化（2024-2026）
│   ├── MCP — 模型↔工具通信协议（Anthropic → Linux Foundation）
│   ├── A2A — Agent↔Agent 通信协议（Google）
│   └── AGENTS.md — 仓库级 Agent 指令（OpenAI）
│
└── Computer Use（最热方向）
    ├── Claude Computer Use — 桌面控制，无需预编程
    ├── Google Project Mariner — 浏览器 Agent
    └── OpenAI Operator/Codex — 后台自动执行
```

**演进脉络：** 硬编码 API → Function Calling → MCP 工具生态 → Computer Use（AI 直接操作电脑）

---

## 四、记忆系统

```
记忆
├── 短期 — 上下文窗口（4K→2M tokens）
├── 长期
│   ├── RAG — 检索增强生成
│   ├── MemPalace (2026) — 空间隐喻记忆
│   ├── FORGE (2026) — 零微调自演化记忆
│   └── CLEAR (2026) — 对比学习训练上下文顾问
└── 工作记忆 — Think tokens / Scratchpad
```

---

## 五、编排框架对比

| 框架 | 驱动方式 | 适合场景 | 生产就绪 |
|------|---------|---------|---------|
| **LangGraph** | 图驱动 | 复杂工作流 | ⭐⭐⭐⭐⭐ |
| **CrewAI** | 角色驱动 | 业务流程 | ⭐⭐⭐⭐ |
| **AutoGen** | 对话驱动 | 研究/原型 | ⭐⭐⭐ |
| **Dify** | 低代码 | 非技术用户 | ⭐⭐⭐⭐ |
| **OpenAI Agents SDK** | 厂商原生 | OpenAI 生态 | ⭐⭐⭐⭐ |

---

## 六、多智能体协作模式

- **顺序管道** — A→B→C 流水线
- **层级式** — Manager 分配任务
- **对等式** — Agent 平等协商
- **辩论式** — 多观点对抗取最优

通信：MCP（模型↔工具）+ A2A（Agent↔Agent）

---

## 七、关键时间线

| 时间 | 里程碑 |
|------|--------|
| 2022 | ReAct、Function Calling |
| 2023 | LangChain 生态爆发、Plan-and-Execute |
| 2024 | DeepSeek-R1、MCP 协议发布 |
| 2025 | A2A 协议、Computer Use 竞赛 |
| 2025.12 | MCP + AGENTS.md → Linux Foundation AAIF |
| 2026 | Claude Computer Use 开放、VS Agent Mode |

---

## 八、五大趋势

1. **协议标准化** — MCP + A2A 终结碎片化
2. **Computer Use** — 三大厂商竞逐，AI 直接操作电脑
3. **推理模型融入 Agent** — 按需深度推理（Think/Non-Think）
4. **记忆自演化** — 从 RAG 向自主改进的记忆系统演进
5. **多智能体生产化** — LangGraph + MCP 成为主流组合
