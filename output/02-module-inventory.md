# 02 – Module Inventory

> **Trạng thái**: Xác nhận từ source code  
> **Nguồn**: Action packages, Service classes, MENU_MST.sql

---

## 1. Module Map (theo Menu System)

Hệ thống có **12 nhóm menu** chính, được xác nhận từ `MENU_MST.sql`:

| Menu ID | Tên (JP) | Tên (VI) | Package Java |
|---------|----------|----------|-------------|
| 0002 | 見積 | Báo giá | `action/estimate/` |
| 0003 | 受注 | Nhận đơn | `action/rorder/` |
| 0004 | 売上 | Bán hàng | `action/sales/` |
| 0005 | 請求 | Thanh toán/Hóa đơn | `action/bill/` |
| 0006 | 入金 | Thu tiền | `action/deposit/` |
| 0007 | 発注 | Đặt hàng nhà cung cấp | `action/porder/` |
| 0008 | 仕入 | Nhập hàng | `action/purchase/` |
| 0009 | 支払 | Thanh toán NCC | `action/payment/` |
| 0010 | 在庫 | Kho | `action/stock/` |
| 0011 | レポート | Báo cáo | `action/report/` |
| 0012 | 設定 | Cài đặt | `action/setting/` |
| 0013 | マスタ管理 | Quản lý Master | `action/master/` |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:1-12`

---

## 2. Chi tiết từng Module

### 2.1. Module Báo giá (見積 – Estimate)

**Action classes** (`action/estimate/`):
- `InputEstimateAction.java` – Nhập báo giá
- `SearchEstimateAction.java` – Tìm kiếm báo giá
- `DispProductPriceListAction.java` – Xem đơn giá

**Service classes**:
- `EstimateSheetService.java` (21KB) – Nghiệp vụ phiếu báo giá
- `EstimateLineService.java` (10KB) – Dòng chi tiết báo giá

**DB Tables**: `ESTIMATE_SHEET_TRN_XXXXX`, `ESTIMATE_LINE_TRN_XXXXX` + HIST

**URL prefix**: `/estimate/`

---

### 2.2. Module Nhận đơn (受注 – Receive Order)

**Action classes** (`action/rorder/`):
- `InputROrderAction.java` – Nhập đơn hàng
- `SearchROrderAction.java` – Tìm kiếm đơn hàng
- `ImportOnlineOrderAction.java` – Import đơn online

**Service classes**:
- `ROrderService.java` (17KB) – Nghiệp vụ nhận đơn
- `RoSlipService.java` (16KB) – Phiếu đơn hàng
- `RoLineService.java` (14KB) – Dòng chi tiết đơn
- `RoSlipSalesService.java` (14KB) – Liên kết đơn-bán hàng
- `OnlineOrderService.java` (12KB) – Đơn hàng online
- `OnlineOrderRelService.java` (4KB)

**DB Tables**: `RO_SLIP_TRN_XXXXX`, `RO_LINE_TRN_XXXXX`, `ONLINE_ORDER_WORK_XXXXX`, `ONLINE_ORDER_REL_XXXXX` + HIST

**URL prefix**: `/rorder/`

---

### 2.3. Module Bán hàng (売上 – Sales)

**Action classes** (`action/sales/`):
- `InputSalesAction.java` (40KB – **lớn nhất**) – Nhập phiếu bán hàng
- `SearchSalesAction.java` – Tìm kiếm
- `OutputSalesReportAction.java` – Xuất báo cáo bán hàng
- `OutputSalesReportResultAction.java` (24KB) – Kết quả báo cáo
- `OutputSalesReportSingleAction.java` (10KB) – Báo cáo đơn
- `OutputInvoiceAction.java` – Xuất dữ liệu vận đơn
- `SearchSalesResultOutputAction.java` – Xuất kết quả tìm kiếm

**Service classes**:
- `SalesService.java` (71KB – **lớn nhất toàn hệ thống**) – Toàn bộ nghiệp vụ bán hàng
- `SalesLineService.java` (28KB) – Dòng chi tiết bán hàng
- `OutputSalesReportSheetService.java` (3KB)
- `OutputSalesReportSheetLineService.java` (4KB)

**DB Tables**: `SALES_SLIP_TRN_XXXXX`, `SALES_LINE_TRN_XXXXX` + HIST

**URL prefix**: `/sales/`

---

### 2.4. Module Hóa đơn (請求 – Bill)

**Action classes** (`action/bill/`):
- `CloseBillAction.java` (15KB) – Chốt hóa đơn (締処理)
- `CloseArtBalanceAction.java` (10KB) – Chốt tài khoản phải thu
- `MakeOutBillAction.java` – Phát hành hóa đơn
- `MakeOutBillReportOutputAction.java` (8KB) – In hóa đơn
- `SearchBillAction.java` – Tìm kiếm hóa đơn
- `SearchBillResultOutputAction.java` – Xuất kết quả

**Service classes**:
- `BillService.java` (30KB) – Nghiệp vụ hóa đơn
- `BillJoinService.java` (19KB) – JOIN queries hóa đơn
- `ArtBalanceService.java` (27KB) – Tài khoản phải thu (売掛残高)
- `AptBalanceService.java` (2KB) – Công nợ phải trả (買掛残高)
- `BillReportService.java` (5KB) – Báo cáo hóa đơn
- `BillAndArtService.java` (8KB) – Liên kết bill và ART
- `BillOldService.java` (2KB) – Hóa đơn cũ (legacy)

**DB Tables**: `BILL_TRN_XXXXX`, `ART_BALANCE_TRN_XXXXX`, `APT_BALANCE_TRN_XXXXX`

**URL prefix**: `/bill/`

---

### 2.5. Module Thu tiền (入金 – Deposit)

**Action classes** (`action/deposit/`):
- `InputDepositAction.java` (20KB) – Nhập phiếu thu
- `ImportBankDepositAction.java` (12KB) – Import sao kê ngân hàng
- `ImportDeliveryDepositAction.java` (20KB) – Import thu tiền vận chuyển
- `SearchDepositAction.java` – Tìm kiếm phiếu thu
- `SearchDepositResultOutputAction.java` – Xuất kết quả

**Service classes**:
- `DepositSlipService.java` (32KB) – Phiếu thu tiền
- `DepositLineService.java` (17KB) – Dòng chi tiết thu
- `BankDepositRelService.java` (3KB) – Liên kết ngân hàng
- `BankDepositWorkService.java` (2KB) – Work table ngân hàng
- `DeliveryDepositRelService.java` (2KB)
- `DeliveryDepositWorkService.java` (4KB)

**DB Tables**: `DEPOSIT_SLIP_TRN_XXXXX`, `DEPOSIT_LINE_TRN_XXXXX`, `BANK_DEPOSIT_WORK_XXXXX`, `BANK_DEPOSIT_REL_XXXXX`, `DELIVERY_DEPOSIT_WORK_XXXXX`, `DELIVERY_DEPOSIT_REL_XXXXX`

**URL prefix**: `/deposit/`

---

### 2.6. Module Đặt hàng NCC (発注 – Purchase Order)

**Action classes** (`action/porder/`):
- `InputPOrderAction.java` – Nhập lệnh đặt hàng
- `SearchPOrderAction.java` – Tìm kiếm
- `MakeOutPOrderAction.java` – Phát hành đặt hàng
- `OutputRecommendListAction.java` – Danh sách gợi ý đặt hàng
- ...

**Service classes**:
- `PoSlipService.java` (14KB) – Phiếu đặt hàng
- Tại `service/porder/`: 7 files

**DB Tables**: `PO_SLIP_TRN_XXXXX`, `PO_LINE_TRN_XXXXX`

**URL prefix**: `/porder/`

---

### 2.7. Module Nhập hàng (仕入 – Purchase/Receiving)

**Action classes** (`action/purchase/`):
- `InputPurchaseAction.java` – Nhập phiếu nhập hàng
- `SearchPurchaseAction.java` – Tìm kiếm

**Service classes**:
- `SupplierSlipService.java` (21KB) – Phiếu nhập từ NCC
- `SupplierLineService.java` (20KB) – Dòng chi tiết
- `SupplierService.java` (18KB) – Quản lý nhà cung cấp

**DB Tables**: `SUPPLIER_SLIP_TRN_XXXXX`, `SUPPLIER_LINE_TRN_XXXXX`

**URL prefix**: `/purchase/`

---

### 2.8. Module Thanh toán NCC (支払 – Payment)

**Action classes** (`action/payment/`):
- `InputPaymentAction.java` – Nhập phiếu thanh toán
- `SearchPaymentAction.java` – Tìm kiếm
- `ClosePaymentAction.java` – Chốt thanh toán

**Service classes** (`service/payment/`): 5 files

**DB Tables**: `PAYMENT_SLIP_TRN_XXXXX`, `PAYMENT_LINE_TRN_XXXXX`

**URL prefix**: `/payment/`

---

### 2.9. Module Kho (在庫 – Stock)

**Action classes** (`action/stock/`):
- `InputStockAction.java` (11KB) – Nhập/xuất kho
- `InputStockTransferAction.java` (16KB) – Chuyển kho
- `InputEntrustStockAction.java` (25KB) – Kho ủy thác (委託)
- `CloseStockAction.java` (5KB) – Chốt kho
- `OutputStockListAction.java` – Xuất danh sách tồn kho
- `OutputStockReportAction.java` – Báo cáo tồn kho
- `SearchStockAction.java` – Tìm kiếm
- `SearchEntrustStockAction.java` – Tìm kiếm kho ủy thác
- `DispProductStockListAction.java` – Xem tồn kho

**Service classes** (`service/stock/`): 16 files
- `ProductStockService.java` (24KB) – Tồn kho sản phẩm
- `PickingService.java` (14KB) – Picking list
- `PickingLineService.java` (13KB) – Chi tiết picking
- `EadService.java` (40KB) – Kho ủy thác (委託入出庫)
- `EntrustEadService.java` (28KB) – Kho ủy thác
- `WarehouseService.java` (12KB) – Quản lý kho

**DB Tables**: `PRODUCT_STOCK_TRN_XXXXX`, `PRODUCT_STOCK_INFO_XXXXX`, `PICKING_LIST_XXXXX`, `PICKING_LINE_XXXXX`, `EAD_SLIP_TRN_XXXXX`, `EAD_LINE_TRN_XXXXX`, `ENTRUST_EAD_SLIP_TRN_XXXXX`, `ENTRUST_EAD_LINE_TRN_XXXXX`

**URL prefix**: `/stock/`

---

### 2.10. Module Báo cáo (レポート – Report)

**Action classes** (`action/report/`):
- `OutputBalanceListAction.java` – Báo cáo số dư
- `ReferenceHistoryAction.java` – Lịch sử
- `ReferenceMstAction.java` – Master list

**Service classes** (`service/report/`): 4 files

**URL prefix**: `/report/`

---

### 2.11. Module Cài đặt (設定 – Setting)

**Action classes** (`action/setting/`): 14 files
- `CompanyAction.java` – Thông tin công ty
- `SearchUserAction.java`, `EditUserAction.java` – Quản lý nhân viên
- `SearchDeptAction.java`, `EditDeptAction.java` – Quản lý phòng ban
- `NewsAction.java` – Tin tức/thông báo
- `ChangePasswordAction.java` – Đổi mật khẩu
- `SetSecurityAction.java` – Cài đặt bảo mật
- `SetCategoryAction.java` – Quản lý danh mục
- `SearchFileUploadAction.java` – Upload file

**Service classes**:
- `UserService.java` (26KB) – Quản lý người dùng
- `DeptService.java` (11KB) – Phòng ban
- `MineService.java` (11KB) – Thông tin công ty (自社)
- `NewsService.java` (2KB) – Tin tức
- `FileInfoService.java` (12KB) – File upload

**URL prefix**: `/setting/`

---

### 2.12. Module Master Data (マスタ管理)

**Action classes** (`action/master/`): 34 files
- `EditCustomerAction.java` (21KB) – Khách hàng
- `EditProductAction.java` (17KB) – Sản phẩm
- `EditSupplierAction.java` (13KB) – Nhà cung cấp
- `EditWarehouseAction.java` (13KB) – Kho
- `EditProductClassAction.java` (14KB) – Phân loại sản phẩm
- `EditDiscountAction.java` (9KB) – Chiết khấu số lượng
- `EditProductSetAction.java` (9KB) – Bộ sản phẩm
- `ImportProductExcelAction.java` (3KB) – Import Excel sản phẩm
- `DownloadProductExcelAction.java` (1KB) – Export Excel sản phẩm
- `ImportZipCodeCSVAction.java` (5KB) – Import mã bưu điện

**Service classes** chính:
- `ProductService.java` (54KB – lớn thứ 2) – Nghiệp vụ sản phẩm
- `CustomerService.java` (30KB) – Nghiệp vụ khách hàng
- `CustomerRankService.java` (12KB) – Xếp hạng khách hàng
- `ProductSetService.java` (13KB) – Bộ sản phẩm
- `ProductClassService.java` (16KB) – Phân loại
- `DiscountService.java` (13KB) – Chiết khấu
- `RackService.java` (18KB) – Quản lý kệ/vị trí
- `ZipService.java` (8KB) – Mã bưu điện
- `BankService.java` (14KB) – Ngân hàng

**URL prefix**: `/master/`

---

### 2.13. Module AJAX (ajax/)

**105 Action classes** xử lý AJAX request từ UI:
- Popup search dialogs
- Real-time validation
- Autocomplete inputs
- Dynamic form updates

**URL prefix**: `/ajax/`

---

## 3. Cross-cutting Concerns

| Concern | Implementation | File |
|---------|---------------|------|
| **Authentication** | `AbstractLoginCheckInterceptor` (AOP) | `interceptor/AbstractLoginCheckInterceptor.java` |
| **Authorization** | Menu-based, checked tại Login | `action/LoginAction.java:218-226` |
| **Transaction** | S2 AOP interceptor | `customizer.dicon` |
| **Error Handling** | `GlobalExceptionHandler` → `error.jsp` | `struts-config.xml:17-21` |
| **Audit Trail** | `_HIST` tables, `AuditInfo.java` | `entity/AuditInfo.java` |
| **Sequence** | `SeqMakerService.java` custom ID generation | `service/SeqMakerService.java` |
| **Tax Calculation** | `TaxRateService.java` injected vào CommonResources | `action/CommonResources.java:51-53` |
