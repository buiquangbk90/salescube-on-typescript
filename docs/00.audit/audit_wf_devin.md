# Audit Report: Bộ Workflow Devin AI vs docs/spec (01–12)

> **Ngày audit:** 2026-06-23  
> **Phạm vi:** 5 workflow tại `.devin/workflows/` đối chiếu với 12 đầu task `docs/spec/01–12`  
> **Hành động sau audit:** Bổ sung step/phase vào workflow `.devin/workflows/*.md` (không đồng bộ `.cursor/skills/`)

---

## 1. Executive Summary

| Chỉ số | Kết quả |
|--------|---------|
| Số workflow được audit | 5 |
| Số spec tasks đối chiếu | 12 |
| Gap nghiêm trọng (CRITICAL) | 4 |
| Gap trung bình (MAJOR) | 8 |
| Gap nhỏ (MINOR) | 7 |
| Spec tasks không được cover bởi workflow nào | 2 (`spec-11`, `spec-12` một phần) |
| Workflow thiếu phase rõ ràng | 3 (`reverse-engineering-java`, `generate-workflow-docs`, `generate-prisma-schema`) |

**Tổng đánh giá:** Bộ workflow hiện tại **đủ cho core flow** (RE → WF → FD → Prisma → Migration) nhưng **thiếu coverage cho batch/stored procedures, DB deep analysis, và business workflow prioritization**. Cần bổ sung 4 step CRITICAL và refine 8 step MAJOR trước khi sử dụng Devin AI cho production reverse-engineering.

---

## 2. Mapping Matrix: Spec Task → Workflow Coverage

| Spec | Nội dung | WF-RE | WF-GenWF | WF-FD | WF-Prisma | WF-Migrate | Đánh giá |
|------|----------|-------|----------|-------|-----------|------------|----------|
| **01** - Module inventory (194 Actions, 13 modules) | RE Phase 1, 2 | ✅ | ✅ Phase 1 | ✅ Phase 1 | ⚠️ Không verify số table | ✅ Phase 1 | **OK** |
| **02** - Entity list (76 entities, 129 tables, field detail) | Phase 5 (Data Access) | ⚠️ | ⚠️ Không explicit | ⚠️ Phase 4 (partial) | ✅ Phase 1–2 | ✅ Phase 4 | **MAJOR gap ở WF-RE** |
| **03** - Business rules (Status/Tax/Cutoff/Fraction) | Phase 7 (Business Rules) | ✅ | ✅ Phase 5–6 | ✅ Phase 3–4 | ❌ Không cover | ✅ Phase 3 | **MINOR: Prisma WF thiếu rule extraction** |
| **04** - Migration map + Characterization Tests | Phase 11 (Review) | ⚠️ Không explicit | ❌ Không có | ⚠️ Mention | ❌ Không có | ✅ Phase 3 (Parity) | **MAJOR: Characterization test thiếu phase riêng** |
| **05** - Screen inventory (212 JSP) | Phase 6 (View/JSP) | ✅ | ⚠️ Brief mention | ⚠️ Phase 2 (list only) | ❌ Không có | ❌ Không có | **MAJOR: JSP screen verify thiếu** |
| **06** - Prisma schema (19 tables target design) | N/A | ❌ | ❌ | ⚠️ Reference | ✅ Phase 3–7 | ✅ Phase 4 | **OK cho Prisma WF** |
| **07** - DB schema (129 tables, DDL) | Phase 5 (Data Access) | ⚠️ Partial | ❌ | ❌ | ✅ Phase 1–2 (Core) | ✅ Phase 4 | **MAJOR: thiếu table-type classification** |
| **08** - API contracts (Action→URL mapping) | Phase 2 (Entry points) | ✅ | ✅ Phase 1 | ✅ Phase 0 (preflight) | ❌ | ✅ Phase 5 | **MINOR: Không cross-verify URL mapping** |
| **09** - Service inventory (106 services) | Phase 4 (Service analysis) | ✅ | ✅ Phase 3 | ✅ Phase 2 | ❌ | ✅ Phase 2 | **OK** |
| **10** - Batch jobs & Stored Procedures | Phase 8 (Runtime) | ⚠️ **Batch chỉ nhắc ngắn** | ❌ **Không có** | ❌ **Không có** | ❌ **Không có** | ❌ **Không có** | **CRITICAL** |
| **11** - DB analysis (5 output files: table-dict, rel-map, ERD, lifecycle, risks) | Phase 5 (Data Access) | ⚠️ **Không sinh 5 output files** | ❌ | ❌ | ⚠️ **Chỉ evidence/model** | ❌ | **CRITICAL** |
| **12** - Business workflow per priority (customer/sales/billing/payment/report/permission) | Phase 9 (Generate docs) | ⚠️ **Không enforce priority** | ⚠️ **Có section nhưng không enforce** | ❌ | ❌ | ❌ | **CRITICAL** |

**Ghi chú:** ✅ = Covered đủ | ⚠️ = Partial/Thiếu | ❌ = Không có

---

## 3. Audit Chi tiết Từng Workflow

---

### 3.1 `reverse-engineering-java.md` (11 phases)

**Mô tả:** Reverse-engineer toàn bộ SalesCube Java → tài liệu kỹ thuật evidence-first.

#### ✅ Điểm mạnh

