# Evidence: FD-RORDER-02 Online Order Import

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-10-online-order-import.md](../workflows/WF-10-online-order-import.md) | Full import flow |
| WF evidence | [WF-10 evidence](../workflows/_evidence/WF-10-online-order-import.md) | RE cross-ref |
| Screen/route | [07-screen-route-mapping.md](../07-screen-route-mapping.md) §3.2 | `ImportOnlineOrderAction` |
| Route/MENU | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.2 | MENU_ID 0303 |
| Module | [02-module-inventory.md](../02-module-inventory.md) §rorder | Import services |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) OnlineOrderRel | Link EC → RO |
| DDL | `CREATE.sql` ONLINE_ORDER_WORK ~3557-3597 | WF-10 cited |
| Java | `ImportOnlineOrderAction.java` | WF-10 line refs 1-100 |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route | `/rorder/importOnlineOrder` | LEGACY_CONFIRMED | `03-route-api-inventory.md:55` |
| init | `deleteWorksAll()` cleanup | LEGACY_CONFIRMED | WF-10 line 76-78 |
| upload | CSV/TSV parse → ONLINE_ORDER_WORK | LEGACY_CONFIRMED | WF-10 Main Code Path |
| update | Group by ONLINE_ORDER_ID → RO_SLIP | LEGACY_CONFIRMED | WF-10 update() flow |
| SKU match | `PRODUCT_MST.ONLINE_PCODE` | LEGACY_CONFIRMED | WF-10 Validation #4 |
| PK WORK | `(USER_ID, ONLINE_ORDER_ID, ONLINE_ITEM_ID)` | LEGACY_CONFIRMED | WF-10 Schema |
| USER isolation | Filter WORK by current user | LEGACY_CONFIRMED | WF-10 Validation #7 |
| Link | `ONLINE_ORDER_REL` insert | LEGACY_CONFIRMED | WF-10 WRITE tables |
| Cleanup | delete WORK after successful update | LEGACY_CONFIRMED | WF-10 Status Transitions |
| Permission | MENU_ID 0303, same as INPUT_RORDER | LEGACY_CONFIRMED | WF-10 User Role |
| Stop on error | `isStopOnError()` branch | LEGACY_CONFIRMED | WF-10 Error Handling |

## Gaps

- Customer lookup by email — INFERRED trong WF-10, chưa line-level confirm
- Exact CSV column mapping Amazon vs Rakuten — UNKNOWN format variants
- `ImportOnlineOrderService.importOnlineOrders()` method-level — cần Java spot-check
