# 設計書 — 受注（rorder）

- 対象パッケージ: `jp.co.arkinfosys.action.rorder` / `jp.co.arkinfosys.form.rorder` / `jp.co.arkinfosys.service.rorder` ほか関連クラス
- 作成ツール: claude
- 作成日: 2026-07-20

## 1. 画面設計

### 画面1: 受注入力画面

- URL / アクション: `/rorder/inputROrder` → `jp.co.arkinfosys.action.rorder.InputROrderAction`（SAStruts。エントリポイントは `@Execute` メソッド）
- JSP: `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/inputROrder/inputROrder.jsp`
- アクションフォーム: `jp.co.arkinfosys.form.rorder.InputROrderForm`（REQUEST スコープ、`@Component(instance = InstanceType.REQUEST)`）

主な URL エントリ（`InputROrderAction` および基底クラス `AbstractSlipEditAction` の `@Execute` メソッド）:

| URL | メソッド | 処理 |
|---|---|---|
| `/rorder/inputROrder/` | `index()` | 新規入力初期表示 |
| `/rorder/inputROrder/load/?roSlipId=` | `load()` | 既存伝票の読込・編集表示 |
| `/rorder/inputROrder/upsert` | `upsert()` | 登録・更新（検証: `validate, @, validateAtCreateSlip`） |
| `/rorder/inputROrder/delete` | `delete()` | 伝票削除（検証: `@, validateAtDeleteSlip`） |
| `/rorder/inputROrder/online/?roSlipId=` | `online()` | オンライン受注ワークからの伝票展開 |
| `/rorder/inputROrder/copyFromEstimate/{copySlipId}` | `copyFromEstimate()` | 見積伝票からの複写（`@Execute(urlPattern = "copyFromEstimate/{copySlipId}")`） |
| `/rorder/inputROrder/errorInit` | `errorInit()` | 検証エラー時の再表示 |

- 項目定義（ヘッダ部。型・必須・検証は `InputROrderForm` のアノテーションおよび `validate()` メソッドより）:

| 項目名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| 受注番号 `roSlipId` | 数値文字列 | -（自動採番） | 更新時のみ設定 | `@IntegerType` |
| 受注日 `roDate` | 日付 | ○ | 初期値はシステム日付 | `@Required @DateType`、受注日≦出荷日・受注日≦納期指定日 |
| 出荷日 `shipDate` | 日付 | - | 初期値はシステム日付 | `@DateType`、出荷日≦納期指定日 |
| 納期指定日 `deliveryDate` | 日付 | - | | `@DateType` |
| 受付番号 `receptNo` | 文字列 | - | オンライン受注時は order-id が入る | 最大 30 桁 |
| 客先伝票番号 `customerSlipNo` | 文字列 | - | | 最大 30 桁（エラーメッセージ引数は "20"。ソース上の不整合） |
| 担当者コード/名 `userId` / `userName` | 文字列 | - | ログインユーザで初期化（`initializeScreenInfo()`） | - |
| 顧客コード `customerCode` | 文字列 | ○ | 顧客マスタ実在チェックあり | `@Required`、最大 `Constants.CODE_SIZE.CUSTOMER` 桁 |
| 顧客名 `customerName` | 文字列 | - | 顧客マスタから自動設定 | - |
| 支払条件 `cutoffGroupCategory` | コード(3桁) | - | 前2桁=締日グループ、後1桁=回収サイクル | - |
| 取引区分 `salesCmCategory` | コード | - | 区分マスタ `SALES_CM_CATEGORY` | - |
| 税転嫁/税端数/単価端数 `taxShiftCategory` ほか | コード | - | 顧客マスタから初期化 | - |
| 納入先（コード・名称・カナ・事業所・部署・郵便番号・住所1/2・担当者・敬称・TEL・FAX・E-MAIL・URL） | 文字列群 | △ | 通常は顧客納入先プルダウンから選択。オンライン受注時のみ直接編集可 | オンライン受注時: 担当者名・郵便番号・住所1・TEL 必須 |
| 配送業者 `dcCategory` / 配送時間帯 `dcTimezoneCategory` | コード | - | 区分マスタ `DC_CATEGORY` / `DC_TIMEZONE_CATEGORY` | - |
| 摘要 `remarks` | 文字列 | - | | 最大 120 桁 |
| 合計欄（`costTotal` / `retailPriceTotal` / `ctaxPriceTotal` / `priceTotal` / `gross` / `grossRatio`） | 数値 | - | 画面計算値の表示 | - |

