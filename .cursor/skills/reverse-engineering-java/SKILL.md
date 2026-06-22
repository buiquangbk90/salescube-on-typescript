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
output/
├── 01-reverse-engineering-overview.md
├── 02-module-inventory.md
├── 03-route-api-inventory.md
├── 04-dependency-graph.md
├── 05-data-access-inventory.md
├── 06-runtime-config-inventory.md
├── workflows/          # WF-XX (skill /generate-workflow-docs)
└── reverse-engineering/<module>/
    ├── 00-scope.md … 08-analysis-report.md
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
| 6 | JSP & client-side logic |
| 7 | Business rules, status & side effects |
| 8 | Runtime configuration |
| 9 | Generate core docs `output/01-06` |
| 10 | Gap check (`/check-gap-requirements`) |
| 11 | Review (`/review-workflow-output`) |

## Tham chiếu

- `AGENT.md`, `CLAUDE.md`
- `.cursor/rules/01-reverse-engineering.mdc`, `05-agent-rules.mdc`
