# Requirements – estimate (見積)

> Tài liệu **YÊU CẦU NGHIỆP VỤ (what)** — mô tả module _làm gì_, góc nhìn hộp đen, độc lập công nghệ.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề các mục. Không có thông tin trong source → ghi `[CẦN XÁC NHẬN]`, KHÔNG bỏ trống, KHÔNG bịa.
> Đọc `.devin/overview.md` trước để hiểu bối cảnh & luồng nghiệp vụ tổng thể.

## 0. Metadata

| Thuộc tính      | Giá trị                          |
| --------------- | -------------------------------- |
| Module          | estimate (見積)                  |
| Agent thực hiện | devin                            |
| Ngày            | 2026-07-20                       |
| Nguồn (scope)   | xem `docs/modules/estimate.md`   |
| Loại tài liệu   | Requirements (yêu cầu nghiệp vụ) |

## 1. Tổng quan module

Module **estimate (見積 / báo giá)** phục vụ việc lập, tìm kiếm, in và sao chép **phiếu báo giá** gửi khách hàng.
Đây là **điểm đầu** của luồng order-to-cash trong overview (`見積(estimate) → 受注(rorder) → 売上(sales) → ...`):
một báo giá đã lập có thể được sao chép/chuyển tiếp thành đơn đặt hàng (受注) ở bước sau.
Mỗi báo giá gồm **đầu phiếu** (`EstimateSheetTrn`) và **nhiều dòng chi tiết** (`EstimateLineTrn`), tham chiếu dữ liệu master
khách hàng (`Customer`), sản phẩm (`Product`), danh mục kính ngữ (`Category`) và bảng chiết khấu theo số lượng (`Discount`).

## 2. Phạm vi

- **Trong phạm vi:**
  - Tìm kiếm báo giá theo nhiều điều kiện (màn hình `searchEstimate`).
  - Nhập/sửa/xoá/sao chép báo giá (màn hình `inputEstimate`).
  - Xuất danh sách kết quả tìm kiếm ra Excel (`searchEstimateResultOutput`).
  - In một phiếu báo giá ra PDF (`OutputEstimateSheetSingle`, template `0000B`).
  - Tra bảng giá & chiết khấu theo số lượng của một sản phẩm (`dispProductPriceList`).
  - Kiểm tra tồn tại số báo giá qua AJAX (`CheckEstimateSheet`); tìm kiếm AJAX (`SearchEstimateResultAjax`).
- **Ngoài phạm vi:**
  - Tạo đơn đặt hàng từ báo giá — thuộc module **rorder (受注)** (báo giá chỉ _cung cấp dữ liệu nguồn_ để sao chép).
  - Quản lý master khách hàng/sản phẩm/chiết khấu — thuộc module **master (マスタ)**.
  - Kết xuất báo cáo dùng chung (engine in) — thuộc module **report (帳票)**; estimate chỉ chỉ định template `0000B`.
  - Tồn kho, công nợ, thu/chi — các module `stock`/`bill`/`deposit`/`payment`.

## 3. Actor & quyền

| Actor                         | Mô tả                                                                                                                                                      | Quyền chính                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Người dùng nhập liệu (担当者) | Nhân viên đăng nhập, được nhận diện qua `userDto` (userId, nameKnj) và gán vào phiếu                                                                       | tạo / sửa / xoá / sao chép / in / xuất Excel báo giá |
| [CẦN XÁC NHẬN]                | Phân quyền chi tiết theo menu ID (`MENU_ID.INPUT_ESTIMATE`, `MENU_ID.SEARCH_ESTIMATE`) — cơ chế kiểm soát quyền cụ thể không nằm trong scope file estimate | [CẦN XÁC NHẬN]                                       |

## 4. Danh sách chức năng / màn hình

