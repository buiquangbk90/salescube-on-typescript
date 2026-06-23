# Function Inventory: PURCHASE (仕入 / Purchase Receipt)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md) §3.7, [WF-08](../workflows/WF-08-purchase-receipt.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `InputPurchaseAction` | `index()` | `/purchase/inputPurchase` | `inputPurchase.jsp` | load PO pending | SCREEN_ENTRY | FD-PURCHASE-01 § create | Documented |
| `InputPurchaseAction` | `edit()` | `/purchase/inputPurchase/edit/{id}` | `inputPurchase.jsp` | `SupplierSlipService.findByPk` | SCREEN_ENTRY | FD-PURCHASE-01 § edit | LEGACY_CONFIRMED |
| `InputPurchaseAction` | `register()` | `/purchase/inputPurchase/register` | same | slip+lines+EAD+stock | CREATE/UPDATE | FD-PURCHASE-01 § save | LEGACY_CONFIRMED |
| `InputPurchaseAction` | `delete()` | `/purchase/inputPurchase/delete` | redirect | reversal TBD | CANCEL_OR_STATUS | FD-PURCHASE-01 § delete | INFERRED |
| `SearchPurchaseAction` | `index()` / `find()` | `/purchase/searchPurchase` | `searchPurchase.jsp` | `SupplierSlipService.find*` | LIST_SEARCH | FD-PURCHASE-01 § list | LEGACY_CONFIRMED |

**MENU_ID:** `0800` input, `0801` search — `03-route-api-inventory.md:117-118`
