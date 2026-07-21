# Technical (As-Is) – estimate (見積)

> Tài liệu **KỸ THUẬT HIỆN TRẠNG (as-is)** — mô tả module *đang hoạt động thế nào* trong codebase Java/Seasar2.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Thiếu thông tin → `[CẦN XÁC NHẬN]`, KHÔNG bịa.
> Bám sát source thật; KHÔNG bỏ qua tầng Service (logic chính nằm ở Service, không phải Action).

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | estimate (見積) |
| Agent thực hiện | claude |
| Ngày | 2026-07-21 |
| Nguồn (scope) | xem `docs/modules/estimate.md` |
| Loại tài liệu | Technical / As-Is (Java + Seasar2 + S2Struts) |

## 1. Kiến trúc & tầng liên quan
Module tuân theo kiến trúc phân tầng của SalesCube (overview mục 2): `JSP View → Action → Service → Entity/SQL`, với `Form`/`DTO` truyền dữ liệu giữa các tầng.

- **Action** (`jp.co.arkinfosys.action.estimate.*`, `action.ajax.estimate.*`): điều phối request S2Struts, kế thừa các Action cơ sở (`AbstractSlipEditAction`, `AbstractSearchAction`, `AbstractSearchResultAction`, `AbstractSearchResultAjaxAction`, `AbstractReportWriterAction`, `CommonResources`, `CommonAjaxResources`). Logic nghiệp vụ chính **không** ở đây (trừ validate nhập liệu).
- **Form** (`form.estimate.*`): bean nhận dữ liệu màn hình, chứa annotation validate S2Struts (`@Required`, `@Maxlength`, `@DateType`, `@Mask`, `@LongRange`, `@DoubleType`).
- **Service** (`service.EstimateSheetService`, `service.EstimateLineService` + base `AbstractSlipService`, `AbstractLineService`, `AbstractService`): chứa toàn bộ logic ghi/đọc DB, giao dịch, khóa.
- **DTO** (`dto.estimate.*`): đối tượng truyền dữ liệu giữa Action ↔ Service.
- **Entity** (`entity.EstimateSheetTrn`, `entity.EstimateLineTrn`, `entity.Discount`, `entity.join.EstimateLineProductJoin`): ánh xạ bảng (JPA annotations, kiểu Seasar S2JDBC).
- **View** (`WEB-INF/view/estimate/*`): JSP + JavaScript đảm nhận toàn bộ tính toán số tiền phía client.

