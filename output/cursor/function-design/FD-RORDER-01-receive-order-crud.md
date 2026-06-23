# FD-RORDER-01: Quản lý Đơn hàng (受注 CRUD)

> **Confidence**: HIGH (WF-03, route inventory) / MEDIUM (Java line-level — cần spot-check khi migrate)  
> **Evidence file**: [`_evidence/FD-RORDER-01-receive-order-crud.md`](./_evidence/FD-RORDER-01-receive-order-crud.md)  
> **Workflow**: [WF-03 Receive Order](../workflows/WF-03-receive-order.md)  
> **Scope**: List/search, create, update, cancel đơn hàng (受注) — **không gồm** EC import (→ FD-RORDER-02)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) | `InputROrderAction`, `SearchROrderAction` — WF-03, `07-screen-route-mapping.md` |
| Service logic | Confirmed | `RoSlipService`, `RoLineService` — WF-03 |
| DDL mapping | Partial | `RO_SLIP_TRN`, `RO_LINE_TRN` — `02-entity-list.md` §5.1 |
| Workflow coverage | Confirmed | WF-03 |
| Target API design | Target decision | NestJS `ReceiveOrdersController` |

**Confidence: MEDIUM-HIGH** — Route/class confirmed từ RE; cancel guard khi partial SALES cần verify Java.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | CRUD đơn hàng: tìm kiếm, tạo, sửa, hủy (受注) | LEGACY_CONFIRMED |
| **Module** | `rorder` / RORDER | LEGACY_CONFIRMED |
| **Actor** | Sales staff có quyền menu 受注 | WF_CONFIRMED |
| **Legacy URLs** | `/rorder/inputROrder`, `/rorder/searchROrder` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST/PATCH/POST .../cancel /api/receive-orders` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createReceiveOrderSchema` (Zod)

```typescript
const receiveOrderLineSchema = z.object({
  productCode: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  retailPrice: z.number().nonnegative().optional(),
});

const createReceiveOrderSchema = z.object({
  customerCode: z.string().min(1),
  roDate: z.string().date(),
  deliveryCode: z.string().optional(),
  shipDate: z.string().date().optional(),
  deliveryDate: z.string().date().optional(),
  customerSlipNo: z.string().optional(),
  salesCmCategory: z.string().optional(),
  remarks: z.string().max(2000).optional(),
  lines: z.array(receiveOrderLineSchema).min(1),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `customerCode` | string | ✓ | exists in CUSTOMER_MST | `CUSTOMER_CODE` | LEGACY_CONFIRMED |
| `roDate` | date | ✓ | valid date | `RO_DATE` | LEGACY_CONFIRMED |
| `deliveryCode` | string | | exists in DELIVERY_MST | `DELIVERY_CODE` | LEGACY_CONFIRMED |
| `lines[].productCode` | string | ✓ | exists in PRODUCT_MST | `PRODUCT_CODE` | LEGACY_CONFIRMED |
| `lines[].quantity` | int | ✓ | > 0 | `QUANTITY` | LEGACY_CONFIRMED |
| `lines[].unitPrice` | decimal | ✓ | >= 0 | `UNIT_PRICE` | LEGACY_CONFIRMED |

**Evidence fields:** `docs/spec/02-entity-list.md` §5.1 RoSlipTrn, WF-03 § Validation

### Search query — `receiveOrderSearchSchema`

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `customerCode` | string | — | Search form |
| `roDateFrom` | date | — | date range |
| `roDateTo` | date | — | date range |
| `status` | enum `1\|2\|3\|9` | — | STATUS filter |
| `page` | number | 1 | pager |
| `pageSize` | number | 20 | pager |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Search success | Forward `searchROrder.jsp` + result list | `SearchROrderAction` | INFERRED |
| Register success | Stay on `inputROrder.jsp` + flash | `AbstractSlipEditAction` | INFERRED |
| Validation error | Same JSP + ActionErrors | Struts form | INFERRED |
| Cancel success | STATUS = `"9"` | WF-03 status diagram | LEGACY_CONFIRMED |
| Credit warning | Message warning, vẫn lưu | WF-03 VAL #6 | LEGACY_CONFIRMED |
| Stock warning | Message warning, vẫn lưu | WF-03 Error Handling | LEGACY_CONFIRMED |

### Target Response

```typescript
type ReceiveOrderLineDto = {
  roLineId: string;
  productCode: string;
  quantity: number;
  restQuantity: number;
  unitPrice: number;
};

type ReceiveOrderDto = {
  id: string;
  customerCode: string;
  customerName: string;
  roDate: string;
  status: '1' | '2' | '3' | '9';
  priceTotal: number;
  lines: ReceiveOrderLineDto[];
};

