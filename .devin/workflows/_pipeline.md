---
description: Workflow orchestrator — thứ tự chạy, preconditions và module priority cho toàn bộ SalesCube reverse-engineering & migration pipeline.
---

# SalesCube Workflow Pipeline

> **Mục đích:** Định nghĩa thứ tự bắt buộc giữa 5 workflows, điều kiện tiên quyết, và module priority.  
> **Không chạy workflow theo thứ tự tùy ý** — mỗi workflow phụ thuộc output của workflow trước.

---

## Pipeline Overview

```
SalesCube/ (legacy Java source)
    │
    ▼
[1] reverse-engineering-java        ← Phase 0–11 + 5b + 9b
    │   output/reverse-engineering/<module>/
    │   output/database/* (5 files)
    │   output/01–11 docs
    │
    ├──────────────────────────────────────────────┐
    ▼                                              ▼
[2] generate-workflow-docs          [4] generate-prisma-schema
    │   output/workflows/WF-XX-*.md     │   salescube-ts/packages/db/prisma/schema.prisma
    │                                   │
    ▼                                   │
[3] generate-function-design            │
    │   docs/function-design/FD-*.md   │
    │                                   │
    └──────────────┬────────────────────┘
                   ▼
              [5] migration-typescript
                  salescube-ts/apps/
                  salescube-ts/packages/
```

---

## Phase 1 — Reverse Engineering

**Workflow:** `reverse-engineering-java.md`

| Item | Giá trị |
|------|---------|
| **Input** | `SalesCube/` legacy source (Java, JSP, SQL, DDL, batch) |
| **Output** | `output/reverse-engineering/<module>/` (00–08) |
| **Output** | `output/01–11` summary docs |
| **Output** | `output/database/` (5 files theo spec-11) |
| **Output** | `output/reverse-engineering/05b-batch-analysis.md` |
| **Precondition** | Không có — đây là bước đầu tiên |
| **Done khi** | Phase 10 (gap check) pass + Phase 11 (review) report sinh xong |

### Checklist trước khi chuyển sang Phase 2

- [ ] `output/reverse-engineering/<module>/00-scope.md` tồn tại
- [ ] `output/reverse-engineering/<module>/01-entry-points.md` tồn tại
- [ ] `output/reverse-engineering/<module>/08-analysis-report.md` có Overall confidence
- [ ] `output/reverse-engineering/05b-batch-analysis.md` tồn tại (hoặc ghi rõ "No batch for module")
- [ ] `output/database/table-dictionary.md` tồn tại
- [ ] `output/database/relationship-map.md` tồn tại
- [ ] `output/database/suspected-erd.mmd` tồn tại
- [ ] `output/database/data-lifecycle.md` tồn tại
- [ ] `output/database/data-integrity-risks.md` tồn tại
- [ ] `output/workflows/_open-questions.md` được cập nhật

---

## Phase 2 — Workflow Documentation

**Workflow:** `generate-workflow-docs.md`

| Item | Giá trị |
|------|---------|
| **Input** | `output/reverse-engineering/<module>/` (từ Phase 1) |
| **Input** | `docs/spec/12-bussiness-workflow.md` (priority order) |
| **Output** | `output/workflows/WF-XX-<name>.md` |
| **Output** | `output/workflows/_index.md`, `_inventory/`, `_evidence/`, `_reports/` |
| **Precondition** | **Phase 1 complete** cho module (08-analysis-report.md tồn tại) |
| **Done khi** | Phase 6 (gap check) + Phase 7 (review) pass, `_index.md` updated |

### Checklist trước khi chuyển sang Phase 3

- [ ] Tất cả confirmed entry points của module có WF doc tương ứng
- [ ] `output/workflows/_index.md` được cập nhật
- [ ] Batch entry points có WF doc hoặc ghi rõ "Batch — xem 05b-batch-analysis.md"
- [ ] Priority order theo `docs/spec/12-bussiness-workflow.md` được ghi trong `_inventory/use-cases.md`

---

## Phase 3 — Function Design

**Workflow:** `generate-function-design.md`

| Item | Giá trị |
|------|---------|
| **Input** | `output/workflows/WF-XX-*.md` (từ Phase 2) |
| **Input** | Java Action/Service source |
| **Input** | `docs/spec/05-screen-inventory.md`, `docs/spec/08-api-contracts.md` |
| **Output** | `docs/function-design/FD-<MODULE>-NN-<name>.md` |
| **Output** | `docs/function-design/_index.md`, `_inventory/`, `_evidence/` |
| **Precondition** | **Phase 2 complete** cho module |
| **Done khi** | Phase 6 (gap check) + Phase 7 (review) pass |

### Checklist trước khi chuyển sang Phase 5

- [ ] Mỗi WF-XX trong Phase 2 có ít nhất 1 FD tương ứng
- [ ] `docs/function-design/_index.md` được cập nhật
- [ ] Characterization test surface được ghi trong FD (Section 9)