- Evidence labeling system chi tiết (7 nhãn: `CONFIRMED_BY_CODE`, `CONFIRMED_BY_CONFIG`, `CONFIRMED_BY_DDL`, `INFERRED_FROM_CODE`, `RUNTIME_DEPENDENT`, `UNKNOWN_NEEDS_VERIFICATION`, `POSSIBLY_UNREACHABLE`).
- Scope categories đầy đủ (Phase 1).
- Dependency graph có Mermaid template (Phase 3).
- Business rules extraction có template tốt (Phase 7).
- Gap check + Review checklist đầy đủ (Phase 10–11).

#### ❌ Gap CRITICAL

**GAP-RE-01 (CRITICAL):** Không có phase riêng cho Batch/Stored Procedure analysis.

- **Spec nguồn:** `docs/spec/10-batch-jobs.md` — liệt kê 13+ batch scripts, 5 stored procedures (`SP_UPDATE_CUSTOMER_RANK_SALES.sql`, `SP_UPDATE_PRODUCT_STATUS_CATEGORY_SALES.sql`, `SP_UPDATE_PRODUCT_STOCK_VALUES_SALES.sql`, `SP_UPDATE_STDDEV_WORK_SALES.sql`, `SP_WRITE_LOG.sql`), 40+ SQL scripts.
- **Hiện trạng:** Phase 8 (Runtime Config) chỉ nhắc "Scheduled jobs" và "DB triggers/stored procedures" trong danh sách kiểm tra ngắn, **không có template, không có output file, không có scan method riêng**.
- **Hậu quả:** Devin AI sẽ bỏ qua toàn bộ batch logic (`UpdateCustomerRank`, `UpdateProductStockIndexValues`, `SP_UPDATE_CUSTOMER_RANK_SALES.sql`, etc.).
- **Step cần thêm:** Thêm **Phase 5b – Batch & Stored Procedure Analysis** (sau Phase 5, trước Phase 6).

**GAP-RE-02 (CRITICAL):** Phase 9 không yêu cầu tạo 5 output files của `spec-11`.

- **Spec nguồn:** `docs/spec/11-database_analys.md` — yêu cầu rõ 5 files:
  1. `output/database/table-dictionary.md`
  2. `output/database/relationship-map.md`
  3. `output/database/suspected-erd.mmd`
  4. `output/database/data-lifecycle.md`
  5. `output/database/data-integrity-risks.md`
- **Hiện trạng:** Phase 9 chỉ tạo `output/05-data-access-inventory.md`, không có path nào tương ứng với 5 files trên.
- **Hậu quả:** DB analysis artifact không được sinh, blocker cho migration planning.
- **Step cần thêm:** Thêm **Phase 9b – Database Deep Analysis** hoặc mở rộng Phase 9 với 5 output files đúng theo spec-11.

#### ⚠️ Gap MAJOR

**GAP-RE-03 (MAJOR):** Phase 1 không inventory rõ tenant/instance suffix `_XXXXX`.

- **Spec nguồn:** `docs/spec/02-entity-list.md` — ghi chú rõ "bảng DB thực tế có hậu tố `_XXXXX` là placeholder cho instance/tenant".
- **Hiện trạng:** Workflow không đề cập suffix pattern này, dễ gây nhầm lẫn khi Devin AI đọc DDL.
- **Step cần thêm:** Bổ sung vào Phase 0 (Preflight): "Kiểm tra DDL table naming pattern — có hậu tố instance suffix không? Ghi vào `preflight.md`."

**GAP-RE-04 (MAJOR):** Completion criteria (10 điểm) không mention characterization tests.

- **Spec nguồn:** `docs/spec/04-migration-map.md` — Section 4 "Characterization Test Plan" với 6 test cases CRITICAL/HIGH (tax 8%/10%, rounding 切捨て/四捨五入/切り上げ, cutoff 締処理, keshikomi 消込, GM calculation, rolling balance).
- **Hiện trạng:** Completion criteria của WF-RE không đề cập việc xác định test surface cho characterization tests.
- **Step cần thêm:** Thêm vào Completion Criteria điểm 11: "Characterization test surface (critical business calculations) được liệt kê trong analysis report."

**GAP-RE-05 (MAJOR):** Phase 6 (JSP/View) không yêu cầu đối chiếu với screen inventory.

- **Spec nguồn:** `docs/spec/05-screen-inventory.md` — 212 JSP files được catalog.
- **Hiện trạng:** Phase 6 chỉ yêu cầu phân tích JSP của module đang trace, không so sánh với tổng số JSP đã biết.
- **Step cần thêm:** Thêm bước verify trong Phase 6: "Cross-check JSP files phân tích với `docs/spec/05-screen-inventory.md`. Báo cáo coverage."

---

### 3.2 `generate-workflow-docs.md` (7 phases)

**Mô tả:** Từ Java Action/Service/SQL → WF-XX docs evidence-first.

#### ✅ Điểm mạnh

- Phân loại use case tốt (Phase 1.2).
- Evidence collection có template chi tiết (Phase 2).
- WF template đầy đủ 10 sections (Phase 5).
- Gap check + Review báo cáo coverage (Phase 6–7).
- Suggested processing order theo O2C/P2P (cuối file).
- Provenance labels: `JAVA_CONFIRMED`, `SQL_CONFIRMED`, `DDL_CONFIRMED`, `WF_CONFIRMED`, `INFERRED`, `UNKNOWN`.

#### ❌ Gap CRITICAL

**GAP-WF-01 (CRITICAL):** Không có phase/step cho Batch workflow.