type ListReceiveOrdersResponse = {
  data: ReceiveOrderDto[];
  total: number;
  page: number;
  pageSize: number;
};
```

| Field | Provenance |
|-------|------------|
| `id` cuid | TARGET_DECISION (thay `SEQ_MAKER`) |
| `restQuantity` | LEGACY_CONFIRMED (= QUANTITY on insert) |
| `status` | LEGACY_CONFIRMED (`1` Open → `3` Complete → `9` Cancel) |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Insert: `REST_QUANTITY = QUANTITY` mỗi line | LEGACY_CONFIRMED | WF-03 VAL #8 | Block |
| BR-02 | Register set STATUS = `"1"` (Open) | LEGACY_CONFIRMED | WF-03 status diagram | Info |
| BR-03 | Tạo SALES từ RO → STATUS `"2"`, REST_QUANTITY giảm | LEGACY_CONFIRMED | WF-03, WF-04 | Info |
| BR-04 | Tất cả REST_QUANTITY = 0 → STATUS `"3"` | LEGACY_CONFIRMED | WF-03 status diagram | Info |
| BR-05 | Cancel → STATUS `"9"` | LEGACY_CONFIRMED | WF-03 | Block |
| BR-06 | Credit limit vượt → warning, không block | LEGACY_CONFIRMED | WF-03 VAL #6 | Warning |
| BR-07 | Stock không đủ → warning, không block | LEGACY_CONFIRMED | WF-03 Error | Warning |
| BR-08 | Snapshot KH + delivery vào RO_SLIP_TRN | LEGACY_CONFIRMED | WF-03 register path | Info |
| BR-09 | Ghi `RO_SLIP_TRN_HIST` + `RO_LINE_TRN_HIST` sau thay đổi | LEGACY_CONFIRMED | WF-03 WRITE | Info |
| BR-10 | Discount qua `DiscountUtil.calcDiscount()` | LEGACY_CONFIRMED | WF-03 | Info |
| TD-01 | Target dùng `cuid()` thay SEQ_MAKER | TARGET_DECISION | migration convention | Info |
| TD-02 | Idempotency key thay Struts Token | TARGET_DECISION | WF-03 VAL #7 | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `customerCode` | Required, exists | 422 / 404 | LEGACY_CONFIRMED | WF-03 #1 |
| VAL-02 | `roDate` | Required, valid date | 422 | LEGACY_CONFIRMED | WF-03 #2 |
| VAL-03 | `lines` | Min 1 line | 422 | LEGACY_CONFIRMED | WF-03 pattern |
| VAL-04 | `lines[].productCode` | Required, exists | 422 | LEGACY_CONFIRMED | WF-03 #3 |
| VAL-05 | `lines[].quantity` | > 0 | 422 | LEGACY_CONFIRMED | WF-03 #4 |
| VAL-06 | `lines[].unitPrice` | >= 0 | 422 | LEGACY_CONFIRMED | WF-03 #5 |
| VAL-07 | cancel | STATUS in `1`,`2` | 409 | INFERRED | WF-03, FD-RORDER-03 publish |
| VAL-08 | cancel | STATUS `3` không cancel | 409 | INFERRED | WF-03 diagram |
| VAL-09 | update | Không sửa khi STATUS `9` | 409 | INFERRED | pattern |
| VAL-10 | double submit | Token valid | 409 | LEGACY_CONFIRMED | WF-03 #7 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| KH không tồn tại | `errors.notExist` | WF-03 |
| Product không tồn tại | `errors.notExist` | WF-03 |
| Double submit | Token invalid → error | WF-03 |
| Lock conflict | `errors.lock` / `UnabledLockException` | WF-03 |
| System | `errors.system` + log | WF-03 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |
| Cannot cancel | 409 | `INVALID_RO_STATUS` | TARGET_DECISION |
| Duplicate submit | 409 | `DUPLICATE_REQUEST` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Lock / version | 409 | `VERSION_CONFLICT` | ASSUMPTION |
| Credit / stock warning | 200 + warnings[] | `CREDIT_WARNING`, `STOCK_WARNING` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `RO_SLIP_TRN` | Search/detail | `receiveOrder` | by criteria | LEGACY_CONFIRMED |
| `RO_LINE_TRN` | Lines | `receiveOrderLine` | by slip id | LEGACY_CONFIRMED |
| `CUSTOMER_MST` | Lookup + credit | `customer` | active | LEGACY_CONFIRMED |
| `DELIVERY_MST` | Delivery snapshot | TBD | by customer | LEGACY_CONFIRMED |
| `PRODUCT_MST` | Line lookup | `product` | active | LEGACY_CONFIRMED |
| `PRODUCT_STOCK_TRN` | Stock check | TBD | warning only | LEGACY_CONFIRMED |
| `DISCOUNT_MST` / `DISCOUNT_TRN` | Discount calc | TBD | | LEGACY_CONFIRMED |
| `CATEGORY_MST` / `CATEGORY_TRN` | Dropdowns | TBD | | LEGACY_CONFIRMED |
| `TAX_RATE_MST` | Tax rate | TBD | | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `RO_SLIP_TRN` | INSERT/UPDATE | `receiveOrder` | Snapshot KH/delivery | LEGACY_CONFIRMED |
| `RO_LINE_TRN` | INSERT/UPDATE/DELETE | `receiveOrderLine` | REST_QUANTITY init | LEGACY_CONFIRMED |
| `RO_SLIP_TRN_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `RO_LINE_TRN_HIST` | INSERT | TBD | Per line | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

