# Function Inventory: STOCK (在庫 / Stock Management)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md) §3.9, 3.11, [WF-14](../workflows/WF-14-stock-management.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `InputStockAction` (inferred) | `index()` / `register()` | `/stock/inputStock` | `inputStock.jsp` | `EadService` adjust | SCREEN_ENTRY | FD-STOCK-01 § adjust | INFERRED |
| `SearchStockAction` | `index()` / `find()` | `/stock/searchStock` | search JSP | EAD search | LIST_SEARCH | FD-STOCK-01 § movements | LEGACY_CONFIRMED |
| `CloseStockAction` (inferred) | `close()` | `/stock/closeStock` | close JSP | monthly carry | CLOSING | FD-STOCK-01 § close | INFERRED |
| `DispProductStockListAction` | `index()` | `/stock/dispProductStockList` | list JSP | `ProductStockService` | LIST_SEARCH | FD-STOCK-01 § on-hand | LEGACY_CONFIRMED |
| `InputStockTransferAction` | — | `/stock/inputStockTransfer` | transfer JSP | transfer | SCREEN_ENTRY | FD-STOCK-02 (planned) | Out of P1 |
| `InputEntrustStockAction` | — | `/stock/inputEntrustStock` | entrust JSP | entrust EAD | SCREEN_ENTRY | FD-STOCK-03 (planned) | Out of P1 |
| `StockAction` (setting) | `index()` | `/setting/stock` | settings JSP | safety stock config | SETTING | FD-STOCK-01 § settings | LEGACY_CONFIRMED |
| `InputStockPurchaseService` | `createEadSlip()` | — (WF-08) | — | auto EAD | SIDE_EFFECT | FD-PURCHASE-01 | LEGACY_CONFIRMED |
| `InputStockSalesService` | `createEadSlip()` | — (WF-04) | — | auto EAD | SIDE_EFFECT | FD-SALES (planned) | LEGACY_CONFIRMED |

**MENU_ID:** `1000`–`1008`, `1201` — `03-route-api-inventory.md:140-148`, `171`
