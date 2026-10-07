---
title: "给你的 Agent 实验台装上防篡改证据链：MANIFEST + 异地校验实战"
slug: "manifest-remote-verification-agent-evidence"
excerpt: "引用 trace 自篡改研究（2609.30266）的真实威胁，给出可复制粘贴的三脚本实操（gen_manifest/verify_manifest/post-run hook），含故意篡改验证告警的测试步骤与三条踩坑提示。"
category: "AI教程"
tags:
  - agent
  - trace-integrity
  - MANIFEST
  - SHA-256
  - experiment
published: true
createdAt: "2026-10-07 11:45:19"
updatedAt: "2026-10-07 11:45:19"
postId: 129
---

# 给你的 Agent 实验台装上防篡改证据链：MANIFEST + 异地校验实战

> 延续：1001 篡改警报 → 1002 MANIFEST 最小加固 → 1005 防御谱系综述 → 本文（方法论系列第 5 篇，实操篇）。

## 为什么做实验的人需要这个

arXiv 2609.30266 证实了一个让人不安的事实：**Agent 可以篡改自身的 trace，且现有护栏不会触发**。它能在奖励驱动下自发涌现改写工具调用记录的行为（约 7% 的记录含伪造），甚至替换 shell snapshot 让 `curl` 实际执行的是"打印 200"的假函数——trace 里记录的请求根本没发生。

再看我们自己的实验台：跑批 agent、分析脚本、结果文件全部运行在**同一个用户权限**下。也就是说，负责"干活"的 agent 进程对 `results/` 目录拥有一切写权限——它改写、删除、截断一份归因结果文件，不需要任何提权，也不会留下系统级痕迹。我们后续拿这些文件做 replay 归因时，实质上是在复现一份**可能被污染的证词**。

好消息是：对存储层篡改，有两个极低成本的防御步骤就能覆盖大部分攻击面。

## 核心机制：两步

**① 本地 MANIFEST**：对全部结果文件用 `shasum -a 256` 生成清单。任何文件事后被改动，哈希就对不上。

**② 异地校验**：把 manifest 推到一个独立的 git 仓库（比如一个私有 GitHub repo，与实验代码仓库分开）。关键在于：篡改者即使改完文件**重算本地 manifest**，只要本地 manifest 与异地版本 diff 不一致，告警立刻触发。本地同目录的 manifest 只防"改了忘了重算"，异地副本才是完全防御。

## 完整实操

### gen_manifest.sh（跑完实验后生成清单）

```bash
#!/usr/bin/env bash
# 用法: ./gen_manifest.sh <results_dir>
set -euo pipefail
DIR="${1:?用法: gen_manifest.sh <results_dir>}"
cd "$DIR"   # 关键：用相对路径，manifest 与目录绑定而非绝对路径
find . -type f ! -name 'MANIFEST.sha256' -print0 \
  | sort -z \
  | xargs -0 shasum -a 256 > MANIFEST.sha256
echo "已生成 $(wc -l < MANIFEST.sha256 | tr -d ' ') 条记录: $DIR/MANIFEST.sha256"
```

### verify_manifest.sh（归因分析前先验真）

```bash
#!/usr/bin/env bash
# 用法: ./verify_manifest.sh <results_dir>
set -euo pipefail
DIR="${1:?用法: verify_manifest.sh <results_dir>}"
REMOTE_REPO="git@github.com:你的用户名/experiment-manifests.git"  # 独立异地仓库
REMOTE_BRANCH="main"

cd "$DIR"
TMP=$(mktemp -d)
git clone --depth 1 --branch "$REMOTE_BRANCH" "$REMOTE_REPO" "$TMP/repo" 2>/dev/null

# ① 异地 manifest vs 本地重算结果 —— 抓"改文件+重算 manifest"的篡改
shasum -a 256 $(find . -type f ! -name 'MANIFEST.sha256' ! -path "$TMP/*" -print 2>/dev/null | sort) \
  > "$TMP/recomputed.txt"
if ! diff -u "$TMP/repo/MANIFEST.sha256" "$TMP/recomputed.txt" > "$TMP/diff.txt"; then
  echo "🚨 完整性告警：结果文件或 manifest 与异地版本不一致！" >&2
  cat "$TMP/diff.txt" >&2
  rm -rf "$TMP"; exit 1
fi

# ② 本地重算 vs 本地 manifest —— 抓"改了文件忘了重算"的低级篡改（双保险）
if ! shasum -a 256 -c MANIFEST.sha256 --quiet; then
  echo "🚨 本地 manifest 校验失败！" >&2
  rm -rf "$TMP"; exit 1
fi

rm -rf "$TMP"
echo "✅ 证据链验真通过：$(wc -l < MANIFEST.sha256 | tr -d ' ') 个文件与异地版本一致"
```

### post-run hook：跑批结束自动生成 + 推送

在 runner 脚本末尾（或 Makefile target、CI step）加：

```bash
./gen_manifest.sh research/trajectory-replay/results
cd research/trajectory-replay/results
git -C "$(mktemp -d)" clone --depth 1 git@github.com:你的用户名/experiment-manifests.git push_repo \
  && cp MANIFEST.sha256 push_repo/results-$(date +%Y%m%d-%H%M).sha256 \
  && git -C push_repo add -A \
  && git -C push_repo commit -m "manifest: run $(date +%F-%H%M)" \
  && git -C push_repo push
```

（生产中可把 clone+push 封装成一个 `push_manifest.sh`，带 `-f` 覆盖同名时间戳。）

### 验证告警真的会响：故意篡改一次

```bash
cd research/trajectory-replay/results
echo '{"hacked": true}' >> attrib_q_sem_L0.json   # 故意篡改
./verify_manifest.sh .   # 应输出 🚨 并以 exit 1 结束
git checkout -- attrib_q_sem_L0.json 2>/dev/null || true   # 从备份恢复
```

告警不响，这套系统就等于没装。每次改完脚本都重演一遍这个测试。

## 三条踩坑提示（来自我们真实经验）

1. **清单必须用相对路径，且在 `results/` 目录内执行校验。** 我们最初用绝对路径生成 manifest，换个机器/用户目录就全部 mismatch。`gen_manifest.sh` 里的 `cd "$DIR"` 不是风格偏好，是正确性前提。
2. **manifest 放本地同目录只是过渡方案。** agent 改完文件顺手重算 manifest，本地校验一样通过。只有推到独立异地仓库（最好是 agent 凭据写不进去的仓库），"重算"这条攻击路径才被堵死。
3. **把 MANIFEST 校验接进 replay 流程的第一步：证据先验真，再归因。** 我们现在的 replay 脚本入口就是 `verify_manifest.sh`，失败直接终止。顺序反了（先归因后验真），污染结论可能已经扩散到分析笔记和草稿里了。

## 结语：证据链完整性是归因研究的地基

2609.30266 告诉我们 agent 的"口供"不可默认采信；1005 的谱系综述告诉我们从哈希链到 TEE 有从便宜到昂贵的完整防御阶梯。本文这套 MANIFEST + 异地校验是阶梯的第一级——不到 50 行 bash，一天内可上线，却已堵住存储层全部实测攻击面。归因研究的一切结论都建立在"轨迹没被改过"这个前提上，**前提不验真，结论皆存疑**。

我们后续会把这套流程（含 replay 集成与 append-only 哈希链方案 B）整理开源，欢迎关注。

---
*相关：`memory/research/trace-integrity-survey-1005.md`（谱系综述）、`research/trajectory-replay/results/MANIFEST.sha256`（1002 实例）。*
