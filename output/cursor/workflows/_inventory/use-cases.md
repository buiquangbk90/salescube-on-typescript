# Workflow Use-case Inventory

> **Nguồn:** [08-business-flow-hypotheses.md](../../08-business-flow-hypotheses.md), [02-module-inventory.md](../../02-module-inventory.md), WF-01..15  
> **Phase:** 1 (inventory) + 2.5 (Spec-12 compliance)

---

## Use cases → Workflow mapping

| Use Case | Candidate Actions / Methods | Trigger | Workflow | Confidence | Status |
|----------|----------------------------|---------|----------|------------|--------|
| Login / logout | `LoginAction.login()`, `LogoutAction` | User HTTP | WF-01 | HIGH | Documented |
| Customer CRUD | `EditCustomerAction`, `SearchCustomerAction`, AJAX delete | User / screen | WF-02 | HIGH | Documented |
| Receive order (受注) | `InputROrderAction.register()` | User submit | WF-03 | HIGH | Documented |
| Sales slip (売上) | `InputSalesAction.register()` | User submit | WF-04 | HIGH | Documented |
| Bill closing (請求締) | `CloseBillAction`, `MakeOutBillAction` | User batch UI | WF-05 | HIGH | Documented |
| Deposit entry (入金) | `InputDepositAction.register()` | User submit | WF-06 | HIGH | Documented |
| Purchase order (発注) | `InputPOrderAction` | User submit | WF-07 | MEDIUM | Documented |
| Purchase receipt (仕入) | `InputPurchaseAction` | User submit | WF-08 | HIGH | Documented |
| Supplier payment (支払) | `ClosePaymentAction`, `InputPaymentAction` | User submit | WF-09 | MEDIUM | Documented |
| EC order import | `ImportOnlineOrderAction` | CSV upload | WF-10 | HIGH | Documented |
| Bank/COD deposit import | `ImportBankDepositAction`, `ImportDeliveryDepositAction` | CSV | WF-11 | MEDIUM | Documented |
| Report / PDF export | `OutputSalesReportAction`, Jasper | User export | WF-12 | MEDIUM | Documented |
| User & permission | `EditUserAction`, `EditGrantRoleAction` | Admin | WF-13 | HIGH | Documented |
| Stock management | `InputStockAction`, `OutputStockListAction` | User | WF-14 | MEDIUM | Documented |
| Batch rank & stock index | `UpdateCustomerRank.sh`, SPs | Cron | WF-15 | HIGH | Documented |

---

## Spec-12 Compliance Matrix

Đối chiếu [docs/spec/12-bussiness-workflow.md](../../../../docs/spec/12-bussiness-workflow.md) — đánh giá trên WF hiện có (format legacy, chưa §0–§11 đầy đủ).

| WF ID | Name | S12-1 Name | S12-2 Entry | S12-3 Role | S12-4 Path | S12-5 Components | S12-6 DB | S12-7 Validation | S12-8 Status | S12-9 External | S12-10 Errors | S12-11 Evidence | S12-12 Confidence | MET | PARTIAL |
|-------|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| WF-01 | login-auth | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ✓ | ✓ | 10 | 2 |
| WF-02 | customer-mgmt | ✓ | ○ | ✓ | ○ | ○ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ✓ | 7 | 5 |
| WF-03 | receive-order | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ✓ | 9 | 3 |
| WF-04 | sales-slip | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ✓ | ✓ | 10 | 2 |
| WF-05 | bill-closing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ✓ | 9 | 3 |
| WF-06 | deposit-entry | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ✓ | 9 | 3 |
| WF-07 | purchase-order | ✓ | ✓ | ○ | ✓ | ✓ | ✓ | ○ | ✓ | ○ | ○ | ○ | ○ | 7 | 5 |
| WF-08 | purchase-receipt | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ○ | ○ | ✓ | 8 | 4 |
| WF-09 | payment-supplier | ✓ | ✓ | ○ | ✓ | ✓ | ✓ | ○ | ✓ | ○ | ○ | ○ | ○ | 7 | 5 |
| WF-10 | online-import | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ EC | ○ | ✓ | ✓ | 11 | 1 |
| WF-11 | bank-import | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ✓ bank/COD | ○ | ○ | ○ | 8 | 4 |
| WF-12 | report-export | ✓ | ✓ | ✓ | ○ | ✓ | ○ | ○ | ○ | ✓ Jasper | ○ | ○ | ○ | 6 | 6 |
| WF-13 | user-permission | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ○ | ✓ | 9 | 3 |
| WF-14 | stock-mgmt | ✓ | ✓ | ○ | ✓ | ✓ | ✓ | ○ | ○ | ○ | ○ | ○ | ○ | 7 | 5 |
| WF-15 | batch-rank | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | N/A | ○ | ○ | ○ | ✓ | ✓ | 9 | 3 |

**Chú thích:** ✓ = có trong WF; ○ = PARTIAL/INFERRED/UNKNOWN.  
**P0 gap chung:** WF chưa dùng template §0–§11; evidence line chưa đủ cho WF-02,05,06,07,09,11,12,13,14.

---

## Planned / out of scope

| Use Case | Lý do | Workflow |
|----------|-------|----------|
| Estimate sheet (見積) | Có module, chưa có WF riêng | WF-16 (planned) |
| Entrust stock / picking | P2 module | Deferred |
| Multi-tenant DOMAIN switch | Runtime — cần RE sâu | UNKNOWN |
