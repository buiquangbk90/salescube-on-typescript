# FD-SALES-02 — Tạo Phiếu Bán hàng (Sales Slip — Create/Update)

**Module**: SALES  
**WF Source**: `output/cursor/workflows/WF-04-sales-slip.md`  
**Priority**: P1-3  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tạo phiếu bán hàng — từ RO hoặc trực tiếp. Đây là bảng nghiệp vụ trung tâm |
| Legacy entry | `POST /sales/inputSales/register` |
| Target | `POST /api/sales-orders` / `POST /api/sales-orders/from-receive-order` |
| Permission | `@RequirePermission('INPUT_SALES')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Create from RO (luồng chính)

```
GET /sales/inputSales/copy?copySlipName=RORDER&copySlipId={roSlipId}
  → InputSalesAction.copy()                     ← line 167
    → RoSlipSalesService.findByPk(roSlipId)
    → Map RO_SLIP_TRN → SALES form (snapshot KH, snapshot delivery)
    → Map RO_LINE_TRN → SALES lines
    → Render inputSales.jsp (pre-filled)

POST /sales/inputSales/register (từ form đã pre-fill)
  → InputSalesAction.register()
    → validate form
    → InputStockSalesService.calcCost()          ← tính giá vốn từ stock (FIFO/LIFO)
    → DiscountUtil.calcDiscount()
    → SeqMakerService.getNextSeqId("SALES_SLIP_TRN")
    → SalesService.insert(dto)
      → INSERT SALES_SLIP_TRN (40+ snapshot columns)
      → INSERT SALES_LINE_TRN × N
      → INSERT SALES_SLIP_TRN_HIST
      → INSERT SALES_LINE_TRN_HIST
    → RoLineService.updateRestQuantity(roLineId, qty) ← giảm REST_QUANTITY trên RO
    → InputStockSalesService.createEadSlip()     ← tạo phiếu xuất kho EAD tự động
    → return success
```

**Evidence**: `Confirmed by code` — `action/sales/InputSalesAction.java:150-240`  
**Evidence**: `Confirmed by code` — `action/sales/InputSalesAction.java:79-115` (service injections)

### 2.2 EAD slip (phiếu xuất kho tự động)

```
InputStockSalesService.createEadSlip(salesSlipDto)
  → SeqMakerService.getNextSeqId("EAD_SLIP_TRN")
  → INSERT EAD_SLIP_TRN
  → INSERT EAD_LINE_TRN
  → UPDATE PRODUCT_STOCK_TRN (giảm tồn kho)
```

**Evidence**: `Confirmed by code` — WF-04 Main Code Path, WRITE table list  
**Evidence**: `Confirmed by code` — `service/InputStockSalesService` injection trong `InputSalesAction.java:98`

### 2.3 Customer snapshot

- Khi tạo SALES_SLIP_TRN, 40+ cột từ CUSTOMER_MST được copy vào SALES_SLIP_TRN
- Đây là denormalization pattern — giữ nguyên thông tin KH tại thời điểm giao dịch
- Tương tự với delivery address

**Evidence**: `Confirmed by code` — WF-04 Database Tables WRITE: "với 40+ denormalized snapshot columns"  
**Evidence**: `Confirmed by code` — `DB/sql/createtable/CREATE.sql:1755-1906`

### 2.4 Guard: đã chốt bill thì không sửa được

```java
// BillService.findBySlipId(salesSlipId)
// if BILL_ID != null → throw ServiceException("errors.closedBill")
```

**Evidence**: `Confirmed by code` — WF-04 Validation Rules #6

---

## 3. Target API Contract (TARGET_DECISION)

### POST /api/sales-orders/from-receive-order

```typescript
interface CreateSalesFromRODto {
  roSlipId: string;          // required — RO để copy từ
  salesDate: string;         // required, ISO date
  deliveryCode?: string;
  lines: SalesLineFromRODto[];
}

interface SalesLineFromRODto {
  roLineId: string;          // link về RO line
  quantity: number;          // có thể < RO quantity (partial fulfillment)
  unitPrice: number;
  rackCodeSrc?: string;      // vị trí kho xuất
}