- 項目定義（明細部、`ROrderLineDto`。1 明細＝1 行の繰り返し）:

| 項目名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| 商品コード `productCode` | 文字列 | ○ | 商品マスタ実在チェック（`checkProducts()`） | 最大 20 桁 |
| 商品名 `productAbstract` | 文字列 | - | マスタから設定 | - |
| 数量 `quantity` | 数値 | ○ | | Float 型・0 不可 |
| 仕入単価 `unitCost` / 仕入金額 `cost` | 数値 | ○ | | Float 型・0 不可（特殊コード商品 `XXXXXXXXX*` は 0 可） |
| 売上単価 `unitRetailPrice` / 売価金額 `retailPrice` | 数値 | ○ | | Float 型・0 不可 |
| 消費税率 `ctaxRate` | 数値 | - | 伝票作成時税率を保持 | - |
| 完納区分 `status` | コード | - | 0:受注 / 1:分納中 / 9:売上完了 | 1・9 の行は削除不可（`afterLoad()`） |
| 備考 `remarks` / ピッキング備考 `eadRemarks` / 商品備考 `productRemarks` | 文字列 | - | | 各最大 120 桁 |
| （hidden）引当可能数 `possibleDrawQuantity`・受注限度数 `roMaxNum`・在庫管理区分 `stockCtlCategory`・未納数 `restQuantity` | 数値等 | - | 在庫サービスから設定 | - |

- 画面遷移:
  - 受注検索結果一覧（明細リンク）→ `/rorder/inputROrder/load/?roSlipId=`（`searchROrderResultOutput/resultList.jsp` 52行目）
  - オンライン受注取込画面「受注入力」ボタン → `/rorder/inputROrder/online/?roSlipId=<onlineOrderId>`（`importOnlineOrderResultAjax/result.jsp` 128行目）
  - 登録成功 → 同一画面再表示（登録済み伝票の編集状態）。オンライン受注展開時にデータ不備 → `/rorder/importOnlineOrder` へ戻る（`InputROrderAction.Mapping.ONLINE_ORDER`）
  - 削除成功 → 新規入力初期表示（`AbstractSlipEditAction#delete()` → `index()` 相当の遷移）

### 画面2: 受注検索画面

- URL / アクション: `/rorder/searchROrder` → `jp.co.arkinfosys.action.rorder.SearchROrderAction`
- JSP: `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/searchROrder/search.jsp`
- アクションフォーム: `jp.co.arkinfosys.form.rorder.SearchROrderForm`
- 検索実行は Ajax: `jp.co.arkinfosys.action.ajax.rorder.SearchROrderResultAjaxAction` → `WEB-INF/view/ajax/rorder/searchROrderResultAjax/result.jsp`（内部で `searchROrderResultOutput/resultList.jsp` を include）
- Excel 出力: `/rorder/searchROrderResultOutput/excel`（`search.jsp` 520行目の hidden フォームから POST、`target="_blank"`）

- 項目定義（検索条件。`SearchROrderForm` より）:

