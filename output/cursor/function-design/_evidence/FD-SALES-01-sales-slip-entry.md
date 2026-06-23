# Evidence: FD-SALES-01 Sales Slip Entry

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-04-sales-slip.md](../workflows/WF-04-sales-slip.md) | Copy RO, register, EAD |
| WF evidence | [WF-04 evidence](../workflows/_evidence/WF-04-sales-slip.md) | RE cross-ref |
| Screen/route | [07-screen-route-mapping.md](../07-screen-route-mapping.md) §3.3 | `InputSalesAction`, `SearchSalesAction` |
| Route/MENU | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.3 | MENU_ID 0400, 0401 |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) §5.1 SalesSlipTrn | 40+ snapshot columns |
| Publish FD | [docs/function-design/FD-SALES-02](../../../docs/function-design/FD-SALES-02-create-sales-from-ro.md) | Create from RO detail |
| DDL | `CREATE.sql` SALES_SLIP_TRN 1755-1906, SALES_LINE_TRN 2031-2073 | WF-04 cited |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route input | `/sales/inputSales` | LEGACY_CONFIRMED | `03-route-api-inventory.md:65` |
| Route search | `/sales/searchSales` | LEGACY_CONFIRMED | `03-route-api-inventory.md:66` |
| Copy from RO | `copySlipName=RORDER` | LEGACY_CONFIRMED | WF-04 Entry Route, `InputSalesAction.java:150-205` |
| Register | INSERT SALES_SLIP + SALES_LINE + HIST | LEGACY_CONFIRMED | WF-04 Main Code Path |
| REST_QUANTITY | `RoLineService.updateRestQuantity()` | LEGACY_CONFIRMED | WF-04 Main Code Path |
| EAD auto | `InputStockSalesService.createEadSlip()` | LEGACY_CONFIRMED | WF-04 Main Code Path |
| Stock update | PRODUCT_STOCK_TRN via EAD | LEGACY_CONFIRMED | WF-04 WRITE tables |
| Bill guard | BILL_ID set → không sửa | LEGACY_CONFIRMED | WF-04 Validation #6 |
| Snapshot | 40+ denormalized customer/delivery cols | LEGACY_CONFIRMED | WF-04 Database WRITE |
| Report export | Out of scope (0402/0403) | TARGET_DECISION | User scope |
| Permission | MENU_ID 0400/0401 | LEGACY_CONFIRMED | `03-route-api-inventory.md` |

## Gaps

- FIFO/LIFO cost calc trong `calcCost()` — INFERRED
- Partial fulfillment quantity rules — UNKNOWN line-level
- RO status transition khi REST_QUANTITY giảm — INFERRED từ WF-03 diagram
