# Technical (As-Is) – estimate (見積)

> Tài liệu **KỸ THUẬT HIỆN TRẠNG (as-is)** — mô tả module _đang hoạt động thế nào_ trong codebase Java/Seasar2.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Thiếu thông tin → `[CẦN XÁC NHẬN]`, KHÔNG bịa.
> Bám sát source thật; KHÔNG bỏ qua tầng Service (logic chính nằm ở Service, không phải Action).

## 0. Metadata

| Thuộc tính      | Giá trị                                       |
| --------------- | --------------------------------------------- |
| Module          | estimate (見積)                               |
| Agent thực hiện | devin                                         |
| Ngày            | 2026-07-20                                    |
| Nguồn (scope)   | xem `docs/modules/estimate.md`                |
| Loại tài liệu   | Technical / As-Is (Java + Seasar2 + S2Struts) |

## 1. Kiến trúc & tầng liên quan

Module estimate dùng đủ các tầng theo sơ đồ trong overview `[JSP View] → [Action] → [Service] → [Entity/SQL]`, kèm `Form`/`DTO`:

- **Action:** `action/estimate/*` (màn hình chính) + `action/ajax/estimate/*` (AJAX). Kế thừa các lớp abstract:
  `InputEstimateAction extends AbstractSlipEditAction`, `SearchEstimateAction extends AbstractSearchAction`,
  `SearchEstimateResultOutputAction extends AbstractSearchResultAction`, `SearchEstimateResultAjaxAction extends AbstractSearchResultAjaxAction`,
  `OutputEstimateSheetSingleAction extends AbstractReportWriterAction`, `DispProductPriceListAction extends CommonResources`,
  `CheckEstimateSheetAction extends CommonAjaxResources`.
- **Form:** `form/estimate/*` — bean nhận dữ liệu màn hình (annotation validate của S2Struts).
- **Service:** `service/EstimateSheetService` (đầu phiếu, extends `AbstractSlipService`), `service/EstimateLineService` (dòng, extends `AbstractLineService`).
- **DTO:** `dto/estimate/*` — truyền dữ liệu giữa các tầng.
- **Entity:** `entity/EstimateSheetTrn`, `entity/EstimateLineTrn`, `entity/Discount`, `entity/join/EstimateLineProductJoin`.
- **SQL (2-way SQL):** `entity/sql/estimate/*.sql`.
- **View:** `WEB-INF/view/estimate/*` và `WEB-INF/view/ajax/estimate/*` + dialog sao chép phiếu.

## 2. Danh mục thành phần (inventory)

