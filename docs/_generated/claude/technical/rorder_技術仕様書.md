# 技術仕様書 — 受注（rorder）

- 対象パッケージ: `jp.co.arkinfosys.action.rorder` / `jp.co.arkinfosys.action.ajax.rorder` / `jp.co.arkinfosys.form.rorder` / `jp.co.arkinfosys.dto.rorder` / `jp.co.arkinfosys.service.rorder` ほか関連クラス
- 作成ツール: claude
- 作成日: 2026-07-20

## 1. アーキテクチャ位置づけ

Seasar2（SAStruts + S2JDBC + S2Container）の標準的なレイヤ構成に従う。

```
ブラウザ（JSP + jQuery。Ajax は独自の doHref/非同期 POST）
   │ HTTP（RoutingFilter が URL → Action メソッドへルーティング）
   ▼
SAStruts Action（jp.co.arkinfosys.action.rorder.*）
   │  @ActionForm で REQUEST スコープの Form を注入
   │  @Execute メソッド単位でトランザクション境界（TxAttributeCustomizer）
   ▼
Service（jp.co.arkinfosys.service.* / service.rorder.*）
   │  S2AbstractService 継承。SQL は 2WaySQL ファイル
   │  （jp/co/arkinfosys/entity/sql/rorder/*.sql）を selectBySqlFile/updateBySqlFile で実行
   ▼
Entity（jp.co.arkinfosys.entity.RoSlipTrn / RoLineTrn / OnlineOrderWork / OnlineOrderRel）
   ▼
RDBMS: MySQL（jdbc.dicon の有効設定は com.mysql.jdbc.Driver / jdbc:mysql://localhost:3306/salescube、
        s2jdbc.dicon の dialect は mysqlDialect。DDL も ENGINE=INNODB）
```

※ テンプレート・AGENTS.md には「PostgreSQL」とあるが、リポジトリの有効設定は MySQL（`jdbc.dicon` の PostgreSQL ブロックはコメントアウト。詳細は §8）。

伝票入力系画面は共通基底 `AbstractSlipEditAction`（テンプレートメソッドパターン）に、検索系は `AbstractSearchAction` / `AbstractSearchResultAction` に、ファイル取込は `AbstractXSVUploadAction` に載る構造で、rorder 固有クラスはフックメソッドのオーバーライドで差分実装している。

## 2. クラス構成