| 項目名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| 検索対象 `searchTarget` | ラジオ | - | 伝票単位 / 明細単位（初期値: 明細単位。`doAfterIndex()`） | - |
| 受注伝票番号 `roSlipId` | 数値 | - | 完全一致 | `@LongType` |
| 受付番号 `receptNo` | 文字列 | - | 前方一致 | - |
| 残分のみ `restOnly` / 遅延分のみ `razyOnly` | チェック | - | 遅延分は明細状態＝処理済との組合せ条件（`ROrderService#setConditionParam()`） | - |
| 受注日 From/To `roDateFrom` / `roDateTo` | 日付 | - | 全角数字は半角変換 | `@DateType(datePatternStrict)` |
| 出荷日 From/To、納期指定日 From/To | 日付 | - | 同上 | `@DateType(datePatternStrict)` |
| 顧客コード `customerCode` / 顧客名 `customerName` | 文字列 | - | 前方一致 / 部分一致 | - |
| 顧客担当者 `deliveryPcName` | 文字列 | - | 部分一致 | - |
| 商品コード `productCode` / 商品名 `productAbstract` | 文字列 | - | 前方一致 / 部分一致 | - |
| 分類（大/中/小） `product1`〜`product3` | プルダウン | - | 商品分類マスタ（`ProductClassService`） | - |
| 仕入先コード `supplierCode` / 仕入先名 `supplierName` | 文字列 | - | 前方一致 / 部分一致 | - |
| 取引区分 `salesCmCategoryList` | チェックボックス群 | - | 区分マスタ `SALES_CM_CATEGORY` | - |

- 検索結果列: 画面ごとの表示項目マスタで動的生成（`DetailDispItemService#createResult()`、メニューID `0301`）。
- 画面遷移: 結果一覧の伝票番号リンク → 受注入力画面（load）。「Excel」→ Excel 出力アクション。

### 画面3: オンライン受注データ取込画面

- URL / アクション: `/rorder/importOnlineOrder` → `jp.co.arkinfosys.action.rorder.ImportOnlineOrderAction`
- JSP: `WEB/SalesCube/src/main/webapp/WEB-INF/view/rorder/importOnlineOrder/importOnlineOrder.jsp`
- アクションフォーム: `jp.co.arkinfosys.form.rorder.ImportOnlineOrderForm`
- 一覧表示は Ajax: `jp.co.arkinfosys.action.ajax.rorder.ImportOnlineOrderResultAjaxAction` → `WEB-INF/view/ajax/rorder/importOnlineOrderResultAjax/result.jsp`

| URL | メソッド | 処理 |
|---|---|---|
| `/rorder/importOnlineOrder/` | `index()` | 初期表示 |
| `/rorder/importOnlineOrder/importFile` | `importFile()` | ファイルアップロード＆取込 |
| `/rorder/importOnlineOrder/init` | `init()` | ワークテーブル全件削除 |
| `/rorder/importOnlineOrder/delete` | `delete()` | 指定 order-id のワーク削除 |
| `/rorder/importOnlineOrder/redraw/{showExist}` | `redraw()` | 一覧再表示（取込済の表示切替） |

- 項目定義:

| 項目名 | 型 | 必須 | 説明 | バリデーション |
|---|---|---|---|---|
| 取込ファイル `uploadFile` | ファイル | ○ | タブ区切りテキスト（29 列固定） | 未指定・0 バイトはエラー（`ImportOnlineOrderForm#validate()`）。行単位で列数・日付型（ISO8601）・整数型・最大長を検証（`ImportOnlineOrderAction#processLine()`） |
| 取込済を除く `showExist` | チェック | - | 一覧の絞り込み | - |
| 削除用受注番号 `roId` | hidden | - | 個別削除対象の order-id | - |

- 一覧列（`importOnlineOrderResultAjax/result.jsp` のヘッダより）: 状態、通販サイト情報、注文番号、受注日、注文者氏名、取込日時、受注伝票番号（リンク）、「受注入力」ボタン。
- 画面遷移: 「受注入力」ボタン → 受注入力画面 `online()`。伝票登録済みの行は受注伝票番号リンク → `load()`。

## 2. テーブル定義

DDL: `DB/sql/createtable/CREATE.sql`。テーブル名の `_XXXXX` は導入単位（ドメインID）で置換されるサフィックス。SQL ファイル中では `RO_SLIP_TRN_/*$domainId*/` と記述される（例: `WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/sql/rorder/UpdateSlip.sql`）。

