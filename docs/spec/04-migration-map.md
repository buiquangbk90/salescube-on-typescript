# SalesCube Migration Map (Bản đồ Migration)

> Mapping từ SalesCube Legacy (Java) sang SalesCube TypeScript (NestJS + Next.js)

---

## 1. Legacy → TypeScript Structure Mapping

### 1.1. Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LEGACY (SalesCube)                       │
├─────────────────────────────────────────────────────────────┤
│  Java Action/Controller → Struts Framework                    │
│  Service Layer → Java Business Logic                          │
│  Entity/DTO → S2JDBC + Plain Java                           │
│  JSP View → Web Interface                                     │
│  JasperReports → Report Engine                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              TYPESCRIPT (salescube-ts)                      │
├─────────────────────────────────────────────────────────────┤
│  NestJS Controller → REST API                               │
│  Service Layer → NestJS Injectable                          │
│  Domain Package → Pure TypeScript Logic                     │
│  Prisma Entity → Database Schema                            │
│  Next.js → React Frontend                                   │
│  React-PDF/Server PDF → Report Engine                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Module-by-Module Mapping

### 2.1. MASTER Module (マスタ管理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `EditCustomerAction` | `CustomersController` | `customers/page.tsx` | **P1** |
| `EditProductAction` | `ProductsController` | `products/page.tsx` | **P1** |
| `EditUserAction` | `UsersController` | `admin/users/page.tsx` | **P1** |
| `EditCategoryAction` | `CategoriesController` | `admin/categories/page.tsx` | P2 |
| `EditTaxRateAction` | `TaxRatesController` | `admin/tax-rates/page.tsx` | **P1** |
| `EditBankAction` | `BanksController` | `admin/banks/page.tsx` | P3 |
| `EditSupplierAction` | `SuppliersController` | `admin/suppliers/page.tsx` | P3 |
| `EditRackAction` | `RacksController` | `admin/racks/page.tsx` | P3 |

**Database Mapping:**

| Legacy Table | Prisma Model | Notes |
|--------------|--------------|-------|
| `CUSTOMER_MST` | `Customer` | Core master |
| `PRODUCT_MST` | `Product` | Core master |
| `USER_MST` | `User` | Auth + RBAC |
| `CATEGORY_MST` | `Category` | Phân loại |
| `TAX_RATE_MST` | `TaxRate` | Thuế suất |
| `BANK_MST` | `Bank` | Ngân hàng |
| `SUPPLIER_MST` | `Supplier` | NCC |
| `RACK_MST` | `Rack` | Kệ hàng |

---

### 2.2. SALES Module (販売管理)

#### A. Sales Slip (売上伝票)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputSalesAction` | `SalesOrdersController.create()` | `sales-orders/new/page.tsx` | **P1** |
| `SearchSalesAction` | `SalesOrdersController.findAll()` | `sales-orders/page.tsx` | **P1** |
| `EditSalesAction` | `SalesOrdersController.update()` | `sales-orders/[id]/edit/page.tsx` | **P1** |
| `DeleteSalesAction` | `SalesOrdersController.delete()` | `sales-orders/[id]/delete` | **P1** |
| `OutputSalesBillAction` | `ReportsController.salesBill()` | `sales-orders/[id]/print/page.tsx` | P2 |
| `OutputDeliveryAction` | `ReportsController.delivery()` | `sales-orders/[id]/delivery/page.tsx` | P2 |

**Database Mapping:**

| Legacy Table | Prisma Model | Notes |
|--------------|--------------|-------|
| `SALES_SLIP_TRN` | `SalesOrder` | Phiếu bán hàng |
| `SALES_LINE_TRN` | `SalesOrderLine` | Chi tiết |
| `SALES_SLIP_TRN_HIST` | `SalesOrderHistory` | Lịch sử |

#### B. Estimate (見積)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputEstimateAction` | `EstimatesController.create()` | `estimates/new/page.tsx` | P3 |
| `SearchEstimateAction` | `EstimatesController.findAll()` | `estimates/page.tsx` | P3 |

**Database Mapping:**

| Legacy Table | Prisma Model |
|--------------|--------------|
| `ESTIMATE_SLIP_TRN` | `Estimate` |
| `ESTIMATE_LINE_TRN` | `EstimateLine` |

#### C. RO Order (受注)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputROrderAction` | `ROrdersController.create()` | `rorders/new/page.tsx` | P3 |
| `SearchROrderAction` | `ROrdersController.findAll()` | `rorders/page.tsx` | P3 |

**Database Mapping:**

| Legacy Table | Prisma Model |
|--------------|--------------|
| `RO_SLIP_TRN` | `ROrder` |
| `RO_LINE_TRN` | `ROrderLine` |

---

### 2.3. BILL Module (請求管理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `BillMakeAction` | `BillsController.generate()` | `bills/generate/page.tsx` | **P1** |
| `SearchBillAction` | `BillsController.findAll()` | `bills/page.tsx` | **P1** |
| `EditBillAction` | `BillsController.update()` | `bills/[id]/edit/page.tsx` | **P1** |
| `CancelBillAction` | `BillsController.cancel()` | `bills/[id]/cancel` | **P1** |
| `BillCloseAction` | `BillsController.close()` | `bills/[id]/close` | **P1** |
| `OutputBillAction` | `ReportsController.bill()` | `bills/[id]/print/page.tsx` | P2 |

