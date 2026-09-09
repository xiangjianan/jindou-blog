---
title: "如何让 AI Agent 自动学会新技能？——从 EvoSkills 看协同进化"
slug: "tutorial-agent-skill-evolution"
excerpt: "---"
category: "教程"
tags:
  - AI
  - LLM Agent
  - 技能进化
  - 教程
  - 早期文章
published: true
createdAt: "2026-04-04 00:00:00"
updatedAt: "2026-04-04 00:00:00"
postId: 121
---

# 如何让 AI Agent 自动学会新技能？——从 EvoSkills 看协同进化

> 🐱 金豆教学 · 2026-04-04 · 约 2500 字 · 阅读时间 ~8 分钟

---

## 🎯 一个不太恰当但很好用的比喻

想象你刚入职一家公司，带你的前辈甩给你一本《新人手册》，说："照着做就行。"

你翻开一看，上面写着："处理用户投诉时，先安抚情绪，再记录问题，最后给出解决方案。"

听起来很对？但你实际操作时发现——有的客户越安抚越生气，有的问题根本没法按"记录→解决"的流程走，还有些特殊情况手册里完全没提。

这就是 AI Agent 当前的处境。

我们给 Agent 写了各种 prompt、工具说明、操作指南（这些统称为 "skill"），然后指望它照着做就行。问题是：**人类觉得"显然应该这么做"的流程，AI 可能并不好使。** 就像那本新人手册——写手册的人和用手册的人，认知模型根本不一样。

那怎么办？总不能让 AI 自己写手册吧？

**还真有人这么干了。** 而且效果出奇的好。

---

## 🧩 什么是 Agent Skill？

先统一一下概念。在 AI Agent 的世界里，一个 "Skill" 不是简单的一句话指令，而是**一个结构化的技能包**，通常包含：

- **工作流指令**：告诉 Agent "先做 A，再做 B，如果 C 出现就走 D 路径"
- **可执行脚本**：具体的代码或工具调用逻辑
- **参考材料**：领域知识、格式模板、注意事项

你可以把它理解为一个微型的 SOP（标准操作流程）。比如"从网页提取结构化数据"就是一个 skill，"生成并执行数据分析报告"又是一个。

Anthropic 在 2025 年提出了这个概念，并且提供了一个手工编写的 skill 库。但问题也随之而来：

1. **写 skill 很贵**——需要领域专家 + AI 工程师协同
2. **人写的 skill 不一定对 AI 有效**——人机认知不对齐
3. **新任务不断涌现**——不可能每个都人工写

于是，一个很自然的想法出现了：

> **能不能让 Agent 自己生成、自己验证、自己改进 skill？**

---

## ⚔️ 对抗验证：自己给自己打分是不靠谱的

"自己改进自己"这个想法听起来很美，但有一个致命的问题：**自欺欺人**。

你写过作文自己改吗？读第一遍觉得"写得不错"，读第三遍还是觉得"还行吧"，但其实漏洞百出——因为你陷入了确认偏误（confirmation bias），你会不自觉地放过自己的错误。

AI 也一样。如果让同一个 LLM 既生成 skill 又验证 skill，它会倾向于认为自己写的东西没问题。这在机器学习里叫 **information leakage**（信息泄露），是让模型过拟合的元凶之一。

EvoSkills 的解决方案极其优雅：**把生成和验证完全分开，变成两个独立的"角色"，让它们对抗起来。**

这就像编程里的**代码审查**（Code Review）：写代码的人和 review 代码的人不能是同一个人。如果你写完代码自己给自己 approve，那 review 就形同虚设。

---

## 🔄 EvoSkills 的三阶段协同进化

EvoSkills 的核心框架包含两个角色，三个阶段：

### 两个角色

| 角色 | 职责 | 关键约束 |
|------|------|----------|
| **Skill Generator（技能生成器）** | 生成和修改 skill | 只能看到任务需求和之前的反馈 |
| **Surrogate Verifier（代理验证器）** | 生成测试用例、评判 skill 质量 | **完全看不到 Generator 的代码** |

注意那个"关键约束"——Verifier 看不到 Generator 生成了什么代码，只能看到"这个 skill 跑出来的结果对不对"。这就像考试：判卷老师只看答案，不看你是怎么算的。

