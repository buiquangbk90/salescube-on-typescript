---
description: Từ WF docs + Java source, sinh Function Design có truy vết evidence legacy và quyết định target cho từng function/màn hình SalesCube TypeScript. Stack target: NestJS + Prisma + Next.js 14.
---

# Workflow: Generate & Review Function Design từ SalesCube Legacy

## Mục tiêu

Sinh file Function Design (FD) cho từng function/màn hình của SalesCube TypeScript, kết hợp:

- **Legacy behavior đã xác nhận**: workflow, Java Action/Service, SQL, DDL, JSP.
- **Target design**: NestJS Controller/Service, Prisma, Zod, API contract, transaction, test cases.
- **Truy vết nguồn**: phân biệt rõ nội dung có bằng chứng với assumption hoặc quyết định thiết kế mới.

> Không được trình bày suy luận target như một hành vi đã được xác nhận từ legacy.

---

## Quy ước Provenance

Mọi rule, mapping, API design, hoặc hành vi quan trọng phải có một trong các nhãn sau:

| Nhãn | Ý nghĩa |
|---|---|
| `LEGACY_CONFIRMED` | Có bằng chứng trực tiếp từ Java, SQL, DDL, WF hoặc JSP |
| `TARGET_DECISION` | Quyết định thiết kế mới cho hệ thống TypeScript |
| `ASSUMPTION` | Suy luận hợp lý nhưng chưa có đủ bằng chứng |
| `UNKNOWN` | Không tìm được bằng chứng trong source hiện có |

### Quy tắc bắt buộc

1. Không biến `ASSUMPTION` thành `LEGACY_CONFIRMED`.
2. Không tự tạo business rule nếu không có evidence.
3. Không dừng batch để hỏi user. Ghi vấn đề vào `Open Questions`.
4. Không tự giả định một Java Action method luôn tương đương một REST API endpoint.
5. Không tự map `DEL_DATETM` thành soft delete nếu chưa xác minh behavior trong Java/SQL.
6. Không tự giả định mọi function có optimistic locking, audit history hoặc duplicate-submit protection.

---

## Output location

```text
docs/function-design/
├── _index.md
├── _open-questions.md
├── _inventory/
│   └── <module>.md
├── _evidence/
│   └── FD-<MODULE>-<NN>-<kebab-name>.md
└── FD-<MODULE>-<NN>-<kebab-name>.md
```

Ví dụ:

```text
docs/function-design/FD-RORDER-01-create-receive-order.md
```

---

## Naming convention

| Module prefix | Module |
|---|---|
| `AUTH` | Login / Auth |
| `CUST` | Customer master |
| `PROD` | Product master |
| `SUPP` | Supplier master |
| `RORDER` | Receive order (受注) |
| `SALES` | Sales slip (売上) |
| `BILL` | Bill closing (請求締め) |
| `DEPOSIT` | Deposit entry (入金) |
| `PORDER` | Purchase order (発注) |
| `PURCHASE` | Purchase receipt (仕入) |
| `PAYMENT` | Payment closing (支払締め) |
| `STOCK` | Stock management (在庫) |
| `REPORT` | Reports / exports |
| `SETTING` | System settings |

---

# Phase 0 – Repository Preflight

Trước khi phân tích hoặc sinh FD, xác minh các path và source có tồn tại.

## Kiểm tra bắt buộc

- Branch hiện tại.
- Repository root.
- Java Action source path.
- Java Service source path.
- DDL / CREATE.sql path.
- Workflow docs path.
- API contract path.
- Screen inventory / JSP path.
- `agent-rules.md`.
- Prisma schema target, nếu đã tồn tại.
- Target NestJS module convention, nếu đã tồn tại.

## Output

Ghi vào log tóm tắt:

