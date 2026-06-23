# Evidence: FD-PURCHASE-01 Purchase Receipt

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-08-purchase-receipt.md](../workflows/WF-08-purchase-receipt.md) | Business rules, DB R/W, validation |
| WF evidence | [WF-08 evidence](../workflows/_evidence/WF-08-purchase-receipt.md) | RE cross-ref |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.7 | MENU_ID 0800, 0801 |
| Module | [02-module-inventory.md](../02-module-inventory.md) | `InputPurchaseAction`, services |
| Flow | [08-business-flow-hypotheses.md](../08-business-flow-hypotheses.md) §9 | P2P step 2 |
| DDL | `SalesCube/DB/sql/createtable/CREATE.sql` SUPPLIER_SLIP/LINE, EAD | LEGACY_CONFIRMED via WF |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route input | `/purchase/inputPurchase` | LEGACY_CONFIRMED | `03-route-api-inventory.md:117`, WF-08 |
| Route search | `/purchase/searchPurchase` | LEGACY_CONFIRMED | `03-route-api-inventory.md:118` |
| MENU_ID | `0800` input, `0801` search | LEGACY_CONFIRMED | `03-route-api-inventory.md:117-118` |
| Action | `InputPurchaseAction.java` (1037 lines) | LEGACY_CONFIRMED | WF-08 § Controllers |
| MAX_LINE | `MAX_LINE_ROW_COUNT = 35` | LEGACY_CONFIRMED | WF-08, `InputPurchaseAction.java:78` |
| EAD auto | `InputStockPurchaseService.createEadSlip()` on save | LEGACY_CONFIRMED | WF-08 Main Code Path |
| PO link | `PO_LINE_TRN.REST_QUANTITY` giảm khi nhập | LEGACY_CONFIRMED | WF-08 |
| Stock | `PRODUCT_STOCK_TRN.ENTER_NUM` + `STOCK_NUM` tăng | LEGACY_CONFIRMED | WF-08 |
| Status | `SUPPLIER_SLIP_TRN.STATUS` "0" mở, "1" linked payment | LEGACY_CONFIRMED | WF-08 |
| Hist | `SUPPLIER_SLIP_TRN_HIST` + `SUPPLIER_LINE_TRN_HIST` | LEGACY_CONFIRMED | WF-08 |
| Sequence | `SEQ_MAKER` for `SUPPLIER_SLIP_TRN` | LEGACY_CONFIRMED | WF-08 |

## Gaps

- `SalesCube/` Java không trong workspace — verify `InputPurchaseAction.register()` line-level
- Quantity vượt PO REST: warning không block — cần confirm JSP behavior
- Delete flow chưa trace đầy đủ (reversal EAD/stock)
