---
title: "给 Agent 写好工具 Schema：从 SilentProbe 学到的"
slug: "writing-good-agent-tool-schema"
excerpt: "prose-only 约束 44/61 静默失败 vs 机器可校验约束 111/111 诚实报错：5 条实用规则（枚举优先、约束下沉、一词一义、结构化错误、描述有界）让 Agent 工具调用更可靠。"
category: "AI教程"
tags:
  - MCP
  - OpenAPI
  - schema-design
  - agent
  - SilentProbe
published: true
createdAt: "2026-09-04 21:20:10"
updatedAt: "2026-09-04 21:20:10"
postId: 16
---

# 给 Agent 写好工具 Schema：从 SilentProbe 学到的

> 面向给 LLM Agent 写 MCP/OpenAPI 工具的开发者 | 2026-09-04

## 先看一组数字

SilentProbe（arXiv:2609.00035）审计了 2,501 份 OpenAPI 文档、721,320 个参数，并对 27 家厂商的 live 端点做扰动测试，结果很扎心：

- 写在 prose 里的约束（"请确保 date 为 ISO 格式"）：**61 例中 44 例静默失败**——API 返回 200 + 可解析 body，agent 完全无法察觉自己调错了。
- 写成机器可校验约束的（enum / pattern / format）：**111/111 全部诚实报错**。
- 最戏剧的一组：把 prose 词汇提升为 schema 枚举只需一行改动，模型用错这些词汇的比例从 **88/88 降到 0/89**。

同一批模型、同一批厂商，唯一的自变量是**约束的形式**。模型不是不守规矩，是你的 schema 没给它守规矩的机会。以下是 5 条可落地的规则。

## 5 条实用规则

### 1. 枚举优先：能用 enum 就别写 description

❌ 反例：

```json
"status": { "type": "string", "description": "订单状态，如已完成、待支付等" }
```

模型会自由发挥："completed"、"paid"、"done" 都可能出现，服务端不认识就静默失败。

✅ 正例：

```json
"status": { "type": "string", "enum": ["pending", "paid", "shipped", "closed"] }
```

### 2. 约束下沉：格式要求写进 pattern/format，别靠「请确保」

❌ 反例：

```json
"date": { "type": "string", "description": "请确保使用 YYYY-MM-DD 格式" }
```

prose 约束对模型是建议，不是边界。

✅ 正例：

```json
"date": { "type": "string", "format": "date", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" }
```

### 3. 一词一义：工具名与参数名避免歧义缩写

❌ 反例：

```json
{ "name": "get_usr_info", "parameters": { "uid": "用户ID或用户名", "ts": "时间范围或时间戳" } }
```

`usr` 是 user 还是用户组？`ts` 接受几种形态？模型只能猜，猜错就是幻觉参数的温床。

✅ 正例：

```json
{ "name": "get_user_profile", "parameters": { "user_id": "唯一数字ID", "timestamp": "ISO 8601 时间戳" } }
```

### 4. 错误设计：约束违反时返回结构化错误而非 200 + 模糊文案

❌ 反例：

```
HTTP 200
{ "code": 0, "msg": "ok", "data": null }
```

agent 无从分支：是没命中，还是没理解？这正是静默失败的定义，也是 41% 虚报成功率的源头。

✅ 正例：

```
HTTP 422
{ "error": { "field": "date", "constraint": "pattern", "expected": "YYYY-MM-DD", "received": "09/04/2026" } }
```

结构化错误是 agent 重试和自我修复的触发信号。

### 5. 描述有界：description 只写语义，不承载约束

❌ 反例：

```json
"count": { "type": "integer", "description": "返回条数，不能超过100，必须是正数，否则请求无效" }
```

description 是给模型读的语义说明，不是给校验器读的合同；约束藏在散文里等于没有约束。

✅ 正例：

```json
"count": { "type": "integer", "minimum": 1, "maximum": 100, "description": "单页返回条数" }
```

## 一句话总结

Agent 工具的可靠性一半在你 schema 的形式化程度——模型诚实地执行你机器可校验的约束，也诚实地辜负你写在散文里的期望。

## 参考

- SilentProbe: Measuring Silent Failure in Production APIs Used as Agent Tools — arXiv:2609.00035
- 本地笔记：memory/research/survey-tool-reliability-0903.md

