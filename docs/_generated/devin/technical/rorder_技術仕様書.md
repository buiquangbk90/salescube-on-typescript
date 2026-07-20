# 受注（rorder）ドメイン技術仕様書

## 1. アーキテクチャ位置づけ

受注ドメインは、SalesCube の SAStruts（Seasar2）アプリケーションにおける MVC 層の一部です。URL リクエストは SAStruts の Action クラスで受け、ActionForm を通じて画面データを受け渡し、Service 層で業務ロジックと DB アクセスを行い、S2JDBC / SQL ファイル（S2JDBC-Gen）で PostgreSQL にアクセスします。JSP（jQuery UI）が画面をレンダリングします。

## 2. クラス構成

### 2.1 Action 層

| クラス | パス | 役割 |
|--------|------|------|
| `SearchROrderAction` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/rorder/SearchROrderAction.java` | 受注検索画面の初期表示、プルダウン生成 |
| `SearchROrderResultAjaxAction` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/ajax/rorder/SearchROrderResultAjaxAction.java` | 受注検索の Ajax 処理、検索結果返却 |
| `SearchROrderResultOutputAction` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/rorder/SearchROrderResultOutputAction.java` | 検索結果の Excel 出力 |
| `InputROrderAction` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/rorder/InputROrderAction.java` | 受注入力画面の表示・登録・更新・削除・見積複写・オンライン取込反映 |
| `ImportOnlineOrderAction` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/rorder/ImportOnlineOrderAction.java` | オンライン受注ファイルアップロード・取込・削除 |

### 2.2 Form 層

| クラス | パス | 役割 |
|--------|------|------|
| `SearchROrderForm` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/form/rorder/SearchROrderForm.java` | 受注検索条件を保持 |
| `InputROrderForm` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/form/rorder/InputROrderForm.java` | 受注伝票・明細行の入出力値、バリデーション、初期化 |
| `ImportOnlineOrderForm` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/form/rorder/ImportOnlineOrderForm.java` | ファイルアップロード、取込済除外フラグ |

### 2.3 Service 層

| クラス | パス | 役割 |
|--------|------|------|
| `ROrderService` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/ROrderService.java` | 受注検索、件数取得、期間指定での商品別数量集計 |
| `RoSlipService` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/RoSlipService.java` | 受注伝票の CRUD、採番、排他制御 |
| `RoLineService` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/RoLineService.java` | 受注明細行の CRUD、商品・在庫情報の設定 |

### 2.4 DTO 層

| クラス | パス | 役割 |
|--------|------|------|
| `ROrderSlipDto` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/dto/rorder/ROrderSlipDto.java` | 受注伝票のデータ転送オブジェクト |
| `ROrderLineDto` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/dto/rorder/ROrderLineDto.java` | 受注明細行のデータ転送オブジェクト |
| `OnlineOrderWorkDto` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/dto/rorder/OnlineOrderWorkDto.java` | オンライン受注取込用 DTO |
| `OnlineOrderWorkRelDto` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/dto/rorder/OnlineOrderWorkRelDto.java` | オンライン受注取込画面の検索結果 DTO |

### 2.5 Entity 層

| クラス | パス | 対応テーブル |
|--------|------|------------|
| `RoSlipTrn` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/RoSlipTrn.java` | `RO_SLIP_TRN_/*$domainId*/` |
| `RoLineTrn` | `WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/RoLineTrn.java` | `RO_LINE_TRN_/*$domainId*/` |

## 3. DI / AOP 設定

Action/Service/Form は Seasar2 の DI コンテナで管理されています。
- Action クラスには `@ActionForm` と `@Resource` で Form を注入。
- Service クラスには `@Resource` で依存サービス（`SeqMakerService`、`ProductSetService`、`CustomerService`、`ProductService`、`DeliveryService`、`CategoryService`、`ProductStockService`、`OnlineOrderService`、`OnlineOrderRelService` 等）を注入。
- Form クラスには `@Component(instance = InstanceType.REQUEST)` が付与され、リクエストスコープで管理される（`InputROrderForm`）。
- SQL ファイルは、Service クラスが継承する `AbstractService#selectBySqlFile` / `updateBySqlFile` により実行される。

## 4. データアクセス詳細

### 4.1 受注伝票 CRUD SQL

| 処理 | SQL ファイル | 概要 |
|------|-------------|------|
| 取得 | `rorder/FindRoSlipTrnBySlipId.sql` | 受注番号で受注伝票を取得 |
| 登録 | `rorder/InsertRoSlip.sql` | 受注伝票を新規登録（PK `RO_SLIP_ID` は自動採番） |
| 更新 | `rorder/UpdateSlip.sql` | 受注伝票を更新 |
| 削除 | `rorder/DeleteSlip.sql` | 受注番号で受注伝票を削除 |
| ロック | `rorder/LockSlip.sql` | `FOR UPDATE` による排他ロック |

### 4.2 受注明細行 CRUD SQL

| 処理 | SQL ファイル | 概要 |
|------|-------------|------|
| 取得（伝票指定） | `rorder/FindRoLineTrnBySlipId.sql` | 受注番号で明細行を取得 |
| 取得（行指定） | `rorder/FindRoLineTrnByLineId.sql` | 明細行 ID で取得 |
| 取得（名称付き） | `rorder/FindRoLineAndCategoryBySlipId.sql` | 受注番号で明細行を取得し、完納区分名を結合 |
| 登録 | `rorder/InsertLine.sql` | 明細行を新規登録 |
| 更新 | `rorder/UpdateLine.sql` | 明細行を更新 |
| 行 ID 指定削除 | `rorder/DeleteLinesByLineIds.sql` | 明細行 ID 配列で削除 |
| 伝票指定削除 | `rorder/DeleteLinesBySlipId.sql` | 受注番号で明細行を全削除 |

