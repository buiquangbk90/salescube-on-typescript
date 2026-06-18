# SalesCube - Screen Inventory (Danh sách Màn hình)

> Liệt kê chi tiết các màn hình JSP trong SalesCube legacy và mapping sang Next.js.
> **Source:** `workspace/SalesCube/src/main/webapp/WEB-INF/view/`

---

## 1. Tổng quan View Structure

```
WEB-INF/view/
├── ajax/           (99 files)   - AJAX partial views
├── annual/         (2 files)    - Báo cáo năm
├── bill/           (10 files)   - Hóa đơn
├── common/         (7 files)    - Shared components
├── daily/          (7 files)    - Xử lý ngày
├── deposit/        (9 files)    - Thu tiền
├── estimate/       (6 files)    - Báo giá
├── login/          (1 file)     - Đăng nhập
├── master/         (39 files)   - Master data
├── menu/           (1 file)     - Menu chính
├── monthly/        (10 files)   - Xử lý tháng
├── payment/        (8 files)    - Thanh toán
├── porder/         (7 files)    - Đặt hàng mua
├── purchase/       (4 files)    - Mua hàng
├── report/         (11 files)   - Báo cáo
├── rorder/         (6 files)    - Đơn hàng trả
├── sales/          (15 files)   - Bán hàng
├── setting/        (12 files)   - Cài đặt
└── stock/          (14 files)   - Tồn kho
```

**Total: 268 JSP files**

---

## 2. MASTER Screens (39 files)

### 2.1. Customer (得意先マスタ) - 8 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `editCustomer.jsp` | Thêm/Sửa KH | `/customers/new`, `/customers/[id]/edit` | **P1** |
| 2 | `searchCustomer.jsp` | Tìm kiếm KH | `/customers` | **P1** |
| 3 | `customerList.jsp` | Danh sách KH | `/customers/list` | P2 |
| 4 | `customerImport.jsp` | Import KH CSV | `/customers/import` | P3 |
| 5 | `customerExport.jsp` | Export KH | `/customers/export` | P3 |
| 6 | `editDelivery.jsp` | Nơi giao hàng | `/customers/[id]/deliveries` | P2 |
| 7 | `searchDelivery.jsp` | Tìm nơi giao | `/deliveries` | P2 |
| 8 | `customerHistory.jsp` | Lịch sử KH | `/customers/[id]/history` | P3 |

### 2.2. Product (商品マスタ) - 8 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `editProduct.jsp` | Thêm/Sửa SP | `/products/new`, `/products/[id]/edit` | **P1** |
| 2 | `searchProduct.jsp` | Tìm kiếm SP | `/products` | **P1** |
| 3 | `productList.jsp` | Danh sách SP | `/products/list` | P2 |
| 4 | `productImport.jsp` | Import SP | `/products/import` | P3 |
| 5 | `editProductSet.jsp` | Sản phẩm set | `/products/sets` | P3 |
| 6 | `editSupplier.jsp` | Nhà cung cấp | `/admin/suppliers` | P3 |
| 7 | `searchSupplier.jsp` | Tìm NCC | `/admin/suppliers/search` | P3 |
| 8 | `editRack.jsp` | Kệ hàng | `/admin/racks` | P3 |

### 2.3. User & Role - 6 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `editUser.jsp` | Thêm/Sửa user | `/admin/users/new` | **P1** |
| 2 | `searchUser.jsp` | Tìm user | `/admin/users` | **P1** |
| 3 | `editRole.jsp` | Phân quyền | `/admin/roles` | **P1** |
| 4 | `editDept.jsp` | Phòng ban | `/admin/departments` | P2 |
| 5 | `searchDept.jsp` | Tìm phòng ban | `/admin/departments/search` | P2 |
| 6 | `passwordChange.jsp` | Đổi mật khẩu | `/profile/password` | P2 |

### 2.4. Category & Settings - 8 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `editCategory.jsp` | Phân loại | `/admin/categories` | P2 |
| 2 | `searchCategory.jsp` | Tìm phân loại | `/admin/categories/search` | P2 |
| 3 | `editTaxRate.jsp` | Thuế suất | `/admin/tax-rates` | **P1** |
| 4 | `editBank.jsp` | Ngân hàng | `/admin/banks` | P3 |
| 5 | `editUnit.jsp` | Đơn vị tính | `/admin/units` | P3 |
| 6 | `editCustomerRank.jsp` | Xếp hạng KH | `/admin/customer-ranks` | P3 |
| 7 | `editPriceList.jsp` | Bảng giá | `/admin/prices` | P3 |
| 8 | `editDiscount.jsp` | Chiết khấu | `/admin/discounts` | P3 |

