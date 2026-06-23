---
name: review-workflow-output
description: Review từng file output sau khi chạy workflow sinh tài liệu (FD, WF, reverse-engineering, Prisma, migration). Chỉ chạy sau check-gap-requirements verdict READY_FOR_REVIEW. Dùng sau generate-function-design, generate-workflow-docs, reverse-engineering-java, generate-prisma-schema, migration-typescript; hoặc khi user yêu cầu review output file.
disable-model-invocation: true
---

# Review Workflow Output

## Mục tiêu
Sau mỗi workflow sinh output, **bắt buộc** review từng file đã tạo/sửa trước khi báo hoàn tất. Không kết thúc task generation nếu chưa chạy bước review.

## Điều kiện tiên quyết (bắt buộc)
**Phải chạy `/check-gap-requirements` trước.** Chỉ review khi:
- Mỗi file output có gap report `docs/spec/gaps/GAP-<NN>-*.md`
- Verdict gap = `READY_FOR_REVIEW` (hoặc user chấp nhận gap còn lại)

Nếu gap verdict = `NEEDS_COMPLETION` → quay lại gap check, **không** review.

```
Generate → Cross-reference → Gap Check → [Review] → Hoàn tất
```

## Khi nào chạy
- **Tự động**: Bước cuối của mọi skill generator (FD, WF, reverse-engineering, Prisma, migration)
- **Thủ công**: User gọi `/review-workflow-output` + đường dẫn file hoặc thư mục

## Output review location
```
docs/spec/reviews/REV-<NN>-<basename>.md
```
Ví dụ: `REV-01-FD-01-customer-crud.md` review file `FD-01-customer-crud.md`

Kiểm tra `docs/spec/reviews/` để lấy số `<NN>` tiếp theo.

---

## Quy trình review (bắt buộc từng file)

### Phase 0 – Xác nhận gap check đã pass

Với mỗi file output:
1. Tìm `docs/spec/gaps/GAP-*-<basename>.md` tương ứng
2. Xác nhận verdict = `READY_FOR_REVIEW`
3. Nếu thiếu gap report → chạy `/check-gap-requirements` trước
4. Mang danh sách P1/P2/BLOCKED từ gap report vào review (không lặp lại gap analysis)

### Phase 1 – Thu thập danh sách file

1. Liệt kê **tất cả file output** tạo/sửa trong phiên hiện tại:
   - Docs: `docs/spec/**`, `output/cursor/**`
   - Code: `salescube-ts/**` (nếu migration/prisma)
2. Ghi bảng tổng hợp trước khi review:

| # | File | Loại | Workflow nguồn |
|---|------|------|----------------|
| 1 | `path/to/file.md` | FD | generate-function-design |

### Phase 2 – Review từng file (lặp cho mỗi dòng)

Với **mỗi** file output, thực hiện tuần tự:

#### 2.1 Đọc & phân loại
- Đọc toàn bộ file
- Xác định loại: `FD` | `WF` | `RE` (reverse-engineering) | `PRISMA` | `MIGRATION` | `OTHER`
- Chọn checklist tương ứng từ [reference-checklist-by-type.md](reference-checklist-by-type.md)

#### 2.2 Kiểm tra cấu trúc
- [ ] Có đủ section bắt buộc theo loại
- [ ] Không có section trống (trừ khi ghi `TBD` / `N/A`)
- [ ] Heading, numbering, links nội bộ hợp lệ
- [ ] Confidence level được ghi (nếu là doc phân tích)

#### 2.4 Kiểm tra chất lượng nội dung (không lặp gap check)
- [ ] Mọi business rule có nguồn (`file:line` hoặc mức confidence)
- **Spot-check**: chọn ngẫu nhiên 2–3 claim quan trọng → đọc source → xác nhận hoặc gắn cờ sai
- [ ] Không có nội dung bịa (hallucination) — đặc biệt route, table name, field name
- [ ] Cross-reference nhất quán (WF ↔ FD ↔ spec ↔ code target)
- [ ] Các P1/P2 từ gap report đã được xử lý hoặc ghi trong review

#### 2.5 Ghi review report
Sinh `docs/spec/reviews/REV-<NN>-<basename>.md` theo template [reference-review-report.md](reference-review-report.md).

#### 2.6 Verdict cho file
| Verdict | Điều kiện | Hành động |
|---------|-----------|-----------|
| **APPROVED** | 0 CRITICAL, ≤2 WARNING có thể chấp nhận | Tiếp file tiếp theo |
| **NEEDS_FIX** | Có CRITICAL hoặc evidence sai | Sửa output file → re-review file đó |
| **BLOCKED** | Source không có trong repo, không verify được | Ghi rõ limitation; hỏi user |

### Phase 3 – Tổng kết phiên review

Sau khi review hết file, trình bày cho user:

```markdown
## Kết quả review output

| File | Verdict | CRITICAL | WARNING | Review report |
|------|---------|----------|---------|---------------|
| FD-01-... | APPROVED | 0 | 1 | REV-01-... |

### Đã sửa tự động
- (liệt kê hoặc "Không có")

### Cần user quyết định
- (liệt kê TBD / BLOCKED items)
```

**Chỉ báo "hoàn tất workflow" khi:**
- Mọi file output đã có gap report (`READY_FOR_REVIEW`)
- Mọi file output đã có review report
- Không còn file ở trạng thái `NEEDS_FIX` (đã sửa + re-review)
- User được thông báo verdict tổng thể

---

## Sửa lỗi trong review

Ưu tiên sửa tự động khi:
- Evidence sai line number / file path → cập nhật đúng
- Field name typo khớp source
- Section thiếu nhưng data đã có trong file khác → bổ sung

**Không** tự sửa khi:
- Business rule không chắc chắn → giữ `TBD` + hỏi user
- Thay đổi behavior nghiệp vụ

Sau mỗi lần sửa output file → chạy lại Phase 2 cho file đó.

---

## Tham chiếu
- Bước trước: skill `/check-gap-requirements`
- Checklist theo loại: [reference-checklist-by-type.md](reference-checklist-by-type.md)
- Template review report: [reference-review-report.md](reference-review-report.md)
