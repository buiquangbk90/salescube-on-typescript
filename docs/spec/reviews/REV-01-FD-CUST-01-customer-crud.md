# REV-01: Review — FD-CUST-01-customer-crud

> **File reviewed**: `output/cursor/function-design/FD-CUST-01-customer-crud.md`  
> **Gap report**: `docs/spec/gaps/GAP-02-FD-CUST-01-customer-crud.md` (verdict: `READY_FOR_REVIEW`)  
> **Loại**: FD  
> **Workflow nguồn**: `generate-function-design` (từ WF-02)  
> **Ngày review**: 2026-06-23  
> **Reviewer**: Cursor Agent

---

## 1. Tóm tắt

| Mục | Giá trị |
|-----|---------|
| **Verdict** | APPROVED |
| **CRITICAL** | 0 |
| **WARNING** | 1 |
| **INFO** | 3 |
| **TBD items** | 6 (chấp nhận — Java source ngoài workspace) |

FD-CUST-01 đủ §0–§11, cross-reference nhất quán với WF-02 và RE output; spot-check 3 claim chính đều khớp. Đã sửa lệch max length Zod và bổ sung MENU_ID 1302 trong review.

---

## 2. Checklist kết quả

| # | Hạng mục | Kết quả | Ghi chú |
|---|----------|---------|---------|
| 1 | Cấu trúc / sections §0–§11 | PASS | Đủ section, không trống |
| 2 | Evidence & provenance | PASS | Labels LEGACY_CONFIRMED / INFERRED / TARGET_DECISION |
| 3 | Cross-reference WF ↔ RE ↔ spec | PASS | Link WF-02, 07-screen-route, 02-entity-list |
| 4 | Spot-check #1 — legacy routes | PASS | `07-screen-route-mapping.md:185-186` → `searchCustomer`, `editCustomer` |
| 5 | Spot-check #2 — VAL unique code max 15 | PASS | WF-02 § Validation rules #1, #3 |
| 6 | Spot-check #3 — soft-delete DEL_DATETM | PASS | WF-02 § Status transitions, DB WRITE |
| 7 | Permission MENU_ID → target | PASS | Đã bổ sung bảng MENU_ID 1302 trong §8 (sửa review) |
| 8 | Gap P1 items acknowledged | PASS | §10 + OQ table |

---

## 3. Issues

### CRITICAL

*(không có)*

### WARNING

| ID | Vị trí | Mô tả | Đề xuất sửa |
|----|--------|-------|-------------|
| W1 | §2 Input fields table | Bảng field chỉ liệt kê subset (~10 cột); entity §5.1 có 40+ field | Bổ sung dần khi migrate hoặc FD-CUST-02; chấp nhận cho P1 CRUD |

### INFO

| ID | Vị trí | Mô tả |
|----|--------|-------|
| I1 | §2 Zod schema | `code`/`name` max đã sửa 15/60 khớp WF-02 (trước review ghi 20/255) |
| I2 | §2 Zod | Đã thêm `customerRank` optional khớp VAL-08 |
| I3 | §7 | `CUSTOMER_REL`, `DELIVERY_MST` ghi TBD — đúng scope P1 |

### TBD (chấp nhận được)

| ID | Vị trí | Lý do TBD |
|----|--------|-----------|
| T1 | §0, §10 | Java line-level — `SalesCube/` không trong workspace |
| T2 | OQ-01 | Method `copy()` chưa verify |
| T3 | OQ-02 | Delete guard SQL SALES_SLIP — INFERRED |
| T4 | TD-01 | `customer_hist` model shape |
| T5 | TD-02 | ZIP lookup API design |
| T6 | BR-04, BR-05 | Soft-delete / open sales — INFERRED từ WF-02 |

---

## 4. Hành động đã thực hiện

- [x] Sửa output file: Zod `code` max 15, `name` max 60; thêm `customerRank`; bảng MENU_ID 1302 §8
- [x] Re-review sau sửa: PASS (không CRITICAL còn lại)

---

## 5. Kết luận

**Verdict: APPROVED** — FD sẵn sàng làm baseline cho `/migration-typescript` module customer. Các mục INFERRED/UNKNOWN đã ghi rõ; không block implement P1 (list/create/update/soft-delete).

**Khuyến nghị tiếp theo:**

1. `/migration-typescript` module customer từ FD-CUST-01 (parity matrix trước controller)
2. Khi có `SalesCube/` — verify `EditCustomerAction.register()` và SQL soft-delete filter
3. Sinh FD-CUST-02 cho AJAX/dialog/copy nếu cần parity đầy đủ WF-02
