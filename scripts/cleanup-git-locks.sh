#!/usr/bin/env bash
# Cowork サンドボックスが残した stale な .lock を除去し、worktree のロックを解除する。
# 通常のターミナルで一度だけ実行してください。
set -uo pipefail
cd "$(dirname "$0")/.."

echo "==> stale lock を削除"
rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock
rm -f .git/refs/heads/re/claude.lock .git/refs/heads/re/cursor.lock .git/refs/heads/re/devin.lock
rm -f .git/worktrees/claude/HEAD.lock .git/worktrees/cursor/HEAD.lock .git/worktrees/devin/HEAD.lock

echo "==> worktree のロック状態を解除"
for tool in claude cursor devin; do
  git worktree unlock ".worktrees/${tool}" 2>/dev/null || true
done

echo "==> 結果"
git worktree list
echo "残っている .lock (空なら OK):"; find .git -name '*.lock'