| Tầng    | Class / File                                                              | Vai trò                                                                                                     |
| ------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Action  | `action/estimate/SearchEstimateAction`                                    | Hiển thị màn hình tìm kiếm; set `searchTarget=VALUE_SLIP`; nạp cột hiển thị (`DetailDispItemService`)       |
| Action  | `action/estimate/InputEstimateAction`                                     | Nhập/sửa/xoá/sao chép/in phiếu (endpoint kế thừa từ `AbstractSlipEditAction`); validate nghiệp vụ tạo phiếu |
| Action  | `action/estimate/DispProductPriceListAction`                              | Tra giá & chiết khấu 1 sản phẩm (`index`, `show`)                                                           |
| Action  | `action/estimate/SearchEstimateResultOutputAction`                        | Xuất kết quả tìm kiếm ra Excel (`excel`)                                                                    |
| Action  | `action/estimate/OutputEstimateSheetSingleAction`                         | In 1 phiếu PDF (`pdf`), template `0000B`, file prefix `Estimate`                                            |
| Action  | `action/ajax/estimate/SearchEstimateResultAjaxAction`                     | Thực thi tìm kiếm + đếm + phân trang (AJAX)                                                                 |
| Action  | `action/ajax/estimate/CheckEstimateSheetAction`                           | Kiểm tra tồn tại số báo giá, trả JSON (`exists`)                                                            |
| Form    | `form/estimate/SearchEstimateForm`                                        | Điều kiện tìm kiếm (số phiếu, khoảng ngày, người nhập, khách, tiêu đề...)                                   |
| Form    | `form/estimate/InputEstimateForm`                                         | Dữ liệu đầu phiếu + danh sách dòng + các tổng; chứa annotation validate                                     |
| Form    | `form/estimate/DispProductPriceListForm`                                  | Điều kiện & kết quả tra giá sản phẩm; `discountTrnList`                                                     |
| Service | `service/EstimateSheetService`                                            | CRUD đầu phiếu, tìm kiếm theo điều kiện, đếm, load, khóa bản ghi, tính năm-tháng độ                         |
| Service | `service/EstimateLineService`                                             | CRUD dòng, load dòng theo phiếu, cấp số dòng, xoá theo sheet/line ids                                       |
| DTO     | `dto/estimate/InputEstimateDto`                                           | DTO đầu phiếu (dùng khi save/load); cờ `newData`                                                            |
| DTO     | `dto/estimate/InputEstimateLineDto`                                       | DTO dòng; `isEmpty`/`isBlank`                                                                               |
| DTO     | `dto/estimate/SearchEstimateDto`                                          | DTO điều kiện tìm kiếm (khai báo; tra cứu thực dùng `BeanMap`)                                              |
| DTO     | `dto/estimate/SearchEstimateResultDto`                                    | DTO dòng kết quả tìm kiếm (bao gồm lãi gộp)                                                                 |
| Entity  | `entity/EstimateSheetTrn`                                                 | Bảng `ESTIMATE_SHEET_TRN` (đầu phiếu)                                                                       |
| Entity  | `entity/EstimateLineTrn`                                                  | Bảng `ESTIMATE_LINE_TRN` (dòng), `@GeneratedValue` cho `ESTIMATE_LINE_ID`                                   |
| Entity  | `entity/Discount`                                                         | Bảng `DISCOUNT_MST` (chiết khấu số lượng)                                                                   |
| Entity  | `entity/join/EstimateLineProductJoin`                                     | Kế thừa `EstimateLineTrn` + `roMaxNum`, `supplierPcode` (join sang product)                                 |
| View    | `WEB-INF/view/estimate/inputEstimate/inputEstimate.jsp`                   | Màn hình nhập báo giá                                                                                       |
| View    | `WEB-INF/view/estimate/searchEstimate/search.jsp`                         | Màn hình tìm kiếm                                                                                           |
| View    | `WEB-INF/view/estimate/searchEstimateResultOutput/{resultList,excel}.jsp` | Kết quả & Excel                                                                                             |
| View    | `WEB-INF/view/estimate/dispProductPriceList/dispProductPriceList.jsp`     | Tra giá sản phẩm                                                                                            |
| View    | `WEB-INF/view/ajax/estimate/searchEstimateResultAjax/result.jsp`          | Kết quả tìm kiếm AJAX                                                                                       |
| View    | `WEB-INF/view/ajax/dialog/copySlipDialog/{slip,result}/estimate.jsp`      | Dialog sao chép phiếu (dùng cho 受注)                                                                       |

## 3. Sơ đồ luồng gọi (call flow)

