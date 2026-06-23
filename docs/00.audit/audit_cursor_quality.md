# Audit Chất lượng Output — Cursor (`output/cursor/`)

> **Ngày audit:** 2026-06-23 (cập nhật: tầng FD đã hoàn thiện đủ 15 FD)
> **Phạm vi:** `output/cursor/` — 10 RE analysis + 5 DB deep analysis + 15 Workflow (+15 evidence) + **15 Function Design (+15 evidence + 12 inventory)** + index/reports
> **Phương pháp:** Đọc trực tiếp deliverable, đối chiếu line-level với source code thực tế trong `SalesCube/`
> **Đối chiếu:** xem [audit_devin_quality.md](./audit_devin_quality.md)

---

## 1. Executive Summary

| Chỉ số | Kết quả |
|--------|---------|
| RE analysis (01-10) | ✅ 10 file |
| DB deep analysis (spec-11) | ✅ 5 file |
| Workflow docs (spec-12) | ✅ 15 WF + 15 evidence |
| **Function Design** | ✅ **15 FD + 15 evidence file + 12 inventory** — phủ **toàn bộ module** (cả P2P, STOCK, REPORT, SETTING) |
| QA pipeline | ✅ Gap report + Review report (`docs/spec/gaps/`, `docs/spec/reviews/`) |
| Độ chính xác evidence | ✅ **Cao** — line citation khít với source (verify nhiều điểm) |
| Tự nhận giới hạn | ✅ Có — hedge confidence rõ ràng, không bịa độ chính xác |

**Tổng đánh giá:** Cursor output **phủ rộng nhất, đáng tin cậy nhất, và nay đã đầy đủ cả tầng Function Design**. Đây là bộ deliverable end-to-end hoàn chỉnh (RE → DB → Workflow → FD → QA), evidence khít source, có pipeline gap/review. **So với bản audit trước (chỉ 1 FD), tầng FD nay là điểm mạnh chứ không còn là điểm yếu.**

---

## 2. Phạm vi Deliverable

| Loại | Spec | Cursor có? | Chất lượng |
|------|------|-----------|-----------|
| Architecture / Module / Route / DB / Batch / Auth / Screen / Flow / Integration / Risk (01-10) | spec-01/05/06/07/08/10 | ✅ 10 file | ✅ Khít source |
| DB deep analysis | spec-11 | ✅ `database/*` (5 file, ~2.075 dòng) | ✅ Rất chi tiết |
| Workflow docs | spec-12 | ✅ 15 WF + evidence | ✅ Evidence khít |
| **Function Design** | — | ✅ **15 FD + evidence + inventory** | ✅ **Đầy đủ, map 1:1 với 15 WF** |
| QA (gap/review) | — | ✅ GAP-02/03, REV-01 | ✅ Có verdict |

→ Cursor cover **toàn bộ pipeline RE → WF → FD → QA**. Không còn khoảng trống.

### Coverage Function Design (15 FD)

| Nhóm | FD |
|------|-----|
| Auth | FD-AUTH-01 |
| Master | FD-CUST-01, FD-SETTING-01 |
| Batch | FD-CUST-02 (rank update) |
| O2C | FD-RORDER-01, FD-RORDER-02, FD-SALES-01, FD-BILL-01, FD-DEPOSIT-01, FD-DEPOSIT-02 |
| P2P | FD-PORDER-01, FD-PURCHASE-01, FD-PAYMENT-01 |
| Stock | FD-STOCK-01 |
| Report | FD-REPORT-01 |

> **So với Devin (13 FD, chỉ P1):** Cursor phủ **rộng hơn** — bao gồm cả P2P (mua hàng/nhập/thanh toán NCC), STOCK, REPORT, SETTING mà Devin **không có**.

---

## 3. Độ chính xác Evidence (đối chiếu source thực tế)

### ✅ Workflow — verify khít (WF-05 Bill Closing)

| Claim | Source thực tế | Verdict |
|-------|----------------|---------|
| `CloseBillAction.java` ~486 dòng | **485 dòng** | ✅ |
| `close()` @ 100-141 | @ **L100** | ✅ |
| `reopen()` @ 150-196 | @ **L151** | ✅ |
| `validateCheckClose()` @ 277+ | @ **L277** | ✅ |
| BillService imports L51/59/67/79 | Khít từng dòng | ✅ |