- **Spec nguồn:** `docs/spec/12-bussiness-workflow.md` — yêu cầu rõ "batch jobs, reports, exports and EAD integrations" như một nhóm workflow riêng.
- **Hiện trạng:** "Suggested processing order" Phase 4 nhắc "Batch jobs, reports, exports" nhưng **không có template, không có route/trigger inventory dành riêng cho batch entry**.
- **Hậu quả:** Devin AI sẽ không sinh WF docs cho các batch như `UpdateCustomerRank`, `CloseBillBatch`, `UpdateProductStockIndexValues`.
- **Step cần thêm:** Thêm vào Phase 1.1 (Route Inventory) một phần riêng "Batch Entry Inventory":

```markdown
| Batch Name | Trigger (cron/shell/manual) | Main Class/Script | SP called | Tables affected | Evidence |
|---|---|---|---|---|---|
```

**GAP-WF-02 (CRITICAL):** Business workflow priority order không được enforce theo spec-12.

- **Spec nguồn:** `docs/spec/12-bussiness-workflow.md` — ưu tiên rõ: customer management → sales/order → contract → billing/invoice → payment → reporting/export → user/permission management.
- **Hiện trạng:** "Suggested processing order" trong WF docs chia theo O2C/P2P nhưng **không match priority trong spec-12** và không có cơ chế enforce.
- **Step cần thêm:** Bổ sung vào Phase 0 (Preflight): "Đọc `docs/spec/12-bussiness-workflow.md`. Lập thứ tự ưu tiên workflow theo spec. Ghi vào `_inventory/use-cases.md`."

#### ⚠️ Gap MAJOR

**GAP-WF-03 (MAJOR):** Template WF (Section 9 – Migration Risks) không có entry cho tenant/instance suffix.

- **Spec nguồn:** `docs/spec/02-entity-list.md` — suffix `_XXXXX` là pattern đặc thù cần documented.
- **Hiện trạng:** Migration risks template có RISK-01 (sequence), RISK-02 (no FK), RISK-03 (status), nhưng thiếu risk về table naming/tenant.
- **Step cần thêm:** Thêm RISK-04 vào template: "Table suffix `_XXXXX` — xác nhận tenant/instance mapping strategy."

**GAP-WF-04 (MAJOR):** Phase 2 (Evidence Collection) không yêu cầu đọc `docs/spec/08-api-contracts.md`.

- **Spec nguồn:** `docs/spec/08-api-contracts.md` — reverse-engineered Action-to-URL mapping.
- **Hiện trạng:** Evidence sources list (10 items) không nhắc đến `08-api-contracts.md` như một nguồn cross-verify.
- **Step cần thêm:** Thêm vào Phase 2 "Nguồn cần trace" item 11: "`docs/spec/08-api-contracts.md` — cross-verify URL/route mapping."

**GAP-WF-05 (MAJOR):** `_index.md` update không nằm trong Completion Criteria.

- **Hiện trạng:** Index update được đề cập cuối file nhưng không nằm trong 8 Completion Criteria.
- **Step cần thêm:** Thêm vào Completion Criteria điểm 9: "`_index.md` được cập nhật với workflow mới và confidence level."

---

### 3.3 `generate-function-design.md` (7 phases)

**Mô tả:** Từ WF docs + Java source → FD evidence-first với NestJS/Prisma target design.

#### ✅ Điểm mạnh

- Phân biệt rõ 4 provenance labels (LEGACY_CONFIRMED, TARGET_DECISION, ASSUMPTION, UNKNOWN).
- FD template đầy đủ 8 sections.
- Mapping guide Java→TypeScript chi tiết (Phase 4).
- Soft delete rule và Prisma selector rule rõ ràng.
- Transaction rule với code example.

#### ⚠️ Gap MAJOR

**GAP-FD-01 (MAJOR):** Phase 0 (Preflight) đánh dấu Screen inventory là "Missing" mà không có action để verify.

- **Spec nguồn:** `docs/spec/05-screen-inventory.md` — 212 JSP files được catalog đầy đủ.
- **Hiện trạng:** Preflight template có dòng `Screen inventory / JSP path: docs/spec/05-screen-inventory.md — Missing` nhưng **không có step nào yêu cầu cross-check** số JSP với số FD được sinh.
- **Step cần thêm:** Thêm vào Phase 1 (Function Inventory): "Đối chiếu danh sách JSP trong `docs/spec/05-screen-inventory.md` với Actions đã inventory. Báo cáo số screen không có FD tương ứng."

**GAP-FD-02 (MAJOR):** Không có phase verify business rules từ `docs/spec/03-business-rules.md`.

- **Spec nguồn:** `docs/spec/03-business-rules.md` — 7 nhóm business rules: Status, Tax, Cutoff, Payback, Stock, Transaction Type, Payment Method.
- **Hiện trạng:** Phase 3 (Legacy Behavior) yêu cầu extract business rules nhưng **không yêu cầu cross-check** với danh sách rules đã biết trong spec-03.
- **Step cần thêm:** Thêm vào Phase 3: "Cross-check business rules extracted với `docs/spec/03-business-rules.md`. Đánh dấu rules nào đã cover, rules nào chưa."

**GAP-FD-03 (MAJOR):** Characterization test cases từ `spec-04` không được map vào FD.

- **Spec nguồn:** `docs/spec/04-migration-map.md` — Section 4: 6 test cases CRITICAL/HIGH (tax calculation, rounding, cutoff, keshikomi, GM, rolling balance).
- **Hiện trạng:** FD template không có section nào cho characterization test plan.
- **Step cần thêm:** Thêm **Section 9 – Characterization Test Surface** vào FD template:

```markdown
| Test ID | Business Logic | Legacy Evidence | Priority |
|---------|---------------|-----------------|----------|
| CT-01 | Tính thuế 8%/10% (内税/外税) | `TaxRateService` | CRITICAL |
| CT-02 | Làm tròn (切捨て/四捨五入/切り上げ) | `FractionUtil` | CRITICAL |
```

#### ⚠️ Gap MINOR

**GAP-FD-04 (MINOR):** Naming convention trong FD không có prefix cho batch module.

- **Hiện trạng:** Module prefixes liệt kê `REPORT`, `SETTING` nhưng không có `BATCH`.
- **Step cần thêm:** Thêm `BATCH` vào naming convention table.

**GAP-FD-05 (MINOR):** Phase 0 Preflight không verify `docs/spec/09-service-inventory.md`.

- **Spec nguồn:** `docs/spec/09-service-inventory.md` — 106 services, chia theo sub-package.
- **Step cần thêm:** Thêm vào Preflight checklist: "`docs/spec/09-service-inventory.md` — verify service class count của module."

---

### 3.4 `generate-prisma-schema.md` (8 phases)

**Mô tả:** Từ DDL SQL → Prisma schema models có truy vết evidence.

#### ✅ Điểm mạnh

- DDL parsing rules rất chi tiết (Phase 3: 9 sub-rules cho scalar mapping, precision, TINYINT(1), SEQ_NO, defaults, soft-delete, naming, index, relation).
- `SEQ_MAKER` và `DEL_DATETM` được xử lý đúng — không tự suy diễn.
- Evidence file per table template đầy đủ.
- Validation requirement trước khi merge (Phase 5–6).
- 8 nguyên tắc bắt buộc nghiêm ngặt.

#### ❌ Gap CRITICAL

**GAP-PRISMA-01 (CRITICAL):** Không có phase extract business rules từ DDL constraints.

- **Spec nguồn:** `docs/spec/03-business-rules.md` — nhiều rules embed trong DDL (status codes `"0"/"9"`, tax categories `"0"–"5"`, fraction codes `"0"/"1"/"2"`).
- **Hiện trạng:** Phase 2 (DDL Evidence) chỉ lấy structural info (columns, types, constraints). Không có step nào extract semantic business rules từ ENUM values, DEFAULT values.
- **Hậu quả:** Prisma schema được sinh mà không document business semantics của các field code — mất context khi migration.
- **Step cần thêm:** Thêm vào Phase 2: "Với mỗi ENUM field hoặc constrained field, tra cứu semantic meaning từ `docs/spec/03-business-rules.md`. Ghi vào evidence file."

#### ⚠️ Gap MAJOR

**GAP-PRISMA-02 (MAJOR):** Table inventory không cross-check với `docs/spec/02-entity-list.md`.

- **Spec nguồn:** `docs/spec/02-entity-list.md` — 76 entities, 129 tables, phân loại Master/Transaction/History/Work/Rel.
- **Hiện trạng:** Phase 1 (Table Inventory) tự classify table type từ DDL nhưng **không yêu cầu cross-check** với entity list đã có.
- **Step cần thêm:** Thêm vào Phase 1: "Cross-check bảng inventory với `docs/spec/02-entity-list.md`. Xác nhận 129 tables. Flag bảng chưa có entity class (Work/View/Support tables)."

**GAP-PRISMA-03 (MAJOR):** Không có phase verify tenant/instance suffix naming.

- **Spec nguồn:** `docs/spec/02-entity-list.md` — suffix `_XXXXX` là SalesCube-specific pattern, ảnh hưởng đến `@@map()`.
- **Hiện trạng:** Phase 0 (Preflight) không check DDL table naming pattern.
- **Step cần thêm:** Thêm vào Phase 0: "Xác định table naming convention: có suffix `_XXXXX` không? Document strategy xử lý suffix khi map sang Prisma `@@map()`."

#### ⚠️ Gap MINOR

**GAP-PRISMA-04 (MINOR):** Review checklist (Phase 8) không verify coverage với tổng 129 tables.

- **Hiện trạng:** Review checklist kiểm tra quality của từng model nhưng không yêu cầu đếm tổng model đã sinh so với 129 tables.
- **Step cần thêm:** Thêm vào Phase 8 checklist: "Tổng Prisma model sinh ra: X/129 tables. Missing models documented."

---

### 3.5 `migration-typescript.md` (9 phases)

**Mô tả:** Migrate từng module Java → TypeScript (parity-first, NestJS + Prisma + Next.js).

#### ✅ Điểm mạnh

- Parity matrix là artifact trung tâm (Phase 3) — thiết kế đúng.
- Database mode strategy (LEGACY_DB_ACCESS / NEW_TARGET_DB / CROSS_DB_MIGRATION) rõ ràng (Phase 4).
- Implementation dependency order (Phase 6) đúng: shared → domain → repository → service → controller → test → UI → E2E.
- Completion criteria nghiêm ngặt (không chỉ compile/build pass).
- Characterization test capture qua parity matrix.

#### ⚠️ Gap MAJOR

**GAP-MIG-01 (MAJOR):** Không có phase riêng cho characterization tests (spec-04).

- **Spec nguồn:** `docs/spec/04-migration-map.md` — 6 test cases CRITICAL: tax (8%/10%), rounding (切捨て/四捨五入/切り上げ), cutoff (締処理), keshikomi (消込), GM calculation, rolling balance.
- **Hiện trạng:** Parity matrix (Phase 3) có thể capture các test này nhưng **không có phase tạo characterization test file riêng** trước khi implementation.
- **Step cần thêm:** Thêm **Phase 2b – Characterization Test Plan** (sau Phase 2, trước Phase 3), output: `docs/migration/<module>/05-test-plan.md`.

