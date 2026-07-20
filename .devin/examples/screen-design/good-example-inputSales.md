# Screen Design – inputSales (売上入力)

> ✅ MẪU TỐT. Dùng làm chuẩn cho cách tách Slip/Line, bảng item và events.
> (Dựa trên `WEB-INF/view/sales/inputSales/` + `action/sales/InputSalesAction.java`.)

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|-----------|---------|
| Tên màn hình | Nhập bán hàng (売上入力) |
| Mã màn hình | inputSales |
| Domain | sales (売上) |
| Action xử lý | `InputSalesAction` (extends `AbstractSlipEditAction`) |
| Form | `InputSalesForm` |
| Đường dẫn JSP | `WEB-INF/view/sales/inputSales/` |

## 2. Mục đích màn hình
Cho phép người dùng nhập/sửa **chứng từ bán hàng**: chọn khách hàng, ngày bán, kho xuất,
và nhập các dòng sản phẩm bán ra. Có thể tạo từ đầu hoặc kế thừa dữ liệu từ đơn đặt hàng
(受注 / ROrder). Đứng ở bước "Bán hàng" trong luồng nghiệp vụ; khi lưu sẽ tác động tồn kho
và sinh dữ liệu cho công nợ/hóa đơn.

## 3. Bố cục & vùng chức năng
- **Đầu phiếu (Slip)**: khách hàng, ngày bán, ngày giao, kho, người phụ trách, ghi chú.
- **Dòng chi tiết (Line)**: lưới sản phẩm — mã/tên sản phẩm, số lượng, đơn giá, chiết khấu, thành tiền.
- **Vùng tổng**: tổng tiền, thuế.
- **Thanh thao tác**: Lưu, Xóa, Thêm dòng, lấy dữ liệu từ đơn đặt hàng.

## 4. Danh sách item trên màn hình (trích yếu)
### Đầu phiếu (Slip)
| Item | Nhãn | Control | Bắt buộc | Ràng buộc / Nguồn | Field Form |
|------|------|---------|----------|-------------------|------------|
| customerCode | Khách hàng | textbox + dialog | Y | tồn tại trong `Customer` (CustomerService) | customerCode |
| salesDate | Ngày bán | date | Y | định dạng ngày | salesDate |
| rackId | Kho xuất | select | Y | từ `Rack` (RackService) | rackId |

### Dòng chi tiết (Line)
| Item | Nhãn | Control | Bắt buộc | Ràng buộc / Nguồn | Field Form |
|------|------|---------|----------|-------------------|------------|
| productCode | Sản phẩm | grid + dialog | Y | từ `ProductJoin` (ProductService) | line[].productCode |
| quantity | Số lượng | number | Y | > 0 | line[].quantity |
| unitPrice | Đơn giá | number | Y | ≥ 0 | line[].unitPrice |

> Danh sách đầy đủ item lấy từ `InputSalesForm` + JSP; bổ sung khi document chính thức.

## 5. Sự kiện & hành động (Events)
| Trigger | Hành động | Action method (`@Execute`) | Kết quả |
|---------|-----------|----------------------------|---------|
| Nút Lưu | Lưu/cập nhật chứng từ bán hàng | (method có `@Execute` trong InputSalesAction) | thông báo + tồn kho cập nhật |
| Nút Thêm dòng | Thêm dòng sản phẩm | method tương ứng | render lại lưới |
| Lấy từ đơn đặt hàng | Nạp line từ ROrder | method tương ứng | điền line từ `ROrderLineDto` |

## 6. Validation (trích yếu)
| Item | Quy tắc | Ghi chú |
|------|---------|---------|
| customerCode | required + tồn tại | dùng `CheckUtil` / CustomerService |
| quantity | required, số dương | |
| Tồn kho | đủ số lượng xuất | kiểm tra qua `InputStockSalesService` |

## 7. Service / dữ liệu sử dụng
- Service: `SalesService`, `SalesLineService`, `CustomerService`, `ProductService`,
  `RackService`, `InputStockSalesService`, `BillService`, `DepositSlipService`.
- DTO hiển thị: `SalesSlipDto`, `SalesLineDto`.
- Dropdown/master: `Categories`, `Customer`, `Rack`, `ProductJoin`.

## 8. Liên kết màn hình (Navigation)
- Đến từ: searchSales (chọn 1 chứng từ để sửa), menu Bán hàng, hoặc từ màn hình đơn đặt hàng (受注).
- Đi tới: màn hình kết quả/in hóa đơn (outputInvoice) sau khi lưu.

## 9. Quyền truy cập / điều kiện hiển thị
- [CẦN XÁC NHẬN] Vai trò được phép nhập bán hàng (theo cấu hình setting/quyền).

## 10. Ghi chú / điểm chưa rõ
- [CẦN XÁC NHẬN] Tên chính xác các method `@Execute` (cần đọc đầy đủ InputSalesAction).
- [CẦN XÁC NHẬN] Quy tắc kế thừa dữ liệu từ 受注 khi tạo chứng từ bán hàng.
