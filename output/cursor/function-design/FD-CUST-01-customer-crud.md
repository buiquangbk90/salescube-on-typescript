# FD-CUST-01: Quản lý Khách hàng (得意先マスタ CRUD)

> **Confidence**: HIGH (screen map, WF-02, module inventory) / MEDIUM (Java line-level — source ngoài workspace)  
> **Evidence file**: [`_evidence/FD-CUST-01-customer-crud.md`](./_evidence/FD-CUST-01-customer-crud.md)  
> **Workflow**: [WF-02 Customer Management](../workflows/WF-02-customer-management.md)  
> **Scope**: List/search, create, update, soft-delete master khách hàng (không gồm dialog AJAX riêng, copy KH)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) / Partial (methods) | `SearchCustomerAction`, `EditCustomerAction` — `07-screen-route-mapping.md` |
| Service logic | Confirmed | `CustomerService`, `CustomerHistoryService` — `02-module-inventory.md`, WF-02 |
| DDL mapping | Partial | `CUSTOMER_MST` — WF-02, `02-entity-list.md` |
| Workflow coverage | Confirmed | WF-02 |
| Target API design | Target decision | NestJS `CustomersController` |

**Confidence: MEDIUM-HIGH** — Route/class confirmed từ RE; method-level và SQL cần verify khi có `SalesCube/` trong repo.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | CRUD master khách hàng: tìm kiếm, tạo, sửa, xóa mềm | LEGACY_CONFIRMED |
| **Module** | `master` / CUST | LEGACY_CONFIRMED |
| **Actor** | User có quyền menu Customer Master | WF_CONFIRMED |
| **Legacy URLs** | `/master/searchCustomer`, `/master/editCustomer` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST/PATCH/DELETE /api/customers` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createCustomerSchema` (Zod)

```typescript
const createCustomerSchema = z.object({
  code: z.string().min(1).max(15).regex(/^[a-zA-Z0-9]+$/),
  name: z.string().min(1).max(60),
  nameKana: z.string().optional(),
  abbr: z.string().optional(),
  zipCode: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  taxShift: z.enum(['INCLUDED', 'EXCLUDED']),
  taxFraction: z.enum(['FLOOR', 'CEIL', 'ROUND']),
  priceFraction: z.enum(['FLOOR', 'CEIL', 'ROUND']),
  cutoffGroup: z.string().min(1),
  cutoffDay: z.number().int().min(1).max(31).optional(),
  paybackCycle: z.enum(['CURRENT_MONTH', 'NEXT_MONTH', 'AFTER_NEXT_MONTH', 'MONTHS_3']),
  customerRank: z.string().optional(),
  creditLimit: z.number().nonnegative().optional(),
  remarks: z.string().max(2000).optional(),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `code` | string | ✓ | unique, alphanumeric, max 15 legacy | `CUSTOMER_CODE` | LEGACY_CONFIRMED / TARGET_DECISION |
| `name` | string | ✓ | max 60 legacy | `CUSTOMER_NAME` | LEGACY_CONFIRMED |
| `nameKana` | string | | | `CUSTOMER_KANA` | LEGACY_CONFIRMED |
| `zipCode` | string | | triggers ZIP lookup legacy | `CUSTOMER_ZIP_CODE` | LEGACY_CONFIRMED |
| `address1` | string | | auto-fill từ ZIP | `CUSTOMER_ADDRESS1` | LEGACY_CONFIRMED |
| `taxShift` | enum | ✓ | | `TAX_SHIFT_CATEGORY` | LEGACY_CONFIRMED |
| `cutoffGroup` | string | ✓ | in CATEGORY_TRN | `CUTOFF_GROUP` | LEGACY_CONFIRMED |
| `paybackCycle` | enum | ✓ | | `PAYBACK_CYCLE_CATEGORY` | LEGACY_CONFIRMED |
| `customerRank` | string | | in CUSTOMER_RANK_MST | `CUSTOMER_RANK_CATEGORY` | LEGACY_CONFIRMED |
| `creditLimit` | decimal | | >= 0 | `MAX_CREDIT_LIMIT` | LEGACY_CONFIRMED |

**Evidence fields:** `docs/spec/02-entity-list.md` §5.1, WF-02 § Validation

### Search query — `customerSearchSchema`

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `q` | string | — | Search form fields code/name/tel |
| `page` | number | 1 | pager |
| `pageSize` | number | 20 | pager |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Search success | Forward `searchCustomer.jsp` + result list | `SearchCustomerAction` pattern | INFERRED |
| Register success | Stay on `editCustomer.jsp` + flash message | `AbstractEditAction` | INFERRED |
| Validation error | Same JSP + ActionErrors | Struts form | INFERRED |
| Delete success | Redirect list | WF-02 | WF_CONFIRMED |

### Target Response

```typescript
type CustomerDto = { id: string; code: string; name: string; /* ... */ };

