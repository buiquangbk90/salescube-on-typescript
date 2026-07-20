# 要件定義書 — 受注（rorder）

- 対象パッケージ: `jp.co.arkinfosys.action.rorder` / `jp.co.arkinfosys.service.rorder` ほか関連クラス
- 作成ツール: claude
- 作成日: 2026-07-20

## 1. 業務概要

受注（rorder）ドメインは、販売管理システム SalesCube における**受注伝票の登録・照会・管理**を担う業務領域である。販売業務フロー「見積 → 受注 → 売上 → 請求 → 入金」のうち、見積の次工程・売上の前工程に位置する。

主な業務は以下の3つ。

1. **受注入力** — 受注伝票（ヘッダ＋明細行）の新規登録・更新・削除。見積伝票からの複写起票にも対応（`InputROrderAction.copyFromEstimate()`）。
2. **受注検索** — 伝票単位／明細単位での受注検索と、検索結果の Excel 出力（`SearchROrderAction`, `SearchROrderResultOutputAction`）。
3. **オンライン受注取込** — 通販サイトの受注データファイル（タブ区切りテキスト）をワークテーブルに取り込み、受注伝票として起票する（`ImportOnlineOrderAction`, `ImportOnlineOrderService`）。

受注明細は売上ドメインから参照され、売上計上の進捗に応じて受注残数・完納状態が更新される（`jp.co.arkinfosys.service.RoSlipSalesService` が `rorder/UpdateLineSales.sql`, `rorder/UpdateSlipSales.sql` を実行）。

## 2. 関連画面一覧

| 画面ID | 画面名 | アクションクラス | JSP |
|---|---|---|---|
| 0300 (`Constants.MENU_ID.INPUT_RORDER`) | 受注入力画面 | `jp.co.arkinfosys.action.rorder.InputROrderAction` | `WEB-INF/view/rorder/inputROrder/inputROrder.jsp` |
| 0301 (`Constants.MENU_ID.SEARCH_RORDER`) | 受注検索画面 | `jp.co.arkinfosys.action.rorder.SearchROrderAction` | `WEB-INF/view/rorder/searchROrder/search.jsp` |
| 0303 (`Constants.MENU_ID.IMPORT_ONLINE_ORDER`) | オンライン受注データ取込画面 | `jp.co.arkinfosys.action.rorder.ImportOnlineOrderAction` | `WEB-INF/view/rorder/importOnlineOrder/importOnlineOrder.jsp` |
| （0301 の出力機能） | 受注検索結果 Excel 出力 | `jp.co.arkinfosys.action.rorder.SearchROrderResultOutputAction` | `WEB-INF/view/rorder/searchROrderResultOutput/excel.jsp`, `resultList.jsp` |
| （Ajax） | 受注検索結果一覧（非同期） | `jp.co.arkinfosys.action.ajax.rorder.SearchROrderResultAjaxAction` | `WEB-INF/view/ajax/rorder/searchROrderResultAjax/result.jsp` |
| （Ajax） | オンライン受注取込結果一覧（非同期） | `jp.co.arkinfosys.action.ajax.rorder.ImportOnlineOrderResultAjaxAction` | `WEB-INF/view/ajax/rorder/importOnlineOrderResultAjax/result.jsp` |

※ 受注入力画面の画面タイトルは「受注入力画面」（`inputROrder.jsp` 9行目）。

## 3. 機能一覧

受注入力画面の基本機能は基底クラス `jp.co.arkinfosys.action.AbstractSlipEditAction` の `@Execute` メソッドを継承して実現している。

