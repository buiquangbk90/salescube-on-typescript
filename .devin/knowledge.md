# Devin Knowledge — SalesCube

このファイルの内容を Devin の Knowledge にコピーして登録する。

## プロジェクト
SalesCube = オープンソース販売管理システム。Java / Seasar2(SAStruts + S2JDBC) / JSP / PostgreSQL / JasperReports / AGPLv3。
現在の作業は既存コードのリバースエンジニアリングによる日本語ドキュメント作成。

## 出力規約
- 生成物は `docs/_generated/devin/{requirements,technical,design}/` にのみ書く。
- 他ツール（claude / cursor）の出力ディレクトリには書き込まない。
- ソース `WEB/` `DB/` は改変しない（静的解析のみ）。
- 出力は日本語。`docs/templates/` のテンプレートに従う。
- 事実はファイルパス・クラス名・テーブル名で裏付け、推測は「（推測）」と明記。

## ソース構成
- `WEB/SalesCube/src/main/java/jp/co/arkinfosys/` に action/form/dto/entity/service/common/taglib。
- DI 設定は `WEB/SalesCube/src/main/resources/*.dicon`。
- DB は `DB/sql`（DDL・マスタ）と `DB/batch`（バッチ・ストアドプロシージャ）。

## 業務ドメイン
sales(売上) / rorder(受注) / porder(発注) / purchase(仕入) / estimate(見積) /
bill(請求) / deposit(入金) / payment(支払) / stock(在庫) / master(マスタ) / report(帳票) / setting(設定)
