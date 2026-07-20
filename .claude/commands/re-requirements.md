---
description: 指定ドメインの要件定義書を生成する
argument-hint: <domain> (例 rorder, sales, stock)
---

AGENTS.md と docs/templates/要件定義書_template.md を読み込み、
業務ドメイン $ARGUMENTS のソース（action/form/service/entity/SQL/JSP）を静的解析して、
要件定義書を **日本語** で作成する。

出力先: `docs/_generated/claude/requirements/$ARGUMENTS_要件定義書.md`

ルール:
- ファイルパス・クラス名・テーブル名で事実を裏付ける
- 推測は「（推測）」と明記
- WEB/ DB/ のソースは改変しない