type ListCustomersResponse = {
  data: CustomerDto[];
  total: number;
  page: number;
  pageSize: number;
};

type CustomerMutationResponse = { success: true; data: CustomerDto };
```

| Field | Provenance |
|-------|------------|
| `id` cuid | TARGET_DECISION (thay `SEQ_MAKER`) |
| `code` business key | LEGACY_CONFIRMED |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | `CUSTOMER_CODE` unique trên active records | LEGACY_CONFIRMED | WF-02 VAL #3 | Block |
| BR-02 | Sau insert/update ghi `CUSTOMER_MST_HIST` snapshot | LEGACY_CONFIRMED | WF-02, audit pattern `04-database-analysis` | Info |
| BR-03 | Insert allocate ID qua `SEQ_MAKER` | LEGACY_CONFIRMED | WF-02 | Info |
| BR-04 | Delete = set `DEL_DATETM` (soft) | INFERRED | WF-02 status diagram | Block |
| BR-05 | Không xóa KH có SALES_SLIP chưa đóng | INFERRED | WF-02 VAL #9 | Block |
| BR-06 | `CUSTOMER_RANK_CATEGORY` cập nhật bởi batch WF-15 | LEGACY_CONFIRMED | WF-02, WF-15 | Info |
| TD-01 | Target dùng `deletedAt` thay `DEL_DATETM` | TARGET_DECISION | migration convention | Info |
| TD-02 | Target dùng `cuid()` thay SEQ_MAKER | TARGET_DECISION | `06-prisma-schema` | Info |
| TD-03 | `customer_hist` table riêng vs JSON audit | TARGET_DECISION | TBD parity | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `code` | Required | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-02 | `code` | Alphanumeric max 15 | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-03 | `code` | Unique on create | 409 | LEGACY_CONFIRMED | WF-02 |
| VAL-04 | `name` | Required max 60 | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-05 | `email` | Email format | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-06 | `creditLimit` | >= 0 | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-07 | `cutoffGroup` | Valid CATEGORY_TRN | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-08 | `customerRank` | In CUSTOMER_RANK_MST | 422 | LEGACY_CONFIRMED | WF-02 |
| VAL-09 | delete | No open sales slip | 409 TBD | INFERRED | WF-02 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Duplicate code | `errors.duplicate` | WF-02 |
| Cannot delete | `errors.cannotDelete` | INFERRED |
| Lock conflict | `errors.lock` / `UnabledLockException` | WF-02 |
| System | `errors.system` + log | WF-02 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |
| Duplicate code | 409 | `DUPLICATE_CODE` | TARGET_DECISION |
| Cannot delete | 409 | `CUSTOMER_HAS_OPEN_SALES` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Lock / version | 409 | `VERSION_CONFLICT` | ASSUMPTION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `CUSTOMER_MST` | Search/detail | `customer` | `deletedAt IS NULL` | LEGACY_CONFIRMED |
| `CUSTOMER_RANK_MST` | Dropdown | TBD / join | active | LEGACY_CONFIRMED |
| `CATEGORY_TRN` | cutoff dropdown | TBD | category type | LEGACY_CONFIRMED |
| `DELIVERY_MST` | Delivery addresses | TBD | by customer | LEGACY_CONFIRMED |
| `ZIP_MST` | ZIP lookup | TBD service | by zip code | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `CUSTOMER_MST` | INSERT/UPDATE | `prisma.customer` | Main | LEGACY_CONFIRMED |
| `CUSTOMER_MST_HIST` | INSERT | `customerHist` TBD | Snapshot | LEGACY_CONFIRMED |
| `CUSTOMER_REL` | INSERT/DELETE | TBD | Parent-child | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

### Delete Policy

| | Legacy | Target | Provenance |
|---|--------|--------|------------|
| Policy | Set `DEL_DATETM`, `DEL_USER`, `DEL_FUNC` | `deletedAt` timestamp | INFERRED / TARGET_DECISION |
| Filter reads | `DEL_DATETM IS NULL` in search SQL | `where: { deletedAt: null }` | INFERRED |

**Transaction:** `$transaction` khi ghi `customer` + `customer_hist` (+ `customer_rel` nếu có) — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `1302` (`CUSTOMER_MST`) | `isMenuValid` / `isMenuUpdate` | `customer.read` | GET list/detail |
| `1302` | `isMenuUpdate` | `customer.write` | POST, PATCH |
| `1302` | `isMenuUpdate` (delete) | `customer.delete` | DELETE |

> **Evidence:** `03-route-api-inventory.md` (MENU_ID 1302), WF-02 § Actor, `06-auth-permission-analysis.md` pattern.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/customers` | `searchCustomer` | `customer.read` |
| GET | `/api/customers/:id` | `editCustomer` load | `customer.read` |
| POST | `/api/customers` | `register` create | `customer.write` |
| PATCH | `/api/customers/:id` | `register` update | `customer.write` |
| DELETE | `/api/customers/:id` | `delete` | `customer.delete` |

