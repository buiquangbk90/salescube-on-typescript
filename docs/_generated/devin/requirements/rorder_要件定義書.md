# 受注（rorder）ドメイン要件定義書

## 1. 業務概要

本ドキュメントは、SalesCube の受注（rorder）ドメインについて、ソースコードの静的解析に基づく業務要件をまとめたものです。
受注ドメインは、顧客からの受注を伝票単位で管理し、受注情報の登録・更新・削除、検索、一覧出力、および通販サイト等からのオンライン受注データ取込みを行う機能を提供します。受注伝票は「伝票（header）＋明細行（line）」の2階層構造を持ち、商品出荷までの進捗を管理します。

## 2. 関連画面

| No. | 画面名 | 主要ファイル | 概要 |
|-----|--------|-------------|------|
| 1 | 受注検索画面 | `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/searchROrder/search.jsp` | 受注伝票・明細行を条件で検索し、一覧表示する。Excel 出力も実施可能。 |
| 2 | 受注入力画面 | `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/inputROrder/inputROrder.jsp` | 受注伝票の新規登録・更新・削除、明細行の入力を行う。 |
| 3 | オンライン受注取込画面 | `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/importOnlineOrder/importOnlineOrder.jsp` | 通販サイト等の注文ファイルをアップロードし、受注データを取り込む。 |

## 3. 機能一覧

### 3.1 検索系機能

- 受注検索（伝票単位 / 明細行単位の切替検索）
  - 検索条件：受注番号、受付番号、受注日、出荷日、納期指定日、顧客コード、顧客名、顧客担当者、取引区分、商品コード、商品名、商品分類（大・中・小）、仕入先コード、仕入先名、残分のみ、遅延分のみ
  - ソート、ページング
- 検索結果 Excel 出力

### 3.2 入力・更新系機能

- 受注伝票の新規登録
- 受注伝票の更新
- 受注伝票の削除
- 見積伝票からの複写（`copyFromEstimate`）
- オンライン受注データからの複写（`online`）
- 明細行の追加・削除

### 3.3 オンライン受注取込機能

- CSV 等の注文ファイルアップロード
- 取込データの検索・一覧表示
- 取込済データの削除
- 取込データから受注入力画面への反映

## 4. 業務フロー

### 4.1 受注登録フロー

1. ユーザーが受注入力画面を開く（`/rorder/inputROrder/`）。
2. 顧客コードを入力し、顧客マスタから顧客情報・税処理・支払条件・取引区分を取得する。
3. 納入先を選択または入力する（通常顧客は登録済み納入先、オンライン顧客は直接入力）。
4. 商品を明細行に入力し、仕入単価・売上単価・数量・金額等を設定する。
5. 保存時に顧客・商品の存在チェック、必須チェックを行い、受注伝票テーブルと受注明細行テーブルに登録する。
6. オンライン受注の場合は、関連テーブル（`ONLINE_ORDER_REL_TRN`）へも連携する。

### 4.2 受注検索フロー

1. ユーザーが受注検索画面を開く（`/rorder/searchROrder`）。
2. 検索条件を入力する。
3. 検索ボタンを押下し、Ajax で検索結果を取得する（`/ajax/rorder/searchROrderResultAjax/search`）。
4. 結果一覧を画面に表示する。
5. 必要に応じて Excel 出力を実施する（`/rorder/searchROrderResultOutput/excel`）。

### 4.3 オンライン受注取込フロー

1. ユーザーがオンライン受注取込画面を開く（`/rorder/importOnlineOrder`）。
2. 注文ファイルをアップロードし、取込ボタンを押下する。
3. ファイルの内容を解析し、`ONLINE_ORDER_WORK` テーブルに一時保存する。
4. 取込一覧を表示する。
5. 受注変換対象を選択し、受注入力画面へ遷移する。

## 5. 入出力情報

### 5.1 受注伝票（RO_SLIP_TRN）入出力項目

