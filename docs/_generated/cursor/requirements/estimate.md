# Requirements – estimate (見積)

> Tài liệu **YÊU CẦU NGHIỆP VỤ (what)** — mô tả module *làm gì*, góc nhìn hộp đen, độc lập công nghệ.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề các mục. Không có thông tin trong source → ghi `[CẦN XÁC NHẬN]`, KHÔNG bỏ trống, KHÔNG bịa.
> Đọc `.devin/overview.md` trước để hiểu bối cảnh & luồng nghiệp vụ tổng thể.

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | estimate (見積) |
| Agent thực hiện | cursor |
| Ngày | 2026-07-20 |
| Nguồn (scope) | xem `docs/modules/estimate.md` |
| Loại tài liệu | Requirements (yêu cầu nghiệp vụ) |

## 1. Tổng quan module
Module **estimate (見積 / Báo giá)** quản lý phiếu báo giá cho khách hàng: tạo/sửa/xoá đầu phiếu và dòng chi tiết, tìm kiếm, xuất Excel kết quả tìm, xuất PDF phiếu báo giá, và tra bảng đơn giá/chiết khấu sản phẩm.
Trong luồng order-to-cash của SalesCube, estimate đứng **đầu chuỗi** `見積 → 受注 → 売上 → …` (xem `.devin/overview.md`).
Dữ liệu báo giá có thể được dùng làm nguồn copy sang chứng từ khác (ví dụ 受注); luồng chuyển đổi chi tiết nằm ngoài module này.

## 2. Phạm vi
- **Trong phạm vi:**
  - Tìm kiếm phiếu báo giá (điều kiện + phân trang AJAX + cấu hình cột hiển thị).
  - Xuất Excel toàn bộ kết quả tìm kiếm.
  - Nhập / sửa / xoá / copy phiếu báo giá (đầu phiếu + dòng chi tiết).
  - Kiểm tra tồn tại số phiếu báo giá (AJAX) phục vụ xác nhận khi nhập số phiếu đã có.
  - Xuất PDF một phiếu báo giá.
  - Tra đơn giá sản phẩm và bậc chiết khấu (単価照会).
- **Ngoài phạm vi:**
  - Master khách hàng / sản phẩm / danh mục / bảng chiết khấu (master).
  - Chuyển báo giá thành đơn đặt hàng (rorder) và các bước sau (sales, bill, deposit…).
  - Báo cáo lịch sử / audit UI chung; cấu hình quyền menu chi tiết (setting).
  - Dialog copy phiếu dùng chung và các AJAX product/stock chung (chỉ ghi phụ thuộc).

## 3. Actor & quyền
| Actor | Mô tả | Quyền chính |
|-------|-------|-------------|
| Người dùng đã đăng nhập có menu tìm kiếm báo giá (`SEARCH_ESTIMATE`) | Tra cứu / xuất Excel | tìm, xem kết quả, xuất Excel |
| Người dùng có menu nhập báo giá (`INPUT_ESTIMATE`) | Nhập/sửa phiếu | tạo, sửa, xoá, copy, xuất PDF (khi đã lưu) |
| Người dùng có cờ cập nhật menu (`menuUpdate`) | Thao tác ghi trên màn nhập | đăng ký / cập nhật / xoá / sửa dòng; thiếu quyền thì UI khoá các nút ghi |

Ánh xạ chi tiết role → menu ID: `[CẦN XÁC NHẬN]` (không có trong scope file estimate).

## 4. Danh sách chức năng / màn hình
| Mã | Tên chức năng | Loại (Nhập/Tìm/Xuất) | Màn hình (JSP) |
|----|---------------|----------------------|----------------|
| F-01 | Tìm kiếm báo giá | Tìm | `estimate/searchEstimate/search.jsp` |
| F-02 | Kết quả tìm (AJAX phân trang) | Tìm | `ajax/estimate/searchEstimateResultAjax/result.jsp` |
| F-03 | Xuất Excel kết quả tìm | Xuất | `estimate/searchEstimateResultOutput/excel.jsp` (+ `resultList.jsp`) |
| F-04 | Nhập / sửa / xoá / copy báo giá | Nhập | `estimate/inputEstimate/inputEstimate.jsp` |
| F-05 | Kiểm tra tồn tại số phiếu (AJAX) | Tìm (AJAX) | (không JSP riêng; response JSON) |
| F-06 | Xuất PDF phiếu báo giá | Xuất | (PDF stream; template report `0000B`) |
| F-07 | Tra đơn giá / chiết khấu sản phẩm | Tìm | `estimate/dispProductPriceList/dispProductPriceList.jsp` |

## 5. Use case / luồng nghiệp vụ chính

