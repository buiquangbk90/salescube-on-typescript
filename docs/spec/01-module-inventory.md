# SalesCube - Module Inventory (Danh sách Module)

> Tài liệu này liệt kê toàn bộ module, màn hình và chức năng của hệ thống SalesCube legacy.
> 
> **Source:** `workspace/SalesCube/src/main/java/jp/co/arkinfosys/action/` và `WEB-INF/view/`

---

## 1. Tổng quan Module Structure

```
jp.co.arkinfosys.action/
├── ajax/           (266 items) - AJAX API endpoints
├── annual/         (8 items)   - Báo cáo năm
├── bill/           (32 items)  - Hóa đơn/請求
├── daily/          (28 items)  - Xử lý hàng ngày
├── deposit/        (26 items)  - Thu tiền/入金
├── estimate/       (15 items)  - Báo giá/見積
├── master/         (102 items) - Master data
├── monthly/        (40 items)  - Xử lý hàng tháng
├── payment/        (24 items)  - Thanh toán
├── porder/         (15 items)  - Đặt hàng mua
├── purchase/       (9 items)   - Mua hàng
├── report/         (43 items)  - Báo cáo
├── rorder/         (15 items)  - Đơn hàng trả lại
├── sales/          (50 items)  - Bán hàng/売上
├── setting/        (34 items)  - Cài đặt
└── stock/          (33 items)  - Tồn kho
```

---

## 2. Chi tiết từng Module

### 2.1. MASTER (マスタ管理) - 102 Actions

**Màn hình JSP:** `WEB-INF/view/master/`

| # | Module | Mô tả | Action Class | View |
|---|--------|-------|--------------|------|
| 1 | Customer | Quản lý khách hàng (得意先) | `EditCustomerAction` | `editCustomer.jsp` |
| 2 | Product | Quản lý sản phẩm (商品) | `EditProductAction` | `editProduct.jsp` |
| 3 | User | Quản lý người dùng | `EditUserAction` | `editUser.jsp` |
| 4 | Category | Danh mục phân loại | `EditCategoryAction` | `editCategory.jsp` |
| 5 | Rack | Quản lý kệ hàng | `EditRackAction` | `editRack.jsp` |
| 6 | Supplier | Quản lý nhà cung cấp | `EditSupplierAction` | `editSupplier.jsp` |
| 7 | TaxRate | Thiết lập thuế suất | `EditTaxRateAction` | `editTaxRate.jsp` |
| 8 | Delivery | Thiết lập nơi giao hàng | `EditDeliveryAction` | `editDelivery.jsp` |
| 9 | Bank | Quản lý ngân hàng | `EditBankAction` | `editBank.jsp` |
| 10 | Unit | Đơn vị tính | `EditUnitAction` | `editUnit.jsp` |
| 11 | CustomerRank | Xếp hạng khách hàng | `EditCustomerRankAction` | `editCustomerRank.jsp` |
| 12 | ProductSet | Sản phẩm combo/set | `EditProductSetAction` | `editProductSet.jsp` |
| 13 | PriceList | Bảng giá | `EditPriceListAction` | `editPriceList.jsp` |
| 14 | Discount | Chiết khấu | `EditDiscountAction` | `editDiscount.jsp` |

**Các chức năng chung:**
- Tìm kiếm (Search)
- Thêm mới (Create)
- Sửa (Edit)
- Xóa (Delete)
- Import/Export CSV
- In báo cáo

---

### 2.2. SALES (販売管理) - 50 Actions

**Màn hình JSP:** `WEB-INF/view/sales/`

#### A. Báo giá (Estimate/見積)

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Tạo báo giá | `InputEstimateAction` | `inputEstimate.jsp` |
| 2 | Tìm kiếm báo giá | `SearchEstimateAction` | `searchEstimate.jsp` |
| 3 | In báo giá | `OutputEstimateAction` | - |

#### B. Đơn đặt hàng (ROrder/受注)

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Tạo đơn hàng | `InputROrderAction` | `inputROrder.jsp` |
| 2 | Tìm đơn hàng | `SearchROrderAction` | `searchROrder.jsp` |
| 3 | Xác nhận đơn | `ConfirmROrderAction` | - |

#### C. Bán hàng (Sales Slip/売上伝票)

| # | Chức năng | Action | View | Priority |
|---|-----------|--------|------|----------|
| 1 | **Tạo phiếu bán hàng** | `InputSalesAction` | `inputSales.jsp` | **HIGH** |
| 2 | **Tìm kiếm bán hàng** | `SearchSalesAction` | `searchSales.jsp` | **HIGH** |
| 3 | In hóa đơn bán hàng | `OutputSalesBillAction` | - | MEDIUM |
| 4 | In phiếu giao hàng | `OutputDeliveryAction` | - | MEDIUM |
| 5 | In phiếu đóng gói | `OutputPickingListAction` | - | MEDIUM |