| レイヤ | クラス | 責務 |
|---|---|---|
| Action | `action.rorder.InputROrderAction`（`AbstractSlipEditAction<ROrderSlipDto, ROrderLineDto>` 継承） | 受注入力画面。オンライン受注展開 `online()`、見積複写 `copyFromEstimate()`、登録検証 `validateAtCreateSlip()`、前後処理フック（`beforeUpsert`/`afterUpsert`/`afterLoad`/`afterDelete`） |
| Action | `action.rorder.SearchROrderAction`（`AbstractSearchAction<List<Object>>` 継承） | 受注検索画面の初期表示・プルダウン生成 |
| Action | `action.rorder.SearchROrderResultOutputAction`（`AbstractSearchResultAction` 継承） | 検索結果の Excel 出力（`excel()`、全件検索） |
| Action | `action.rorder.ImportOnlineOrderAction`（`AbstractXSVUploadAction` 継承） | オンライン受注ファイル取込。行パース `processLine()`、取込 `importFile()`、ワーク削除 `init()`/`delete()` |
| Action(Ajax) | `action.ajax.rorder.SearchROrderResultAjaxAction` | 受注検索のページング検索（件数＋結果） |
| Action(Ajax) | `action.ajax.rorder.ImportOnlineOrderResultAjaxAction` | 取込ワーク＋伝票化状況の一覧表示 |
| Form | `form.rorder.InputROrderForm`（`AbstractSlipEditForm<ROrderLineDto>` 継承、`@Component(instance = InstanceType.REQUEST)`） | 受注入力の画面状態・伝票検証 `validate()`・オンラインデータ展開 `setUp()`・見積展開 `initialize(InputEstimateDto, Customer)` |
| Form | `form.rorder.SearchROrderForm`（`AbstractSearchForm` 継承） | 検索条件保持（`@LongType`/`@DateType` による型検証） |
| Form | `form.rorder.ImportOnlineOrderForm`（`AbstractSearchForm` 継承） | アップロードファイル（`org.apache.struts.upload.FormFile`）保持・必須検証 |
| Service | `service.RoSlipService`（`AbstractSlipService<RoSlipTrn, ROrderSlipDto>` 継承） | 受注伝票ヘッダの CRUD・採番・楽観ロック |
| Service | `service.RoLineService`（`AbstractLineService<RoLineTrn, ROrderLineDto, ROrderSlipDto>` 継承） | 受注明細の CRUD・行番号採番・商品/在庫情報補完 |
| Service | `service.ROrderService`（`AbstractService<PaymentSlipTrn>` 継承） | 受注検索（伝票単位/明細単位）・受注数集計 |
| Service | `service.RoSlipSalesService`（`RoSlipService` 継承） | 売上ドメインからの受注消込（残数・状態更新） |
| Service | `service.OnlineOrderService`（`AbstractService<OnlineOrderWork>` 継承) | オンライン受注ワークの CRUD・関連 JOIN 検索 |
| Service | `service.OnlineOrderRelService`（`AbstractService<OnlineOrderRel>` 継承） | 受注伝票—オンライン受注関連の CRUD |
| Service | `service.rorder.ImportOnlineOrderService`（`AbstractService<OnlineOrderWork>` 継承） | 取込ファイル 1 行 → `OnlineOrderWorkDto` 変換、`OnlineOrderService` への委譲 |
| DTO | `dto.rorder.ROrderSlipDto`（`AbstractSlipDto<ROrderLineDto>` 継承） | 伝票ヘッダの転送・明細リスト保持 |
| DTO | `dto.rorder.ROrderLineDto`（`AbstractLineDto` 継承） | 明細行の転送（画面 hidden 項目含む） |
| DTO | `dto.rorder.OnlineOrderWorkDto` / `OnlineOrderWorkRelDto` | 取込ワーク行 / ワーク＋伝票化状況の一覧行 |
| Entity | `entity.RoSlipTrn` / `entity.RoLineTrn` | `RO_SLIP_TRN` / `RO_LINE_TRN` への JPA アノテーションマッピング（`@Entity`, `@Column`, `@Id @GeneratedValue`） |
| Entity | `entity.OnlineOrderWork` / `entity.OnlineOrderRel` | `ONLINE_ORDER_WORK` / `ONLINE_ORDER_REL` のマッピング |
| Entity(Join) | `entity.join.OnlineOrderRelJoin` | ワーク×関連×伝票の JOIN 結果保持 |

## 3. DI / AOP 設定

DI 設定は `WEB/SalesCube/src/main/resources/*.dicon`。rorder 固有の dicon はなく、命名規約ベースの SMART deploy（`convention.dicon` のルートパッケージ `jp.co.arkinfosys`）で自動登録される。

- **インジェクション**: `@Resource` によるフィールドインジェクション。例: `InputROrderAction` は `RoSlipService`, `RoLineService`, `CustomerService`, `ProductService`, `OnlineOrderService`, `OnlineOrderRelService`, `ProductStockService`, `EstimateSheetService`, `EstimateLineService`, `CategoryService`, `DeliveryService` を注入（`InputROrderAction.java` 128〜190行）。Form は `@ActionForm @Resource`。
- **トランザクション境界**（`customizer.dicon`）:
  - `actionCustomizer` / `serviceCustomizer` の双方に `org.seasar.framework.container.customizer.TxAttributeCustomizer` が登録されており、Action の `@Execute` メソッドおよび Service メソッドがトランザクション属性（デフォルト Required）で AOP される。`@TransactionAttribute` アノテーションは rorder ソース上に明示されておらず、デフォルト適用（推測: 全メソッド Required）。
  - つまり `upsert()` 1 リクエスト＝1 トランザクションで、伝票 INSERT/UPDATE・明細 INSERT/UPDATE/DELETE・オンライン関連登録が原子的にコミットされる。
