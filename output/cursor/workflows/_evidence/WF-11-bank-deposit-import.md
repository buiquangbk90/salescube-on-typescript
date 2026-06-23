# Evidence: WF-11 Bank/COD Import

> **Companion:** [../WF-11-bank-deposit-import.md](../WF-11-bank-deposit-import.md)  
> **Generated from RE:** `/generate-workflow-docs` Phase 2 (không re-trace Java đầy đủ)

## RE Sources (WF_CONFIRMED / JAVA_CONFIRMED)

| Type | Source | Relevance |
|------|--------|-----------|
| Flow trace | `output/cursor/03-route-api-inventory.md §deposit` | Main code path |
| Routes | `output/cursor/03-route-api-inventory.md` | Entry URLs |
| Module | `output/cursor/02-module-inventory.md` | Actions & services |
| Workflow doc | `output/cursor/workflows/WF-11-bank-deposit-import.md` | Use case narrative |
| Auth (if applicable) | `output/cursor/06-auth-permission-analysis.md` | Permission model |
| Risks | `output/cursor/10-risks-unknowns.md` | Unknowns |

## Primary Java (cần spot-check khi migrate)

| Layer | Class / Script | Provenance |
|-------|----------------|------------|
| Entry | `ImportBankDepositAction.java` | INFERRED / WF_CONFIRMED |
| Service | `ImportBankDepositService` | WF_CONFIRMED |
| Tables | `BANK_DEPOSIT_WORK, DEPOSIT_SLIP_TRN` | SQL_CONFIRMED / DDL_CONFIRMED |

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
