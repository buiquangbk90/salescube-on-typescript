# Evidence: FD-CUST-02 Batch Rank Update

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-15-batch-rank-update.md](../workflows/WF-15-batch-rank-update.md) | Shell + SP logic |
| WF evidence | [WF-15 evidence](../workflows/_evidence/WF-15-batch-rank-update.md) | RE cross-ref |
| Batch | `output/cursor/05-background-jobs.md` | Batch inventory |
| DDL | `CREATE.sql` CUSTOMER_MST, CUSTOMER_RANK_MST, MINE_MST | LEGACY_CONFIRMED via WF |
| Cross-ref | FD-CUST-01 BR-06 — rank updated by WF-15 | LEGACY_CONFIRMED |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Trigger | `UpdateCustomerRank.sh` — cron/manual | LEGACY_CONFIRMED | WF-15 |
| SP | `SP_UPDATE_CUSTOMER_RANK(domain)` | LEGACY_CONFIRMED | WF-15 § A |
| DOMAIN | Hard-coded `DOMAIN=SALES` | LEGACY_CONFIRMED | WF-15 |
| Criteria | `CUSTOMER_RANK_MST` RO_COUNT + monthly avg ranges | LEGACY_CONFIRMED | WF-15 |
| Source data | `RO_SLIP_TRN`, `SALES_SLIP_TRN` aggregates | LEGACY_CONFIRMED | WF-15 |
| Target | `CUSTOMER_MST.CUSTOMER_RANK_CATEGORY` UPDATE | LEGACY_CONFIRMED | WF-15 |
| No HTTP | Không có Action/menu — DB user `salescube` | LEGACY_CONFIRMED | WF-15 |
| No SEQ_MAKER | Batch chỉ UPDATE, không INSERT | LEGACY_CONFIRMED | WF-15 |
| Atomicity | SP COMMIT — rollback on error | LEGACY_CONFIRMED | WF-15 |
| Race risk | Chạy 2 lần đồng thời → race UPDATE | LEGACY_CONFIRMED | WF-15 Risks |

## Scope Note

WF-15 còn gồm `SP_UPDATE_PRODUCT_STATUS_CATEGORY` và `SP_UPDATE_PRODUCT_STOCK_VALUES` — **ngoài scope FD-CUST-02** (xem FD-STOCK-01 / batch product P2).

## Gaps

- Cron schedule không có trong source — UNKNOWN
- SP source body chưa trong workspace — cần `SalesCube/DB/sql/` verify
- `ENROLL_TERM` calculation logic — INFERRED từ WF narrative