### UC-01 – Tìm kiếm phiếu báo giá
- **Mục tiêu:** Lọc danh sách phiếu báo giá theo điều kiện và hiển thị cột theo cấu hình.
- **Tiền điều kiện:** Người dùng có quyền menu `SEARCH_ESTIMATE`.
- **Luồng chính:**
  1. Mở màn tìm; hệ thống nạp cấu hình cột kết quả (đối tượng tìm = phiếu / slip).
  2. Nhập điều kiện (số phiếu, khoảng ngày báo giá, khoảng hạn hiệu lực, người nhập, tiêu đề, ghi chú, tên đề xuất, mã/tên khách…).
  3. Thực hiện tìm qua AJAX: đếm tổng → lấy trang (LIMIT/OFFSET) → render bảng kết quả.
  4. Có thể sắp xếp theo cột được phép.
- **Luồng phụ / ngoại lệ:** Định dạng ngày sai → lỗi validation form; không có kết quả → bảng trống.
- **Hậu điều kiện:** Không ghi DB.

### UC-02 – Xuất Excel kết quả tìm
- **Mục tiêu:** Tải file Excel chứa toàn bộ kết quả khớp điều kiện hiện tại (không phân trang).
- **Tiền điều kiện:** Đã có điều kiện tìm hợp lệ; quyền menu tìm kiếm.
- **Luồng chính:**
  1. Từ màn tìm, yêu cầu xuất Excel.
  2. Hệ thống chạy lại truy vấn với cùng điều kiện, bỏ LIMIT.
  3. Trả file kiểu Excel (`ESTIMATE_SLIP.xls`).
- **Luồng phụ / ngoại lệ:** Validation ngày thất bại → không xuất.
- **Hậu điều kiện:** Không ghi DB.

### UC-03 – Tạo mới phiếu báo giá
- **Mục tiêu:** Đăng ký đầu phiếu + ít nhất một dòng chi tiết có mã sản phẩm.
- **Tiền điều kiện:** Quyền `INPUT_ESTIMATE` và `menuUpdate`; người dùng nhập **số phiếu** (半角) — hệ thống **không** tự sinh số phiếu trong Service.
- **Luồng chính:**
  1. Mở màn nhập (new): gán người nhập hiện tại, thuế suất hiện hành, mặc định tên giao hàng / kính ngữ đề xuất.
  2. Nhập thông tin đầu phiếu và các dòng (sản phẩm, SL, đơn giá, thành tiền…).
  3. Trước khi lưu, có thể gọi AJAX kiểm tra số phiếu đã tồn tại → nếu có, hỏi xác nhận rồi chuyển sang chế độ cập nhật phiếu đó.
  4. Lưu: validate → ghi đầu phiếu → ghi dòng (đánh lại số dòng từ 1; sinh ID dòng) → reload → thông báo insert.
- **Luồng phụ / ngoại lệ:** Vi phạm BR/validation → ở lại màn nhập kèm message; conflict khoá khi update → message exclusive control.
- **Hậu điều kiện:** Có bản ghi đầu phiếu + dòng trên DB; kỳ `ANNUAL/MONTHLY/YM` được suy từ ngày báo giá.

### UC-04 – Sửa / xoá / copy phiếu
- **Mục tiêu:** Cập nhật hoặc xoá phiếu hiện có; hoặc copy sang phiếu mới (chưa lưu).
- **Tiền điều kiện:** Phiếu tồn tại; có quyền cập nhật cho thao tác ghi.
- **Luồng chính (sửa):** Load theo số phiếu → sửa → lưu (optimistic lock theo `UPD_DATETM`) → thông báo update.
- **Luồng chính (xoá):** Xác nhận → cập nhật audit → xoá vật lý đầu phiếu và toàn bộ dòng → thông báo delete.
- **Luồng chính (copy):** Load phiếu nguồn → xoá ID/audit trên form → giữ nội dung nghiệp vụ → người dùng nhập số phiếu mới rồi lưu như tạo mới.
- **Luồng phụ / ngoại lệ:** Phiếu không tồn tại / đã bị xoá / đã bị người khác cập nhật → lỗi exclusive hoặc not exist.
- **Hậu điều kiện:** Sửa/xoá thay đổi DB; copy chưa lưu thì chưa có bản ghi mới.

### UC-05 – Xuất PDF phiếu báo giá
- **Mục tiêu:** In/tải PDF một phiếu đã lưu.
- **Tiền điều kiện:** Phiếu đã có số; UI thường khoá PDF khi đang ở trạng thái phiếu mới chưa lưu.
- **Luồng chính:** Lấy dữ liệu đầu phiếu + dòng → render report template `0000B` → tải file prefix `Estimate`.
- **Luồng phụ / ngoại lệ:** `[CẦN XÁC NHẬN]` hành vi khi thiếu dữ liệu report engine.
- **Hậu điều kiện:** Không ghi DB nghiệp vụ.