// Response (201 Created)
interface SalesOrderResponseDto {
  salesSlipId: string;
  customerCode: string;
  customerName: string;      // snapshot
  salesDate: string;
  status: '1';
  totalAmount: number;
  eadSlipId: string;         // EAD slip được tạo tự động
  lines: SalesOrderLineDto[];
}
```

### POST /api/sales-orders

```typescript
// Direct create (không từ RO) — ít dùng hơn
interface CreateSalesOrderDto {
  customerCode: string;
  salesDate: string;
  lines: CreateSalesLineDto[];
}
```

---

## 4. Data Model

```prisma
model SalesOrder {
  salesSlipId    String    @id @map("SALES_SLIP_ID")
  customerCode   String    @map("CUSTOMER_CODE")
  customerName   String    @map("CUSTOMER_NAME")    // snapshot
  // ... 40+ snapshot columns
  salesDate      DateTime  @map("SALES_DATE")
  status         String    @default("1") @map("STATUS")
  billId         String?   @map("BILL_ID")          // set khi chốt bill
  totalAmount    Decimal   @map("TOTAL_AMOUNT")
  deletedAt      DateTime? @map("DEL_DATETM")

  lines   SalesOrderLine[]
  history SalesOrderHistory[]

  @@map("SALES_SLIP_TRN")
}

model SalesOrderLine {
  salesLineId  String  @id @map("SALES_LINE_ID")
  salesSlipId  String  @map("SALES_SLIP_ID")
  roLineId     String? @map("RO_LINE_ID")        // app-layer FK — không có DB FK
  productCode  String  @map("PRODUCT_CODE")
  quantity     Decimal @map("QUANTITY")
  unitPrice    Decimal @map("UNIT_PRICE")
  costPrice    Decimal @map("COST_PRICE")        // từ InputStockSalesService
  rackCodeSrc  String? @map("RACK_CODE_SRC")

  order SalesOrder @relation(fields: [salesSlipId], references: [salesSlipId])

  @@map("SALES_LINE_TRN")
}
```

> `Confirmed by code`: `roLineId` là app-layer FK (không có DB FK constraint trong CREATE.sql).  
> `Target decision`: EAD slip creation là side effect — implement trong same transaction.

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | `customerCode` required, tồn tại, not deleted | WF-04 | `Confirmed by code` |
| V2 | `salesDate` required, valid date | WF-04 | `Confirmed by code` |
| V3 | Lines: `productCode` required, tồn tại | WF-04 | `Confirmed by code` |
| V4 | Lines: `quantity` > 0, `unitPrice` >= 0 | WF-04 | `Confirmed by code` |
| V5 | Lines: `rackCodeSrc` tồn tại nếu nhập | WF-04 | `Confirmed by code` |
| V6 | `billId` IS NULL → không cho sửa/xóa nếu đã chốt | WF-04 | `Confirmed by code` |
| V7 | Double-submit: idempotency key | WF-04 | `Confirmed by code` |

---

## 6. Transaction Boundaries

| Operation | Entities write | Target |
|-----------|---------------|--------|
| Create sales | SALES_SLIP, SALES_LINE (N), SALES_HIST, LINE_HIST | Block 1 |
| Update RO REST_QUANTITY | RO_LINE_TRN (N) | Block 1 |
| Create EAD slip | EAD_SLIP, EAD_LINE, PRODUCT_STOCK | Block 1 |

**Target**: `Target decision` — tất cả 3 blocks trong 1 `prisma.$transaction()` để đảm bảo atomicity

---

## 7. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| `BILL_ID` đã set | 409 | `ConflictException` | `errors.closedBill` |
| Product không tồn tại | 422 | `UnprocessableEntityException` | `errors.notExist` |
| RO đã cancel/complete | 409 | `ConflictException` | `errors.roOrder.status` |
| Stock không đủ | 200 + warning | — | warning |
| `UnabledLockException` | 409 | `ConflictException` | `errors.lock` |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 8. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-SALES-01 | `InputStockSalesService.calcCost()` dùng FIFO hay LIFO? Hay average cost? | HIGH | `Inferred from code` ("FIFO/LIFO inferred") |
| OQ-SALES-02 | Khi update SALES, EAD slip có được update/reverse không? | HIGH | `Unknown / needs verification` |
| OQ-SALES-03 | 40+ snapshot columns: cần liệt kê đầy đủ từ DDL trước khi implement | HIGH | `Unknown / needs verification` |
| OQ-SALES-04 | Partial fulfillment từ RO: `quantity` trong SALES < `quantity` trong RO line — có kiểm soát không? | HIGH | `Unknown / needs verification` |
