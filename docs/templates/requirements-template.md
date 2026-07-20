# Requirements – {{MODULE}} ({{MODULE_JP}})

> Tài liệu **YÊU CẦU NGHIỆP VỤ (what)** — mô tả module *làm gì*, góc nhìn hộp đen, độc lập công nghệ.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề các mục. Không có thông tin trong source → ghi `[CẦN XÁC NHẬN]`, KHÔNG bỏ trống, KHÔNG bịa.
> Đọc `.devin/overview.md` trước để hiểu bối cảnh & luồng nghiệp vụ tổng thể.

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | {{MODULE}} ({{MODULE_JP}}) |
| Agent thực hiện | {{claude \| cursor \| devin}} |
| Ngày | {{YYYY-MM-DD}} |
| Nguồn (scope) | xem `docs/modules/{{MODULE}}.md` |
| Loại tài liệu | Requirements (yêu cầu nghiệp vụ) |

## 1. Tổng quan module
2–4 câu: module phục vụ nghiệp vụ gì, đứng ở đâu trong luồng tổng thể
(tham chiếu luồng `見積→受注→売上→...` trong overview).

## 2. Phạm vi
- **Trong phạm vi:** các chức năng/màn hình module này đảm nhận.
- **Ngoài phạm vi:** phần thuộc module khác (ghi rõ tên module tiếp nhận).

## 3. Actor & quyền
| Actor | Mô tả | Quyền chính |
|-------|-------|-------------|
| {{vai trò}} | ... | tạo / sửa / xoá / xuất |

## 4. Danh sách chức năng / màn hình
| Mã | Tên chức năng | Loại (Nhập/Tìm/Xuất) | Màn hình (JSP) |
|----|---------------|----------------------|----------------|
| F-01 | ... | ... | ... |

## 5. Use case / luồng nghiệp vụ chính
Với mỗi chức năng quan trọng, mô tả theo khung sau (bám code, không viết chung chung):

### UC-01 – {{tên}}
- **Mục tiêu:** ...
- **Tiền điều kiện:** ...
- **Luồng chính:** 1. ... 2. ... 3. ...
- **Luồng phụ / ngoại lệ:** ...
- **Hậu điều kiện:** dữ liệu nào được tạo/đổi trạng thái.

## 6. Quy tắc nghiệp vụ (Business Rules)
| Mã | Quy tắc | Nguồn (file/dòng nếu có) |
|----|---------|--------------------------|
| BR-01 | vd: số phiếu = ANNUAL + MONTHLY + YM sinh tự động | ... |
| BR-02 | vd: chiết khấu áp theo bảng Discount | ... |

## 7. Dữ liệu nghiệp vụ (mức khái niệm)
Các thực thể nghiệp vụ & trường chính (KHÔNG phải bảng DB — mô tả theo ngữ nghĩa).
| Thực thể | Ý nghĩa | Trường chính |
|----------|---------|--------------|
| {{đầu phiếu}} | ... | ... |
| {{dòng chi tiết}} | ... | ... |

## 8. Validation & ràng buộc (mức nghiệp vụ)
| Đối tượng | Ràng buộc | Thông báo/hành vi khi vi phạm |
|-----------|-----------|-------------------------------|
| ... | required / định dạng / khoảng giá trị | ... |

## 9. Phụ thuộc sang module khác (nghiệp vụ)
- Nhận dữ liệu từ: {{module}} (vd estimate ← master khách hàng/sản phẩm).
- Cung cấp dữ liệu cho: {{module}} (vd estimate → rorder).

## 10. Câu hỏi mở / điểm chưa rõ
- [CẦN XÁC NHẬN] ...
