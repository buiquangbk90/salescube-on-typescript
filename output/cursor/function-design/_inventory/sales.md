# Function Inventory: SALES (Sales Slip / 売上)

> **Nguồn:** [07-screen-route-mapping.md](../07-screen-route-mapping.md), [WF-04](../workflows/WF-04-sales-slip.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `InputSalesAction` | `index()` | `/sales/inputSales` | `inputSales.jsp` | new form | SCREEN_ENTRY | FD-SALES-01 § create | Documented |
| `InputSalesAction` | `edit()` | `/sales/inputSales/edit/{id}` | same | load slip | SCREEN_ENTRY | FD-SALES-01 § update | LEGACY_CONFIRMED |
| `InputSalesAction` | `copy()` | `/sales/inputSales/copy` | same | `createSalesSlipByRo()` | SCREEN_NAVIGATION | FD-SALES-01 § from RO | LEGACY_CONFIRMED |
| `InputSalesAction` | `register()` | `/sales/inputSales/register` | same | SalesService + EAD + RO rest qty | CREATE/UPDATE | FD-SALES-01 | LEGACY_CONFIRMED |
| `InputSalesAction` | `delete()` | `/sales/inputSales/delete` | redirect | cancel slip | CANCEL_OR_STATUS | FD-SALES-01 (TBD) | INFERRED |
| `SearchSalesAction` | `index()` / `search()` | `/sales/searchSales` | `searchSales.jsp` | search SQL | LIST_SEARCH | FD-SALES-01 § list | LEGACY_CONFIRMED |
| `OutputInvoiceAction` | `index()` | `/sales/outputInvoice` | — | INVOICE_DATA_WORK | REPORT_EXPORT | — (out of scope) | WF-04 |
| `OutputSalesReportAction` | `index()` | `/sales/outputSalesReport` | — | report | REPORT_EXPORT | — (out of scope) | WF-04 |

**MENU_ID:** `0400` input, `0401` search — [03-route-api-inventory.md](../03-route-api-inventory.md) §3.3
