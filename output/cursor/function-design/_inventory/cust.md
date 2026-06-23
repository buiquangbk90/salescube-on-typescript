# Function Inventory: CUST (Customer / 得意先)

> **Nguồn:** [07-screen-route-mapping.md](../07-screen-route-mapping.md), [02-module-inventory.md](../02-module-inventory.md), [WF-02](../workflows/WF-02-customer-management.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `SearchCustomerAction` | `index()` | `/master/searchCustomer` | `searchCustomer.jsp` | `CustomerService.find*` | LIST_SEARCH | FD-CUST-01 § list | Documented |
| `SearchCustomerAction` | `find()` | `/master/searchCustomer/find` | forward result | search SQL | LIST_SEARCH | FD-CUST-01 § list | INFERRED |
| `EditCustomerAction` | `index()` | `/master/editCustomer` | `editCustomer.jsp` | load dropdowns | SCREEN_ENTRY | FD-CUST-01 § create | Documented |
| `EditCustomerAction` | `register()` | `/master/editCustomer/register` | same / complete | `CustomerService` insert/update | CREATE/UPDATE | FD-CUST-01 § create/update | LEGACY_CONFIRMED pattern |
| `EditCustomerAction` | `delete()` | `/master/editCustomer/delete` | redirect | soft-delete | CANCEL_OR_STATUS | FD-CUST-01 § delete | INFERRED |
| `DeleteCustomerAjaxAction` | `delete()` | `/ajax/deleteCustomerAjax` | JSON | AJAX delete | AJAX_VALIDATION | FD-CUST-01 § delete (alt) | WF_CONFIRMED |
| `SearchCustomerAjaxAction` | `find()` | `/ajax/searchCustomerAjax` | partial | lookup dialog | AJAX_VALIDATION | FD-CUST-03 (planned) | Planned |
| `UpdateCustomerRank.sh` | — | shell/cron | — | `SP_UPDATE_CUSTOMER_RANK` | BATCH | [FD-CUST-02](../FD-CUST-02-batch-rank-update.md) | Documented |
| `SearchCustomerDialogAction` | — | `/ajax/searchCustomerDialog` | dialog | picker | SCREEN_NAVIGATION | — | Out of FD-CUST-01 |
| `CheckZipCodeAndAddressAjaxAction` | — | `/ajax/...` | JSON | ZIP_MST | AJAX_VALIDATION | FD-CUST-03 ZIP (planned) | Planned |

**Lưu ý:** WF-02 ghi `inputCustomer` — **ASSUMPTION** sai; RE xác nhận `editCustomer` + `searchCustomer` (`07-screen-route-mapping.md`).