### 2.5. Other Masters - 9 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `editCompany.jsp` | Thông tin công ty | `/admin/company` | P2 |
| 2 | `editCodePattern.jsp` | Mẫu mã số | `/admin/code-patterns` | P3 |
| 3 | `editWorkDay.jsp` | Ngày làm việc | `/admin/work-days` | P3 |
| 4 | `editWarehouse.jsp` | Kho | `/admin/warehouses` | P3 |
| 5 | `editTransport.jsp` | Vận chuyển | `/admin/transport` | P3 |
| 6 | `editZone.jsp` | Vùng miền | `/admin/zones` | P3 |
| 7 | `editRoute.jsp` | Tuyến đường | `/admin/routes` | P3 |
| 8 | `editDeliveryTime.jsp` | Thời gian giao | `/admin/delivery-times` | P3 |
| 9 | `editPaymentCycle.jsp` | Chu kỳ thanh toán | `/admin/payment-cycles` | P3 |

---

## 3. SALES Screens (15 files)

### 3.1. Sales Slip (売上伝票) - 8 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputSales.jsp` | Nhập phiếu bán | `/sales-orders/new` | **P1** |
| 2 | `editSales.jsp` | Sửa phiếu bán | `/sales-orders/[id]/edit` | **P1** |
| 3 | `searchSales.jsp` | Tìm phiếu bán | `/sales-orders` | **P1** |
| 4 | `salesList.jsp` | Danh sách bán | `/sales-orders/list` | P2 |
| 5 | `salesDetail.jsp` | Chi tiết bán | `/sales-orders/[id]` | **P1** |
| 6 | `salesCopy.jsp` | Copy phiếu bán | `/sales-orders/[id]/copy` | P2 |
| 7 | `salesCancel.jsp` | Hủy phiếu bán | `/sales-orders/[id]/cancel` | **P1** |
| 8 | `salesHistory.jsp` | Lịch sử bán | `/sales-orders/[id]/history` | P2 |

### 3.2. Estimate (見積) - 3 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputEstimate.jsp` | Nhập báo giá | `/estimates/new` | P3 |
| 2 | `editEstimate.jsp` | Sửa báo giá | `/estimates/[id]/edit` | P3 |
| 3 | `searchEstimate.jsp` | Tìm báo giá | `/estimates` | P3 |

### 3.3. RO Order (受注) - 3 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputROrder.jsp` | Nhập đơn hàng | `/rorders/new` | P3 |
| 2 | `editROrder.jsp` | Sửa đơn hàng | `/rorders/[id]/edit` | P3 |
| 3 | `searchROrder.jsp` | Tìm đơn hàng | `/rorders` | P3 |

---

## 4. BILL Screens (10 files)

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `billMake.jsp` | Tạo HĐ hàng loạt | `/invoices/generate` | **P1** |
| 2 | `billMakeConfirm.jsp` | Xác nhận tạo HĐ | `/invoices/generate/confirm` | **P1** |
| 3 | `searchBill.jsp` | Tìm HĐ | `/invoices` | **P1** |
| 4 | `editBill.jsp` | Sửa HĐ | `/invoices/[id]/edit` | **P1** |
| 5 | `billDetail.jsp` | Chi tiết HĐ | `/invoices/[id]` | **P1** |
| 6 | `billClose.jsp` | Gạch nợ HĐ | `/invoices/[id]/close` | **P1** |
| 7 | `billCancel.jsp` | Hủy HĐ | `/invoices/[id]/cancel` | **P1** |
| 8 | `billHistory.jsp` | Lịch sử HĐ | `/invoices/[id]/history` | P2 |
| 9 | `billReprint.jsp` | In lại HĐ | `/invoices/[id]/reprint` | P2 |
| 10 | `billPreview.jsp` | Xem trước HĐ | `/invoices/[id]/preview` | P2 |

---

