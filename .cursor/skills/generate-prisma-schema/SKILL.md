---
name: generate-prisma-schema
description: Sinh Prisma models từ CREATE.sql evidence-first — DDL_CONFIRMED, không tự suy FK/soft-delete/autoincrement. Validate prisma format. Dùng khi map MySQL legacy sang Prisma.
disable-model-invocation: true
---

# Generate Prisma Schema

> **Workflow đầy đủ:** [reference-workflow.md](reference-workflow.md) (port từ `.devin/workflows/generate-prisma-schema.md`)

## Mục tiêu

`CREATE.sql` = source of truth. Java entity/SQL chỉ bổ sung ngữ cảnh — **không ghi đè DDL**.

## Provenance

`DDL_CONFIRMED` | `JAVA_CONFIRMED` | `SQL_CONFIRMED` | `TARGET_DECISION` | `ASSUMPTION` | `UNKNOWN`

## Output

```text
salescube-ts/packages/db/prisma/
├── schema.prisma
├── schema.generated.prisma    # candidate fragment
└── mappings/
    ├── _index.md, _open-questions.md
    ├── _evidence/<TABLE>.md
    └── _reports/<module>-schema-review.md
```

## Phases

| Phase | Nội dung |
|-------|----------|
| 0 | Prisma preflight — provider, target mode mirror/redesign |
| 1 | Table inventory từ DDL |
| 2 | DDL evidence per table |
| 3 | SQL → Prisma mapping rules |
| 4 | Candidate model generation |
| 5 | Merge, `prisma format` + `prisma validate` |
| **5.5** | **Spec 06 doc sync** → `docs/spec/06-prisma-schema.md` |
| 6 | Migration policy (chỉ khi user yêu cầu rõ) |
| 7 | Gap check |
| 8 | Review |

## Quy tắc cứng

- Không `@@ignore` cho soft delete
- Không `TINYINT(1)` → Boolean tự động
- Không `SEQ_NO` → `@default(autoincrement())` nếu DDL không confirm
- Không `@relation` khi không có FK constraint (ghi comment app-layer FK)
- Không `prisma migrate dev` lên legacy DB không có strategy

## Tham chiếu

- `docs/spec/02-entity-list.md`, `docs/spec/07-db-schema.md`, `docs/spec/06-prisma-schema.md`
- `docs/spec/_index.md` — verify `07` pass gap trước khi cite DDL từ spec