```
[Nhập/Lưu]
inputEstimate.jsp
  → InputEstimateAction#upsert()            (@Execute, kế thừa AbstractSlipEditAction)
      → EstimateSheetService.save(dto, customerService)
          → YmService.getYm() ; CustomerService.findCustomerByCode()
          → insertRecord() → InsertEstimateSheet.sql   (nếu newData)
          → updateRecord() → LockEstimateSheet.sql (FOR UPDATE) + UpdateEstimateSheet.sql
      → EstimateLineService.save(dto, lineList, deleteLineIds)
          → SeqMakerService.nextval("ESTIMATE_LINE_TRN")  (dòng mới)
          → InsertEstimateLine.sql / UpdateEstimateLine.sql
          → updateAudit() + DeleteEstimateLinesByLineIds.sql (dòng bị xoá)
      → loadData() → EstimateSheetService.loadBySlipId() (FindEstimateSheetById.sql)
                   + EstimateLineService.loadBySlip()    (FindEstimateLinesBySheetId.sql)

[Xoá]
inputEstimate.jsp → InputEstimateAction#delete()
  → EstimateSheetService.updateAudit() ; deleteById() → LockEstimateSheet.sql + DeleteEstimateSheet.sql
  → EstimateLineService.updateAudit() ; deleteRecords() → DeleteEstimateLinesBySheetId.sql

[Sao chép] inputEstimate.jsp → InputEstimateAction#copy()
  → EstimateSheetService.loadBySlipId() + EstimateLineService.loadBySlip() → form.initCopy()

[Tìm kiếm] search.jsp → SearchEstimateResultAjaxAction#execSearch()
  → EstimateSheetService.findEstimateSheetCntByCondition()  (FindEstimateSheetCntByCondition.sql)
  → EstimateSheetService.findEstimateSheetByConditionLimit() (FindEstimateSheetByCondition.sql)
  → DetailDispItemService.createResult()

[Xuất Excel] SearchEstimateResultOutputAction#excel() → findEstimateSheetByCondition() (ROW_COUNT=null)
[In PDF]    OutputEstimateSheetSingleAction#pdf()
  → findEstimateSheetByIdSimple() + findEstimateLinesBySheetIdSimple() → PrintUtil.setSpaceToExceptianalProductCode()
[Tra giá]   DispProductPriceListAction#show()
  → ProductService.findById() + DiscountRelService.findDiscountMstByProduct() + DiscountTrnService.findDiscountTrnByDiscountId()
[Check số]  CheckEstimateSheetAction#exists() → EstimateSheetService.loadBySlipId() → JSON
```

## 4. Chi tiết logic Service

### 4.1 `EstimateSheetService` (extends `AbstractSlipService<EstimateSheetTrn, InputEstimateDto>`)

- **`save(dto, abstractServices...)`** (dòng 612–649): lấy `CustomerService` từ `abstractServices[0]`; tính `estimateAnnual/Monthly/Ym` từ `ymService.getYm(estimateDate)` (null → set rỗng); nếu có `customerCode` thì nạp `Customer` và gán `deliveryZipCode = customer.customerZipCode`; nếu `newData` (null hoặc true) → `insertRecord`, ngược lại → `updateRecord` (trả `lockResult`).
- **`insertRecord(dto)`** (dòng 174–192): `Beans.createAndCopy` DTO→entity với `dateConverter(DATE, estimateDate, validDate)`; đưa entity vào param (`setEntityToParam`); chạy `InsertEstimateSheet.sql`.
- **`updateRecord(dto)`** (dòng 202–219): copy DTO→entity (convert DATE + TIMESTAMP `updDatetm`); `lockRecord(ESTIMATE_SHEET_ID, id, updDatetm, LockEstimateSheet.sql)` (khóa lạc quan + `FOR UPDATE`); chạy `UpdateEstimateSheet.sql`; trả `lockResult`.
- **`deleteById(id, updDatetm)`** (dòng 229–244): `lockRecord(...)` rồi chạy `DeleteEstimateSheet.sql`.
- **Tìm kiếm:** `findEstimateSheetCntByCondition` (đếm), `findEstimateSheetByCondition` / `...Limit` (danh sách; nội dung y hệt nhau), `findEstimateSheetFromCopySlipByCondition` (lọc phiếu có customerCode, phục vụ dialog sao chép). Tất cả gọi `setEmptyCondition` → `setConditionParam`.
- **`setConditionParam`** (dòng 416–523): áp `LIKE` theo loại (`PREFIX` cho số phiếu/mã nhân viên/mã khách; `PARTIAL` cho tên nhân viên/tiêu đề/ghi chú/tên đề xuất/tên khách); khoảng ngày dùng `zenkakuNumToHankaku` (chuẩn hóa số full→half width); set `sortColumn` (chuẩn hóa qua `convertColumnName`), `sortOrder` (`ASC`/`DESC`), `rowCount`, `offsetRow`.
- **`loadBySlipId(id)`** (dòng 658–682): `FindEstimateSheetById.sql` → entity → DTO (convert DATE + TIMESTAMP).
- **`findEstimateSheetByIdSimple(id)`**: trả `BeanMap` (dùng cho in PDF).
- Hằng số cột tìm kiếm/sắp xếp: `COLUMN_*` (ESTIMATE_SHEET_ID, ESTIMATE_DATE, VALID_DATE, USER_ID/NAME, CUSTOMER_CODE/NAME, GROSS_MARGIN, RETAIL_PRICE_TOTAL, CTAX_PRICE_TOTAL, ESTIMATE_TOTAL). Lưu ý typo trong source: hằng `OLUMN_GROSS_MARGIN_RATE` (thiếu chữ "C").