```markdown
## Preflight Result

| Item | Path / Value | Status |
|---|---|---|
| Java Action source | `SalesCube/WEB/SalesCube/src/main/java/.../action` | Found |
| Java Service source | `SalesCube/WEB/SalesCube/src/main/java/.../service` | Found |
| DDL | `SalesCube/DB/sql/CREATE.sql` | Found |
| Workflow docs | `output/cursor/workflows/` | Found |
| API contracts | `docs/spec/08-api-contracts.md` | Found |
| Screen inventory | `docs/spec/05-screen-inventory.md` | Missing |
| Prisma schema | `packages/db/prisma/schema.prisma` | Found |
```

Nếu source thiếu, vẫn tiếp tục nhưng phải ghi nhận confidence thấp hơn.

---

# Phase 1 – Function Inventory

## Mục tiêu

Không được sinh FD toàn module bằng cách đoán pattern `index/input/register/edit/cancel`.

Phải scan Action class thực tế để tạo inventory trước.

## Cách thực hiện

1. Tìm tất cả Action class thuộc module.
2. Liệt kê public action methods.
3. Tìm URL mapping, JSP/forward/redirect, service calls.
4. Phân loại method:
   - `LIST_SEARCH`
   - `DETAIL`
   - `CREATE`
   - `UPDATE`
   - `CANCEL_OR_STATUS`
   - `EXPORT`
   - `AJAX_VALIDATION`
   - `SCREEN_NAVIGATION`
   - `BATCH`
   - `INTERNAL_HELPER`
5. Đề xuất FD tương ứng.
6. Không sinh API riêng cho `SCREEN_NAVIGATION` hoặc `INTERNAL_HELPER` nếu không có logic nghiệp vụ độc lập.

## Output

Tạo file:

```text
docs/function-design/_inventory/<module>.md
```

Template:

```markdown
# Function Inventory: <Module>

| Legacy Action | Method | Legacy URL | JSP / Forward | Service Calls | Type | Proposed FD | Status |
|---|---|---|---|---|---|---|---|
| ReceiveOrderAction | index | `/receiveOrder/index` | `index.jsp` | `findList()` | LIST_SEARCH | FD-RORDER-01 | Planned |
| ReceiveOrderAction | input | `/receiveOrder/input` | `input.jsp` | `findDetail()` | DETAIL | FD-RORDER-02 | Planned |
| ReceiveOrderAction | register | `/receiveOrder/register` | `complete.jsp` | `registerOrder()` | CREATE | FD-RORDER-03 | Planned |
| ReceiveOrderAction | cancel | `/receiveOrder/cancel` | redirect list | `cancelOrder()` | CANCEL_OR_STATUS | FD-RORDER-04 | Planned |
```

---

# Phase 2 – Evidence Collection

## Nguồn cần đọc song song

1. `output/cursor/workflows/WF-XX-<module>.md`
2. Java Action class tương ứng.
3. Java Service class(es) liên quan.
4. SQL query / entity SQL liên quan.
5. DDL bảng liên quan từ `CREATE.sql`.
6. `docs/spec/08-api-contracts.md`
7. `docs/spec/05-screen-inventory.md`
8. JSP / form class / DTO nếu tồn tại.
9. `agent-rules.md`.

## Evidence file

Tạo file tạm:

```text
docs/function-design/_evidence/FD-<MODULE>-<NN>-<kebab-name>.md
```

Template:

```markdown
# Evidence: FD-<MODULE>-<NN> <Function Name>

## Sources

| Source Type | File | Relevance |
|---|---|---|
| Workflow | `output/cursor/workflows/WF-XX-<module>.md` | Business flow |
| Action | `.../ReceiveOrderAction.java` | Entry point, permission, request binding |
| Service | `.../ReceiveOrderService.java` | Rules, transaction, DB side effects |
| SQL | `.../ReceiveOrder.sql` | Query conditions |
| DDL | `CREATE.sql` | Table/column constraints |
| JSP | `.../input.jsp` | Form fields / screen behavior |

## Extracted Legacy Evidence

| Category | Finding | Provenance | Evidence Anchor |
|---|---|---|---|
| Permission | `MENU_ID.RORDER_INPUT` required | LEGACY_CONFIRMED | `ReceiveOrderAction.register()` |
| Input | `customerCd`, `orderDate`, `details[]` | LEGACY_CONFIRMED | `ReceiveOrderForm` |
| Table Read | `M_CUSTOMER`, `M_PRODUCT` | LEGACY_CONFIRMED | `ReceiveOrderService.register()` |
| Table Write | `T_RECEIVE_ORDER`, `T_RECEIVE_ORDER_DETAIL` | LEGACY_CONFIRMED | `ReceiveOrderService.register()` |
| Error | `errors.credit.limit` | LEGACY_CONFIRMED | `validateCreditLimit()` |
```

