# Evidence: FD-BILL-01 Bill Closing

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-05-bill-closing.md](../workflows/WF-05-bill-closing.md) | Main code path, validation, DB R/W |
| WF evidence | [WF-05 evidence](../workflows/_evidence/WF-05-bill-closing.md) | RE cross-ref |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §Bill | MENU_ID 0501, URLs |
| Module | [02-module-inventory.md](../02-module-inventory.md) §2.4 | Actions & services |
| Route inventory | [workflows/_inventory/routes.md](../workflows/_inventory/routes.md) | `CloseBillAction` |
| Auth | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) | `isMenuUpdate` pattern |
| DDL | `SalesCube/DB/sql/createtable/CREATE.sql` BILL_TRN | WF-05 Evidence L2366-2422 |
| Publish FD | [docs/function-design/FD-BILL-01-close-bill.md](../../../docs/function-design/FD-BILL-01-close-bill.md) | Target API draft |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route index | `GET /bill/closeBill/index` | LEGACY_CONFIRMED | WF-05 Entry Route |
| Route find | `POST /bill/closeBill/find` | LEGACY_CONFIRMED | WF-05 Entry Route |
| Route close | `POST /bill/closeBill/close` | LEGACY_CONFIRMED | WF-05, `CloseBillAction.java:99-141` |
| Route reopen | `POST /bill/closeBill/reopen` | LEGACY_CONFIRMED | WF-05, `CloseBillAction.java:150-196` |
| Service | `BillService.closeBillArt`, `reOpenBillArt` | LEGACY_CONFIRMED | WF-05 Main Code Path |
| AR calc | `BillAndArtService.calcArtBalance()` | LEGACY_CONFIRMED | WF-05 |
| Sales status | STATUS `2`→`3` on close, reverse on reopen | LEGACY_CONFIRMED | WF-05 Status Transitions |
| Sequence | `SEQ_MAKER` → `BILL_TRN` | LEGACY_CONFIRMED | WF-05 |
| History | `BILL_TRN_HIST` on close/reopen | LEGACY_CONFIRMED | WF-05 |
| Permission | MENU_ID `0501`, `isMenuUpdate(CLOSE_BILL)` | LEGACY_CONFIRMED | `03-route-api-inventory.md:79`, WF-05 |
| Partial commit risk | No compensation across customers | LEGACY_CONFIRMED | WF-05 Error Handling |

## Gaps

- `SalesCube/` Java source không trong workspace — line-level cần spot-check khi migrate
- `ART_BALANCE_TRN` structure và `BILL_TRN.STATUS` enum values — UNKNOWN
- `MakeOutBillAction` / `SearchBillAction` — ngoài scope FD-BILL-01
