# FD-RORDER-02: Import Đơn Hàng EC Online (オンライン受注取込)

> **Confidence**: HIGH (WF-10, `ImportOnlineOrderAction` line refs) / MEDIUM (CSV column variants)  
> **Evidence file**: [`_evidence/FD-RORDER-02-online-order-import.md`](./_evidence/FD-RORDER-02-online-order-import.md)  
> **Workflow**: [WF-10 Online Order Import](../workflows/WF-10-online-order-import.md)  
> **Scope**: Upload CSV → `ONLINE_ORDER_WORK` → tạo `RO_SLIP_TRN` + `RO_LINE_TRN` + `ONLINE_ORDER_REL`

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed | `ImportOnlineOrderAction` extends `AbstractXSVUploadAction` — WF-10 |
| Service logic | Confirmed | `ImportOnlineOrderService`, `OnlineOrderService` — WF-10 |
| DDL mapping | Confirmed | `ONLINE_ORDER_WORK` PK composite — WF-10 |
| Workflow coverage | Confirmed | WF-10 |
| Target API design | Target decision | NestJS `OnlineOrderImportController` |

**Confidence: HIGH** — Flow init/upload/update documented với Java line anchors trong WF-10.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Import file CSV/TSV đơn EC → staging WORK → batch tạo RO | LEGACY_CONFIRMED |
| **Module** | `rorder` / RORDER | LEGACY_CONFIRMED |
| **Actor** | User có quyền MENU 0303 (`importOnlineOrder`) | LEGACY_CONFIRMED |
| **Legacy URLs** | `/rorder/importOnlineOrder/*` | LEGACY_CONFIRMED |
| **Target API** | `POST /api/receive-orders/import/*` | TARGET_DECISION |
| **Trigger** | User upload file + confirm process | LEGACY_CONFIRMED |

---

## 2. Input

### Target — upload schema

```typescript
const onlineOrderImportUploadSchema = z.object({
  file: z.instanceof(File), // multipart — CSV or TSV
  encoding: z.enum(['UTF-8', 'Shift_JIS']).default('UTF-8'),
});

const onlineOrderImportProcessSchema = z.object({
  stopOnError: z.boolean().default(false), // maps isStopOnError()
});
```

### CSV row → `OnlineOrderWorkDto` (legacy columns)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `onlineOrderId` | string | ✓ | not empty | `ONLINE_ORDER_ID` | LEGACY_CONFIRMED |
| `onlineItemId` | string | ✓ | not empty | `ONLINE_ITEM_ID` | LEGACY_CONFIRMED |
| `sku` | string | ✓ | match `PRODUCT_MST.ONLINE_PCODE` | `SKU` | LEGACY_CONFIRMED |
| `quantity` | int | ✓ | > 0 | `QUANTITY` | LEGACY_CONFIRMED |
| `price` | decimal | | >= 0 | `PRICE` | LEGACY_CONFIRMED |
| `customerEmail` | string | | | `CUSTOMER_EMAIL` | LEGACY_CONFIRMED |
| `recipientName` | string | | | `RECIPIENT_NAME` | LEGACY_CONFIRMED |
| `zipCode` | string | | | `ZIP_CODE` | LEGACY_CONFIRMED |
| `address1` | string | | | `ADDRESS_*` | LEGACY_CONFIRMED |
| `supplierDate` | date | | | `SUPPLIER_DATE` | LEGACY_CONFIRMED |

**PK staging:** `(USER_ID, ONLINE_ORDER_ID, ONLINE_ITEM_ID)` — LEGACY_CONFIRMED (WF-10)

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| init() | Xóa toàn bộ WORK của user | WF-10 init path | LEGACY_CONFIRMED |
| upload() | Parse file → INSERT WORK → show list | WF-10 | LEGACY_CONFIRMED |
| update() | Group by order → INSERT RO + REL → delete WORK | WF-10 | LEGACY_CONFIRMED |
| SKU no match | Warning, skip row | WF-10 Error | LEGACY_CONFIRMED |
| Duplicate PK | Reject row | WF-10 VAL #6 | LEGACY_CONFIRMED |
| cancel() | Rollback WORK (inferred) | WF-10 route | INFERRED |

### Target Response

