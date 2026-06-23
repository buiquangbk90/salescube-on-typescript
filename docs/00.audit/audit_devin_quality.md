# Audit Chất lượng Output — Devin AI (`output/devin/`)

> **Ngày audit:** 2026-06-23
> **Phạm vi:** 16 files trong `output/devin/` (13 Function Design + `_index.md` + `_inventory/p1-modules.md` + `_open-questions.md`)
> **Phương pháp:** Đọc trực tiếp deliverable, đối chiếu line-level với source code thực tế trong `SalesCube/WEB/.../jp/co/arkinfosys/`
> **Đối chiếu:** xem [audit_cursor_quality.md](./audit_cursor_quality.md)

---

## 1. Executive Summary

| Chỉ số | Kết quả |
|--------|---------|
| Tổng file | 16 |
| Loại deliverable | Chỉ **Function Design (FD)** — 13 FD cho P1 modules |
| Tổng dòng | ~2.870 |
| RE / DB analysis / Workflow docs | ❌ **Không có** (0 file) |
| Nguồn đầu vào | **Dựa trên output Cursor** (`output/cursor/workflows/WF-*`, `output/cursor/02-module-inventory.md`) — không tự RE |
| Độ chính xác evidence | ⚠️ **Trung bình** — line citation gần đúng, có chỗ lệch, có class bịa |
| Defect cấu trúc | 4 (file orphan, link gãy, file tham chiếu không tồn tại, tên class sai) |
| Chất lượng target design | ✅ **Tốt** — API/Zod/Prisma/NestJS outline chi tiết |

**Tổng đánh giá:** Devin output **chất lượng design tốt nhưng phạm vi hẹp và phụ thuộc Cursor**. Devin không thực hiện reverse-engineering độc lập — nó tiêu thụ output của Cursor làm đầu vào (xác nhận bởi header `WF Source: output/cursor/workflows/...` trong mọi FD và `Nguồn: output/cursor/...` trong `_inventory/p1-modules.md`). Hệ quả: khi evidence gốc của Cursor sai/thiếu, Devin kế thừa lỗi và còn thêm lỗi mới khi "tự suy diễn" tên class/line number.

---

## 2. Phạm vi Deliverable

| Loại | Spec yêu cầu | Devin có? | Ghi chú |
|------|--------------|-----------|---------|
| Module inventory (spec-01) | ✅ | ❌ | Mượn từ Cursor |
| Entity/DB analysis (spec-02/07/11) | ✅ | ❌ | Không có |
| Business rules (spec-03) | ✅ | ⚠️ | Chỉ rải rác trong FD, không tập trung |
| Screen inventory (spec-05) | ✅ | ❌ | Không có |
| Workflow docs (spec-12) | ✅ | ❌ | Mượn từ Cursor |
| Function Design | ✅ | ✅ | **13 FD — đây là toàn bộ giá trị Devin tạo ra** |
| Batch/SP (spec-10) | ✅ | ❌ | Không có |

→ Devin chỉ cover **1/7 nhóm deliverable**, đứng ở cuối pipeline (FD), phụ thuộc hoàn toàn các giai đoạn trước do Cursor làm.

---

## 3. Độ chính xác Evidence (đối chiếu source thực tế)

### ✅ Đúng

| Claim | File | Thực tế | Verdict |
|-------|------|---------|---------|
| SSO check `userId`+`password` qua params | FD-AUTH-01 cite `LoginAction.java:98-101` | `LoginAction.java:98-100` đúng là block `if(StringUtil.hasLength(userId) && hasLength(password)) return login()` | ✅ **Chính xác** |
| AES key `"jp.co.arkinfosys"` | FD-AUTH-01 cite `EncryptUtil.java:20-50` | Key tại `EncryptUtil.java:26` (`DEFAULT_PRIVATE_KEY`), AES tại L31 | ✅ Trong range |
| AES-128, không salt → rủi ro bảo mật | FD-AUTH-01 | Xác nhận từ DDL/CLAUDE.md | ✅ |
| Soft-delete `DEL_DATETM IS NULL` | nhiều FD | Pattern đúng toàn hệ thống | ✅ |

### ⚠️ Lệch / Không kiểm chứng được