## Evidence anchor rule

Không chỉ ghi `Class.java:LL` nếu có thể.

Ưu tiên format:

```text
ReceiveOrderService.register() → validateCreditLimit() → lines 142-169
```

Nếu có Git branch/commit, thêm vào evidence metadata.

---

# Phase 3 – Legacy Behavior Extraction

## Mục tiêu

Chỉ trích xuất hành vi được chứng minh từ legacy. Chưa sinh NestJS/Prisma code ở phase này.

## Nội dung cần trích xuất

- Entry point / URL / HTTP method nếu xác định được.
- Actor, role, `MENU_ID`.
- Input fields và binding source.
- Validation field-level và cross-field.
- Business rules.
- Status transitions.
- Tables read/write.
- Side effects.
- Export / batch behavior.
- Error messages / exception / redirect handling.
- Audit/history behavior.
- Delete/cancel behavior.

## Bảng bắt buộc

```markdown
## Legacy Behavior

| ID | Category | Behavior | Provenance | Evidence |
|---|---|---|---|---|
| BR-01 | Business Rule | Không cho tạo đơn khi khách hàng bị khóa | LEGACY_CONFIRMED | `CustomerService.isActive()` |
| VAL-01 | Validation | `customerCd` required | LEGACY_CONFIRMED | `ReceiveOrderForm.validate()` |
| PERM-01 | Permission | Yêu cầu `MENU_ID.RORDER_INPUT` | LEGACY_CONFIRMED | `ReceiveOrderAction.register()` |
| DBR-01 | DB Read | Đọc M_CUSTOMER theo customer code | LEGACY_CONFIRMED | `findCustomer()` |
| DBW-01 | DB Write | Insert T_RECEIVE_ORDER | LEGACY_CONFIRMED | `registerOrder()` |
```

---

# Phase 4 – Target Design Mapping

## Mục tiêu

Thiết kế TypeScript target dựa trên evidence legacy, nhưng tách bạch với legacy behavior.

## Mapping guide

| Legacy concept | Target candidate | Provenance |
|---|---|---|
| Action public method | REST endpoint, screen operation hoặc service method | TARGET_DECISION |
| Service method | NestJS `@Injectable` service method | TARGET_DECISION |
| Java form / DTO validation | Zod schema hoặc class-validator | TARGET_DECISION |
| `MENU_ID` check | Guard + `@RequirePermission()` | TARGET_DECISION |
| `ServiceException` | Domain exception / `HttpException` mapping | TARGET_DECISION |
| `UnabledLockException` | `ConflictException` (409), nếu có evidence lock | TARGET_DECISION |
| `SEQ_MAKER` | Database-generated ID hoặc explicit sequence strategy | TARGET_DECISION |
| `*_HIST` insert | Explicit audit write trong transaction | TARGET_DECISION |

## API classification

| Legacy method type | Target implementation |
|---|---|
| List/search | `GET /resources` |
| Detail | `GET /resources/:id` |
| Create | `POST /resources` |
| Update | `PATCH /resources/:id` |
| Cancel/status transition | `POST /resources/:id/cancel` hoặc domain action endpoint |
| CSV/PDF export | `GET /resources/export` |
| AJAX validation | `POST /validation/...` hoặc merge vào submit validation |
| Screen navigation | Không tự sinh API riêng |
| Internal helper | Private service method |
| Batch | Command/worker/scheduler |

