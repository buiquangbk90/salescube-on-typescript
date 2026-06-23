# FD-PORDER-01: Nhập Phiếu Đặt Hàng NCC (発注入力 – Purchase Order Entry)

> **Confidence**: HIGH (WF-07, route inventory) / MEDIUM (Java line-level — source ngoài workspace)  
> **Evidence file**: [`_evidence/FD-PORDER-01-purchase-order.md`](./_evidence/FD-PORDER-01-purchase-order.md)  
> **Workflow**: [WF-07 Purchase Order](../workflows/WF-07-purchase-order.md)  
> **Scope**: Tạo/sửa/xóa phiếu đặt hàng (`PO_SLIP_TRN`); không gồm recommend list, in PDF, nhập hàng (WF-08)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) / Partial (methods) | `InputPOrderAction` — WF-07, `02-module-inventory.md` |
| Service logic | Confirmed | `InputPOrderSlipService`, `InputPOrderLineService` — WF-07 |
| DDL mapping | Partial | `PO_SLIP_TRN`, `PO_LINE_TRN` — WF-07, CREATE.sql L2683-2835 |
| Workflow coverage | Confirmed | WF-07 |
| Target API design | Target decision | NestJS `PurchaseOrdersController` |

**Confidence: MEDIUM-HIGH** — PO entry flow confirmed; receipt linkage (WF-08) out of scope.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Nhập phiếu đặt hàng NCC với N dòng sản phẩm | LEGACY_CONFIRMED |
| **Module** | `porder` / PORDER | LEGACY_CONFIRMED |
| **Actor** | Mua hàng / kho có quyền nhập PO | WF_CONFIRMED |
| **Legacy URLs** | `/porder/inputPOrder/index`, `/edit/{id}`, `/register`, `/delete` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST/PATCH/DELETE /api/purchase-orders` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createPurchaseOrderSchema` (Zod)

```typescript
const poLineSchema = z.object({
  lineNo: z.number().int().positive(),
  productCode: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const createPurchaseOrderSchema = z.object({
  supplierCode: z.string().min(1),
  poDate: z.string(),
  transportCategory: z.string().optional(),
  remarks: z.string().max(2000).optional(),
  lines: z.array(poLineSchema).min(1),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `supplierCode` | string | ✓ | exists in SUPPLIER_MST | `SUPPLIER_CODE` | LEGACY_CONFIRMED |
| `poDate` | date | ✓ | valid date | `PO_DATE` | LEGACY_CONFIRMED |
| `lines[].productCode` | string | ✓ | exists in PRODUCT_MST | `PRODUCT_CODE` | LEGACY_CONFIRMED |
| `lines[].quantity` | decimal | ✓ | > 0 | `QUANTITY` | LEGACY_CONFIRMED |
| `lines[].unitPrice` | decimal | ✓ | >= 0 | `UNIT_PRICE` | LEGACY_CONFIRMED |
| `lines[].lineAmount` | decimal | computed | QUANTITY × UNIT_PRICE | `PRICE` | LEGACY_CONFIRMED |
| `transportCategory` | string | | in CATEGORY_TRN | transport dropdown | INFERRED |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Register success | Stay on form + message | `InputPOrderAction.register()` | INFERRED |
| Delete success | Redirect list | WF-07 | INFERRED |
| Validation error | ActionErrors on JSP | Struts pattern | INFERRED |
| Line calc | PRICE = QUANTITY × UNIT_PRICE | WF-07 Main Code Path | LEGACY_CONFIRMED |

### Target Response

```typescript
type PoLineDto = {
  lineNo: number;
  productCode: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  restQuantity: number;
};

type PurchaseOrderDto = {
  poSlipId: string;
  supplierCode: string;
  supplierName: string;
  poDate: string;
  status: '0' | '2' | '3';
  totalAmount: number;
  lines: PoLineDto[];
};

