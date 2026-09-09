#!/usr/bin/env bash
# 确保 MySQL SSH 隧道存活（阿里云 aliyun:3306 -> 本地 3307）
# 心跳构建/写库前必须先跑这个脚本。
set -e
if nc -z 127.0.0.1 3307 >/dev/null 2>&1; then
  # 端口在，验证真的能用（防止半死隧道）
  if mysql --defaults-extra-file="$HOME/.myblog.cnf" -e "SELECT 1;" >/dev/null 2>&1; then
    echo "tunnel OK"
    exit 0
  fi
  pkill -f "ssh -f -N -L 3307" 2>/dev/null || true
  sleep 1
fi
ssh -f -N -L 3307:localhost:3306 -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 aliyun
sleep 1
mysql --defaults-extra-file="$HOME/.myblog.cnf" -e "SELECT 1;" >/dev/null
echo "tunnel established"
