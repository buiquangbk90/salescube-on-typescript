# Workflow Index — SalesCube Legacy

> **Nguồn RE:** `output/cursor/01`–`11`, `08-business-flow-hypotheses.md`, `03-route-api-inventory.md`  
> **Generated:** 2026-06-23 — `/generate-workflow-docs` từ RE output sẵn có  
> **Requirement baseline:** [docs/spec/12-bussiness-workflow.md](../../../docs/spec/12-bussiness-workflow.md)

---

## Preflight (Phase 0)

| Item | Path / Value | Status |
|------|--------------|--------|
| RE architecture | [output/cursor/01-architecture-overview.md](../01-architecture-overview.md) | Found |
| Module inventory | [output/cursor/02-module-inventory.md](../02-module-inventory.md) | Found |
| Route inventory | [output/cursor/03-route-api-inventory.md](../03-route-api-inventory.md) | Found |
| Flow hypotheses | [output/cursor/08-business-flow-hypotheses.md](../08-business-flow-hypotheses.md) | Found |
| Auth analysis | [output/cursor/06-auth-permission-analysis.md](../06-auth-permission-analysis.md) | Found |
| DB analysis | [output/cursor/04-database-analysis.md](../04-database-analysis.md) | Found |
| Action source | `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/` | Found |
| Service source | `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/` | Found |
| Named SQL | `SalesCube/WEB/SalesCube/src/main/resources/entity/sql/` | Found |
| JSP | `SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/view/` | Found |
| Route mechanism | SAStruts convention (`web.xml` RoutingFilter) | JAVA_CONFIRMED |
| DDL | `SalesCube/DB/sql/createtable/CREATE.sql` | Found |

---

## Workflow Catalog (15 use cases)

| ID | File | Domain (spec 12) | Confidence | Evidence | RE section |
|----|------|------------------|------------|----------|------------|
| WF-01 | [WF-01-login-auth.md](./WF-01-login-auth.md) | User/permission | HIGH | [_evidence/WF-01-login-auth.md](./_evidence/WF-01-login-auth.md) | 08 §3 |
| WF-02 | [WF-02-customer-management.md](./WF-02-customer-management.md) | Customer | HIGH | [_evidence/WF-02-customer-management.md](./_evidence/WF-02-customer-management.md) | 02 §master |
| WF-03 | [WF-03-receive-order.md](./WF-03-receive-order.md) | Sales/order | HIGH | [_evidence/WF-03-receive-order.md](./_evidence/WF-03-receive-order.md) | 02 §rorder, 08 O2C |
| WF-04 | [WF-04-sales-slip.md](./WF-04-sales-slip.md) | Sales/order | HIGH | [_evidence/WF-04-sales-slip.md](./_evidence/WF-04-sales-slip.md) | 08 §4 |
| WF-05 | [WF-05-bill-closing.md](./WF-05-bill-closing.md) | Billing/invoice | HIGH | [_evidence/WF-05-bill-closing.md](./_evidence/WF-05-bill-closing.md) | 08 O2C |
| WF-06 | [WF-06-deposit-entry.md](./WF-06-deposit-entry.md) | Payment | HIGH | [_evidence/WF-06-deposit-entry.md](./_evidence/WF-06-deposit-entry.md) | 08 §6 |
| WF-07 | [WF-07-purchase-order.md](./WF-07-purchase-order.md) | Contract/PO | MEDIUM | [_evidence/WF-07-purchase-order.md](./_evidence/WF-07-purchase-order.md) | 08 P2P |
| WF-08 | [WF-08-purchase-receipt.md](./WF-08-purchase-receipt.md) | Sales/order (stock) | HIGH | [_evidence/WF-08-purchase-receipt.md](./_evidence/WF-08-purchase-receipt.md) | 08 §9 |
| WF-09 | [WF-09-payment-to-supplier.md](./WF-09-payment-to-supplier.md) | Payment | MEDIUM | [_evidence/WF-09-payment-to-supplier.md](./_evidence/WF-09-payment-to-supplier.md) | 08 P2P |
| WF-10 | [WF-10-online-order-import.md](./WF-10-online-order-import.md) | Sales/order | HIGH | [_evidence/WF-10-online-order-import.md](./_evidence/WF-10-online-order-import.md) | 08 §7 |
| WF-11 | [WF-11-bank-deposit-import.md](./WF-11-bank-deposit-import.md) | Payment | MEDIUM | [_evidence/WF-11-bank-deposit-import.md](./_evidence/WF-11-bank-deposit-import.md) | 03 §deposit |
| WF-12 | [WF-12-report-export.md](./WF-12-report-export.md) | Reporting/export | MEDIUM | [_evidence/WF-12-report-export.md](./_evidence/WF-12-report-export.md) | 02 §report |
| WF-13 | [WF-13-user-permission.md](./WF-13-user-permission.md) | User/permission | HIGH | [_evidence/WF-13-user-permission.md](./_evidence/WF-13-user-permission.md) | 06-auth |
| WF-14 | [WF-14-stock-management.md](./WF-14-stock-management.md) | Sales/order (stock) | MEDIUM | [_evidence/WF-14-stock-management.md](./_evidence/WF-14-stock-management.md) | 02 §stock |
| WF-15 | [WF-15-batch-rank-update.md](./WF-15-batch-rank-update.md) | Customer (batch) | HIGH | [_evidence/WF-15-batch-rank-update.md](./_evidence/WF-15-batch-rank-update.md) | 08 §8, 05-batch |

---

## O2C / P2P coverage

```text
O2C: WF-03 → WF-04 → WF-05 → WF-06 (+ WF-10 import RO, WF-11 import deposit)
P2P: WF-07 → WF-08 → WF-09
Master: WF-02, WF-13
Stock: WF-14 (cross-cutting với WF-04, WF-08)
Batch: WF-15
Auth: WF-01 (gate cho tất cả)
Report: WF-12
```

---

## Artifacts

| Path | Mô tả |
|------|-------|
| [_inventory/routes.md](./_inventory/routes.md) | Route inventory từ RE |
| [_inventory/use-cases.md](./_inventory/use-cases.md) | Use-case + Spec-12 matrix |
| [_open-questions.md](./_open-questions.md) | Unknowns / follow-up |
| [_evidence/](./_evidence/) | Evidence companion per WF |
| [_reports/](./_reports/) | Review reports (sau `/review-workflow-output`) |

---

## Pipeline status

| Step | Status |
|------|--------|
| Phase 0–5 Generate | Done (từ RE + WF hiện có) |
| Cross-reference | Done → `docs/spec/_index.md`, spec/03 |
| Gap check | [GAP-01-workflows-cursor.md](../../../docs/spec/gaps/GAP-01-workflows-cursor.md) |
| Review | Pending — chạy `/review-workflow-output` |
