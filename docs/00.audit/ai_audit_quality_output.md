# Audit Tổng hợp — So sánh Chất lượng Output: Devin AI vs Cursor

> **Ngày audit:** 2026-06-23
> **Mục tiêu:** So sánh chất lượng deliverable thực tế của 2 AI trên cùng tác vụ reverse-engineering + migration design cho SalesCube
> **Phương pháp:** Đọc trực tiếp toàn bộ output, đối chiếu **line-level với source code thật** trong `SalesCube/WEB/.../jp/co/arkinfosys/`
> **Audit chi tiết từng bên:** [audit_devin_quality.md](./audit_devin_quality.md) · [audit_cursor_quality.md](./audit_cursor_quality.md)

---

## 1. Executive Summary

| | **Cursor** | **Devin** |
|---|-----------|-----------|
| Tổng file | 56 | 16 |
| Tổng dòng | ~8.650 | ~2.870 |
| Phạm vi pipeline | **RE → DB → WF → FD → QA** (end-to-end) | Chỉ **FD** (tầng cuối) |
| Function Design | 15 FD (phủ mọi module) | 13 FD (chỉ P1) |
| Tính độc lập | ✅ Tự RE từ source | ❌ Tiêu thụ output Cursor làm input |
| Độ chính xác evidence | ✅ Khít source | ⚠️ Gần đúng, có false precision |
| Defect cấu trúc | ~0 | 4 |

**Kết luận 1 dòng:** **Cursor thắng toàn diện** — phủ rộng hơn, chính xác hơn, độc lập hơn, và nay đã đủ cả tầng FD. **Devin có thiết kế target tốt nhưng phụ thuộc Cursor và mắc lỗi evidence (bịa độ chính xác).**

### Bảng điểm tổng (thang 10)

| Tiêu chí | Trọng số | Cursor | Devin |
|----------|:--------:|:------:|:-----:|
| Phạm vi phủ (coverage) | 20% | 10 | 4 |
| Độ chính xác evidence | 25% | 9 | 5 |
| Tính độc lập (không phụ thuộc tool khác) | 15% | 10 | 3 |
| Truy vết / evidence tách file | 10% | 10 | 5 |
| QA pipeline (gap/review) | 10% | 9 | 2 |
| Chất lượng thiết kế target (API/Prisma/test) | 15% | 8 | 9 |
| Tính nhất quán file (không lỗi link/ID) | 5% | 9 | 4 |
| **Điểm trọng số** | **100%** | **9.2** | **5.0** |

---

## 2. So sánh theo Phạm vi Deliverable

| Nhóm deliverable | Spec | Cursor | Devin |
|------------------|------|:------:|:-----:|
| Architecture overview | — | ✅ | ❌ |
| Module inventory | 01 | ✅ (307 dòng, khít `MENU_MST.sql`) | ❌ (mượn Cursor) |
| Route/API inventory | 08 | ✅ | ❌ |
| Database analysis | 07 | ✅ | ❌ |
| Batch jobs | 10 | ✅ | ❌ |
| Auth/permission | 06 | ✅ | ❌ |
| Screen mapping | 05 | ✅ | ❌ |
| Business flow | 12 | ✅ | ❌ |
| External integrations | — | ✅ | ❌ |
| Risks/unknowns | — | ✅ | ❌ |
| **DB deep analysis (5 file)** | 11 | ✅ (~2.075 dòng) | ❌ |
| **Workflow docs** | 12 | ✅ 15 WF + evidence | ❌ (mượn Cursor) |
| **Function Design** | — | ✅ 15 FD + evidence + inventory | ⚠️ 13 FD (P1 only) |
| **QA gap/review** | — | ✅ | ❌ |

→ Cursor cover **13/14 nhóm**, Devin cover **1/14** (chỉ FD). Devin đứng cuối pipeline và **phụ thuộc hoàn toàn** các giai đoạn trước do Cursor làm — xác nhận bởi header `WF Source: output/cursor/workflows/...` trong mọi FD Devin và `Nguồn: output/cursor/...` trong `_inventory/p1-modules.md`.

---

## 3. So sánh Độ chính xác Evidence (đối chiếu source thật)

### Cursor — line citation khít

