# 03 – Route & API Inventory

> **Trạng thái**: Xác nhận từ MENU_MST.sql + Action class packages  
> **Framework**: SAStruts Convention Routing – URL path = package/class name  
> **Pattern**: `/{module}/{ActionClass#method}` → `@Execute` annotated method

---

## 1. Routing Mechanism

SAStruts `RoutingFilter` map URL theo convention:
- URL `/sales/inputSales` → class `jp.co.arkinfosys.action.sales.InputSalesAction`
- Method `index()` được gọi cho GET request
- Method `login()` được gọi cho POST (annotated với `@Execute`)
- Không có explicit route config – tất cả convention-based

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/web.xml:49-54`

---

## 2. Entry Points

| URL | Action Class | Method | Mô tả |
|-----|-------------|--------|-------|
| `/` (root) | `IndexAction` | `index()` | Redirect → `/login` |
| `/login` | `LoginAction` | `index()` | Hiển thị form login |
| `/login/login` | `LoginAction` | `login()` | POST xử lý login |
| `/logout` | `LogoutAction` | `index()` | Đăng xuất |
| `/menu` | `MenuAction` | `index()` | Trang menu chính |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/IndexAction.java:21`

---

## 3. Danh sách Routes (xác nhận từ MENU_MST.sql)

### 3.1. Module Báo giá (見積)

| URL | MENU_ID | Action (inferred) | Mô tả |
|-----|---------|------------------|-------|
| `/estimate/inputEstimate` | 0200 | `InputEstimateAction.index()` | Nhập báo giá |
| `/estimate/searchEstimate` | 0201 | `SearchEstimateAction.index()` | Tìm kiếm báo giá |
| `/estimate/dispProductPriceList` | 0203 | `DispProductPriceListAction.index()` | Xem đơn giá |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:13-15`

---

### 3.2. Module Nhận đơn (受注)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/rorder/inputROrder` | 0300 | Nhập đơn hàng |
| `/rorder/searchROrder` | 0301 | Tìm kiếm đơn hàng |
| `/rorder/importOnlineOrder` | 0303 | Import đơn online |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:16-18`

---

### 3.3. Module Bán hàng (売上)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/sales/inputSales` | 0400 | Nhập phiếu bán hàng |
| `/sales/searchSales` | 0401 | Tìm kiếm bán hàng |
| `/sales/outputSalesReport` | 0402 | Xuất báo cáo bán hàng |
| `/sales/outputInvoice` | 0403 | Xuất dữ liệu vận đơn (送り状) |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:19-22`

---

### 3.4. Module Hóa đơn (請求)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/bill/searchBill` | 0500 | Tìm kiếm hóa đơn |
| `/bill/closeBill` | 0501 | Chốt hóa đơn (締処理) |
| `/bill/makeOutBill` | 0502 | Phát hành hóa đơn |
| `/bill/closeArtBalance` | 0503 | Chốt tài khoản phải thu |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:23-26`

---

### 3.5. Module Thu tiền (入金)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/deposit/inputDeposit` | 0600 | Nhập phiếu thu |
| `/deposit/searchDeposit` | 0601 | Tìm kiếm phiếu thu |
| `/deposit/importDeliveryDeposit` | 0603 | Import thu tiền từ shipper |
| `/deposit/importBankDeposit` | 0604 | Import sao kê ngân hàng |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:27-30`

---

### 3.6. Module Đặt hàng NCC (発注)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/porder/inputPOrder` | 0700 | Nhập lệnh đặt hàng |
| `/porder/searchPOrder` | 0701 | Tìm kiếm |
| `/porder/makeOutPOrder` | 0702 | Phát hành phiếu đặt hàng |
| `/porder/outputRecommendList` | 0704 | Danh sách gợi ý đặt hàng |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:31-34`

---

### 3.7. Module Nhập hàng (仕入)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/purchase/inputPurchase` | 0800 | Nhập phiếu nhập hàng |
| `/purchase/searchPurchase` | 0801 | Tìm kiếm |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:35-36`

---

### 3.8. Module Thanh toán NCC (支払)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/payment/inputPayment` | 0900 | Nhập phiếu thanh toán |
| `/payment/searchPayment` | 0901 | Tìm kiếm |
| `/payment/closePayment` | 0902 | Chốt thanh toán |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:37-39`

---

### 3.9. Module Kho (在庫)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/stock/inputStock` | 1000 | Nhập/xuất kho |
| `/stock/searchStock` | 1001 | Tìm kiếm nhập/xuất kho |
| `/stock/inputStockTransfer` | 1002 | Chuyển kho |
| `/stock/outputStockReport` | 1003 | Báo cáo tồn kho |
| `/stock/outputStockList` | 1004 | Danh sách tồn kho |
| `/stock/closeStock` | 1005 | Chốt kho (締処理) |
| `/stock/dispProductStockList` | 1006 | Xem tồn kho |
| `/stock/inputEntrustStock` | 1007 | Nhập/xuất kho ủy thác |
| `/stock/searchEntrustStock` | 1008 | Tìm kiếm kho ủy thác |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:40-48`

---

### 3.10. Module Báo cáo (レポート)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/report/outputBalanceList` | 1100 | Xuất báo cáo số dư |
| `/report/referenceHistory` | 1101 | Xem lịch sử |
| `/report/referenceMst` | 1102 | Danh sách master |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:49-51`

---

### 3.11. Module Cài đặt (設定)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/setting/company` | 1200 | Thông tin công ty |
| `/setting/stock` | 1201 | Cài đặt kho |
| `/setting/searchDept` | 1202 | Quản lý phòng ban |
| `/setting/searchUser` | 1203 | Quản lý nhân viên |
| `/setting/news` | 1204 | Tin tức/thông báo |
| `/setting/searchFileUpload` | 1205 | Upload file |
| `/setting/changePassword` | 1206 | Đổi mật khẩu |
| `/setting/setSecurity` | 1207 | Cài đặt bảo mật |
| `/setting/setCategory` | 1209 | Quản lý danh mục |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:52-60`

---

### 3.12. Module Master Data (マスタ管理)

| URL | MENU_ID | Mô tả |
|-----|---------|-------|
| `/master/searchProduct` | 1300 | Tìm kiếm sản phẩm |
| `/master/searchProductSet` | 1301 | Tìm kiếm bộ sản phẩm |
| `/master/searchCustomer` | 1302 | Tìm kiếm khách hàng |
| `/master/searchSupplier` | 1303 | Tìm kiếm NCC |
| `/master/searchDiscount` | 1305 | Tìm kiếm chiết khấu |
| `/master/searchRack` | 1306 | Tìm kiếm kệ/vị trí |
| `/master/searchWarehouse` | 1307 | Tìm kiếm kho |
| `/master/searchCategory` | 1309 | Tìm kiếm danh mục |
| `/master/searchTaxRate` | 1310 | Tìm kiếm thuế suất |
| `/master/searchProductClass` | 1311 | Tìm kiếm phân loại |
| `/master/searchRate` | 1313 | Tìm kiếm tỷ giá |
| `/master/searchCustomerRank` | 1314 | Tìm kiếm xếp hạng KH |
| `/master/searchBank` | 1315 | Tìm kiếm ngân hàng |
| `/master/importZipCodeCSV` | 1316 | Import mã bưu điện |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/MENU_MST.sql:61-74`

