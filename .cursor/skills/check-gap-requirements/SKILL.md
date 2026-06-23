---
name: check-gap-requirements
description: Kiểm tra gap requirement — đối chiếu output với yêu cầu bắt buộc (template, WF/FD, spec, legacy source) trước khi review. Dùng sau mọi workflow generator và trước review-workflow-output; hoặc khi user yêu cầu check gap, thiếu requirement, completeness check.
disable-model-invocation: true
---

# Check Gap Requirements

## Mục tiêu
Trước khi review chất lượng (`/review-workflow-output`), **bắt buộc** kiểm tra output đã đáp ứng đủ **requirement tối thiểu** chưa. Gap check trả lời: *"Thiếu gì so với yêu cầu?"* — Review trả lời: *"Nội dung có đúng không?"*

```
Generate → Cross-reference → [GAP CHECK] → Review → Hoàn tất
```

**Không chạy review** nếu gap check verdict là `NEEDS_COMPLETION` (trừ khi user chấp nhận gap có chủ đích).

## Output location
```
docs/spec/gaps/GAP-<NN>-<basename>.md
```
Ví dụ: `GAP-01-FD-01-customer-crud.md`

Kiểm tra `docs/spec/gaps/` để lấy số `<NN>` tiếp theo.

## Khi nào chạy
- **Tự động**: Bước trước review trong mọi skill generator
- **Thủ công**: `/check-gap-requirements` + path file/thư mục

---

## Quy trình (bắt buộc từng file)

### Phase 1 – Thu thập context

1. Liệt kê file output tạo/sửa trong phiên (giống review)
2. Với mỗi file, xác định:
   - **Loại**: `FD` | `WF` | `RE` | `PRISMA` | `MIGRATION`
   - **Workflow nguồn** đã chạy
   - **Requirement baseline** — nguồn yêu cầu phải đối chiếu (xem [reference-requirements-by-type.md](reference-requirements-by-type.md))

| Loại | Baseline bắt buộc |
|------|-------------------|
| FD | Template 11 sections + provenance + WF + entity list + code target |
| WF | Template WF skill + `12-bussiness-workflow.md` (12 mục Phase 2.5) + Action trace |
| RE | `AGENT.md` (10 outputs + evidence rules) + `docs/spec/_index.md` publish checklist |
| PRISMA | Mapping rules + DDL/entity list + `docs/spec/06` sync |
| MIGRATION | FD/WF tương ứng + migration plan + `docs/spec/04` |

### Phase 2 – Gap analysis từng file

Với **mỗi** file output:

#### 2.1 Load requirement matrix
Lấy danh sách requirement items theo loại từ `reference-requirements-by-type.md`.

#### 2.2 Đối chiếu Required vs Actual

Với mỗi requirement item, gán trạng thái:

| Status | Ý nghĩa |
|--------|---------|
| **MET** | Có trong output, đủ nội dung |
| **PARTIAL** | Có section nhưng thiếu chi tiết / chỉ TBD |
| **MISSING** | Không có trong output |
| **N/A** | Không áp dụng — ghi lý do |
| **BLOCKED** | Không thể điền — thiếu source (Java không có trong repo) |

#### 2.3 Cross-source gap (bắt buộc cho FD/WF/MIGRATION)

Đối chiếu thêm với nguồn ngoài file output:

| Kiểm tra | Áp dụng |
|----------|---------|
| WF → FD: business rules trong WF có trong FD? | FD |
| Entity list → FD: legacy fields có map? | FD |
| FD → code: endpoints/fields trong FD có trong code? | MIGRATION |
| DDL → Prisma: columns có map? | PRISMA |
| WF validation rules → FD §6 | FD |

#### 2.4 Phân loại severity

| Severity | Điều kiện | Trước review |
|----------|-----------|--------------|
| **P0 — Blocker** | Section bắt buộc MISSING; cross-ref sai hẳn | Phải sửa |
| **P1 — Required** | PARTIAL trên field/API/rule quan trọng | Sửa hoặc TBD có lý do + user OK |
| **P2 — Optional** | Nice-to-have thiếu | Có thể review với ghi chú |
| **P3 — Deferred** | BLOCKED do không có source | TBD + tiếp review |

#### 2.5 Sinh gap report
Ghi `docs/spec/gaps/GAP-<NN>-<basename>.md` theo [reference-gap-report.md](reference-gap-report.md).

#### 2.6 Verdict

| Verdict | Điều kiện | Hành động |
|---------|-----------|-----------|
| **READY_FOR_REVIEW** | 0 P0; P1 đã sửa hoặc TBD hợp lệ | Chuyển `/review-workflow-output` |
| **NEEDS_COMPLETION** | Còn P0 hoặc P1 chưa xử lý | Bổ sung output → re-run gap check |
| **BLOCKED** | >50% requirement BLOCKED | Hỏi user / ghi limitation |

### Phase 3 – Sửa gap tự động (trước re-check)

Ưu tiên bổ sung khi có data sẵn:
- Section thiếu → thêm heading + nội dung từ WF/spec/code
- Field trong entity list chưa map → thêm vào bảng mapping
- Link cross-ref thiếu → thêm link

Không bịa nội dung — dùng `TBD — <lý do>` khi không có source.

Sau sửa → chạy lại Phase 2 cho file đó.

### Phase 4 – Tổng kết

```markdown
## Kết quả gap check

| File | Verdict | P0 | P1 | P2 | Gap report |
|------|---------|----|----|-----|------------|
| FD-01-... | READY_FOR_REVIEW | 0 | 1 | 3 | GAP-01-... |

### Đã bổ sung tự động
- ...

### Còn thiếu (cần user)
- ...
```

**Chỉ gọi `/review-workflow-output` khi** mọi file có verdict `READY_FOR_REVIEW` hoặc user xác nhận chấp nhận gap.

---

## Tham chiếu
- Requirement matrix: [reference-requirements-by-type.md](reference-requirements-by-type.md)
- Gap report template: [reference-gap-report.md](reference-gap-report.md)
- Bước tiếp theo: skill `/review-workflow-output`
