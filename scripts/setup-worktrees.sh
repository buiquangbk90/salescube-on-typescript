#!/usr/bin/env bash
# SalesCube — multi-agent (Claude/Cursor/Devin) の隔離環境をセットアップする。
# 通常のターミナルで一度だけ実行してください。
set -euo pipefail
cd "$(dirname "$0")/.."

# 直前の失敗で残ったロックがあれば除去
rm -f .git/index.lock 2>/dev/null || true

echo "==> 共通設定をコミット (branch: master)"
git add AGENTS.md CLAUDE.md .gitignore .claude .cursor .cursorignore .devin docs scripts
git commit -m "chore: setup multi-agent (Claude/Cursor/Devin) reverse-engineering environment" || echo "(コミット不要 or 既にコミット済み)"

echo "==> ツールごとの worktree を作成 (.worktrees/)"
mkdir -p .worktrees
for tool in claude cursor devin; do
  branch="re/${tool}"
  dir=".worktrees/${tool}"
  if git show-ref --verify --quiet "refs/heads/${branch}"; then
    echo "  - ${branch} は既に存在 → スキップ"
  else
    git worktree add "${dir}" -b "${branch}"
    echo "  - ${dir}  (branch ${branch}) を作成"
  fi
done

echo
echo "==> 完了。worktree 一覧:"
git worktree list
echo
echo "使い方:"
echo "  Claude Code : .worktrees/claude を開く"
echo "  Cursor      : .worktrees/cursor を開く"
echo "  Devin       : repo を re/devin ブランチで接続"