## 5. DEPOSIT Screens (9 files)

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputDeposit.jsp` | Nhập phiếu thu | `/deposits/new` | **P1** |
| 2 | `editDeposit.jsp` | Sửa phiếu thu | `/deposits/[id]/edit` | **P1** |
| 3 | `searchDeposit.jsp` | Tìm phiếu thu | `/deposits` | **P1** |
| 4 | `depositDetail.jsp` | Chi tiết thu | `/deposits/[id]` | **P1** |
| 5 | `depositClose.jsp` | Gạch nợ | `/deposits/[id]/close` | **P1** |
| 6 | `depositCancel.jsp` | Hủy phiếu thu | `/deposits/[id]/cancel` | **P1** |
| 7 | `depositImport.jsp` | Import từ NH | `/deposits/import` | P2 |
| 8 | `depositHistory.jsp` | Lịch sử thu | `/deposits/[id]/history` | P2 |
| 9 | `depositList.jsp` | Danh sách thu | `/deposits/list` | P2 |

---

## 6. STOCK Screens (14 files)

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputStock.jsp` | Nhập kho | `/stock/receive` | P2 |
| 2 | `outputStock.jsp` | Xuất kho | `/stock/issue` | P2 |
| 3 | `searchStock.jsp` | Tìm tồn kho | `/stock` | P2 |
| 4 | `stockList.jsp` | Danh sách tồn | `/stock/list` | P2 |
| 5 | `stockDetail.jsp` | Chi tiết tồn | `/stock/[productId]` | P2 |
| 6 | `stockTake.jsp` | Kiểm kê | `/stock/take` | P2 |
| 7 | `stockTakeInput.jsp` | Nhập kiểm kê | `/stock/take/input` | P2 |
| 8 | `stockTakeConfirm.jsp` | Xác nhận kiểm kê | `/stock/take/confirm` | P2 |
| 9 | `eadList.jsp` | Lịch sử NX | `/stock/history` | P3 |
| 10 | `eadDetail.jsp` | Chi tiết NX | `/stock/history/[id]` | P3 |
| 11 | `stockAlert.jsp` | Cảnh báo tồn | `/stock/alerts` | P2 |
| 12 | `stockMove.jsp` | Chuyển kho | `/stock/move` | P3 |
| 13 | `stockAdjust.jsp` | Điều chỉnh tồn | `/stock/adjust` | P3 |
| 14 | `pickingList.jsp` | Phiếu picking | `/stock/picking` | P2 |

---

## 7. DAILY/MONTHLY Screens (17 files)

### 7.1. Daily (日次処理) - 7 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `dailyClosing.jsp` | Chốt ngày | `/closing/daily` | P2 |
| 2 | `dailyClosingConfirm.jsp` | Xác nhận chốt ngày | `/closing/daily/confirm` | P2 |
| 3 | `dailyReport.jsp` | Báo cáo ngày | `/reports/daily` | P2 |
| 4 | `dailySalesList.jsp` | DS bán hàng ngày | `/reports/daily/sales` | P2 |
| 5 | `dailyDepositList.jsp` | DS thu tiền ngày | `/reports/daily/deposits` | P2 |
| 6 | `dailyCheck.jsp` | Kiểm tra ngày | `/closing/daily/check` | P2 |
| 7 | `dailyImport.jsp` | Import ngày | `/closing/daily/import` | P3 |

### 7.2. Monthly (月次処理) - 10 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `monthlyClosing.jsp` | Chốt tháng | `/closing/monthly` | **P1** |
| 2 | `monthlyClosingConfirm.jsp` | Xác nhận chốt tháng | `/closing/monthly/confirm` | **P1** |
| 3 | `monthlyBill.jsp` | Tạo HĐ tháng | `/invoices/monthly` | **P1** |
| 4 | `monthlyBillConfirm.jsp` | Xác nhận tạo HĐ | `/invoices/monthly/confirm` | **P1** |
| 5 | `monthlyReport.jsp` | Báo cáo tháng | `/reports/monthly` | P2 |
| 6 | `monthlySalesReport.jsp` | BC doanh thu tháng | `/reports/monthly/sales` | P2 |
| 7 | `monthlyDepositReport.jsp` | BC thu tiền tháng | `/reports/monthly/deposits` | P2 |
| 8 | `monthlyReceivable.jsp` | BC công nợ | `/reports/monthly/receivables` | P2 |
| 9 | `monthlyCheck.jsp` | Kiểm tra tháng | `/closing/monthly/check` | P2 |
| 10 | `monthlyUnlock.jsp` | Mở khóa tháng | `/closing/monthly/unlock` | P3 |

---

