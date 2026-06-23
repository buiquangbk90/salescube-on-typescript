# Function Inventory: RORDER (Receive Order / 受注)

> **Nguồn:** [07-screen-route-mapping.md](../07-screen-route-mapping.md), [02-module-inventory.md](../02-module-inventory.md), [WF-03](../workflows/WF-03-receive-order.md), [WF-10](../workflows/WF-10-online-order-import.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `InputROrderAction` | `index()` | `/rorder/inputROrder` | `inputROrder.jsp` | `RoSlipService.createNew()` | SCREEN_ENTRY | FD-RORDER-01 § create | Documented |
| `InputROrderAction` | `edit()` | `/rorder/inputROrder/edit/{id}` | same | load slip + lines | SCREEN_ENTRY | FD-RORDER-01 § update | LEGACY_CONFIRMED |
| `InputROrderAction` | `register()` | `/rorder/inputROrder/register` | same | insert/update RO + lines | CREATE/UPDATE | FD-RORDER-01 | LEGACY_CONFIRMED |
| `InputROrderAction` | `cancel()` | `/rorder/inputROrder/cancel` | same | STATUS → 9 | CANCEL_OR_STATUS | FD-RORDER-01 § cancel | LEGACY_CONFIRMED |
| `InputROrderAction` | `copy()` | `/rorder/inputROrder/copy` | same | copy slip | SCREEN_NAVIGATION | FD-RORDER-01 (optional) | INFERRED |
| `SearchROrderAction` | `index()` / `search()` | `/rorder/searchROrder` | `searchROrder.jsp` | `RoSlipService.findByCondition` | LIST_SEARCH | FD-RORDER-01 § list | LEGACY_CONFIRMED |
| `ImportOnlineOrderAction` | `index()` | `/rorder/importOnlineOrder` | `importOnlineOrder.jsp` | — | SCREEN_ENTRY | FD-RORDER-02 | Documented |
| `ImportOnlineOrderAction` | `init()` | `.../init` | same | `deleteWorksAll()` | BATCH | FD-RORDER-02 § init | LEGACY_CONFIRMED |
| `ImportOnlineOrderAction` | `upload()` | `.../upload` | same | parse CSV → WORK | FILE_IMPORT | FD-RORDER-02 § upload | LEGACY_CONFIRMED |
| `ImportOnlineOrderAction` | `update()` | `.../update` | same | WORK → RO_SLIP | BATCH | FD-RORDER-02 § process | LEGACY_CONFIRMED |
| `ImportOnlineOrderAction` | `cancel()` | `.../cancel` | same | rollback WORK | CANCEL_OR_STATUS | FD-RORDER-02 | INFERRED |

**MENU_ID:** `0300` input, `0301` search, `0303` import — [03-route-api-inventory.md](../03-route-api-inventory.md) §3.2