### 4.2 `EstimateLineService` (extends `AbstractLineService<EstimateLineTrn, InputEstimateLineDto, InputEstimateDto>`)

- **`save(slipDto, lineList, deletedLineIds, ...)`** (dòng 274–317): duyệt `lineList`, gán `estimateSheetId = slipDto.getKeyValue()`, copy DTO→entity (convert TIMESTAMP `updDatetm`), gán `lineNo` tăng dần từ 1; nếu `estimateLineId` rỗng → cấp số qua `seqMakerService.nextval("ESTIMATE_LINE_TRN")` rồi `insertRecord`, ngược lại `updateRecord`. Với `deletedLineIds` (chuỗi phân tách bằng dấu phẩy) → `updateAudit(ids)` + `deleteRecordsByLineId(ids)`.
- **`loadBySlip(dto)`** (dòng 242–264): dùng `FindEstimateLinesBySheetId.sql` map sang `EstimateLineProductJoin` (kèm `roMaxNum`, `supplierPcode`) rồi copy sang `InputEstimateLineDto`.
- **`findEstimateLinesBySheetIdSimple(id)`**: trả `List<BeanMap>` (dùng cho in PDF).
- **`deleteRecords(sheetId)`** / **`deleteRecordsByLineId(ids)`**: xoá theo sheet / theo mảng line id.
- Khóa chính đôi: `getKeyColumnNames()` = `{ESTIMATE_SHEET_ID, ESTIMATE_LINE_ID}`.

## 5. Mô hình dữ liệu (Entity / bảng DB / SQL)

| Bảng                 | Entity             | Khoá chính                                                                                           | Quan hệ                                       |
| -------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `ESTIMATE_SHEET_TRN` | `EstimateSheetTrn` | `ESTIMATE_SHEET_ID` (String, nhập tay)                                                               | Slip 1–N Line                                 |
| `ESTIMATE_LINE_TRN`  | `EstimateLineTrn`  | `ESTIMATE_LINE_ID` (Integer, `@GeneratedValue`) + khoá logic `(ESTIMATE_SHEET_ID, ESTIMATE_LINE_ID)` | N–1 tới Sheet; LEFT JOIN `PRODUCT_MST`        |
| `DISCOUNT_MST`       | `Discount`         | `discountId`                                                                                         | tham chiếu qua sản phẩm (chiết khấu số lượng) |
| `PRODUCT_MST`        | (ngoài scope)      | —                                                                                                    | join lấy `SUPPLIER_PCODE`, `RO_MAX_NUM`       |

- **Cột nghiệp vụ quan trọng đầu phiếu:** `ESTIMATE_ANNUAL/MONTHLY/YM`, `ESTIMATE_DATE`, `VALID_DATE`, `USER_ID/NAME`, `CUSTOMER_CODE/NAME/REMARKS/COMMENT_DATA`, `SUBMIT_NAME/PRE_CATEGORY/PRE`, `DELIVERY_*` (nhiều cột giao hàng; `DELIVERY_ZIP_CODE` thực chất lưu ZIP của khách — xem BR-05), `CTAX_PRICE_TOTAL`, `CTAX_RATE`, `COST_TOTAL`, `RETAIL_PRICE_TOTAL`, `ESTIMATE_TOTAL`, `MEMO`, `TAX_FRACT_CATEGORY`, `PRICE_FRACT_CATEGORY`, audit (`CRE_*`/`UPD_*`).
- **Cột dòng:** `LINE_NO`, `PRODUCT_CODE`, `CUSTOMER_PCODE`, `PRODUCT_ABSTRACT`, `QUANTITY`, `UNIT_COST`, `UNIT_RETAIL_PRICE`, `COST`, `RETAIL_PRICE`, `REMARKS`, audit.
- **2-way SQL (`entity/sql/estimate/`):** `InsertEstimateSheet`, `UpdateEstimateSheet`, `DeleteEstimateSheet`, `LockEstimateSheet`, `FindEstimateSheetById`, `FindEstimateSheetByCondition`, `FindEstimateSheetCntByCondition`, `FindEstimateSheetFromCopySlipByCondition`, `InsertEstimateLine`, `UpdateEstimateLine`, `FindEstimateLinesBySheetId`, `FindEstimateLinesByLineIds`, `DeleteEstimateLinesBySheetId`, `DeleteEstimateLinesByLineIds`.
- Bảng dùng hậu tố domain động: `..._TRN_/*$domainId*/` (multi-tenant theo `domainId`). `INSERT`/`UPDATE` dùng `now()` cho `CRE_DATETM`/`UPD_DATETM`. Lãi gộp & tỷ lệ tính ngay trong `FindEstimateSheetByCondition.sql`.