### Cancel Policy

| | Legacy | Target | Provenance |
|---|--------|--------|------------|
| Policy | UPDATE STATUS = `"9"` | same semantics | LEGACY_CONFIRMED |
| Partial SALES linked | UNKNOWN guard | TBD characterization test | UNKNOWN |

**Transaction:** `$transaction` khi ghi slip + lines + hist — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0301` (`searchROrder`) | `isMenuValid` | `receive-order.read` | GET list/detail |
| `0300` (`inputROrder`) | `isMenuValid` | `receive-order.read` | GET detail |
| `0300` | `isMenuUpdate` | `receive-order.write` | POST, PATCH |
| `0300` | `isMenuUpdate` | `receive-order.cancel` | POST cancel |

> **Evidence:** `03-route-api-inventory.md` §3.2 (MENU_ID 0300, 0301), WF-03 § User Role.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/receive-orders` | `searchROrder` | `receive-order.read` |
| GET | `/api/receive-orders/:id` | `inputROrder/edit` | `receive-order.read` |
| POST | `/api/receive-orders` | `register` create | `receive-order.write` |
| PATCH | `/api/receive-orders/:id` | `register` update | `receive-order.write` |
| POST | `/api/receive-orders/:id/cancel` | `cancel` | `receive-order.cancel` |

```typescript
@Controller('receive-orders')
@UseGuards(AuthGuard, PermissionGuard)
export class ReceiveOrdersController {
  constructor(private readonly receiveOrdersService: ReceiveOrdersService) {}

  @Post()
  @RequirePermission('receive-order.write')
  create(@Body() dto: CreateReceiveOrderInput, @CurrentUser() user: UserDto) {
    return this.receiveOrdersService.create(dto, user);
  }

  @Post(':id/cancel')
  @RequirePermission('receive-order.cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: UserDto) {
    return this.receiveOrdersService.cancel(id, user);
  }
}
```

### Service pattern (create)

```typescript
return this.prisma.$transaction(async (tx) => {
  const customer = await this.customerService.findActiveOrThrow(dto.customerCode);
  const warnings = await this.checkCreditAndStock(dto, customer);

  const slip = await tx.receiveOrder.create({
    data: {
      ...mapCustomerSnapshot(customer),
      roDate: dto.roDate,
      status: '1',
      lines: {
        create: dto.lines.map((l) => ({
          ...l,
          restQuantity: l.quantity,
        })),
      },
    },
  });
  // await tx.receiveOrderHist.create({ ... }) when parity verified
  return { success: true, data: slip, warnings };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| List | `/receive-orders` | `searchROrder.jsp` |
| Create | `/receive-orders/new` | `inputROrder.jsp` |
| Edit | `/receive-orders/[id]` | `inputROrder.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Create happy path | valid dto + 1 line | 201, status `1`, restQty = qty | Integration | TARGET_DECISION |
| TC-02 | Missing customer | invalid code | 404/422 | Unit | LEGACY_CONFIRMED |
| TC-03 | Quantity <= 0 | invalid line | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | Credit warning | over limit | 201 + warning | Integration | LEGACY_CONFIRMED |
| TC-05 | Stock warning | low stock | 201 + warning | Integration | LEGACY_CONFIRMED |
| TC-06 | Cancel open RO | status `1` | 200, status `9` | Integration | LEGACY_CONFIRMED |
| TC-07 | Cancel complete RO | status `3` | 409 | Integration | INFERRED |
| TC-08 | Search by date range | query params | filtered list | Unit | TARGET_DECISION |
| TC-09 | Permission denied | no write perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-10 | Hist on update | PATCH | hist record | Integration | LEGACY_CONFIRMED — TBD |

---

## 10. Risked Items

- [ ] Cancel khi STATUS `"2"` (đã có SALES partial) — guard chưa verify Java
- [ ] Copy từ Estimate / copy slip — optional, ngoài scope P1 chính
- [ ] `DiscountUtil` parity — cần characterization test
- [ ] Optimistic lock trên RO_SLIP — INFERRED từ error table
- [ ] EC import tách sang FD-RORDER-02 — không duplicate logic

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Cancel RO partial khi đã có SALES_SLIP? | Block cancel nếu REST_QUANTITY < QUANTITY | High | Open |
| OQ-02 | UNKNOWN | Copy từ Estimate trong FD này hay FD riêng? | Defer Estimate FD | Medium | Open |
| TD-01 | TARGET_DECISION | Warning array vs separate endpoint | `warnings[]` in 200 response | Medium | Proposed |
| TD-02 | TARGET_DECISION | `receive-order.cancel` permission | Separate from write | Low | Proposed |
| AS-01 | ASSUMPTION | `register()` handles create+update | POST vs PATCH split | Low | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-03](../workflows/WF-03-receive-order.md) |
| Related FD | [FD-RORDER-02](./FD-RORDER-02-online-order-import.md) (EC import) |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) |
| Screen | [07-screen-route-mapping.md](../07-screen-route-mapping.md) |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.2 |
| Inventory | [_inventory/rorder.md](./_inventory/rorder.md) |
| Index | [_index.md](./_index.md) |
