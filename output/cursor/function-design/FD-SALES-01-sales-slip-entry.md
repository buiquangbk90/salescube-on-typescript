# FD-SALES-01: Nhập Phiếu Bán Hàng (売上伝票入力)

> **Confidence**: HIGH (WF-04, `InputSalesAction` service injections) / MEDIUM (cost calc FIFO/LIFO)  
> **Evidence file**: [`_evidence/FD-SALES-01-sales-slip-entry.md`](./_evidence/FD-SALES-01-sales-slip-entry.md)  
> **Workflow**: [WF-04 Sales Slip Entry](../workflows/WF-04-sales-slip.md)  
> **Scope**: Copy từ RO, register phiếu bán, EAD auto, cập nhật REST_QUANTITY — **không gồm** report/invoice export (0402/0403)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed | `InputSalesAction` (1147 lines), `SearchSalesAction` — WF-04 |
| Service logic | Confirmed | `SalesService`, `InputStockSalesService`, `RoLineService` — WF-04 |
| DDL mapping | Partial | `SALES_SLIP_TRN` 40+ cols — `02-entity-list.md` §5.1 |
| Workflow coverage | Confirmed | WF-04 |
| Target API design | Target decision | NestJS `SalesOrdersController` |

**Confidence: MEDIUM-HIGH** — Core O2C path confirmed; cost allocation method cần Java spot-check.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Tạo/sửa phiếu bán: copy từ RO, register, tự động xuất kho EAD | LEGACY_CONFIRMED |
| **Module** | `sales` / SALES | LEGACY_CONFIRMED |
| **Actor** | Sales staff có quyền menu 売上 | WF_CONFIRMED |
| **Legacy URLs** | `/sales/inputSales`, `/sales/searchSales` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST/PATCH /api/sales-orders`, `POST .../from-receive-order` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createSalesFromRoSchema` (Zod)

```typescript
const salesLineSchema = z.object({
  roLineId: z.string().optional(),
  productCode: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  rackCodeSrc: z.string().optional(),
});

const createSalesFromRoSchema = z.object({
  roSlipId: z.string().min(1),
  salesDate: z.string().date(),
  deliveryCode: z.string().optional(),
  salesCmCategory: z.string().min(1),
  remarks: z.string().max(2000).optional(),
  codSc: z.enum(['0', '1']).optional(),
  lines: z.array(salesLineSchema).min(1),
});

const createSalesOrderSchema = z.object({
  customerCode: z.string().min(1),
  salesDate: z.string().date(),
  salesCmCategory: z.string().min(1),
  lines: z.array(salesLineSchema.omit({ roLineId: true })).min(1),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `roSlipId` | string | ✓ (from RO flow) | RO exists, not canceled | `RO_SLIP_ID` | LEGACY_CONFIRMED |
| `customerCode` | string | ✓ | exists, not deleted | `CUSTOMER_CODE` | LEGACY_CONFIRMED |
| `salesDate` | date | ✓ | valid date | `SALES_DATE` | LEGACY_CONFIRMED |
| `salesCmCategory` | string | ✓ | in CATEGORY_TRN | `SALES_CM_CATEGORY` | LEGACY_CONFIRMED |
| `lines[].quantity` | int | ✓ | > 0, <= RO rest qty | `QUANTITY` | LEGACY_CONFIRMED / INFERRED |
| `lines[].unitPrice` | decimal | ✓ | >= 0 | `UNIT_PRICE` | LEGACY_CONFIRMED |
| `lines[].rackCodeSrc` | string | | exists if set | `RACK_CODE_SRC` | LEGACY_CONFIRMED |

### Search query — `salesOrderSearchSchema`

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `customerCode` | string | — | Search form |
| `salesDateFrom` | date | — | date range |
| `salesDateTo` | date | — | date range |
| `status` | enum | — | STATUS filter |
| `roSlipId` | string | — | link RO |
| `page` | number | 1 | pager |
| `pageSize` | number | 20 | pager |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Copy from RO | Pre-fill `inputSales.jsp` | WF-04 copy path | LEGACY_CONFIRMED |
| Register success | INSERT slip + EAD + update RO rest | WF-04 register | LEGACY_CONFIRMED |
| Bill closed | `errors.closedBill` block edit | WF-04 VAL #6 | LEGACY_CONFIRMED |
| RO invalid status | `errors.roOrder.status` | WF-04 Error | INFERRED |
| Stock warning | Warning, continue | WF-04 Error | LEGACY_CONFIRMED |

### Target Response

```typescript
type SalesOrderLineDto = {
  salesLineId: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  roLineId?: string;
};

