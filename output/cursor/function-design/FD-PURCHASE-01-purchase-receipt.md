# FD-PURCHASE-01: Nhập Hàng từ NCC (仕入入力 – Purchase Receipt)

> **Confidence**: HIGH (WF-08, route inventory) / MEDIUM (Java line-level — source ngoài workspace)  
> **Evidence file**: [`_evidence/FD-PURCHASE-01-purchase-receipt.md`](./_evidence/FD-PURCHASE-01-purchase-receipt.md)  
> **Workflow**: [WF-08 Purchase Receipt](../workflows/WF-08-purchase-receipt.md)  
> **Scope**: Tạo/sửa/xóa phiếu nhập hàng (`SUPPLIER_SLIP_TRN`), liên kết PO, tự động EAD nhập kho

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) | `InputPurchaseAction.java` — WF-08 |
| Service logic | Confirmed | `SupplierSlipService`, `InputStockPurchaseService` — WF-08 |
| DDL mapping | Confirmed (via WF) | `SUPPLIER_SLIP_TRN`, `SUPPLIER_LINE_TRN` — WF-08 |
| Workflow coverage | Confirmed | WF-08 |
| Target API design | Target decision | NestJS `PurchaseReceiptsController` |

**Confidence: MEDIUM-HIGH** — Flow và services confirmed từ WF; method-level cần verify khi có `SalesCube/`.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Nhập phiếu 仕入 từ NCC, liên kết PO, cập nhật tồn kho qua EAD | LEGACY_CONFIRMED |
| **Module** | `purchase` / PURCHASE | LEGACY_CONFIRMED |
| **Actor** | User có quyền menu Nhập hàng | LEGACY_CONFIRMED |
| **Legacy URLs** | `/purchase/inputPurchase`, `/purchase/searchPurchase` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST/PATCH/DELETE /api/purchase-receipts` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createPurchaseReceiptSchema` (Zod)

```typescript
const purchaseReceiptLineSchema = z.object({
  productCode: z.string().min(1),
  quantity: z.number().positive(),
  rackCode: z.string().min(1),
  poLineId: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
  taxPrice: z.number().nonnegative().optional(),
});

const createPurchaseReceiptSchema = z.object({
  supplierCode: z.string().min(1),
  supplierDate: z.coerce.date(),
  lines: z.array(purchaseReceiptLineSchema).min(1).max(35),
  remarks: z.string().max(2000).optional(),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `supplierCode` | string | ✓ | exists in SUPPLIER_MST | `SUPPLIER_CODE` | LEGACY_CONFIRMED |
| `supplierDate` | date | ✓ | valid date | `SUPPLIER_DATE` | LEGACY_CONFIRMED |
| `productCode` (line) | string | ✓ | exists | `PRODUCT_CODE` | LEGACY_CONFIRMED |
| `quantity` (line) | number | ✓ | > 0 | `QUANTITY` | LEGACY_CONFIRMED |
| `rackCode` (line) | string | ✓ | exists in RACK_MST | `RACK_CODE` | LEGACY_CONFIRMED |
| `poLineId` (line) | string | | exists if linked | `PO_LINE_ID` | LEGACY_CONFIRMED |
| `lines` count | array | ✓ | max 35 | `MAX_LINE_ROW_COUNT` | LEGACY_CONFIRMED |

### Search query — `purchaseReceiptSearchSchema`

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `supplierCode` | string | — | Search form |
| `dateFrom` / `dateTo` | date | — | Date range |
| `page` | number | 1 | pager |
| `pageSize` | number | 20 | pager |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Create/edit load | Render `inputPurchase.jsp` + PO pending list | WF-08 | LEGACY_CONFIRMED |
| Register success | Stay on form + flash / complete view | `AbstractEditAction` pattern | INFERRED |
| Validation error | Same JSP + ActionErrors | Struts | INFERRED |
| Delete success | Redirect search | WF-08 routes | INFERRED |

### Target Response

```typescript
type PurchaseReceiptLineDto = {
  id: string;
  productCode: string;
  quantity: number;
  rackCode: string;
  poLineId?: string;
};

type PurchaseReceiptDto = {
  id: string;
  supplierCode: string;
  supplierDate: string;
  status: 'OPEN' | 'PAYMENT_LINKED';
  lines: PurchaseReceiptLineDto[];
  eadSlipId?: string;
};