| 項目名 | 入出力 | 備考 |
|--------|--------|------|
| 受注番号（RO_SLIP_ID） | 自動採番（新規）/ 表示（更新） | `SeqMakerService` により採番 |
| 状態（STATUS） | 自動設定 | 0:受注、1:売上中、9:売上完了 |
| 受注日（RO_DATE） | 入力 | 必須 |
| 出荷日（SHIP_DATE） | 入力 | |
| 納期指定日（DELIVERY_DATE） | 入力 | |
| 受付番号（RECEPT_NO） | 入力 | |
| 客先伝票番号（CUSTOMER_SLIP_NO） | 入力 | |
| 顧客コード（CUSTOMER_CODE） | 入力 | 必須、顧客マスタ存在チェック |
| 顧客名（CUSTOMER_NAME） | 自動表示 | 顧客マスタから取得 |
| 担当者コード・名（USER_ID, USER_NAME） | 入力 | |
| 備考（REMARKS） | 入力 | |
| 税転嫁（TAX_SHIFT_CATEGORY） | 自動設定 | 顧客マスタから取得 |
| 税端数処理（TAX_FRACT_CATEGORY） | 自動設定 | |
| 単価端数処理（PRICE_FRACT_CATEGORY） | 自動設定 | |
| 支払条件（CUTOFF_GROUP + PAYBACK_CYCLE_CATEGORY） | 自動設定 | 顧客マスタから取得 |
| 取引区分（SALES_CM_CATEGORY） | 自動設定 | 顧客マスタから取得 |
| 納入先情報 | 入力/自動設定 | コード選択またはオンライン時は直接入力 |
| 配送業者・配送時間帯（DC_CATEGORY, DC_TIMEZONE_CATEGORY） | 入力 | カテゴリマスタから選択 |
| 金額系（COST_TOTAL, RETAIL_PRICE_TOTAL, CTAX_PRICE_TOTAL, PRICE_TOTAL） | 自動計算 | |
| 消費税率（CTAX_RATE） | 自動設定 | 受注日に応じた税マスタから取得 |
| 代引き手数料（COD_SC） | 入力 | |
| 印刷回数（PRINT_COUNT） | 自動 | |

### 5.2 受注明細行（RO_LINE_TRN）入出力項目

| 項目名 | 入出力 | 備考 |
|--------|--------|------|
| 行番号（LINE_NO） | 自動 | |
| 商品コード（PRODUCT_CODE） | 入力 | 必須、商品マスタ存在チェック |
| 商品名（PRODUCT_ABSTRACT） | 自動表示 | 商品マスタから取得 |
| 数量（QUANTITY） | 入力 | |
| 受注残数（REST_QUANTITY） | 自動計算 | 売上数量を差し引いた残数 |
| 完納区分（STATUS） | 自動/手動 | 0:受注、1:分納中、9:売上完了 |
| 仕入単価（UNIT_COST） / 仕入金額（COST） | 自動 | 商品マスタから取得 |
| 売上単価（UNIT_RETAIL_PRICE） / 売上金額（RETAIL_PRICE） | 入力/自動 | |
| 消費税率（CTAX_RATE） / 消費税（CTAX_PRICE） | 自動 | |
| 備考（REMARKS） | 入力 | |
| ピッキング備考（EAD_REMARKS） | 入力 | |
| 商品備考（PRODUCT_REMARKS） | 自動 | 商品マスタから取得 |
| 棚番（RACK_CODE_SRC） | 自動 | 商品マスタから取得 |
| 引当可能数（possibleDrawQuantity） | 自動表示 | 在庫計算結果 |
| 受注限度数（roMaxNum） | 自動 | 商品マスタから取得 |

## 6. 業務ルール・バリデーション

- 受注日は必須入力である（`InputROrderForm.roDate` に `@Required`、`@DateType`）。
- 顧客コードは必須入力であり、登録済みの顧客である必要がある（`InputROrderForm.customerCode` に `@Required`、`InputROrderAction.validateAtCreateSlip` で `customerService.isExistCustomerCode` を確認）。
- 明細行の商品コードは登録済みの商品である必要がある（`InputROrderAction.checkProducts`）。
- 明細行が 1 行以上存在しない場合、登録不可（`InputROrderAction.checkProducts`）。
- 売上完了（STATUS='9'）の伝票は更新不可・削除不可とする（`InputROrderAction.afterLoad`）。
- すべての明細行が売上完了の場合、伝票ステータスも「9:売上完了」とする（`InputROrderAction.beforeUpsert`）。
- 受注残数は、売上数量を差し引いて計算される（`CountRestQuantityByProductCode.sql`）。
- オンライン受注データの場合、配送料を特別な商品コード（`Constants.EXCEPTIANAL_PRODUCT_CODE.ONLINE_DELIVERY_PRICE` = "XXXXXXXXXA"）として 1 行追加する（`InputROrderAction.online`）。
- 税込金額を税抜金額に変換する際は、顧客の税端数処理区分に従う（`InputROrderAction.toNoTax`）。
- 受注番号は `SeqMakerService.nextval(RO_SLIP_TRN)` により自動採番する（`RoSlipService.insertRecord`）。