| Mã   | Tên chức năng                        | Loại (Nhập/Tìm/Xuất) | Màn hình (JSP)                                               |
| ---- | ------------------------------------ | -------------------- | ------------------------------------------------------------ |
| F-01 | Tìm kiếm báo giá                     | Tìm                  | `estimate/searchEstimate/search.jsp`                         |
| F-02 | Tìm kiếm (thực thi AJAX, phân trang) | Tìm                  | `ajax/estimate/searchEstimateResultAjax/result.jsp`          |
| F-03 | Nhập/sửa/xoá/sao chép báo giá        | Nhập                 | `estimate/inputEstimate/inputEstimate.jsp`                   |
| F-04 | Xuất kết quả tìm kiếm ra Excel       | Xuất                 | `estimate/searchEstimateResultOutput/{resultList,excel}.jsp` |
| F-05 | In phiếu báo giá (PDF)               | Xuất                 | (không có JSP riêng; template báo cáo `0000B`)               |
| F-06 | Tra bảng giá & chiết khấu sản phẩm   | Tìm                  | `estimate/dispProductPriceList/dispProductPriceList.jsp`     |
| F-07 | Kiểm tra tồn tại số báo giá (AJAX)   | Tìm                  | (trả JSON, không JSP)                                        |

## 5. Use case / luồng nghiệp vụ chính

### UC-01 – Nhập & lưu báo giá (upsert)

- **Mục tiêu:** tạo mới hoặc cập nhật một phiếu báo giá cùng các dòng chi tiết.
- **Tiền điều kiện:** người dùng đã đăng nhập; đang ở màn hình `inputEstimate`.
- **Luồng chính:**
  1. Người dùng nhập số báo giá (`estimateSheetId`), ngày báo giá (`estimateDate`), tên đề xuất (`submitName`) và các dòng sản phẩm.
  2. Hệ thống validate đầu phiếu + từng dòng (xem mục 8) — `InputEstimateAction.validateAtCreateSlip`.
  3. Tính năm độ/tháng độ/năm-tháng độ từ `estimateDate` qua `YmService.getYm` (`EstimateSheetService.save`).
  4. Nếu có `customerCode`: nạp khách hàng, gán mã bưu chính khách vào `deliveryZipCode`.
  5. Nếu là dữ liệu mới → INSERT đầu phiếu; ngược lại → UPDATE (kèm khóa bản ghi).
  6. Lưu các dòng: dòng chưa có `estimateLineId` → cấp số qua `SeqMakerService.nextval` rồi INSERT; dòng đã có → UPDATE; các dòng trong `deleteLineIds` → cập nhật audit + xoá.
  7. Nạp lại dữ liệu vừa lưu, bù dòng trống về số dòng mặc định, hiển thị thông báo `infos.insert`/`infos.update`.
- **Luồng phụ / ngoại lệ:**
  - Validate thất bại → về `errorInit`, hiển thị lỗi.
  - Cập nhật/xoá khi bản ghi đã bị người khác đổi → `UnabledLockException` (xem mục 8/BR).
- **Hậu điều kiện:** bản ghi `ESTIMATE_SHEET_TRN` + các `ESTIMATE_LINE_TRN` được tạo/cập nhật; `UPD_DATETM` cập nhật.

### UC-02 – Tìm kiếm báo giá

- **Mục tiêu:** liệt kê báo giá theo điều kiện lọc.
- **Tiền điều kiện:** đang ở màn hình `searchEstimate`.
- **Luồng chính:**
  1. Người dùng nhập điều kiện (số phiếu, khoảng ngày báo giá/hạn hiệu lực, người nhập, khách, tên đề xuất, tiêu đề, ghi chú...).
  2. AJAX (`SearchEstimateResultAjax.execSearch`) đếm số dòng (`findEstimateSheetCntByCondition`) và lấy danh sách có phân trang (`findEstimateSheetByConditionLimit`).
  3. Kết quả hiển thị kèm cột suy diễn: lãi gộp (`GROSS_MARGIN`) và tỷ lệ lãi gộp (`GROSS_MARGIN_RATE`).
- **Luồng phụ / ngoại lệ:** không có điều kiện → trả toàn bộ theo mặc định phân trang.
- **Hậu điều kiện:** không thay đổi dữ liệu (chỉ đọc).

### UC-03 – Xoá báo giá