| 機能ID | 機能名 | 概要 | 対応メソッド |
|---|---|---|---|
| RO-01 | 受注伝票新規入力（初期表示） | フォーム初期化・プルダウン生成・受注日/出荷日にシステム日付を設定 | `AbstractSlipEditAction#index()`（`InputROrderForm#setDefaultSelected()`） |
| RO-02 | 受注伝票読込・編集 | 伝票番号を指定して伝票＋明細をロードし編集表示。行ごとの引当可能数・完納状態を設定 | `AbstractSlipEditAction#load()` / `InputROrderAction#loadData()`, `#afterLoad()` |
| RO-03 | 受注伝票登録・更新 | ヘッダ＋明細の一括保存。新規時は `SEQ_MAKER` で伝票番号採番、更新時は排他制御 | `AbstractSlipEditAction#upsert()` / `RoSlipService#save()`, `RoLineService#save()` |
| RO-04 | 受注伝票削除 | 伝票・明細を削除。オンライン受注関連レコードも削除 | `AbstractSlipEditAction#delete()` / `InputROrderAction#afterDelete()` |
| RO-05 | 見積伝票からの複写起票 | 見積伝票番号から受注伝票を生成し入力画面に展開 | `InputROrderAction#copyFromEstimate()`, `#copy()`, `#createROrderSlipByEstimate()` |
| RO-06 | オンライン受注データからの起票 | 取込済みワークデータ＋顧客マスタから受注伝票を組み立てて入力画面に表示。配送料行を自動追加 | `InputROrderAction#online()` |
| RO-07 | 受注検索（初期表示） | 検索条件プルダウン（分類・取引区分等）を生成。既定の検索対象は明細単位 | `SearchROrderAction#doAfterIndex()`, `#createList()` |
| RO-08 | 受注検索（実行） | 伝票単位／明細単位で件数取得＋ページング検索（Ajax） | `SearchROrderResultAjaxAction#doCount()`, `#execSearch()` / `ROrderService#getSearchResult()` |
| RO-09 | 受注検索結果 Excel 出力 | 検索結果を全件取得し Excel 形式で出力 | `SearchROrderResultOutputAction#excel()` |
| RO-10 | オンライン受注ファイル取込 | タブ区切りファイル（29列）を検証してワークテーブルへ登録。既存 order-id はスキップ | `ImportOnlineOrderAction#importFile()`, `#processLine()` / `ImportOnlineOrderService#insertWork()` |
| RO-11 | 取込データ全削除（初期化） | ワークテーブルの全件削除 | `ImportOnlineOrderAction#init()` / `OnlineOrderService#deleteWorksAll()` |
| RO-12 | 取込データ個別削除 | 指定 order-id のワークデータ削除 | `ImportOnlineOrderAction#delete()` / `OnlineOrderService#deleteWorksByRoId()` |
| RO-13 | 受注残数照会 | 商品コード（セット親品番含む）を指定して受注残数を集計 | `RoSlipService#countRestQuantityByProductCode()`（`rorder/CountRestQuantityByProductCode.sql`） |
| RO-14 | 売上連携（受注消込） | 売上入力時に受注明細の残数・状態、伝票状態を更新（売上ドメイン側から呼出） | `RoSlipSalesService#updateSlipBySales()` ほか（`rorder/UpdateLineSales.sql`, `UpdateSlipSales.sql`） |

## 4. 業務フロー

```
【起票ルート（3通り）】
  (a) 手入力            : 受注入力画面で新規入力
  (b) 見積からの複写     : 見積伝票番号を指定 → copyFromEstimate → 明細・顧客情報を引き継ぎ
  (c) オンライン受注取込 : ファイル取込(ONLINE_ORDER_WORK) → 一覧から選択 → online() で伝票展開

        │
        ▼
【受注登録】 upsert
  ・伝票状態 = "0"（受注）で登録（Constants.STATUS_RORDER_SLIP.RECEIVED）
  ・明細行状態 = "0"（受注）（SlipStatusCategoryTrns.RO_LINE_NEW）
  ・オンライン受注の場合は ONLINE_ORDER_REL に関連レコードを登録（afterUpsert）
        │
        ▼
【売上計上（売上ドメインから）】 RoSlipSalesService
  ・明細の残数(REST_QUANTITY)・最終出荷日(LAST_SHIP_DATE)・状態を更新
  ・一部出荷 → 明細状態 "1"（分納中） / 全量出荷 → 明細状態 "9"（売上完了）
        │
        ▼
【完納】
  ・全明細の状態が "9" の場合、伝票状態も "9"（売上完了）に更新
    （InputROrderAction#beforeUpsert の判定ロジック）
  ・状態 "9" の伝票は編集・削除不可（InputROrderAction#initForms で statusUpdate=false）
```

## 5. 入力・出力

- 入力項目:
  - **伝票ヘッダ**（`InputROrderForm`）: 受注日（必須）、出荷日、納期指定日、受付番号、客先伝票番号、担当者、顧客コード（必須）、支払条件（締日グループ＋回収サイクル）、取引区分、税転嫁・税端数・単価端数区分、納入先情報（コード・名称・住所・担当者・敬称・TEL/FAX/E-MAIL/URL）、配送業者・配送時間帯、備考
  - **明細行**（`ROrderLineDto`）: 商品コード、商品名、数量、仕入単価・仕入金額、売上単価・売価金額、消費税率、完納区分、備考・ピッキング備考・商品備考、棚番
  - **オンライン受注ファイル**: タブ区切り 29 列（`Constants.ONLINE_ORDER_FILE.COLUMN_COUNT = 29`）。項目は order-id, order-item-id, purchase-date, payments-date, buyer-email, buyer-name, buyer-phone-number, sku, product-name, quantity-purchased, currency, item-price, item-tax, shipping-price, shipping-tax, ship-service-level, recipient-name, ship-address-1〜3, ship-city, ship-state, ship-postal-code, ship-country, ship-phone-number, delivery-start-date, delivery-end-date, delivery-time-zone, delivery-Instructions（`ImportOnlineOrderService#createOnlineOrderWorkDto()` の格納順より）