type ListPurchaseReceiptsResponse = {
  data: PurchaseReceiptDto[];
  total: number;
  page: number;
  pageSize: number;
};
```

| Field | Provenance |
|-------|------------|
| `id` cuid | TARGET_DECISION (thay `SEQ_MAKER`) |
| `eadSlipId` | LEGACY_CONFIRMED (auto EAD on save) |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | `SUPPLIER_CODE` phải tồn tại — snapshot NCC vào slip | LEGACY_CONFIRMED | WF-08 VAL #1 | Block |
| BR-02 | Mỗi line `QUANTITY` > 0 | LEGACY_CONFIRMED | WF-08 VAL #4 | Block |
| BR-03 | Mỗi line `RACK_CODE` required | LEGACY_CONFIRMED | WF-08 VAL #5 | Block |
| BR-04 | Liên kết PO: giảm `PO_LINE_TRN.REST_QUANTITY` | LEGACY_CONFIRMED | WF-08 | Block |
| BR-05 | Khi tất cả PO lines REST=0 → `PO_SLIP_TRN.STATUS` = "3" | LEGACY_CONFIRMED | WF-08 | Info |
| BR-06 | Lưu slip → auto `InputStockPurchaseService.createEadSlip()` | LEGACY_CONFIRMED | WF-08 | Block |
| BR-07 | EAD → tăng `PRODUCT_STOCK_TRN.ENTER_NUM` + `STOCK_NUM` | LEGACY_CONFIRMED | WF-08 | Block |
| BR-08 | Max 35 lines per slip | LEGACY_CONFIRMED | WF-08, `InputPurchaseAction.java:78` | Block |
| BR-09 | Quantity > PO REST → warning, không block | INFERRED | WF-08 VAL #7 | Warn |
| BR-10 | `STATUS` "1" khi link PAYMENT (WF-09) | LEGACY_CONFIRMED | WF-08 | Info |
| TD-01 | Target gộp slip + EAD + stock trong `$transaction` | TARGET_DECISION | parity safety | Block |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `supplierCode` | Required, exists | 422 / 404 | LEGACY_CONFIRMED | WF-08 |
| VAL-02 | `supplierDate` | Required, valid date | 422 | LEGACY_CONFIRMED | WF-08 |
| VAL-03 | `productCode` | Required per line | 422 | LEGACY_CONFIRMED | WF-08 |
| VAL-04 | `quantity` | > 0 | 422 | LEGACY_CONFIRMED | WF-08 |
| VAL-05 | `rackCode` | Required, exists | 422 / 404 | LEGACY_CONFIRMED | WF-08 |
| VAL-06 | `poLineId` | Exists if provided | 404 | LEGACY_CONFIRMED | WF-08 |
| VAL-07 | `lines` | Max 35 | 422 | LEGACY_CONFIRMED | WF-08 |
| VAL-08 | `poLineId` | quantity ≤ REST (warn legacy) | 409 TBD | INFERRED | WF-08 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| NCC không tồn tại | `errors.notExist` | WF-08 |
| PO_LINE không tồn tại | `errors.notExist` | WF-08 |
| Rack không tồn tại | `errors.notExist` | WF-08 |
| Max lines | `errors.maxLine` | INFERRED |
| ServiceException | Log + throw | WF-08 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Not found (supplier/product/rack) | 404 | `NOT_FOUND` | TARGET_DECISION |
| Max lines exceeded | 422 | `MAX_LINES_EXCEEDED` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| EAD/stock failure (rollback) | 500 | `TRANSACTION_FAILED` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `SUPPLIER_MST` | Lookup + snapshot | `supplier` | active | LEGACY_CONFIRMED |
| `PO_SLIP_TRN` / `PO_LINE_TRN` | PO pending | `poSlip` / `poLine` | `REST_QUANTITY > 0` | LEGACY_CONFIRMED |
| `PRODUCT_MST` | Line lookup | `product` | active | LEGACY_CONFIRMED |
| `RACK_MST` | Kệ nhập | `rack` | active | LEGACY_CONFIRMED |
| `RATE_MST` / `RATE_TRN` | Ngoại tệ (nếu có) | TBD | | LEGACY_CONFIRMED |
| `SUPPLIER_SLIP_TRN` | Search/edit | `supplierSlip` | | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `SUPPLIER_SLIP_TRN` | INSERT/UPDATE | `supplierSlip` | Header | LEGACY_CONFIRMED |
| `SUPPLIER_LINE_TRN` | INSERT/UPDATE/DELETE | `supplierLine` | Lines | LEGACY_CONFIRMED |
| `SUPPLIER_SLIP_TRN_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `PO_LINE_TRN` | UPDATE REST | `poLine` | Giảm REST | LEGACY_CONFIRMED |
| `EAD_SLIP_TRN` / `EAD_LINE_TRN` | INSERT | `eadSlip` / `eadLine` | Auto nhập kho | LEGACY_CONFIRMED |
| `PRODUCT_STOCK_TRN` | UPDATE | `productStock` | ENTER_NUM, STOCK_NUM | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** `$transaction` bắt buộc — slip + lines + PO REST + EAD + stock — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0800` (`INPUT_PURCHASE`) | `isMenuValid` | `purchase-receipt.read` | GET list/detail |
| `0800` | `isMenuUpdate` | `purchase-receipt.write` | POST, PATCH |
| `0800` | `isMenuUpdate` (delete) | `purchase-receipt.delete` | DELETE |
| `0801` (`SEARCH_PURCHASE`) | `isMenuValid` | `purchase-receipt.read` | GET search |

> **Evidence:** `03-route-api-inventory.md:117-118`, WF-08 § User Role.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/purchase-receipts` | `searchPurchase` | `purchase-receipt.read` |
| GET | `/api/purchase-receipts/:id` | `inputPurchase/edit` | `purchase-receipt.read` |
| GET | `/api/purchase-receipts/pending-po` | PO picker | `purchase-receipt.read` |
| POST | `/api/purchase-receipts` | `register` create | `purchase-receipt.write` |
| PATCH | `/api/purchase-receipts/:id` | `register` update | `purchase-receipt.write` |
| DELETE | `/api/purchase-receipts/:id` | `delete` | `purchase-receipt.delete` |

