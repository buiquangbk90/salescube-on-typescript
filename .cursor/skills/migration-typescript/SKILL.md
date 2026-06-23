---
name: migration-typescript
description: Migrate module SalesCube Java→TypeScript parity-first (NestJS+Next.js+Prisma). Parity matrix, characterization tests, TARGET_DECISION documented. Theo CLAUDE.md — không đổi behavior trước khi verify.
disable-model-invocation: true
---

# Migration TypeScript

> **Workflow đầy đủ:** [reference-workflow.md](reference-workflow.md) (port từ `.devin/workflows/migration-typescript.md`)

## Mục tiêu

Tái hiện **behavior legacy có kiểm chứng** — không chỉ dịch code. Mọi khác biệt target ghi `TARGET_DECISION`.

## Provenance

`LEGACY_CONFIRMED` | `TARGET_DECISION` | `ASSUMPTION` | `UNKNOWN` | `PARITY_VERIFIED`

## Output docs

```text
salescube-ts/docs/migration/
├── _index.md, _open-questions.md, _decisions.md
└── <module>/
    ├── 00-scope.md
    ├── 01-evidence.md
    ├── 02-parity-matrix.md      # artifact quan trọng nhất
    ├── 03-api-contract.md
    ├── 04-data-mapping.md
    ├── 05-test-plan.md
    └── 06-migration-report.md
```

## Phases

| Phase | Nội dung |
|-------|----------|
| 0 | Migration preflight — DB mode LEGACY_DB / NEW_TARGET / CROSS_DB |
| 1 | Module scope & use-case inventory |
| **1.5** | **Migration map maintenance** → `docs/spec/04-migration-map.md` |
| 2 | Legacy evidence baseline |
| 3 | **Parity matrix** (bắt buộc trước code core) |
| 4 | Data & schema strategy |
| 5 | Target API contract |
| 6 | Implement: shared → domain → repo → service → controller → UI |
| 7 | Next.js UI |
| 8 | Characterization & verification tests |
| 9 | Parity review & cutover readiness |
| — | Gap check + Review trên code + docs |

## Quy tắc cứng

- Không map `SEQ_MAKER` → autoincrement() tự động
- Không global soft-delete middleware từ `DEL_DATETM`
- Không `@Public()` / mock khi service đã có
- Không đánh dấu complete khi chỉ build pass — cần parity verified
- Implement order: API contract ổn định **trước** UI

## Tham chiếu

- `docs/function-design/FD-*.md`, `output/cursor/workflows/WF-*.md`
- `docs/spec/04-migration-map.md`, `docs/spec/99-salescube-typescript-migration-plan.md`
- `.cursor/rules/02-typescript-migration.mdc`