- **アスペクト**（`customizer.dicon`）:
  - `actionMessagesThrowsInterceptor` … Action の例外を ActionMessages に変換。
  - `traceCustomizer` … Action・Service にトレースログ AOP。
  - `jp.co.arkinfosys.s2extend.ExecuteAnnotationAspectCustomizer` … 通常 Action には `actionMethodInvocationInterceptor`（Login 除外）、`action.ajax` 配下には `ajaxInvocationInterceptor` を適用。rorder の画面 Action と Ajax Action で適用インターセプタが異なる。
- **データソース**: `jdbc.dicon` の `XADataSourceImpl`（MySQL）＋ `jta.dicon` の JTA トランザクションマネージャ。S2JDBC 設定は `s2jdbc.dicon`（`dialect = mysqlDialect`）。

## 4. データアクセス

- 使用エンティティ / テーブル:
  - `RoSlipTrn` → `RO_SLIP_TRN_<domainId>`（受注伝票）
  - `RoLineTrn` → `RO_LINE_TRN_<domainId>`（受注明細）
  - `OnlineOrderWork` → `ONLINE_ORDER_WORK_<domainId>`（取込ワーク）
  - `OnlineOrderRel` → `ONLINE_ORDER_REL_<domainId>`（伝票—注文関連）
  - 採番: `SEQ_MAKER`（`SeqMakerService#nextval("RO_SLIP_TRN" | "RO_LINE_TRN")`）

- 代表的なSQL・S2JDBCクエリ:
  - データアクセスは **S2JDBC の SqlFile 方式（2WaySQL）が中心**。SQL ファイルは `WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/sql/rorder/` に 21 本。`AbstractService#setEntityClass()` が `sqlFilePathPrefix = "jp/co/arkinfosys/entity/sql/"` を設定する。
  - テーブル名は `RO_SLIP_TRN_/*$domainId*/` のように **ドメインID をテーブル名サフィックスとして埋め込む**（`AbstractService#createSqlParam()` が `domainDto.domainId` を常時パラメータ供給）。
  - 参照系: `FindRoSlipTrnBySlipId.sql`（伝票 1 件）、`FindRoLineAndCategoryBySlipId.sql`（明細＋完納区分名）、`FindSlipByCondition.sql` / `FindSlipLineByCondition.sql`（検索。LIMIT/OFFSET・動的 ORDER BY）、`FindSlipCntByCondition.sql` / `FindSlipLineCntByCondition.sql`（件数）、`CountRestQuantityByProductCode.sql`（受注残集計）、`FindProductCodeByRoDate.sql` / `CountQuantityByProductCodeAndRoDate.sql`（期間別受注集計）
  - 更新系: `InsertRoSlip.sql`, `UpdateSlip.sql`, `DeleteSlip.sql`, `InsertLine.sql`, `UpdateLine.sql`, `DeleteLinesBySlipId.sql`, `DeleteLinesByLineIds.sql`（IN 句一括削除）, `UpdateSlipSales.sql`, `UpdateLineSales.sql`（売上連携）
  - ロック: `LockSlip.sql`
  - オンライン受注系は `entity/sql/onlineorder/` 配下（`InsertOnlineOrderWork.sql`, `DeleteOnlineOrderWork.sql`, `FindOnlineOrderWorkByRoIdAndUserId.sql`, `FindOnlineOrderWorkRelByUserId.sql`, `InsertOnlineOrderRel.sql`, `DeleteOnlineOrderRel.sql` ほか）
  - エンティティ⇔DTO 変換は `org.seasar.framework.beans.util.Beans#createAndCopy()`（日付フォーマット・金額丸めコンバータ `jp.co.arkinfosys.s2extend.NumberConverter` を併用。`RoSlipService#insertRecord()`）