### ✅ Function Design — verify khít (FD-AUTH-01 + evidence)

| Claim | Source thực tế | Verdict |
|-------|----------------|---------|
| Login success/session @ `LoginAction.java:211-248` | L211-248 = `Beans.copy(user→userDto)`, `menuService...menuDtoList`, `Beans.copy(mine→mineDto)` | ✅ **Chính xác** |
| Lock policy @ `LoginAction.java:136-200` | L136+ = `retryCount`, `mine.totalFailCount`, `user.lockflg` check | ✅ **Chính xác** |
| SSO @ `LoginAction.java:98-101` | Block `if(hasLength(userId)&&hasLength(password)) return login()` | ✅ **Chính xác** |
| AES key `jp.co.arkinfosys` @ `EncryptUtil.java:26` | Key @ L26 | ✅ |
| Tên class `SearchCustomerAction`, `EditCustomerAction` (FD-CUST-01) | Tồn tại trong `action/master/` | ✅ (đối lập Devin bịa `CustomerMasterAction`) |

**Nhận xét:** Cả tầng WF lẫn FD của Cursor đều có line citation **khít với source thực tế** tại mọi điểm sampling. Tầng FD còn có **file evidence riêng** (`_evidence/FD-*.md`) liệt kê source anchor cho từng finding — truy vết tốt hơn Devin (Devin gộp evidence inline, có false precision).

### ✅ Trung thực về độ tin cậy

Cursor **chủ động hedge**: mỗi FD ghi `Confidence: MEDIUM-HIGH — Java line-level: source có thể ngoài workspace`, file evidence có mục **Gaps** liệt kê rõ điều chưa verify. Provenance phân tầng rõ: `LEGACY_CONFIRMED` / `INFERRED` / `TARGET_DECISION` / `ASSUMPTION` / `UNKNOWN`. Đây là practice tốt hơn Devin (tự tin `LEGACY_CONFIRMED` cả khi line number sai).

> **Lưu ý nhẹ:** Cursor vẫn ghi "source có thể ngoài workspace" dù `SalesCube/` **có** trong repo — thận trọng hơn mức cần thiết. Tuy nhiên các line citation thực tế vẫn khít, nên đây chỉ là vấn đề nhãn confidence, không phải sai nội dung.

---

## 4. Điểm mạnh nổi bật

1. **End-to-end hoàn chỉnh:** RE → DB → WF → FD → QA, không khoảng trống.
2. **DB deep analysis (5 file spec-11):** `table-dictionary` (639 dòng), `relationship-map`, `suspected-erd`, `data-lifecycle`, `data-integrity-risks` — Devin không có gì tương đương.
3. **Evidence tách file:** mỗi WF/FD có `_evidence/` riêng với source anchor → audit-friendly, truy vết rõ.
4. **QA pipeline thật:** gap report (`GAP-02/03`) + review report (`REV-01 APPROVED`) có verdict — vòng kiểm soát chất lượng nội tại.
5. **FD chất lượng cao:** API contract + Zod + Prisma I/O + business rules (có severity) + validation + test cases + open questions; phân biệt rõ `LEGACY_CONFIRMED` vs `TARGET_DECISION` (vd AES legacy chỉ verify, password mới dùng bcrypt).
6. **Map 1:1 WF↔FD** + O2C/P2P sequencing rõ ràng.

---

## 5. Điểm yếu (còn lại)

| ID | Severity | Vấn đề |
|----|----------|--------|
| CUR-W01 | 🟡 MINOR | **Confidence label thận trọng quá mức:** giả định source ngoài workspace dù `SalesCube/` có sẵn → FD dừng ở MEDIUM trong khi line citation thực tế đã khít, có thể nâng lên `LEGACY_CONFIRMED` |
| CUR-W02 | 🟡 MINOR | **Trạng thái FD chưa đồng đều:** `_index.md` ghi FD-CUST-01 `APPROVED`, 14 FD còn lại `DRAFT` + review `Pending` (GAP-03 mới `READY_FOR_REVIEW`) → cần chạy review cho 14 FD |
| CUR-W03 | 🟢 MINOR | `suspected-erd.md` dùng `.md` thay vì `.mmd` như spec-11 (đã ghi nhận audit workflow) |
| CUR-W04 | 🟢 MINOR | Một số output behavior (JSP forward) gắn `INFERRED` dù có thể đọc JSP trong repo |