| Claim | Source thật | ✓ |
|-------|-------------|:-:|
| `CloseBillAction` close()@100-141, reopen()@150-196, validate@277 | @100 / @151 / @277 | ✅ |
| BillService imports @51/59/67/79 | Khít từng dòng | ✅ |
| Login session/menu @`LoginAction.java:211-248` | L211-248 = copy userDto/mineDto + menuService | ✅ |
| Lock policy @`LoginAction.java:136-200` | L136+ = retryCount/totalFailCount/lockflg | ✅ |
| Tên class `SearchCustomerAction`/`EditCustomerAction` | Tồn tại trong `action/master/` | ✅ |

### Devin — gần đúng + false precision

| Claim | Source thật | Verdict |
|-------|-------------|---------|
| SSO @`LoginAction.java:98-101` | Khít block SSO | ✅ Đúng |
| AES key @`EncryptUtil.java:20-50` | Key @L26 | ✅ Trong range |
| `login()` ~98-130, V4/V5/V6 @`login():105-125` | `login()` thật bắt đầu @**L124** → range sai | ⚠️ **False precision** |
| Class `CustomerMasterAction` | **Không tồn tại** (thật: Search+Edit CustomerAction) | ❌ **Bịa class** |

**Điểm mấu chốt:** Cả 2 đều gắn nhãn `LEGACY_CONFIRMED`, nhưng:
- **Cursor** kèm hedge trung thực ("source có thể ngoài workspace → MEDIUM") + file `_evidence/` tách riêng với source anchor → khi sai vẫn cảnh báo người đọc.
- **Devin** tự tin gắn line number cụ thể nhưng nhiều chỗ lệch/bịa → **false precision** là rủi ro nguy hiểm hơn việc thừa nhận không chắc.

---

## 4. So sánh Chất lượng & Cấu trúc

| Khía cạnh | Cursor | Devin |
|-----------|--------|-------|
| Evidence tách file | ✅ `_evidence/WF-*`, `_evidence/FD-*` | ❌ Inline trong FD |
| QA pipeline | ✅ GAP-02/03 + REV-01 (verdict APPROVED) | ❌ Không có |
| Provenance phân tầng | ✅ LEGACY_CONFIRMED/INFERRED/TARGET_DECISION/ASSUMPTION/UNKNOWN | ✅ Tương tự (nhưng dùng sai) |
| Defect cấu trúc | ~0 | 4: file orphan `FD-CUST-01-customer-crud` (trùng ID, không có trong index), link gãy `FD-CUST-02-create-customer.md`, ref file không tồn tại `FD-AUTH-02-change-password.md`, class sai |
| Phân biệt legacy vs target | ✅ Rõ (vd AES legacy chỉ verify, PW mới bcrypt) | ✅ Rõ |

### Điểm Devin **làm tốt hơn** (công bằng)

- **Implementation outline NestJS chi tiết hơn** ở một số FD: code mẫu controller/service có comment đánh số bước logic (vd FD-AUTH-01: 7 bước login).
- **API contract** request/response DTO + message key đầy đủ.
- `_open-questions.md` tổng hợp 33 câu hỏi có cấu trúc theo module.

→ Devin mạnh ở **chiều sâu thiết kế target của từng FD**, nhưng đây là lợi thế cục bộ, không bù được phạm vi hẹp + lỗi evidence + phụ thuộc Cursor.

---

## 5. Phân tích Mối quan hệ giữa 2 Output

```
            ┌─────────────── CURSOR (upstream, độc lập) ───────────────┐
 source ──► │ RE (01-10) → DB deep (5) → WF (15) → FD (15) → QA (gap/rev) │
            └──────────────────────────┬───────────────────────────────┘
                                       │ output Cursor làm input
                                       ▼
                          ┌──────── DEVIN (downstream) ────────┐
                          │ FD (13, chỉ P1) — WF Source = Cursor │
                          └──────────────────────────────────────┘
```

Hai output **không cạnh tranh ngang hàng**: Devin xây trên nền Cursor. Hệ quả:
- Khi evidence Cursor sai/thiếu, Devin **kế thừa lỗi**.
- Devin còn **thêm lỗi mới** khi "tự suy diễn" line number/tên class lúc viết FD.

---