### 三个阶段

```
┌─────────────────────────────────────────────────┐
│              EvoSkills 协同进化流程                │
├─────────────────────────────────────────────────┤
│                                                 │
│  📝 阶段一：生成（Generate）                       │
│  ┌──────────────┐                               │
│  │   Generator  │ ──→ 根据任务描述生成 Skill       │
│  │              │ ──→ 执行 Skill，产生输出          │
│  └──────┬───────┘                               │
│         │ 输出结果                               │
│         ▼                                       │
│  🧪 阶段二：对抗（Adversarial Verify）             │
│  ┌──────────────┐                               │
│  │   Verifier   │ ──→ 独立生成测试断言             │
│  │  (看不到代码) │ ──→ 检查输出是否通过测试         │
│  └──────┬───────┘                               │
│         │                                       │
│         ├── ❌ 测试失败 ──→ 保持测试，反馈诊断      │
│         │                  给 Generator 修改      │
│         │                                       │
│         ├── ✅ 代理测试全过 ──→ 调用 Oracle 检验    │
│         │                        │              │
│         │                   ┌────┴────┐         │
│         │                   │         │         │
│         │                 ❌         ✅          │
│         │              Oracle      进化完成！     │
│         │              失败                    │
│         │                │                     │
│         │                ▼                     │
│         │  🔬 阶段三：进化（Evolve）               │
│         │  ┌──────────────┐                    │
│         │  │   Verifier   │ ──→ 升级测试集       │
│         │  │   升级测试    │ ──→ 生成更多样、     │
│         │  └──────────────┘    更刁钻的测试       │
│         │                                       │
│         └─────→ 回到阶段一，继续迭代              │
│                                                 │
└─────────────────────────────────────────────────┘
```

让我用人话解释一下这三阶段：

**阶段一：生成** — Generator 看到一个任务（比如"从网页提取价格信息"），凭本事写出一个 skill 包，然后跑一遍看看输出什么。

**阶段二：对抗验证** — Verifier 是一个完全独立的 LLM 会话，它不知道 Generator 写了什么代码，只看到任务需求和输出结果。它的工作是"出考题"：生成一系列测试断言来检验输出是否正确。

这里有个精妙的设计：
- 如果 Verifier 的测试发现了问题（测试失败），Generator 会收到诊断反馈去修改 skill，但**测试题目不变**——确保你真的修好了这个问题，而不是碰巧过了另一道题。
- 如果 Verifier 的测试全过了，但一个隐藏的 **Oracle**（标准答案）发现输出还是不对，那怎么办？EvoSkills 只返回一个 "pass/fail" 信号，**不告诉 Verifier 哪里错了**。这迫使 Verifier 自己升级测试集——出更难、更刁钻的题。

**阶段三：进化** — Verifier 升级完测试后，Generator 拿着新测试再次尝试。就这样，生成器和验证器交替提升，skill 的质量螺旋上升。

这就是"协同进化"——就像捕食者和猎物互相逼迫对方变强。测试越难，skill 就得越好；skill 越好，测试也得更难才能发现问题。

---

## 💻 代码示例：最小化的 Skill 进化循环

下面用 Python 伪代码展示一个极简版本。别太纠结实现细节，感受一下这个循环的思路就好：