**GAP-MIG-02 (MAJOR):** Phase 0 Preflight không kiểm tra `docs/spec/12-bussiness-workflow.md`.

- **Hiện trạng:** Preflight check workflow từ `output/workflows/` nhưng không check spec-12 priority order.
- **Hậu quả:** Module migration có thể không theo đúng thứ tự ưu tiên nghiệp vụ.
- **Step cần thêm:** Thêm vào Phase 0: "`docs/spec/12-bussiness-workflow.md` priority check — module này thuộc priority nào? Có dependency module nào cần migrate trước?"

**GAP-MIG-03 (MAJOR):** Không có step cross-check migration với `docs/spec/04-migration-map.md` Section 3.

- **Spec nguồn:** `docs/spec/04-migration-map.md` — Section 2 (Module mapping P1/P2/P3) và Section 3 (DB mapping Legacy→Prisma: 20 tables, e.g. `SalesSlipTrn→SalesOrder`, `Bill→Invoice`).
- **Hiện trạng:** Phase 4 (Data Strategy) xây mapping từ đầu, không cross-check với mapping đã có trong spec.
- **Step cần thêm:** Thêm vào Phase 4: "Cross-check data mapping với `docs/spec/04-migration-map.md` Section 3. Xác nhận entity renaming decisions."

#### ⚠️ Gap MINOR

**GAP-MIG-04 (MINOR):** Output path `docs/migration/` trong workflow khác với `salescube-ts/docs/migration/` trong AGENTS.md.

- **Hiện trạng:** Workflow output ghi `docs/migration/<module>/` nhưng AGENTS.md ghi `salescube-ts/docs/migration/`.
- **Hậu quả:** Devin AI có thể tạo file sai path.
- **Fix:** Chuẩn hóa path trong workflow thành `salescube-ts/docs/migration/<module>/`.

**GAP-MIG-05 (MINOR):** Phase 6 implementation không mention batch/job migration.

- **Hiện trạng:** Implementation order 8 bước không có bước cho batch/scheduler migration.
- **Step cần thêm:** Thêm bước 8b: "Nếu module có batch/job: migrate sang NestJS Schedule hoặc BullMQ. Xác nhận parity với batch legacy."

---

## 4. Cross-workflow Gaps (Yêu cầu không workflow nào cover)

### CROSS-01 (CRITICAL): Không có workflow cho Database Deep Analysis

- **Spec nguồn:** `docs/spec/11-database_analys.md` — yêu cầu 5 output files riêng biệt.
- **Hiện trạng:** Không có workflow nào trong 5 files có phase sinh đủ 5 artifacts:
  - `output/database/table-dictionary.md`
  - `output/database/relationship-map.md`
  - `output/database/suspected-erd.mmd`
  - `output/database/data-lifecycle.md`
  - `output/database/data-integrity-risks.md`
- **Đề xuất:** Tạo workflow mới `generate-database-analysis.md` hoặc thêm Phase 9b vào `reverse-engineering-java.md`.

### CROSS-02 (CRITICAL): Workflow chain không được document rõ

- **Hiện trạng:** 5 workflows hoạt động độc lập, không có file orchestrator mô tả thứ tự: `RE → WF-Docs → FD → Prisma → Migration`.
- **Hậu quả:** Devin AI không biết điều kiện tiên quyết giữa workflows (VD: phải có WF docs trước khi làm FD).
- **Đề xuất:** Tạo `.devin/workflows/_pipeline.md` mô tả pipeline và preconditions.

### CROSS-03 (MAJOR): Glossary không được reference trong bất kỳ workflow nào

- **Spec nguồn:** `docs/spec/glossary.md` — định nghĩa thuật ngữ Japan-specific (締処理, 消込, 受注, 発注, etc.).
- **Hiện trạng:** Không có workflow nào yêu cầu "Đọc glossary trước khi phân tích".
- **Đề xuất:** Thêm vào Phase 0 (Preflight) của mọi workflow: "Tham khảo `docs/spec/glossary.md` cho thuật ngữ Nhật-Việt."

---

## 5. Recommended Actions (Ưu tiên xử lý)

### 🔴 CRITICAL — Xử lý ngay (trước khi chạy Devin AI)

| Action | Workflow | Vị trí |
|--------|---------|--------|
| Thêm Phase 5b: Batch & SP Analysis | `reverse-engineering-java.md` | Sau Phase 5 |
| Thêm Phase 9b: DB Deep Analysis (5 files) | `reverse-engineering-java.md` | Sau Phase 9 |
| Thêm Batch Entry Inventory | `generate-workflow-docs.md` | Phase 1.1 |
| Enforce business workflow priority (spec-12) | `generate-workflow-docs.md` | Phase 0 Preflight |
| Thêm business rule extraction từ DDL | `generate-prisma-schema.md` | Phase 2 |
| Tạo `_pipeline.md` workflow orchestrator | `.devin/workflows/` | File mới |
| Tạo workflow `generate-database-analysis.md` | `.devin/workflows/` | File mới |

### 🟡 MAJOR — Xử lý trong sprint tiếp

