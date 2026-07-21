# Requirements – estimate (見積)

> Tài liệu **YÊU CẦU NGHIỆP VỤ (what)** — mô tả module *làm gì*, góc nhìn hộp đen, độc lập công nghệ.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề các mục. Không có thông tin trong source → ghi `[CẦN XÁC NHẬN]`, KHÔNG bỏ trống, KHÔNG bịa.
> Đọc `.devin/overview.md` trước để hiểu bối cảnh & luồng nghiệp vụ tổng thể.

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | estimate (見積) |
| Agent thực hiện | claude |
| Ngày | 2026-07-21 |
| Nguồn (scope) | xem `docs/modules/estimate.md` |
| Loại tài liệu | Requirements (yêu cầu nghiệp vụ) |

## 1. Tổng quan module
Module **estimate (見積 / Báo giá)** quản lý việc lập, tra cứu, in và sao chép **phiếu báo giá** gửi cho khách hàng. Đây là **điểm khởi đầu** của vòng đời order-to-cash trong SalesCube: `見積(estimate) → 受注(rorder) → 売上(sales) → ...` (theo `.devin/overview.md` mục 5). Một phiếu báo giá gồm **đầu phiếu** (thông tin khách/đề xuất/tổng tiền) và **nhiều dòng chi tiết** (sản phẩm, số lượng, đơn giá, thành tiền). Module nhận dữ liệu master (khách hàng, sản phẩm, chiết khấu, danh mục) từ module `master` và cung cấp dữ liệu tham chiếu cho `rorder`.

## 2. Phạm vi
- **Trong phạm vi:**
  - Tìm kiếm báo giá (màn hình tìm kiếm + tìm kiếm AJAX phân trang + xuất Excel kết quả).
  - Nhập/sửa/xóa/sao chép phiếu báo giá (đầu phiếu + dòng chi tiết).
  - Kiểm tra sự tồn tại của số báo giá (AJAX) khi nhập.
  - In phiếu báo giá đơn lẻ ra PDF.
  - Tra cứu bảng giá / chiết khấu theo số lượng của một sản phẩm (màn hình 単価照会 – DispProductPriceList).
- **Ngoài phạm vi:**
  - Quản lý master khách hàng, sản phẩm, danh mục, mẫu chiết khấu → module `master`.
  - Chuyển báo giá thành đơn đặt hàng (受注) → module `rorder`.
  - Dịch vụ tính giá theo lô `commonBulkRetailPrice` và dịch vụ chiết khấu chi tiết (`DiscountRelService`, `DiscountTrnService`, `ProductService`) → thuộc tầng service dùng chung / module `master` (xem mục 9).

## 3. Actor & quyền
| Actor | Mô tả | Quyền chính |
|-------|-------|-------------|
| Người dùng nghiệp vụ (nhân viên kinh doanh) | Người đăng nhập hệ thống, lập/quản lý báo giá. Thông tin lấy từ `userDto` (userId, tên) và gán tự động vào phiếu. | tạo / sửa / xoá / sao chép / tìm kiếm / xuất Excel / in PDF / tra bảng giá |

> `[CẦN XÁC NHẬN]` Phân quyền chi tiết theo menu ID (`Constants.MENU_ID.INPUT_ESTIMATE`, `SEARCH_ESTIMATE`) do tầng framework/`setting` kiểm soát — không nằm trong scope file estimate.

## 4. Danh sách chức năng / màn hình
| Mã | Tên chức năng | Loại (Nhập/Tìm/Xuất) | Màn hình (JSP) |
|----|---------------|----------------------|----------------|
| F-01 | Màn hình tìm kiếm báo giá (điều kiện) | Tìm | `estimate/searchEstimate/search.jsp` |
| F-02 | Thực thi tìm kiếm & hiển thị kết quả (phân trang) | Tìm (AJAX) | `estimate/searchEstimate/dispProductPriceList.jsp` → kết quả render qua `ajax` result JSP `[CẦN XÁC NHẬN]` tên JSP kết quả AJAX |
| F-03 | Xuất kết quả tìm kiếm ra Excel | Xuất | `estimate/searchEstimateResultOutput/excel.jsp`, `resultList.jsp` |
| F-04 | Nhập/sửa/xóa/sao chép phiếu báo giá | Nhập | `estimate/inputEstimate/inputEstimate.jsp` |
| F-05 | Kiểm tra tồn tại số báo giá (khi nhập) | Nhập (AJAX) | (không có JSP – trả JSON) |
| F-06 | In phiếu báo giá đơn ra PDF | Xuất | (không có JSP – ghi file PDF, template `0000B`) |
| F-07 | Tra bảng giá & chiết khấu theo số lượng của sản phẩm (単価照会) | Tìm | `estimate/dispProductPriceList/dispProductPriceList.jsp` |