- トランザクション制御:
  - 境界は §3 の通り AOP（宣言的）。rorder ソース内に明示的な commit/rollback はない。
  - **楽観ロック**: 更新・削除時に画面保持の `UPD_DATETM` を条件へ含め `rorder/LockSlip.sql` を実行し、結果を `LockResult`（SUCCEEDED / NOT_EXISTS / ALREADY_LOCKED / ALREADY_UPDATED、`AbstractService.LockResult`）で判定（`RoSlipService#updateRecord()`, `#deleteById()`）。`AbstractService` には `FOR UPDATE` 定数もあり悲観ロック併用（`LockSlip.sql` 内で使用。推測: SELECT ... FOR UPDATE 形式）。
  - **監査情報**: `createSqlParam()` が CRE/UPD/DEL の FUNC・USER を自動設定。削除・更新前に `AbstractService#updateAudit()`（`UpdateAudit.sql`）で履歴用の監査カラムを更新し、DB 側トリガまたは履歴テーブル運用に備える（履歴テーブル `RO_SLIP_TRN_HIST` 等。書込み主体はソース上未確認 → §8）。

## 5. 外部連携・帳票

- **オンライン受注ファイル連携**: 通販サイトの注文データ（タブ区切り 29 列、`Constants.ONLINE_ORDER_FILE.COLUMN_COUNT`）を `AbstractXSVUploadAction#readXSV()` で読込む。文字コード変換失敗時は `UnsupportedEncodingException` → `errors.file.encoding`。列構成は Amazon 注文レポート類似（推測、§8）。
- **帳票**: rorder ドメインに JasperReports 帳票はない。検索結果 Excel は JSP（`searchROrderResultOutput/excel.jsp`）でコンテンツタイプを Excel にして出力する方式。
- **バッチ・ストアドプロシージャ**: `DB/batch/` に受注テーブルを扱うものはない（grep 確認）。
- **他ドメインへの提供 API（Java メソッドレベル）**:
  - `RoSlipSalesService`（売上ドメインが使用）… 売上計上時の受注明細消込
  - `RoSlipService#countRestQuantityByProductCode()` … 在庫・発注系画面の受注残表示（セット品の親品番を `ProductSetService` で展開して集計）
  - `ROrderService#findProductCodeByRoDate()` / `countQuantityByProductCodeAndRoDate()` … 期間集計（発注点計算等での利用を想定。推測）

## 6. 例外・ログ・セキュリティ

- **例外**: サービス層は検査例外 `jp.co.arkinfosys.service.exception.ServiceException`（`stopOnError` フラグで続行可否を表現）に集約。楽観ロック失敗は `UnabledLockException`。Action 層では try-catch で `errorLog()` 記録後、`ActionMessages` に `errors.*` キーで詰めて画面表示（例: `ImportOnlineOrderAction#importFile()` は `e.isStopOnError()` が真の場合のみ再スロー）。`actionMessagesThrowsInterceptor`（`customizer.dicon`）が未捕捉例外をメッセージ化する。
- **ログ**: log4j（`WEB/SalesCube/src/main/resources/log4j.properties`）。共通基底 `CommonResources#errorLog()` が `org.apache.log4j.Logger` でスタックトレースを出力。`traceCustomizer` により Action/Service のメソッドトレースも可能。なお `InputROrderAction` には `e.printStackTrace()` の直書きも残る（1315 行中複数箇所）。
- **セキュリティ（権限）**: メニュー ID 単位の機能権限。`UserDto#isMenuValid(menuId)`（表示可否）/ `#isMenuUpdate(menuId)`（更新可否）で判定し、受注入力はメニュー ID `0300`（`Constants.MENU_ID.INPUT_RORDER`）を使用（`ImportOnlineOrderAction#index()` ほか）。フォームの `menuUpdate` フラグで画面の更新系ボタンを制御。
- **CSRF/二重送信**: `org.apache.struts.util.TokenProcessor#saveToken()` による同期トークン（`InputROrderAction#initForms(ROrderSlipDto)` 516行）。
- **入力検証**: SAStruts バリデータ（`@Required`, `@DateType`, `@IntegerType`, `@LongType`）＋ `@Execute(validate = "validate, @, validateAtCreateSlip")` によるメソッドチェーン検証。SQL は 2WaySQL のバインド変数でありインジェクション対策は S2JDBC 標準に依存。