## 7. 関連マスタ・トランザクションテーブル

### 7.1 主要トランザクションテーブル

| テーブル名 | 物理名 | 概要 |
|-----------|--------|------|
| 受注伝票 | `RO_SLIP_TRN_/*$domainId*/` | 受注伝票のヘッダ情報。`>` `DB/sql/createtable/CREATE.sql` 1557-1623 |
| 受注明細行 | `RO_LINE_TRN_/*$domainId*/` | 受注伝票の明細行情報。`>` `DB/sql/createtable/CREATE.sql` 1700-1740 |
| 受注伝票履歴 | `RO_SLIP_TRN_HIST_/*$domainId*/` | 受注伝票の変更履歴。`>` `DB/sql/createtable/CREATE.sql` 1626-1697 |
| 受注明細行履歴 | `RO_LINE_TRN_HIST_/*$domainId*/` | 受注明細行の変更履歴。`>` `DB/sql/createtable/CREATE.sql` 1743-1788 |
| オンライン受注ワーク | `ONLINE_ORDER_WORK` | オンライン受注取込用の一時データ（推測、Entity `OnlineOrderWork` から）。 |
| オンライン受注関連 | `ONLINE_ORDER_REL_TRN` | オンライン受注と受注伝票の紐付け（`OnlineOrderRelService` から推測）。 |

### 7.2 関連マスタテーブル

| テーブル名 | 物理名 | 概要 |
|-----------|--------|------|
| 顧客マスタ | `CUSTOMER_MST_/*$domainId*/` | 顧客情報、税処理、支払条件、取引区分等 |
| 商品マスタ | `PRODUCT_MST_/*$domainId*/` | 商品情報、仕入単価、売上単価、棚番等 |
| 仕入先マスタ | `SUPPLIER_MST_/*$domainId*/` | 仕入先情報 |
| カテゴリマスタ | `CATEGORY_TRN_/*$domainId*/` | 区分情報（税転嫁、支払条件、取引区分、完納区分、配送業者、配送時間帯等） |
| 税率マスタ | `TAX_RATE_MST` | 消費税率 |
| 納入先マスタ | `DELIVERY_MST` | 顧客納入先情報 |
| 商品セットマスタ | `PRODUCT_SET_MST_/*$domainId*/` | セット商品構成 |
| 売上伝票 | `SALES_SLIP_TRN_/*$domainId*/` | 受注残数計算で参照 |
| 売上明細行 | `SALES_LINE_TRN_/*$domainId*/` | 受注残数計算で参照 |

## 8. 不確実な点・推測事項

- オンライン受注取込のファイル形式は CSV 等のテキスト形式と推測されるが、コード上では `FormFile` として汎用的に受けているため、拡張子は判然としない（推測）。
- オンライン受注データの削除時の物理削除対象は、`ONLINE_ORDER_WORK` と `ONLINE_ORDER_REL_TRN` と推測される（`ImportOnlineOrderAction`、`OnlineOrderRelService` の処理を見ての推測）。
- 帳票出力は `WEB-INF/report_template/` に JasperReports テンプレートが存在するが、受注伝票専用のテンプレートは確認できなかった（推測）。
- 受注伝票の排他制御は `UPD_DATETM` を用いた楽観ロックまたは `FOR UPDATE` による悲観ロックを組み合わせている（`LockSlip.sql` が `FOR UPDATE`、更新時には `updDatetm` を比較する処理が `AbstractSlipService` 側に存在する推測）。