→ Không còn điểm yếu MAJOR. Tầng FD (điểm yếu cũ) **đã được khắc phục đầy đủ**.

---

## 6. So sánh Định lượng vs Devin

| Tiêu chí | Cursor | Devin |
|----------|--------|-------|
| RE analysis (01-10) | ✅ 10 | ❌ 0 |
| DB deep analysis | ✅ 5 | ❌ 0 |
| Workflow docs | ✅ 15 + evidence | ❌ 0 (mượn Cursor) |
| **Function Design** | ✅ **15 (phủ cả P2P/STOCK/REPORT/SETTING)** | ⚠️ 13 (chỉ P1) |
| Evidence tách file | ✅ Có (`_evidence/` cho WF + FD) | ❌ Inline |
| QA pipeline (gap/review) | ✅ Có | ❌ Không |
| Độ chính xác line citation | ✅ Khít (WF + FD đều verify đúng) | ⚠️ Gần đúng / false precision, có class bịa |
| Trung thực confidence | ✅ Hedge đúng | ❌ Tự tin sai |
| Defect cấu trúc | ~0 | 4 (orphan, link gãy, ref thiếu, class sai) |

**Kết luận so sánh:** Sau khi tầng FD hoàn thiện, **Cursor vượt Devin ở gần như mọi tiêu chí**, kể cả tầng FD (rộng hơn về module, chính xác hơn về evidence, có evidence tách file + QA). Devin chỉ còn lợi thế nhỏ về **chiều sâu implementation outline** trong một số FD (NestJS code mẫu nhiều bước), nhưng đánh đổi bằng false precision và phụ thuộc Cursor.

---

## 7. Khuyến nghị

### 🟡 P1
- [ ] Chạy review cho 14 FD `DRAFT` (GAP-03 → REV) để đồng bộ trạng thái với FD-CUST-01 `APPROVED` (CUR-W02).
- [ ] Vì `SalesCube/` có trong repo: nâng confidence FD từ MEDIUM lên `LEGACY_CONFIRMED` sau spot-check (line citation đã khít) (CUR-W01).

### 🟢 P2
- [ ] Đổi `suspected-erd.md` → `.mmd` cho đúng spec-11 (CUR-W03).
- [ ] Resolve `INFERRED` output behavior bằng cách đọc JSP thực tế (CUR-W04).

---

## 8. Kết luận

| Khía cạnh | Đánh giá |
|-----------|----------|
| **Phủ phạm vi RE→DB→WF→FD→QA** | ✅ Xuất sắc — end-to-end hoàn chỉnh |
| **Function Design** | ✅ **Đầy đủ 15 FD, phủ cả P2P** — điểm yếu cũ đã khắc phục |
| **Độ chính xác evidence** | ✅ Cao — WF + FD line citation đều khít source |
| **Trung thực confidence** | ✅ Hedge đúng, không bịa |
| **DB deep analysis + QA pipeline** | ✅ Mạnh nhất, Devin không có |

**Verdict:** `COMPLETE_AND_RELIABLE` — Cursor là bộ output **toàn diện và đáng tin cậy nhất**, nay đã đủ cả tầng Function Design (15 FD phủ mọi module, vượt 13 FD P1 của Devin về cả độ rộng lẫn độ chính xác evidence). Khuyến nghị dùng **Cursor làm primary cho toàn bộ pipeline migration**; chỉ cần hoàn tất review 14 FD `DRAFT`.

---

*Evidence đối chiếu trực tiếp source:*
- `Confirmed by code:` `action/LoginAction.java` (249 dòng — login()@124, success/session@211-248, lock@136+, SSO@98-100)
- `Confirmed by code:` `common/EncryptUtil.java` (key@26)
- `Confirmed by code:` `action/master/` (`SearchCustomerAction`, `EditCustomerAction` — Cursor dùng đúng tên)
- `Confirmed by code:` `action/bill/CloseBillAction.java` (485 dòng — close()@100, reopen()@151, validate@277)
- `Confirmed by code:` `output/cursor/function-design/*` (15 FD + 15 evidence + 12 inventory)