## Soft delete rule

Không tự động map `DEL_DATETM` thành `deletedAt`.

Chỉ dùng soft delete khi xác minh đủ:

1. DDL có cột delete timestamp/flag.
2. Java SQL thường xuyên lọc bản ghi deleted.
3. Không có behavior cần đọc tất cả deleted records mặc định.
4. Không có physical delete hoặc cancellation rule mâu thuẫn.

```markdown
| Table | Delete behavior | Evidence | Target policy |
|---|---|---|---|
| `M_CUSTOMER` | Soft delete | Query has `DEL_DATETM IS NULL` | `deletedAt` |
| `T_SALES` | Cancel instead of delete | No DELETE SQL; status update found | Status transition |
| `T_SALES_HIST` | Append-only | INSERT only | Immutable audit |
```

## Prisma selector rule

Không dùng `findUnique()` với điều kiện không thuộc unique key.

Sai:

```typescript
await prisma.customer.findUnique({
  where: { id: dto.id, deletedAt: null },
});
```

Đúng trong đa số trường hợp:

```typescript
await prisma.customer.findFirst({
  where: {
    id: dto.id,
    deletedAt: null,
  },
});
```

## Transaction rule

Bắt buộc dùng `prisma.$transaction()` khi function có từ hai write operations trở lên, ví dụ:

- Main table + history table.
- Header + details.
- Main transaction + stock update.
- Status update + ledger posting.
- Invoice + payment allocation.

```typescript
return this.prisma.$transaction(async (tx) => {
  const order = await tx.receiveOrder.create({
    data: {
      customerId: dto.customerId,
      orderDate: dto.orderDate,
      createdBy: user.userId,
    },
  });

  await tx.receiveOrderHistory.create({
    data: {
      receiveOrderId: order.id,
      action: 'CREATE',
      operatedBy: user.userId,
    },
  });

  return { success: true, data: order };
});
```

---

# Phase 5 – Generate FD

## Output file

```text
docs/function-design/FD-<MODULE>-<NN>-<kebab-name>.md
```

## FD Template

