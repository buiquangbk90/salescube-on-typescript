# 受注（rorder）ドメイン設計書

## 1. 画面設計

### 1.1 受注検索画面（`/rorder/searchROrder`）

| 項目 | 内容 |
|------|------|
| URL | `/rorder/searchROrder` |
| Action | `SearchROrderAction` |
| Form | `SearchROrderForm` |
| JSP | `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/searchROrder/search.jsp` |
| メニューID | 親：0003、子：0301 |

#### 画面構成

- 検索条件エリア
  - 検索対象（伝票単位 / 明細行単位）
  - 受注番号、受付番号
  - 受注日 From/To
  - 出荷日 From/To
  - 納期指定日 From/To
  - 残分のみ / 遅延分のみ チェックボックス
  - 顧客コード、顧客名、顧客担当者
  - 取引区分 チェックボックス
  - 商品コード、商品名
  - 商品分類（大・中・小）プルダウン
  - 仕入先コード、仕入先名
- 機能ボタン：F1 初期化、F2 検索、F3 Excel 出力、F4 表示設定
- 検索結果一覧エリア（Ajax で更新）

### 1.2 受注入力画面（`/rorder/inputROrder/`）

| 項目 | 内容 |
|------|------|
| URL | `/rorder/inputROrder/`（新規）、`/rorder/inputROrder/edit/`（編集）、`/rorder/inputROrder/copyFromEstimate/{copySlipId}`（見積複写）、`/rorder/inputROrder/online`（オンライン取込反映） |
| Action | `InputROrderAction` |
| Form | `InputROrderForm` |
| JSP | `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/inputROrder/inputROrder.jsp` |

#### 画面構成

- 受注伝票ヘッダ
  - 受注番号（新規は空欄、更新は表示）
  - 受注日（必須）
  - 出荷日
  - 納期指定日
  - 受付番号
  - 客先伝票番号
  - 顧客コード（必須）、顧客名
  - 担当者コード、担当者名
  - 取引区分、支払条件、税転嫁、税端数処理、単価端数処理、消費税率
  - 備考、顧客備考、顧客コメント
  - 納入先情報（コード、名称、カナ、事業所名、部署名、郵便番号、住所、担当者、敬称、TEL、FAX、Email、URL）
  - 配送業者、配送時間帯
  - 金額合計、消費税、伝票合計、粗利益、粗利益率
- 明細行エリア
  - 行番号、商品コード、商品名、数量、受注残数、引当可能数、仕入単価、仕入金額、売上単価、売上金額、完納区分、備考、ピッキング備考、商品備考
  - 最大 35 行まで（`inputROrder.jsp` 内 `MAX_LINE_SIZE = 35`）
- 機能ボタン：F1 初期化、F2 削除、F3 登録/更新、F6 伝票複写（見積から）

#### バリデーション

| 項目 | バリデーション |
|------|--------------|
| 受注日 | `@Required`、`@DateType` |
| 顧客コード | `@Required`、登録済み顧客存在チェック |
| 商品コード | 明細行に 1 行以上の登録済み商品が必要 |
| 受注番号 | `@IntegerType`（更新時は readOnly） |
| 納入先コード | `@IntegerType` |

### 1.3 オンライン受注取込画面（`/rorder/importOnlineOrder`）

| 項目 | 内容 |
|------|------|
| URL | `/rorder/importOnlineOrder` |
| Action | `ImportOnlineOrderAction` |
| Form | `ImportOnlineOrderForm` |
| JSP | `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/importOnlineOrder/importOnlineOrder.jsp` |
| メニューID | 親：0003、子：0303 |

#### 画面構成

- ファイルアップロードエリア（必須）
- 「取込済は除く」チェックボックス
- 取込ボタン（F3）
- 初期化ボタン（F1）
- 取込済データ一覧（Ajax で表示・更新）
- 各データの削除リンク

## 2. テーブル定義

### 2.1 RO_SLIP_TRN（受注伝票）