- **Mục tiêu:** xoá một phiếu báo giá và toàn bộ dòng.
- **Tiền điều kiện:** phiếu đang mở, có `estimateSheetId` và `updDatetm`.
- **Luồng chính:** cập nhật audit đầu phiếu → khóa & xoá đầu phiếu (`deleteById`) → cập nhật audit dòng → xoá toàn bộ dòng theo `sheetId` (`deleteRecords`) → thông báo `infos.delete`, về màn hình index.
- **Luồng phụ / ngoại lệ:** bản ghi bị khóa/đổi → `UnabledLockException` → `errorInit`.
- **Hậu điều kiện:** đầu phiếu + dòng bị xoá khỏi DB.

### UC-04 – Sao chép báo giá (copy)

- **Mục tiêu:** tạo phiếu mới từ nội dung một phiếu đã có.
- **Luồng chính:** đọc phiếu theo `estimateSheetId` → copy sang form → nạp dòng → `initCopy` xoá khóa/audit (số phiếu, `estimateLineId`, thông tin tạo/sửa) để lưu như bản ghi mới.
- **Luồng phụ / ngoại lệ:** không nhập số phiếu nguồn → lỗi `errors.notExist`.
- **Hậu điều kiện:** form ở trạng thái nhập mới, chưa ghi DB cho tới khi upsert.

### UC-05 – In phiếu báo giá (PDF) & Xuất Excel

- **Mục tiêu:** kết xuất một phiếu ra PDF (template `0000B`) hoặc xuất danh sách kết quả tìm kiếm ra Excel.
- **Luồng chính (PDF):** `OutputEstimateSheetSingle.getSlip` lấy đầu phiếu (`findEstimateSheetByIdSimple`), `getDetailList` lấy dòng (`findEstimateLinesBySheetIdSimple`), chèn khoảng trắng cho mã sản phẩm đặc biệt (`PrintUtil.setSpaceToExceptianalProductCode`).
- **Luồng chính (Excel):** `SearchEstimateResultOutput.excel` gọi lại tìm kiếm không giới hạn dòng (`ROW_COUNT=null`) và xuất qua `detailDispItemService`.
- **Hậu điều kiện:** không thay đổi dữ liệu.

### UC-06 – Tra bảng giá & chiết khấu sản phẩm

- **Mục tiêu:** xem giá bán và bảng chiết khấu theo số lượng của một sản phẩm.
- **Luồng chính:** nhập `productCode` → `DispProductPriceList.show` nạp sản phẩm (`ProductService.findById`), chiết khấu (`DiscountRelService.findDiscountMstByProduct`) và các bậc số lượng (`DiscountTrnService.findDiscountTrnByDiscountId`).
- **Luồng phụ / ngoại lệ:** không tìm thấy sản phẩm → `errors.dispProductPrice.none.productCode`; không có bảng chiết khấu → `errors.dispProductPrice.none.discountRel`.
- **Hậu điều kiện:** không thay đổi dữ liệu.

## 6. Quy tắc nghiệp vụ (Business Rules)