## 7. 依存関係

- **共通基盤（jp.co.arkinfosys.common）**: `Constants`（メニューID・状態コード・特殊商品コード）、`Categories` / `CategoryTrns` / `SlipStatusCategories` / `SlipStatusCategoryTrns`（区分体系）、`StringUtil`（全半角変換・日付文字列）、`ListUtil`（プルダウン生成）、`ValidateUtil`（取込検証）、`DiscountUtil`（特殊商品判定）
- **共通アクション基底**: `CommonResources`（ログ・`userDto`/`mineDto` 保持）→ `AbstractSlipEditAction` / `AbstractSearchAction` / `AbstractSearchResultAction` / `AbstractXSVUploadAction`
- **他ドメインのサービスへの依存（rorder → 他）**:
  - estimate: `EstimateSheetService`, `EstimateLineService`（見積複写）
  - master 系: `CustomerService`, `ProductService`, `ProductClassService`, `DeliveryService`, `CategoryService`, `TaxRateService`, `SeqMakerService`, `DetailDispItemService`
  - stock: `ProductStockService`（引当可能数）, `ProductSetService`（セット品展開）
- **他ドメインからの被依存（他 → rorder）**:
  - sales: `RoSlipSalesService`・`rorder/UpdateLineSales.sql`・`UpdateSlipSales.sql` による受注消込。`SALES_SLIP_TRN.RO_SLIP_ID` / `SALES_LINE_TRN.RO_LINE_ID` の参照インデックスあり（`DB/sql/createtable/CREATE.sql` 6627, 6639行）
  - stock / porder: 受注残（`RoSlipService#countRestQuantityByProductCode()`）の参照（推測: 呼出元は在庫照会・発注画面）
- **S2 拡張（jp.co.arkinfosys.s2extend）**: `NumberConverter`（端数区分に応じた丸め）、`ExecuteAnnotationAspectCustomizer`（インターセプタ適用）

## 8. 未確定・推測事項

- （事実）**DB は実質 MySQL**: `jdbc.dicon` で有効なデータソースは `com.mysql.jdbc.Driver` / `jdbc:mysql://localhost:3306/salescube`、`s2jdbc.dicon` の dialect は `mysqlDialect`、DDL は `ENGINE=INNODB`。AGENTS.md の「DB: PostgreSQL」記載とは食い違う（PostgreSQL 設定はコメントアウトで存在）。
- （推測）トランザクション属性はアノテーション未指定のため `TxAttributeCustomizer` のデフォルト（Required）が適用されると判断した。`@TransactionAttribute` の明示は rorder ソースに存在しない。
- （推測）履歴テーブル（`RO_SLIP_TRN_HIST` 等）への書込み主体は Java ソース上に見当たらず、`AbstractService#updateAudit()` で監査カラムを更新した後に DB トリガで転記する方式と考えられる（`DB/sql` 配下のトリガ定義は本調査では未特定）。
- （推測）`LockSlip.sql` は `UPD_DATETM` 比較＋`FOR UPDATE` の組合せによる楽観・悲観併用ロックと推測（`AbstractService.FOR_UPDATE` 定数と `LockResult` の 4 値から）。
- （推測）オンライン受注ファイルの 29 列レイアウト（order-id, buyer-email, sku, ship-service-level…）は Amazon マーケットプレイス注文レポート形式に酷似。ソース上にサイト名の明示はない。
- （推測）`ROrderService` の型引数が `AbstractService<PaymentSlipTrn>` となっているのは他ドメインからのコピー痕跡であり、エンティティ型は実質未使用（SqlFile 方式のため動作に影響なし）。
- `ImportOnlineOrderAction#importFile()` の重複判定は「1 行ごとに SELECT → 0 件なら INSERT」の逐次処理であり、大量行の取込ではパフォーマンス上のボトルネックとなり得る（設計上の特記事項）。
