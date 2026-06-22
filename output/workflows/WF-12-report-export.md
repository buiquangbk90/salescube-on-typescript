# WF-12 – Xuất Báo Cáo & PDF (レポート出力 – Report/Export)

**Confidence**: MEDIUM – Xác nhận từ service class names, action names, report directory  
**Loại**: Read-only reporting workflow

---

## Entry Route
```
GET  /sales/outputSalesReport/index            → Báo cáo bán hàng
GET  /sales/outputInvoice/index               → Xuất vận đơn CSV (shipping label)
GET  /bill/makeOutBill/index                  → In hóa đơn (PDF)
GET  /report/outputBalanceList/index          → Báo cáo số dư tài khoản
GET  /report/referenceHistory/index           → Xem lịch sử thay đổi
GET  /report/referenceMst/index               → Xem master data
GET  /porder/makeOutPOrder/index              → In phiếu đặt hàng (PDF)
GET  /porder/outputRecommendList/index        → Danh sách đề xuất đặt hàng
```

## User Role
- Tất cả user có quyền view tương ứng
- `userDto.isMenuValid(MENU_ID)` – quyền xem

---

## Main Code Path

### A. PDF Report (JasperReports)

```
GET /bill/makeOutBill/index
  → MakeOutBillAction.index()
    → BillJoinService.findByCondition() ← JOIN query
    → BillReportService.generate()
      → AbstractReportService.fillReport()
        → JasperFillManager.fillReport(template.jrxml, dataSource)
        → JasperExportManager.exportReportToPdfStream()
      → response.setContentType("application/pdf")
      → Stream PDF to browser

GET /porder/makeOutPOrder/index
  → MakeOutPOrderAction → AbstractReportService → JasperReports PDF
```

### B. CSV Export (Shipping Labels)

```
GET /sales/outputInvoice/index
  → OutputInvoiceAction.index()
    → SalesService.findForInvoice()
    → Transform SALES_SLIP_TRN → INVOICE_DATA_WORK
    → CSV serialization (Ōkurijō format for shipper)
    → response.setContentType("text/csv")
    → Download as file

GET /sales/searchSales/outputCsv
  → SearchSalesResultOutputAction
    → SalesService.searchForCsv()
    → Stream CSV (Excel-compatible UTF-8 BOM)
```

### C. Balance/Ledger Report

```
GET /report/outputBalanceList/index
  → OutputBalanceListAction.index()
    → ArtBalanceService.findByPeriod()   ← AR balance
    → AptBalanceService.findByPeriod()   ← AP balance
    → BillJoinService.findByCondition()  ← Bill summary
    → AbstractReportService.generate() → PDF or Excel
```

### D. History Reference

```
GET /report/referenceHistory/index
  → ReferenceHistoryAction
    → *HistService.findByCondition()    ← các HIST tables
    → Render HTML table (không xuất file)
```

---

## Controllers / Services / Models

| Action | Service | Output |
|--------|---------|--------|
| `OutputSalesReportAction` | `SalesService`, `AbstractReportService` | PDF |
| `OutputSalesReportSingleAction` | `SalesService` | PDF (1 phiếu) |
| `OutputSalesReportResultAction` | `SalesService` | CSV |
| `SearchSalesResultOutputAction` | `SalesService` | CSV |
| `OutputInvoiceAction` | `SalesService`, `InvoiceDataWorkService` | CSV (shipping) |
| `OutputInvoiceResultAction` | – | Kết quả export |
| `MakeOutBillAction` | `BillJoinService`, `BillReportService` | PDF |
| `MakeOutBillReportOutputAction` | `BillReportService` | PDF |
| `OutputBalanceListAction` | `ArtBalanceService`, `AptBalanceService` | PDF/Excel |
| `ReferenceHistoryAction` | `CustomerHistoryService`, `*HistService` | HTML |
| `ReferenceMstAction` | `CustomerService`, `ProductService`, etc. | HTML |
| `MakeOutPOrderAction` | `AbstractReportService` | PDF |
| `MakeOutPOrderResultOutputAction` | – | PDF |
| `OutputRecommendListAction` | `ProductService`, `ProductStockService` | HTML/CSV |

---

## Database Tables

**READ** (tất cả report đều read-only):
- `SALES_SLIP_TRN` + `SALES_LINE_TRN` – báo cáo bán hàng
- `BILL_TRN` – hóa đơn
- `DEPOSIT_SLIP_TRN` – thu tiền
- `ART_BALANCE_TRN` – số dư phải thu
- `APT_BALANCE_TRN` – số dư phải trả
- `PO_SLIP_TRN` + `PO_LINE_TRN` – đặt hàng
- `SUPPLIER_SLIP_TRN` – nhập hàng
- `PAYMENT_SLIP_TRN` – thanh toán NCC
- `CUSTOMER_MST`, `PRODUCT_MST`, `SUPPLIER_MST` – master data
- `*_HIST` tables – lịch sử thay đổi
- `PRODUCT_STOCK_TRN` – tồn kho

**WRITE**:
- `INVOICE_DATA_WORK` – INSERT tạm (cleanup sau export)
- Không write vào production tables

---

## Report Templates

**JasperReports** (`.jrxml` files, inferred location):
```
WEB/SalesCube/src/main/webapp/WEB-INF/report/
  bill/bill_template.jrxml
  sales/sales_report.jrxml
  porder/porder_template.jrxml
  ...
```

---

## Validation Rules

1. Ngày bắt đầu ≤ ngày kết thúc (date range)
2. `CUSTOMER_CODE` / `SUPPLIER_CODE` phải tồn tại (nếu filter theo)
3. Không cần lock – read-only operations
4. `CUTOFF_GROUP` / period filters phải hợp lệ

---

## Status Transitions

- Không có status transition – read-only
- `INVOICE_DATA_WORK` lifecycle:
  ```
  [None] → OutputInvoiceAction INSERT → download CSV → DELETE
  ```

---

## External Integrations

**Shipper Invoice Format**:
- `INVOICE_DATA_WORK` → CSV với 70+ columns (Yamato/Sagawa format)
- Fields: `APS_*` (APS = third-party payment system), `QR_PRINT_FLG`, `EMAIL_USE`
- **Evidence**: `CREATE.sql:3599-3680` – INVOICE_DATA_WORK schema

**JasperReports Library**:
- PDF generation server-side
- Templates: `.jrxml` compiled tại runtime
- `AbstractReportService.java` – base class cho tất cả PDF reports

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| No data found | Empty PDF/CSV với header |
| JasperFillManager exception | Log + "errors.report" |
| Date range invalid | "errors.date" validation |
| Large dataset (timeout) | Không có pagination → potential timeout |
| INVOICE_DATA_WORK conflict | PK (USER_ID, DELIVERY_SLIP_ID) → duplicate error |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/sales/OutputInvoiceAction.java` | all | Vận đơn CSV |
| `action/sales/OutputSalesReportAction.java` | all | Báo cáo bán hàng |
| `action/bill/MakeOutBillAction.java` | all | In hóa đơn PDF |
| `action/bill/MakeOutBillReportOutputAction.java` | all | PDF output |
| `action/report/OutputBalanceListAction.java` | all | Balance report |
| `action/report/ReferenceHistoryAction.java` | all | History view |
| `action/report/ReferenceMstAction.java` | all | Master view |
| `action/porder/MakeOutPOrderAction.java` | all | In PO PDF |
| `service/AbstractReportService.java` | all | JasperReports base |
| `service/BillReportService.java` | all | Bill PDF service |
| `DB/sql/createtable/CREATE.sql` | 3599-3680 | INVOICE_DATA_WORK DDL |
