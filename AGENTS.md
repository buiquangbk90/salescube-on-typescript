# AGENTS.md — SalesCube リバースエンジニアリング

> このファイルは Claude Code / Cursor / Devin の **共通の指示書** です。
> 3 つのエージェントはこの内容を基準に、それぞれ独立して作業します。
> 規約を追加・変更したら、このファイルを更新してコミットしてください。

## 1. プロジェクト概要

- **名称**: SalesCube — オープンソースの販売管理システム（株式会社アークシステム由来）
- **ライセンス**: AGPLv3
- **目的（本作業）**: 既存ソースコードをリバースエンジニアリングし、
  **要件定義書・技術仕様書・設計書**を作成する。

## 2. 技術スタック

- 言語: **Java**（サーバサイド）、JSP + JavaScript（jQuery UI）
- フレームワーク: **Seasar2**（SAStruts / S2JDBC / S2Container / DI・AOP）
- DI 設定: `WEB/SalesCube/src/main/resources/*.dicon`
- DB: **PostgreSQL**（`DB/sql`, `DB/batch` にDDL・マスタ・ストアドプロシージャ・バッチ）
- 帳票: **JasperReports**（`WEB-INF/report_template`）
- ビルド: root に `pom.xml`/`build.xml` は未確認（**本作業は静的解析のみ**。実行環境は構築しない）

## 3. ソース構成マップ

```
DB/
  sql/insertmaster/   … マスタ投入SQL（PRODUCT_MST, CATEGORY_MST, USER_MST …）
  sql/update/         … スキーマ更新SQL
  batch/              … バッチ・ストアドプロシージャ（顧客ランク, 在庫指標更新 …）
WEB/SalesCube/src/main/
  java/jp/co/arkinfosys/
    action/   … SAStruts アクション（画面/リクエスト処理）
    form/     … 画面フォーム
    dto/      … データ転送オブジェクト
    entity/   … S2JDBC エンティティ（テーブルマッピング）
    service/  … 業務ロジック
    common/   … 共通ユーティリティ・定数
    taglib/   … カスタムJSPタグ
  webapp/WEB-INF/view/  … JSP 画面
  resources/*.dicon     … Seasar2 DI 設定
```

### 業務ドメイン（action/service のサブパッケージ）

| パッケージ | 業務 | 日本語 |
|---|---|---|
| `sales`    | 売上         | 売上伝票 |
| `rorder`   | 受注         | 受注伝票 |
| `porder`   | 発注         | 発注伝票 |
| `purchase` | 仕入         | 仕入伝票 |
| `estimate` | 見積         | 見積伝票 |
| `bill`     | 請求         | 請求処理 |
| `deposit`  | 入金         | 入金処理 |
| `payment`  | 支払         | 支払処理 |
| `stock`    | 在庫         | 在庫管理 |
| `master`   | マスタ       | 各種マスタ保守 |
| `report`   | 帳票         | 帳票出力 |
| `setting`  | 設定         | システム設定 |

## 4. リバースエンジニアリングの進め方

1. **ドメイン単位**で解析する（例: 受注 `rorder` → action → service → entity → SQL → JSP）。
2. 各ドメインについて、次の3種の成果物を作る:
   - **要件定義書** … 業務要件・画面・機能一覧・業務フロー
   - **技術仕様書** … クラス構成・DI・DBアクセス・トランザクション・外部連携
   - **設計書** … 画面設計・テーブル定義・シーケンス・帳票レイアウト
3. 事実はソースから裏付ける。**ファイルパス・クラス名・テーブル名を必ず引用**する。
4. 推測が混じる場合は「（推測）」と明記する。

## 5. 成果物の規約（重要）

- **言語**: すべて **日本語**で記述する。
- **テンプレート**: `docs/templates/` の3テンプレートに従う。
- **出力先（ツールごとに分離）**:
  - Claude Code → `docs/_generated/claude/{requirements,technical,design}/`
  - Cursor      → `docs/_generated/cursor/{requirements,technical,design}/`
  - Devin       → `docs/_generated/devin/{requirements,technical,design}/`
- ファイル名は `<ドメイン>_<種別>.md`（例: `rorder_要件定義書.md`）。
- 他ツールの出力ディレクトリには**書き込まない**。

## 6. 制約

- ソースコード本体（`WEB/`, `DB/`）は**改変しない**（解析のみ）。
- 生成物は自分のツール用ディレクトリのみに書く。
- ライセンスは AGPLv3。コードの取り扱いに注意する。