```typescript
@Controller('customers')
@UseGuards(AuthGuard, PermissionGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermission('customer.write')
  create(@Body() dto: CreateCustomerInput, @CurrentUser() user: UserDto) {
    return this.customersService.create(dto, user);
  }
}
```

### Service pattern

```typescript
return this.prisma.$transaction(async (tx) => {
  const existing = await tx.customer.findFirst({
    where: { code: dto.code, deletedAt: null },
  });
  if (existing) throw new ConflictException('DUPLICATE_CODE');

  const customer = await tx.customer.create({
    data: { ...dto, createdBy: user.id, updatedBy: user.id },
  });
  // await tx.customerHist.create({ ... }) when parity verified
  return { success: true, data: customer };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| List | `/customers` | `searchCustomer.jsp` |
| Create | `/customers/new` | `editCustomer.jsp` |
| Edit | `/customers/[id]` | `editCustomer.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Create happy path | valid dto | 201 + id | Integration | TARGET_DECISION |
| TC-02 | Duplicate code | same code twice | 409 | Unit | LEGACY_CONFIRMED |
| TC-03 | Missing name | invalid dto | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | Soft delete | DELETE id | 204, deletedAt set | Integration | INFERRED |
| TC-05 | Delete with open sales | customer with slip | 409 | Integration | INFERRED |
| TC-06 | Search by q | partial name | filtered list | Unit | TARGET_DECISION |
| TC-07 | Permission denied | no write perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-08 | Hist row on update | PATCH | hist record | Integration | LEGACY_CONFIRMED — TBD impl |

---

## 10. Risked Items

- [ ] Java source không trong workspace — method signatures chưa verify line-level
- [ ] WF-02 URL `inputCustomer` vs RE `editCustomer` — đã dùng RE làm canonical
- [ ] Soft-delete read filter — INFERRED, cần SQL file confirm
- [ ] `CUSTOMER_REL` / `DELIVERY_MST` chưa trong target Prisma scope P1
- [ ] Optimistic lock (`UnabledLockException`) — UNKNOWN có dùng cho CUSTOMER_MST không
- [ ] Copy customer flow — chưa có FD

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | `EditCustomerAction` có method `copy()`? | Defer FD-CUST-02 | Medium | Open |
| OQ-02 | INFERRED | Delete guard SQL cho SALES_SLIP | Characterization test | High | Open |
| OQ-03 | UNKNOWN | AJAX delete vs form delete cùng logic? | Same service method | Medium | Open |
| TD-01 | TARGET_DECISION | `customer_hist` model shape | Snapshot JSON column | High | Proposed |
| TD-02 | TARGET_DECISION | ZIP lookup API | `GET /api/zip/:code` | Medium | Proposed |
| AS-01 | ASSUMPTION | `register()` handles create+update | Single endpoint split POST/PATCH | Low | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-02](../workflows/WF-02-customer-management.md) |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) |
| Screen | [07-screen-route-mapping.md](../07-screen-route-mapping.md) |
| Index | [_index.md](./_index.md) |
