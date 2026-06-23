# Evidence: FD-STOCK-01 Stock Management

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-14-stock-management.md](../workflows/WF-14-stock-management.md) | EAD ledger, manual adjust, close |
| WF evidence | [WF-14 evidence](../workflows/_evidence/WF-14-stock-management.md) | RE cross-ref |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.9, 3.11 | MENU_ID 1000–1008, 1201 |
| Cross-WF | WF-04 (sales EAD), WF-08 (purchase EAD) | LEGACY_CONFIRMED |
| DDL | `CREATE.sql` EAD_SLIP/LINE, PRODUCT_STOCK_TRN | LEGACY_CONFIRMED via WF |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Manual adjust | `/stock/inputStock` MENU `1000` | LEGACY_CONFIRMED | `03-route-api-inventory.md:140`, WF-14 |
| Search | `/stock/searchStock` MENU `1001` | LEGACY_CONFIRMED | `03-route-api-inventory.md:141` |
| Stock close | `/stock/closeStock` MENU `1005` | LEGACY_CONFIRMED | `03-route-api-inventory.md:145` |
| Settings | `/setting/stock` MENU `1201` | LEGACY_CONFIRMED | `03-route-api-inventory.md:171` |
| EAD categories | 01入庫, 02出庫, 03調整, 04返品, 05棚卸 | LEGACY_CONFIRMED | WF-14 |
| Append-only | EAD_SLIP_TRN luôn INSERT, không UPDATE | LEGACY_CONFIRMED | WF-14 |
| Auto EAD sales | `InputStockSalesService` (WF-04) | LEGACY_CONFIRMED | WF-14 § A |
| Auto EAD purchase | `InputStockPurchaseService` (WF-08) | LEGACY_CONFIRMED | WF-14 § A |
| Monthly carry | `PRODUCT_STOCK_TRN` row mới mỗi tháng | LEGACY_CONFIRMED | WF-14 § C |
| Batch SP | `SP_UPDATE_PRODUCT_STATUS_CATEGORY` (WF-15 overlap) | LEGACY_CONFIRMED | WF-14, WF-15 |

## Gaps

- `StockAction` class name INFERRED — cần verify `action/stock/*`
- Negative stock validation — INFERRED
- Entrust stock (`inputEntrustStock` 1007) — scope P2, chưa trong FD P1