## 5. Use case / luồng nghiệp vụ chính

### UC-01 – Lập mới phiếu báo giá
- **Mục tiêu:** Tạo một phiếu báo giá mới với đầu phiếu và các dòng sản phẩm.
- **Tiền điều kiện:** Người dùng đã đăng nhập; đã có master khách hàng/sản phẩm cần thiết (không bắt buộc — xem luồng phụ).
- **Luồng chính:**
  1. Mở màn hình nhập → hệ thống khởi tạo phiếu mới, gán sẵn người nhập (userId/tên), thuế suất hiện hành, kính ngữ mặc định "様", tên nơi giao mặc định.
  2. Người dùng nhập **số báo giá** (bắt buộc, chữ/số nửa chiều rộng), **ngày báo giá** (bắt buộc), hạn hiệu lực, đề xuất tới ai (bắt buộc), khách hàng (tùy chọn), điều kiện báo giá, ghi chú, memo.
  3. Nhập các dòng: mã sản phẩm, số lượng, đơn giá vốn/đơn giá bán → hệ thống (JS phía màn hình) tự tính thành tiền vốn, thành tiền bán, và tổng: 粗利益 (lãi gộp), tổng tiền bán, thuế, tổng phiếu.
  4. Người dùng bấm **Đăng ký (upsert)** → hệ thống validate, tính năm/tháng/năm-tháng độ từ ngày báo giá, ghi đầu phiếu + các dòng, đọc lại dữ liệu và hiển thị thông báo "đã đăng ký".
- **Luồng phụ / ngoại lệ:**
  - Nếu số báo giá đã tồn tại (kiểm tra qua UC-05), hệ thống hỏi có muốn mở phiếu để cập nhật hay không.
  - Vi phạm validate (mục 8) → hiển thị danh sách lỗi, ở lại màn hình nhập.
  - Sản phẩm chưa có trong master vẫn được phép nhập trên dòng (không chặn) — báo giá cho phép sản phẩm ngoài master.
- **Hậu điều kiện:** Tạo 1 bản ghi `ESTIMATE_SHEET_TRN` + N bản ghi `ESTIMATE_LINE_TRN`.

### UC-02 – Cập nhật phiếu báo giá đã có
- **Mục tiêu:** Sửa đầu phiếu / dòng của báo giá đang tồn tại.
- **Tiền điều kiện:** Phiếu đã tồn tại; người dùng mở qua chức năng load hoặc từ kết quả tìm kiếm.
- **Luồng chính:** Mở phiếu (load theo số báo giá) → sửa → bấm Đăng ký → hệ thống **khóa bản ghi (lock)** theo `UPD_DATETM`, cập nhật đầu phiếu, ghi lại toàn bộ dòng (insert dòng mới, update dòng cũ, xóa dòng bị đánh dấu).
- **Luồng phụ / ngoại lệ:** Nếu `UPD_DATETM` không khớp (người khác đã sửa) → lỗi khóa (`UnabledLockException`), thông báo và không lưu.
- **Hậu điều kiện:** Cập nhật `ESTIMATE_SHEET_TRN`; insert/update/delete các `ESTIMATE_LINE_TRN` tương ứng.

### UC-03 – Xóa phiếu báo giá
- **Mục tiêu:** Xóa hẳn một phiếu báo giá và toàn bộ dòng của nó.
- **Tiền điều kiện:** Phiếu tồn tại, đang mở.
- **Luồng chính:** Bấm Xóa → cập nhật thông tin audit → khóa & xóa đầu phiếu theo `UPD_DATETM` → xóa toàn bộ dòng theo số báo giá → thông báo "đã xóa" → quay về màn hình mới.
- **Luồng phụ / ngoại lệ:** Xung đột khóa → `UnabledLockException`, không xóa.
- **Hậu điều kiện:** Xóa bản ghi đầu phiếu + các dòng liên quan.

### UC-04 – Sao chép phiếu báo giá (複写)
- **Mục tiêu:** Tạo phiếu mới dựa trên nội dung phiếu cũ.
- **Luồng chính:** Nhập số báo giá nguồn → bấm Sao chép → hệ thống nạp đầu phiếu + dòng phiếu nguồn, **xóa các khóa/định danh** (số báo giá, ID dòng, thông tin tạo/sửa), đặt về trạng thái nhập mới để người dùng lưu thành phiếu khác.
- **Luồng phụ / ngoại lệ:** Chưa nhập số báo giá nguồn → thông báo lỗi "không tồn tại".
- **Hậu điều kiện:** Chưa ghi DB cho tới khi người dùng bấm Đăng ký (thành UC-01).