| Claim | File | Vấn đề |
|-------|------|--------|
| `LoginAction.login()` ~ line 98-130 | FD-AUTH-01 §2.1 | Thực tế `login()` bắt đầu tại **L124**, không phải 98. Range 98-130 trộn lẫn block SSO của `index()` với header của `login()` → **citation không khít** |
| `LoginAction.login():105-115`, `:120`, `:125` cho V4/V5/V6 | FD-AUTH-01 §5 | Các line number cụ thể này **không tương ứng** với vị trí thật của logic fail-count/password-expiry (nằm sau L124) → **bịa độ chính xác** |
| `CustomerMasterAction` | `_inventory/p1-modules.md` (CUST) | **Class không tồn tại.** Class thật: `SearchCustomerAction.java` + `EditCustomerAction.java`. Devin gộp thành một tên không có thật |
| `interceptor/AbstractLoginCheckInterceptor.java:1-120` | FD-AUTH-01 §2.2 | Citation "1-120" là cả file — không chỉ rõ method, mang tính trang trí |

**Nhận xét:** Devin gắn nhãn `LEGACY_CONFIRMED` kèm line number cụ thể, tạo *cảm giác* chính xác cao, nhưng nhiều line number không khít hoặc class bịa. So với Cursor (tự nhận "Java source ngoài workspace → MEDIUM"), Devin **tự tin sai** (false precision) — đây là rủi ro nghiêm trọng hơn việc thừa nhận không chắc chắn.

---

## 4. Defect Cấu trúc / Tính nhất quán

| ID | Severity | Defect | Chi tiết |
|----|----------|--------|---------|
| DEV-D01 | 🔴 MAJOR | **File orphan trùng ID** | `FD-CUST-01-customer-crud.md` (460 dòng) tồn tại nhưng **không có trong `_index.md`**, trùng ID `FD-CUST-01` với `FD-CUST-01-search-customer.md`. Đây là bản sao từ Cursor (`cursor/function-design/FD-CUST-01-customer-crud.md`) bị bỏ quên → gây nhầm lẫn ID |
| DEV-D02 | 🟡 MAJOR | **Link gãy** | `_inventory/p1-modules.md` trỏ `FD-CUST-02-create-customer.md` nhưng file thật tên `FD-CUST-02-create-update-customer.md` |
| DEV-D03 | 🟡 MAJOR | **Tham chiếu file không tồn tại** | `_inventory/p1-modules.md` liệt kê `FD-AUTH-02-change-password.md` (⚠️ Needs WF) — file chưa được tạo, nhưng `_index.md` không phản ánh trạng thái này |
| DEV-D04 | 🟢 MINOR | **Tên class sai** | `CustomerMasterAction` (xem §3) lan truyền vào `_inventory` |

---

## 5. Chất lượng Nội dung FD (điểm mạnh)

Bỏ qua vấn đề evidence, **chất lượng thiết kế target của Devin rất tốt**:

- **API contract chi tiết:** mỗi FD có request/response DTO (TypeScript interface), HTTP status, message key (`errors.login.notMatch`, `errors.login.lock`) — map sát legacy.
- **Prisma model** kèm `@map()` đúng cột legacy, ghi rõ `TARGET_DECISION` khi bỏ `autoincrement()` cho PK string.
- **Zod schema** cho validation.
- **NestJS implementation outline** có comment đánh số bước logic (vd FD-AUTH-01 §9: 7 bước login).
- **Transaction boundaries** phân biệt legacy auto-commit (Seasar2) vs target `$transaction`.
- **Test surface** + **Open Questions** có ID truy vết (`OQ-AUTH-01`), Impact level — `_open-questions.md` tổng hợp 33 câu hỏi có cấu trúc tốt theo module.

→ Đây là phần Devin làm **tốt hơn** Cursor (Cursor chỉ có 1 FD).

---

## 6. So sánh Định lượng vs Cursor

> **Cập nhật:** Tầng FD của Cursor đã hoàn thiện đủ **15 FD** (không còn 1 FD như bản audit đầu). Bảng dưới đã cập nhật.

