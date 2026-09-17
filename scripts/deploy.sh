#!/usr/bin/env bash
# 心跳博客发布唯一入口：隧道 → 构建（看门狗）→ 产物校验 → 部署 → 线上校验。
# 任何一步失败都立即退出；坏构建绝不会被发布上线（2026-09 两次线上事故后的修复）。
# 用法: bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "[1/5] 确保数据库隧道存活"
./scripts/mysql-tunnel.sh

echo "[2/5] 构建（预渲染全部路由，DB 不可达会直接失败）"
# 看门狗：mariadb 连接池按设计常驻 ≥1 条连接，nuxt build 打完产物后进程不会自然退出。
# 以日志里的 "Build complete!" 为完成标志：宽限 12 秒后仍未退出就收尾进程；
# 成功与否不看退出码，以完成标志 + verify-dist 为准。
BUILD_LOG=$(mktemp)
npm run build >"$BUILD_LOG" 2>&1 &
BUILD_PID=$!
START_TS=$(date +%s)
while kill -0 "$BUILD_PID" 2>/dev/null; do
  if grep -q "Build complete!" "$BUILD_LOG" 2>/dev/null; then
    for _ in 1 2 3 4 5 6; do
      kill -0 "$BUILD_PID" 2>/dev/null || break
      sleep 2
    done
    if kill -0 "$BUILD_PID" 2>/dev/null; then
      echo "   构建完成但进程被连接池挂住，按预案收尾"
      kill $(pgrep -P "$BUILD_PID" 2>/dev/null) "$BUILD_PID" 2>/dev/null || true
      sleep 1
    fi
    break
  fi
  NOW=$(date +%s)
  if [ $((NOW - START_TS)) -gt 900 ]; then
    echo "   构建超过 15 分钟未完成，终止（无完成标志即失败）"
    kill $(pgrep -P "$BUILD_PID" 2>/dev/null) "$BUILD_PID" 2>/dev/null || true
    FAILED_BY_TIMEOUT=1
    break
  fi
  sleep 5
done
wait "$BUILD_PID" 2>/dev/null || true
tail -n 30 "$BUILD_LOG"
if ! grep -q "Build complete!" "$BUILD_LOG"; then
  echo "❌ 构建失败或未完成（详见上方日志），不发布"
  exit 1
fi

echo "[3/5] 校验构建产物"
node scripts/verify-dist.mjs

echo "[4/5] 部署到 Cloudflare Pages"
npx wrangler pages deploy ./.output/public --project-name jindou-blog --branch main --commit-dirty=true

echo "[5/5] 线上校验"
node scripts/verify-live.mjs

echo "✅ 部署完成且线上校验通过"
