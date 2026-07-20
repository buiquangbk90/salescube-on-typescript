# SalesCube – Tổng quan hệ thống (Overview)

> Devin PHẢI đọc file này ĐẦU TIÊN trước khi document bất kỳ thành phần nào.
> Mục đích: cung cấp context tổng thể để diễn giải code đúng nghĩa, không suy diễn sai.

## 1. Hệ thống là gì
SalesCube là **hệ thống quản lý bán hàng (販売管理 / sales management)** mã nguồn mở.
Nghiệp vụ cốt lõi xoay quanh vòng đời: **Báo giá → Đơn hàng → Bán hàng/Xuất kho → Hóa đơn → Thu/Chi tiền**,
song song với **quản lý mua hàng, tồn kho và dữ liệu master**.

## 2. Tech stack & kiến trúc
- **Ngôn ngữ chính**: Java (≈88%), SQL (SQLPL/PLSQL), JavaScript, JSP/HTML/CSS.
- **Framework**: Seasar2 + S2Struts (DI container + MVC kiểu Struts).
  - Action class dùng annotation `@Execute`, `@ActionForm` (`org.seasar.struts.annotation.*`).
  - Service inject qua `@Resource`.
- **Kiến trúc phân tầng (layered)**:

```
[JSP View]  →  [Action]  →  [Service]  →  [Entity / SQL]
  (UI)         (controller)   (business)    (persistence)
                   ↑
              [Form] / [DTO]   (dữ liệu vào/ra giữa các tầng)
```

| Tầng | Package gốc | Vai trò |
|------|-------------|---------|
| Action | `jp.co.arkinfosys.action.*` | Nhận request, điều phối, trả view |
| Form | `jp.co.arkinfosys.form.*` | Bean nhận dữ liệu từ màn hình (input) |
| DTO | `jp.co.arkinfosys.dto.*` | Đối tượng truyền dữ liệu giữa tầng |
| Service | `jp.co.arkinfosys.service.*` | Logic nghiệp vụ, giao dịch DB |
| Entity | `jp.co.arkinfosys.entity.*` | Ánh xạ bảng DB; `*Trn`=transaction, join entity ở `entity/join` |
| Common | `jp.co.arkinfosys.common.*` | Hằng số, tiện ích (Constants, Categories, StringUtil...) |
| View | `WEB-INF/view/{domain}/{screen}/` | Màn hình JSP |

## 3. Quy ước đặt tên (rất quan trọng để diễn giải code)
- **Action**: `{Verb}{Domain}Action` → `InputSalesAction`, `SearchSalesAction`, `OutputInvoiceAction`.
  - `Input*` = màn hình nhập/sửa, `Search*` = tìm kiếm, `Output*` = xuất chứng từ/báo cáo.
- **Service**: `{Verb}{Domain}Service` thường extends `AbstractService<Entity>`,
  có inner class `Param` chứa các khóa tham số (vd `Param.SALES_DATE_FROM`).
- **Entity**: hậu tố `Trn` = transaction (vd `SalesSlipTrn`, `SalesLineTrn`); không hậu tố thường là master (`Customer`, `Product`).
- **Slip / Line**: `Slip` = chứng từ (đầu phiếu), `Line` = dòng chi tiết của chứng từ.
- **DTO**: `{Domain}SlipDto`, `{Domain}LineDto`.

## 4. Bản đồ nghiệp vụ (12 domain)
| Domain (package) | Tiếng Nhật | Ý nghĩa |
|------------------|-----------|---------|
| `master`   | マスタ | Dữ liệu master: khách hàng, sản phẩm, NCC, kho, thuế, danh mục... |
| `estimate` | 見積   | Báo giá |
| `rorder`   | 受注   | Đơn đặt hàng nhận từ khách (sales order) |
| `sales`    | 売上   | Bán hàng / ghi nhận doanh thu, hóa đơn, báo cáo bán hàng |
| `porder`   | 発注   | Đơn đặt mua gửi NCC (purchase order) |
| `purchase` | 仕入   | Mua hàng / nhập hàng |
| `stock`    | 在庫   | Tồn kho, nhập–xuất–điều chỉnh kho |
| `bill`     | 請求   | Lập hóa đơn / công nợ phải thu |
| `deposit`  | 入金   | Thu tiền (khách trả) |
| `payment`  | 支払   | Chi tiền (trả NCC) |
| `report`   | 帳票   | Kết xuất báo cáo / chứng từ in |
| `setting`  | 設定   | Cấu hình hệ thống, người dùng, quyền |

> Ngoài ra có `action/ajax/*` cho các thao tác AJAX (dialog tìm kiếm, gợi ý...).

## 5. Luồng nghiệp vụ điển hình (để hiểu liên kết giữa module)
```
見積(estimate) → 受注(rorder) → 売上(sales) ─┬→ 在庫 xuất kho(stock)
                                              ├→ 請求(bill) → 入金(deposit)
発注(porder) → 仕入(purchase) → 在庫 nhập kho(stock) → 支払(payment)
```

## 6. Điều Devin KHÔNG được làm
- Không bịa thông tin không có trong code. Không rõ → ghi `[CẦN XÁC NHẬN]`.
- Không suy đoán nghiệp vụ chỉ từ tên biến mơ hồ; phải trace code thực tế.
- Không bỏ qua tầng Service khi document Action (logic chính nằm ở Service).
- Không trộn lẫn `Slip` (đầu phiếu) và `Line` (dòng chi tiết).
