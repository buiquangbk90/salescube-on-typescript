---
description: Migrate từng module SalesCube Java (Struts/Seasar2) sang TypeScript theo chiến lược parity-first: Next.js + NestJS + Prisma, có evidence, characterization tests và kiểm soát cutover.
---

# Workflow: Migrate SalesCube Java Module sang TypeScript (Parity-first)

## Mục tiêu

Chuyển đổi từng module SalesCube từ Java (Struts/Seasar2/S2JDBC) sang TypeScript trong monorepo:

```text
salescube-ts/
  apps/
    api/          # NestJS + TypeScript
    web/          # Next.js App Router + shadcn/ui
  packages/
    db/           # Prisma schema + migrations
    domain/       # Business/domain logic thuần TypeScript
    shared/       # Types, constants, utilities
```

Mục tiêu migration là:

- Giữ **behavior nghiệp vụ legacy** trước khi tối ưu/refactor.
- Tạo traceability từ legacy source đến target implementation.
- Không tự suy diễn endpoint, transaction, ID generation, relation, soft-delete hoặc exception behavior.
- Có characterization tests và parity verification trước khi đánh dấu module hoàn thành.
- Ghi rõ mọi target decision, assumption và unknown item.

> Migration không chỉ là “dịch Java sang TypeScript”. Đây là quá trình tái hiện behavior có kiểm chứng, sau đó mới được phép cải tiến.

---

## Quy ước Provenance

| Nhãn | Ý nghĩa |
|---|---|
| `LEGACY_CONFIRMED` | Có bằng chứng trực tiếp từ Java/SQL/DDL/JSP/WF |
| `TARGET_DECISION` | Quyết định kiến trúc hoặc API mới |
| `ASSUMPTION` | Suy luận hợp lý nhưng chưa đủ evidence |
| `UNKNOWN` | Không có đủ source để xác minh |
| `PARITY_VERIFIED` | Đã kiểm thử/chứng minh hành vi target khớp legacy |

## Quy tắc bắt buộc

1. Không coi mỗi Java Action method là một REST endpoint.
2. Không map `SEQ_MAKER` thành `autoincrement()` nếu DDL/Java không xác nhận.
3. Không tự thêm Prisma relation từ app-layer FK.
4. Không tự áp global soft-delete middleware chỉ vì có `DEL_DATETM`.
5. Không dùng `@updatedAt` chỉ vì legacy có timestamp.
6. Không đổi HTTP semantics, validation semantics hoặc error semantics mà không ghi `TARGET_DECISION`.
7. Không refactor business logic trong cùng PR migration nếu chưa có parity test.
8. Không migrate UI trước khi xác định API contract và domain behavior.
9. Không thay đổi schema/migration của DB legacy khi mục tiêu là truy cập database hiện hữu.
10. Không đánh dấu module hoàn thành khi chỉ compile/build pass; phải có parity matrix và test evidence.

---

## Output structure

```text
salescube-ts/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── db/
│   ├── domain/
│   └── shared/
└── docs/
    └── migration/
        ├── _index.md
        ├── _open-questions.md
        ├── _decisions.md
        ├── _reports/
        └── <module>/
            ├── 00-scope.md
            ├── 01-evidence.md
            ├── 02-parity-matrix.md
            ├── 03-api-contract.md
            ├── 04-data-mapping.md
            ├── 05-test-plan.md
            └── 06-migration-report.md
```

Nếu project có cấu trúc tài liệu khác, ưu tiên convention hiện hữu.

---

# Phase 0 – Migration Preflight

## Mục tiêu

Xác minh target architecture, database mode và source trước khi tạo code.

## Kiểm tra bắt buộc

- Repository root và branch hiện tại.
- Tình trạng working tree.
- Legacy Java Action/Service/Form/SQL/JSP paths.
- Existing workflow and function-design docs.
- Prisma provider và schema hiện có.
- Target database mode:
  - `LEGACY_DB_ACCESS`
  - `NEW_TARGET_DB`
  - `CROSS_DB_MIGRATION`
  - `UNKNOWN`
- Existing NestJS module convention.
- Existing Next.js route/layout convention.
- Auth/permission implementation hiện có.
- Error response convention hiện có.
- Logging/audit convention hiện có.
- Test framework và CI commands.
- Feature flag/cutover capability nếu có.

