# Gap Report Template

Copy khi sinh `docs/spec/gaps/GAP-<NN>-<basename>.md`.

---

```markdown
# GAP-XX: Gap Check — <tên file gốc>

> **File checked**: `<path/to/output-file>`  
> **Loại**: FD | WF | RE | PRISMA | MIGRATION  
> **Workflow nguồn**: ...  
> **Baseline**: <WF-XX, entity-list, template, ...>  
> **Ngày check**: YYYY-MM-DD

---

## 1. Tóm tắt

| Mục | Giá trị |
|-----|---------|
| **Verdict** | READY_FOR_REVIEW \| NEEDS_COMPLETION \| BLOCKED |
| **P0 (Blocker)** | 0 |
| **P1 (Required)** | 0 |
| **P2 (Optional)** | 0 |
| **MET** | 0 / <total> |
| **BLOCKED items** | 0 |

---

## 2. Requirement coverage

| ID | Requirement | Status | Severity | Ghi chú |
|----|-------------|--------|----------|---------|
| FD-R01 | §1 Tổng quan | MET | P0 | |
| FD-R04 | §2 Bảng fields | PARTIAL | P0 | Thiếu 12 legacy fields |
| ... | | | | |

**Legend**: MET | PARTIAL | MISSING | N/A | BLOCKED

---

## 3. Cross-source gaps

| ID | Kiểm tra | Kết quả | Chi tiết |
|----|----------|---------|----------|
| FD-X01 | WF rules → FD | FAIL | Rule #9 delete guard chưa có trong FD §6 |
| FD-X02 | Entity list → FD fields | PARTIAL | ... |

---

## 4. Gap items (actionable)

### P0 — Phải sửa trước review
| # | Gap | Đề xuất |
|---|-----|---------|
| 1 | ... | Bổ sung §6 validation rule #9 |

### P1 — Nên sửa / TBD có lý do
| # | Gap | Đề xuất |
|---|-----|---------|

### P2 — Optional / deferred
| # | Gap | Ghi chú |
|---|-----|---------|

### BLOCKED
| # | Item | Lý do |
|---|------|-------|

---

## 5. Hành động đã thực hiện

- [ ] Bổ sung output file: ...
- [ ] Re-run gap check: <có/không>

---

## 6. Kết luận

<Verdict và lý do. Có thể chuyển sang review không?>

**Bước tiếp theo:**
- [ ] `/check-gap-requirements` re-run (nếu NEEDS_COMPLETION)
- [ ] `/review-workflow-output` (nếu READY_FOR_REVIEW)
```
