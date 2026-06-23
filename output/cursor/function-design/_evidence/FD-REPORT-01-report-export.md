# Evidence: FD-REPORT-01 Report Export

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-12-report-export.md](../workflows/WF-12-report-export.md) | PDF/CSV/HTML reports |
| WF evidence | [WF-12 evidence](../workflows/_evidence/WF-12-report-export.md) | RE cross-ref |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.3–3.6, 3.10 | Multi-module MENU_IDs |
| Service | `AbstractReportService`, `BillReportService` | LEGACY_CONFIRMED via WF |
| DDL | `INVOICE_DATA_WORK` CREATE.sql:3599-3680 | LEGACY_CONFIRMED | WF-12 |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| PDF bill | `/bill/makeOutBill` MENU `0502` | LEGACY_CONFIRMED | `03-route-api-inventory.md:80`, WF-12 |
| PDF PO | `/porder/makeOutPOrder` MENU `0702` | LEGACY_CONFIRMED | `03-route-api-inventory.md:106`, WF-12 |
| Sales report | `/sales/outputSalesReport` MENU `0402` | LEGACY_CONFIRMED | `03-route-api-inventory.md:67` |
| Invoice CSV | `/sales/outputInvoice` MENU `0403` | LEGACY_CONFIRMED | `03-route-api-inventory.md:68` |
| Balance report | `/report/outputBalanceList` MENU `1100` | LEGACY_CONFIRMED | `03-route-api-inventory.md:158` |
| History view | `/report/referenceHistory` MENU `1101` | LEGACY_CONFIRMED | `03-route-api-inventory.md:159` |
| Master ref | `/report/referenceMst` MENU `1102` | LEGACY_CONFIRMED | `03-route-api-inventory.md:160` |
| Recommend list | `/porder/outputRecommendList` MENU `0704` | LEGACY_CONFIRMED | `03-route-api-inventory.md:107` |
| JasperReports | `AbstractReportService.fillReport()` → PDF stream | LEGACY_CONFIRMED | WF-12 § A |
| INVOICE_DATA_WORK | Temp INSERT → CSV export → DELETE | LEGACY_CONFIRMED | WF-12 |
| Read-only | Không write production tables (trừ work table) | LEGACY_CONFIRMED | WF-12 |

## Gaps

- `.jrxml` template paths — INFERRED location
- `OutputSalesReportSingleAction` vs batch report — chưa có FD riêng
- Large dataset timeout — không pagination legacy
