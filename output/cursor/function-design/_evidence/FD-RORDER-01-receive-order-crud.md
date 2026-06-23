# Evidence: FD-RORDER-01 Receive Order CRUD

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-03-receive-order.md](../workflows/WF-03-receive-order.md) | Business rules, status, DB R/W |
| WF evidence | [WF-03 evidence](../workflows/_evidence/WF-03-receive-order.md) | RE cross-ref |
| Screen/route | [07-screen-route-mapping.md](../07-screen-route-mapping.md) §3.2 | `InputROrderAction`, `SearchROrderAction` |
| Route/MENU | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.2 | MENU_ID 0300, 0301 |
| Module | [02-module-inventory.md](../02-module-inventory.md) §rorder | Services list |
| Entity fields | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) §5.1 RoSlipTrn | Column mapping |
| Business rules | [docs/spec/03-business-rules.md](../../../docs/spec/03-business-rules.md) | O2C flow |
| Auth | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) | `INPUT_RORDER` pattern |
| DDL | `SalesCube/DB/sql/createtable/CREATE.sql` RO_SLIP_TRN, RO_LINE_TRN | WF-03 cited range 1655-1760 |
| Publish FD | [docs/function-design/FD-RORDER-01](../../../docs/function-design/FD-RORDER-01-search-receive-order.md), [FD-RORDER-02](../../../docs/function-design/FD-RORDER-02-create-receive-order.md), [FD-RORDER-03](../../../docs/function-design/FD-RORDER-03-cancel-receive-order.md) | Consolidated scope |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route input | `/rorder/inputROrder` | LEGACY_CONFIRMED | `03-route-api-inventory.md:53`, `07-screen-route-mapping.md:84` |
| Route search | `/rorder/searchROrder` | LEGACY_CONFIRMED | `03-route-api-inventory.md:54`, `07-screen-route-mapping.md:85` |
| Register | `POST /rorder/inputROrder/register` | LEGACY_CONFIRMED | WF-03 Entry Route |
| Cancel | `POST /rorder/inputROrder/cancel` | LEGACY_CONFIRMED | WF-03 Entry Route, Status diagram |
| Copy | `GET /rorder/inputROrder/copy` | LEGACY_CONFIRMED | WF-03 Entry Route |
| Service | `RoSlipService`, `RoLineService` | LEGACY_CONFIRMED | WF-03 Controllers table |
| REST_QUANTITY | Set = QUANTITY on insert | LEGACY_CONFIRMED | WF-03 Validation #8 |
| Credit check | Warning only, không block | LEGACY_CONFIRMED | WF-03 Validation #6 |
| Stock check | Warning only | LEGACY_CONFIRMED | WF-03 Error Handling |
| History | `RO_SLIP_TRN_HIST`, `RO_LINE_TRN_HIST` | LEGACY_CONFIRMED | WF-03 WRITE tables |
| Sequence | `SEQ_MAKER` RO_SLIP_TRN | LEGACY_CONFIRMED | WF-03 Main Code Path |
| Permission | MENU_ID 0300/0301 + `isMenuUpdate` | LEGACY_CONFIRMED | WF-03, `03-route-api-inventory.md` |
| EC import | Out of scope → FD-RORDER-02 | TARGET_DECISION | User scope |

## Gaps

- `InputROrderAction.cancel()` guard khi STATUS `"2"` (partial SALES) — UNKNOWN
- Copy từ Estimate — optional, chưa verify line-level Java trong workspace
- Optimistic lock (`UnabledLockException`) — INFERRED từ WF-03 error table