### UC-05 – Kiểm tra tồn tại số báo giá (AJAX)
- **Mục tiêu:** Khi người dùng nhập số báo giá, xác định số đó đã tồn tại chưa để quyết định "mở cập nhật" hay "lập mới".
- **Luồng chính:** Màn hình gọi AJAX `checkEstimateSheet/exists` với số báo giá → service nạp phiếu theo số → nếu có, trả JSON chứa số báo giá; nếu không, trả rỗng.
- **Hậu điều kiện:** Không thay đổi dữ liệu (chỉ đọc).

### UC-06 – Tìm kiếm báo giá & xuất kết quả
- **Mục tiêu:** Tìm danh sách báo giá theo điều kiện; xem trên lưới (AJAX phân trang) hoặc xuất Excel.
- **Luồng chính:**
  1. Nhập điều kiện (số báo giá, khoảng ngày báo giá, khoảng hạn hiệu lực, người nhập, tên/mã khách, tiêu đề, ghi chú, đề xuất).
  2. Tìm kiếm AJAX → đếm tổng số + lấy trang kết quả (LIMIT/OFFSET) đã sắp xếp, tính sẵn 粗利益 và 粗利益率.
  3. (Tùy chọn) Xuất Excel → lấy toàn bộ kết quả (không LIMIT) và ghi ra file Excel.
- **Hậu điều kiện:** Chỉ đọc.

### UC-07 – In phiếu báo giá ra PDF
- **Mục tiêu:** Kết xuất một phiếu báo giá thành PDF theo mẫu `0000B`.
- **Luồng chính:** Từ màn hình nhập, bấm In → lấy đầu phiếu + dòng theo số báo giá → sinh PDF tên tệp bắt đầu bằng `Estimate`.
- **Hậu điều kiện:** Chỉ đọc; tạo tệp tải về.

### UC-08 – Tra bảng giá & chiết khấu theo số lượng (単価照会)
- **Mục tiêu:** Xem giá bán và bảng chiết khấu theo số lượng của một sản phẩm.
- **Luồng chính:** Nhập mã sản phẩm → bấm hiển thị → lấy thông tin sản phẩm (tên, giá bán, ghi chú), tìm mẫu chiết khấu gắn với sản phẩm, và danh sách "数量スライド" (bậc số lượng → giá).
- **Luồng phụ / ngoại lệ:** Không tìm thấy sản phẩm → thông báo lỗi; sản phẩm không gắn chiết khấu → thông báo không có chiết khấu.
- **Hậu điều kiện:** Chỉ đọc.