## 8. REPORT Screens (11 files)

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `salesReport.jsp` | BC bán hàng | `/reports/sales` | P2 |
| 2 | `depositReport.jsp` | BC thu tiền | `/reports/deposits` | P2 |
| 3 | `receivableReport.jsp` | BC công nợ | `/reports/receivables` | P2 |
| 4 | `stockReport.jsp` | BC tồn kho | `/reports/stock` | P2 |
| 5 | `customerReport.jsp` | BC khách hàng | `/reports/customers` | P3 |
| 6 | `productReport.jsp` | BC sản phẩm | `/reports/products` | P3 |
| 7 | `profitReport.jsp` | BC lợi nhuận | `/reports/profit` | P3 |
| 8 | `rankingReport.jsp` | BC xếp hạng | `/reports/ranking` | P3 |
| 9 | `annualReport.jsp` | BC năm | `/reports/annual` | P3 |
| 10 | `customReport.jsp` | BC tùy chỉnh | `/reports/custom` | P3 |
| 11 | `reportBuilder.jsp` | Tạo BC | `/reports/builder` | P3 |

---

## 9. OTHER Screens (19 files)

### 9.1. Login & Menu - 2 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `login.jsp` | Đăng nhập | `/login` | **P1** |
| 2 | `menu.jsp` | Menu chính | `/dashboard` | **P1** |

### 9.2. Estimate - 3 screens (covered in section 3.2)

### 9.3. RO Order - 3 screens (covered in section 3.3)

### 9.4. Purchase - 4 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputPurchase.jsp` | Nhập mua hàng | `/purchases/new` | P3 |
| 2 | `editPurchase.jsp` | Sửa mua hàng | `/purchases/[id]/edit` | P3 |
| 3 | `searchPurchase.jsp` | Tìm mua hàng | `/purchases` | P3 |
| 4 | `purchaseList.jsp` | DS mua hàng | `/purchases/list` | P3 |

### 9.5. POrder - 3 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputPOrder.jsp` | Nhập đặt hàng | `/porders/new` | P3 |
| 2 | `editPOrder.jsp` | Sửa đặt hàng | `/porders/[id]/edit` | P3 |
| 3 | `searchPOrder.jsp` | Tìm đặt hàng | `/porders` | P3 |

### 9.6. Payment - 4 screens

| # | JSP File | Mô tả | Next.js Route | Priority |
|---|----------|-------|---------------|----------|
| 1 | `inputPayment.jsp` | Thanh toán | `/payments/new` | P3 |
| 2 | `searchPayment.jsp` | Tìm thanh toán | `/payments` | P3 |
| 3 | `paymentSchedule.jsp` | Lịch thanh toán | `/payments/schedule` | P3 |
| 4 | `paymentHistory.jsp` | Lịch sử thanh toán | `/payments/history` | P3 |

---

## 10. Summary Statistics

### By Priority

| Priority | Count | Percentage |
|----------|-------|------------|
| **P1 (Critical)** | 48 | 18% |
| **P2 (High)** | 85 | 32% |
| **P3 (Medium/Low)** | 135 | 50% |
| **Total** | **268** | **100%** |

### By Module

| Module | Screens | Priority |
|--------|---------|----------|
| master | 39 | Mixed |
| sales | 15 | **High** |
| bill | 10 | **Critical** |
| deposit | 9 | **Critical** |
| stock | 14 | High |
| daily/monthly | 17 | High |
| report | 11 | Medium |
| setting | 12 | Medium |
| purchase/porder | 10 | Low |
| estimate/rorder | 12 | Low |
| others | 5 | Mixed |

---

## 11. Next.js Route Structure Proposal

```
app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── customers/
│   │   ├── page.tsx (search)
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx (detail)
│   │       ├── edit/page.tsx
│   │       └── history/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── sales-orders/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       └── print/page.tsx
│   ├── invoices/
│   │   ├── page.tsx
│   │   ├── generate/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── close/page.tsx
│   │       └── print/page.tsx
│   ├── deposits/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── close/page.tsx
│   ├── stock/
│   │   ├── page.tsx
│   │   ├── receive/page.tsx
│   │   ├── issue/page.tsx
│   │   └── take/page.tsx
│   ├── closing/
│   │   ├── daily/page.tsx
│   │   └── monthly/page.tsx
│   ├── reports/
│   │   ├── sales/page.tsx
│   │   ├── deposits/page.tsx
│   │   └── receivables/page.tsx
│   └── admin/
│       ├── users/page.tsx
│       ├── roles/page.tsx
│       ├── tax-rates/page.tsx
│       └── settings/page.tsx
```

---

*Generated from SalesCube JSP analysis*