| カラム名 | 型 | PK | NULL | 備考 |
|---------|-----|-----|------|------|
| RO_SLIP_ID | INT UNSIGNED | PK | | 受注番号 |
| STATUS | CHAR(1) | | NOT NULL | 0:受注、1:売上中、9:売上完了 |
| RO_ANNUAL | SMALLINT | | | 受注年 |
| RO_MONTHLY | SMALLINT | | | 受注月 |
| RO_YM | INT | | | 受注年月 |
| RO_DATE | DATE | | | 受注日 |
| SHIP_DATE | DATE | | | 出荷日 |
| DELIVERY_DATE | DATE | | | 納期指定日 |
| RECEPT_NO | VARCHAR(30) | | | 受付番号 |
| CUSTOMER_SLIP_NO | VARCHAR(30) | | | 客先伝票番号 |
| SALES_CM_CATEGORY | VARCHAR(1) | | | 取引区分 |
| CUTOFF_GROUP | CHAR(2) | | | 締日グループ |
| PAYBACK_CYCLE_CATEGORY | VARCHAR(1) | | | 回収間隔 |
| USER_ID | VARCHAR(30) | | | 担当者コード |
| USER_NAME | VARCHAR(60) | | | 担当者名 |
| REMARKS | VARCHAR(120) | | | 備考 |
| CUSTOMER_CODE | VARCHAR(15) | | | 顧客コード |
| CUSTOMER_NAME | VARCHAR(60) | | | 顧客名 |
| CUSTOMER_REMARKS | VARCHAR(120) | | | 顧客備考 |
| CUSTOMER_COMMENT_DATA | VARCHAR(1000) | | | 顧客コメント |
| DELIVERY_CODE | VARCHAR(15) | | | 納入先コード |
| DELIVERY_NAME | VARCHAR(60) | | | 納入先名 |
| DELIVERY_KANA | VARCHAR(60) | | | 納入先名カナ |
| DELIVERY_OFFICE_NAME | VARCHAR(60) | | | 事業所名 |
| DELIVERY_OFFICE_KANA | VARCHAR(60) | | | 事業所名カナ |
| DELIVERY_DEPT_NAME | VARCHAR(60) | | | 部署名 |
| DELIVERY_ZIP_CODE | CHAR(8) | | | 郵便番号 |
| DELIVERY_ADDRESS_1 | VARCHAR(50) | | | 住所１ |
| DELIVERY_ADDRESS_2 | VARCHAR(50) | | | 住所２ |
| DELIVERY_PC_NAME | VARCHAR(60) | | | 納入先担当者 |
| DELIVERY_PC_KANA | VARCHAR(60) | | | 納入先担当者カナ |
| DELIVERY_PC_PRE_CATEGORY | VARCHAR(2) | | | 敬称コード |
| DELIVERY_PC_PRE | VARCHAR(16) | | | 敬称名称 |
| DELIVERY_TEL | CHAR(15) | | | TEL |
| DELIVERY_FAX | CHAR(15) | | | FAX |
| DELIVERY_EMAIL | VARCHAR(255) | | | Email |
| DELIVERY_URL | VARCHAR(60) | | | URL |
| ESTIMATE_SHEET_ID | INT UNSIGNED | | | 見積伝票番号（複写元） |
| TAX_SHIFT_CATEGORY | VARCHAR(1) | | | 税転嫁 |
| TAX_FRACT_CATEGORY | VARCHAR(1) | | | 税端数処理 |
| PRICE_FRACT_CATEGORY | VARCHAR(1) | | | 単価端数処理 |
| CTAX_PRICE_TOTAL | DECIMAL(15,3) | | | 消費税合計 |
| CTAX_RATE | DECIMAL(6,3) | | | 消費税率 |
| COST_TOTAL | DECIMAL(15,3) | | | 原価合計 |
| RETAIL_PRICE_TOTAL | DECIMAL(15,3) | | | 金額合計 |
| PRICE_TOTAL | DECIMAL(15,3) | | | 伝票合計 |
| PRINT_COUNT | INT | | | 印刷回数 |
| COD_SC | CHAR(1) | | | 代引き手数料フラグ |
| DC_CATEGORY | VARCHAR(5) | | | 配送業者コード |
| DC_NAME | VARCHAR(60) | | | 配送業者名 |
| DC_TIMEZONE_CATEGORY | VARCHAR(4) | | | 配送時間帯コード |
| DC_TIMEZONE | VARCHAR(60) | | | 配送時間帯名 |
| CRE_FUNC | VARCHAR(255) | | | 作成機能名 |
| CRE_DATETM | DATETIME | | | 作成日時 |
| CRE_USER | VARCHAR(30) | | | 作成者 |
| UPD_FUNC | VARCHAR(255) | | | 更新機能名 |
| UPD_DATETM | DATETIME | | | 更新日時 |
| UPD_USER | VARCHAR(30) | | | 更新者 |
| DEL_FUNC | VARCHAR(255) | | | 削除機能名 |
| DEL_DATETM | DATETIME | | | 削除日時 |
| DEL_USER | VARCHAR(30) | | | 削除者 |

