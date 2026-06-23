# Route Inventory

> **Nguồn:** [output/cursor/03-route-api-inventory.md](../../03-route-api-inventory.md), [02-module-inventory.md](../../02-module-inventory.md)  
> **Routing:** SAStruts convention — `/{module}/{actionBean}/{method}` | Provenance: `JAVA_CONFIRMED` (`web.xml`, MENU_MST.sql)

---

## Core entry points

| Route / URL | HTTP | Action Class | Method | Entry Type | Evidence | Status |
|-------------|------|--------------|--------|------------|----------|--------|
| `/login` | GET | `LoginAction` | `index()` | SCREEN_ENTRY | `03-route-api-inventory.md` §2 | Confirmed |
| `/login/login` | POST | `LoginAction` | `login()` | CREATE (session) | `08-business-flow-hypotheses.md` §3 | Confirmed |
| `/logout` | GET/POST | `LogoutAction` | `index()` | CANCEL_OR_STATUS | `03-route-api-inventory.md` §2 | Confirmed |
| `/menu` | GET | `MenuAction` | `index()` | SCREEN_ENTRY | MENU_MST | Confirmed |

---

## O2C routes (by module)

### Estimate (見積)

| Route | MENU_ID | Action (inferred) | Entry Type | WF |
|-------|---------|-------------------|------------|-----|
| `/estimate/inputEstimate` | 0200 | `InputEstimateAction.index()` | SCREEN_ENTRY | — |
| `/estimate/searchEstimate` | 0201 | `SearchEstimateAction.index()` | SEARCH | — |

### Receive order (受注)

| Route | MENU_ID | Action (inferred) | Entry Type | WF |
|-------|---------|-------------------|------------|-----|
| `/rorder/inputROrder` | 0300 | `InputROrderAction` | SCREEN_ENTRY | WF-03 |
| `/rorder/searchROrder` | 0301 | `SearchROrderAction` | SEARCH | WF-03 |
| `/rorder/importOnlineOrder` | 0303 | `ImportOnlineOrderAction` | IMPORT | WF-10 |

### Sales (売上)

| Route | MENU_ID | Action (inferred) | Entry Type | WF |
|-------|---------|-------------------|------------|-----|
| `/sales/inputSales` | 0400 | `InputSalesAction` | SCREEN_ENTRY | WF-04 |
| `/sales/searchSales` | 0401 | `SearchSalesAction` | SEARCH | WF-04 |
| `/sales/outputSalesReport` | 0402 | `OutputSalesReportAction` | EXPORT | WF-12 |
| `/sales/outputInvoice` | 0403 | `OutputInvoiceAction` | EXPORT | WF-12 |

### Bill (請求)

| Route | MENU_ID | Action (inferred) | Entry Type | WF |
|-------|---------|-------------------|------------|-----|
| `/bill/searchBill` | 0500 | `SearchBillAction` | SEARCH | WF-05 |
| `/bill/closeBill` | 0501 | `CloseBillAction` | CREATE (batch close) | WF-05 |
| `/bill/makeOutBill` | 0502 | `MakeOutBillAction` | EXPORT | WF-05 |
| `/bill/closeArtBalance` | 0503 | `CloseArtBalanceAction` | CREATE | WF-05 |

### Deposit (入金)

| Route | MENU_ID | Action (inferred) | Entry Type | WF |
|-------|---------|-------------------|------------|-----|
| `/deposit/inputDeposit` | 0600 | `InputDepositAction` | SCREEN_ENTRY | WF-06 |
| `/deposit/searchDeposit` | 0601 | `SearchDepositAction` | SEARCH | WF-06 |
| `/deposit/importDeliveryDeposit` | 0603 | `ImportDeliveryDepositAction` | IMPORT | WF-11 |
| `/deposit/importBankDeposit` | 0604 | `ImportBankDepositAction` | IMPORT | WF-11 |

---

## P2P routes

| Route | MENU_ID | Module | WF |
|-------|---------|--------|-----|
| `/porder/inputPOrder` | 0700 | PO entry | WF-07 |
| `/purchase/inputPurchase` | 0800 | Receipt | WF-08 |
| `/payment/inputPayment` | 0900 | AP payment | WF-09 |
| `/payment/closePayment` | 0902 | AP close | WF-09 |

---

## Master & setting

| Route prefix | Module | WF |
|--------------|--------|-----|
| `/master/searchCustomer`, `/master/editCustomer` | Customer CRUD | WF-02 |
| `/setting/editUser`, `/setting/editGrantRole` | User/RBAC | WF-13 |
| `/stock/*` | Stock | WF-14 |

---

## AJAX (sample — full list in docs/spec/08)

| Route pattern | Type | Notes |
|---------------|------|-------|
| `/ajax/searchCustomerAjax` | AJAX_VALIDATION | Lookup dialogs |
| `/ajax/deleteCustomerAjax` | AJAX_VALIDATION | Soft-delete |
| `/ajax/importBankDepositAjax` | IMPORT | WF-11 |

> **UNKNOWN:** Một số AJAX URL trong `docs/spec/08-api-contracts.md` chưa resolve — ưu tiên `03-route-api-inventory` + Struts convention khi trace sâu.

---

## Batch / CLI (không HTTP)

| Trigger | Script / SP | WF |
|---------|-------------|-----|
| Cron | `UpdateCustomerRank.sh` → `SP_UPDATE_CUSTOMER_RANK_SALES` | WF-15 |
| Cron | `UpdateProductStatusCategory.sh` | WF-15 |
| Cron | `UpdateProductStockIndexValues.sh` | WF-15 |

**Evidence:** [output/cursor/05-background-jobs.md](../../05-background-jobs.md)