**Entity chính:** `SalesSlipTrn`, `SalesLineTrn`

**Luồng nghiệp vụ:**
```
Estimate (Báo giá) → ROrder (Đơn đặt hàng) → SalesSlip (Phiếu bán hàng)
                                                          ↓
                                              DeliverySlip (Phiếu giao hàng)
                                                          ↓
                                                  Invoice (Hóa đơn)
```

---

### 2.3. BILL (請求管理) - 32 Actions

**Màn hình JSP:** `WEB-INF/view/bill/`

| # | Chức năng | Action | View | Priority |
|---|-----------|--------|------|----------|
| 1 | **Tạo hóa đơn hàng loạt** | `BillMakeAction` | `billMake.jsp` | **HIGH** |
| 2 | **Tìm kiếm hóa đơn** | `SearchBillAction` | `searchBill.jsp` | **HIGH** |
| 3 | In hóa đơn | `OutputBillAction` | - | MEDIUM |
| 4 | Hủy hóa đơn | `CancelBillAction` | - | MEDIUM |
| 5 | Gạch nợ hóa đơn | `BillCloseAction` | `billClose.jsp` | **HIGH** |

**Business Rules quan trọng:**
- Ngày chốt (締日): Thường là ngày cuối tháng (末日)
- Kỳ thanh toán: Theo nhóm chốt (cutoffGroup)
- Tính thuế: 8% hoặc 10% tùy loại hàng

**Entity chính:** `Bill`, `BillLine`

---

### 2.4. DEPOSIT (入金管理) - 26 Actions

**Màn hình JSP:** `WEB-INF/view/deposit/`

| # | Chức năng | Action | View | Priority |
|---|-----------|--------|------|----------|
| 1 | **Tạo phiếu thu tiền** | `InputDepositAction` | `inputDeposit.jsp` | **HIGH** |
| 2 | **Tìm kiếm thu tiền** | `SearchDepositAction` | `searchDeposit.jsp` | **HIGH** |
| 3 | **Gạch nợ (消込)** | `DepositCloseAction` | `depositClose.jsp` | **HIGH** |
| 4 | Import thu tiền từ ngân hàng | `ImportDepositAction` | - | MEDIUM |
| 5 | In biên lai thu tiền | `OutputDepositAction` | - | MEDIUM |

**Các phương thức thu tiền:**
| Mã | Phương thức | Tiếng Nhật |
|----|-------------|------------|
| 1 | Tiền mặt | 現金 |
| 2 | Chuyển khoản | 振込 |
| 3 | Séc | 小切手 |
| 4 | Lệnh chi trả | 振替 |
| 5 | Thẻ tín dụng | カード |

**Entity chính:** `DepositSlip`, `DepositLine`

---

### 2.5. STOCK (在庫管理) - 33 Actions

**Màn hình JSP:** `WEB-INF/view/stock/`

| # | Chức năng | Action | View | Priority |
|---|-----------|--------|------|----------|
| 1 | **Nhập kho** | `InputStockAction` | `inputStock.jsp` | **HIGH** |
| 2 | **Xuất kho** | `OutputStockAction` | `outputStock.jsp` | **HIGH** |
| 3 | **Kiểm kê** | `StockTakeAction` | `stockTake.jsp` | **HIGH** |
| 4 | Tìm kiếm tồn kho | `SearchStockAction` | `searchStock.jsp` | MEDIUM |
| 5 | Báo cáo tồn kho | `StockListAction` | `stockList.jsp` | MEDIUM |
| 6 | Lịch sử xuất nhập | `EadListAction` | `eadList.jsp` | MEDIUM |

**Entity chính:** `ProductStockInfo`, `EadSlipTrn`, `EadLineTrn`

---

### 2.6. PURCHASE (仕入管理) - 9 Actions

**Màn hình JSP:** `WEB-INF/view/purchase/`

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Tạo phiếu mua hàng | `InputPurchaseAction` | `inputPurchase.jsp` |
| 2 | Tìm kiếm mua hàng | `SearchPurchaseAction` | `searchPurchase.jsp` |
| 3 | Báo cáo mua hàng | `PurchaseListAction` | `purchaseList.jsp` |

---

### 2.7. PORDER (発注管理) - 15 Actions

**Màn hình JSP:** `WEB-INF/view/porder/`

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Tạo đơn đặt hàng | `InputPOrderAction` | `inputPOrder.jsp` |
| 2 | Tìm kiếm đơn đặt hàng | `SearchPOrderAction` | `searchPOrder.jsp` |
| 3 | In đơn đặt hàng | `OutputPOrderAction` | - |

---

### 2.8. DAILY (日次処理) - 28 Actions