## 2. Danh mục thành phần (inventory)
| Tầng | Class / File | Vai trò |
|------|--------------|---------|
| Action | `action/estimate/SearchEstimateAction` | Hiển thị màn hình tìm kiếm báo giá (extends `AbstractSearchAction`) |
| Action | `action/estimate/InputEstimateAction` | Nhập/sửa/xóa/sao chép/in phiếu (extends `AbstractSlipEditAction`) |
| Action | `action/estimate/DispProductPriceListAction` | Màn hình tra bảng giá/chiết khấu (extends `CommonResources`) |
| Action | `action/estimate/SearchEstimateResultOutputAction` | Xuất Excel kết quả tìm kiếm (extends `AbstractSearchResultAction`) |
| Action | `action/estimate/OutputEstimateSheetSingleAction` | Xuất PDF phiếu báo giá đơn (extends `AbstractReportWriterAction`) |
| Action (ajax) | `action/ajax/estimate/SearchEstimateResultAjaxAction` | Tìm kiếm AJAX + phân trang (extends `AbstractSearchResultAjaxAction`) |
| Action (ajax) | `action/ajax/estimate/CheckEstimateSheetAction` | Kiểm tra tồn tại số báo giá, trả JSON (extends `CommonAjaxResources`) |
| Form | `form/estimate/SearchEstimateForm` | Điều kiện tìm kiếm (extends `AbstractSearchForm<List<Object>>`) |
| Form | `form/estimate/InputEstimateForm` | Dữ liệu nhập phiếu (extends `AbstractSlipEditForm<InputEstimateLineDto>`) |
| Form | `form/estimate/DispProductPriceListForm` | Điều kiện tra bảng giá (POJO thuần) |
| Service | `service/EstimateSheetService` | Logic đầu phiếu: insert/update/delete/tìm kiếm/load |
| Service | `service/EstimateLineService` | Logic dòng chi tiết: insert/update/delete/load; sinh sequence |
| Service (base) | `service/AbstractSlipService<ENTITY,DTO>` | Khung xử lý đầu phiếu + hàm khóa (`lockRecord`) |
| Service (base) | `service/AbstractLineService<ENTITY,LINEDTO,SLIPDTO>` | Khung xử lý dòng + `updateAudit` |
| Service (base) | `service/AbstractService<ENTITY>` | Hạ tầng chung: `createSqlParam`, `selectBySqlFile`, `updateBySqlFile`, `lockRecordBySqlFile`, `updateAudit`, `LockResult` |
| DTO | `dto/estimate/InputEstimateDto` | Đầu phiếu (extends `AbstractSlipDto<InputEstimateLineDto>`) |
| DTO | `dto/estimate/InputEstimateLineDto` | Dòng chi tiết (extends `AbstractLineDto`) |
| DTO | `dto/estimate/SearchEstimateDto` | Điều kiện tìm kiếm (kiểu Date) — `[CẦN XÁC NHẬN]` nơi tiêu thụ |
| DTO | `dto/estimate/SearchEstimateResultDto` | 1 dòng kết quả tìm kiếm — `[CẦN XÁC NHẬN]` nơi tiêu thụ |
| Entity | `entity/EstimateSheetTrn` | Bảng `ESTIMATE_SHEET_TRN` (đầu phiếu) |
| Entity | `entity/EstimateLineTrn` | Bảng `ESTIMATE_LINE_TRN` (dòng) |
| Entity | `entity/Discount` | Master `DISCOUNT_MST` (数量割引) |
| Entity (join) | `entity/join/EstimateLineProductJoin` | `EstimateLineTrn` + cột từ `PRODUCT_MST` (roMaxNum, supplierPcode) |
| View | `view/estimate/searchEstimate/search.jsp` | Màn hình điều kiện tìm kiếm |
| View | `view/estimate/inputEstimate/inputEstimate.jsp` | Màn hình nhập phiếu (1713 dòng, chứa JS tính tiền) |
| View | `view/estimate/dispProductPriceList/dispProductPriceList.jsp` | Màn hình tra bảng giá |
| View | `view/estimate/searchEstimateResultOutput/{excel,resultList}.jsp` | Template xuất Excel |
| SQL | `entity/sql/estimate/*.sql` | 14 file SQL (S2JDBC 2-way SQL) cho estimate |

## 3. Sơ đồ luồng gọi (call flow)

Các endpoint `@Execute` của **InputEstimateAction** được kế thừa từ `AbstractSlipEditAction` (Action con chỉ override các hook `loadData`, `createList`, `validateAtCreateSlip`, `getSlipService`, `getLineService`, `getActionForm`, `createDTO`...).

