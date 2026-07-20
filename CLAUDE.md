# CLAUDE.md

このプロジェクトの共通指示は **[AGENTS.md](./AGENTS.md)** を参照すること（必読）。
以下は Claude Code 固有の運用ルール。

## 出力先
- 生成物は必ず `docs/_generated/claude/{requirements,technical,design}/` に書く。
- 他ツール（cursor / devin）のディレクトリには一切書き込まない。

## スラッシュコマンド
- `/re-requirements <domain>` … 要件定義書を生成
- `/re-technical <domain>` … 技術仕様書を生成
- `/re-design <domain>` … 設計書を生成

`<domain>` は AGENTS.md の業務ドメイン表のキー（例: `rorder`, `sales`, `stock`）。

## 作業方針
- ソースは静的解析のみ。`WEB/` `DB/` は改変しない。
- 事実はファイルパス・クラス名・テーブル名で裏付ける。推測は「（推測）」と明記。
- テンプレートは `docs/templates/` に従う。
- 日本語で記述する。

## このツール用の作業ブランチ
- worktree: `.worktrees/claude`（branch `re/claude`）