```markdown
# FD-<MODULE>-<NN>: <Tên Function> (<Tên tiếng Nhật>)

> **WF nguồn**: [WF-XX-name.md](../../output/cursor/workflows/WF-XX-name.md)  
> **Java source**: `action/<module>/<ActionClass>.java`, `service/<ServiceClass>.java`  
> **Confidence**: HIGH / MEDIUM / LOW

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|---|---|---|
| Legacy Action | Confirmed / Missing | `<ActionClass>.<method>()` |
| Service logic | Confirmed / Partial / Missing | `<ServiceClass>.<method>()` |
| DDL mapping | Confirmed / Partial / Missing | `<TABLE_NAME>` |
| Workflow coverage | Confirmed / Partial / Missing | `WF-XX-name.md` |
| Target API design | Target decision | `<method> /api/...` |

### Confidence rule

- **HIGH**: Coverage >= 90%, không có unknown high impact.
- **MEDIUM**: Coverage 70-89%, hoặc có assumption low/medium impact.
- **LOW**: Coverage < 70%, hoặc có unknown high impact.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|---|---|---|
| **Chức năng** | <mô tả ngắn> | LEGACY_CONFIRMED / TARGET_DECISION |
| **Module** | <tên module> | LEGACY_CONFIRMED |
| **Actor** | <role/MENU_ID> | LEGACY_CONFIRMED |
| **HTTP Method** | GET / POST / PATCH | TARGET_DECISION |
| **Legacy URL** | `/module/actionName/method` | LEGACY_CONFIRMED |
| **Target URL** | `POST /api/<module>/<function>` | TARGET_DECISION |
| **Trigger** | User action / Batch / Import | LEGACY_CONFIRMED |

---

## 2. Input

### Request Schema (Zod)

```typescript
const <FunctionName>Input = z.object({
  fieldName: z.string().min(1),
});
type <FunctionName>Input = z.infer<typeof <FunctionName>Input>;
```

### Input fields chi tiết

| Field | Type | Required | Validation | Nguồn | Legacy column/form mapping | Provenance |
|---|---|---|---|---|---|---|
| `fieldName` | string | ✓ | min(1) | Form input | `COLUMN_NAME` | LEGACY_CONFIRMED / TARGET_DECISION |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|---|---|---|
| Success | Forward to complete JSP | `<ActionClass>.register()` |
| Validation error | Return input JSP with messages | `<ActionClass>.register()` |

### Target Response Schema

```typescript
type <FunctionName>Response = {
  success: boolean;
  data?: {
    id: string;
  };
  errors?: Record<string, string>;
};
```

| Field | Type | Nguồn | Ghi chú | Provenance |
|---|---|---|---|---|
| `id` | string | DB generated | Primary key | TARGET_DECISION |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|---|---|---|---|---|
| BR-01 | <mô tả rule> | LEGACY_CONFIRMED | `Service.method() → helper()` | Block / Warning |
| TD-01 | <quyết định target> | TARGET_DECISION | API convention | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error message key | Provenance | Evidence |
|---|---|---|---|---|---|
| VAL-01 | `fieldName` | Required | `errors.required` | LEGACY_CONFIRMED | `Form.validate()` |
| VAL-02 | `fieldName` | Must exist in DB | `errors.notExist` | LEGACY_CONFIRMED / ASSUMPTION | `Service.find...()` |

---

## 6. Error Handling

### Legacy Error Behavior

| Tình huống | Legacy handling | Evidence |
|---|---|---|
| Record không tồn tại | Error JSP / message | `<ActionClass>.method()` |
| Duplicate submit | Unknown / message / retry | `<ServiceClass>.method()` |
| Lock conflict | Exception / retry / unknown | `<ServiceClass>.method()` |

### Target API Error Mapping

| Tình huống | Exception | HTTP Status | Error code | Provenance |
|---|---|---|---|---|
| Record không tồn tại | `NotFoundException` | 404 | `NOT_FOUND` | TARGET_DECISION |
| Validation failed | `UnprocessableEntityException` | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Duplicate submit | `ConflictException` | 409 | `DUPLICATE_SUBMIT` | TARGET_DECISION |
| Optimistic lock | `ConflictException` | 409 | `VERSION_CONFLICT` | TARGET_DECISION |
| DB error | `InternalServerErrorException` | 500 | `SYSTEM_ERROR` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Prisma model | Điều kiện | Provenance | Evidence |
|---|---|---|---|---|---|
| `TABLE_NAME` | Lookup X | `ModelName` | `<condition>` | LEGACY_CONFIRMED / TARGET_DECISION | `<source>` |

### Write

| Bảng | Operation | Prisma method | Ghi chú | Provenance | Evidence |
|---|---|---|---|---|---|
| `TABLE_NAME` | INSERT | `prisma.modelName.create()` | Main record | LEGACY_CONFIRMED / TARGET_DECISION | `<source>` |
| `TABLE_NAME_HIST` | INSERT | `prisma.modelNameHist.create()` | Audit trail | LEGACY_CONFIRMED / TARGET_DECISION | `<source>` |

### Delete / Cancel Policy

| Table | Legacy behavior | Target behavior | Provenance |
|---|---|---|---|
| `TABLE_NAME` | Physical delete / soft delete / status cancel / unknown | <target policy> | LEGACY_CONFIRMED / TARGET_DECISION |

---

## 8. Implementation Guide

### 8a. NestJS Controller

```typescript
@Controller('<module>')
@UseGuards(AuthGuard, PermissionGuard)
export class <Module>Controller {
  constructor(private readonly service: <Module>Service) {}