## 6. Điểm vào (endpoints)

| Method (`@Execute`)                      | Trigger UI           | Input (Form/Param)                                               | Kết quả/điều hướng                                     |
| ---------------------------------------- | -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `InputEstimateAction#index`              | Mở màn hình nhập     | `InputEstimateForm`                                              | `inputEstimate.jsp` (kế thừa `AbstractSlipEditAction`) |
| `InputEstimateAction#load`               | Nút Đọc/tra số phiếu | `estimateSheetId`                                                | nạp phiếu → `inputEstimate.jsp`                        |
| `InputEstimateAction#upsert`             | Nút Lưu              | `InputEstimateForm` (validate `validate,@,validateAtCreateSlip`) | lưu → `inputEstimate.jsp`; lỗi → `errorInit`           |
| `InputEstimateAction#delete`             | Nút Xoá              | `estimateSheetId`, `updDatetm`                                   | xoá → `index`; lỗi khóa → `errorInit`                  |
| `InputEstimateAction#copy`               | Nút Sao chép         | `estimateSheetId`                                                | form nhập mới → `inputEstimate.jsp`                    |
| `SearchEstimateAction#index`             | Mở màn hình tìm      | `SearchEstimateForm`                                             | `search.jsp`                                           |
| `SearchEstimateResultAjaxAction#*`       | Nút Tìm (AJAX)       | `SearchEstimateForm`                                             | `result.jsp` (JSON/partial)                            |
| `SearchEstimateResultOutputAction#excel` | Nút Xuất Excel       | `SearchEstimateForm` (validate)                                  | `excel.jsp`; lỗi → `Mapping.EXCEL`                     |
| `OutputEstimateSheetSingleAction#pdf`    | Nút In               | `estimateSheetId`                                                | PDF (template `0000B`)                                 |
| `DispProductPriceListAction#index`       | Mở tra giá           | `DispProductPriceListForm`                                       | `dispProductPriceList.jsp`                             |
| `DispProductPriceListAction#show`        | Nút Tra              | `productCode`                                                    | `dispProductPriceList.jsp` (+lỗi nếu không có)         |
| `CheckEstimateSheetAction#exists`        | AJAX kiểm tra số     | `estimateSheetId`                                                | JSON `{estimateSheetId}` hoặc null                     |

## 7. Giao dịch, khoá & side-effect

- **Phạm vi transaction:** `upsert`/`delete` lần lượt gọi `SheetService` rồi `LineService` trong cùng một request; ranh giới transaction do Seasar quản lý (interceptor/dicon). [CẦN XÁC NHẬN] cấu hình transaction/rollback cụ thể (annotation/`.dicon`) — không có trong scope file estimate.
- **Khoá:** cập nhật/xoá dùng `lockRecord(...)` với `LockEstimateSheet.sql` (`SELECT ... FOR UPDATE`, so `UPD_DATETM`/`UPD_USER`) → kết hợp khóa **bi quan** (FOR UPDATE) và **lạc quan** (so mốc thời gian). Xung đột → `UnabledLockException` → về `errorInit` với message `e.getKey()`.
- **Side-effect:** cấp số dòng qua `SeqMakerService`; đánh lại `lineNo` từ 1 mỗi lần lưu; cập nhật audit trước khi xoá; gán `deliveryZipCode` từ khách; tính `estimateAnnual/Monthly/Ym`. Không có side-effect sang tồn kho/công nợ (estimate là đầu luồng). Dialog `copySlipDialog/*/estimate.jsp` phục vụ 受注 sao chép (side-effect xảy ra ở module rorder).