```
[Nhập mới]  inputEstimate.jsp
  → AbstractSlipEditAction#index()            (validator=false)
      form.reset/initialize/initializeScreenInfo → createList() → createDTO() → fillList()

[Mở/đọc]    inputEstimate.jsp (findSlip → load)
  → AbstractSlipEditAction#load()             (validator=false)
      → InputEstimateAction#loadData()
          → EstimateSheetService.loadBySlipId(id)   → FindEstimateSheetById.sql
          → EstimateLineService.loadBySlip(dto)      → FindEstimateLinesBySheetId.sql (join PRODUCT_MST)

[Lưu]       nút Đăng ký
  → AbstractSlipEditAction#upsert()  (validate="validate, @, validateAtCreateSlip")
      → InputEstimateAction#validateAtCreateSlip()
      → EstimateSheetService.save(dto, customerService)
          → YmService.getYm(estimateDate)            (tính annual/monthly/ym)
          → CustomerService.findCustomerByCode()     (lấy zip)
          → insertRecord() | updateRecord()
                insert → InsertEstimateSheet.sql
                update → LockEstimateSheet.sql (FOR UPDATE) + UpdateEstimateSheet.sql
      → EstimateLineService.save(dto, lineList, deletedLineIds)
          → SeqMakerService.nextval(ESTIMATE_LINE_TRN)  (dòng mới)
          → InsertEstimateLine.sql | UpdateEstimateLine.sql
          → updateAudit(ids) + DeleteEstimateLinesByLineIds.sql (dòng bị xóa)

[Xóa]       nút Xóa
  → AbstractSlipEditAction#delete()  (validate="@,validateAtDeleteSlip")
      → EstimateSheetService.updateAudit(id)
      → EstimateSheetService.deleteById(id, updDatetm)  → LockEstimateSheet.sql + DeleteEstimateSheet.sql
      → EstimateLineService.updateAudit(id) + deleteRecords(id) → DeleteEstimateLinesBySheetId.sql

[Sao chép]  nút Sao chép
  → AbstractSlipEditAction#copy()             (validator=false)
      → loadBySlipId + loadBySlip → form.initCopy() (xóa khóa/định danh)

[Kiểm tra số] AJAX findSlip
  → CheckEstimateSheetAction#exists()         (validator=false)
      → EstimateSheetService.loadBySlipId(id) → JSON {estimateSheetId}

[Tìm kiếm]  search.jsp
  → SearchEstimateAction#index()  (doAfterIndex → detailDispItemService.createResult)
  → (AJAX) SearchEstimateResultAjaxAction
      → doCount()   → EstimateSheetService.findEstimateSheetCntByCondition() → FindEstimateSheetCntByCondition.sql
      → execSearch()→ EstimateSheetService.findEstimateSheetByConditionLimit() → FindEstimateSheetByCondition.sql (LIMIT/OFFSET)
      → exchange()  → detailDispItemService.createResult()

[Xuất Excel] SearchEstimateResultOutputAction#excel()  (validator=true, validate="validate")
  → execSearch() → EstimateSheetService.findEstimateSheetByCondition() (ROW_COUNT=null → không LIMIT)

[In PDF]    OutputEstimateSheetSingleAction#pdf()  (validator=false)
  → getSlip()       → EstimateSheetService.findEstimateSheetByIdSimple() → FindEstimateSheetById.sql
  → getDetailList() → EstimateLineService.findEstimateLinesBySheetIdSimple() → FindEstimateLinesBySheetId.sql
                      + PrintUtil.setSpaceToExceptianalProductCode()

[Tra bảng giá] dispProductPriceList.jsp
  → DispProductPriceListAction#index() / #show()  (validator=false)
      → ProductService.findById(productCode)
      → DiscountRelService.findDiscountMstByProduct(productCode)
      → DiscountTrnService.findDiscountTrnByDiscountId(discountId)
```

## 4. Chi tiết logic Service

### 4.1 EstimateSheetService (extends `AbstractSlipService<EstimateSheetTrn, InputEstimateDto>`)
- **`save(dto, ...services)`** (L612–649): điểm vào lưu đầu phiếu.
  1. Ép kiểu `abstractServices[0]` → `CustomerService`.
  2. `ymService.getYm(dto.estimateDate)` → nếu null thì set `estimateAnnual/Monthly/Ym = ""`; ngược lại gán chuỗi từ `YmDto`.
  3. Nếu có `customerCode`: `customerService.findCustomerByCode()` → copy `customerZipCode` vào `dto.deliveryZipCode`.
  4. Nếu `dto.newData == null || true` → `insertRecord`; ngược lại → `updateRecord` (trả về `lockResult`).
