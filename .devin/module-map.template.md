# SalesCube – Module Map (TEMPLATE để Devin điền)

> Devin tạo file `.devin/module-map.md` (bỏ chữ `.template`) dựa trên việc quét toàn bộ source.
> Đây CHỈ là bước lập danh sách — KHÔNG sinh tài liệu design ở bước này.

## Cách điền
- Liệt kê đầy đủ theo từng domain.
- Mỗi mục có: tên + đường dẫn file source + độ ưu tiên (P1 cao nhất).
- Đánh dấu `[ ]` chưa làm, `[x]` đã sinh tài liệu.

---

## A. Function Design targets (Service + Action chứa logic)
Quét `jp.co.arkinfosys.service.**` và `jp.co.arkinfosys.action.**`.

### Domain: sales (売上)
- [ ] (P1) SearchSalesService — `service/sales/SearchSalesService.java`
- [ ] (P1) InputSalesAction — `action/sales/InputSalesAction.java`
- [ ] (P2) ...

### Domain: rorder (受注)
- [ ] (P1) ...

### Domain: porder / purchase / stock / bill / deposit / payment / estimate / master / report / setting
- [ ] ...

---

## B. Screen Design targets (màn hình JSP)
Quét `WEB-INF/view/{domain}/{screen}/`.

### Domain: sales (売上)
- [ ] (P1) inputSales — `WEB-INF/view/sales/inputSales/` ↔ `InputSalesAction`
- [ ] (P1) searchSales — `WEB-INF/view/sales/searchSales/` ↔ `SearchSalesAction`
- [ ] (P2) outputInvoice — `WEB-INF/view/sales/outputInvoice/`
- [ ] ...

### Domain: rorder / porder / ... (liệt kê tương tự)
- [ ] ...

---

## C. Thống kê tổng (Devin tự điền)
- Tổng số Function Design cần làm: ___
- Tổng số Screen Design cần làm: ___
- Thứ tự batch đề xuất: sales → rorder → porder → master → ...
