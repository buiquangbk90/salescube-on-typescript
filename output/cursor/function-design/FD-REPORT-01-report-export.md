# FD-REPORT-01: Xuất Báo Cáo & Export (レポート出力 – Report/Export)

> **Confidence**: MEDIUM (WF-12 — nhiều Action, Jasper inferred paths)  
> **Evidence file**: [`_evidence/FD-REPORT-01-report-export.md`](./_evidence/FD-REPORT-01-report-export.md)  
> **Workflow**: [WF-12 Report Export](../workflows/WF-12-report-export.md)  
> **Scope**: PDF (JasperReports), CSV export (vận đơn, search results), HTML reference (history/master), balance reports — read-only

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Actions | Confirmed (names) | `MakeOutBillAction`, `OutputInvoiceAction`, etc. — WF-12 |
| Report engine | Confirmed | `AbstractReportService` + JasperReports — WF-12 |
| DDL work table | Confirmed | `INVOICE_DATA_WORK` — WF-12 |
| Workflow coverage | Confirmed | WF-12 (multi-module umbrella) |
| Target API design | Target decision | NestJS `ReportsController` + streaming |

**Confidence: MEDIUM** — Action/service names confirmed; `.jrxml` paths và single-slip variants cần verify.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Xuất PDF/CSV/HTML báo cáo từ dữ liệu đã có — không mutate business tables | LEGACY_CONFIRMED |
| **Module** | `report` + cross-module (sales, bill, porder) / REPORT | LEGACY_CONFIRMED |
| **Actor** | User có `isMenuValid(MENU_ID)` tương ứng từng report | LEGACY_CONFIRMED |
| **Legacy URLs** | Xem bảng §8 — multi-route | LEGACY_CONFIRMED |
| **Target API** | `GET /api/reports/*` streaming PDF/CSV | TARGET_DECISION |
| **Trigger** | User action (HTTP) — on-demand export | LEGACY_CONFIRMED |

---

## 2. Input

### Target — shared `reportDateRangeSchema`

```typescript
const reportDateRangeSchema = z.object({
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
}).refine(d => d.dateFrom <= d.dateTo, { message: 'dateFrom must be <= dateTo' });

const invoiceExportSchema = z.object({
  salesSlipIds: z.array(z.string()).min(1).optional(),
  shipperCode: z.enum(['YAMATO', 'SAGAWA']).optional(),
});

const balanceReportSchema = reportDateRangeSchema.extend({
  balanceType: z.enum(['AR', 'AP', 'BOTH']).default('BOTH'),
  cutoffGroup: z.string().optional(),
});
```

### Report-specific inputs

| Report | Key params | Required | Legacy route | Provenance |
|--------|------------|----------|--------------|------------|
| Sales PDF | dateFrom, dateTo, customerCode? | dates | `/sales/outputSalesReport` | LEGACY_CONFIRMED |
| Bill PDF | billIds / period | TBD | `/bill/makeOutBill` | LEGACY_CONFIRMED |
| PO PDF | poSlipIds | slip ids | `/porder/makeOutPOrder` | LEGACY_CONFIRMED |
| Invoice CSV | salesSlipIds | slips | `/sales/outputInvoice` | LEGACY_CONFIRMED |
| Sales search CSV | search criteria | criteria | `/sales/searchSales/outputCsv` | LEGACY_CONFIRMED |
| Balance PDF/Excel | period, type | dates | `/report/outputBalanceList` | LEGACY_CONFIRMED |
| History HTML | entityType, entityId, dateRange | entity | `/report/referenceHistory` | LEGACY_CONFIRMED |
| Master ref HTML | masterType, filters | type | `/report/referenceMst` | LEGACY_CONFIRMED |
| Recommend list | — | — | `/porder/outputRecommendList` | LEGACY_CONFIRMED |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| PDF report | `Content-Type: application/pdf`, stream browser | WF-12 § A | LEGACY_CONFIRMED |
| CSV export | `text/csv`, UTF-8 BOM (search) | WF-12 § B | LEGACY_CONFIRMED |
| Invoice CSV | Yamato/Sagawa 70+ columns | WF-12 External | LEGACY_CONFIRMED |
| No data | Empty PDF/CSV with header | WF-12 Error | LEGACY_CONFIRMED |
| History/Master | HTML table render | WF-12 § D | LEGACY_CONFIRMED |

### Target Response

```typescript
// Streaming — không JSON body cho file binary
type ReportMetaResponse = {
  filename: string;
  contentType: 'application/pdf' | 'text/csv' | 'application/vnd.ms-excel';
  generatedAt: string;
};

// HTML reference → JSON + frontend render
type HistoryReferenceResponse = {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
};
```