### UC-06 – Tra đơn giá sản phẩm (単価照会)
- **Mục tiêu:** Tra tên SP, đơn giá bán, và các bậc chiết khấu theo số lượng (nếu có quan hệ discount).
- **Tiền điều kiện:** Có mã sản phẩm cần tra.
- **Luồng chính:** Nhập mã → tìm sản phẩm → nếu có quan hệ chiết khấu thì hiển thị bậc (`dataFrom`/`dataTo`/`discountRate`) và đơn giá sau chiết khấu trên UI.
- **Luồng phụ / ngoại lệ:** Không có SP → `errors.dispProductPrice.none.productCode`; có SP nhưng không có quan hệ discount → `errors.dispProductPrice.none.discountRel`.
- **Hậu điều kiện:** Không ghi DB; **không** tự áp chiết khấu vào phiếu báo giá khi lưu dòng (chỉ tham chiếu).

## 6. Quy tắc nghiệp vụ (Business Rules)
| Mã | Quy tắc | Nguồn (file/dòng nếu có) |
|----|---------|--------------------------|
| BR-01 | Ngày báo giá (`estimateDate`) ≤ hạn hiệu lực (`validDate`) khi cả hai đều có | `InputEstimateAction#validateAtCreateSlip` |
| BR-02 | Nếu nhập `customerCode` thì mã phải tồn tại trên master khách hàng | cùng method + `CustomerService` |
| BR-03 | Phải có ≥ 1 dòng có `productCode`; dòng không có mã SP bị bỏ qua | `validateAtCreateSlip` → `errors.noline` |
| BR-04 | Với dòng có mã SP: bắt buộc số lượng, đơn giá bán, thành tiền bán | `errors.line.required` |
| BR-05 | Số lượng sau parse không được có phần nguyên = 0; đơn giá/thành tiền bán ≠ 0 | `errors.line.num0` |
| BR-06 | Giá bán âm **được phép** (có comment: báo giá có thể có giảm giá) | `InputEstimateAction` (đoạn comment マイナスも入力可) |
| BR-07 | Đơn giá vốn / thành tiền vốn = 0 bị cấm trừ sản phẩm “exceptional” (`DiscountUtil.isExceptianalProduct`) | `validateAtCreateSlip` |
| BR-08 | `cost` / `retailPrice` phải trong khoảng `PRICE_MIN`…`PRICE_MAX` (−999999999…999999999) | `Constants.LIMIT_VALUE` |
| BR-09 | Độ dài: `productCode` ≤ 20, `productAbstract` ≤ 60, line `remarks` ≤ 120 | `validateAtCreateSlip` |
| BR-10 | **Không** bắt buộc sản phẩm tồn tại trên product master (cho phép SP chưa đăng ký) | comment trong `validateAtCreateSlip` |
| BR-11 | Khi lưu, `estimateAnnual` / `estimateMonthly` / `estimateYm` lấy từ `YmService.getYm(estimateDate)`; nếu không ra YM thì để chuỗi rỗng | `EstimateSheetService#save` |
| BR-12 | Nếu có khách hàng hợp lệ, copy `customerZipCode` vào `deliveryZipCode` (comment code: cột tên delivery nhưng lưu ZIP khách) | `EstimateSheetService#save` |
| BR-13 | ID dòng mới lấy từ sequence bảng `ESTIMATE_LINE_TRN`; `lineNo` đánh lại từ 1 khi save | `EstimateLineService#save` |
| BR-14 | Số phiếu (`estimateSheetId`) do người dùng nhập (半角), không do Service sinh | Form `@Required` + insert dùng ID từ DTO |
| BR-15 | Cập nhật dùng khoá lạc quan theo `UPD_DATETM` (`SELECT … FOR UPDATE` rồi so timestamp) | `LockEstimateSheet.sql` + AbstractSlip lock |
| BR-16 | Xoá phiếu là xoá vật lý đầu phiếu + toàn bộ dòng (có trigger lịch sử ở DB) | `DeleteEstimateSheet` / `DeleteEstimateLinesBySheetId` |
| BR-17 | Thuế suất phiếu: nếu phiếu đã có `ctaxRate` khác thuế hiện hành thì giữ thuế lúc tạo phiếu | `InputEstimateForm#setSlipTaxRate` |
| BR-18 | Mặc định màn mới: `deliveryName` = message `labels.deliveryDefault`; `submitPreCategory` = kính ngữ “様” (`PREFIX_SAMA`) | `InputEstimateForm` |
| BR-19 | Tìm kiếm: prefix-like cho số phiếu / userId / customerCode; partial-like cho tên/user/title/remarks/submitName/customerName; khoảng ngày inclusive | `EstimateSheetService#setConditionParam` |
| BR-20 | Gross margin = `RETAIL_PRICE_TOTAL - COST_TOTAL`; rate = margin / `RETAIL_PRICE_TOTAL` (không có guard chia 0 trong SQL) | `FindEstimateSheetByCondition.sql` |

