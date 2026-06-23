# Evidence: FD-PORDER-01 Purchase Order Entry

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-07-purchase-order.md](../workflows/WF-07-purchase-order.md) | PO CRUD, validation, status |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §POrder | MENU_ID 0700 |
| Module | [02-module-inventory.md](../02-module-inventory.md) §2.6 | Actions & services |
| Route inventory | [workflows/_inventory/routes.md](../workflows/_inventory/routes.md) | PO entry |
| DDL | `CREATE.sql` PO_SLIP/LINE | WF-07 Evidence L2683-2835 |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route create | `GET /porder/inputPOrder/index` | LEGACY_CONFIRMED | WF-07 Entry Route |
| Route edit | `GET /porder/inputPOrder/edit/{poSlipId}` | LEGACY_CONFIRMED | WF-07 Entry Route |
| Route register | `POST /porder/inputPOrder/register` | LEGACY_CONFIRMED | WF-07, `InputPOrderAction.java` |
| Route delete | `POST /porder/inputPOrder/delete` | LEGACY_CONFIRMED | WF-07 Entry Route |
| Service slip | `InputPOrderSlipService` | LEGACY_CONFIRMED | WF-07 |
| Service line | `InputPOrderLineService` | LEGACY_CONFIRMED | WF-07 |
| REST_QUANTITY | Set = QUANTITY on create | LEGACY_CONFIRMED | WF-07 Validation #6 |
| Status flow | `0` → `2` (partial receipt) → `3` (complete) | LEGACY_CONFIRMED | WF-07 Status Transitions |
| Delete guard | No delete if SUPPLIER_SLIP linked | LEGACY_CONFIRMED | WF-07 Validation #7 |
| Permission | MENU_ID `0700`, `isMenuUpdate(INPUT_PORDER)` | INFERRED | `03-route-api-inventory.md:104`, WF-07 |
| History | `PO_SLIP_TRN_HIST`, `PO_LINE_TRN_HIST` | LEGACY_CONFIRMED | WF-07 |
| Sequence | `SEQ_MAKER` → PO_SLIP_TRN | LEGACY_CONFIRMED | WF-07 |

## Gaps

- `OutputRecommendListAction`, `MakeOutPOrderAction` — ngoài scope FD-PORDER-01
- Soft-delete pattern on PO — INFERRED, cần SQL confirm
- `RATE_MST` foreign currency — UNKNOWN có dùng trong P1 không