```python
import llm_call  # 假设的 LLM 调用库

def evolve_skill(task_description, max_rounds=5):
    """让 skill 自动进化"""
    
    # 初始化：Generator 和 Verifier 是两个独立的对话
    generator = llm_call.Session("claude-opus")  # 生成器会话
    verifier = llm_call.Session("claude-opus")   # 验证器会话（隔离！）
    
    skill = None
    test_suites = []  # 验证器积累的测试集
    
    for round in range(max_rounds):
        print(f"\n🔄 进化第 {round + 1} 轮")
        
        # ── 阶段一：生成 ──
        if skill is None:
            skill = generator.generate(
                f"为以下任务创建一个 skill:\n{task_description}"
            )
        else:
            # 根据反馈修改 skill
            skill = generator.revise(
                f"上次测试反馈:\n{feedback}\n请修改 skill 解决这些问题"
            )
        
        # 执行 skill，获取输出
        output = execute_skill(skill)
        
        # ── 阶段二：对抗验证 ──
        # Verifier 看不到 skill 代码！只看任务和输出
        test_result = verifier.evaluate(
            task=task_description,
            output=output,
            existing_tests=test_suites
        )
        
        if test_result.all_passed:
            # 代理测试全过，用 Oracle 做最终检查
            oracle_result = oracle_check(task_description, output)
            
            if oracle_result.passed:
                print("✅ 进化完成！Skill 通过了所有检验。")
                return skill
            else:
                # Oracle 失败，但只返回 pass/fail，不暴露细节
                # 这迫使 Verifier 升级测试
                print("⚠️ Oracle 发现问题，Verifier 升级测试中...")
                new_tests = verifier.upgrade_tests(
                    task=task_description,
                    signal="fail",  # 只告诉它"你漏了"
                    hint=None       # 不给任何提示！
                )
                test_suites.extend(new_tests)
                feedback = "代理测试通过但质量仍不达标，需要更全面的处理"
        
        else:
            # 代理测试失败，诊断反馈驱动修改
            # 注意：测试题目不变，确保真的修了问题
            feedback = test_result.diagnostics
        
        # 继续下一轮...
    
    print("🏁 达到最大迭代轮次，返回当前最优 skill")
    return skill


# 实际调用
task = "从任意电商网页中提取商品名称、价格、销量信息，"
      "输出为结构化 JSON 格式"

final_skill = evolve_skill(task, max_rounds=5)
```

关键点再强调一下：
1. **`generator` 和 `verifier` 是两个独立的 Session** —— 信息隔离，防止确认偏误
2. **Oracle 只返回 pass/fail** —— 防止验证器过拟合到特定测试
3. **测试失败时题目不变** —— 确保 Generator 真正修复了问题

---

## 🤔 延伸思考：这个思路还能用在哪里？

EvoSkills 的协同进化思路不仅限于 Agent Skill，它背后是一个更通用的原则：**用独立的、对抗性的反馈来驱动质量提升。** 想想看，这个原则在哪些地方也能用：

### 1. 自动化测试生成
与其让开发者手写单元测试，不如让一个 AI 根据 code 变更自动生成测试，另一个 AI 尝试找出测试的盲区。两者对抗，测试覆盖率螺旋上升。

### 2. Prompt Engineering
写 prompt 和测试 prompt 的可以是两个独立的 LLM 会话。一个负责写最优 prompt，另一个负责构造 edge case 来挑战它。

### 3. 教育评估
出题老师和学生（或 AI tutor）之间的博弈本身就是一种协同进化。考试题目越难，学生的能力就得越强；学生越强，题目也得不断升级。

### 4. 安全审计
红队（攻击者）和蓝队（防御者）的对抗演练，本质上就是安全领域的协同进化。EvoSkills 把这个思路搬到了 skill 质量验证上。

### 5. 甚至……写教程？
（咳咳）也许可以用一个 AI 写教程，另一个 AI 挑毛病，第三个 AI 扮演"新手读者"来检验教程是否真的容易理解？嗯，这个想法不错，下次试试。

---

## 💎 总结

EvoSkills 的核心洞察其实很朴素：

> **不要让同一个人既当运动员又当裁判。**

把技能生成和技能验证拆成两个完全独立的角色，让它们在对抗中共同进化。这个原则简单到有点"废话"，但在实践中效果惊人——自动进化的 skill 在 87 个任务上达到了 71.1% 的通过率，比人工编写的 skill 高出 17.6 个百分点。

更有趣的是，这些 skill **可以迁移到其他 LLM 上**。用 Claude 进化出来的 skill，给 GPT、Qwen、DeepSeek 用照样有效。这说明进化的 skill 编码的不是某个模型的"偏好"，而是任务本身的**结构化知识**。

这让我想起一句话：**好的工具不应该绑定使用者。** 一个真正有用的 SOP，不管谁来执行都应该有效。

而 EvoSkills 让我们看到，AI 不仅能使用工具，还能**创造工具**——并且创造出来的工具，甚至比人类写的还好用。

---

*参考论文：Zhang et al., "EvoSkills: Self-Evolving Agent Skills via Co-Evolutionary Verification", arXiv:2604.01687, 2026*
