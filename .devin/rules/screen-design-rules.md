# Quy tắc riêng – Screen Design

## S1. Ghép cặp JSP ↔ Action
- Mỗi màn hình JSP tại `WEB-INF/view/{domain}/{screen}/` thường ứng với một Action
  cùng tên domain/verb. PHẢI xác định đúng Action + Form tương ứng.
- Nếu một thư mục screen có nhiều JSP (vd input + result), mô tả tất cả trong cùng tài liệu,
  phân tách bằng tiểu mục.

## S2. Slip vs Line
- Màn hình loại chứng từ (Input*) gần như luôn có 2 phần:
  - **Đầu phiếu (Slip)**: thông tin chung (khách hàng, ngày, kho...).
  - **Dòng chi tiết (Line)**: lưới sản phẩm/số lượng/đơn giá.
- Mục "3. Bố cục" và "4. Item" phải tách rõ 2 phần này.

## S3. Item lấy từ đâu
- Suy ra item từ: field trong Form + biến hiển thị trong JSP + LabelValueBean (dropdown).
- Với dropdown, ghi nguồn dữ liệu master (vd Categories / CustomerService...).

## S4. Events ↔ @Execute
- Mỗi nút/sự kiện ánh xạ tới một method có annotation `@Execute` trong Action.
- Ghi rõ điều hướng sau xử lý (forward/redirect tới màn hình nào).

## S5. Validation
- Lấy từ annotation/validator của Form và check trong Action/Service.
- Ghi message id nếu xác định được (MessageResources).

## S6. Navigation
- Xác định màn hình "đến từ" và "đi tới" dựa trên forward và liên kết menu.

## Checklist tự kiểm (Screen Design)
- [ ] Đã map đúng Action + Form?
- [ ] Đã tách Slip / Line (nếu là màn hình chứng từ)?
- [ ] Bảng item có cột ràng buộc + field Form?
- [ ] Events map tới đúng method @Execute?
- [ ] Đã nêu navigation đến/đi?