```typescript
type OnlineOrderWorkRowDto = {
  onlineOrderId: string;
  onlineItemId: string;
  sku: string;
  quantity: number;
  matchedProductCode?: string;
  warnings?: string[];
};

type ImportUploadResponse = {
  rows: OnlineOrderWorkRowDto[];
  totalRows: number;
  skippedRows: number;
};

type ImportProcessResponse = {
  createdOrders: { roSlipId: string; onlineOrderId: string }[];
  warnings: string[];
};
```

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | init/upload trước update: WORK scoped theo USER_ID | LEGACY_CONFIRMED | WF-10 VAL #7 | Block |
| BR-02 | 1 `ONLINE_ORDER_ID` → 1 `RO_SLIP_TRN` | LEGACY_CONFIRMED | WF-10 update flow | Block |
| BR-03 | Mỗi item → 1 `RO_LINE_TRN`, REST_QUANTITY = QUANTITY | LEGACY_CONFIRMED | WF-10, WF-03 | Block |
| BR-04 | SKU match `PRODUCT_MST.ONLINE_PCODE` | LEGACY_CONFIRMED | WF-10 VAL #4 | Block (skip) |
| BR-05 | INSERT `ONLINE_ORDER_REL` link EC → RO | LEGACY_CONFIRMED | WF-10 WRITE | Info |
| BR-06 | Sau update thành công: delete WORK rows | LEGACY_CONFIRMED | WF-10 Status | Info |
| BR-07 | RO STATUS = `"1"` sau import | LEGACY_CONFIRMED | WF-10 | Info |
| BR-08 | Snapshot địa chỉ từ WORK vào RO header | LEGACY_CONFIRMED | WF-10 update | Info |
| BR-09 | Ghi RO_HIST sau tạo | LEGACY_CONFIRMED | WF-10 WRITE | Info |
| BR-10 | `isStopOnError()` true → abort toàn batch | LEGACY_CONFIRMED | WF-10 Error | Block |
| TD-01 | Target: async job cho file lớn | TARGET_DECISION | scalability | Info |
| TD-02 | Target: persist WORK in DB vs memory | TARGET_DECISION | parity WORK table | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | file | Required, CSV/TSV | 422 | LEGACY_CONFIRMED | WF-10 |
| VAL-02 | `onlineOrderId` | Required | 422 skip row | LEGACY_CONFIRMED | WF-10 #2 |
| VAL-03 | `onlineItemId` | Required | 422 skip row | LEGACY_CONFIRMED | WF-10 #3 |
| VAL-04 | `sku` | Match ONLINE_PCODE | warning skip | LEGACY_CONFIRMED | WF-10 #4 |
| VAL-05 | `quantity` | > 0 | 422 skip row | LEGACY_CONFIRMED | WF-10 #5 |
| VAL-06 | duplicate key | Unique (user, order, item) | 409 row | LEGACY_CONFIRMED | WF-10 #6 |
| VAL-07 | process | WORK not empty | 422 | INFERRED | WF-10 flow |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| File format sai | `AbstractXSVUploadAction` reject | WF-10 |
| SKU không match | Warning per row, skip | WF-10 |
| Duplicate PK | Reject row | WF-10 |
| stopOnError = true | throw, stop batch | WF-10 line 86-89 |
| ServiceException soft | log + continue | WF-10 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Invalid file | 422 | `INVALID_IMPORT_FILE` | TARGET_DECISION |
| Row validation | 200 + row errors | `IMPORT_ROW_SKIPPED` | TARGET_DECISION |
| Batch aborted | 409 | `IMPORT_STOPPED_ON_ERROR` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| No WORK to process | 422 | `IMPORT_WORK_EMPTY` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `ONLINE_ORDER_WORK` | Staged rows | `onlineOrderWork` | USER_ID = current | LEGACY_CONFIRMED |
| `PRODUCT_MST` | SKU → product | `product` | ONLINE_PCODE match | LEGACY_CONFIRMED |
| `CUSTOMER_MST` | Lookup by email | `customer` | INFERRED | ASSUMPTION |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `ONLINE_ORDER_WORK` | DELETE ALL (init) / INSERT / DELETE | staging table | per user | LEGACY_CONFIRMED |
| `RO_SLIP_TRN` | INSERT | `receiveOrder` | 1 per EC order | LEGACY_CONFIRMED |
| `RO_LINE_TRN` | INSERT | `receiveOrderLine` | N per order | LEGACY_CONFIRMED |
| `ONLINE_ORDER_REL` | INSERT | TBD | EC id → ro id | LEGACY_CONFIRMED |
| `RO_SLIP_TRN_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `RO_LINE_TRN_HIST` | INSERT | TBD | Per line | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** `$transaction` per EC order (slip + lines + rel + hist) — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0303` (`importOnlineOrder`) | `isMenuValid` | `receive-order.import.read` | GET preview |
| `0303` | `isMenuUpdate` | `receive-order.import.write` | init, upload, process |