## 7. Dữ liệu nghiệp vụ (mức khái niệm)
| Thực thể | Ý nghĩa | Trường chính |
|----------|---------|--------------|
| Phiếu báo giá (đầu phiếu / Slip) | Chứng từ báo giá một lần cho khách / đề xuất | Số phiếu, ngày báo giá, hạn hiệu lực, người nhập, tiêu đề, điều kiện báo giá, tên đề xuất + kính ngữ, khách hàng, địa chỉ giao (một phần), tổng tiền/thuế/vốn/bán, memo, kỳ năm-tháng |
| Dòng báo giá (Line) | Một dòng hàng trên phiếu | ID dòng, số dòng, mã/tên SP, mã SP khách, SL, đơn giá vốn/bán, thành tiền vốn/bán, ghi chú |
| Bậc chiết khấu (tham chiếu) | Dùng cho màn tra giá, không phải dòng lưu trên phiếu | discountId/name, khoảng số lượng, tỷ lệ CK |
| Kết quả tìm | View tính toán từ đầu phiếu | thêm gross margin / gross margin rate |

## 8. Validation & ràng buộc (mức nghiệp vụ)
| Đối tượng | Ràng buộc | Thông báo/hành vi khi vi phạm |
|-----------|-----------|-------------------------------|
| `estimateSheetId` | Bắt buộc; nửa-width (hankaku) | Lỗi required / mask |
| `estimateDate` | Bắt buộc; định dạng ngày hệ thống | Lỗi date |
| `validDate` | Tuỳ chọn; nếu có phải định dạng đúng; ≥ estimateDate | `errors.date.estimate` nếu trước ngày báo giá |
| `submitName` | Bắt buộc; max 60 | Lỗi required / maxlength |
| `title` / `deliveryInfo` / `estimateCondition` / `remarks` / `memo` / `customerCode` / `deliveryName` | Maxlength theo form | Lỗi maxlength |
| Tổng tiền đầu phiếu (`grossMargin`, `retailPriceTotal`, …) | Kiểu số; LongRange ±999999999 | Lỗi type/range |
| Điều kiện tìm (4 trường ngày) | `@DateType yyyy/MM/dd` | Lỗi date |
| Dòng chi tiết | Theo BR-03…BR-09 | `errors.line.*` / `errors.noline` |
| `customerCode` (nếu nhập) | Phải tồn tại | `errors.dataNotExist` |
| Concurrent update | `updDatetm` khớp | `errors.exclusive.control.*` |

## 9. Phụ thuộc sang module khác (nghiệp vụ)
- Nhận dữ liệu từ:
  - **master** khách hàng (validate / ZIP / tên hiển thị).
  - **master** sản phẩm (dialog chọn SP, join khi load dòng; không bắt buộc tồn tại khi lưu).
  - **master** category kính ngữ (`PRE_TYPE`).
  - **master** discount / discount relation / discount trn (chỉ màn tra giá).
  - **setting**/thuế suất hiện hành; **Ym**/lịch kỳ kế toán.
  - Cấu hình cột hiển thị kết quả tìm (`DetailDispItem`).
- Cung cấp dữ liệu cho:
  - **rorder** (và có thể chứng từ khác) qua cơ chế copy slip / tìm phiếu có `CUSTOMER_CODE` khác rỗng — caller nằm ngoài scope.
  - **report** engine (PDF template `0000B`).

## 10. Câu hỏi mở / điểm chưa rõ
- [CẦN XÁC NHẬN] Quy tắc nghiệp vụ sinh/đặt số phiếu (manual only hay có quy ước bên ngoài UI).
- [CẦN XÁC NHẬN] Mapping quyền chi tiết role ↔ `SEARCH_ESTIMATE` / `INPUT_ESTIMATE` / `menuUpdate`.
- [CẦN XÁC NHẬN] Ý nghĩa đầy đủ các cột địa chỉ giao hàng trên entity nhưng **không** được Insert/Update SQL của estimate ghi.
- [CẦN XÁC NHẬN] Hành vi khi `RETAIL_PRICE_TOTAL = 0` (chia lấy gross margin rate).
- [CẦN XÁC NHẬN] Luồng nghiệp vụ chính thức estimate → rorder (màn nào, field nào copy).
- [CẦN XÁC NHẬN] Nội dung chính xác message `labels.deliveryDefault` theo locale triển khai.
