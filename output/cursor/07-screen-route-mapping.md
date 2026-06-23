# 07 – Screen & Route Mapping

> **Trạng thái**: Xác nhận từ source code  
> **Nguồn**: `WEB-INF/view/`, `MENU_MST.sql`, Action class packages

---

## 1. JSP Template Structure

Tổng cộng **~212 JSP files** trong `WEB-INF/view/`:

```
WEB-INF/view/
├── ajax/         93 JSP  – Dialog/popup fragments
├── bill/          6 JSP  – Hóa đơn
├── common/        7 JSP  – Shared: header, footer, error, common
├── deposit/       6 JSP  – Thu tiền
├── estimate/      6 JSP  – Báo giá
├── login/         1 JSP  – Login form
├── master/       33 JSP  – Master data CRUD
├── menu/          1 JSP  – Menu chính
├── payment/       5 JSP  – Thanh toán NCC
├── porder/        7 JSP  – Đặt hàng
├── purchase/      4 JSP  – Nhập hàng
├── report/        3 JSP  – Báo cáo
├── rorder/        5 JSP  – Nhận đơn
├── sales/         8 JSP  – Bán hàng
├── setting/      13 JSP  – Cài đặt
└── stock/        14 JSP  – Kho
```

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/view/`

---

## 2. Common Layout

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/web.xml:152-159`

```xml
<include-prelude>/WEB-INF/view/common/common.jsp</include-prelude>
```

Mọi JSP tự động include `common.jsp` – chứa shared imports, JSTL, common functions.

---

## 3. Screen Map theo Module

### 3.1. Login

| Screen | Route | JSP | Action Method |
|--------|-------|-----|---------------|
| Login form | `GET /login/{domainId}` | `login/login.jsp` | `LoginAction.index()` |
| Login submit | `POST /login/login` | (redirect) | `LoginAction.login()` |
| Logout | `GET /logout` | (redirect → /login) | `LogoutAction.index()` |

---

### 3.2. Menu

| Screen | Route | JSP | Action Method |
|--------|-------|-----|---------------|
| Menu chính | `GET /menu` | `menu/menu.jsp` | `MenuAction.index()` |

---

### 3.3. Module Báo giá (見積)

| Screen | Route | JSP (inferred) | Action |
|--------|-------|----------------|--------|
| Nhập báo giá | `/estimate/inputEstimate` | `estimate/inputEstimate.jsp` | `InputEstimateAction.index()` |
| Tìm kiếm báo giá | `/estimate/searchEstimate` | `estimate/searchEstimate.jsp` | `SearchEstimateAction.index()` |
| Kết quả tìm kiếm | `/estimate/searchEstimateResult` | `estimate/searchEstimateResult.jsp` | `SearchEstimateResultAction` |
| Xem đơn giá | `/estimate/dispProductPriceList` | `estimate/dispProductPriceList.jsp` | `DispProductPriceListAction` |
| In báo giá | (JasperReport PDF) | `WEB-INF/report_template/` | `AbstractReportWriterAction` |

---

### 3.4. Module Nhận đơn (受注)

| Screen | Route | JSP (inferred) | Action |
|--------|-------|----------------|--------|
| Nhập đơn hàng | `/rorder/inputROrder` | `rorder/inputROrder.jsp` | `InputROrderAction.index()` |
| Tìm kiếm đơn | `/rorder/searchROrder` | `rorder/searchROrder.jsp` | `SearchROrderAction.index()` |
| Kết quả tìm kiếm | `/rorder/searchROrderResult` | `rorder/searchROrderResult.jsp` | |
| Import đơn online | `/rorder/importOnlineOrder` | `rorder/importOnlineOrder.jsp` | `ImportOnlineOrderAction` |
| In phiếu đặt hàng | (JasperReport PDF) | | |

---

