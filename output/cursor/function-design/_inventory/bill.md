# Function Inventory: BILL (請求 – Bill / Invoice)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md), [02-module-inventory.md](../02-module-inventory.md), [WF-05](../workflows/WF-05-bill-closing.md)

| Legacy Action | Method (typical) | Legacy URL | MENU_ID | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|---------|---------------|------|-------------|--------|
| `CloseBillAction` | `index()` | `/bill/closeBill/index` | 0501 | load form | SCREEN_ENTRY | FD-BILL-01 § screen | Documented |
| `CloseBillAction` | `find()` | `/bill/closeBill/find` | 0501 | search candidates | LIST_SEARCH | FD-BILL-01 § candidates | LEGACY_CONFIRMED |
| `CloseBillAction` | `close()` | `/bill/closeBill/close` | 0501 | `BillService.closeBillArt` | CREATE (batch) | FD-BILL-01 § close | LEGACY_CONFIRMED |
| `CloseBillAction` | `reopen()` | `/bill/closeBill/reopen` | 0501 | `BillService.reOpenBillArt` | CANCEL_OR_STATUS | FD-BILL-01 § reopen | LEGACY_CONFIRMED |
| `SearchBillAction` | `index()` / `find()` | `/bill/searchBill` | 0500 | `BillJoinService` | LIST_SEARCH | FD-BILL-02 (planned) | Planned |
| `MakeOutBillAction` | `index()` | `/bill/makeOutBill` | 0502 | `BillReportService` | REPORT_EXPORT | FD-BILL-03 (planned) | Planned |
| `CloseArtBalanceAction` | — | `/bill/closeArtBalance` | 0503 | ART closing | CLOSING | — | Out of FD-BILL-01 |

**Lưu ý:** FD-BILL-01 chỉ scope chốt/mở lại hóa đơn (`CloseBillAction`); không gồm in PDF hay tìm kiếm bill đã chốt.