---

## 4. AJAX Routes (Inferred từ package)

**105 AJAX Action classes** trong `action/ajax/` xử lý request từ popup/dialog:

Mẫu URL: `/ajax/{ActionClassName}`
- `/ajax/searchCustomer` – Popup tìm khách hàng
- `/ajax/searchProduct` – Popup tìm sản phẩm
- `/ajax/searchSupplier` – Popup tìm NCC
- `/ajax/getZipAddress` – Lookup mã bưu điện → địa chỉ
- Và nhiều handler khác (cần đọc từng file để xác nhận)

---

## 5. HTTP Protocol Notes

- **Tất cả là server-rendered** – không có REST API thuần túy
- **AJAX requests**: Trả về HTML fragment hoặc JSON (cần verify từng action)
- **File upload**: Max 20MB (`struts-config.xml:38`)
- **Session**: Cookie-based HTTP session, timeout 60 phút

---

## 6. Routes chưa có trong MENU nhưng tồn tại

Từ phân tích action classes, các route sau không trong MENU_MST:

| URL (inferred) | Action | Mô tả |
|----------------|--------|-------|
| `/login/{domainId}` | `LoginAction.index()` | URL pattern có domain ID |
| `/setting/editUser` | `EditUserAction` | Edit user (từ searchUser) |
| `/setting/editDept` | `EditDeptAction` | Edit dept (từ searchDept) |
| `/master/editCustomer` | `EditCustomerAction` | Edit khách hàng |
| `/master/editProduct` | `EditProductAction` | Edit sản phẩm |
| `/master/downloadProductExcel` | `DownloadProductExcelAction` | Export Excel |
| `/master/importProductExcel` | `ImportProductExcelAction` | Import Excel |

**Ghi chú**: Các route edit/CRUD thường không xuất hiện trực tiếp trong menu mà được gọi từ search results.
