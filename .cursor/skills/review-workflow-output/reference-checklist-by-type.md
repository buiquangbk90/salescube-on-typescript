# Checklist Review theo loại Output

## FD — Function Design (`docs/spec/function-design/FD-*.md`)

| # | Kiểm tra |
|---|----------|
| 1 | 12 section bắt buộc có mặt (hoặc ghi N/A có lý do) |
| 2 | Route mapping legacy ↔ target đầy đủ |
| 3 | Bảng fields: legacy column ↔ target field ↔ validation |
| 4 | Mọi API endpoint có method, permission, request/response |
| 5 | Processing logic cover create/update/delete/search |
| 6 | DB tables read/write + soft-delete |
| 7 | Validation rules có error message |
| 8 | Permission map MENU_ID → target permission |
| 9 | Gap analysis khớp code thực tế trong `salescube-ts/` |
| 10 | Evidence table không trống |
| 11 | Implementation checklist phản ánh đúng trạng thái |

**Spot-check bắt buộc**: 1 endpoint, 1 validation rule, 1 DB table — đối chiếu source.

---

## WF — Workflow Doc (`output/workflows/WF-*.md`)

| # | Kiểm tra |
|---|----------|
| 1 | Entry route / trigger rõ ràng |
| 2 | User role / MENU_ID |
| 3 | Main code path có Action → Service → SQL |
| 4 | Controllers/Services/Models table |
| 5 | DB tables read/write |
| 6 | Validation rules có evidence |
| 7 | Status transitions (nếu có state machine) |
| 8 | External integrations |
| 9 | Error handling table |
| 10 | Evidence file paths |
| 11 | Confidence level được ghi |
| 12 | Rủi ro migrate |

**Spot-check bắt buộc**: 1 step trong luồng chính — trace Action/Service trong spec hoặc output khác.

---

## RE — Reverse Engineering (`output/*.md`, `output/database/*.md`)

| # | Kiểm tra |
|---|----------|
| 1 | Mức confidence trên mỗi kết luận |
| 2 | Không kết luận không có evidence |
| 3 | `Unknown / needs verification` cho điểm không rõ |
| 4 | Actions table đầy đủ path + permission |
| 5 | Business rules có `file:line` |
| 6 | Không sửa source Java (chỉ đọc) |
| 7 | JSP scriptlet / SQL business logic đã được kiểm tra |

**Spot-check bắt buộc**: 2 business rules — verify line range tồn tại (hoặc ghi BLOCKED nếu không có Java source).

---

## PRISMA — Schema (`packages/db/prisma/schema.prisma`)

| # | Kiểm tra |
|---|----------|
| 1 | Column type mapping đúng MySQL → Prisma |
| 2 | `@@map` giữ tên bảng gốc |
| 3 | `@map` cho column snake_case |
| 4 | `deletedAt` cho `DEL_DATETM` |
| 5 | Không thêm FK relation khi DDL không có constraint (chỉ comment) |
| 6 | `prisma format` chạy thành công |
| 7 | Không trùng model name / conflict field |

**Spot-check bắt buộc**: So 1 model với `docs/spec/02-entity-list.md` hoặc DDL.

---

## MIGRATION — TypeScript code (`salescube-ts/**`)

| # | Kiểm tra |
|---|----------|
| 1 | Behavior khớp FD/WF/spec (không refactor ngoài scope) |
| 2 | Zod schema ↔ API controller ↔ form |
| 3 | Soft-delete filter `deletedAt: null` |
| 4 | Permission guard (không để `@Public()` trừ khi có lý do) |
| 5 | Business rules có comment nguồn Java |
| 6 | Không mock trong production path (nếu đã wire service) |
| 7 | TypeScript compile / linter không lỗi mới |

**Spot-check bắt buộc**: 1 service method ↔ 1 rule trong FD/WF.

---

## OTHER — File khác

Dùng checklist tối thiểu:
- [ ] Mục đích file rõ ràng
- [ ] Nội dung nhất quán với docs liên quan
- [ ] Evidence / source được ghi
- [ ] Không có placeholder chưa giải thích