| Tiêu chí | Devin | Cursor |
|----------|-------|--------|
| Function Design | 13 FD (**chỉ P1**) | **15 FD** (phủ cả P2P/STOCK/REPORT/SETTING) |
| FD evidence tách file | ❌ Inline | ✅ `_evidence/FD-*.md` riêng |
| RE analysis (01-10) | 0 | 10 file |
| DB deep analysis | 0 | 5 file |
| Workflow docs | 0 (mượn Cursor) | 15 WF + 15 evidence |
| QA pipeline (gap/review) | ❌ | ✅ GAP/REV report |
| Độ chính xác line citation | ⚠️ Gần đúng, có false precision, class bịa | ✅ Khít (verify WF: close()@100; FD: login session@211-248, lock@136+) |
| Tự nhận giới hạn evidence | ❌ Không (tự tin) | ✅ Có (hedge "source ngoài workspace") |
| Defect cấu trúc | 4 | ~0 |

→ **Devin không còn lợi thế về số lượng/độ rộng FD.** Cursor nay phủ rộng hơn (cả P2P) và chính xác hơn về evidence. Lợi thế còn lại của Devin chỉ là **implementation outline NestJS chi tiết** ở một vài FD — đánh đổi bằng false precision và phụ thuộc Cursor.

---

## 7. Khuyến nghị

### 🔴 P0 — Fix ngay
- [ ] Xóa hoặc đưa vào index file orphan `FD-CUST-01-customer-crud.md` (DEV-D01) — quyết định: giữ bản nào làm canonical cho ID `FD-CUST-01`.
- [ ] Sửa link gãy `FD-CUST-02-create-customer.md` → `FD-CUST-02-create-update-customer.md` (DEV-D02).
- [ ] Bỏ line number cụ thể không kiểm chứng được trong FD-AUTH-01 §5 (V4/V5/V6) — hạ nhãn xuống `INFERRED_FROM_CODE` hoặc verify lại đúng line của `login()` (~L124+).

### 🟡 P1
- [ ] Sửa `CustomerMasterAction` → `SearchCustomerAction` + `EditCustomerAction` (DEV-D04), lan truyền lại các FD CUST.
- [ ] Bổ sung trạng thái cho FD chưa tạo (`FD-AUTH-02-change-password`) trong `_index.md`.
- [ ] Vì Devin phụ thuộc output Cursor: thêm bước **verify lại evidence với source gốc** trước khi gắn `LEGACY_CONFIRMED` — không kế thừa mù.

### 🟢 P2
- [ ] Mở rộng phạm vi: Devin hiện chỉ làm tầng FD. Nếu muốn Devin độc lập, cần bổ sung RE + DB analysis (hiện đang mượn Cursor).

---

## 8. Kết luận

| Khía cạnh | Đánh giá |
|-----------|----------|
| **Chiều sâu thiết kế FD** | ✅ Xuất sắc — API/Prisma/Zod/NestJS/test chi tiết, sẵn sàng cho dev |
| **Độ chính xác evidence** | ⚠️ Có vấn đề — false precision (line number bịa), tên class sai |
| **Tính độc lập** | ❌ Phụ thuộc hoàn toàn output Cursor (không tự RE) |
| **Tính nhất quán file** | ⚠️ 4 defect (orphan, link gãy, ref thiếu) |
| **Phạm vi** | ⚠️ Hẹp — chỉ FD tầng cuối pipeline, **chỉ P1** (Cursor phủ cả P2P) |

**Verdict:** `GOOD_DESIGN_WEAK_EVIDENCE` — Devin tạo ra Function Design chất lượng cao về mặt thiết kế target, **nhưng không thể dùng độc lập** vì (1) phụ thuộc Cursor làm RE/WF, (2) gắn nhãn `LEGACY_CONFIRMED` với line citation không đáng tin, (3) phạm vi hẹp hơn Cursor (chỉ P1 vs Cursor 15 FD đủ module). Sau khi tầng FD của Cursor hoàn thiện, **Cursor đã vượt Devin ở cả tầng FD** (xem [audit_cursor_quality.md](./audit_cursor_quality.md)). Khuyến nghị dùng Cursor làm primary; chỉ tham khảo Devin cho **implementation outline NestJS chi tiết** ở một số module P1, kèm checkpoint verify evidence bắt buộc.

---

*Evidence đối chiếu trực tiếp source:*
- `Confirmed by code:` `action/LoginAction.java` (249 dòng — `login()`@124, SSO block@98-100)
- `Confirmed by code:` `common/EncryptUtil.java` (key@26, AES@31)
- `Confirmed by code:` `action/master/` (`SearchCustomerAction`, `EditCustomerAction` — không có `CustomerMasterAction`)
- `Confirmed by code:` `output/devin/*` (16 files)
