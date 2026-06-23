# SalesCube — Devin AI Workflows

> **Hướng dẫn sử dụng bộ workflow cho Devin AI.**  
> Mỗi workflow là một file Markdown trong thư mục này. Devin AI đọc file và thực thi theo từng phase.  
> Không sửa bất kỳ file nào trong `SalesCube/` (legacy source).

---

## Danh sách Workflow

| File | Mục đích | Khi nào dùng |
|------|---------|--------------|
| [`_pipeline.md`](_pipeline.md) | **Orchestrator** — thứ tự chạy, preconditions, module priority | Đọc trước tất cả |
| [`reverse-engineering-java.md`](reverse-engineering-java.md) | RE legacy Java → tài liệu kỹ thuật evidence-first | Bắt đầu với module mới |
| [`generate-workflow-docs.md`](generate-workflow-docs.md) | WF-XX docs từ Java Action/Service/SQL | Sau RE |
| [`generate-function-design.md`](generate-function-design.md) | FD-MODULE-NN docs từ WF + Java source | Sau WF docs |
| [`generate-prisma-schema.md`](generate-prisma-schema.md) | Prisma schema từ CREATE.sql | Sau RE (song song với FD) |
| [`migration-typescript.md`](migration-typescript.md) | Migrate module Java → TypeScript parity-first | Sau FD + Prisma |

---

## Pipeline Nhanh

```
[1] reverse-engineering-java   →  output/, output/database/
        ↓
[2] generate-workflow-docs     →  output/workflows/WF-XX-*.md
        ↓                              ↓ (song song)
[3] generate-function-design   →  docs/function-design/FD-*.md
[4] generate-prisma-schema     →  salescube-ts/packages/db/prisma/schema.prisma
        ↓ (sau khi [3] và [4] xong)
[5] migration-typescript       →  salescube-ts/apps/, salescube-ts/packages/
```

> Xem chi tiết input/output/precondition của từng phase trong [`_pipeline.md`](_pipeline.md).

---

## Thứ tự Module (Priority)

| Priority | Modules | Ghi chú |
|----------|---------|---------|
| **P1** | AUTH → CUSTOMER → PRODUCT → SALES → BILLING → DEPOSIT | Core O2C — làm trước |
| **P2** | RORDER → ESTIMATE → STOCK → REPORT → SETTING | Secondary O2C |
| **P3** | PORDER → PURCHASE → PAYMENT | P2P flow |

**AUTH phải luôn được RE và migrate trước** vì MENU_ID/RBAC là dependency của mọi module.

---

## Phase Index (tất cả workflows)

### `reverse-engineering-java.md`

| Phase | Nội dung |
|-------|----------|
| 0 | Preflight — xác minh paths, framework, DDL |
| 1 | Module scope & reachability |
| 2 | Entry point & route discovery |
| 3 | Component & dependency graph (Mermaid) |
| 4 | Action/Service/transaction analysis |
| 5 | SQL, DDL & data access |
| **5b** | **Batch & SP analysis** → `output/reverse-engineering/05b-batch-analysis.md` |
| 6 | JSP & client-side logic |
| 7 | Business rules, status & side effects |
| 8 | Runtime configuration |
| 9 | Generate `output/01–11` docs |
| **9b** | **Database deep analysis** → `output/database/` (5 files bắt buộc) |
| **9c** | **Spec bundle publish** → `docs/spec/01–10` |
| 10 | Gap check |
| 11 | Review |

### `generate-workflow-docs.md`

| Phase | Nội dung |
|-------|----------|
| 0 | Repository preflight |
| 1 | Route & use-case inventory |
| 2 | Evidence collection |
| **2.5** | **Spec-12 compliance matrix** — enforce priority order |
| 3 | Trace Route → Action → Service → SQL |
| 4 | Workflow modeling (Mermaid) |
| 5 | Generate `WF-XX-*.md` |
| 6 | Gap check |
| 7 | Review |

### `generate-function-design.md`

| Phase | Nội dung |
|-------|----------|
| 0 | Preflight |
| 1 | Function inventory |
| 2 | Evidence collection |
| 3 | Legacy behavior extraction |
| 4 | Target design mapping (NestJS/Zod/Prisma) |
| 5 | Generate `FD-MODULE-NN-*.md` |
| 6 | Gap check |
| 7 | Review |

### `generate-prisma-schema.md`

| Phase | Nội dung |
|-------|----------|
| 0 | Prisma preflight |
| 1 | Table inventory từ DDL |
| 2 | DDL evidence per table |
| 3 | SQL → Prisma mapping rules |
| 4 | Candidate model generation |
| 5 | Merge, `prisma format` + `prisma validate` |
| **5.5** | **Spec/06 doc sync** → `docs/spec/06-prisma-schema.md` |
| 6 | Migration policy |
| 7 | Gap check |
| 8 | Review |

### `migration-typescript.md`

| Phase | Nội dung |
|-------|----------|
| 0 | Migration preflight — DB mode |
| 1 | Module scope & use-case inventory |
| **1.5** | **Migration map maintenance** → `docs/spec/04-migration-map.md` |
| 2 | Legacy evidence baseline |
| 3 | **Parity matrix** (bắt buộc trước code) |
| 4 | Data & schema strategy |
| 5 | Target API contract |
| 6 | Implement: shared → domain → repo → service → controller |
| 7 | Next.js UI |
| 8 | Characterization & verification tests |
| 9 | Parity review & cutover readiness |