### 4.3 検索 SQL

| 処理 | SQL ファイル | 概要 |
|------|-------------|------|
| 伝票件数 | `rorder/FindSlipCntByCondition.sql` | 検索条件に一致する伝票数を DISTINCT カウント |
| 明細行件数 | `rorder/FindSlipLineCntByCondition.sql` | 検索条件に一致する明細行数を DISTINCT カウント |
| 伝票一覧 | `rorder/FindSlipByCondition.sql` | 伝票単位の検索結果一覧 |
| 明細行一覧 | `rorder/FindSlipLineByCondition.sql` | 明細行単位の検索結果一覧 |

### 4.4 その他 SQL

| 処理 | SQL ファイル | 概要 |
|------|-------------|------|
| 受注残数集計 | `rorder/CountRestQuantityByProductCode.sql` | 商品コードを指定し、売上数量を差し引いた受注残数を集計（セット商品対応） |
| 期間別商品コード | `rorder/FindProductCodeByRoDate.sql` | 指定期間内の受注に含まれる商品コードを取得 |
| 期間別数量集計 | `rorder/CountQuantityByProductCodeAndRoDate.sql` | 指定期間内の受注数量を集計 |

## 5. 外部連携・帳票

### 5.1 外部連携

- オンライン受注取込は、通販サイト等からの注文ファイル（CSV 等と推測）をアップロードして取り込む。
- `ImportOnlineOrderAction` でファイルを受け取り、行ごとにバリデーション後、`ImportOnlineOrderService` 経由で `ONLINE_ORDER_WORK` テーブルに保存する。
- 取込データは `OnlineOrderService.findOnlineOrderWorkByRoId` 等で検索・参照され、受注入力画面へ反映される。

### 5.2 帳票・Excel

- 検索結果 Excel 出力は `SearchROrderResultOutputAction` と `excel.jsp` / `resultList.jsp` で実装。`Content-Disposition: attachment; filename="RORDER_SLIP.xls"` として HTML 形式の Excel を出力する。
- JasperReports テンプレートは `WEB-INF/report_template/` に存在するが、受注伝票専用のテンプレートは確認できなかった（推測）。

## 6. 例外・ログ・セキュリティ

### 6.1 例外処理

- 業務例外は `ServiceException` を使用（`RoSlipService`、`RoLineService`、`ROrderService`）。
- 排他制御失敗時は `UnabledLockException` をスロー（`RoSlipService#save`、`#updateRecord`、`#deleteById`）。
- `InputROrderAction` 内では `try-catch` で例外を捕捉し、`e.printStackTrace()` と `super.errorLog(e)` でログ出力後、再スローする。

### 6.2 ログ

- 基底クラス `AbstractSlipEditAction` / `AbstractAction` が提供する `errorLog` メソッドを使用してエラーログを出力する（`InputROrderAction#errProc`）。
- 実行 SQL 等の詳細ログは Seasar2 の設定に依存する（推測）。

### 6.3 セキュリティ

- 入力値は Struts の Validator アノテーション（`@Required`、`@DateType`、`@IntegerType`）でバリデーションする。
- SQL インジェクション対策は S2JDBC のバインド変数（`/*param*/`）で対応。
- 画面遷移の二重送信防止には `TokenProcessor` を使用している（`InputROrderAction#initForms`）。
- 権限チェックは `userDto.isMenuUpdate(Constants.MENU_ID.INPUT_RORDER)` 等で実施する（`InputROrderAction#copy`）。

## 7. 依存関係

### 7.1 他ドメイン・他サービスへの依存

- `estimate` ドメイン：`EstimateSheetService`、`EstimateLineService`（見積伝票からの複写）。
- `master` ドメイン：`CustomerService`、`ProductService`、`CategoryService`、`ProductClassService` 等。
- `stock` ドメイン：`ProductStockService`（在庫計算）。
- `deposit`/`payment` ドメイン：支払条件、取引区分等のカテゴリを共有。
- `sales` ドメイン：受注残数計算で `SALES_SLIP_TRN`、`SALES_LINE_TRN` を参照。

### 7.2 フレームワーク・ライブラリ

- Seasar2（SAStruts、S2JDBC、S2Container）
- Apache Struts 1.x（アクション、フォーム、バリデーション）
- JasperReports（帳票出力の可能性）
- jQuery UI（画面 JavaScript）
- PostgreSQL

## 8. 不確実な点・推測事項

- `ONLINE_ORDER_REL_TRN` テーブルの正確な物理名とスキーマはソースからは確認できず、Service/Entity 名から推測している。
- オンライン受注ファイルの想定フォーマット（CSV 形式、文字コード、列定義等）は `ImportOnlineOrderAction` 内のバリデーションから推測するしかなく、完全な仕様は不明（推測）。
- 受注伝票の印刷帳票は JasperReports テンプレートを使用する可能性があるが、受注専用テンプレートは確認できなかった（推測）。
- 排他制御は `LockSlip.sql` の `FOR UPDATE` と、`updDatetm` を用いた楽観ロックの組み合わせと推測されるが、ロックポリシーの詳細は `AbstractSlipService` まで追っていない（推測）。