## Output

```markdown
# Preflight: <Module>

| Item | Value | Status |
|---|---|---|
| Legacy Action | `.../InputRoSlipAction.java` | Found |
| Legacy Service | `.../RoSlipService.java` | Found |
| Workflow docs | `output/cursor/workflows/WF-03-receive-order.md` | Found |
| FD docs | `docs/function-design/FD-RORDER-*.md` | Partial |
| Prisma schema | `packages/db/prisma/schema.prisma` | Found |
| Database mode | `LEGACY_DB_ACCESS` | Confirmed |
| Auth guard | `apps/api/.../auth.guard.ts` | Found |
| Test command | `pnpm test` | Found |
```

Nếu database mode là `UNKNOWN`, không được tạo migration hoặc thay đổi ID strategy.

---

# Phase 1 – Module Scope & Use-case Inventory

## Mục tiêu

Chia migration theo use case nghiệp vụ, không theo số lượng Java class.

## Cách thực hiện

1. Đọc workflow inventory và Action route inventory.
2. Liệt kê use case của module:
   - list/search
   - detail/view
   - create
   - update
   - cancel/status transition
   - import/export
   - batch/integration
3. Liệt kê legacy source tương ứng.
4. Phân loại mức độ rủi ro.
5. Chọn phạm vi migration nhỏ nhất có thể kiểm thử end-to-end.

## Output

```text
docs/migration/<module>/00-scope.md
```

Template:

```markdown
# Scope: <Module>

## In scope

| Use Case | Legacy Entry | Target Capability | Risk | Status |
|---|---|---|---|---|
| Create receive order | `InputRoSlipAction.register()` | POST API + form | High | Planned |
| Search receive order | `InputRoSlipAction.index()` | list API + list page | Medium | Planned |

## Out of scope

| Item | Reason |
|---|---|
| CSV export | Migrate after core transaction parity |
| Batch interface | Depends on external EAD behavior |

## Definition of Done

- [ ] Parity matrix complete
- [ ] API contract approved/generated
- [ ] Domain/service tests pass
- [ ] API integration tests pass
- [ ] UI critical path passes
- [ ] Migration report completed
```

---

# Phase 1.5 – Migration Map Maintenance

## Mục tiêu

Giữ `docs/spec/04-migration-map.md` đồng bộ khi scope module hoặc priority thay đổi.

## Khi nào chạy

- Sau Phase 1 scope inventory (module mới)
- Sau parity matrix xác định priority shift
- Khi thêm characterization test CRITICAL/HIGH

## Cập nhật bắt buộc

| Section spec 04 | Nguồn |
|-----------------|-------|
| §2 Module Mapping | `00-scope.md` + FD/WF inventory |
| §3 Database Mapping | Prisma models + `02-entity-list.md` |
| §4 Characterization Test Plan | `05-test-plan.md` parity risks |

## Quy tắc

1. Ghi `TARGET_DECISION` cho tên module/API TypeScript mới.
2. Không đổi legacy mapping đã `LEGACY_CONFIRMED` trừ khi có evidence mới.
3. Cập nhật `docs/spec/_index.md` nếu priority module thay đổi.

---

# Phase 2 – Legacy Evidence & Behavior Baseline

## Mục tiêu

Tạo baseline behavior trước khi viết TypeScript.

## Nguồn cần đọc

1. Workflow docs trong `output/cursor/workflows/`.
2. Function Design docs trong `docs/function-design/`.
3. Java Action, base Action và interceptor/filter.
4. Java Service + helper methods.
5. Form/DTO/entity classes.
6. Named SQL, SQL templates và S2JDBC calls.
7. DDL/ALTER scripts.
8. JSP, JavaScript, validation messages.
9. Existing test cases/logs/sample data nếu có.

## Output

```text
docs/migration/<module>/01-evidence.md
```

Template:

```markdown
# Legacy Evidence: <Module>

| Area | Legacy Source | Finding | Provenance |
|---|---|---|---|
| Entry | `InputRoSlipAction.register()` | Submit receive order | LEGACY_CONFIRMED |
| Permission | `BaseAction.checkMenu()` | MENU_ID.RORDER_INPUT required | LEGACY_CONFIRMED |
| Validation | `InputRoSlipForm.validate()` | customer code required | LEGACY_CONFIRMED |
| Business rule | `RoSlipService.validateCredit()` | block when credit exceeded | LEGACY_CONFIRMED |
| DB write | `RoSlipService.register()` | header/detail/history writes | LEGACY_CONFIRMED |
| SQL | `RoSlip.sql` | active records filter | SQL_CONFIRMED |
| Response | `return "complete.jsp"` | success forward | LEGACY_CONFIRMED |
```

## Evidence rule

Ưu tiên anchor:

```text
RoSlipService.register() → validateCredit() → insertHeader() → lines 110-215
```

Không chỉ ghi tên file.

---

# Phase 3 – Build Parity Matrix

## Mục tiêu

Đây là artifact quan trọng nhất. Không bắt đầu implementation core logic nếu parity matrix chưa đủ.

## Output

```text
docs/migration/<module>/02-parity-matrix.md
```

Template:

```markdown
# Parity Matrix: <Module>

| ID | Legacy Behavior | Legacy Evidence | Target Design | Target Location | Status |
|---|---|---|---|---|---|
| PAR-01 | Customer code required | `Form.validate()` | Zod required rule | `receive-order.schema.ts` | Planned |
| PAR-02 | MENU_ID required | `BaseAction.checkMenu()` | Permission guard | `permission.guard.ts` | Planned |
| PAR-03 | Create header + details + history atomically | `Service.register()` | Prisma transaction | `receive-order.service.ts` | Planned |
| PAR-04 | Error message `errors.credit.limit` | `ServiceException` | 422 `CREDIT_LIMIT_EXCEEDED` | error mapper | Target Decision |
| PAR-05 | Forward complete JSP | Action response | JSON success + Next.js success route | API/web | Target Decision |
```

## Status values

| Status | Meaning |
|---|---|
| `Planned` | Chưa implement |
| `Implemented` | Có code target |
| `Verified` | Test xác minh target behavior |
| `Exception` | Có chủ đích khác legacy, phải có decision |
| `Unknown` | Thiếu evidence |
| `Blocked` | Chưa thể làm do dependency |

## Parity rule

- Tất cả behavior high-impact phải đạt `Verified`.
- Mọi `Exception` phải có record trong `_decisions.md`.
- Mọi `Unknown` high-impact phải có record trong `_open-questions.md`.

---

# Phase 4 – Data & Schema Strategy

## Mục tiêu

Xác định schema mapping và data ownership trước khi code service.

## Quy tắc database mode

### A. LEGACY_DB_ACCESS

NestJS/Prisma truy cập database legacy hiện hữu.

- Không tự chạy `prisma migrate dev`.
- Prisma schema phải phản ánh physical schema.
- Không đổi PK/type/default để “đẹp hơn”.
- Không thêm relation khi không có FK/target decision.
- Các compatibility layer phải ở repository/service.

### B. NEW_TARGET_DB

Target database mới.

- Prisma schema có thể redesign.
- Mọi sai khác với legacy phải ghi `TARGET_DECISION`.
- Cần data migration/cutover plan riêng.

### C. CROSS_DB_MIGRATION

Ví dụ MySQL legacy → PostgreSQL target.

- Không xem đây là Prisma schema generation đơn thuần.
- Phải có mapping kiểu dữ liệu, ETL/backfill, reconciliation, rollback/cutover strategy.

## Output

```text
docs/migration/<module>/04-data-mapping.md
```

Template:

```markdown
# Data Mapping: <Module>

| Legacy Table / Column | Target Prisma Model / Field | Mapping | Provenance | Notes |
|---|---|---|---|---|
| `RO_SLIP_TRN.SEQ_NO` | `ReceiveOrder.sequenceNo` | keep scalar PK | LEGACY_CONFIRMED | allocated by SEQ_MAKER |
| `RO_SLIP_TRN.DEL_DATETM` | `deletedAt` | nullable datetime | LEGACY_CONFIRMED | filter policy handled at repository |
| `RO_SLIP_TRN.CUSTOMER_CD` | `customerCode` | scalar reference | LEGACY_CONFIRMED | no DB FK |
```

## Mandatory safety rules

### `SEQ_MAKER`

Do not automatically map to:

```prisma
id Int @default(autoincrement())
```

Use this only when DDL confirms identity/auto increment or target decision explicitly changes allocation policy.

### `DEL_DATETM`

Do not create global Prisma middleware automatically.

Decide per table:

- default active-record filtering,
- audit/history inclusion,
- restore behavior,
- physical delete behavior,
- report behavior.

### App-layer foreign key

Keep scalar field unless actual DB FK or a documented target relation decision exists.

### Multiple writes

If legacy behavior writes header/detail/history/stock/ledger together, target implementation must use one transaction or document intentional divergence.

---

# Phase 5 – Target API Contract

## Mục tiêu

Thiết kế API theo use case, không theo method name.

## Output

```text
docs/migration/<module>/03-api-contract.md
```

Template:

```markdown
# API Contract: <Module>

| Use Case | Method | Target Endpoint | Permission | Legacy Entry | Provenance |
|---|---|---|---|---|---|
| Search orders | GET | `/api/receive-orders` | `RORDER_VIEW` | `Action.index()` | TARGET_DECISION |
| Create order | POST | `/api/receive-orders` | `RORDER_INPUT` | `Action.register()` | TARGET_DECISION |
| Cancel order | POST | `/api/receive-orders/:id/cancel` | `RORDER_CANCEL` | `Action.cancel()` | TARGET_DECISION |
```

## API mapping rules

| Legacy method type | Target API candidate |
|---|---|
| Screen list/search | `GET /resources` |
| Detail | `GET /resources/:id` |
| Create | `POST /resources` |
| Update | `PATCH /resources/:id` |
| Cancel/status action | `POST /resources/:id/<action>` |
| Export | `GET /resources/export` |
| AJAX validation | validation endpoint or submit validation |
| Screen-only navigation | no standalone API |
| Internal helper | private service method |
| Batch | command/worker/job endpoint only if needed |

## Error mapping rule

Separate legacy error behavior and target HTTP behavior.

```markdown
| Legacy behavior | Target HTTP behavior | Provenance |
|---|---|---|
| `ServiceException(errors.credit.limit)` | 422 `CREDIT_LIMIT_EXCEEDED` | TARGET_DECISION |
| lock exception | 409 `VERSION_CONFLICT` | TARGET_DECISION |
```

Do not claim status codes existed in legacy unless source proves it.

---

# Phase 6 – Implement in Dependency Order

## Implementation order

1. Shared constants/types/error codes.
2. Prisma model/repository compatibility layer.
3. Pure domain rules in `packages/domain`.
4. NestJS application service/orchestration.
5. Controller + permission/validation.
6. API tests.
7. Next.js page/UI.
8. E2E/critical-path verification.
9. Documentation and migration status update.

## 6.1 Shared package

Location:

```text
packages/shared/src/
```

Include:

- shared types.
- permission constants.
- error code constants.
- date/money utility.
- mapping constants.
- no database access.
- no HTTP framework dependency.

## 6.2 Domain package

Location:

```text
packages/domain/src/<module>/
```

Domain package should contain:

- pure business rules.
- domain error types.
- calculation logic.
- state transition decisions.
- interfaces/ports, when useful.

Do not directly couple pure rules to NestJS decorators or React components.

## 6.3 Repository / persistence layer

Location according to current project convention, for example:

```text
apps/api/src/modules/<module>/repositories/
```

Responsibilities:

- Prisma queries.
- table/model-specific filtering.
- mapping persistence records to domain inputs.
- transaction participation.
- no controller concerns.

## 6.4 NestJS application service

Location:

```text
apps/api/src/modules/<module>/<module>.service.ts
```

Responsibilities:

- orchestration.
- transaction boundary.
- call repository/domain rules.
- authorization context where needed.
- audit/history writes.
- external integration invocation.
- return application DTO.

## 6.5 Controller

Location:

```text
apps/api/src/modules/<module>/<module>.controller.ts
```

Responsibilities:

- HTTP routing.
- input parsing/validation.
- permission guard/decorator.
- HTTP response serialization.
- no embedded business logic.

Example structure:

```typescript
@Controller('receive-orders')
@UseGuards(AuthGuard, PermissionGuard)
export class ReceiveOrdersController {
  constructor(private readonly service: ReceiveOrdersService) {}

  @Post()
  @RequirePermission(PERMISSION.RECEIVE_ORDER_CREATE)
  async create(
    @Body() dto: CreateReceiveOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.create(dto, user);
  }
}
```

> Endpoint and permission names are target decisions unless mapped from legacy evidence.

## 6.6 Transaction rule

Use `prisma.$transaction()` for dependent writes:

- header + detail.
- main table + history.
- sales + stock movement.
- billing + ledger/deposit allocation.
- status update + audit event.

```typescript
return this.prisma.$transaction(async (tx) => {
  const header = await this.repository.createHeader(tx, input);

  await this.repository.createDetails(tx, header.id, input.details);

  await this.repository.insertHistory(tx, {
    entityId: header.id,
    action: 'CREATE',
    userId: user.id,
  });

  return header;
});
```

Do not silently widen/narrow transaction scope relative to legacy; document it.

---

# Phase 7 – Next.js UI Migration

## Mục tiêu

UI được xây sau API/domain contract ổn định.

## Location

```text
apps/web/src/app/(dashboard)/<module>/
```

## Requirements

- List/search page.
- Detail/form page.
- Server/client component boundary theo convention project.
- `react-hook-form` + Zod resolver nếu project đã chọn.
- shadcn/ui theo design system hiện có.
- Validation messages map từ target error codes.
- Permission-based UI visibility chỉ là UX; API vẫn phải enforce permission.
- Preserve operationally important legacy behavior:
  - default search conditions,
  - pagination/sorting,
  - required fields,
  - confirmation steps,
  - warning dialogs,
  - status-based disabled controls,
  - print/export behavior.

## UI parity checklist

- [ ] Fields and defaults mapped.
- [ ] Required/optional behavior mapped.
- [ ] Search/filter behavior mapped.
- [ ] Error presentation mapped.
- [ ] Permission-restricted actions hidden/disabled appropriately.
- [ ] Status transition controls mapped.
- [ ] Keyboard/operational shortcuts documented if critical.
- [ ] Legacy screen-only behavior intentionally retained or recorded as exception.

---

# Phase 8 – Characterization & Verification Tests

## Mục tiêu

Dùng tests để chứng minh target behavior, không chỉ kiểm tra code coverage.

## Output

```text
docs/migration/<module>/05-test-plan.md
```

## Test layers

### Domain unit tests

Verify:

- calculations.
- validation decisions.
- state transitions.
- business rule boundaries.
- error codes.

### Repository integration tests

Verify:

- query conditions.
- soft-delete behavior per table.
- transaction rollback.
- sequence allocation behavior.
- history/audit persistence.
- lock/concurrency behavior if legacy has it.

### API integration tests

Verify:

- permission checks.
- request validation.
- success response.
- error response mapping.
- idempotency/double-submit handling if required.
- status action endpoints.

### UI/E2E tests

Verify critical user journeys:

- search → detail.
- create/update.
- cancel/status change.
- validation failure.
- permission denial.
- high-risk module flow.

## Parity test format

```markdown
| PAR ID | Legacy scenario | Target test | Expected | Status |
|---|---|---|---|---|
| PAR-01 | Missing customer code blocked | API test | 422 validation error | Verified |
| PAR-03 | Header/detail/history all saved | integration test | all committed or all rolled back | Verified |
```

## Golden dataset rule

For high-risk modules, prepare a controlled dataset with:

- valid cases.
- boundary cases.
- cancelled/deleted records.
- duplicate/submitted cases.
- historical records.
- permission variants.

Where feasible, compare legacy and target outcomes against the same input dataset.

---

# Phase 9 – Parity Review & Cutover Readiness

## Mandatory review

Before marking a module complete:

- Read parity matrix.
- Read changed code.
- Run tests.
- Review diff.
- Update migration documentation.
- Re-check unresolved questions.

## Completion checklist

### Behavior

- [ ] Every high-impact legacy rule is `PARITY_VERIFIED`.
- [ ] Validation behaviors are verified.
- [ ] Permission behavior is verified.
- [ ] Status transitions are verified.
- [ ] Error behavior differences are approved target decisions.
- [ ] Audit/history side effects are verified.
- [ ] Sequence/ID behavior is verified.
- [ ] Soft-delete behavior is verified per table.

