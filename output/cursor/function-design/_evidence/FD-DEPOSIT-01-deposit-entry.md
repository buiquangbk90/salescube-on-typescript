# Evidence: FD-DEPOSIT-01 Deposit Entry

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-06-deposit-entry.md](../workflows/WF-06-deposit-entry.md) | CRUD flow, validation, DB R/W |
| WF evidence | [WF-06 evidence](../workflows/_evidence/WF-06-deposit-entry.md) | RE cross-ref |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §Deposit | MENU_ID 0600, 0601 |
| Module | [02-module-inventory.md](../02-module-inventory.md) §2.5 | Actions & services |
| Publish FD | [docs/function-design/FD-DEPOSIT-01-create-deposit.md](../../../docs/function-design/FD-DEPOSIT-01-create-deposit.md) | Target API draft |
| DDL | `CREATE.sql` DEPOSIT_SLIP/LINE | WF-06 Evidence L2487-2647 |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route create | `GET /deposit/inputDeposit/index` | LEGACY_CONFIRMED | WF-06 Entry Route |
| Route edit | `GET /deposit/inputDeposit/edit/{depositId}` | LEGACY_CONFIRMED | WF-06 Entry Route |
| Route register | `POST /deposit/inputDeposit/register` | LEGACY_CONFIRMED | WF-06, `InputDepositAction.java` |
| Route delete | `POST /deposit/inputDeposit/delete` | LEGACY_CONFIRMED | WF-06 Entry Route |
| Route search | `GET /deposit/searchDeposit/index` | LEGACY_CONFIRMED | WF-06, MENU_ID 0601 |
| Service | `DepositSlipService`, `DepositLineService` | LEGACY_CONFIRMED | WF-06 |
| Bill link | `UPDATE BILL_TRN.DEPOSIT_PRICE` when linked | LEGACY_CONFIRMED | WF-06 Main Code Path |
| Categories | cash, check, transfer, bank, COD, setoff | LEGACY_CONFIRMED | WF-06 |
| Status | `0`=Open, `1`=ART closed; delete only if `0` | LEGACY_CONFIRMED | WF-06 Status Transitions |
| Total check | sum(lines) = slip total | LEGACY_CONFIRMED | WF-06 Validation #7 |
| Permission | MENU_ID `0600`, `isMenuUpdate(INPUT_DEPOSIT)` | LEGACY_CONFIRMED | `03-route-api-inventory.md:91`, WF-06 |
| History | `DEPOSIT_SLIP_TRN_HIST`, `DEPOSIT_LINE_TRN_HIST` | LEGACY_CONFIRMED | WF-06 |

## Gaps

- Bank/delivery import rel tables — scope FD-DEPOSIT-02, không FD-DEPOSIT-01
- `ART_BALANCE_TRN.ART_ID` link — UNKNOWN, WF liên quan chưa có FD
- Full `DEPOSIT_CATEGORY` từ `CATEGORY_TRN` — cần SQL confirm