出典：`DB/sql/createtable/CREATE.sql` 1557-1623

### 2.2 RO_LINE_TRN（受注明細行）

| カラム名 | 型 | PK | NULL | 備考 |
|---------|-----|-----|------|------|
| RO_LINE_ID | INT UNSIGNED | PK | | 明細行 ID |
| STATUS | CHAR(1) | | NOT NULL | 0:受注、1:分納中、9:売上完了 |
| RO_SLIP_ID | INT UNSIGNED | | | 受注番号 |
| LINE_NO | SMALLINT | | NOT NULL | 行番号 |
| ESTIMATE_LINE_ID | INT UNSIGNED | | | 見積明細行 ID |
| LAST_SHIP_DATE | DATE | | | 最終出荷日 |
| PRODUCT_CODE | VARCHAR(20) | | NOT NULL | 商品コード |
| CUSTOMER_PCODE | VARCHAR(50) | | | 得意先商品コード |
| PRODUCT_ABSTRACT | VARCHAR(120) | | NOT NULL | 商品名 |
| QUANTITY | DECIMAL(12,3) | | NOT NULL | 数量 |
| UNIT_PRICE | DECIMAL(12,3) | | | 単価 |
| UNIT_CATEGORY | VARCHAR(2) | | | 単位コード |
| UNIT_NAME | VARCHAR(6) | | | 単位名 |
| PACK_QUANTITY | SMALLINT | | | 入数 |
| UNIT_RETAIL_PRICE | DECIMAL(12,3) | | NOT NULL | 売上単価 |
| RETAIL_PRICE | DECIMAL(15,3) | | NOT NULL | 売上金額 |
| UNIT_COST | DECIMAL(15,3) | | NOT NULL | 仕入単価 |
| COST | DECIMAL(15,3) | | NOT NULL | 仕入金額 |
| TAX_CATEGORY | VARCHAR(1) | | | 課税区分 |
| CTAX_RATE | DECIMAL(6,3) | | | 消費税率 |
| CTAX_PRICE | DECIMAL(12,3) | | | 消費税額 |
| REMARKS | VARCHAR(120) | | | 備考 |
| EAD_REMARKS | VARCHAR(120) | | | ピッキング備考 |
| PRODUCT_REMARKS | VARCHAR(120) | | | 商品備考 |
| REST_QUANTITY | DECIMAL(12,3) | | NOT NULL | 受注残数 |
| RACK_CODE_SRC | VARCHAR(10) | | | 棚番 |
| CRE_FUNC | VARCHAR(255) | | | 作成機能名 |
| CRE_DATETM | DATETIME | | | 作成日時 |
| CRE_USER | VARCHAR(30) | | | 作成者 |
| UPD_FUNC | VARCHAR(255) | | | 更新機能名 |
| UPD_DATETM | DATETIME | | | 更新日時 |
| UPD_USER | VARCHAR(30) | | | 更新者 |
| DEL_FUNC | VARCHAR(255) | | | 削除機能名 |
| DEL_DATETM | DATETIME | | | 削除日時 |
| DEL_USER | VARCHAR(30) | | | 削除者 |

出典：`DB/sql/createtable/CREATE.sql` 1700-1740

## 3. 処理シーケンス

### 3.1 受注新規登録シーケンス

```
[Browser]
   ↓ POST /rorder/inputROrder/upsert
[InputROrderAction]
   - @ActionForm InputROrderForm から入力値を受け取る
   - validateAtCreateSlip() で顧客/商品存在チェック
   - beforeUpsert() で税処理、支払条件、配送業者名等を整備
   - copyToDto() で ROrderSlipDto を生成
[RoSlipService]
   - save(ROrderSlipDto)
   - roSlipId が空なら insertRecord()
   - SeqMakerService.nextval(RO_SLIP_TRN) で採番
   - Beans.createAndCopy(RoSlipTrn.class, dto) で Entity 生成
   - InsertRoSlip.sql 実行
[RoLineService]
   - saveLines(ROrderSlipDto)
   - 明細行をループして insert / update / delete
   - InsertLine.sql / UpdateLine.sql / DeleteLinesByLineIds.sql 実行
[DB]
   RO_SLIP_TRN / RO_LINE_TRN にコミット
```