### 3.5. Module Bán hàng (売上)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Nhập phiếu bán | `/sales/inputSales` | `sales/inputSales.jsp` | `InputSalesAction.index()` |
| Tìm kiếm bán hàng | `/sales/searchSales` | `sales/searchSales.jsp` | `SearchSalesAction.index()` |
| Kết quả tìm kiếm | `/sales/searchSalesResult` | `sales/searchSalesResult.jsp` | |
| Báo cáo bán hàng | `/sales/outputSalesReport` | `sales/outputSalesReport.jsp` | `OutputSalesReportAction` |
| Kết quả báo cáo | `/sales/outputSalesReportResult` | `sales/outputSalesReportResult.jsp` | `OutputSalesReportResultAction` |
| Báo cáo đơn | `/sales/outputSalesReportSingle` | (inferred) | `OutputSalesReportSingleAction` |
| Xuất vận đơn | `/sales/outputInvoice` | `sales/outputInvoice.jsp` | `OutputInvoiceAction` |
| Kết quả vận đơn | `/sales/outputInvoiceResult` | `sales/outputInvoiceResult.jsp` | `OutputInvoiceResultAction` |

---

### 3.6. Module Hóa đơn (請求)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Tìm kiếm hóa đơn | `/bill/searchBill` | `bill/searchBill.jsp` | `SearchBillAction.index()` |
| Kết quả tìm kiếm | `/bill/searchBillResult` | `bill/searchBillResult.jsp` | |
| Chốt hóa đơn | `/bill/closeBill` | `bill/closeBill.jsp` | `CloseBillAction.index()` |
| Phát hành hóa đơn | `/bill/makeOutBill` | `bill/makeOutBill.jsp` | `MakeOutBillAction.index()` |
| In hóa đơn | `/bill/makeOutBillReportOutput` | (PDF) | `MakeOutBillReportOutputAction` |
| Chốt phải thu | `/bill/closeArtBalance` | `bill/closeArtBalance.jsp` | `CloseArtBalanceAction` |

---

### 3.7. Module Thu tiền (入金)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Nhập phiếu thu | `/deposit/inputDeposit` | `deposit/inputDeposit.jsp` | `InputDepositAction.index()` |
| Tìm kiếm phiếu thu | `/deposit/searchDeposit` | `deposit/searchDeposit.jsp` | `SearchDepositAction.index()` |
| Kết quả | `/deposit/searchDepositResult` | `deposit/searchDepositResult.jsp` | |
| Import sao kê NH | `/deposit/importBankDeposit` | `deposit/importBankDeposit.jsp` | `ImportBankDepositAction` |
| Import thu vận chuyển | `/deposit/importDeliveryDeposit` | `deposit/importDeliveryDeposit.jsp` | `ImportDeliveryDepositAction` |

---

### 3.8. Module Đặt hàng NCC (発注)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Nhập lệnh đặt hàng | `/porder/inputPOrder` | `porder/inputPOrder.jsp` | `InputPOrderAction.index()` |
| Tìm kiếm | `/porder/searchPOrder` | `porder/searchPOrder.jsp` | `SearchPOrderAction.index()` |
| In phiếu đặt hàng | `/porder/makeOutPOrder` | `porder/makeOutPOrder.jsp` | `MakeOutPOrderAction` |
| Danh sách gợi ý | `/porder/outputRecommendList` | `porder/outputRecommendList.jsp` | `OutputRecommendListAction` |

---

### 3.9. Module Nhập hàng (仕入)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Nhập phiếu nhập hàng | `/purchase/inputPurchase` | `purchase/inputPurchase.jsp` | `InputPurchaseAction.index()` |
| Tìm kiếm | `/purchase/searchPurchase` | `purchase/searchPurchase.jsp` | `SearchPurchaseAction.index()` |

---

### 3.10. Module Thanh toán NCC (支払)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Nhập phiếu thanh toán | `/payment/inputPayment` | `payment/inputPayment.jsp` | `InputPaymentAction.index()` |
| Tìm kiếm | `/payment/searchPayment` | `payment/searchPayment.jsp` | `SearchPaymentAction.index()` |
| Chốt thanh toán | `/payment/closePayment` | `payment/closePayment.jsp` | `ClosePaymentAction` |

---

