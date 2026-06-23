# Function Inventory: REPORT (レポート / Report & Export)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md) §3.3–3.6, 3.10, [WF-12](../workflows/WF-12-report-export.md)

| Legacy Action | Method (typical) | Legacy URL | Output | Service Calls | Type | Proposed FD | MENU_ID |
|---------------|------------------|------------|--------|---------------|------|-------------|---------|
| `OutputSalesReportAction` | `index()` | `/sales/outputSalesReport` | PDF | `SalesService`, Jasper | REPORT_PDF | FD-REPORT-01 § sales | 0402 |
| `OutputSalesReportSingleAction` | — | inferred | PDF | `SalesService` | REPORT_PDF | FD-REPORT-01 (TBD) | 0402 |
| `SearchSalesResultOutputAction` | `outputCsv` | `/sales/searchSales/outputCsv` | CSV | `SalesService` | REPORT_CSV | FD-REPORT-01 § sales csv | 0401 |
| `OutputInvoiceAction` | `index()` | `/sales/outputInvoice` | CSV shipper | `InvoiceDataWorkService` | REPORT_CSV | FD-REPORT-01 § invoice | 0403 |
| `MakeOutBillAction` | `index()` | `/bill/makeOutBill` | PDF | `BillReportService` | REPORT_PDF | FD-REPORT-01 § bill | 0502 |
| `MakeOutPOrderAction` | `index()` | `/porder/makeOutPOrder` | PDF | Jasper | REPORT_PDF | FD-REPORT-01 § po | 0702 |
| `OutputRecommendListAction` | `index()` | `/porder/outputRecommendList` | HTML/CSV | `ProductStockService` | REPORT_LIST | FD-REPORT-01 § recommend | 0704 |
| `OutputBalanceListAction` | `index()` | `/report/outputBalanceList` | PDF/Excel | `ArtBalance`, `AptBalance` | REPORT_PDF | FD-REPORT-01 § balance | 1100 |
| `ReferenceHistoryAction` | `index()` | `/report/referenceHistory` | HTML | `*HistService` | REFERENCE | FD-REPORT-01 § history | 1101 |
| `ReferenceMstAction` | `index()` | `/report/referenceMst` | HTML | master services | REFERENCE | FD-REPORT-01 § master | 1102 |
| `OutputStockReportAction` | `index()` | `/stock/outputStockReport` | PDF | stock services | REPORT_PDF | FD-REPORT-01 / FD-STOCK-01 | 1003 |

**Ghi chú:** Umbrella FD-REPORT-01 — có thể tách per-family P2.