### 3.2 受注更新シーケンス

```
[Browser]
   ↓ POST /rorder/inputROrder/upsert
[InputROrderAction]
   - validateAtCreateSlip()
   - beforeUpsert()
   - copyToDto()
[RoSlipService]
   - save(ROrderSlipDto)
   - roSlipId があれば updateRecord()
   - LockSlip.sql (FOR UPDATE) で排他ロック
   - UpdateSlip.sql 実行
[RoLineService]
   - saveLines()
   - 各行を insert/update/delete
[DB]
   コミット
```

### 3.3 受注検索シーケンス

```
[Browser]
   ↓ Ajax POST /ajax/rorder/searchROrderResultAjax/search
[SearchROrderResultAjaxAction]
   - SearchROrderForm から検索条件を取得
   - ROrderService.getSearchResultCount() / getSearchResult()
[ROrderService]
   - 条件を Map に詰め、FindSlipByCondition.sql / FindSlipLineByCondition.sql 実行
[DB]
   RO_SLIP_TRN + RO_LINE_TRN + PRODUCT_MST + SUPPLIER_MST + CATEGORY_TRN を結合
[Browser]
   結果 HTML を listContainer に描画
```

### 3.4 オンライン受注取込シーケンス

```
[Browser]
   ↓ POST /rorder/importOnlineOrder/importFile
[ImportOnlineOrderAction]
   - ImportOnlineOrderForm.uploadFile を受け取る
   - validate() でファイル必須チェック
   - ImportOnlineOrderService を使用して CSV/ファイル解析
   - 各行をバリデーション後 ONLINE_ORDER_WORK に登録
[Browser]
   ↓ 一覧を表示
   行選択 / 削除（delete 実行）
```

## 4. 帳票レイアウト

### 4.1 Excel 検索結果出力

- 出力先：`SearchROrderResultOutputAction` → `excel.jsp` / `resultList.jsp`
- ファイル名：`RORDER_SLIP.xls`
- 形式：HTML を `application/vnd.ms-excel` として出力
- 列情報：`columnInfoList` により動的にヘッダー・列幅・フォーマットを決定
- 数値フォーマット：金額、数量、日付、比率等を `mineDto` のフォーマット定義に従う
- 受注番号セルは入力権限がある場合に受注入力画面へのリンクを含む

### 4.2 JasperReports 帳票

- テンプレート：`WEB/SalesCube/src/main/webapp/WEB-INF/report_template/TemplateA.jrxml` ～ `TemplateX.jrxml`
- 受注伝票専用テンプレートはソースから確認できなかった（推測）。
- 帳票印刷機能自体は `PRINT_COUNT` カラムや Action の基底クラスに存在する可能性があるが、rorder 固有の処理は今回の解析範囲では確認できなかった（推測）。

## 5. バッチ・ジョブ設計

- rorder ドメインに固有のバッチ処理は、今回解析した `DB/batch` 配下には確認されなかった（`grep` 検索で該当なし）。
- ただし、DB バッチ `SP_UPDATE_CUSTOMER_RANK_SALES.sql` が `RO_COUNT_FROM`、`RO_MONTHLY_AVG_FROM` 等の受注関連指標を顧客ランク計算に利用していることが確認された。
- 受注データをもとに在庫指標・顧客ランクを更新するバッチが別ドメイン（`batch` 配下）に存在する可能性がある（推測）。

## 6. 不確実な点・推測事項

- オンライン受注ファイルの詳細なフォーマット仕様は確認できなかった（推測）。
- JasperReports による受注伝票印刷帳票の有無、テンプレート名は確認できなかった（推測）。
- 履歴テーブル（`RO_SLIP_TRN_HIST`、`RO_LINE_TRN_HIST`）への挿入トリガーや監査ロジックは、今回の解析範囲では確認できなかった（推測）。
- `ONLINE_ORDER_REL_TRN` テーブルの物理スキーマは、Service 名からの推測。
- 受注伝票の削除時に子の明細行も同時に削除するか、カスケード制約で削除されるかはソース上では確認できなかった（推測）。