> **Note:** Phase 3 và Phase 4 có thể chạy song song vì không phụ thuộc nhau.

---

## Phase 4 — Prisma Schema

**Workflow:** `generate-prisma-schema.md`

| Item | Giá trị |
|------|---------|
| **Input** | `SalesCube/DB/sql/createtable/CREATE.sql` (DDL source of truth) |
| **Input** | `output/database/table-dictionary.md` (từ Phase 1) |
| **Input** | `docs/spec/02-entity-list.md` (cross-check 129 tables) |
| **Output** | `salescube-ts/packages/db/prisma/schema.prisma` |
| **Output** | `salescube-ts/packages/db/prisma/mappings/` |
| **Precondition** | **Phase 1 complete** (data access inventory + database deep analysis) |
| **Done khi** | Phase 7 (validation) pass + Phase 8 (review) report sinh xong |

### Checklist trước khi chuyển sang Phase 5

- [ ] `prisma validate` hoặc `prisma format` pass không lỗi
- [ ] Tổng model sinh ra được ghi: X/129 tables
- [ ] `SEQ_MAKER` tables có note rõ allocation strategy
- [ ] Tenant suffix `_XXXXX` được document trong `mappings/_index.md`

> **Note:** Phase 4 có thể chạy song song với Phase 3.

---

## Phase 5 — TypeScript Migration

**Workflow:** `migration-typescript.md`

| Item | Giá trị |
|------|---------|
| **Input** | `docs/function-design/FD-<MODULE>-*.md` (từ Phase 3) |
| **Input** | `salescube-ts/packages/db/prisma/schema.prisma` (từ Phase 4) |
| **Input** | `output/workflows/WF-XX-*.md` (từ Phase 2) |
| **Input** | `docs/spec/04-migration-map.md` (priority + DB mapping) |
| **Output** | `salescube-ts/apps/api/src/modules/<module>/` |
| **Output** | `salescube-ts/apps/web/src/app/<module>/` |
| **Output** | `salescube-ts/docs/migration/<module>/` |
| **Precondition** | **Phase 3 AND Phase 4 complete** cho module |
| **Done khi** | Parity matrix: tất cả high-impact items `Verified`; test pass |

### Checklist trước khi đánh dấu module DONE

- [ ] `salescube-ts/docs/migration/<module>/02-parity-matrix.md` không còn item `Unknown` high-impact
- [ ] API integration tests pass
- [ ] `docs/spec/04-migration-map.md` Section 2 priority được xác nhận
- [ ] `_decisions.md` ghi tất cả `Exception` items (intent khác legacy)
- [ ] Batch migration (nếu có): NestJS Schedule hoặc BullMQ parity documented

---

## Module Priority

> Nguồn: `docs/spec/12-bussiness-workflow.md`

| Priority | Modules | Lý do |
|----------|---------|-------|
| **P1** | AUTH → CUSTOMER → PRODUCT → SALES → BILLING → DEPOSIT | Core O2C, critical business flow |
| **P2** | RORDER → ESTIMATE → STOCK → REPORT → SETTING | Secondary O2C + operations |
| **P3** | PORDER → PURCHASE → PAYMENT | P2P flow, depends on P1 |

### Dependency order (trong cùng priority)

```
AUTH (phải trước tất cả — MENU_ID / RBAC)
    └─► CUSTOMER
    └─► PRODUCT
         └─► SALES (phụ thuộc CUSTOMER + PRODUCT)
              └─► BILLING (phụ thuộc SALES)
                   └─► DEPOSIT (phụ thuộc BILLING)
```

---

## Quy tắc bắt buộc

1. **Không bỏ qua Phase** — mỗi phase có completion criteria riêng, không được skip.
2. **Không bắt đầu Phase 2 nếu Phase 1 chưa có** `08-analysis-report.md`.
3. **Không bắt đầu Phase 5 nếu chưa có** FD docs (Phase 3) **và** Prisma schema (Phase 4).
4. **Không coi `compile pass` là done** — phải có parity matrix + test evidence.
5. **Mọi gap/unknown phải ghi vào** `output/workflows/_open-questions.md` — không dừng batch để hỏi.
6. **Không sửa bất kỳ file nào trong** `SalesCube/` (legacy source).

---

## Cross-references

| Document | Mục đích |
|----------|---------|
| `docs/spec/glossary.md` | Thuật ngữ Nhật-Việt — đọc trước khi bắt đầu bất kỳ phase nào |
| `docs/spec/03-business-rules.md` | Status/Tax/Cutoff rules — reference trong RE Phase 7, FD Phase 3 |
| `docs/spec/04-migration-map.md` | Module priority P1/P2/P3 + DB mapping 20 tables |
| `docs/spec/12-bussiness-workflow.md` | Workflow priority order |
| `output/workflows/_open-questions.md` | Unresolved items across all phases |
| `.devin/rules/agent-rules.md` | Quy tắc bất biến — luôn áp dụng |