```typescript
@Controller('purchase-receipts')
@UseGuards(AuthGuard, PermissionGuard)
export class PurchaseReceiptsController {
  constructor(private readonly service: PurchaseReceiptsService) {}

  @Post()
  @RequirePermission('purchase-receipt.write')
  create(@Body() dto: CreatePurchaseReceiptInput, @CurrentUser() user: UserDto) {
    return this.service.create(dto, user);
  }
}
```

### Service pattern

```typescript
return this.prisma.$transaction(async (tx) => {
  const slip = await tx.supplierSlip.create({ data: { ...header, createdBy: user.id } });
  for (const line of dto.lines) {
    await tx.supplierLine.create({ data: { slipId: slip.id, ...line } });
    if (line.poLineId) {
      await tx.poLine.update({
        where: { id: line.poLineId },
        data: { restQuantity: { decrement: line.quantity } },
      });
    }
  }
  await this.stockService.createPurchaseEad(tx, slip, dto.lines);
  return { success: true, data: slip };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| List | `/purchase-receipts` | `searchPurchase.jsp` |
| Create | `/purchase-receipts/new` | `inputPurchase.jsp` |
| Edit | `/purchase-receipts/[id]` | `inputPurchase.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Create happy path | valid slip + lines | 201 + EAD created | Integration | TARGET_DECISION |
| TC-02 | Missing supplier | invalid dto | 422 | Unit | LEGACY_CONFIRMED |
| TC-03 | Max 36 lines | 36 lines | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | PO REST decrement | line with poLineId | REST reduced | Integration | LEGACY_CONFIRMED |
| TC-05 | Stock increase | save slip | STOCK_NUM += qty | Integration | LEGACY_CONFIRMED |
| TC-06 | Invalid rack | bad rackCode | 404 | Unit | LEGACY_CONFIRMED |
| TC-07 | Permission denied | no write perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-08 | Transaction rollback | EAD fails mid-save | no partial slip | Integration | TARGET_DECISION |

---

## 10. Risked Items

- [ ] Java source không trong workspace — `InputPurchaseAction.register()` chưa verify
- [ ] Delete reversal (EAD + stock + PO REST) — chưa trace đầy đủ
- [ ] Warning vs block khi quantity > PO REST — INFERRED
- [ ] Ngoại tệ `DOL_PRICE` calculation — chưa detail trong WF
- [ ] Optimistic lock trên SUPPLIER_SLIP — UNKNOWN

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Delete flow reversal logic | Characterization test | High | Open |
| OQ-02 | INFERRED | Quantity > PO REST: warn only? | Match legacy warn | Medium | Open |
| TD-01 | TARGET_DECISION | EAD service shared module vs inline | `StockEadService` inject | High | Proposed |
| TD-02 | TARGET_DECISION | PO completion status mapping | Enum `PO_STATUS.COMPLETE` | Medium | Proposed |
| AS-01 | ASSUMPTION | `SearchPurchaseAction` separate FD | Same read endpoints | Low | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-08](../workflows/WF-08-purchase-receipt.md) |
| WF stock side-effect | [WF-14](../workflows/WF-14-stock-management.md) |
| Payment link | [WF-09](../workflows/WF-09-payment-to-supplier.md) |
| Route | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.7 |
| Index | [_index.md](./_index.md) |
