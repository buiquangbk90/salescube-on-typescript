# Function Design – {{FUNCTION_NAME}}

> Template BẮT BUỘC. Giữ nguyên thứ tự & tiêu đề các mục.
> Mục không có thông tin trong code → ghi `[CẦN XÁC NHẬN]`, KHÔNG bỏ trống, KHÔNG bịa.

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|-----------|---------|
| Tên chức năng | {{FUNCTION_NAME}} |
| Domain | {{DOMAIN}} (vd: sales / 売上) |
| Loại | {{TYPE}} (Service / Action) |
| File source | {{SOURCE_PATH}} |
| Class kế thừa | {{EXTENDS}} (vd: AbstractService<SalesSlipTrn>) |
| Mã màn hình liên quan | {{RELATED_SCREEN}} |

## 2. Mục đích nghiệp vụ
Mô tả 2–4 câu: chức năng này phục vụ nghiệp vụ gì, đứng ở đâu trong luồng tổng thể
(tham chiếu luồng ở overview.md).

## 3. Input
| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---------|------|----------|-------|-------|
| {{param}} | {{type}} | Y/N | ... | Form / DTO / Param |

> Nếu Service có inner class `Param`, liệt kê đầy đủ các key tại đây.

## 4. Output
| Trả về | Kiểu | Mô tả |
|--------|------|-------|
| {{return}} | {{type}} | ... |

## 5. Logic xử lý (các bước)
Trình bày theo bước, bám sát code thực tế (không viết chung chung):
1. ...
2. ...
3. ...

## 6. Phụ thuộc (Dependencies)
| Thành phần | Vai trò trong chức năng |
|-----------|--------------------------|
| {{ServiceX}} | ... |
| {{EntityY}} | ... |
| {{CommonUtil}} | ... |

## 7. Truy cập dữ liệu (Entity / SQL)
- Entity chính: {{entities}}
- Bảng/SQL liên quan: {{sql_or_dao}}
- Thao tác: SELECT / INSERT / UPDATE / DELETE (ghi rõ cái nào).

## 8. Xử lý ngoại lệ & validation
- Validation đầu vào: ...
- Exception ném ra: {{ServiceException...}} — điều kiện nào.

## 9. Giao dịch (Transaction) & lưu ý
- Phạm vi transaction, rollback, side-effect lên tồn kho/công nợ (nếu có).

## 10. Ghi chú / điểm chưa rõ
- [CẦN XÁC NHẬN] ...
