# Review Report Template

Copy khi sinh `docs/spec/reviews/REV-<NN>-<basename>.md`.

---

```markdown
# REV-XX: Review — <tên file gốc>

> **File reviewed**: `<path/to/output-file>`  
> **Gap report**: `docs/spec/gaps/GAP-XX-<basename>.md` (verdict: READY_FOR_REVIEW)  
> **Loại**: FD | WF | RE | PRISMA | MIGRATION | OTHER  
> **Workflow nguồn**: generate-function-design | ...  
> **Ngày review**: YYYY-MM-DD  
> **Reviewer**: Cursor Agent

---

## 1. Tóm tắt

| Mục | Giá trị |
|-----|---------|
| **Verdict** | APPROVED \| NEEDS_FIX \| BLOCKED |
| **CRITICAL** | 0 |
| **WARNING** | 0 |
| **INFO** | 0 |
| **TBD items** | 0 |

<Một câu tóm tắt chất lượng file>

---

## 2. Checklist kết quả

| # | Hạng mục | Kết quả | Ghi chú |
|---|----------|---------|---------|
| 1 | Cấu trúc / sections | PASS / FAIL | |
| 2 | Evidence | PASS / FAIL | |
| 3 | Cross-reference | PASS / FAIL | |
| 4 | Spot-check #1 | PASS / FAIL | <claim đã kiểm> |
| 5 | Spot-check #2 | PASS / FAIL | |
| 6 | Spot-check #3 | PASS / FAIL | |

---

## 3. Issues

### CRITICAL
| ID | Vị trí | Mô tả | Đề xuất sửa |
|----|--------|-------|-------------|
| C1 | §3.1 | ... | ... |

### WARNING
| ID | Vị trí | Mô tả | Đề xuất sửa |
|----|--------|-------|-------------|
| W1 | ... | ... | ... |

### INFO
| ID | Vị trí | Mô tả |
|----|--------|-------|
| I1 | ... | ... |

### TBD (chấp nhận được)
| ID | Vị trí | Lý do TBD |
|----|--------|-----------|
| T1 | ... | Java source không có trong repo |

---

## 4. Hành động đã thực hiện

- [ ] Sửa output file: <mô tả hoặc "Không">
- [ ] Re-review sau sửa: <có/không>

---

## 5. Kết luận

<Verdict lý do. File có sẵn sàng dùng cho implement/docs không?>

**Khuyến nghị tiếp theo:**
1. ...
```
