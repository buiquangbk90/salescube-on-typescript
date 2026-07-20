# AI マルチエージェント環境 — SalesCube リバースエンジニアリング

Claude Code / Cursor / Devin の 3 エージェントを **同一リポジトリ上で独立して** 動かし、
既存ソースをリバースエンジニアリングして日本語ドキュメント（要件定義書・技術仕様書・設計書）を作成するための環境です。

## 構成

| ファイル / ディレクトリ | 役割 | 対象ツール |
|---|---|---|
| `AGENTS.md` | 共通の指示書（3 ツールが読む唯一の一次情報） | 全ツール |
| `CLAUDE.md` + `.claude/commands/` | Claude 固有＋スラッシュコマンド | Claude Code |
| `.cursor/rules/*.mdc` + `.cursorignore` | Cursor のルール | Cursor |
| `.devin/README.md` + `.devin/knowledge.md` | Devin 用の手順と Knowledge | Devin |
| `docs/templates/` | 3 種の日本語ドキュメントテンプレート | 全ツール |
| `docs/_generated/<tool>/` | ツール別の出力先（衝突防止） | 全ツール |
| `scripts/setup-worktrees.sh` | branch + worktree による隔離をセットアップ | — |

## セットアップ（1 回だけ / 通常のターミナルで実行）

> 注: この環境（サンドボックス）は `.git` への書き込みが禁止されているため、
> commit と worktree 作成は下記スクリプトをご自身のターミナルで実行してください。

```bash
cd "<このリポジトリ>"
bash scripts/setup-worktrees.sh
```

これにより:
1. 共通設定が `master` にコミットされる
2. `re/claude` `re/cursor` `re/devin` の 3 ブランチと、
   `.worktrees/{claude,cursor,devin}` の 3 作業ディレクトリが作られる（`.gitignore` 済み）

## 使い方

- **Claude Code**: `.worktrees/claude` を開く。`/re-requirements rorder` のようにスラッシュコマンドで生成。
- **Cursor**: `.worktrees/cursor` を開く。`.mdc` ルールが自動適用される。
- **Devin**: リポジトリを `re/devin` ブランチで接続。`.devin/knowledge.md` を Devin の Knowledge に登録。

各ツールは自分の worktree で作業し、`docs/_generated/<tool>/` にのみ出力するため、
3 つを同時に走らせても衝突しません。最後に 3 ブランチの出力を比較・マージできます。

## 進め方の推奨

業務ドメイン単位（受注 `rorder`、売上 `sales`、在庫 `stock` …）で
「要件定義書 → 技術仕様書 → 設計書」の順に作成すると、依存関係を追いやすいです。
詳細は `AGENTS.md` を参照。