**Màn hình JSP:** `WEB-INF/view/daily/`

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Xử lý ngày (締め処理) | `DailyClosingAction` | `dailyClosing.jsp` |
| 2 | Báo cáo ngày | `DailyReportAction` | `dailyReport.jsp` |
| 3 | Danh sách thu tiền ngày | `DailyDepositListAction` | - |
| 4 | Danh sách bán hàng ngày | `DailySalesListAction` | - |

---

### 2.9. MONTHLY (月次処理) - 40 Actions

**Màn hình JFP:** `WEB-INF/view/monthly/`

| # | Chức năng | Action | View | Priority |
|---|-----------|--------|------|----------|
| 1 | **Chốt tháng** | `MonthlyClosingAction` | `monthlyClosing.jsp` | **HIGH** |
| 2 | **Tạo hóa đơn tháng** | `MonthlyBillAction` | `monthlyBill.jsp` | **HIGH** |
| 3 | Báo cáo doanh thu tháng | `MonthlySalesReportAction` | - | MEDIUM |
| 4 | Báo cáo thu tiền tháng | `MonthlyDepositReportAction` | - | MEDIUM |
| 5 | Báo cáo công nợ | `MonthlyReceivableAction` | - | MEDIUM |

---

### 2.10. ANNUAL (年次処理) - 8 Actions

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Chốt năm | `AnnualClosingAction` | `annualClosing.jsp` |
| 2 | Báo cáo năm | `AnnualReportAction` | - |

---

### 2.11. REPORT (帳票) - 43 Actions

**Màn hình JSP:** `WEB-INF/view/report/`

| # | Loại báo cáo | Action | Template |
|---|--------------|--------|----------|
| 1 | Báo cáo bán hàng | `SalesReportAction` | `sales_report.jrxml` |
| 2 | Báo cáo thu tiền | `DepositReportAction` | `deposit_report.jrxml` |
| 3 | Báo cáo công nợ | `ReceivableReportAction` | `receivable_report.jrxml` |
| 4 | Báo cáo tồn kho | `StockReportAction` | `stock_report.jrxml` |
| 5 | Hóa đơn | `BillReportAction` | `bill.jrxml` |
| 6 | Phiếu giao hàng | `DeliveryReportAction` | `delivery.jrxml` |
| 7 | Phiếu đóng gói | `PickingListReportAction` | `picking_list.jrxml` |

**Report Engine:** JasperReports (`.jrxml` templates)

---

### 2.12. SETTING (設定) - 34 Actions

**Màn hình JSP:** `WEB-INF/view/setting/`

| # | Chức năng | Action | View |
|---|-----------|--------|------|
| 1 | Cài đặt công ty | `EditCompanyAction` | `editCompany.jsp` |
| 2 | Cài đặt ngày làm việc | `EditWorkDayAction` | `editWorkDay.jsp` |
| 3 | Cài đặt mã số | `EditCodePatternAction` | `editCodePattern.jsp` |
| 4 | Phân quyền | `EditRoleAction` | `editRole.jsp` |
| 5 | Cài đặt in ấn | `PrintSettingAction` | `printSetting.jsp` |

---

### 2.13. AJAX API - 266 Items

Các endpoint AJAX cho:
- Auto-complete tìm kiếm khách hàng, sản phẩm
- Kiểm tra tồn kho real-time
- Lấy giá sản phẩm
- Validate dữ liệu
- Upload file

---

## 3. Tổng hợp số lượng

| Module | Actions | Views | Priority |
|--------|---------|-------|----------|
| master | 102 | 39 | HIGH |
| sales | 50 | 15 | **CRITICAL** |
| bill | 32 | 10 | **CRITICAL** |
| deposit | 26 | 9 | **CRITICAL** |
| stock | 33 | 14 | HIGH |
| monthly | 40 | 10 | HIGH |
| daily | 28 | 7 | MEDIUM |
| report | 43 | 11 | MEDIUM |
| setting | 34 | 12 | MEDIUM |
| purchase | 9 | 4 | LOW |
| porder | 15 | 7 | LOW |
| annual | 8 | 2 | LOW |
| **TOTAL** | **768** | **268** | - |

---

## 4. Mức độ ưu tiên Migrate

### Priority 1 - CRITICAL (Core Business)
1. **sales** - Bán hàng
2. **bill** - Hóa đơn/請求
3. **deposit** - Thu tiền/入金

### Priority 2 - HIGH (Master Data)
4. **master** - Master data (Customer, Product, User)
5. **stock** - Tồn kho
6. **monthly** - Chốt tháng

### Priority 3 - MEDIUM (Operations)
7. **daily** - Xử lý ngày
8. **report** - Báo cáo
9. **setting** - Cài đặt

### Priority 4 - LOW (Supporting)
10. **purchase** - Mua hàng
11. **porder** - Đặt hàng
12. **annual** - Chốt năm

---

*Generated from SalesCube source analysis*