## 6. Bảng So sánh Định lượng Tổng

| Tiêu chí | Cursor | Devin | Winner |
|----------|:------:|:-----:|:------:|
| Số file / dòng | 56 / 8.650 | 16 / 2.870 | 🟦 Cursor |
| Coverage pipeline | 13/14 nhóm | 1/14 nhóm | 🟦 Cursor |
| Function Design | 15 (mọi module) | 13 (P1) | 🟦 Cursor |
| Độ rộng FD (P2P/STOCK/REPORT/SETTING) | ✅ Có | ❌ Không | 🟦 Cursor |
| Chính xác line citation | Khít | Gần đúng/bịa | 🟦 Cursor |
| Evidence tách file | ✅ | ❌ | 🟦 Cursor |
| QA pipeline | ✅ | ❌ | 🟦 Cursor |
| Tính độc lập | ✅ | ❌ | 🟦 Cursor |
| Defect cấu trúc | ~0 | 4 | 🟦 Cursor |
| Chiều sâu implementation outline | Tốt | Chi tiết hơn | 🟧 Devin |
| Trung thực confidence | Hedge đúng | Tự tin sai | 🟦 Cursor |

**Tỷ số: Cursor 10 / Devin 1.**

---

## 7. Khuyến nghị Sử dụng

| Kịch bản | Khuyến nghị |
|----------|-------------|
| **Primary tool cho migration** | ✅ **Cursor** — output end-to-end, đáng tin, có QA |
| **Reverse-engineering / DB analysis** | ✅ Cursor (Devin không có) |
| **Function Design** | ✅ Cursor (15 FD); tham khảo Devin cho implementation outline P1 |
| **Devin dùng khi nào** | Chỉ như **tầng FD bổ trợ sau Cursor RE**, kèm **checkpoint verify evidence bắt buộc** (không gắn `LEGACY_CONFIRMED` khi chưa spot-check line) |

### Hành động cần làm
- [ ] **P0 — Devin:** xóa/đưa vào index file orphan `FD-CUST-01-customer-crud.md`; sửa link gãy; bỏ line number bịa (FD-AUTH-01 §5); sửa `CustomerMasterAction`.
- [ ] **P1 — Cursor:** chạy review cho 14 FD còn `DRAFT`; nâng confidence FD từ MEDIUM lên `LEGACY_CONFIRMED` sau spot-check (line đã khít).
- [ ] **P2:** đổi `suspected-erd.md` → `.mmd` (spec-11).

---

## 8. Kết luận

> **Cursor là bộ output toàn diện, chính xác và độc lập nhất** — phủ trọn pipeline RE → DB → WF → FD → QA với evidence khít source và vòng kiểm soát chất lượng nội tại. Sau khi tầng FD hoàn thiện (15 FD, phủ cả P2P), Cursor vượt Devin ở **mọi tiêu chí** trừ chiều sâu implementation outline cục bộ.
>
> **Devin tạo Function Design thiết kế tốt nhưng không thể dùng độc lập:** phụ thuộc Cursor làm RE/WF, phạm vi hẹp (chỉ P1), và mắc lỗi evidence nghiêm trọng (false precision, bịa tên class) — gắn `LEGACY_CONFIRMED` mà không kiểm chứng.

| | Verdict |
|---|---------|
| **Cursor** | `COMPLETE_AND_RELIABLE` — primary tool |
| **Devin** | `GOOD_DESIGN_WEAK_EVIDENCE` — bổ trợ, cần verify |

---

*Evidence đối chiếu trực tiếp source code:*
- `Confirmed by code:` `action/LoginAction.java` (249 dòng — login()@124, session@211-248, lock@136+, SSO@98-100)
- `Confirmed by code:` `common/EncryptUtil.java` (AES key @26)
- `Confirmed by code:` `action/bill/CloseBillAction.java` (485 dòng — close()@100, reopen()@151, validate@277)
- `Confirmed by code:` `service/BillService.java` (imports @51/59/67/79)
- `Confirmed by code:` `action/master/` (`SearchCustomerAction` + `EditCustomerAction`; không có `CustomerMasterAction`)
- `Confirmed by code:` `output/cursor/*` (56 files) · `output/devin/*` (16 files)
