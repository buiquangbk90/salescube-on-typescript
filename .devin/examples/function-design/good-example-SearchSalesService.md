# Function Design – SearchSalesService

> ✅ MẪU TỐT. Dùng làm chuẩn cho cách diễn đạt, mức độ chi tiết và bám sát code.
> (Dựa trên `service/sales/SearchSalesService.java` trong source thật.)

## 1. Thông tin chung
| Thuộc tính | Giá trị |
|-----------|---------|
| Tên chức năng | Tìm kiếm chứng từ bán hàng (売上伝票検索) |
| Domain | sales (売上) |
| Loại | Service |
| File source | `service/sales/SearchSalesService.java` |
| Class kế thừa | `AbstractService<SalesSlipTrn>` |
| Mã màn hình liên quan | searchSales (`SearchSalesAction`) |

## 2. Mục đích nghiệp vụ
Cung cấp khả năng tìm kiếm chứng từ bán hàng theo nhiều điều kiện lọc (ngày bán, ngày giao,
khách hàng, số phiếu nhận, phân loại...). Là service nền cho màn hình tìm kiếm bán hàng,
đứng ở bước "Bán hàng (売上)" trong luồng nghiệp vụ tổng thể.

## 3. Input
Các tham số được định nghĩa trong inner class `Param`:

| Tham số (Param) | Kiểu | Bắt buộc | Mô tả |
|-----------------|------|----------|-------|
| SEARCH_TARGET | String | N | Đối tượng tìm kiếm |
| SALES_SLIP_ID | String | N | ID chứng từ bán hàng |
| RO_SLIP_ID | String | N | ID chứng từ đơn đặt hàng liên kết |
| RECEPT_NO | String | N | Số phiếu nhận |
| SALES_DATE / SALES_DATE_FROM / SALES_DATE_TO | String (date) | N | Ngày bán / khoảng ngày bán |
| DELIVERY_DATE_FROM / DELIVERY_DATE_TO | String (date) | N | Khoảng ngày giao hàng |
| DC_CATEGORY / DC_TIMEZONE_CATEGORY | String | N | Phân loại (theo `Categories`) |
| CUSTOMER_CODE | String | N | Mã khách hàng |
| PICKING_REMARKS | String | N | Ghi chú picking |

> Danh sách trên trích từ class `Param`; bổ sung đầy đủ các key còn lại khi document chính thức.

## 4. Output
| Trả về | Kiểu | Mô tả |
|--------|------|-------|
| Danh sách kết quả | `List<SalesSlipTrn>` / `List<SalesSlipDto>` | Tập chứng từ bán hàng khớp điều kiện |
| Map điều kiện | `BeanMap` | Tham số đã chuẩn hóa cho câu truy vấn |

## 5. Logic xử lý (các bước)
1. Nhận map tham số tìm kiếm từ Action (các key thuộc `Param`).
2. Chuẩn hóa & lọc tham số rỗng; build điều kiện truy vấn qua `Beans`/`BeanMap`.
3. Thực thi truy vấn lấy danh sách `SalesSlipTrn` theo điều kiện (kế thừa hành vi từ `AbstractService`).
4. Ánh xạ kết quả entity sang DTO (`SalesSlipDto`) để trả về tầng trên.
5. Trả danh sách kết quả cho Action hiển thị lên màn hình.

## 6. Phụ thuộc (Dependencies)
| Thành phần | Vai trò |
|-----------|---------|
| `AbstractService<SalesSlipTrn>` | Cung cấp hạ tầng truy vấn/giao dịch chung |
| `SalesSlipTrn` (entity) | Bảng chứng từ bán hàng |
| `SalesSlipDto` | Đối tượng trả ra UI |
| `Categories`, `Constants`, `StringUtil` (common) | Hằng số phân loại & tiện ích chuỗi |
| `Beans`, `BeanMap` (Seasar) | Map tham số ↔ điều kiện |

## 7. Truy cập dữ liệu
- Entity chính: `SalesSlipTrn` (chứng từ bán hàng).
- Thao tác: **SELECT** (chỉ đọc, không ghi).

## 8. Xử lý ngoại lệ & validation
- Ném `ServiceException` khi tham số/điều kiện không hợp lệ ở tầng service.
- Validation định dạng ngày/khoảng ngày thực hiện trước khi build truy vấn.

## 9. Giao dịch & lưu ý
- Read-only, không phát sinh side-effect lên tồn kho hay công nợ.

## 10. Ghi chú / điểm chưa rõ
- [CẦN XÁC NHẬN] Danh sách `Param` đầy đủ (file định nghĩa nhiều key hơn phần trích ở trên).
- [CẦN XÁC NHẬN] Tên câu SQL/DAO cụ thể được dùng cho truy vấn.