---

## Output Locations

| Thư mục | Chứa gì |
|---------|---------|
| `output/` | RE docs (01–11), database deep analysis, workflows |
| `output/database/` | 5 DB analysis files (spec-11) |
| `output/workflows/` | WF-XX-*.md + _index, _inventory, _evidence, _reports |
| `output/reverse-engineering/<module>/` | 00-scope → 08-analysis-report |
| `docs/spec/` | Published deliverables (01–10) + requirement baselines (11, 12) |
| `docs/function-design/` | FD-MODULE-NN-*.md |
| `salescube-ts/packages/db/prisma/` | schema.prisma + mappings/ |
| `salescube-ts/docs/migration/` | Migration docs (00-scope → 06-report) per module |
| `salescube-ts/apps/` | NestJS API + Next.js Web code |

> **Không tạo file ngoài các thư mục trên** (theo `.devin/rules/agent-rules.md`).

---

## Provenance Labels (chuẩn)

### RE / WF Workflows
| Nhãn | Ý nghĩa |
|------|---------|
| `CONFIRMED_BY_CODE` | Bằng chứng trực tiếp từ Java/JSP/SQL |
| `CONFIRMED_BY_CONFIG` | Bằng chứng từ Struts/Seasar/web config |
| `CONFIRMED_BY_DDL` | Bằng chứng từ DDL/ALTER script |
| `INFERRED_FROM_CODE` | Suy luận hợp lý, không trace đầy đủ |
| `RUNTIME_DEPENDENT` | Cần runtime để xác minh |
| `UNKNOWN_NEEDS_VERIFICATION` | Không đủ source |
| `POSSIBLY_UNREACHABLE` | Tìm thấy nhưng không có caller xác nhận |

### FD / Migration Workflows
| Nhãn | Ý nghĩa |
|------|---------|
| `LEGACY_CONFIRMED` | Có bằng chứng từ Java/SQL/DDL/WF |
| `TARGET_DECISION` | Quyết định kiến trúc TypeScript mới |
| `ASSUMPTION` | Suy luận chưa đủ evidence |
| `UNKNOWN` | Không tìm thấy trong source |
| `PARITY_VERIFIED` | Đã kiểm thử, behavior khớp legacy |

---

## Quy tắc Bắt buộc (tóm tắt)

1. **Không sửa** bất kỳ file nào trong `SalesCube/`
2. **Không bịa** business rules — mọi claim phải có `file:line` evidence
3. **Không dừng** giữa batch để hỏi — ghi vào `_open-questions.md`
4. **Không skip phase** — mỗi phase có completion criteria riêng
5. **Không map** tự động: `Action → REST`, `DEL_DATETM → soft-delete`, `SEQ_MAKER → autoincrement()`
6. **Không đánh dấu** module complete nếu chỉ build/compile pass — cần parity matrix + tests
7. **Tham khảo** `docs/spec/glossary.md` cho thuật ngữ Nhật-Việt trước khi phân tích

---

## Cross-references Quan trọng

| Document | Vai trò |
|----------|---------|
| `AGENT.md` | Output locations chuẩn, 10 loại output |
| `CLAUDE.md` | Domain, module, O2C/P2P, rủi ro migration |
| `.devin/rules/agent-rules.md` | Quy tắc bất biến — luôn áp dụng |
| `docs/spec/glossary.md` | Thuật ngữ Nhật-Việt |
| `docs/spec/03-business-rules.md` | Status/Tax/Cutoff rules |
| `docs/spec/04-migration-map.md` | Module priority P1/P2/P3, DB mapping |
| `docs/spec/12-bussiness-workflow.md` | Workflow priority order (12 domains) |
| `docs/00.audit/audit_wf_devin.md` | Audit report — gap analysis của bộ workflow này |

---

## Lịch sử thay đổi

| Ngày | Thay đổi |
|------|---------|
| 2026-06-23 | Tạo `_pipeline.md` orchestrator |
| 2026-06-23 | Thêm Phase 5b (Batch/SP) vào `reverse-engineering-java.md` |
| 2026-06-23 | Thêm Phase 9b (DB Deep Analysis) vào `reverse-engineering-java.md` |
| 2026-06-23 | Thêm Phase 9c (Spec Bundle Publish) vào `reverse-engineering-java.md` |
| 2026-06-23 | Thêm Phase 2.5 (Spec-12 Matrix) vào `generate-workflow-docs.md` |
| 2026-06-23 | Thêm Phase 5.5 (Spec/06 Sync) vào `generate-prisma-schema.md` |
| 2026-06-23 | Thêm Phase 1.5 (Migration Map) vào `migration-typescript.md` |
| 2026-06-23 | Fix output path `docs/migration/` → `salescube-ts/docs/migration/` trong `migration-typescript.md` |
| 2026-06-23 | Cập nhật output index Phase 9 theo AGENT.md trong `reverse-engineering-java.md` |
