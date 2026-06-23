# Function Inventory: PAYMENT (支払 / Payment to Supplier)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md) §3.8, [WF-09](../workflows/WF-09-payment-to-supplier.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `ClosePaymentAction` | `index()` | `/payment/closePayment` | `closePayment.jsp` | load pending AP | SCREEN_ENTRY | FD-PAYMENT-01 § close UI | LEGACY_CONFIRMED |
| `ClosePaymentAction` | `close()` | `/payment/closePayment/close` | redirect | `ClosePaymentService.closePayment` | CLOSING | FD-PAYMENT-01 § close | LEGACY_CONFIRMED |
| `ClosePaymentAction` | `reopen()` | `/payment/closePayment/reopen` | redirect | `reopenPayment` | CLOSING | FD-PAYMENT-01 § reopen | LEGACY_CONFIRMED |
| `InputPaymentAction` | `index()` / `register()` | `/payment/inputPayment` | `inputPayment.jsp` | manual slip | CREATE/UPDATE | FD-PAYMENT-01 § manual | LEGACY_CONFIRMED |
| `SearchPaymentAction` | `index()` / `find()` | `/payment/searchPayment` | `searchPayment.jsp` | search | LIST_SEARCH | FD-PAYMENT-01 § list | LEGACY_CONFIRMED |

**MENU_ID:** `0900` input, `0901` search, `0902` close — `03-route-api-inventory.md:128-130`