> **Evidence:** `03-route-api-inventory.md` §3.2 MENU_ID 0303, WF-10 User Role lines 62-65.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| POST | `/api/receive-orders/import/init` | `init` | `receive-order.import.write` |
| POST | `/api/receive-orders/import/upload` | `upload` | `receive-order.import.write` |
| GET | `/api/receive-orders/import/preview` | `redraw` | `receive-order.import.read` |
| POST | `/api/receive-orders/import/process` | `update` | `receive-order.import.write` |
| POST | `/api/receive-orders/import/cancel` | `cancel` | `receive-order.import.write` |

```typescript
@Controller('receive-orders/import')
@UseGuards(AuthGuard, PermissionGuard)
export class OnlineOrderImportController {
  constructor(private readonly importService: OnlineOrderImportService) {}

  @Post('upload')
  @RequirePermission('receive-order.import.write')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: UserDto) {
    return this.importService.upload(file, user);
  }

  @Post('process')
  @RequirePermission('receive-order.import.write')
  process(@Body() dto: ProcessImportDto, @CurrentUser() user: UserDto) {
    return this.importService.processToReceiveOrders(user, dto.stopOnError);
  }
}
```

### Service pattern (process)

```typescript
const workRows = await tx.onlineOrderWork.findMany({ where: { userId: user.id } });
const grouped = groupBy(workRows, 'onlineOrderId');

for (const [onlineOrderId, items] of Object.entries(grouped)) {
  await this.prisma.$transaction(async (tx) => {
    const lines = [];
    for (const row of items) {
      const product = await this.productService.findByOnlinePcode(row.sku);
      if (!product) { warnings.push(`SKU ${row.sku} skipped`); continue; }
      lines.push({ productCode: product.code, quantity: row.quantity, restQuantity: row.quantity });
    }
    if (lines.length === 0) return;
    const ro = await tx.receiveOrder.create({ data: { status: '1', lines: { create: lines } } });
    await tx.onlineOrderRel.create({ data: { onlineOrderId, roSlipId: ro.id } });
  });
}
await tx.onlineOrderWork.deleteMany({ where: { userId: user.id } });
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| Import | `/receive-orders/import` | `importOnlineOrder.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | init clears WORK | POST init | empty preview | Integration | LEGACY_CONFIRMED |
| TC-02 | Valid CSV upload | 2 orders, 3 lines | WORK rows + preview | Integration | LEGACY_CONFIRMED |
| TC-03 | SKU not found | unknown sku | row skipped + warning | Integration | LEGACY_CONFIRMED |
| TC-04 | Duplicate order+item | same PK twice | row rejected | Integration | LEGACY_CONFIRMED |
| TC-05 | Process creates RO | POST process | N RO + ONLINE_ORDER_REL | Integration | LEGACY_CONFIRMED |
| TC-06 | WORK cleanup after process | after process | WORK empty | Integration | LEGACY_CONFIRMED |
| TC-07 | stopOnError true | 1 bad row | batch abort 409 | Integration | LEGACY_CONFIRMED |
| TC-08 | User isolation | user A/B | A không thấy WORK của B | Integration | LEGACY_CONFIRMED |
| TC-09 | Permission denied | no import perm | 403 | Unit | LEGACY_CONFIRMED |

---

## 10. Risked Items

- [ ] Customer lookup by email — INFERRED, chưa confirm Java
- [ ] CSV format Amazon vs Rakuten column order — cần sample files
- [ ] Large file performance — legacy sync HTTP; target cần job queue?
- [ ] Partial process rollback semantics — UNKNOWN vs cancel()

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Customer match: email vs name vs new guest? | Match email → CUSTOMER_MST | High | Open |
| OQ-02 | UNKNOWN | Multi-currency PRICE handling | JPY only P1 | Medium | Open |
| TD-01 | TARGET_DECISION | BullMQ async import | Sync P1, async P2 | Medium | Proposed |
| TD-02 | TARGET_DECISION | Keep WORK table vs temp Redis | Keep WORK parity | Medium | Proposed |
| AS-01 | ASSUMPTION | Encoding Shift_JIS for Rakuten exports | Auto-detect | Low | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-10](../workflows/WF-10-online-order-import.md) |
| Related FD | [FD-RORDER-01](./FD-RORDER-01-receive-order-crud.md) (manual RO CRUD) |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) |
| Screen | [07-screen-route-mapping.md](../07-screen-route-mapping.md) |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.2 |
| Inventory | [_inventory/rorder.md](./_inventory/rorder.md) |
| Index | [_index.md](./_index.md) |
