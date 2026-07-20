---
description: 指定ドメインの設計書を生成する
argument-hint: <domain> (例 rorder, sales, stock)
---

AGENTS.md と docs/templates/設計書_template.md を読み込み、
業務ドメイン $ARGUMENTS のソース（action/form/service/entity/SQL/JSP）を静的解析して、
設計書を **日本語** で作成する。

出力先: `docs/_generated/claude/design/$ARGUMENTS_設計書.md`

ルール:
- ファイルパス・クラス名・テーブル名で事実を裏付ける
- 推測は「（推測）」と明記
- WEB/ DB/ のソースは改変しない