- **`insertRecord(dto)`** (L174–192): `Beans.createAndCopy(EstimateSheetTrn.class, dto)` + `dateConverter(DATE, "estimateDate","validDate")`; `setEntityToParam` → `updateBySqlFile("estimate/InsertEstimateSheet.sql")`.
- **`updateRecord(dto)`** (L202–219): tạo entity (dateConverter DATE + TIMESTAMP updDatetm); **`lockRecord(ESTIMATE_SHEET_ID, id, updDatetm, "estimate/LockEstimateSheet.sql")`** trước; rồi `UpdateEstimateSheet.sql`; trả `lockResult`.
- **`deleteById(id, updDatetm)`** (L229–244): `lockRecord(...)` + `DeleteEstimateSheet.sql`.
- **`loadBySlipId(id)`** (L658–682): `FindEstimateSheetById.sql` → `EstimateSheetTrn` → `Beans.copy` sang `InputEstimateDto` (dateConverter DATE + TIMESTAMP). Trả null nếu không có.
- **`findEstimateSheetByIdSimple(id)`** (L591–602): trả `BeanMap` (cho in PDF).
- **Tìm kiếm:** `findEstimateSheetCntByCondition`, `findEstimateSheetByCondition`, `findEstimateSheetByConditionLimit` (giống hệt bản không Limit — L342–356), `findEstimateSheetFromCopySlipByCondition` (điều kiện `CUSTOMER_CODE != ""` phục vụ "呼出"). Đều gọi `setEmptyCondition` + `setConditionParam`.
- **`setConditionParam`** (L416–523): map điều kiện → tham số SQL với `LikeType` (PREFIX cho code/id; PARTIAL cho tên/tiêu đề/摘要); chuyển 全角→半角 cho các trường ngày (`StringUtil.zenkakuNumToHankaku`); set `sortColumn` (qua `StringUtil.convertColumnName`), `sortOrder` (ASC/DESC theo `sortOrderAsc`), `rowCount`, `offsetRow`.
- **`Param`/`Table`/`LikeType`** (inner class): định nghĩa hằng khóa tham số & tên bảng `ESTIMATE_SHEET_TRN`.

### 4.2 EstimateLineService (extends `AbstractLineService<EstimateLineTrn, InputEstimateLineDto, InputEstimateDto>`)
- **`save(slipDto, lineList, deletedLineIds, ...)`** (L274–317):
  1. Với mỗi dòng trong `lineList`: gán `estimateSheetId = slipDto.getKeyValue()`; tạo `EstimateLineTrn` bằng `Beans.createAndCopy` (dateConverter TIMESTAMP updDatetm); gán `lineNo = i++` (1,2,3...).
  2. Nếu `estimateLineId` rỗng → `seqMakerService.nextval(ESTIMATE_LINE_TRN)` sinh ID → `insertRecord`; ngược lại → `updateRecord`.
  3. Nếu có `deletedLineIds` (chuỗi CSV) → `split(",")` → `updateAudit(ids)` + `deleteRecordsByLineId(ids)`.
- **`loadBySlip(dto)`** (L242–264): `FindEstimateLinesBySheetId.sql` → `EstimateLineProductJoin` (kèm roMaxNum/supplierPcode) → copy sang `InputEstimateLineDto`.
- **`findEstimateLinesBySheetIdSimple(id)`** (L188–201): trả `List<BeanMap>` (cho in).
- **`findEstimateLinesByLineIds(ids)`** (L210–233): trả `List<InputEstimateLineDto>`.
- **`deleteRecords(sheetId)` / `deleteRecordsByLineId(ids)`**: gọi `DeleteEstimateLinesBySheetId.sql` / `DeleteEstimateLinesByLineIds.sql`.
- **Key:** `getKeyColumnNames()` = `{ESTIMATE_SHEET_ID, ESTIMATE_LINE_ID}`; `getTableName()` = `ESTIMATE_LINE_TRN`.

### 4.3 Base services
- `AbstractSlipService.lockRecord(...)`: parse `updDatetm` (chuỗi → `Timestamp`) rồi `lockRecordBySqlFile(...)` (khóa lạc quan theo `UPD_DATETM`), trả `LockResult`.
- `AbstractLineService.updateAudit(...)`: cập nhật thông tin audit trước khi xóa (soft-audit).
- `AbstractService`: hạ tầng S2JDBC (`selectBySqlFile`, `updateBySqlFile`, `createSqlParam`, `createPartial/PrefixSearchCondition`, `LockResult.SUCCEEDED`).

## 5. Mô hình dữ liệu (Entity / bảng DB / SQL)
| Bảng | Entity | Khoá chính | Quan hệ |
|------|--------|-----------|---------|
| `ESTIMATE_SHEET_TRN` | `EstimateSheetTrn` | `ESTIMATE_SHEET_ID` (String) | Slip 1–N Line |
| `ESTIMATE_LINE_TRN` | `EstimateLineTrn` | `ESTIMATE_LINE_ID` (Integer, `@GeneratedValue`) | FK `ESTIMATE_SHEET_ID` → Sheet; LEFT JOIN `PRODUCT_MST` khi load |
| `DISCOUNT_MST` | `Discount` | `discountId` (String) | master tham chiếu (bậc số lượng qua `DiscountTrn`) |
| (join, không phải bảng) | `EstimateLineProductJoin` | kế thừa `EstimateLineTrn` | + `RO_MAX_NUM`, `SUPPLIER_PCODE` từ `PRODUCT_MST` |

