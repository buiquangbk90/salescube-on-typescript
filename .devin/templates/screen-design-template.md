# Screen Design – {{SCREEN_NAME}}

> Template BẮT BUỘC. Giữ nguyên thứ tự & tiêu đề các mục.
> Mục không có thông tin trong code → ghi `[CẦN XÁC NHẬN]`, KHÔNG bỏ trống, KHÔNG bịa.

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|-----------|---------|
| Tên màn hình | {{SCREEN_NAME}} (vd: 売上入力 / Nhập bán hàng) |
| Mã màn hình | {{SCREEN_ID}} (vd: inputSales) |
| Domain | {{DOMAIN}} |
| Action xử lý | {{ACTION_CLASS}} (vd: InputSalesAction) |
| Form | {{FORM_CLASS}} (vd: InputSalesForm) |
| Đường dẫn JSP | {{JSP_PATH}} |

## 2. Mục đích màn hình
2–4 câu: người dùng làm gì trên màn hình này, thuộc bước nào trong luồng nghiệp vụ.

## 3. Bố cục & vùng chức năng
Mô tả các vùng chính (header chứng từ, lưới dòng chi tiết, vùng tổng tiền, nút thao tác...).
Nếu là màn hình Slip → tách rõ phần **đầu phiếu (Slip)** và **dòng chi tiết (Line)**.

## 4. Danh sách item trên màn hình
| Item | Nhãn | Kiểu control | Bắt buộc | Ràng buộc / Default | Field Form |
|------|------|--------------|----------|---------------------|------------|
| {{id}} | {{label}} | textbox/select/grid/date... | Y/N | ... | {{formField}} |

## 5. Sự kiện & hành động (Events)
| Trigger | Hành động | Action method (`@Execute`) | Kết quả/điều hướng |
|---------|-----------|----------------------------|--------------------|
| Nút Lưu | Lưu chứng từ | {{method}} | màn hình kế tiếp |
| Nút Tìm | Tìm kiếm | ... | ... |

## 6. Validation
| Item | Quy tắc | Thông báo lỗi |
|------|---------|----------------|
| ... | required / format / range | message id |

## 7. Service / dữ liệu sử dụng
- Service gọi: {{services}}
- Entity/DTO hiển thị: {{dto}}
- Dữ liệu master nạp vào dropdown: {{categories}}

## 8. Liên kết màn hình (Navigation)
- Đến từ: {{from_screens}}
- Đi tới: {{to_screens}}

## 9. Quyền truy cập / điều kiện hiển thị
- Vai trò được phép, điều kiện ẩn/hiện item.

## 10. Ghi chú / điểm chưa rõ
- [CẦN XÁC NHẬN] ...