| Action | Workflow | Vị trí |
|--------|---------|--------|
| Document tenant suffix `_XXXXX` | `reverse-engineering-java.md` | Phase 0 |
| Thêm characterization test surface vào completion criteria | `reverse-engineering-java.md` | Completion Criteria |
| Cross-verify JSP với screen inventory | `reverse-engineering-java.md` | Phase 6 |
| Thêm `08-api-contracts.md` vào evidence sources | `generate-workflow-docs.md` | Phase 2 |
| Cross-check JSP screen inventory trong FD | `generate-function-design.md` | Phase 1 |
| Cross-check business rules (spec-03) trong FD | `generate-function-design.md` | Phase 3 |
| Thêm Section 9 – Characterization Test Surface vào FD template | `generate-function-design.md` | Phase 5 |
| Cross-check entity list (spec-02) với Prisma inventory | `generate-prisma-schema.md` | Phase 1 |
| Thêm Phase 2b: Characterization Test Plan | `migration-typescript.md` | Sau Phase 2 |
| Cross-check DB mapping (spec-04) | `migration-typescript.md` | Phase 4 |
| Chuẩn hóa output path `salescube-ts/docs/migration/` | `migration-typescript.md` | Output structure |

### 🟢 MINOR — Backlog

| Action | Workflow | Vị trí |
|--------|---------|--------|
| Thêm `BATCH` vào FD naming convention | `generate-function-design.md` | Naming table |
| Thêm RISK-04 (tenant suffix) vào WF template | `generate-workflow-docs.md` | Phase 5 template |
| Verify Prisma model count vs 129 tables | `generate-prisma-schema.md` | Phase 8 review |
| Thêm batch migration vào implementation order | `migration-typescript.md` | Phase 6 |
| Reference `glossary.md` trong mọi Phase 0 | Tất cả 5 workflows | Phase 0 Preflight |
| `_index.md` update vào Completion Criteria | `generate-workflow-docs.md` | Completion Criteria |
| Verify service count (spec-09) trong FD Preflight | `generate-function-design.md` | Phase 0 |

---

## 6. Step Bổ sung Chi tiết (Draft để patch workflow)

### 6.1 Phase 5b – Batch & Stored Procedure Analysis

**Thêm vào `reverse-engineering-java.md` sau Phase 5:**