### テーブル: RO_SLIP_TRN（受注伝票）

エンティティ: `jp.co.arkinfosys.entity.RoSlipTrn`

| カラム | 型 | PK | NOT NULL | 説明 |
|---|---|---|---|---|
| RO_SLIP_ID | INT UNSIGNED | ○ | ○ | 受注伝票番号（`SEQ_MAKER` で採番） |
| STATUS | CHAR(1) | | ○ | 伝票状態（0:受注 / 1:売上中 / 9:売上完了 = `Constants.STATUS_RORDER_SLIP`） |
| RO_ANNUAL / RO_MONTHLY / RO_YM | SMALLINT / SMALLINT / INT | | | 受注年・月・年月（受注日から導出。`RoSlipService#setEntityToParam()`） |
| RO_DATE / SHIP_DATE / DELIVERY_DATE | DATE | | | 受注日 / 出荷日 / 納期指定日 |
| RECEPT_NO | VARCHAR(30) | | | 受付番号（オンライン受注時は order-id） |
| CUSTOMER_SLIP_NO | VARCHAR(30) | | | 客先伝票番号 |
| SALES_CM_CATEGORY | VARCHAR(1) | | | 取引区分 |
| CUTOFF_GROUP / PAYBACK_CYCLE_CATEGORY | CHAR(2) / VARCHAR(1) | | | 締日グループ / 回収サイクル区分 |
| USER_ID / USER_NAME | VARCHAR(30) / VARCHAR(60) | | | 担当者 |
| REMARKS | VARCHAR(120) | | | 摘要 |
| CUSTOMER_CODE / CUSTOMER_NAME | VARCHAR(15) / VARCHAR(60) | | | 顧客 |
| CUSTOMER_REMARKS / CUSTOMER_COMMENT_DATA | VARCHAR(120) / VARCHAR(1000) | | | 顧客備考 / 顧客コメント |
| DELIVERY_CODE〜DELIVERY_URL（納入先 20 カラム） | VARCHAR 等 | | | 納入先スナップショット（コード・名称・カナ・事業所・部署・郵便番号 CHAR(8)・住所1/2 VARCHAR(50)・担当者・敬称・TEL/FAX CHAR(15)・EMAIL VARCHAR(255)・URL VARCHAR(60)） |
| ESTIMATE_SHEET_ID | INT UNSIGNED | | | 複写元見積伝票番号 |
| TAX_SHIFT_CATEGORY / TAX_FRACT_CATEGORY / PRICE_FRACT_CATEGORY | VARCHAR(1) | | | 税転嫁 / 税端数 / 単価端数区分 |
| CTAX_PRICE_TOTAL / COST_TOTAL / RETAIL_PRICE_TOTAL / PRICE_TOTAL | DECIMAL(15,3) | | | 消費税合計 / 原価合計 / 売価合計 / 伝票合計 |
| CTAX_RATE | DECIMAL(6,3) | | | 伝票作成時の消費税率 |
| PRINT_COUNT | INT | | | 印刷回数 |
| COD_SC | CHAR(1) | | | 代引きフラグ（推測。用途はソース上未使用に近い） |
| DC_CATEGORY / DC_NAME / DC_TIMEZONE_CATEGORY / DC_TIMEZONE | VARCHAR(5)/VARCHAR(60)/VARCHAR(4)/VARCHAR(60) | | | 配送業者・配送時間帯 |
| CRE_FUNC / CRE_DATETM / CRE_USER | VARCHAR(255) / DATETIME / VARCHAR(30) | | | 作成監査情報 |
| UPD_FUNC / UPD_DATETM / UPD_USER | 同上 | | | 更新監査情報（`UPD_DATETM` は楽観排他に使用） |
| DEL_FUNC / DEL_DATETM / DEL_USER | 同上 | | | 削除監査情報 |

