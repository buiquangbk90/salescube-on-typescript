# output/cursor — Kết quả Workflow Cursor

Thư mục này chứa toàn bộ artifact **evidence-first** sinh bởi Cursor skills.

## Cấu trúc

| Path | Nội dung | Skill |
|------|----------|-------|
| `01-architecture-overview.md` | Kiến trúc tổng quan | `/reverse-engineering-java` |
| `02-module-inventory.md` | Module / Action inventory | RE Phase 9 |
| `03-route-api-inventory.md` | Route & API | RE Phase 2/9 |
| `04-database-analysis.md` | DB config & patterns | RE Phase 5 |
| `05-background-jobs.md` | Batch / SP | RE Phase 0/9 |
| `06-auth-permission-analysis.md` | Auth & RBAC | RE Phase 4/8 |
| `07-screen-route-mapping.md` | JSP ↔ route | RE Phase 6 |
| `08-business-flow-hypotheses.md` | WF candidates | RE Phase 7 |
| `09-external-integrations.md` | Tích hợp ngoài | RE Phase 8 |
| `10-risks-unknowns.md` | Rủi ro & unknowns | RE Phase 7/11 |
| `11-service-inventory.md` | Service list | RE Phase 9 |
| `database/` | Deep DB analysis (spec 11) | RE Phase 5b |
| `workflows/` | WF-XX use case docs | `/generate-workflow-docs` |
| `function-design/` | FD-MODULE-NN docs | `/generate-function-design` |
| `reverse-engineering/<module>/` | Phân tích per-module | RE Phase 1–8 |

## Pipeline

```text
Generate → Cross-reference → Gap Check → Review → Hoàn tất
```

- Gap: `docs/spec/gaps/GAP-*.md`
- Review: `docs/spec/reviews/REV-*.md`

## Chạy workflow mới

```text
/reverse-engineering-java
Scope: <module>. Output vào output/cursor/. Phase 5b + 9 + 9.5.

/generate-workflow-docs
WF cho <use case>. Output: output/cursor/workflows/WF-NN-*.md
```

Chi tiết: [README_CURSOR.md](../../README_CURSOR.md)