- 出力（帳票・DB更新）:
  - DB 更新: `RO_SLIP_TRN`（受注伝票）、`RO_LINE_TRN`（受注明細）への INSERT/UPDATE/DELETE（`rorder/InsertRoSlip.sql`, `InsertLine.sql`, `UpdateSlip.sql`, `UpdateLine.sql`, `DeleteSlip.sql`, `DeleteLinesBySlipId.sql`, `DeleteLinesByLineIds.sql`）
  - DB 更新: `ONLINE_ORDER_WORK`（取込ワーク）、`ONLINE_ORDER_REL`（受注伝票との関連）への登録・削除
  - 画面出力: 受注検索結果の Excel 出力（`searchROrderResultOutput/excel.jsp`。JasperReports 帳票ではなく JSP による Excel 形式出力）

## 6. 業務ルール・バリデーション

いずれもソース根拠付き。

1. **日付の前後関係**: 受注日 ≤ 出荷日、受注日 ≤ 納期指定日、出荷日 ≤ 納期指定日（`InputROrderForm#validate()` の「前後関係チェック」）。
2. **明細必須**: 有効な明細行が 1 行もない場合はエラー `errors.noline`。明細行は商品コード・数量・仕入単価・仕入金額・売上単価・売価金額が必須（同メソッド）。
3. **数値 0 禁止**: 数量・単価・金額は 0 不可。ただし値引き・配送料等の**特殊コード商品**（`Constants.EXCEPTIANAL_PRODUCT_CODE_LIST`、コード `XXXXXXXXX*`）は仕入単価・仕入金額の 0 を許容（`DiscountUtil.isExceptianalProduct()` 判定）。
4. **存在チェック**: 顧客コード・商品コードはマスタ実在チェック（`InputROrderAction#validateAtCreateSlip()`, `#checkProducts()`）。
5. **状態遷移と編集制御**: 明細行の状態が全て "9"（売上完了）なら伝票状態を "9" に設定（`InputROrderAction#beforeUpsert()`）。伝票状態 "9" は更新・削除不可（`#initForms()` で `statusUpdate=false`、`deletable=statusUpdate`）。明細状態 "1"（分納中）・"9" の行は削除不可（`#afterLoad()`）。
6. **排他制御**: 更新・削除時は `UPD_DATETM` を条件に `rorder/LockSlip.sql` で行ロックし、他者更新を検出（`RoSlipService#updateRecord()`, `#deleteById()`）。
7. **採番**: 伝票番号・明細行 ID は `SeqMakerService#nextval()`（`SEQ_MAKER` テーブル）で採番（`RoSlipService#insertRecord()`, `RoLineService#save()`）。
8. **金額端数処理**: 合計金額（売価・原価・伝票合計）は単価端数区分、消費税は税端数区分に従って丸め（`RoSlipService#insertRecord()` の `NumberConverter`）。端数処理区分は切捨て／切上げ／四捨五入（`InputROrderAction#bigDecimalModeCodeFromStringToInt()`）。
9. **税率の固定**: 伝票作成時の消費税率を保持し、現在税率と異なる場合は伝票作成時の税率を優先（`InputROrderForm#setSlipTaxRate()`）。税率は日付指定で `TaxRate` マスタから取得（`InputROrderAction#initTax()`）。
10. **支払条件の分解**: 画面の支払条件 3 桁コードを、前 2 桁＝締日グループ・後 1 桁＝回収サイクル区分に分解して保存（`RoSlipService#insertRecord()`, `#updateRecord()`）。
11. **オンライン受注固有ルール**:
    - 顧客コードは固定値 `Constants.EXCEPTIANAL_CUSTOMER_CODE.ONLINE_ORDER`（= `"undefined"`）。この顧客の場合のみ納入先欄が編集可能（`InputROrderAction#initForms()`）。
    - オンライン受注時は納入先担当者名・郵便番号・住所1・電話番号が必須（`InputROrderForm#validate()`）。
    - 明細行の配送料合計が 0 でない場合、特殊商品 `XXXXXXXXXA`（オンライン配送料）の明細行を自動追加し、税込配送料を顧客の税端数区分で税抜化（`InputROrderAction#online()`, `#toNoTax()`）。
    - SKU は商品マスタのオンライン品番（`ProductService#findProductByOnlinePCode()`）で照合し、不一致はエラー。
    - 取込時、同一 order-id が既にワークテーブルにある行は登録しない（`ImportOnlineOrderAction#importFile()`）。
    - 伝票登録時、受付番号（order-id）1 件につき `ONLINE_ORDER_REL` を 1 件登録（`InputROrderAction#afterUpsert()`）。伝票削除時は関連レコードも削除（`#afterDelete()`）。
    - 取込ファイルの各列は日付型（ISO8601）・整数型・最大長のチェックを実施（`ImportOnlineOrderAction#processLine()`）。