type SalesOrderDto = {
  id: string;
  roSlipId?: string;
  customerCode: string;
  customerName: string;
  salesDate: string;
  status: '1' | '2' | '3' | '9';
  billId?: string;
  priceTotal: number;
  lines: SalesOrderLineDto[];
  eadSlipId?: string;
};

type ListSalesOrdersResponse = {
  data: SalesOrderDto[];
  total: number;
  page: number;
  pageSize: number;
};
```

| Field | Provenance |
|-------|------------|
| `eadSlipId` | LEGACY_CONFIRMED (auto on register) |
| `status` | LEGACY_CONFIRMED (`1` Temp → `2` Confirmed → `3` Bill closed) |
| Customer snapshot cols | LEGACY_CONFIRMED (denormalized in slip) |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Copy RO → map header + lines vào SALES form | LEGACY_CONFIRMED | WF-04 copy path | Info |
| BR-02 | Register INSERT SALES_SLIP + SALES_LINE + HIST | LEGACY_CONFIRMED | WF-04 | Block |
| BR-03 | `RoLineService.updateRestQuantity()` giảm REST trên RO | LEGACY_CONFIRMED | WF-04 register | Block |
| BR-04 | `InputStockSalesService.createEadSlip()` tự động sau register | LEGACY_CONFIRMED | WF-04 | Block |
| BR-05 | EAD cập nhật `PRODUCT_STOCK_TRN` (giảm tồn) | LEGACY_CONFIRMED | WF-04 WRITE | Block |
| BR-06 | Snapshot 40+ cột KH/delivery vào SALES_SLIP | LEGACY_CONFIRMED | WF-04 WRITE | Info |
| BR-07 | `calcCost()` tính giá vốn từ stock | LEGACY_CONFIRMED | WF-04 register | Info |
| BR-08 | `DiscountUtil.calcDiscount()` trên lines | LEGACY_CONFIRMED | WF-04 | Info |
| BR-09 | `BILL_ID` set → không sửa phiếu | LEGACY_CONFIRMED | WF-04 VAL #6 | Block |
| BR-10 | RO STATUS cập nhật khi REST_QUANTITY thay đổi | INFERRED | WF-03 diagram | Info |
| BR-11 | COD: `COD_SC = '1'` | LEGACY_CONFIRMED | WF-04 External | Info |
| TD-01 | Target: EAD trong cùng `$transaction` với SALES | TARGET_DECISION | atomicity | Block |
| TD-02 | Target: `cuid()` thay SEQ_MAKER | TARGET_DECISION | convention | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `customerCode` | Required, exists | 422 / 404 | LEGACY_CONFIRMED | WF-04 #1 |
| VAL-02 | `salesDate` | Required | 422 | LEGACY_CONFIRMED | WF-04 #2 |
| VAL-03 | `lines[].productCode` | Required, exists | 422 | LEGACY_CONFIRMED | WF-04 #3 |
| VAL-04 | `lines[].quantity` | > 0 | 422 | LEGACY_CONFIRMED | WF-04 #4 |
| VAL-05 | `lines[].unitPrice` | >= 0 | 422 | LEGACY_CONFIRMED | WF-04 #4 |
| VAL-06 | `lines[].rackCodeSrc` | Exists if provided | 422 | LEGACY_CONFIRMED | WF-04 #5 |
| VAL-07 | update | `billId` IS NULL | 409 | LEGACY_CONFIRMED | WF-04 #6 |
| VAL-08 | `salesCmCategory` | Valid CATEGORY_TRN | 422 | LEGACY_CONFIRMED | WF-04 #8 |
| VAL-09 | from RO | `quantity <= roLine.restQuantity` | 422 | INFERRED | partial fulfill |
| VAL-10 | from RO | RO status not `9` | 409 | INFERRED | WF-04 Error |
| VAL-11 | double submit | Token valid | 409 | LEGACY_CONFIRMED | WF-04 #7 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Bill đã chốt | `errors.closedBill` | WF-04 |
| Product không tồn tại | `errors.notExist` | WF-04 |
| RO canceled/completed | `errors.roOrder.status` | INFERRED |
| Stock không đủ | Warning + continue | WF-04 |
| Double submit | Token check | WF-04 |
| Lock | `errors.lock` | WF-04 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |
| Bill closed | 409 | `BILL_ALREADY_CLOSED` | TARGET_DECISION |
| RO invalid | 409 | `INVALID_RO_STATUS` | TARGET_DECISION |
| Rest qty exceeded | 422 | `EXCEEDS_RO_REST_QUANTITY` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| EAD failure | 500 / rollback | `EAD_CREATION_FAILED` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `RO_SLIP_TRN` / `RO_LINE_TRN` | Copy source | `receiveOrder` | by id | LEGACY_CONFIRMED |
| `SALES_SLIP_TRN` | Search/detail | `salesOrder` | criteria | LEGACY_CONFIRMED |
| `SALES_LINE_TRN` | Lines | `salesOrderLine` | by slip | LEGACY_CONFIRMED |
| `CUSTOMER_MST` | Lookup + snapshot | `customer` | active | LEGACY_CONFIRMED |
| `DELIVERY_MST` | Delivery list | TBD | by customer | LEGACY_CONFIRMED |
| `PRODUCT_MST` | Line lookup | `product` | | LEGACY_CONFIRMED |
| `PRODUCT_STOCK_TRN` | Cost + stock | TBD | | LEGACY_CONFIRMED |
| `RACK_MST` | Rack validation | TBD | | LEGACY_CONFIRMED |
| `BILL_TRN` | Closed guard | TBD | billId on slip | LEGACY_CONFIRMED |
| `DISCOUNT_*` | Discount | TBD | | LEGACY_CONFIRMED |
| `TAX_RATE_MST` | Tax | TBD | | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `SALES_SLIP_TRN` | INSERT/UPDATE | `salesOrder` | Snapshot cols | LEGACY_CONFIRMED |
| `SALES_LINE_TRN` | INSERT/UPDATE/DELETE | `salesOrderLine` | | LEGACY_CONFIRMED |
| `SALES_SLIP_TRN_HIST` | INSERT | TBD | | LEGACY_CONFIRMED |
| `SALES_LINE_TRN_HIST` | INSERT | TBD | | LEGACY_CONFIRMED |
| `RO_LINE_TRN` | UPDATE rest qty | `receiveOrderLine` | decrement | LEGACY_CONFIRMED |
| `RO_SLIP_TRN` | UPDATE status | `receiveOrder` | 1→2→3 | INFERRED |
| `EAD_SLIP_TRN` | INSERT | `eadSlip` | auto | LEGACY_CONFIRMED |
| `EAD_LINE_TRN` | INSERT | `eadLine` | auto | LEGACY_CONFIRMED |
| `PRODUCT_STOCK_TRN` | UPDATE | TBD | via EAD | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** Single `$transaction`: SALES insert + RO rest update + EAD + stock — TARGET_DECISION (parity critical).

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0401` (`searchSales`) | `isMenuValid` | `sales-order.read` | GET list/detail |
| `0400` (`inputSales`) | `isMenuValid` | `sales-order.read` | GET detail, copy preview |
| `0400` | `isMenuUpdate` | `sales-order.write` | POST, PATCH |