| Mã    | Quy tắc                                                                                                                                                                                                                                                          | Nguồn (file/dòng nếu có)                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| BR-01 | Số báo giá (`estimateSheetId`) do người dùng **nhập tay**, là bắt buộc; tính duy nhất được kiểm qua AJAX `exists`                                                                                                                                                | `InputEstimateForm` (`@Required` estimateSheetId); `CheckEstimateSheetAction.exists` |
| BR-02 | Năm độ/tháng độ/năm-tháng độ (`estimateAnnual/Monthly/Ym`) sinh tự động từ `estimateDate` qua `YmService.getYm`; nếu null → để rỗng                                                                                                                              | `EstimateSheetService.save` (dòng 618–629)                                           |
| BR-03 | Ngày báo giá phải ≤ hạn hiệu lực (`estimateDate <= validDate`)                                                                                                                                                                                                   | `InputEstimateAction.validateAtCreateSlip` (dòng 230–242) → `errors.date.estimate`   |
| BR-04 | Nếu nhập `customerCode` thì phải tồn tại trong master khách hàng                                                                                                                                                                                                 | `InputEstimateAction` (dòng 244–250) → `errors.dataNotExist`                         |
| BR-05 | Nếu có `customerCode`, mã bưu chính của khách được lưu vào `deliveryZipCode` (dù tên cột là delivery)                                                                                                                                                            | `EstimateSheetService.save` (dòng 631–637)                                           |
| BR-06 | Phiếu phải có ≥1 dòng chi tiết có `productCode`                                                                                                                                                                                                                  | `InputEstimateAction` (dòng 445–449) → `errors.noline`                               |
| BR-07 | Số phiếu dòng (`estimateLineId`) cấp tự động qua sequence khi là dòng mới; `lineNo` đánh lại từ 1 theo thứ tự                                                                                                                                                    | `EstimateLineService.save` (dòng 280–302)                                            |
| BR-08 | Sản phẩm "đặc biệt" (`DiscountUtil.isExceptianalProduct`) được **bỏ qua** kiểm tra giá trị 0 cho đơn giá/thành tiền vốn                                                                                                                                          | `InputEstimateAction` (dòng 333, 352)                                                |
| BR-09 | Đơn giá bán (`unitRetailPrice`) cho phép âm (do có value chiết khấu); phần chặn số âm bị comment lại                                                                                                                                                             | `InputEstimateAction` (dòng 395–401)                                                 |
| BR-10 | Lãi gộp = `RETAIL_PRICE_TOTAL - COST_TOTAL`; tỷ lệ lãi gộp = lãi gộp / `RETAIL_PRICE_TOTAL` (tính khi tìm kiếm)                                                                                                                                                  | `FindEstimateSheetByCondition.sql`                                                   |
| BR-11 | Chiết khấu theo số lượng lấy từ bảng `Discount` (`DISCOUNT_MST`) liên kết sản phẩm, hiển thị các bậc `discountTrnList`                                                                                                                                           | `DispProductPriceListAction.show`                                                    |
| BR-12 | Kính ngữ đề xuất (`submitPreCategory`) mặc định là "様" (`CategoryTrns.PREFIX_SAMA`); tên nơi giao mặc định `labels.deliveryDefault`                                                                                                                             | `InputEstimateForm.setDefaultSelected`                                               |
| BR-13 | Khi cập nhật/xoá dùng khóa lạc quan theo `UPD_DATETM` + khóa bi quan `SELECT ... FOR UPDATE`; xung đột → `UnabledLockException`                                                                                                                                  | `EstimateSheetService.updateRecord/deleteById`, `LockEstimateSheet.sql`              |
| BR-14 | [CẦN XÁC NHẬN] Công thức tính `cost`, `retailPrice` từng dòng và các tổng (`costTotal`, `retailPriceTotal`, `ctaxPriceTotal`, `estimateTotal`, `grossMargin`) — các trường này được nhận từ Form (đã tính sẵn ở client), nơi tính chưa xác định trong scope Java | `InputEstimateForm` (các trường tổng); tính toán phía JSP/JS                         |

## 7. Dữ liệu nghiệp vụ (mức khái niệm)

Các thực thể nghiệp vụ & trường chính (KHÔNG phải bảng DB — mô tả theo ngữ nghĩa).
| Thực thể | Ý nghĩa | Trường chính |
|----------|---------|--------------|
| Phiếu báo giá (đầu phiếu) | Thông tin chung của một lần báo giá | Số báo giá, ngày báo giá, hạn hiệu lực, năm/tháng/năm-tháng độ, khách hàng (mã/tên/ghi chú), nơi đề xuất (`submitName`) & kính ngữ, nơi giao (`deliveryName`, `deliveryInfo`), điều kiện báo giá, tiêu đề, ghi chú/memo, thuế suất & các tổng (vốn, giá bán, thuế, tổng phiếu), lãi gộp |
| Dòng chi tiết báo giá | Từng sản phẩm/hạng mục trong báo giá | Số dòng, mã sản phẩm, mã sản phẩm phía khách, tên/摘要 sản phẩm, số lượng, đơn giá vốn & bán, thành tiền vốn & bán, ghi chú |
| Chiết khấu số lượng (`Discount`) | Bảng chiết khấu theo bậc số lượng gắn với sản phẩm | Mã chiết khấu, tên chiết khấu, ghi chú, cờ sử dụng; kèm các bậc `discountTrnList` |

## 8. Validation & ràng buộc (mức nghiệp vụ)