**Database Mapping:**

| Legacy Table | Prisma Model | Notes |
|--------------|--------------|-------|
| `BILL_TRN` | `Invoice` | Hóa đơn |
| `BILL_LINE_TRN` | `InvoiceLine` | Chi tiết HĐ |

**Business Logic Mapping:**

| Legacy Logic | TypeScript Location |
|--------------|---------------------|
| `BillMakeAction.generateBills()` | `packages/domain/src/invoices/generate-invoice.ts` |
| `BillCloseAction.close()` | `packages/domain/src/invoices/close-invoice.ts` |
| Tính số dư kỳ trước | `calculate-balance.ts` |
| Tính thuế hóa đơn | `calculate-tax.ts` |

---

### 2.4. DEPOSIT Module (入金管理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputDepositAction` | `DepositsController.create()` | `deposits/new/page.tsx` | **P1** |
| `SearchDepositAction` | `DepositsController.findAll()` | `deposits/page.tsx` | **P1** |
| `EditDepositAction` | `DepositsController.update()` | `deposits/[id]/edit/page.tsx` | **P1** |
| `DepositCloseAction` | `DepositsController.close()` | `deposits/[id]/close` | **P1** |
| `ImportDepositAction` | `DepositsController.import()` | `deposits/import/page.tsx` | P2 |

**Database Mapping:**

| Legacy Table | Prisma Model | Notes |
|--------------|--------------|-------|
| `DEPOSIT_SLIP_TRN` | `Deposit` | Phiếu thu |
| `DEPOSIT_LINE_TRN` | `DepositLine` | Chi tiết thu |
| `DEPOSIT_SLIP_TRN_HIST` | `DepositHistory` | Lịch sử |
| `DEPOSIT_LINE_TRN_HIST` | `DepositLineHistory` | Lịch sử chi tiết |

**Business Logic Mapping:**

| Legacy Logic | TypeScript Location |
|--------------|---------------------|
| `DepositCloseAction.allocate()` | `packages/domain/src/deposits/allocate-payment.ts` |
| Import từ ngân hàng | `import-bank-statement.ts` |

---

### 2.5. STOCK Module (在庫管理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputStockAction` | `StockMovementsController.receive()` | `stock/receive/page.tsx` | P2 |
| `OutputStockAction` | `StockMovementsController.issue()` | `stock/issue/page.tsx` | P2 |
| `StockTakeAction` | `StockMovementsController.take()` | `stock/take/page.tsx` | P2 |
| `SearchStockAction` | `StockMovementsController.findAll()` | `stock/page.tsx` | P2 |
| `EadListAction` | `StockMovementsController.history()` | `stock/history/page.tsx` | P3 |

**Database Mapping:**

| Legacy Table | Prisma Model | Notes |
|--------------|--------------|-------|
| `EAD_SLIP_TRN` | `StockMovement` | Phiếu nhập/xuất |
| `EAD_LINE_TRN` | `StockMovementLine` | Chi tiết |
| `PRODUCT_STOCK_INFO` | `ProductStock` | Tồn kho SP |

---

### 2.6. PURCHASE Module (仕入管理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputPurchaseAction` | `PurchasesController.create()` | `purchases/new/page.tsx` | P3 |
| `SearchPurchaseAction` | `PurchasesController.findAll()` | `purchases/page.tsx` | P3 |

**Database Mapping:**

| Legacy Table | Prisma Model |
|--------------|--------------|
| `PURCHASE_SLIP_TRN` | `Purchase` |
| `PURCHASE_LINE_TRN` | `PurchaseLine` |

---

### 2.7. PORDER Module (発注管理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `InputPOrderAction` | `POrdersController.create()` | `porders/new/page.tsx` | P3 |
| `SearchPOrderAction` | `POrdersController.findAll()` | `porders/page.tsx` | P3 |

**Database Mapping:**

| Legacy Table | Prisma Model |
|--------------|--------------|
| `PO_SLIP_TRN` | `POrder` |
| `PO_LINE_TRN` | `POrderLine` |

---

### 2.8. DAILY/MONTHLY Module (日次/月次処理)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `DailyClosingAction` | `ClosingController.daily()` | `closing/daily/page.tsx` | P2 |
| `MonthlyClosingAction` | `ClosingController.monthly()` | `closing/monthly/page.tsx` | **P1** |
| `MonthlyBillAction` | `BillsController.generateMonthly()` | `bills/monthly/page.tsx` | **P1** |

**Batch Jobs:**

| Legacy Job | TypeScript (NestJS Schedule) | Frequency |
|------------|------------------------------|-----------|
| Daily Report | `DailyReportJob` | Daily |
| Monthly Bill Generation | `MonthlyBillJob` | Monthly |
| Monthly Closing | `MonthlyClosingJob` | Monthly |

---

### 2.9. REPORT Module (帳票)

