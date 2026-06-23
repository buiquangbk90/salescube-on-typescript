# Evidence: FD-DEPOSIT-02 Bank/Delivery Deposit Import

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-11-bank-deposit-import.md](../workflows/WF-11-bank-deposit-import.md) | Import flows, staging, match |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §Deposit | MENU_ID 0603, 0604 |
| Module | [02-module-inventory.md](../02-module-inventory.md) §2.5 | Import actions & work services |
| WF-06 cross-ref | [WF-06-deposit-entry.md](../workflows/WF-06-deposit-entry.md) § External Integrations | Deposit creation after match |
| Publish FD | [docs/function-design/FD-DEPOSIT-02-import-bank-deposit.md](../../../docs/function-design/FD-DEPOSIT-02-import-bank-deposit.md) | Target API draft |
| DDL | `CREATE.sql` DELIVERY_DEPOSIT_WORK | WF-11 L3682-3699 |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Bank upload | `POST /deposit/importBankDeposit/upload` | LEGACY_CONFIRMED | WF-11 Entry Route |
| Bank process | `POST /deposit/importBankDeposit/update` | LEGACY_CONFIRMED | WF-11 Main Code Path A |
| COD upload | `POST /deposit/importDeliveryDeposit/upload` | LEGACY_CONFIRMED | WF-11 Entry Route |
| COD process | `POST /deposit/importDeliveryDeposit/update` | LEGACY_CONFIRMED | WF-11 Main Code Path B |
| Staging | `BANK_DEPOSIT_WORK` deleteAll → insert → cleanup | LEGACY_CONFIRMED | WF-11 |
| Staging | `DELIVERY_DEPOSIT_WORK` same pattern | LEGACY_CONFIRMED | WF-11 |
| Bank match | CUSTOMER_CODE + PRICE → BILL_TRN | LEGACY_CONFIRMED | WF-11 |
| COD match | DELIVERY_SLIP_ID → SALES_SLIP (`COD_SC='1'`) | LEGACY_CONFIRMED | WF-11 |
| Rel tables | `BANK_DEPOSIT_REL`, `DELIVERY_DEPOSIT_REL` | LEGACY_CONFIRMED | WF-11 |
| Permission bank | MENU_ID `0604` | LEGACY_CONFIRMED | `03-route-api-inventory.md:94` |
| Permission COD | MENU_ID `0603` | LEGACY_CONFIRMED | `03-route-api-inventory.md:93` |
| Duplicate COD | Skip if DELIVERY_DEPOSIT_REL exists | LEGACY_CONFIRMED | WF-11 Validation #4 |
| Parent parser | `AbstractXSVUploadAction` CSV/TSV | LEGACY_CONFIRMED | WF-11 |

## Gaps

- Zengin / Yamato / Sagawa file format chi tiết — ASSUMPTION từ WF-11
- `ImportBankDepositAction.java` chưa đọc line-level trong workspace — MEDIUM confidence
- Staging in-memory vs DB — TARGET_DECISION pending