## 8. Xử lý ngoại lệ & message

| Exception              | Điều kiện                                                               | Message id                                                            |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `ServiceException`     | Lỗi DB/nghiệp vụ khi save/load/search; nếu `isStopOnError()` → ném tiếp | (message của exception)                                               |
| `UnabledLockException` | Bản ghi bị khóa/đã thay đổi khi update/delete                           | `e.getKey()` → `errorInit`                                            |
| Validate ngày          | `estimateDate > validDate`                                              | `errors.date.estimate`                                                |
| Validate khách         | `customerCode` không tồn tại                                            | `errors.dataNotExist`                                                 |
| Validate dòng          | thiếu/không hợp lệ số lượng, đơn giá, thành tiền                        | `errors.line.required` / `.float` / `.num0` / `.range` / `.maxlength` |
| Không có dòng          | phiếu không có dòng nào có mã sản phẩm                                  | `errors.noline`                                                       |
| Tra giá                | không có sản phẩm / không có chiết khấu                                 | `errors.dispProductPrice.none.productCode` / `.none.discountRel`      |
| Sao chép               | không nhập số phiếu nguồn                                               | `errors.notExist`                                                     |
| Thông báo thành công   | insert/update/delete                                                    | `infos.insert` / `infos.update` / `infos.delete`                      |

## 9. Cấu hình & phụ thuộc kỹ thuật

- **Service inject (`@Resource`):** trong `InputEstimateAction`: `EstimateSheetService`, `EstimateLineService`, `CategoryService`, `CustomerService`. Trong `EstimateSheetService`: `YmService`. Trong `EstimateLineService`: `SeqMakerService`. Trong `DispProductPriceListAction`: `DiscountRelService`, `DiscountTrnService`, `ProductService`.
- **Master data / Category cần nạp:** kính ngữ đề xuất (`Categories.PRE_TYPE` → `submitPreList`), danh sách thuế suất (`ListUtil.getRateTaxNoBlankList(taxRateService)` → `ctaxRateList`), cột hiển thị kết quả (`DetailDispItemService`).
- **Thư viện Seasar/Struts dùng:** `Beans.createAndCopy`/`Beans.copy` (+ `dateConverter`), `BeanMap`, `MessageResourcesUtil`, annotation `@Execute`/`@ActionForm`, `@Required`/`@Maxlength`/`@DateType`/`@Mask`/`@LongRange`/`@DoubleType`; `ResponseUtil` + `net.arnx.jsonic.JSON` (AJAX check). SQL kiểu 2-way SQL (comment-based) qua `selectBySqlFile`/`updateBySqlFile`.
- **Hằng số:** `Constants.FORMAT.DATE`/`TIMESTAMP`, `Constants.SQL.ASC/DESC`, `Constants.LIMIT_VALUE.PRICE_MIN/MAX`, `Constants.SEARCH_TARGET.VALUE_SLIP`, `Constants.MENU_ID.INPUT_ESTIMATE/SEARCH_ESTIMATE`, `Constants.CODE_MASK.HANKAKU_MASK`, `CategoryTrns.PREFIX_SAMA`, `DiscountUtil.isExceptianalProduct`.

## 10. Điểm chưa rõ

- [CẦN XÁC NHẬN] Cấu hình transaction/rollback (interceptor Seasar hay `.dicon`) áp cho `upsert`/`delete` — không nằm trong file scope estimate.
- [CẦN XÁC NHẬN] Nơi tính `cost`/`retailPrice` từng dòng và các tổng (`*Total`, `grossMargin`, `grossMarginRate`) — các trường này chỉ được nhận/lưu từ Form, không có logic tính trong lớp Java scope (khả năng tính ở JSP/JavaScript).
- [CẦN XÁC NHẬN] Logic áp dụng `taxFractCategory`/`priceFractCategory` (làm tròn) — chỉ thấy lưu/nạp.
- [CẦN XÁC NHẬN] Chi tiết `SearchEstimateDto`/`SearchEstimateResultDto`: khai báo nhưng tìm kiếm thực tế dùng `BeanMap`; vai trò chính xác của 2 DTO này trong luồng chạy.
