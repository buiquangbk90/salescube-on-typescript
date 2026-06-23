# Evidence: WF-14 Stock Management

> **Companion:** [../WF-14-stock-management.md](../WF-14-stock-management.md)  
> **Generated from RE:** `/generate-workflow-docs` Phase 2 (không re-trace Java đầy đủ)

## RE Sources (WF_CONFIRMED / JAVA_CONFIRMED)

| Type | Source | Relevance |
|------|--------|-----------|
| Flow trace | `output/cursor/02-module-inventory.md §stock` | Main code path |
| Routes | `output/cursor/03-route-api-inventory.md` | Entry URLs |
| Module | `output/cursor/02-module-inventory.md` | Actions & services |
| Workflow doc | `output/cursor/workflows/WF-14-stock-management.md` | Use case narrative |
| Auth (if applicable) | `output/cursor/06-auth-permission-analysis.md` | Permission model |
| Risks | `output/cursor/10-risks-unknowns.md` | Unknowns |

## Primary Java (cần spot-check khi migrate)

| Layer | Class / Script | Provenance |
|-------|----------------|------------|
| Entry | `InputStockAction.java` | INFERRED / WF_CONFIRMED |
| Service | `ProductStockService, EadService` | WF_CONFIRMED |
| Tables | `PRODUCT_STOCK_TRN, EAD_SLIP_TRN` | SQL_CONFIRMED / DDL_CONFIRMED |

## Extracted Evidence Summary

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Entry | See WF doc Entry Route section | WF_CONFIRMED | RE + WF companion |
| Permission | MENU_ID + `userDto.isMenuUpdate()` | JAVA_CONFIRMED | `06-auth-permission-analysis.md` |
| DB R/W | See WF doc Database Tables | WF_CONFIRMED | `08-business-flow-hypotheses.md` |
| Side effects | HIST / SEQ_MAKER where noted in WF | INFERRED | `04-database-analysis.md` audit pattern |

## Gaps for deep trace (Phase 3 follow-up)

- Spot-check Action method line ranges in Java source
- Confirm Named SQL files under `entity/sql/`
- Add error flow branches to WF §4 template