- インデックス / 制約: PK(RO_SLIP_ID)。INDEX: RO_SLIP_ID, RO_DATE, RECEPT_NO, SHIP_DATE, CUSTOMER_CODE, DELIVERY_DATE（`CREATE.sql` 6548〜6553行）。履歴テーブル `RO_SLIP_TRN_HIST`（PK: HIST_ID、ACTION_TYPE/REC_DATETM 等の履歴属性付き）あり。

### テーブル: RO_LINE_TRN（受注伝票明細行）

エンティティ: `jp.co.arkinfosys.entity.RoLineTrn`

| カラム | 型 | PK | NOT NULL | 説明 |
|---|---|---|---|---|
| RO_LINE_ID | INT UNSIGNED | ○ | ○ | 明細行 ID（`SEQ_MAKER` で採番） |
| STATUS | CHAR(1) | | ○ | 明細状態（0:受注 / 1:分納中 / 9:売上完了 = `Constants.STATUS_RORDER_LINE`） |
| RO_SLIP_ID | INT UNSIGNED | | | 親伝票番号 |
| LINE_NO | SMALLINT | | ○ | 行番号（1 からの通番。`RoLineService#save()`） |
| ESTIMATE_LINE_ID | INT UNSIGNED | | | 複写元見積明細 ID |
| LAST_SHIP_DATE | DATE | | | 最終出荷日（売上連携で更新） |
| PRODUCT_CODE | VARCHAR(20) | | ○ | 商品コード |
| CUSTOMER_PCODE | VARCHAR(50) | | | 客先品番 |
| PRODUCT_ABSTRACT | VARCHAR(120) | | ○ | 商品名 |
| QUANTITY | DECIMAL(12,3) | | ○ | 受注数量 |
| UNIT_PRICE / UNIT_CATEGORY / UNIT_NAME / PACK_QUANTITY | DECIMAL(12,3)/VARCHAR(2)/VARCHAR(6)/SMALLINT | | | 単価・単位・入数 |
| UNIT_RETAIL_PRICE / RETAIL_PRICE | DECIMAL(12,3) / DECIMAL(15,3) | | ○ | 売上単価 / 売価金額 |
| UNIT_COST / COST | DECIMAL(15,3) | | ○ | 仕入単価 / 仕入金額 |
| TAX_CATEGORY / CTAX_RATE / CTAX_PRICE | VARCHAR(1)/DECIMAL(6,3)/DECIMAL(12,3) | | | 課税区分・税率・消費税額 |
| REMARKS / EAD_REMARKS / PRODUCT_REMARKS | VARCHAR(120) | | | 備考 / ピッキング備考 / 商品備考 |
| REST_QUANTITY | DECIMAL(12,3) | | ○ | 受注残数（売上計上で減算） |
| RACK_CODE_SRC | VARCHAR(10) | | | 出荷元棚番 |
| CRE_* / UPD_* / DEL_* | - | | | 監査情報（伝票と同様） |

- インデックス / 制約: PK(RO_LINE_ID)。INDEX: REST_QUANTITY, PRODUCT_CODE（`CREATE.sql` 6556〜6557行）。履歴テーブル `RO_LINE_TRN_HIST` あり。売上側から `SALES_SLIP_TRN.RO_SLIP_ID`、`SALES_LINE_TRN.RO_LINE_ID` で参照される（同 6627, 6639行のインデックス）。

### テーブル: ONLINE_ORDER_WORK（オンライン受注取込ワーク）

エンティティ: `jp.co.arkinfosys.entity.OnlineOrderWork`