| Đối tượng                                   | Ràng buộc                                                                                               | Thông báo/hành vi khi vi phạm                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Số báo giá                                  | bắt buộc; chỉ ký tự half-width (`HANKAKU_MASK`)                                                         | lỗi validate của Form (`@Required`/`@Mask`)                                             |
| Ngày báo giá                                | bắt buộc; định dạng ngày `yyyy/MM/dd` (`Constants.FORMAT.DATE`)                                         | lỗi định dạng ngày                                                                      |
| Ngày báo giá ↔ hạn hiệu lực                 | báo giá ≤ hạn hiệu lực                                                                                  | `errors.date.estimate`                                                                  |
| Tên đề xuất (`submitName`)                  | bắt buộc; ≤ 60 ký tự                                                                                    | lỗi validate của Form                                                                   |
| Nơi giao / điều kiện / info giao            | ≤ 60 / ≤ 120 ký tự tương ứng                                                                            | lỗi validate độ dài                                                                     |
| Tiêu đề (`title`)                           | ≤ 100 ký tự                                                                                             | lỗi validate độ dài                                                                     |
| Ghi chú (`remarks`) / memo                  | ≤ 120 / ≤ 1000 ký tự                                                                                    | lỗi validate độ dài                                                                     |
| Mã khách (`customerCode`)                   | ≤ 15 ký tự; nếu nhập phải tồn tại                                                                       | `errors.dataNotExist`                                                                   |
| Dòng – số lượng                             | bắt buộc; kiểu số; khác 0                                                                               | `errors.line.required` / `errors.line.float` / `errors.line.num0`                       |
| Dòng – đơn giá bán / thành tiền bán         | bắt buộc; kiểu số; khác 0; trong khoảng `PRICE_MIN..PRICE_MAX`                                          | `errors.line.required` / `errors.line.float` / `errors.line.num0` / `errors.line.range` |
| Dòng – đơn giá vốn / thành tiền vốn         | kiểu số; khác 0 (trừ sản phẩm đặc biệt); thành tiền vốn trong khoảng giá                                | `errors.line.float` / `errors.line.num0` / `errors.line.range`                          |
| Dòng – mã sản phẩm / tên sản phẩm / ghi chú | ≤ 20 / ≤ 60 / ≤ 120 ký tự                                                                               | `errors.line.maxlength`                                                                 |
| Toàn phiếu                                  | có ≥1 dòng có mã sản phẩm                                                                               | `errors.noline`                                                                         |
| Lưu ý                                       | Báo giá **không** kiểm tra sản phẩm phải tồn tại trong master (được phép báo giá sản phẩm chưa đăng ký) | `InputEstimateAction` (dòng 442)                                                        |

## 9. Phụ thuộc sang module khác (nghiệp vụ)

- **Nhận dữ liệu từ:**
  - `master` — khách hàng (`Customer`), sản phẩm (`Product`), danh mục kính ngữ (`Category`), bảng chiết khấu (`Discount`), thuế suất (`taxRateService`).
  - Dịch vụ nền tảng: `YmService` (năm/tháng độ), `SeqMakerService` (cấp số dòng).
- **Cung cấp dữ liệu cho:**
  - `rorder (受注)` — báo giá là nguồn để sao chép sang đơn đặt hàng (có dialog "copySlipDialog/\*/estimate.jsp").
  - `report (帳票)` — dữ liệu phiếu để in PDF (template `0000B`).

## 10. Câu hỏi mở / điểm chưa rõ

- [CẦN XÁC NHẬN] Nơi và công thức tính các dòng (`cost`, `retailPrice`) và các tổng trên đầu phiếu — hiện chỉ thấy nhận từ Form (client tính), không có logic tính trong lớp Java thuộc scope.
- [CẦN XÁC NHẬN] Cơ chế phân quyền theo `MENU_ID.INPUT_ESTIMATE` / `SEARCH_ESTIMATE` (ai được tạo/xoá/in).
- [CẦN XÁC NHẬN] Quy tắc nghiệp vụ khi báo giá được chuyển thành 受注 (mức estimate không xử lý, thuộc rorder).
- [CẦN XÁC NHẬN] Ý nghĩa & quy tắc của `taxFractCategory` / `priceFractCategory` (làm tròn thuế/đơn giá) — chỉ thấy lưu/nạp, không thấy logic áp dụng trong scope.
