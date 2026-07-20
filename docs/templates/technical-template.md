# Technical (As-Is) – {{MODULE}} ({{MODULE_JP}})

> Tài liệu **KỸ THUẬT HIỆN TRẠNG (as-is)** — mô tả module *đang hoạt động thế nào* trong codebase Java/Seasar2.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Thiếu thông tin → `[CẦN XÁC NHẬN]`, KHÔNG bịa.
> Bám sát source thật; KHÔNG bỏ qua tầng Service (logic chính nằm ở Service, không phải Action).

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | {{MODULE}} ({{MODULE_JP}}) |
| Agent thực hiện | {{claude \| cursor \| devin}} |
| Ngày | {{YYYY-MM-DD}} |
| Nguồn (scope) | xem `docs/modules/{{MODULE}}.md` |
| Loại tài liệu | Technical / As-Is (Java + Seasar2 + S2Struts) |

## 1. Kiến trúc & tầng liên quan
Tầng nào của module tham gia (Action / Form / Service / DTO / Entity / JSP), ánh xạ với sơ đồ trong overview.

## 2. Danh mục thành phần (inventory)
| Tầng | Class / File | Vai trò |
|------|--------------|---------|
| Action | `action/{{module}}/...` | ... |
| Form | `form/{{module}}/...` | ... |
| Service | `service/...` | ... |
| DTO | `dto/{{module}}/...` | ... |
| Entity | `entity/...Trn.java` | bảng ... |
| View | `WEB-INF/view/{{module}}/...` | ... |

## 3. Sơ đồ luồng gọi (call flow)
Với mỗi chức năng chính: `JSP → Action(@Execute method) → Service → Entity/SQL`.
Vẽ bằng text/mermaid, chỉ rõ method thật.

## 4. Chi tiết logic Service
Theo từng service chính, mô tả các bước xử lý bám code (input `Param`, biến đổi, ghi DB).
Có thể tham chiếu / tái dùng Function Design ở `.devin/output/function-design/` nếu đã có.

## 5. Mô hình dữ liệu (Entity / bảng DB / SQL)
| Bảng (`*_TRN`/master) | Entity | Khoá chính | Quan hệ |
|-----------------------|--------|-----------|---------|
| ... | ... | ... | Slip 1–N Line |

- Cột nghiệp vụ quan trọng: ...
- Câu SQL / DAO liên quan: {{path}} — thao tác SELECT/INSERT/UPDATE/DELETE.

## 6. Điểm vào (endpoints)
| Method (`@Execute`) | Trigger UI | Input (Form/Param) | Kết quả/điều hướng |
|---------------------|-----------|--------------------|--------------------|
| ... | nút Lưu / Tìm / Xuất | ... | ... |

## 7. Giao dịch, khoá & side-effect
- Phạm vi transaction, rollback.
- Side-effect lên tồn kho / công nợ / phiếu liên kết (vd tạo phiếu cặp, sinh số phiếu).
- Optimistic/pessimistic lock (`UnabledLockException`...) nếu có.

## 8. Xử lý ngoại lệ & message
| Exception | Điều kiện | Message id |
|-----------|-----------|-----------|
| `ServiceException` | ... | ... |

## 9. Cấu hình & phụ thuộc kỹ thuật
- Service inject (`@Resource`), dicon/DI liên quan.
- Master data / Category cần nạp.
- Thư viện Seasar dùng (`Beans`, `BeanMap`, `MessageResourcesUtil`...).

## 10. Điểm chưa rõ
- [CẦN XÁC NHẬN] ...