type PurchaseOrderMutationResponse = { success: true; data: PurchaseOrderDto };
```

| Field | Provenance |
|-------|------------|
| `restQuantity` = `quantity` on create | LEGACY_CONFIRMED |
| `poSlipId` cuid | TARGET_DECISION |
| `supplierName` snapshot | LEGACY_CONFIRMED |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Snapshot NCC fields vào `PO_SLIP_TRN` | LEGACY_CONFIRMED | WF-07 | Block |
| BR-02 | N lines `PO_LINE_TRN`; `REST_QUANTITY = QUANTITY` on create | LEGACY_CONFIRMED | WF-07 VAL #6 | Block |
| BR-03 | `PRICE` line = `QUANTITY × UNIT_PRICE` | LEGACY_CONFIRMED | WF-07 Main Path | Block |
| BR-04 | Ghi `PO_SLIP_TRN_HIST` + `PO_LINE_TRN_HIST` | LEGACY_CONFIRMED | WF-07 | Info |
| BR-05 | STATUS `0` on create (draft/sent) | LEGACY_CONFIRMED | WF-07 Status | Info |
| BR-06 | STATUS `2`/`3` updated by WF-08 receipt — read-only here | LEGACY_CONFIRMED | WF-07 | Info |
| BR-07 | Không xóa PO đã có `SUPPLIER_SLIP` linked | LEGACY_CONFIRMED | WF-07 VAL #7 | Block |
| BR-08 | Delete = soft `DEL_DATETM` | INFERRED | module pattern | Block |
| TD-01 | Target `deletedAt` | TARGET_DECISION | migration convention | Info |
| TD-02 | `poSlipId` autoincrement/cuid | TARGET_DECISION | SEQ_MAKER replacement | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `supplierCode` | Required, exists | 422 | LEGACY_CONFIRMED | WF-07 #1 |
| VAL-02 | `poDate` | Required, valid | 422 | LEGACY_CONFIRMED | WF-07 #2 |
| VAL-03 | `lines[].productCode` | Required, exists | 422 | LEGACY_CONFIRMED | WF-07 #3 |
| VAL-04 | `lines[].quantity` | > 0 | 422 | LEGACY_CONFIRMED | WF-07 #4 |
| VAL-05 | `lines[].unitPrice` | >= 0 | 422 | LEGACY_CONFIRMED | WF-07 #5 |
| VAL-06 | create | `restQuantity = quantity` | — | LEGACY_CONFIRMED | WF-07 #6 |
| VAL-07 | delete | No linked SUPPLIER_SLIP | 409 | LEGACY_CONFIRMED | WF-07 #7 |
| VAL-08 | update | Block if receipt started (STATUS≠0) | 409 | INFERRED | WF-07 status flow |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Supplier not found | `errors.notExist` | WF-07 |
| Product not found | `errors.notExist` | WF-07 |
| PO has supplier slip | Block delete | WF-07 |
| ServiceException | Log + throw | WF-07 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Supplier/product not found | 422 | `NOT_FOUND` | TARGET_DECISION |
| Cannot delete (receipt exists) | 409 | `PO_HAS_RECEIPT` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `SUPPLIER_MST` | Lookup + snapshot | `supplier` | active | LEGACY_CONFIRMED |
| `PRODUCT_MST` | Line lookup, unit price | `product` | active | LEGACY_CONFIRMED |
| `PO_SLIP_TRN` | Detail/edit | `purchaseOrder` | `deletedAt IS NULL` | LEGACY_CONFIRMED |
| `PO_LINE_TRN` | Lines | `purchaseOrderLine` | by slip | LEGACY_CONFIRMED |
| `CATEGORY_TRN` | Transport dropdown | TBD | category type | INFERRED |
| `SUPPLIER_SLIP_TRN` | Delete guard | TBD | by PO ref | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `PO_SLIP_TRN` | INSERT/UPDATE | `purchaseOrder` | Main | LEGACY_CONFIRMED |
| `PO_LINE_TRN` | INSERT/UPDATE/DELETE | `purchaseOrderLine` | REST_QUANTITY init | LEGACY_CONFIRMED |
| `PO_*_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** `$transaction` khi slip + lines + hist — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0700` (`INPUT_PORDER`) | `isMenuValid` | `purchaseOrder.read` | GET detail |
| `0700` | `isMenuUpdate` | `purchaseOrder.write` | POST, PATCH |
| `0700` | `isMenuUpdate` (delete) | `purchaseOrder.delete` | DELETE |

> **Evidence:** `03-route-api-inventory.md:104`, WF-07 § User Role (INFERRED permission pattern).

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/purchase-orders/:id` | `inputPOrder/edit` | `purchaseOrder.read` |
| POST | `/api/purchase-orders` | `register` create | `purchaseOrder.write` |
| PATCH | `/api/purchase-orders/:id` | `register` update | `purchaseOrder.write` |
| DELETE | `/api/purchase-orders/:id` | `delete` | `purchaseOrder.delete` |