```markdown
# Phase 5b – Batch & Stored Procedure Analysis

## Mục tiêu

Phân tích các batch script, shell entry points và stored procedures để xác định behavior không thuộc HTTP flow.

## Scan targets

- `SalesCube/DB/batch/salescube_batch/*.sh` — shell triggers
- `SalesCube/DB/batch/salescube_batch/*.sql` — SQL called from shell
- `SalesCube/DB/batch/sp/*.sql` — stored procedures
- Java classes có `implements Job` hoặc `Scheduler` nếu có

## Output

output/reverse-engineering/05b-batch-analysis.md

## Template

| Batch | Trigger | Shell/Class | SP called | Tables (READ) | Tables (WRITE) | Schedule | Confidence | Evidence |
|---|---|---|---|---|---|---|---|---|
| UpdateCustomerRank | shell script | `UpdateCustomerRank.sh` | `SP_UPDATE_CUSTOMER_RANK_SALES.sql` | `SALES_SLIP_TRN`, `CUSTOMER_MST` | `CUSTOMER_MST` (rank update) | UNKNOWN | CONFIRMED_BY_CODE | `batch/salescube_batch/:L...` |

## Bắt buộc document với mỗi SP

- Input parameters
- Output/result set
- Tables READ / WRITE / UPDATE
- Error handling (SIGNAL/RAISE)
- Transaction behavior
- Trigger conditions (shell, application, or DB trigger)
```

---

### 6.2 Phase 9b – Database Deep Analysis

**Thêm vào `reverse-engineering-java.md` sau Phase 9:**

```markdown
# Phase 9b – Database Deep Analysis

## Mục tiêu

Sinh 5 output artifacts theo yêu cầu của docs/spec/11-database_analys.md.

## Output files (bắt buộc)

1. `output/database/table-dictionary.md`
   — Mỗi table: PK, FK, search fields, status flags, soft-delete fields, audit fields, business meaning, source evidence
2. `output/database/relationship-map.md`
   — App-layer relationships (không chỉ DB FK). Gắn `APP_LAYER_ONLY` cho quan hệ không có FK constraint.
3. `output/database/suspected-erd.mmd`
   — Mermaid ERD diagram cho core tables. Không tự thêm FK nếu DDL không confirm.
4. `output/database/data-lifecycle.md`
   — INSERT/UPDATE/DELETE lifecycle của mỗi table
5. `output/database/data-integrity-risks.md`
   — Risks: no FK, SEQ_MAKER app-layer sequence, no unique constraint, mutable history

## Nguyên tắc

- Ưu tiên bảng core transaction: SALES_SLIP_TRN, RO_SLIP_TRN, BILL_TRN, DEPOSIT_SLIP_TRN.
- Mọi quan hệ phải ghi provenance: CONFIRMED_BY_DDL, APP_LAYER_ONLY, INFERRED_FROM_CODE, UNKNOWN.
```

---

### 6.3 Workflow Pipeline Document

**File mới: `.devin/workflows/_pipeline.md`:**

```markdown
# SalesCube Workflow Pipeline

## Thứ tự thực hiện

Phase 1: Reverse Engineering
  Input:    SalesCube/ source code
  Run:      reverse-engineering-java.md (gồm Phase 5b, 9b)
  Output:   output/reverse-engineering/<module>/*, output/database/*
  Done khi: Phase 10 gap check + Phase 11 review pass

Phase 2: Workflow Documentation
  Input:    output/reverse-engineering/<module>/
  Run:      generate-workflow-docs.md
  Output:   output/workflows/WF-XX-*.md
  Precond:  Phase 1 complete

Phase 3: Function Design
  Input:    output/workflows/WF-XX-*.md + Java source
  Run:      generate-function-design.md
  Output:   docs/function-design/FD-<MODULE>-NN-*.md
  Precond:  Phase 2 complete for module

Phase 4: Prisma Schema
  Input:    SalesCube/DB/sql/CREATE.sql + Java entities
  Run:      generate-prisma-schema.md
  Output:   salescube-ts/packages/db/prisma/schema.prisma
  Precond:  Phase 1 complete (data access inventory)
  Note:     Có thể chạy song song Phase 3

Phase 5: TypeScript Migration
  Input:    FD docs + Prisma schema + WF docs
  Run:      migration-typescript.md
  Output:   salescube-ts/apps/, salescube-ts/packages/
  Precond:  Phase 3 + Phase 4 complete for module

## Module Priority (theo docs/spec/12-bussiness-workflow.md)

P1: AUTH → CUSTOMER → PRODUCT → SALES → BILLING → DEPOSIT
P2: RORDER → ESTIMATE → STOCK → REPORT → SETTING
P3: PORDER → PURCHASE → PAYMENT
```

---

## 8. So sánh Devin AI Workflows vs Cursor Skills

### 8.1 Mapping 1-1: Workflow Devin → Cursor Skill

| Devin Workflow (`.devin/workflows/`) | Cursor Skill (`.cursor/skills/`) | Trạng thái đồng bộ |
|--------------------------------------|----------------------------------|---------------------|
| `reverse-engineering-java.md` (11 phases) | `reverse-engineering-java/` | ⚠️ **Cursor đã patch thêm Phase 5b, 9.5** — Devin chưa có |
| `generate-workflow-docs.md` (7 phases) | `generate-workflow-docs/` | ⚠️ **Cursor đã patch Phase 2.5** (spec-12 matrix) — Devin chưa có |
| `generate-function-design.md` (7 phases) | `generate-function-design/` | ✅ Tương đồng, không có diff lớn |
| `generate-prisma-schema.md` (8 phases) | `generate-prisma-schema/` | ⚠️ **Cursor đã patch Phase 5.5** (spec/06 sync) — Devin chưa có |
| `migration-typescript.md` (9 phases) | `migration-typescript/` | ⚠️ **Cursor đã patch Phase 1.5** (migration map maintenance) — Devin chưa có |
| *(không có)* | `check-gap-requirements/` | ❌ **Không tồn tại trong Devin** |
| *(không có)* | `review-workflow-output/` | ❌ **Không tồn tại trong Devin** |
| `_pipeline.md` *(vừa tạo)* | *(không có)* | ⚠️ Chỉ có ở Devin (mới tạo) |

### 8.2 Tính năng chỉ có ở Cursor (không có trong Devin)

| Tính năng | Cursor Skill | Mô tả |
|-----------|-------------|--------|
| **Gap check** | `check-gap-requirements/` | Đối chiếu output với requirement matrix trước review. 4 phases, verdict READY_FOR_REVIEW / NEEDS_COMPLETION / BLOCKED |
| **Review output** | `review-workflow-output/` | Spot-check evidence, verify business rule sources, verdict APPROVED / NEEDS_FIX. Chỉ chạy sau gap check pass |
| **Output index chuẩn AGENT.md** | RE SKILL.md | Cursor map rõ `output/01–11` theo AGENT.md với `→ publish docs/spec/XX` |
| **`docs/spec/_index.md` publish** | RE Phase 9.5 | Cursor tự động sync deliverables vào `docs/spec/` |
| **Spec-12 compliance matrix** | WF Phase 2.5 | Cursor enforce 12 mục checklist per WF theo spec-12 |
| **Spec/06 sync** | Prisma Phase 5.5 | Cursor cập nhật `docs/spec/06-prisma-schema.md` sau mỗi schema change |
| **Migration map maintenance** | Migration Phase 1.5 | Cursor maintain `docs/spec/04-migration-map.md` priority/DB mapping |
| **Gap report files** | `docs/spec/gaps/GAP-NN-*.md` | Cursor tạo file gap report có số thứ tự, severity P0–P3 |
| **Review report files** | `docs/spec/reviews/REV-NN-*.md` | Cursor tạo file review report theo file output |

### 8.3 Tính năng chỉ có ở Devin (không có trong Cursor)

| Tính năng | Devin Workflow | Mô tả |
|-----------|---------------|--------|
| **`_pipeline.md`** orchestrator | `_pipeline.md` *(vừa tạo)* | Định nghĩa thứ tự chạy, preconditions, module priority |
| **Phase detail đầy đủ** | Mọi workflow (800–900 dòng) | Cursor chỉ có SKILL.md ngắn + reference-workflow.md; Devin có full instruction inline |

### 8.4 Phân tích Overlap & Divergence

| Khía cạnh | Devin | Cursor | Verdict |
|-----------|-------|--------|---------|
| **Provenance labels** | 7 nhãn (CONFIRMED_BY_CODE/CONFIG/DDL, INFERRED, RUNTIME_DEPENDENT, UNKNOWN, POSSIBLY_UNREACHABLE) | Giống Devin trong RE; WF dùng JAVA/SQL/DDL_CONFIRMED; FD dùng LEGACY_CONFIRMED/TARGET_DECISION/ASSUMPTION/UNKNOWN | ⚠️ Không hoàn toàn thống nhất — có thể gây nhầm khi đọc cross-tool |
| **Output path** | `docs/migration/<module>/` | `salescube-ts/docs/migration/<module>/` | ❌ **Xung đột** — Devin tạo sai path |
| **Phase numbering** | Sequential (0→11) | Giống Devin nhưng có suffix (5b, 9.5, 2.5, 1.5, 5.5) | ⚠️ Cursor đã thêm phases mà Devin chưa có |
| **Batch analysis** | Không có phase riêng | Cursor RE SKILL.md liệt kê `output/05-background-jobs.md` + Phase 5b | ❌ **Cursor đã patch; Devin chưa** |
| **QA pipeline** | Không có gap check / review phase | 2 skills riêng (check-gap + review) | ❌ **Devin thiếu hoàn toàn QA layer** |
| **Cross-reference enforcement** | Không có | Cursor rules (`03-workflow-pipeline.mdc`) enforce cross-ref | ⚠️ Cursor có cơ chế hơn |

### 8.5 Khuyến nghị Sync

#### 🔴 P0 — Sync ngay để tránh Devin tạo file sai

| Action | Chi tiết |
|--------|---------|
| **Fix output path** | `migration-typescript.md`: đổi `docs/migration/<module>/` → `salescube-ts/docs/migration/<module>/` |
| **Thêm Phase 5b** | `reverse-engineering-java.md`: Batch & SP Analysis (template đã có trong Section 6.1 của audit này) |
| **Thêm Phase 9b** | `reverse-engineering-java.md`: DB Deep Analysis 5 files (template đã có trong Section 6.2) |

#### 🟡 P1 — Sync trong sprint tiếp

| Action | Chi tiết |
|--------|---------|
| **Port gap check concept** | Thêm vào Completion Criteria của mỗi workflow: danh sách checklist tương tự Cursor `check-gap-requirements`. Không cần tạo full skill nhưng phải có self-check list |
| **Port Phase 2.5** | `generate-workflow-docs.md`: thêm spec-12 compliance matrix checklist |
| **Port Phase 5.5** | `generate-prisma-schema.md`: thêm bước sync `docs/spec/06-prisma-schema.md` |
| **Port Phase 1.5** | `migration-typescript.md`: thêm bước maintain `docs/spec/04-migration-map.md` |
| **Chuẩn hóa provenance** | Thống nhất nhãn giữa 2 tool — ưu tiên dùng RE labels (CONFIRMED_BY_CODE/DDL) cho RE phase, JAVA/SQL_CONFIRMED cho WF phase |

#### 🟢 P2 — Nice to have

| Action | Chi tiết |
|--------|---------|
| **Port output numbering** | Devin RE Phase 9 cập nhật output index thành `01–11` theo AGENT.md |
| **Add `docs/spec/` publish step** | Thêm "publish artifacts to `docs/spec/`" cuối Phase 9 của Devin RE |
| **Add review checklist** | Cuối mỗi workflow Devin, thêm self-review checklist tương tự Cursor review skill |

### 8.6 Kết luận So sánh

```
Cursor skills > Devin workflows về:
  ✅ QA layer (gap check + review)
  ✅ Spec publish pipeline
  ✅ Patch coverage (Phase 5b/9.5/2.5/5.5/1.5 đã áp dụng)
  ✅ Output path chuẩn hóa

Devin workflows > Cursor skills về:
  ✅ Workflow detail đầy đủ (full instruction, không cần reference-workflow.md)
  ✅ Pipeline orchestrator (_pipeline.md vừa tạo)
  ✅ Standalone — không phụ thuộc IDE
```

**Khuyến nghị tổng thể:** Dùng **Cursor** làm primary tool cho daily development workflow (có QA layer). Dùng **Devin** cho automated batch tasks sau khi sync P0 gaps. Không nên để 2 tool diverge quá — mỗi patch Cursor cần có corresponding PR cho Devin.

---

## 7. Kết luận

| Chỉ số | Giá trị |
|--------|---------|
| Tổng gap phát hiện | 19 |
| CRITICAL | 4 (fix trước khi chạy Devin) |
| MAJOR | 8 (fix trong sprint tiếp) |
| MINOR | 7 (backlog) |
| Workflow mới cần tạo | 2 (`generate-database-analysis.md`, `_pipeline.md`) |
| Phases cần thêm vào workflow hiện có | 4 (Phase 5b, 9b vào RE; Phase 2b vào Migration; batch section vào WF-Docs) |

**Ưu tiên tuyệt đối:** GAP-RE-01 (Batch/SP Analysis) và CROSS-01 (DB Deep Analysis) phải được xử lý trước vì chúng liên quan đến 2 spec tasks hoàn toàn không có workflow cover (`spec-10`, `spec-11`).

---

*Audit thực hiện bằng cách đọc trực tiếp source files. Evidence từ:*
- `Confirmed by code:` `.devin/workflows/reverse-engineering-java.md` (11 phases)
- `Confirmed by code:` `.devin/workflows/generate-workflow-docs.md` (7 phases)
- `Confirmed by code:` `.devin/workflows/generate-function-design.md` (7 phases)
- `Confirmed by code:` `.devin/workflows/generate-prisma-schema.md` (8 phases)
- `Confirmed by code:` `.devin/workflows/migration-typescript.md` (9 phases)
- `Confirmed by code:` `docs/spec/01–12` (toàn bộ 12 files)
- `Confirmed by code:` `AGENTS.md`, `.devin/rules/agent-rules.md`