| Output | Provenance |
|--------|------------|
| Stream PDF/CSV | TARGET_DECISION (NestJS `@Res()` stream) |
| HTML → JSON API | TARGET_DECISION (Next.js render) |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Tất cả report read-only — không UPDATE business tables | LEGACY_CONFIRMED | WF-12 | Block |
| BR-02 | `INVOICE_DATA_WORK` temp INSERT → export → DELETE | LEGACY_CONFIRMED | WF-12 | Info |
| BR-03 | `dateFrom` ≤ `dateTo` | LEGACY_CONFIRMED | WF-12 VAL #1 | Block |
| BR-04 | Filter KH/NCC phải tồn tại nếu có | LEGACY_CONFIRMED | WF-12 VAL #2 | Block |
| BR-05 | Không lock — concurrent read OK | LEGACY_CONFIRMED | WF-12 VAL #3 | Info |
| BR-06 | Jasper: `fillReport(jrxml, dataSource)` → PDF | LEGACY_CONFIRMED | WF-12 | Info |
| BR-07 | `INVOICE_DATA_WORK` PK `(USER_ID, DELIVERY_SLIP_ID)` — no duplicate | LEGACY_CONFIRMED | WF-12 Error | Block |
| TD-01 | Target: thay Jasper bằng PDF lib (pdfmake/react-pdf) hoặc headless Jasper | TARGET_DECISION | migration | High |
| TD-02 | Target: `INVOICE_DATA_WORK` → in-memory hoặc Redis temp | TARGET_DECISION | no work table | Medium |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `dateFrom`/`dateTo` | from ≤ to | 422 | LEGACY_CONFIRMED | WF-12 |
| VAL-02 | `customerCode` | exists if provided | 404 | LEGACY_CONFIRMED | WF-12 |
| VAL-03 | `supplierCode` | exists if provided | 404 | LEGACY_CONFIRMED | WF-12 |
| VAL-04 | `cutoffGroup` | valid CATEGORY | 422 | LEGACY_CONFIRMED | WF-12 |
| VAL-05 | invoice export | no duplicate work row | 409 | LEGACY_CONFIRMED | WF-12 |
| VAL-06 | billIds | at least one bill | 422 | INFERRED | WF-12 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| No data | Empty file with headers | WF-12 |
| Jasper exception | Log + `errors.report` | WF-12 |
| Invalid date range | `errors.date` | WF-12 |
| Large dataset | Timeout — no pagination | WF-12 |
| INVOICE_DATA_WORK conflict | Duplicate PK error | WF-12 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Not found (filter entity) | 404 | `NOT_FOUND` | TARGET_DECISION |
| Report generation fail | 500 | `REPORT_GENERATION_FAILED` | TARGET_DECISION |
| Timeout / too large | 413 / 504 | `REPORT_TOO_LARGE` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Duplicate invoice work | 409 | `EXPORT_IN_PROGRESS` | TARGET_DECISION |

---

## 7. Database I/O

### Read (all reports)

| Bảng | Mục đích | Reports using | Provenance |
|------|----------|---------------|------------|
| `SALES_SLIP_TRN` + `SALES_LINE_TRN` | Sales reports | 0402, 0403, CSV | LEGACY_CONFIRMED |
| `BILL_TRN` | Invoice PDF | 0502 | LEGACY_CONFIRMED |
| `ART_BALANCE_TRN` | AR balance | 1100 | LEGACY_CONFIRMED |
| `APT_BALANCE_TRN` | AP balance | 1100 | LEGACY_CONFIRMED |
| `PO_SLIP_TRN` + `PO_LINE_TRN` | PO PDF, recommend | 0702, 0704 | LEGACY_CONFIRMED |
| `*_HIST` | History reference | 1101 | LEGACY_CONFIRMED |
| `CUSTOMER_MST`, `PRODUCT_MST`, `SUPPLIER_MST` | Master ref | 1102 | LEGACY_CONFIRMED |
| `PRODUCT_STOCK_TRN` | Stock / recommend | 0704, 1003 | LEGACY_CONFIRMED |
| `DEPOSIT_SLIP_TRN` | Balance joins | 1100 | LEGACY_CONFIRMED |

### Write (temp only)

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `INVOICE_DATA_WORK` | INSERT → DELETE | in-memory TBD | Temp staging | LEGACY_CONFIRMED |

**Transaction:** Invoice export — temp rows scoped per user session — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target) — MENU_ID mapping