```typescript
@Controller('purchase-orders')
@UseGuards(AuthGuard, PermissionGuard)
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Post()
  @RequirePermission('purchaseOrder.write')
  create(@Body() dto: CreatePurchaseOrderInput, @CurrentUser() user: UserDto) {
    return this.poService.create(dto, user);
  }
}
```

### Service pattern

```typescript
return this.prisma.$transaction(async (tx) => {
  const supplier = await tx.supplier.findFirst({
    where: { code: dto.supplierCode, deletedAt: null },
  });
  if (!supplier) throw new NotFoundException('SUPPLIER_NOT_FOUND');

  const lines = dto.lines.map((l) => ({
    ...l,
    lineAmount: l.quantity * l.unitPrice,
    restQuantity: l.quantity,
  }));

  const po = await tx.purchaseOrder.create({
    data: {
      supplierCode: supplier.code,
      supplierName: supplier.name,
      poDate: dto.poDate,
      status: '0',
      lines: { create: lines },
    },
    include: { lines: true },
  });
  return { success: true, data: po };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| Create | `/purchase-orders/new` | `inputPOrder.jsp` |
| Edit | `/purchase-orders/[id]` | `inputPOrder.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Create happy path | valid supplier + 2 lines | 201, restQuantity=quantity | Integration | TARGET_DECISION |
| TC-02 | Invalid supplier | bad code | 422 | Unit | LEGACY_CONFIRMED |
| TC-03 | Zero quantity line | qty=0 | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | Line amount calc | qty × price | correct PRICE | Unit | LEGACY_CONFIRMED |
| TC-05 | Delete with receipt | linked SUPPLIER_SLIP | 409 | Integration | LEGACY_CONFIRMED |
| TC-06 | Soft delete | DELETE id | deletedAt set | Integration | INFERRED |
| TC-07 | Permission denied | no write perm | 403 | Unit | INFERRED |
| TC-08 | Hist on update | PATCH | hist records | Integration | LEGACY_CONFIRMED — TBD |

---

## 10. Risked Items

- [ ] Java source không trong workspace — method signatures chưa verify
- [ ] `RATE_MST` foreign currency — UNKNOWN P1 scope
- [ ] Update guard when STATUS≠0 — INFERRED from status diagram
- [ ] `OutputRecommendListAction` (0704), `MakeOutPOrderAction` (0702) — chưa có FD
- [ ] Link to WF-08 `SUPPLIER_SLIP` — parity test needed on delete guard

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | `RATE_MST` usage on PO | Defer if no foreign PO P1 | Medium | Open |
| OQ-02 | INFERRED | Update allowed when STATUS=`0` only? | Block edit after receipt | High | Open |
| OQ-03 | UNKNOWN | Soft-delete read filter SQL | `deletedAt IS NULL` | Medium | Open |
| TD-01 | TARGET_DECISION | `purchaseOrderHist` shape | Snapshot JSON | Medium | Proposed |
| TD-02 | TARGET_DECISION | Search PO (0701) separate FD | FD-PORDER-02 | Low | Proposed |
| TD-03 | TARGET_DECISION | Recommend list integration | Link from FD-PORDER-03 | Medium | Proposed |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-07](../workflows/WF-07-purchase-order.md) |
| Receipt WF | [WF-08](../workflows/WF-08-purchase-receipt.md) |
| Inventory | [_inventory/porder.md](./_inventory/porder.md) |
| Index | [_index.md](./_index.md) |