| カラム | 型 | PK | NOT NULL | 説明 |
|---|---|---|---|---|
| USER_ID | VARCHAR(30) | ○ | ○ | 取込ユーザ |
| ONLINE_ORDER_ID | VARCHAR(30) | ○ | ○ | 注文番号（order-id） |
| ONLINE_ITEM_ID | VARCHAR(30) | ○ | ○ | 注文明細番号（order-item-id） |
| SUPPLIER_DATE / PAYMENT_DATE | DATETIME | | | 購入日（purchase-date）/ 支払日（payments-date） |
| CUSTOMER_EMAIL / CUSTOMER_NAME / CUSTOMER_TEL | VARCHAR(255)/VARCHAR(60)/CHAR(15) | | | 購入者情報 |
| SKU / PRODUCT_NAME | VARCHAR(30) / VARCHAR(120) | | | 通販サイト品番 / 商品名 |
| QUANTITY | DECIMAL(12,3) | | | 数量 |
| CURRENCY / PRICE / TAX_PRICE / SHIPPING_PRICE / SHIPPING_TAX | VARCHAR(10) / DECIMAL | | | 通貨・商品金額・税・配送料・配送税 |
| SHIP_SERVICE_LEVEL | VARCHAR(30) | | | 配送サービスレベル |
| RECIPIENT_NAME / ADDRESS_1〜3 / CITY / STATE / ZIP_CODE / COUNTRY / SHIP_TEL | VARCHAR 等 | | | 届け先情報 |
| DELIVERY_START_DATE / DELIVERY_END_DATE / DELIVERY_TIME_ZONE / DELIVERY_INST | DATETIME / VARCHAR | | | 配送指定・配送指示 |
| LINE_NO | SMALLINT | | | ファイル内行番号 |
| LOAD_DATE | DATETIME | | | 取込日時 |

- インデックス / 制約: PK(USER_ID, ONLINE_ORDER_ID, ONLINE_ITEM_ID)。INDEX: USER_ID（`CREATE.sql` 6499行）。重複キー時の取込は Seasar エラーコード `ESSR0744` を検出してスキップ（`ImportOnlineOrderAction#importFile()`）。

### テーブル: ONLINE_ORDER_REL（受注伝票—オンライン受注関連）

エンティティ: `jp.co.arkinfosys.entity.OnlineOrderRel`

| カラム | 型 | PK | NOT NULL | 説明 |
|---|---|---|---|---|
| RO_SLIP_ID | INT UNSIGNED | ○ | ○ | 受注伝票番号 |
| RO_LINE_ID | INT UNSIGNED | ○ | ○ | 受注明細行 ID |
| ONLINE_ORDER_ID | VARCHAR(30) | ○ | ○ | 注文番号 |
| ONLINE_ITEM_ID | VARCHAR(30) | ○ | ○ | 注文明細番号 |
| CRE_* / UPD_* / DEL_* | - | | | 監査情報 |

- インデックス / 制約: PK は 4 カラム複合。履歴テーブル `ONLINE_ORDER_REL_HIST` あり。登録は受付番号 1 件につき 1 レコード（明細先頭行の RO_LINE_ID を使用。`InputROrderAction#afterUpsert()`）。

### 関連テーブル（他ドメイン管理）

| テーブル | 用途 |
|---|---|
| SEQ_MAKER | RO_SLIP_TRN / RO_LINE_TRN の採番（`SeqMakerService#nextval()`） |
| SALES_SLIP_TRN / SALES_LINE_TRN | 売上伝票。RO_SLIP_ID / RO_LINE_ID で受注を参照 |
| ESTIMATE_SHEET_TRN 系 | 見積複写元 |
| CUSTOMER_MST / PRODUCT_MST / DELIVERY_MST / CATEGORY_TRN / TAX_RATE | 各種マスタ参照 |

## 3. 処理シーケンス

### 3.1 受注伝票 登録・更新（upsert）

