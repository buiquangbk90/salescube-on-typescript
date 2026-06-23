# SalesCube Spec Index (docs/spec 01–12)

> Master index: task → skill → output path → trạng thái.  
> Cập nhật khi chạy `/reverse-engineering-java` Phase 9.5 hoặc skill tương ứng.

---

## Tổng quan

| # | File | Loại | Skill chính | Output workflow | Trạng thái |
|---|------|------|-------------|-----------------|------------|
| 01 | [01-module-inventory.md](01-module-inventory.md) | Deliverable | `/reverse-engineering-java` | [output/cursor/02-module-inventory.md](../../output/cursor/02-module-inventory.md) | Có nội dung — cần re-sync Phase 9.5 |
| 02 | [02-entity-list.md](02-entity-list.md) | Deliverable | RE Phase 5 + `/generate-prisma-schema` | [output/cursor/05-data-access-inventory.md](../../output/cursor/05-data-access-inventory.md) | Có nội dung — cần re-sync |
| 03 | [03-business-rules.md](03-business-rules.md) | Deliverable | RE Phase 7 | `output/cursor/reverse-engineering/<module>/04-business-rules.md` | Có nội dung — aggregate Phase 9.5 |
| 04 | [04-migration-map.md](04-migration-map.md) | Deliverable | `/migration-typescript` Phase 1.5 | — | Có nội dung — maintain khi migrate module |
| 05 | [05-screen-inventory.md](05-screen-inventory.md) | Deliverable | RE Phase 6 | [output/cursor/07-screen-route-mapping.md](../../output/cursor/07-screen-route-mapping.md) | Có nội dung — cần re-sync |
| 06 | [06-prisma-schema.md](06-prisma-schema.md) | Target design | `/generate-prisma-schema` Phase 5.5 | `salescube-ts/packages/db/prisma/schema.prisma` | Có nội dung — sync từ schema |
| 07 | [07-db-schema.md](07-db-schema.md) | Deliverable | RE Phase 5b | [output/cursor/04-database-analysis.md](../../output/cursor/04-database-analysis.md) | **CORRUPT** — regenerate Phase 9.5 |
| 08 | [08-api-contracts.md](08-api-contracts.md) | Deliverable | RE Phase 2/9 | [output/cursor/03-route-api-inventory.md](../../output/cursor/03-route-api-inventory.md) | PARTIAL (AJAX URL) |
| 09 | [09-service-inventory.md](09-service-inventory.md) | Deliverable | RE Phase 4/9 | [output/cursor/11-service-inventory.md](../../output/cursor/11-service-inventory.md) | Có nội dung — output mới trong workflow |
| 10 | [10-batch-jobs.md](10-batch-jobs.md) | Deliverable | RE Phase 0/9 | [output/cursor/05-background-jobs.md](../../output/cursor/05-background-jobs.md) | Có nội dung — cần re-sync |
| 11 | [11-database_analys.md](11-database_analys.md) | **Requirement** | RE Phase 5b | [output/cursor/database/](../../output/cursor/database/) | Prompt — không publish |
| 12 | [12-bussiness-workflow.md](12-bussiness-workflow.md) | **Requirement** | `/generate-workflow-docs` Phase 2.5 | [output/cursor/workflows/](../../output/cursor/workflows/) | Prompt — 15 WF files |

---

## AGENT.md outputs (ngoài 01–12)

| AGENT # | Chủ đề | Output | Skill |
|---------|--------|--------|-------|
| 1 | Architecture | [output/cursor/01-architecture-overview.md](../../output/cursor/01-architecture-overview.md) | RE Phase 9 |
| 2 | Module inventory | → spec 01 | RE Phase 9.5 |
| 3 | Route/API | → spec 08 | RE Phase 9.5 |
| 4 | Database/ERD | [output/cursor/04-database-analysis.md](../../output/cursor/04-database-analysis.md) + database/* | RE Phase 5b |
| 5 | Batch jobs | → spec 10 | RE Phase 9.5 |
| 6 | Auth | [output/cursor/06-auth-permission-analysis.md](../../output/cursor/06-auth-permission-analysis.md) | RE Phase 4/8 |
| 7 | Screen mapping | → spec 05 | RE Phase 9.5 |
| 8 | Workflow candidates | [output/cursor/08-business-flow-hypotheses.md](../../output/cursor/08-business-flow-hypotheses.md) | RE + WF |
| 9 | Integrations | [output/cursor/09-external-integrations.md](../../output/cursor/09-external-integrations.md) | RE Phase 8 |
| 10 | Risks | [output/cursor/10-risks-unknowns.md](../../output/cursor/10-risks-unknowns.md) | RE Phase 7/11 |

---

## Publish mapping (RE Phase 9.5)

| `docs/spec/` | Nguồn publish |
|--------------|---------------|
| `01-module-inventory.md` | `output/cursor/02-module-inventory.md` |
| `02-entity-list.md` | `output/cursor/05-data-access-inventory.md` + entity scan |
| `03-business-rules.md` | Aggregate module `04-business-rules.md` |
| `05-screen-inventory.md` | `output/cursor/07-screen-route-mapping.md` |
| `07-db-schema.md` | `CREATE.sql` + `output/cursor/database/table-dictionary.md` |
| `08-api-contracts.md` | `output/cursor/03-route-api-inventory.md` |
| `09-service-inventory.md` | `output/cursor/11-service-inventory.md` |
| `10-batch-jobs.md` | `output/cursor/05-background-jobs.md` |

**Không publish:** `11`, `12` (giữ requirement baseline).

---

## Pipeline QA

```
Generate → Cross-reference (spec/_index.md) → Gap Check → Review → Hoàn tất
```

- Gap reports: [docs/spec/gaps/](gaps/)
- Review reports: [docs/spec/reviews/](reviews/)
- Audit workflow: [docs/00.audit/audit_wf.md](../00.audit/audit_wf.md)

---

## Tài liệu liên quan

- [99-salescube-typescript-migration-plan.md](99-salescube-typescript-migration-plan.md)
- [glossary.md](glossary.md)
- [AGENT.md](../../AGENT.md) · [AGENTS.md](../../AGENTS.md)