### 3.11. Module Kho (在庫)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Nhập/xuất kho | `/stock/inputStock` | `stock/inputStock.jsp` | `InputStockAction.index()` |
| Tìm kiếm | `/stock/searchStock` | `stock/searchStock.jsp` | |
| Chuyển kho | `/stock/inputStockTransfer` | `stock/inputStockTransfer.jsp` | `InputStockTransferAction` |
| Báo cáo tồn kho | `/stock/outputStockReport` | `stock/outputStockReport.jsp` | |
| Danh sách tồn kho | `/stock/outputStockList` | `stock/outputStockList.jsp` | |
| Chốt kho | `/stock/closeStock` | `stock/closeStock.jsp` | `CloseStockAction` |
| Xem tồn kho | `/stock/dispProductStockList` | `stock/dispProductStockList.jsp` | |
| Nhập kho ủy thác | `/stock/inputEntrustStock` | `stock/inputEntrustStock.jsp` | `InputEntrustStockAction` |
| Tìm kiếm kho ủy thác | `/stock/searchEntrustStock` | `stock/searchEntrustStock.jsp` | |

---

### 3.12. Module Master (マスタ管理)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Tìm kiếm sản phẩm | `/master/searchProduct` | `master/searchProduct.jsp` | `SearchProductAction` |
| Edit sản phẩm | `/master/editProduct` | `master/editProduct.jsp` | `EditProductAction` |
| Tìm kiếm bộ SP | `/master/searchProductSet` | `master/searchProductSet.jsp` | `SearchProductSetAction` |
| Tìm kiếm khách hàng | `/master/searchCustomer` | `master/searchCustomer.jsp` | `SearchCustomerAction` |
| Edit khách hàng | `/master/editCustomer` | `master/editCustomer.jsp` | `EditCustomerAction` |
| Tìm kiếm NCC | `/master/searchSupplier` | `master/searchSupplier.jsp` | `SearchSupplierAction` |
| Edit NCC | `/master/editSupplier` | `master/editSupplier.jsp` | `EditSupplierAction` |
| Kho/Rack/Tax/Rate... | tương tự | tương tự | tương tự |
| Import mã bưu điện | `/master/importZipCodeCSV` | `master/importZipCodeCSV.jsp` | `ImportZipCodeCSVAction` |
| Import sản phẩm Excel | `/master/importProductExcel` | `master/importProductExcel.jsp` | `ImportProductExcelAction` |
| Export sản phẩm Excel | `/master/downloadProductExcel` | (file download) | `DownloadProductExcelAction` |

---

### 3.13. Module Cài đặt (設定)

| Screen | Route | JSP | Action |
|--------|-------|-----|--------|
| Thông tin công ty | `/setting/company` | `setting/company.jsp` | |
| Cài đặt kho | `/setting/stock` | `setting/stock.jsp` | |
| Danh sách phòng ban | `/setting/searchDept` | `setting/searchDept.jsp` | `SearchDeptAction` |
| Edit phòng ban | `/setting/editDept` | `setting/editDept.jsp` | `EditDeptAction` |
| Danh sách nhân viên | `/setting/searchUser` | `setting/searchUser.jsp` | `SearchUserAction` |
| Edit nhân viên | `/setting/editUser` | `setting/editUser.jsp` | `EditUserAction` |
| Tin tức | `/setting/news` | `setting/news.jsp` | `NewsAction` |
| Upload file | `/setting/searchFileUpload` | `setting/searchFileUpload.jsp` | |
| Đổi mật khẩu | `/setting/changePassword` | `setting/changePassword.jsp` | `ChangePasswordAction` |
| Bảo mật | `/setting/setSecurity` | `setting/setSecurity.jsp` | |
| Danh mục | `/setting/setCategory` | `setting/setCategory.jsp` | |

---

## 4. AJAX Dialogs (93 JSP trong ajax/)

Mỗi JSP là một popup/dialog fragment được load bằng AJAX:
- Popup tìm kiếm khách hàng, sản phẩm, NCC, kho...
- Popup nhập thông tin nhanh
- Inline validation messages
- Autocomplete results

---

## 5. Report Templates (JasperReports)

**26 template files** trong `WEB-INF/report_template/`:
- Phiếu báo giá (見積書)
- Phiếu đặt hàng (発注書)
- Hóa đơn (請求書)
- Phiếu giao hàng (納品書)
- Báo cáo tồn kho
- Báo cáo bán hàng
- Danh sách picking
- Vận đơn (送り状)

Được render bởi `AbstractReportWriterAction.java` (11KB) và `AbstractReportService.java` (9KB).

---

## 6. Error Screens

| Screen | Trigger |
|--------|---------|
| `common/error.jsp` | `RuntimeException` (global handler) |
| Login với error message | Session expired, unauthorized |