  @Post('<function>')
  @RequirePermission(MENU_ID.<MENU_CONSTANT>)
  async <functionName>(
    @Body() dto: <FunctionName>Input,
    @CurrentUser() user: UserDto,
  ): Promise<<FunctionName>Response> {
    return this.service.<functionName>(dto, user);
  }
}
```

> Controller structure là `TARGET_DECISION`. Permission mapping phải dựa trên evidence legacy nếu `MENU_ID` tồn tại.

### 8b. NestJS Service

```typescript
@Injectable()
export class <Module>Service {
  constructor(private readonly prisma: PrismaService) {}

  async <functionName>(
    dto: <FunctionName>Input,
    user: UserDto,
  ): Promise<<FunctionName>Response> {
    return this.prisma.$transaction(async (tx) => {
      // Validate legacy-confirmed business rules.

      const result = await tx.<model>.create({
        data: {
          ...dto,
          createdBy: user.userId,
          createdAt: new Date(),
        },
      });

      // Insert history only if required by legacy evidence or target decision.
      await tx.<model>Hist.create({
        data: {
          <model>Id: result.id,
          action: 'CREATE',
          operatedBy: user.userId,
        },
      });

      return { success: true, data: result };
    });
  }
}
```

### 8c. Prisma Query Pattern

```typescript
await prisma.<model>.findMany({
  where: {
    // Add deletedAt: null only when confirmed for this model.
  },
  orderBy: { createdAt: 'desc' },
  take: pageSize,
  skip: (page - 1) * pageSize,
});
```

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|---|---|---|---|---|
| TC-01 | Happy path | valid dto | success + id | Unit | LEGACY_CONFIRMED / TARGET_DECISION |
| TC-02 | Missing required field | invalid dto | 422 validation error | Unit | LEGACY_CONFIRMED / TARGET_DECISION |
| TC-03 | Reference record not found | invalid FK | 404 | Unit | LEGACY_CONFIRMED / TARGET_DECISION |
| TC-04 | Duplicate submit | duplicate request | 409 | Integration | TARGET_DECISION |
| TC-05 | Permission denied | missing MENU_ID | 403 | Unit | LEGACY_CONFIRMED |
| TC-06 | Transaction rollback | history insert fails | no partial data | Integration | TARGET_DECISION |

---

## 10. Risked Items

- [ ] <Điểm chưa chắc chắn>
- [ ] <Behavior legacy chưa có evidence>
- [ ] <Target design cần chốt>

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|---|---|---|---|---|---|
| OQ-01 | UNKNOWN | <business question> | <default> | High / Medium / Low | Open |
| TD-01 | TARGET_DECISION | <target design decision> | <decision> | High / Medium / Low | Proposed |
| AS-01 | ASSUMPTION | <assumption> | <default> | High / Medium / Low | Needs verification |
```

---

# Phase 6 – Gap Check

## G1 – Tạo Requirement List từ source

Đọc lại evidence source và lập danh sách:

```markdown
REQUIREMENT LIST:
[ ] BR: <business rule>
[ ] VAL: <validation>
[ ] TABLE_READ: <table>
[ ] TABLE_WRITE: <table>
[ ] ERROR: <exception/message pattern>
[ ] PERM: <MENU_ID>
[ ] STATUS: <status transition>
[ ] SIDE_EFFECT: <stock/history/export/etc.>
```

## G2 – Đối chiếu với FD

Đánh dấu:

- `[x]` Có trong FD, đúng và có provenance.
- `[~]` Có nhưng thiếu chi tiết / chưa rõ source.
- `[ ]` Hoàn toàn vắng mặt.

## G3 – Xử lý Gap

- Tự bổ sung nếu source đã đủ evidence.
- Gắn `UNKNOWN` nếu không tìm được evidence.
- Không hỏi user trong batch.
- Ghi vấn đề cần xác nhận vào:
  - Section 10 – Risked Items.
  - Section 11 – Open Questions / Target Decisions.
  - `docs/function-design/_open-questions.md`.

## G4 – Gap report

```markdown
🔍 Gap Check: <Function>

Legacy requirement coverage: <X>/<N>
Target design coverage: <X>/<N>

Gaps tự bổ sung: <N>
Unknown gaps: <N>
High-risk assumptions: <N>

Unknown gaps:
- [ ] <item> — không tìm được evidence trong source.
```

