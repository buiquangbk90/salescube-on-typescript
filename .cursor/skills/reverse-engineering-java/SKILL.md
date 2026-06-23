---
name: reverse-engineering-java
description: Reverse-engineer SalesCube Java evidence-first theo AGENT.md — scope/reachability, dependency graph, Action→Service→SQL→DB, JSP/JS logic. Provenance CONFIRMED/INFERRED/UNKNOWN. Dùng khi phân tích module legacy.
disable-model-invocation: true
---

# Reverse Engineering Java

> **Workflow đầy đủ:** [reference-workflow.md](reference-workflow.md) (port từ `.devin/workflows/reverse-engineering-java.md`)

## Mục tiêu

Phân tích Java legacy (Struts/Seasar2) → baseline cho WF, FD, Prisma, migration, characterization tests.

**Không sửa** `SalesCube/`. Không coi tên class/method/bảng là evidence đủ.

## Provenance

`CONFIRMED_BY_CODE` | `CONFIRMED_BY_CONFIG` | `CONFIRMED_BY_DDL` | `INFERRED_FROM_CODE` | `RUNTIME_DEPENDENT` | `UNKNOWN_NEEDS_VERIFICATION` | `POSSIBLY_UNREACHABLE`

## Output

```text
output/cursor/
├── 01-architecture-overview.md          # AGENT #1
├── 02-module-inventory.md               # AGENT #2 → publish docs/spec/01
├── 03-route-api-inventory.md            # AGENT #3 → publish docs/spec/08
├── 04-database-analysis.md              # AGENT #4
├── 05-background-jobs.md                # AGENT #5 → publish docs/spec/10
├── 06-auth-permission-analysis.md       # AGENT #6
├── 07-screen-route-mapping.md           # AGENT #7 → publish docs/spec/05
├── 08-business-flow-hypotheses.md       # AGENT #8
├── 09-external-integrations.md          # AGENT #9
├── 10-risks-unknowns.md               # AGENT #10
├── 11-service-inventory.md              # → publish docs/spec/09
├── database/                            # spec 11 requirement (Phase 5b)
│   ├── table-dictionary.md
│   ├── relationship-map.md
│   ├── suspected-erd.mmd
│   ├── data-lifecycle.md
│   └── data-integrity-risks.md
├── workflows/                           # WF-XX (skill /generate-workflow-docs)
└── reverse-engineering/<module>/
    ├── 00-scope.md … 08-analysis-report.md

docs/spec/                               # Phase 9.5 publish (01–10, trừ 11/12)
```

## Phases (tuần tự)

| Phase | Nội dung |
|-------|----------|
| 0 | Preflight — Struts/Seasar/web.xml/DDL paths |
| 1 | Module scope & reachability inventory |
| 2 | Entry point & route discovery |
| 3 | Component & dependency graph (mermaid) |
| 4 | Action/Service/transaction analysis |
| 5 | SQL, DDL & data access |
| **5b** | **Deep database analysis** (`docs/spec/11` → `output/cursor/database/*`) |
| 6 | JSP & client-side logic |
| 7 | Business rules, status & side effects |
| 8 | Runtime configuration |
| 9 | Generate core docs `output/01`–`11` |
| **9.5** | **Spec bundle publish** → `docs/spec/01`–`10` |
| — | **Cross-reference** (`docs/spec/_index.md`, WF ↔ spec/03) |
| 10 | Gap check (`/check-gap-requirements`) |
| 11 | Review (`/review-workflow-output`) |

## Tham chiếu

- `AGENT.md`, `CLAUDE.md`, `docs/spec/_index.md`
- `.cursor/rules/01-reverse-engineering.mdc`, `05-agent-rules.mdc`
- Audit: `docs/00.audit/audit_wf.md`