### Data

- [ ] Prisma models match intended database mode.
- [ ] No accidental migration against legacy DB.
- [ ] All multi-write operations use reviewed transactions.
- [ ] App-layer relations are not incorrectly enforced as DB FKs.
- [ ] Index/query behavior is adequate for high-volume paths.

### Code quality

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Unit/integration tests pass.
- [ ] API tests pass.
- [ ] E2E critical path passes where applicable.
- [ ] No dead legacy compatibility code without reason.
- [ ] Source references/comments are present for non-obvious migrated rules.

### Operations

- [ ] Logging/audit behavior defined.
- [ ] Feature flag or rollback strategy documented if module is released incrementally.
- [ ] Monitoring/error alerting defined for high-risk workflows.
- [ ] Migration report completed.

## Output

```text
docs/migration/<module>/06-migration-report.md
```

Template:

```markdown
# Migration Report: <Module>

## Summary

| Item | Result |
|---|---|
| Use cases migrated | X/Y |
| Parity items verified | X/Y |
| Open questions | N |
| Target exceptions | N |
| Test status | Passed / Failed |
| Release readiness | Ready / Blocked |

## Target Decisions

| ID | Decision | Reason | Impact |
|---|---|---|---|
| TD-01 | JSON API replaces JSP forward | Target architecture | Medium |

## Known Differences

| Legacy | Target | Reason | Approval |
|---|---|---|---|
| JSP success forward | JSON + client route | API architecture | Pending / Approved |

## Release / Rollback Notes

- Feature flag:
- Rollback procedure:
- Data reconciliation:
- Monitoring:
```

---

# Open Questions & Decisions

## Open questions

Create/update:

```text
docs/migration/_open-questions.md
```

```markdown
| ID | Module | Question | Proposed Default | Impact | Status |
|---|---|---|---|---|---|
| OQ-RORDER-01 | receive-order | Is SEQ_MAKER allocation inside same transaction? | Keep same transaction until confirmed | High | Open |
```

## Target decisions

Create/update:

```text
docs/migration/_decisions.md
```

```markdown
| ID | Module | Decision | Legacy Difference | Reason | Approval |
|---|---|---|---|---|---|
| TD-RORDER-01 | receive-order | Use POST /api/receive-orders | Legacy Action route differs | REST convention | Proposed |
```

---

# Migration Progress Update

Update:

```text
docs/spec/99-salescube-typescript-migration-plan.md
```

Recommended status:

| Status | Meaning |
|---|---|
| `Not started` | No inventory/evidence |
| `Discovery` | Evidence and scope in progress |
| `Designed` | Parity matrix/API/data mapping ready |
| `Implementing` | Code in progress |
| `Verifying` | Tests/parity review in progress |
| `Ready for release` | Completion checklist passed |
| `Released` | Production/cutover complete |
| `Blocked` | Dependency or high-impact unknown |

Example:

```markdown
| Module | Status | Use cases | Parity | Open questions | Notes |
|---|---|---:|---:|---:|---|
| Receive order | Verifying | 4/5 | 31/35 | 2 | Export out of scope |
```

---

# Suggested migration order

## Foundation

1. Auth/login/session.
2. Permission and menu authorization.
3. Shared master data: user, department, category.

## Core masters

4. Customer master.
5. Supplier master.
6. Product master.

## Order-to-cash

7. Receive order.
8. Sales slip.
9. Billing close.
10. Deposit entry.

## Procure-to-pay

11. Purchase order.
12. Purchase receipt.
13. Payment close.

## Inventory & integrations

14. Stock adjustment/movement.
15. Import EC orders.
16. Export/report/batch/EAD integration.

> Migrate a thin vertical slice first: one low-to-medium risk use case that includes UI → API → DB → test pipeline. Do not start all layers/modules in parallel before the migration pattern is proven.

---

# Completion criteria

A module is complete only when:

1. Scope is defined by coherent use case.
2. Legacy evidence is documented.
3. Parity matrix is complete.
4. High-impact parity items are verified by tests.
5. Database mode and mapping are explicit.
6. API differences are documented as target decisions.
7. UI critical flows are verified.
8. Open questions and decisions are updated.
9. Migration report and migration plan are updated.
10. Release/cutover strategy is documented for released modules.