```
JSP(inputROrder.jsp)
  → InputROrderAction(upsert)  ※基底 AbstractSlipEditAction#upsert()
      ├ 検証: InputROrderForm#validate()（項目検証）
      │        → InputROrderAction#validateAtCreateSlip()（顧客・商品の実在検証）
      ├ beforeUpsert(): 支払条件3桁の分解、全明細"9"なら伝票status="9"、配送名称設定
      ├ RoSlipService#save()
      │    ├ 新規: SeqMakerService#nextval("RO_SLIP_TRN") で採番
      │    │      → 金額を端数区分で丸め（NumberConverter）
      │    │      → INSERT（rorder/InsertRoSlip.sql）
      │    └ 更新: lockRecord（rorder/LockSlip.sql、UPD_DATETM 比較の楽観ロック）
      │           → UPDATE（rorder/UpdateSlip.sql）
      ├ RoLineService#save()
      │    ├ 行ごとに 新規→採番+INSERT（rorder/InsertLine.sql） / 既存→UPDATE（rorder/UpdateLine.sql）
      │    └ 画面で削除された行 ID 群を DELETE（rorder/DeleteLinesByLineIds.sql）
      ├ afterUpsert(): オンライン受注なら ONLINE_ORDER_REL へ登録
      │               （onlineorder/InsertOnlineOrderRel.sql、受付番号1件につき1件）
      └ 再読込 loadData() → afterLoad() → 完了メッセージ表示
```

### 3.2 受注伝票 読込・編集（load）

```
検索結果一覧リンク(/rorder/inputROrder/load/?roSlipId=)
  → AbstractSlipEditAction#load()
      ├ InputROrderAction#loadData()
      │    ├ RoSlipService#loadBySlipId(): rorder/FindRoSlipTrnBySlipId.sql → ROrderSlipDto
      │    └ RoLineService#loadBySlip(): rorder/FindRoLineAndCategoryBySlipId.sql → 明細 DTO リスト
      └ InputROrderAction#afterLoad()
           ├ 行ごとに ProductStockService#calcStockQuantityByProductCode()（引当可能数）
           ├ 明細状態 1/9 の行は deletable=false
           ├ OnlineOrderRelService#hasRecordByROrderSlip()（オンライン由来か判定）
           └ 伝票状態 "9" は編集ロックメッセージ（infos.slip.lock）
```

### 3.3 オンライン受注 取込 → 起票

```
【取込】importOnlineOrder.jsp（ファイル選択）
  → ImportOnlineOrderAction#importFile()
      ├ AbstractXSVUploadAction#readXSV()（タブ区切り解析）
      │    └ processLine(): 29列チェック → ImportOnlineOrderService#createOnlineOrderWorkDto()
      │                     → 日付/整数/桁数の項目検証
      ├ 行ごとに OnlineOrderService#findOnlineOrderWorkByRoId() で既存確認
      │    └ 未登録のみ ImportOnlineOrderService#insertWork()
      │         → onlineorder/InsertOnlineOrderWork.sql（一意制約違反 ESSR0744 はスキップ）
      └ 一覧表示: ImportOnlineOrderResultAjaxAction
           → OnlineOrderService#findRoWorkRel()（onlineorder/FindOnlineOrderWorkRelByUserId.sql、
              ONLINE_ORDER_REL と外部結合し伝票化済みかを表示）

【起票】一覧「受注入力」ボタン(/rorder/inputROrder/online/?roSlipId=<order-id>)
  → InputROrderAction#online()
      ├ OnlineOrderService#findOnlineOrderWorkByRoId()（ワーク取得。0件なら取込画面へ戻る）
      ├ InputROrderForm#setUp(): 1件目をヘッダ（受付番号=order-id、納入先=届け先住所）に展開
      ├ CustomerService#findCustomerByCode("undefined")（オンライン用顧客の税・支払条件を取得）
      ├ 明細生成: ProductService#findProductByOnlinePCode(sku) で商品特定
      │    └ 配送料合計≠0 なら特殊商品 XXXXXXXXXA の明細行を自動追加（税込→税抜変換 toNoTax()）
      └ 受注入力画面表示（isOnlineOrder=true、以後は 3.1 の upsert フローで登録）
```

### 3.4 受注検索・Excel 出力