- **Cột nghiệp vụ quan trọng (SHEET):** `ESTIMATE_ANNUAL/MONTHLY/YM` (năm/tháng/năm-tháng độ), `ESTIMATE_DATE`, `VALID_DATE`, `USER_ID/USER_NAME`, `CUSTOMER_CODE/NAME/REMARKS/COMMENT_DATA`, `SUBMIT_NAME/SUBMIT_PRE(_CATEGORY)`, `DELIVERY_*` (nhiều cột giao hàng), `CTAX_PRICE_TOTAL`, `CTAX_RATE`, `COST_TOTAL`, `RETAIL_PRICE_TOTAL`, `ESTIMATE_TOTAL`, `TAX_FRACT_CATEGORY`, `PRICE_FRACT_CATEGORY`, audit `CRE_*`/`UPD_*`. Kiểu tiền: `BigDecimal`; ngày: `java.sql.Date`; timestamp audit: `Timestamp`.
- **Cột nghiệp vụ quan trọng (LINE):** `LINE_NO` (Short), `PRODUCT_CODE`, `CUSTOMER_PCODE`, `PRODUCT_ABSTRACT`, `QUANTITY`, `UNIT_COST`, `UNIT_RETAIL_PRICE`, `COST`, `RETAIL_PRICE`, `REMARKS`, audit.
- **Multi-tenant:** mọi tên bảng trong SQL có hậu tố domain: `ESTIMATE_SHEET_TRN_/*$domainId*/`, `ESTIMATE_LINE_TRN_/*$domainId*/`, `PRODUCT_MST_/*$domainId*/`. Tên bảng động theo `domainId`.
- **SQL (S2JDBC 2-way SQL) trong `entity/sql/estimate/`:**
  - `InsertEstimateSheet.sql` / `UpdateEstimateSheet.sql`: `CRE_DATETM`/`UPD_DATETM` set `now()` phía DB.
  - `LockEstimateSheet.sql`: `SELECT UPD_DATETM, UPD_USER ... WHERE ESTIMATE_SHEET_ID=... FOR UPDATE` (khóa bi quan + so sánh optimistic).
  - `FindEstimateSheetById.sql`, `FindEstimateSheetByCondition.sql` (động `/*IF ...*/`, `ORDER BY /*$sortColumn*/`, `LIMIT/OFFSET`), `FindEstimateSheetCntByCondition.sql`, `FindEstimateSheetFromCopySlipByCondition.sql` (`CUSTOMER_CODE != ""`).
  - `DeleteEstimateSheet.sql`, `InsertEstimateLine.sql`, `UpdateEstimateLine.sql`, `DeleteEstimateLinesBySheetId.sql`, `DeleteEstimateLinesByLineIds.sql` (`IN /*estimateLineIds*/`), `FindEstimateLinesBySheetId.sql` (LEFT JOIN `PRODUCT_MST`, `ORDER BY LINE_NO`), `FindEstimateLinesByLineIds.sql`.
  - **Tính toán trong SQL tìm kiếm:** `GROSS_MARGIN = RETAIL_PRICE_TOTAL - COST_TOTAL`; `GROSS_MARGIN_RATE = (RETAIL_PRICE_TOTAL-COST_TOTAL)/RETAIL_PRICE_TOTAL`.
- `[CẦN XÁC NHẬN]` Script tạo bảng (DDL) không có trong scope repo `src/main` — không tìm thấy `CREATE TABLE` cho estimate; DDL có thể ở nơi khác của dự án.