## 6. Quy tắc nghiệp vụ (Business Rules)
| Mã | Quy tắc | Nguồn (file/dòng nếu có) |
|----|---------|--------------------------|
| BR-01 | **Số báo giá (`estimateSheetId`) do người dùng nhập tay**, bắt buộc, chỉ chữ/số nửa chiều rộng (mask HANKAKU); KHÔNG tự sinh. | `InputEstimateForm` (`@Required @Mask HANKAKU_MASK`) |
| BR-02 | **Năm độ / tháng độ / năm-tháng độ báo giá** (`estimateAnnual/Monthly/Ym`) được **tính tự động từ ngày báo giá** qua `YmService.getYm()` khi lưu; nếu không tính được thì để rỗng. | `EstimateSheetService.save` L618–629 |
| BR-03 | **ID dòng (`estimateLineId`) tự sinh** bằng sequence trên bảng `ESTIMATE_LINE_TRN` cho dòng mới; `LINE_NO` đánh số lại tuần tự 1..n khi lưu. | `EstimateLineService.save` L280–302 |
| BR-04 | Ngày báo giá phải **≤** hạn hiệu lực (`estimateDate ≤ validDate`). | `InputEstimateAction.validateAtCreateSlip` L229–242 |
| BR-05 | Nếu nhập mã khách hàng thì khách hàng đó **phải tồn tại** trong master; đồng thời **mã bưu chính của khách** được copy vào trường `deliveryZipCode` khi lưu. | validate L243–250; `EstimateSheetService.save` L631–637 |
| BR-06 | Phiếu phải có **ít nhất 1 dòng** có mã sản phẩm; dòng không có mã sản phẩm bị bỏ qua/loại. | validate L253–260, L445–449; `dto.removeBlankLine()` |
| BR-07 | Trên mỗi dòng: **thành tiền vốn = đơn giá vốn × số lượng**; **thành tiền bán = đơn giá bán × số lượng** (tính tại màn hình). | `inputEstimate.jsp` `culcCost` L997, `culcRetailPrice` L1035 |
| BR-08 | Tổng phiếu: **粗利益 (lãi gộp) = Σ thành tiền bán − Σ thành tiền vốn**; **tổng tiền bán = Σ thành tiền bán**; **粗利益率 = 粗利益 / tổng tiền bán** (%). | `inputEstimate.jsp` `sum()` L1082–1107; đồng thời SQL tìm kiếm tính `GROSS_MARGIN`, `GROSS_MARGIN_RATE` |
| BR-09 | **Thuế tiêu thụ (`ctaxPriceTotal`)**: nếu 課税区分 là "ngoại thuế" (外税伝票計 hoặc 外税締単位) thì = tổng tiền bán × thuế suất; ngược lại (nội thuế) = 0. | `inputEstimate.jsp` `sum()` L1110–1140 |
| BR-10 | Thuế suất phiếu: dùng thuế suất hiện hành; nếu phiếu đã lưu có thuế suất khác thuế suất hiện hành thì **giữ thuế suất lúc lập phiếu**. | `InputEstimateForm.setSlipTaxRate` L231–240 |
| BR-11 | Cho phép **đơn giá bán âm** (vì báo giá có thể có giảm giá) — bỏ qua ràng buộc "phải ≥ 0". | validate L395–401 (đoạn comment) |
| BR-12 | Với **sản phẩm mã đặc biệt** (`DiscountUtil.isExceptianalProduct`), bỏ qua kiểm tra "khác 0" cho đơn giá vốn/thành tiền vốn. | validate L333, L352 |
| BR-13 | Báo giá **cho phép sản phẩm không có trong master** (không kiểm tra tồn tại sản phẩm ở tầng dòng). | validate L442 (comment) |
| BR-14 | Khi **sao chép phiếu**: xóa số báo giá, ID dòng và toàn bộ thông tin tạo/sửa để tạo phiếu mới. | `InputEstimateForm.initCopy` L194–213 |
| BR-15 | Tra bảng giá: mẫu chiết khấu của sản phẩm lấy qua `DiscountRelService.findDiscountMstByProduct`; bậc số lượng lấy qua `DiscountTrnService.findDiscountTrnByDiscountId`. | `DispProductPriceListAction.show` L93–109 |

## 7. Dữ liệu nghiệp vụ (mức khái niệm)
| Thực thể | Ý nghĩa | Trường chính |
|----------|---------|--------------|
| Phiếu báo giá (đầu phiếu) | Một lần báo giá gửi khách | Số báo giá; ngày báo giá; năm/tháng/năm-tháng độ; hạn hiệu lực; thông tin giao hàng/納入期限; người nhập (ID + tên); tiêu đề; điều kiện báo giá; nơi đề xuất + kính ngữ; khách hàng (mã, tên, ghi chú, comment); mã bưu chính; ghi chú, memo; thuế suất; tổng tiền bán, thuế, tổng phiếu, tổng vốn; cách làm tròn giá/thuế |
| Dòng chi tiết báo giá | Một sản phẩm được báo giá | ID dòng; số báo giá; số thứ tự dòng (LINE_NO); mã sản phẩm; mã sản phẩm phía khách; mô tả/摘要 sản phẩm; số lượng; đơn giá vốn; đơn giá bán; thành tiền vốn; thành tiền bán; ghi chú |
| Mẫu chiết khấu (数量割引マスタ) | Master chiết khấu theo số lượng (tham chiếu) | Mã chiết khấu; tên; ghi chú; cờ sử dụng; (bậc số lượng → giá qua `DiscountTrn`) |