```
search.jsp → (Ajax) SearchROrderResultAjaxAction
      ├ doCount(): ROrderService#getSearchResultCount()
      │    └ 伝票単位: rorder/FindSlipCntByCondition.sql / 明細単位: rorder/FindSlipLineCntByCondition.sql
      ├ execSearch(): ROrderService#getSearchResult()
      │    └ 伝票単位: rorder/FindSlipByCondition.sql / 明細単位: rorder/FindSlipLineByCondition.sql
      │       （LIMIT/OFFSET によるページング、ソート列は StringUtil#convertColumnName で変換）
      └ exchange(): DetailDispItemService#createResult()（メニューID 0301 の表示項目定義に従い列生成）

Excel 出力: search.jsp の hidden フォーム → SearchROrderResultOutputAction#excel()
      └ ROW_COUNT=null（全件）で同一検索 → searchROrderResultOutput/excel.jsp を Excel として応答
```

### 3.5 売上連携（受注消込。売上ドメイン側から実行）

```
売上入力（sales ドメイン）
  → RoSlipSalesService（RoSlipService を継承）
      ├ updateSlipLine(): 明細の REST_QUANTITY / LAST_SHIP_DATE / STATUS を更新
      │    └ rorder/UpdateLineSales.sql
      └ updateSlipBySales(): 伝票 STATUS を更新（rorder/UpdateSlipSales.sql）
```

## 4. 帳票レイアウト

- 受注ドメイン専用の JasperReports テンプレートは存在しない。`WEB-INF/report_template/` には汎用テンプレート（TemplateA〜L, X）のみが配置されており、受注固有の `.jrxml` はない。
- 受注検索結果の出力は JasperReports ではなく **JSP による Excel 形式出力**（`searchROrderResultOutput/excel.jsp` + `resultList.jsp`）。出力列は画面表示項目マスタ（`DetailDispItemService`、メニューID 0301）に従う。
- `RO_SLIP_TRN.PRINT_COUNT` カラムが存在するため、受注伝票の印刷機能は `report` ドメイン側で汎用テンプレートを用いて実装されている可能性がある（推測。rorder パッケージ内には印刷処理なし）。

## 5. バッチ・ジョブ設計

- `DB/batch/` 配下（`ENTRY_PROCEDURE.sql`, `salescube_batch/`, `sp/`）に `RO_SLIP_TRN` / `RO_LINE_TRN` を参照するスクリプトは存在しない（grep 確認済み）。
- 受注ドメインに関するバッチ・ストアドプロシージャは**なし**。オンライン受注取込は画面からの同期処理（ファイルアップロード）で完結する。

## 6. 未確定・推測事項

- （推測）`RO_SLIP_TRN.COD_SC` は代引き区分と思われるが、rorder ドメインのソース上で値を設定・参照する箇所は確認できなかった。
- （推測）受注伝票の印刷（受注票）は `report` ドメインの汎用テンプレート経由と考えられる（`PRINT_COUNT` カラムの存在から）。rorder パッケージ内には帳票出力処理はない。
- （推測）`InputROrderForm#validate()` の客先伝票番号チェックは長さ 30 で判定しつつエラーメッセージには "20" を渡しており、メッセージ表示上の不整合（バグ）と思われる（`InputROrderForm.java` 576〜580行）。
- （事実だが注記）`DB/sql/createtable/CREATE.sql` は `ENGINE=INNODB` 指定であり **MySQL 方言**。AGENTS.md には「DB: PostgreSQL」とあるが、少なくとも本 DDL は MySQL 用である。SQL ファイル（`UpdateLineSales.sql` の `now()` 等）は両方言で動作し得るため、実運用 DB は導入環境依存（未確定）。
- （推測）テーブルサフィックス `_XXXXX`（SQL 中の `/*$domainId*/`）は導入企業・事業所単位のマルチテナント分割方式。`AbstractService#createSqlParam()` が `domainId` を供給していることが根拠。
- 検索条件「遅延分のみ」（`razyOnly`）の厳密な抽出条件（納期超過の判定式）は `rorder/FindSlipLineByCondition.sql` 内の条件分岐に依存するため、本書では SQL レベルの詳細展開は省略した（SQL ファイル: `WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/sql/rorder/FindSlipLineByCondition.sql`）。
