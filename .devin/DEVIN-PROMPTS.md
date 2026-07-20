# Prompts gửi Devin (copy-paste)

> Thay thế bằng **skills** khi có thể: `/salescube-setup`, `/salescube-module-map`, …
> Hoặc `@skills:salescube-function-design SearchSalesService`.
> Điền `<SOURCE_REPO>` = repo Java SalesCube gốc.

---

## PROMPT 0 — Setup (= `/salescube-setup`)
```
You will reverse-engineer SalesCube (Java / Seasar2 + S2Struts) and generate design docs.
SOURCE (read-only): <SOURCE_REPO>

Trước khi làm bất cứ việc gì, đọc:
.devin/README.md và .devin/overview.md.
Xác nhận bạn đã hiểu kiến trúc layered và 12 domain. Chưa sinh tài liệu ở bước này.
```

---

## PROMPT 1 — Lập Module Map (= `/salescube-module-map`)
```
Quét toàn bộ source SalesCube. Tạo file .devin/module-map.md
theo khung trong .devin/module-map.template.md.
Liệt kê đầy đủ:
- Function Design targets: tất cả Service + Action chứa logic (kèm đường dẫn file).
- Screen Design targets: mọi thư mục JSP trong WEB-INF/view/{domain}/{screen}/ (kèm Action tương ứng).
Gán độ ưu tiên P1 cho domain core: sales, rorder, porder, master.
KHÔNG sinh tài liệu design. Commit module-map.md khi xong.
```

---

## PROMPT 2 — Sinh Function Design (= `/salescube-function-design`)
```
Theo đúng workflow trong .devin/agents/function-design-agent.md,
sinh Function Design cho các mục sau (xử lý LẦN LƯỢT, đủ 6 bước mỗi mục):
1. SearchSalesService — service/sales/SearchSalesService.java
2. InputSalesAction — action/sales/InputSalesAction.java
3. <thêm từ module-map P1...>

Ghi output vào .devin/output/function-design/.
Cập nhật [x] trong module-map.md và _log.md. Commit sau mỗi file.
```

---

## PROMPT 3 — Sinh Screen Design (= `/salescube-screen-design`)
```
Theo đúng workflow trong .devin/agents/screen-design-agent.md,
sinh Screen Design cho các màn hình sau (xử lý LẦN LƯỢT):
1. inputSales — WEB-INF/view/sales/inputSales/ (domain: sales)
2. searchSales — WEB-INF/view/sales/searchSales/ (domain: sales)
3. <thêm từ module-map P1...>

Ghi output vào .devin/output/screen-design/.
Cập nhật [x] trong module-map.md và _log.md. Commit sau mỗi file.
```

---

## PROMPT 4 — Consistency pass (= `/salescube-consistency`)
```
Rà soát toàn bộ .devin/output/. Kiểm tra:
- Thuật ngữ thống nhất theo glossary trong .devin/rules/general-rules.md (R3).
- Tham chiếu chéo đúng (tên Action/Service/Entity/màn hình khớp giữa các tài liệu).
- Navigation giữa các Screen Design nhất quán.
Liệt kê các điểm chưa nhất quán + đề xuất sửa. Chỉ sửa sau khi mình xác nhận.
```

---

## Mẹo vận hành
- Ưu tiên skills (`/salescube-*`) — Devin discover tự động từ `.devin/skills/`.
- Sau mỗi batch P1, review 2–3 file ngẫu nhiên. Sai pattern → sửa `rules/` hoặc `examples/`, regenerate.
- Giữ batch nhỏ (5–10).

---

## PROMPT 5 — Benchmark module (harness `docs/`)
> Dùng cho việc so sánh 3 agent (Claude / Cursor / Devin) trên cùng 1 module. Devin là agent `devin`.
```
Bạn sẽ reverse-engineer 1 module SalesCube để so sánh 3 agent. Bạn là agent `devin`.
SOURCE Java (read-only): <SOURCE_REPO>

Đọc theo thứ tự: docs/README.md → .devin/overview.md → docs/modules/<module>.md (task card).
Sinh đúng 3 tài liệu theo template dùng chung ở docs/templates/:
- docs/_generated/devin/requirements/<module>.md   (yêu cầu nghiệp vụ - what)
- docs/_generated/devin/technical/<module>.md      (kỹ thuật Java as-is)
- docs/_generated/devin/design/<module>.md         (thiết kế port NestJS/Next.js - to-be)

Luật: CHỈ ghi trong docs/_generated/devin/**. Bám source thật, thiếu → [CẦN XÁC NHẬN], không bịa.
Giữ nguyên thứ tự & tiêu đề mục template. Không mở rộng ngoài scope trong task card.
Module pilot hiện tại: estimate (見積) — docs/modules/estimate.md.
```