## 8. Validation & ràng buộc (mức nghiệp vụ)
| Đối tượng | Ràng buộc | Thông báo/hành vi khi vi phạm |
|-----------|-----------|-------------------------------|
| Số báo giá | required; chỉ ký tự nửa chiều rộng (HANKAKU) | Lỗi form (required/mask) |
| Ngày báo giá | required; định dạng ngày `Constants.FORMAT.DATE` | Lỗi form |
| Hạn hiệu lực | định dạng ngày; và ngày báo giá ≤ hạn hiệu lực | `errors.date.estimate` |
| Nơi đề xuất (submitName) | required; ≤ 60 ký tự | Lỗi form |
| Tiêu đề | ≤ 100 ký tự | Lỗi form |
| Điều kiện báo giá / 納入期限 (deliveryInfo) | ≤ 120 ký tự | Lỗi form |
| Nơi giao (deliveryName) | ≤ 60 ký tự | Lỗi form |
| Mã khách hàng | ≤ 15 ký tự; phải tồn tại nếu nhập | `errors.dataNotExist` |
|摘要/remarks | ≤ 120 ký tự | Lỗi form |
| Memo | ≤ 1000 ký tự | Lỗi form |
| Dòng – số lượng | required (nếu dòng có sản phẩm); là số; khác 0 | `errors.line.required` / `errors.line.float` / `errors.line.num0` |
| Dòng – đơn giá bán | required; là số; khác 0 (cho phép âm) | `errors.line.required` / `errors.line.float` / `errors.line.num0` |
| Dòng – thành tiền bán | required; là số; khác 0; trong khoảng `PRICE_MIN..PRICE_MAX` | `errors.line.required` / `errors.line.range` |
| Dòng – đơn giá vốn / thành tiền vốn | là số; khác 0 (trừ sản phẩm mã đặc biệt); thành tiền vốn trong khoảng cho phép | `errors.line.float` / `errors.line.num0` / `errors.line.range` |
| Dòng – mã sản phẩm | ≤ 20 ký tự | `errors.line.maxlength` |
| Dòng – tên/摘要 sản phẩm | ≤ 60 ký tự | `errors.line.maxlength` |
| Dòng – ghi chú | ≤ 120 ký tự | `errors.line.maxlength` |
| Toàn phiếu | ≥ 1 dòng có sản phẩm | `errors.noline` |
| Tổng tiền (grossMargin, retailPriceTotal, ctaxPriceTotal, estimateTotal, costTotal) | trong khoảng [-999.999.999, 999.999.999]; kiểu số | ràng buộc `@LongRange`/`@DoubleType` trên form |

## 9. Phụ thuộc sang module khác (nghiệp vụ)
- **Nhận dữ liệu từ:**
  - `master`: khách hàng (kiểm tra tồn tại, lấy mã bưu chính), sản phẩm (tên, giá bán, 受注限度数, mã NCC), danh mục kính ngữ/thuế suất, mẫu chiết khấu (数量割引).
  - Dịch vụ dùng chung: tính năm-tháng độ (`YmService`), sinh sequence (`SeqMakerService`), giá theo lô (`commonBulkRetailPrice`).
- **Cung cấp dữ liệu cho:**
  - `rorder` (受注): phiếu báo giá là nguồn tham chiếu để tạo đơn đặt hàng. `[CẦN XÁC NHẬN]` cơ chế "gọi/copy báo giá vào đơn hàng" (có SQL `FindEstimateSheetFromCopySlipByCondition.sql` phục vụ "呼出" — nhưng phía tiêu thụ nằm ở module khác, ngoài scope).
  - `report`: kết xuất chứng từ báo giá (mẫu `0000B`).

## 10. Câu hỏi mở / điểm chưa rõ
- [CẦN XÁC NHẬN] Tên JSP hiển thị kết quả tìm kiếm AJAX (`Mapping.RESULT`) — trong scope chỉ thấy `search.jsp`, `dispProductPriceList.jsp`, `excel.jsp`, `resultList.jsp`; JSP kết quả AJAX có thể là chung ở `WEB-INF/view/ajax/`.
- [CẦN XÁC NHẬN] Quy tắc/định dạng cụ thể của số báo giá (độ dài, tiền tố) — code chỉ ràng buộc HANKAKU, không thấy quy tắc sinh.
- [CẦN XÁC NHẬN] Cách làm tròn giá/thuế (`priceFractCategory`, `taxFractCategory`) tương ứng danh mục nào — logic làm tròn nằm ở JS/`SetBigDecimalScale` và cấu hình 自社 (`mineDto`), chi tiết ngoài scope.
- [CẦN XÁC NHẬN] `SearchEstimateDto` và `SearchEstimateResultDto` có trong scope nhưng không thấy được tham chiếu trực tiếp trong các Action đã đọc (search dùng `BeanMap` + `SearchEstimateForm`); có thể là DTO khai báo dùng cho tài liệu/tương lai.
- [CẦN XÁC NHẬN] `estimateTotal` (tổng phiếu = tổng tiền bán + thuế) được tính ở đoạn JS sau dòng 1144 — đã xác nhận công thức tổng tiền bán/thuế; công thức cộng cuối cùng suy ra theo nghiệp vụ.
