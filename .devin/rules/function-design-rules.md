# Quy tắc riêng – Function Design

## F1. Nguồn logic
- Logic nghiệp vụ chính nằm ở tầng **Service**. Khi document một Action, PHẢI trace
  xuống các Service mà nó inject (`@Resource`) và mô tả logic ở đó.
- Nếu Service extends `AbstractService<Entity>` / `AbstractSlipService` / `AbstractLineService`,
  ghi rõ class cha và phần hành vi kế thừa quan trọng.

## F2. Inner class Param
- Nếu Service có `public static class Param { ... }`, liệt kê ĐẦY ĐỦ các hằng số key
  vào mục "3. Input". Đây là hợp đồng tham số của hàm.

## F3. Mục Logic xử lý (mục 5)
- Viết theo bước đánh số, bám đúng trình tự code thật. Cấm viết chung chung kiểu
  "xử lý dữ liệu rồi lưu DB".
- Nêu rõ điểm rẽ nhánh (if/switch theo Categories/Constants) ảnh hưởng nghiệp vụ.

## F4. Truy cập dữ liệu (mục 7)
- Ghi rõ Entity chính + thao tác (SELECT/INSERT/UPDATE/DELETE).
- Nếu có SQL ngoài (SQLPL/PLSQL trong DB/), tham chiếu tên file/câu lệnh.

## F5. Side-effect liên-module
- BẮT BUỘC nêu nếu hàm tác động sang module khác:
  - sales/purchase → cập nhật **stock** (tồn kho)
  - bill/deposit/payment → cập nhật **công nợ / số dư**
- Đây là điểm dễ bị bỏ sót và rất quan trọng cho người đọc.

## F6. Exception
- Liệt kê các `ServiceException` (hoặc subclass) và điều kiện ném.

## Checklist tự kiểm (Function Design)
- [ ] Đã trace tới Service thật sự chứa logic?
- [ ] Liệt kê đủ Param?
- [ ] Mục 5 mô tả bước cụ thể, không chung chung?
- [ ] Đã nêu side-effect liên-module (stock/công nợ) nếu có?
- [ ] Đã ghi Entity + loại thao tác DB?