---

# Phase 7 – Review

## R1 – Đọc lại FD vừa sinh

Phải đọc lại toàn bộ file FD sau khi lưu.

## R2 – Checklist chất lượng

### Evidence và nghiệp vụ

- [ ] Section 0 có evidence + confidence reasoning.
- [ ] Legacy URL và target URL được phân biệt.
- [ ] Actor/MENU_ID có evidence hoặc được ghi unknown.
- [ ] Input field có mapping form/column khi có source.
- [ ] Mỗi business rule có provenance + evidence anchor.
- [ ] Validation không bị suy diễn thành legacy rule.
- [ ] Error handling legacy và target API được tách riêng.
- [ ] DB read/write bao phủ đủ các bảng từ evidence.
- [ ] Delete/cancel behavior được xác định rõ.

### Implementation

- [ ] REST endpoint không được map máy móc từ screen navigation/helper.
- [ ] `@RequirePermission()` chỉ dùng khi có permission mapping.
- [ ] Có transaction nếu nhiều write operations.
- [ ] Không dùng `findUnique()` sai unique selector.
- [ ] Soft delete filter chỉ dùng khi behavior được xác minh.
- [ ] History/audit write được xử lý cùng transaction nếu cần.

### Kiểm thử và rủi ro

- [ ] Có happy path.
- [ ] Có validation case.
- [ ] Có not-found/reference case nếu áp dụng.
- [ ] Có permission case nếu có MENU_ID.
- [ ] Có rollback case nếu nhiều writes.
- [ ] Risked Items không bỏ trống khi confidence không phải HIGH.
- [ ] Open Questions có default proposal và impact.

## R3 – Báo cáo review

```markdown
✅ Generated: docs/function-design/FD-<MODULE>-<NN>-<name>.md

Confidence: HIGH / MEDIUM / LOW
Legacy requirement coverage: <X>/<N>
Target design decisions: <N>
Unknown items: <N>
High-risk assumptions: <N>

Checklist: <X>/<Y> passed

Open questions:
1. <question>
2. <question>
```

---

# Index update

Sau khi sinh FD, cập nhật hoặc tạo:

```text
docs/function-design/_index.md
```

Template:

```markdown
# Function Design Index

| FD | Function | Module | Confidence | Status |
|---|---|---|---|---|
| [FD-RORDER-01](./FD-RORDER-01-create-receive-order.md) | Create receive order | Receive order | MEDIUM | Draft |
```

---

# Open Questions update

Cập nhật hoặc tạo:

```text
docs/function-design/_open-questions.md
```

Template:

```markdown
# Function Design Open Questions

| ID | Function | Question | Proposed Default | Impact | Status |
|---|---|---|---|---|---|
| OQ-RORDER-01-01 | FD-RORDER-01 | Credit limit vượt ngưỡng có block không? | Block submit | High | Open |
```

---

# Gợi ý thứ tự sinh FD

## Phase 1 – Core

1. `FD-AUTH-01` – Login / Logout
2. `FD-AUTH-02` – Permission check
3. `FD-CUST-01` – Search customer
4. `FD-CUST-02` – Create / Update customer
5. `FD-PROD-01` – Search product
6. `FD-PROD-02` – Create / Update product

## Phase 2 – Order-to-Cash

7. `FD-RORDER-01` – Create receive order
8. `FD-RORDER-02` – Update receive order
9. `FD-RORDER-03` – Cancel receive order
10. `FD-SALES-01` – Create sales slip
11. `FD-BILL-01` – Close billing

## Phase 3 – Procure-to-Pay

12. `FD-PORDER-01` – Create purchase order
13. `FD-PURCHASE-01` – Create purchase receipt
14. `FD-PAYMENT-01` – Close payment

## Phase 4 – Stock & Reports

15. `FD-STOCK-01` – Stock adjustment
16. `FD-REPORT-01` – Export invoice PDF
