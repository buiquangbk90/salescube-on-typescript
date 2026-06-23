---
name: generate-function-design
description: Sinh Function Design evidence-first (FD-MODULE-NN) từ WF + Java source + target NestJS/Prisma/Next.js. Provenance LEGACY_CONFIRMED/TARGET_DECISION/ASSUMPTION/UNKNOWN. Dùng khi thiết kế chức năng migrate SalesCube.
disable-model-invocation: true
---

# Generate Function Design

> **Workflow đầy đủ:** [reference-workflow.md](reference-workflow.md) (port từ `.devin/workflows/generate-function-design.md`)

## Mục tiêu

Sinh FD cho từng function/màn hình — tách bạch **legacy behavior có evidence** và **target design**. Không trình bày suy luận target như hành vi legacy đã xác nhận.

## Output

**Cursor workflow (mặc định):**

```text
output/cursor/function-design/
├── _index.md
├── _open-questions.md
├── _inventory/<module>.md
├── _evidence/FD-<MODULE>-<NN>-<name>.md
└── FD-<MODULE>-<NN>-<kebab-name>.md
```

**Mirror (tùy chọn):** `docs/function-design/` — khi publish sang spec bundle.

**Module prefix:** `AUTH`, `CUST`, `PROD`, `RORDER`, `SALES`, `BILL`, `DEPOSIT`, `PORDER`, `PURCHASE`, `PAYMENT`, `STOCK`, `REPORT`, `SETTING`

## Provenance (bắt buộc)

| Nhãn | Ý nghĩa |
|------|---------|
| `LEGACY_CONFIRMED` | Java, SQL, DDL, WF, JSP |
| `TARGET_DECISION` | Quyết định TypeScript mới |
| `ASSUMPTION` | Suy luận chưa đủ evidence |
| `UNKNOWN` | Không tìm thấy trong source |

## Phases (thực hiện tuần tự)

| Phase | Nội dung |
|-------|----------|
| 0 | Repository preflight — xác minh paths |
| 1 | Function inventory — scan Action methods thực tế |
| 2 | Evidence collection → `_evidence/FD-*.md` |
| 3 | Legacy behavior extraction |
| 4 | Target design mapping (NestJS/Zod/Prisma) |
| 5 | Generate `FD-<MODULE>-<NN>-*.md` |
| 6 | Gap check (skill `/check-gap-requirements`) |
| 7 | Review (skill `/review-workflow-output`) |

## Quy tắc cứng

- Không map mỗi Action method → 1 REST endpoint tự động
- Không map `DEL_DATETM` → soft delete nếu chưa xác minh behavior
- Không giả định optimistic lock / audit / duplicate-submit
- Không hỏi user giữa batch — ghi `Open Questions`
- Dùng `findFirst` không phải `findUnique` khi filter `deletedAt`
- Transaction `prisma.$transaction()` khi ≥2 writes

## Tham chiếu

- Template FD 11 sections: [reference-workflow.md](reference-workflow.md) § Phase 5
- WF nguồn: `/generate-workflow-docs`
- Rules: `.cursor/rules/05-agent-rules.mdc`