## 6. Điểm vào (endpoints)
| Method (`@Execute`) | Trigger UI | Input (Form/Param) | Kết quả/điều hướng |
|---------------------|-----------|--------------------|--------------------|
| `InputEstimateAction` ← `index()` | Mở màn nhập mới | `InputEstimateForm` | `inputEstimate.jsp` (phiếu trống, newData=true) |
| ← `load()` | Mở/đọc phiếu | `estimateSheetId` | `inputEstimate.jsp` (đã nạp) hoặc `index()` nếu không có |
| ← `upsert()` | Nút Đăng ký | toàn form + dòng | validate → save → nạp lại; `infos.insert`/`infos.update` |
| ← `delete()` | Nút Xóa | `estimateSheetId`, `updDatetm` | xóa → `index()`; `infos.delete` |
| ← `copy()` | Nút Sao chép | `estimateSheetId` | nạp + `initCopy` → `inputEstimate.jsp` |
| ← `errorInit()` | (input khi lỗi upsert/delete) | form | `inputEstimate.jsp` giữ nguyên input |
| `CheckEstimateSheetAction.exists()` | JS `findSlip` khi rời ô số báo giá | `estimateSheetId` | JSON `{estimateSheetId}` hoặc null |
| `SearchEstimateAction.index()` (+ `doAfterIndex`) | Mở màn tìm kiếm | `SearchEstimateForm` | `search.jsp` + cột kết quả |
| `SearchEstimateResultAjaxAction` (doSearch base) | Nút Tìm | `SearchEstimateForm` → `BeanMap` params | JSON danh sách phân trang |
| `SearchEstimateResultOutputAction.excel()` | Nút Xuất Excel | `SearchEstimateForm` | file Excel (ROW_COUNT=null) |
| `OutputEstimateSheetSingleAction.pdf()` | Nút In | `InputEstimateForm.estimateSheetId` | file PDF (template `0000B`, prefix `Estimate`) |
| `DispProductPriceListAction.index()` | Mở màn tra giá | `DispProductPriceListForm` | `dispProductPriceList.jsp` |
| `DispProductPriceListAction.show()` | Nút hiển thị | `productCode` | thông tin sản phẩm + bảng chiết khấu |

> `@Execute(validate=...)` của `upsert` dùng chuỗi `"validate, @, validateAtCreateSlip"` với `stopOnValidationError=false`, `input="errorInit"` — tức chạy validate form + validate nghiệp vụ nối tiếp, gom hết lỗi, khi lỗi quay `errorInit`.

## 7. Giao dịch, khoá & side-effect
- **Transaction:** do container Seasar (S2/`@Resource` service, interceptor giao dịch) quản lý ở mức Action/Service. `save` đầu phiếu + `save` dòng chạy trong cùng request `upsert()`. `[CẦN XÁC NHẬN]` ranh giới transaction chính xác (annotation `@RemoveSession`/interceptor) — nằm ở cấu hình dicon ngoài scope.
- **Khóa (optimistic + `FOR UPDATE`):** `updateRecord` và `deleteById` gọi `lockRecord` → `LockEstimateSheet.sql` (`SELECT ... FOR UPDATE`) so sánh `UPD_DATETM` client gửi lên với DB. Không khớp → `UnabledLockException` (`LockResult` khác SUCCEEDED) → Action bắt và chuyển `errorInit`, hiển thị message khóa.
- **Side-effect:**
  - Sinh `ESTIMATE_LINE_ID` qua `SeqMakerService.nextval`.
  - Copy `customerZipCode` của khách vào `deliveryZipCode` đầu phiếu.
  - `updateAudit` trước khi xóa (đầu phiếu và dòng) — ghi vết audit.
  - **Không** thấy side-effect sang tồn kho/công nợ ở module estimate (đúng bản chất báo giá — chưa phát sinh giao dịch kho/tiền).
- **`CRE_DATETM`/`UPD_DATETM`** do DB set `now()`.

## 8. Xử lý ngoại lệ & message
| Exception | Điều kiện | Message id |
|-----------|-----------|-----------|
| `ServiceException` | Lỗi khi thao tác DB/convert trong service; bọc exception gốc | (Action ghi log; nếu `isStopOnError()` ném tiếp như lỗi hệ thống, ngược lại hiển thị `e.getMessage()`) |
| `UnabledLockException` | `UPD_DATETM` không khớp khi update/delete | `e.getKey()` (message khóa) → `errorInit` |
| `SNonUniqueResultException` | `findEstimateSheetByIdSimple`/`loadBySlipId` trả >1 bản ghi | bọc thành `ServiceException` |
| validate `errors.date.estimate` | ngày báo giá > hạn hiệu lực | `errors.date.estimate` |
| validate `errors.dataNotExist` | mã khách không tồn tại | `errors.dataNotExist` |
| validate `errors.line.required/float/num0/range/maxlength` | lỗi từng dòng | tương ứng |
| validate `errors.noline` | không có dòng nào | `errors.noline` |
| `errors.dispProductPrice.none.productCode` | tra giá: sản phẩm không tồn tại | (DispProductPriceList) |
| `errors.dispProductPrice.none.discountRel` | tra giá: sản phẩm không gắn chiết khấu | (DispProductPriceList) |
| Lỗi hệ thống AJAX | `CheckEstimateSheetAction` bắt `ServiceException` | `writeSystemErrorToResponse()` |
| Thông báo thành công | insert/update/delete | `infos.insert` / `infos.update` / `infos.delete` |