| Legacy MENU_ID | Route prefix | Target permission | Report type |
|----------------|--------------|-------------------|-------------|
| `0402` | `/sales/outputSalesReport` | `report.sales.read` | PDF |
| `0403` | `/sales/outputInvoice` | `report.invoice.export` | CSV |
| `0502` | `/bill/makeOutBill` | `report.bill.read` | PDF |
| `0702` | `/porder/makeOutPOrder` | `report.porder.read` | PDF |
| `0704` | `/porder/outputRecommendList` | `report.recommend.read` | HTML/CSV |
| `1100` | `/report/outputBalanceList` | `report.balance.read` | PDF/Excel |
| `1101` | `/report/referenceHistory` | `report.history.read` | HTML→JSON |
| `1102` | `/report/referenceMst` | `report.master.read` | HTML→JSON |
| `1003` | `/stock/outputStockReport` | `report.stock.read` | PDF |

> **Evidence:** `03-route-api-inventory.md` §3.3–3.6, 3.9, 3.10.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/reports/sales` | `outputSalesReport` | `report.sales.read` |
| GET | `/api/reports/sales/export.csv` | `searchSales/outputCsv` | `report.sales.read` |
| GET | `/api/reports/invoices/shipping.csv` | `outputInvoice` | `report.invoice.export` |
| GET | `/api/reports/bills/:id.pdf` | `makeOutBill` | `report.bill.read` |
| GET | `/api/reports/purchase-orders/:id.pdf` | `makeOutPOrder` | `report.porder.read` |
| GET | `/api/reports/balance` | `outputBalanceList` | `report.balance.read` |
| GET | `/api/reports/history` | `referenceHistory` | `report.history.read` |
| GET | `/api/reports/masters/:type` | `referenceMst` | `report.master.read` |
| GET | `/api/reports/recommend-orders` | `outputRecommendList` | `report.recommend.read` |

```typescript
@Controller('reports')
@UseGuards(AuthGuard, PermissionGuard)
export class ReportsController {
  @Get('bills/:id.pdf')
  @RequirePermission('report.bill.read')
  async billPdf(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.reportsService.generateBillPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    stream.pipe(res);
  }
}
```

### Next.js UI

| Screen | Route | Legacy |
|--------|-------|--------|
| Sales report | `/reports/sales` | `outputSalesReport` |
| Bill print | `/reports/bills` | `makeOutBill` |
| Balance | `/reports/balance` | `outputBalanceList` |
| History | `/reports/history` | `referenceHistory` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Bill PDF happy path | valid billId | PDF stream 200 | Integration | LEGACY_CONFIRMED |
| TC-02 | Invalid date range | from > to | 422 | Unit | LEGACY_CONFIRMED |
| TC-03 | No data period | valid range, empty | PDF/CSV header only | Integration | LEGACY_CONFIRMED |
| TC-04 | Invoice CSV format | sales slips | 70+ col CSV | Integration | LEGACY_CONFIRMED |
| TC-05 | Permission denied | no 0502 perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-06 | History JSON | customerId + range | rows array | Integration | TARGET_DECISION |
| TC-07 | Duplicate invoice export | same user+slip | 409 | Integration | LEGACY_CONFIRMED |
| TC-08 | Large report timeout | huge date range | 504 TBD | Integration | LEGACY_CONFIRMED |

---

## 10. Risked Items

- [ ] Jasper `.jrxml` template migration — HIGH effort
- [ ] Shipper CSV column parity (Yamato/Sagawa) — 70+ fields
- [ ] No pagination legacy — timeout risk on production data
- [ ] `OutputSalesReportSingleAction` — scope unclear
- [ ] Recommend list logic ties WF-14 stock — cross-module

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | INFERRED | `.jrxml` file locations | Copy from `WEB-INF/report/` | High | Open |
| TD-01 | TARGET_DECISION | PDF engine | `@react-pdf/renderer` vs Jasper sidecar | High | Proposed |
| TD-02 | TARGET_DECISION | Split FD per report family? | Keep umbrella P1 | Medium | Proposed |
| TD-03 | TARGET_DECISION | Async report job for large exports | BullMQ queue | High | Proposed |
| AS-01 | ASSUMPTION | Excel = CSV UTF-8 BOM legacy | `xlsx` lib for balance | Medium | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-12](../workflows/WF-12-report-export.md) |
| Bill close | [WF-05](../workflows/WF-05-bill-closing.md) |
| Route | [03-route-api-inventory.md](../03-route-api-inventory.md) |
| Index | [_index.md](./_index.md) |