| Legacy (JasperReports) | TypeScript | Priority |
|------------------------|------------|----------|
| `sales_report.jrxml` | `ReportsController.sales()` | P2 |
| `deposit_report.jrxml` | `ReportsController.deposit()` | P2 |
| `bill.jrxml` | `ReportsController.invoice()` | **P1** |
| `delivery.jrxml` | `ReportsController.delivery()` | P2 |
| `picking_list.jrxml` | `ReportsController.picking()` | P2 |
| `receivable_report.jrxml` | `ReportsController.receivable()` | P2 |

**Report Engine Options:**
1. **Server-side PDF** (Puppeteer + React-PDF)
2. **Client-side PDF** (jsPDF/jspdf-autotable)
3. **HTML Print** (CSS print media)

---

### 2.10. SETTING Module (設定)

| Legacy (Java) | TypeScript (NestJS) | TypeScript (Next.js) | Priority |
|---------------|---------------------|----------------------|----------|
| `EditCompanyAction` | `SettingsController.company()` | `admin/settings/company/page.tsx` | P2 |
| `EditRoleAction` | `SettingsController.roles()` | `admin/settings/roles/page.tsx` | **P1** |
| `PrintSettingAction` | `SettingsController.print()` | `admin/settings/print/page.tsx` | P3 |

---

## 3. API Endpoint Mapping

### 3.1. REST API Structure

| Legacy URL Pattern | TypeScript Endpoint | Method |
|--------------------|---------------------|--------|
| `/editCustomer.do` | `/api/customers` | POST |
| `/searchCustomer.do` | `/api/customers` | GET |
| `/editSales.do` | `/api/sales-orders` | POST |
| `/searchSales.do` | `/api/sales-orders` | GET |
| `/billMake.do` | `/api/invoices/generate` | POST |
| `/searchBill.do` | `/api/invoices` | GET |
| `/inputDeposit.do` | `/api/deposits` | POST |
| `/depositClose.do` | `/api/deposits/:id/close` | POST |
| `/dailyClosing.do` | `/api/closing/daily` | POST |
| `/monthlyClosing.do` | `/api/closing/monthly` | POST |

---

## 4. Priority Summary

### Priority 1 (Critical - Migrate First)

| Module | Screens | Complexity | Business Value |
|--------|---------|------------|----------------|
| Customer Master | 3 | Low | **Critical** |
| Product Master | 3 | Low | **Critical** |
| Sales Order | 5 | High | **Critical** |
| Invoice/Bill | 5 | High | **Critical** |
| Deposit/Payment | 5 | High | **Critical** |
| User/Role/Auth | 3 | Medium | **Critical** |

### Priority 2 (High)

| Module | Screens | Complexity | Business Value |
|--------|---------|------------|----------------|
| Monthly Closing | 2 | High | High |
| Stock Management | 5 | Medium | High |
| Daily Processing | 3 | Medium | High |
| Reports | 7 | Medium | Medium |
| Settings | 5 | Low | Medium |

### Priority 3 (Medium/Low)

| Module | Screens | Complexity | Business Value |
|--------|---------|------------|----------------|
| Estimate | 3 | Medium | Low |
| RO Order | 3 | Medium | Low |
| Purchase | 3 | Low | Low |
| POrder | 3 | Low | Low |

---

## 5. Migration Phases

### Phase 1: Foundation (Sprint 1-2)
```
✓ Monorepo setup
✓ Database schema (Prisma)
✓ Auth/Authorization
✓ Customer Master
✓ Product Master
✓ User Management
```

### Phase 2: Core Sales (Sprint 3-5)
```
✓ Sales Order CRUD
✓ Sales Line Management
✓ Stock Check Integration
✓ Print (Sales Slip, Delivery)
```

### Phase 3: Billing & Payment (Sprint 6-8)
```
✓ Invoice Generation
✓ Monthly Bill Creation
✓ Deposit Management
✓ Payment Allocation
✓ Receivable Tracking
```

### Phase 4: Closing & Reports (Sprint 9-10)
```
✓ Daily Closing
✓ Monthly Closing
✓ Report Generation
✓ Export (CSV/Excel)
```

### Phase 5: Advanced (Sprint 11-12)
```
✓ Estimate
✓ RO Order
✓ Purchase Management
✓ Advanced Reports
```

---

## 6. Characterization Test Plan

### Critical Logic Tests

| # | Test Case | Input | Expected | Legacy Verification |
|---|-----------|-------|----------|---------------------|
| 1 | Tax calculation | qty=10, price=1000, rate=10% | tax=1000 | Run Java, compare |
| 2 | Tax included | same as above | total=10000 | Run Java, compare |
| 3 | Monthly cutoff | customer.cutoffDay=末日 | period=1st~end | Run Java, compare |
| 4 | Bill calculation | last=10000, sales=50000, deposit=30000 | balance=30000 | Run Java, compare |
| 5 | Payment allocation | bill=10000, deposit=6000 | remaining=4000 | Run Java, compare |
| 6 | Stock update | stock=100, sales=30 | new=70 | Run Java, compare |

---

*Generated from SalesCube source analysis*