## 9. Cấu hình & phụ thuộc kỹ thuật
- **Service inject (`@Resource`):**
  - `InputEstimateAction`: `estimateSheetService`, `estimateLineService`, `categoryService`, `customerService`; (kế thừa `taxRateService` từ base).
  - `EstimateSheetService`: `ymService`. `EstimateLineService`: `seqMakerService`.
  - `DispProductPriceListAction`: `discountRelService`, `discountTrnService`, `productService`.
  - Các search action: `estimateSheetService`, `detailDispItemService` (kế thừa).
- **Master data / Category cần nạp:** `Categories.PRE_TYPE` (kính ngữ đề xuất) qua `categoryService.findCategoryLabelValueBeanListById`; danh sách thuế suất qua `ListUtil.getRateTaxNoBlankList(taxRateService)`; danh mục thuế/làm tròn của 自社 (`mineDto.taxCategory`).
- **Thư viện Seasar dùng:** `org.seasar.framework.beans.util.Beans` (`copy`, `createAndCopy`, `dateConverter`), `BeanMap`; `org.seasar.struts.annotation.*` (`@Execute`, `@ActionForm`, validator annotation); `org.seasar.struts.util.MessageResourcesUtil`, `ActionMessagesUtil`, `ResponseUtil`; `net.arnx.jsonic.JSON` (mã hóa JSON cho AJAX); `org.seasar.extension.jdbc` (2-way SQL).
- **Hằng số:** `Constants.FORMAT.DATE/TIMESTAMP`, `Constants.LIMIT_VALUE.PRICE_MIN/MAX`, `Constants.MENU_ID.INPUT_ESTIMATE/SEARCH_ESTIMATE`, `Constants.SEARCH_TARGET.VALUE_SLIP`, `Constants.SQL.ASC/DESC`, `CategoryTrns.PREFIX_SAMA`, `DiscountUtil.isExceptianalProduct`, `PrintUtil.setSpaceToExceptianalProductCode`.
- **Tính toán số tiền:** thực hiện phía **client (JavaScript trong `inputEstimate.jsp`)** — `culcCost`, `culcRetailPrice`, `sum`, `sumLine`; dùng thư viện BigDecimal JS (`oBDCS`, `SetBigDecimalScale_Obj`). Server chỉ lưu giá trị đã tính (đầu phiếu và dòng nhận số tiền dạng chuỗi từ form).

## 10. Điểm chưa rõ
- [CẦN XÁC NHẬN] Cơ chế transaction/interceptor cụ thể (dicon, `@RemoveSession`) — ngoài scope file.
- [CẦN XÁC NHẬN] Nơi tiêu thụ `SearchEstimateDto` và `SearchEstimateResultDto` (search chạy bằng `BeanMap` + `SearchEstimateForm`, chưa thấy dùng 2 DTO này trong các Action đã đọc).
- [CẦN XÁC NHẬN] JSP kết quả AJAX (`Mapping.RESULT`) trỏ tới đâu (không thuộc thư mục `view/estimate`).
- [CẦN XÁC NHẬN] Chi tiết `commonBulkRetailPrice/getPrice` (tính giá theo lô) và `DiscountRelService`/`DiscountTrnService` — ngoài scope estimate.
- [CẦN XÁC NHẬN] `findEstimateSheetByConditionLimit` giống hệt `findEstimateSheetByCondition` (không thấy khác biệt về LIMIT trong 2 hàm) — có thể là dư thừa lịch sử; LIMIT thực tế do `param` (rowCount/offsetRow) quyết định.
- [CẦN XÁC NHẬN] DDL bảng (không có `CREATE TABLE` trong scope).