12. **検索仕様**: 検索対象は「伝票単位」「明細単位」の 2 モード（`ROrderService#getSearchResult()`）。受注番号は完全一致、受付番号・顧客コード・商品コード・仕入先コードは前方一致、顧客名・商品名・仕入先名・顧客担当者は部分一致（`ROrderService#setConditionParam()`）。「残分のみ」「遅延分のみ」の絞り込みあり（`ROrderService.Param.REST_ONLY`, `RAZY_ONLY`）。

## 7. 関連マスタ・トランザクション

テーブル名は DDL（`DB/sql/createtable/CREATE.sql`）上 `_XXXXX` サフィックス付きで定義され、SQL ファイル内では `RO_SLIP_TRN_/*$domainId*/` のようにドメイン ID で置換される。

| テーブル | 用途 |
|---|---|
| `RO_SLIP_TRN` | 受注伝票ヘッダ（エンティティ `jp.co.arkinfosys.entity.RoSlipTrn`）。状態・受注日・顧客・納入先・金額合計・配送情報等 |
| `RO_LINE_TRN` | 受注伝票明細行（エンティティ `RoLineTrn`）。商品・数量・単価・受注残数（`REST_QUANTITY`）・完納状態等 |
| `RO_SLIP_TRN_HIST` / `RO_LINE_TRN_HIST` | 受注伝票／明細の履歴（DDL に定義。監査情報は `AbstractService#updateAudit()` で更新） |
| `ONLINE_ORDER_WORK` | オンライン受注取込ワーク（エンティティ `OnlineOrderWork`）。ファイル 29 列＋ユーザ ID・行番号 |
| `ONLINE_ORDER_REL` | 受注伝票とオンライン受注の関連（エンティティ `OnlineOrderRel`。受注伝票番号・明細行 ID・order-id・item-id） |
| `SEQ_MAKER` | 伝票番号・明細行 ID の採番管理（`SeqMakerService`） |
| 顧客マスタ（`Customer`） | 税転嫁・端数処理・支払条件・取引区分の初期値取得（`CustomerService#findCustomerByCode()`） |
| 商品マスタ（`ProductJoin` / `Product`） | 商品情報・受注限度数（`RO_MAX_NUM`）・在庫管理区分・オンライン品番の取得 |
| 納入先マスタ（`DeliveryAndPre`） | 顧客納入先プルダウンと納入先情報の初期化（`DeliveryService`） |
| 区分マスタ（`CategoryTrn` 系） | 敬称・支払条件・取引区分・税転嫁・完納区分・配送業者・配送時間帯の各プルダウン（`CategoryService`） |
| 税率マスタ（`TaxRate`） | 消費税率の日付指定取得（`TaxRateService`） |
| 見積伝票（`ESTIMATE_SHEET_TRN` 系） | 見積複写時の参照元（`EstimateSheetService`, `EstimateLineService`） |
| 在庫情報 | 明細行ごとの引当可能数の計算（`ProductStockService#calcStockQuantityByProductCode()`） |

## 8. 未確定・推測事項

- （推測）オンライン受注ファイルの列構成（order-id, buyer-email, sku, ship-service-level, purchase-date 等）は Amazon マーケットプレイスの注文レポート形式に酷似しており、Amazon 出品者向け注文データの取込を想定していると考えられる。ソース上に明示的なサイト名の記載はない。
- （推測）テーブル名の `_XXXXX` サフィックス（`/*$domainId*/`）は、導入企業・事業所単位でテーブルを分割するマルチテナント方式と考えられる（`AbstractService#createSqlParam()` が `domainId` を供給していることから）。
- （推測）オンライン受注用顧客コード `"undefined"`（`Constants.EXCEPTIANAL_CUSTOMER_CODE.ONLINE_ORDER`）は、導入時に顧客マスタへ同コードの「通販サイト顧客」を事前登録して運用する前提と考えられる。
- （推測）`ROrderService` のクラス宣言は `AbstractService<PaymentSlipTrn>` を型引数にしている（`ROrderService.java` 27行目）が、実際に扱うのは受注伝票であり、型引数は他ドメインからのコピー残りと思われる（機能上の影響はない）。
- 受注伝票の紙帳票（受注票の印刷）は本ドメイン内には存在しない。`RoSlipTrn.printCount`（`PRINT_COUNT` カラム）が存在するため、帳票出力は `report` ドメイン側で行われる可能性が高い（未確認）。
- `ImportOnlineOrderAction#importFile()` は Seasar のエラーコード `ESSR0744`（一意制約違反）を握りつぶして続行しており、重複キーはエラーではなく仕様としてスキップ扱いとしている。