> **Evidence:** `03-route-api-inventory.md` §3.3 (MENU_ID 0400, 0401), WF-04 § User Role.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/sales-orders` | `searchSales` | `sales-order.read` |
| GET | `/api/sales-orders/:id` | `inputSales/edit` | `sales-order.read` |
| GET | `/api/sales-orders/from-receive-order/:roId` | `copy` preview | `sales-order.read` |
| POST | `/api/sales-orders/from-receive-order` | `copy` + `register` | `sales-order.write` |
| POST | `/api/sales-orders` | `register` direct | `sales-order.write` |
| PATCH | `/api/sales-orders/:id` | `register` update | `sales-order.write` |

```typescript
@Controller('sales-orders')
@UseGuards(AuthGuard, PermissionGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get('from-receive-order/:roId')
  @RequirePermission('sales-order.read')
  previewFromRo(@Param('roId') roId: string) {
    return this.salesOrdersService.buildFromReceiveOrder(roId);
  }

  @Post('from-receive-order')
  @RequirePermission('sales-order.write')
  createFromRo(@Body() dto: CreateSalesFromRoInput, @CurrentUser() user: UserDto) {
    return this.salesOrdersService.createFromReceiveOrder(dto, user);
  }
}
```

### Service pattern (create from RO)

```typescript
return this.prisma.$transaction(async (tx) => {
  const ro = await this.roService.findOpenWithLines(dto.roSlipId);
  this.validateRestQuantities(ro, dto.lines);

  const sales = await tx.salesOrder.create({
    data: {
      roSlipId: ro.id,
      status: '1',
      ...mapCustomerSnapshot(ro),
      lines: { create: mapLines(dto.lines) },
    },
  });

  for (const line of dto.lines) {
    await this.roLineService.decrementRestQuantity(tx, line.roLineId, line.quantity);
  }

  const ead = await this.stockSalesService.createEadSlip(tx, sales, user);
  await this.histService.snapshot(tx, sales);

  return { success: true, data: { ...sales, eadSlipId: ead.id } };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| List | `/sales-orders` | `searchSales.jsp` |
| Create from RO | `/sales-orders/new?roId=` | `inputSales.jsp` (copy) |
| Edit | `/sales-orders/[id]` | `inputSales.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Preview from RO | GET from-receive-order/:id | pre-filled DTO | Integration | LEGACY_CONFIRMED |
| TC-02 | Create from RO | valid lines | 201 + eadSlipId | Integration | LEGACY_CONFIRMED |
| TC-03 | REST_QUANTITY decremented | qty 5 from rest 10 | rest = 5 | Integration | LEGACY_CONFIRMED |
| TC-04 | Exceed rest qty | qty > rest | 422 | Integration | INFERRED |
| TC-05 | EAD + stock updated | register | EAD row + stock down | Integration | LEGACY_CONFIRMED |
| TC-06 | Bill closed guard | PATCH with billId | 409 | Integration | LEGACY_CONFIRMED |
| TC-07 | RO canceled | ro status 9 | 409 | Integration | INFERRED |
| TC-08 | Transaction rollback on EAD fail | mock EAD error | no SALES row | Integration | TARGET_DECISION |
| TC-09 | Search list | query params | paginated | Unit | TARGET_DECISION |
| TC-10 | Permission denied | no write | 403 | Unit | LEGACY_CONFIRMED |

---

## 10. Risked Items

- [ ] FIFO/LIFO trong `calcCost()` — INFERRED, cần characterization test
- [ ] Partial fulfillment rules (multiple SALES per RO line) — cần Java confirm
- [ ] SALES delete/cancel + EAD reverse — ngoài scope register, cần FD riêng
- [ ] 40+ snapshot columns parity — migration mapping lớn
- [ ] Report export (0402/0403) — tách WF-12 / FD riêng

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Cost method FIFO vs LIFO vs average | Match legacy characterization | High | Open |
| OQ-02 | UNKNOWN | Multiple partial SALES per RO line ordering | Serial by salesDate | Medium | Open |
| OQ-03 | INFERRED | Auto STATUS `2` Confirmed on register? | Keep `1` until explicit confirm | Medium | Open |
| TD-01 | TARGET_DECISION | Single endpoint `from-receive-order` vs two-step | Preview GET + POST | Medium | Proposed |
| TD-02 | TARGET_DECISION | Snapshot as JSON column vs flat 40 cols | Flat cols parity P1 | High | Proposed |
| AS-01 | ASSUMPTION | `createEadSlip` always on register | Same transaction | High | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-04](../workflows/WF-04-sales-slip.md) |
| Related WF | [WF-03](../workflows/WF-03-receive-order.md) (RO REST_QUANTITY) |
| Related FD | [FD-RORDER-01](./FD-RORDER-01-receive-order-crud.md) |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) |
| Screen | [07-screen-route-mapping.md](../07-screen-route-mapping.md) |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.3 |
| Inventory | [_inventory/sales.md](./_inventory/sales.md) |
| Index | [_index.md](./_index.md) |
