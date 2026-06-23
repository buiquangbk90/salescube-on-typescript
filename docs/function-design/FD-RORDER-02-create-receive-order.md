# FD-RORDER-02 — Tạo & Cập nhật Đơn hàng (Create/Update Receive Order)

**Module**: RORDER  
**WF Source**: `output/cursor/workflows/WF-03-receive-order.md`  
**Priority**: P1-3  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tạo mới hoặc cập nhật đơn hàng (header + N lines) |
| Legacy entry | `POST /rorder/inputROrder/register` |
| Target | `POST /api/receive-orders` / `PUT /api/receive-orders/:id` |
| Permission | `@RequirePermission('INPUT_RORDER')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Create flow (đầy đủ)

```
POST /rorder/inputROrder/register (new)
  → InputROrderAction.register()
    → validate (AbstractSlipEditAction.validate())
    → CustomerService.findByCode(customerCode)    ← lookup + snapshot
      → kiểm tra MAX_CREDIT_LIMIT (warning only, không block)
    → DeliveryService.findByCode(deliveryCode)
    → For each line:
      → ProductService.findByCode(productCode)
      → ProductStockService.checkStock()           ← warning only, không block
      → DiscountUtil.calcDiscount(qty, price)
      → Tính UNIT_PRICE, RETAIL_PRICE, GM (gross margin)
    → SeqMakerService.getNextSeqId("RO_SLIP_TRN") ← allocate slip ID
    → RoSlipService.insert(dto)
      → INSERT RO_SLIP_TRN (snapshot KH, snapshot delivery)
    → RoLineService.insertLines(dto)
      → INSERT RO_LINE_TRN × N (REST_QUANTITY = QUANTITY)
      → INSERT RO_SLIP_TRN_HIST
      → INSERT RO_LINE_TRN_HIST
    → return success
```

**Evidence**: `LEGACY_CONFIRMED` — `action/rorder/InputROrderAction.java:1-100`  
**Evidence**: `LEGACY_CONFIRMED` — `service/RoSlipService.java`, `service/RoLineService.java`

### 2.2 REST_QUANTITY = QUANTITY khi insert

- `RO_LINE_TRN.REST_QUANTITY` được set bằng `QUANTITY` khi tạo
- Giảm dần mỗi lần tạo `SALES_LINE_TRN` từ line này
- NOT NULL constraint — không bao giờ được NULL

**Evidence**: `LEGACY_CONFIRMED` — WF-03 Validation Rules #8, Status Transitions

### 2.3 Double-submit protection

- `Struts TokenProcessor.isTokenValid()` — kiểm tra form token
- Nếu false → error, không xử lý

**Evidence**: `LEGACY_CONFIRMED` — WF-03 Validation Rules #7

### 2.4 Credit limit check (warning only)

```java
// CustomerService.findByCode(code)
// if customer.maxCreditLimit > 0 && currentDebt > maxCreditLimit
//   → addMessage("warnings.creditLimit") — KHÔNG block submit
```

**Evidence**: `LEGACY_CONFIRMED` — WF-03 Validation Rules #6

### 2.5 Copy từ Estimate (optional)

```
GET /rorder/inputROrder/index?copyFrom=estimate&estimateId=XXX
  → EstimateSheetService.findByPk(estimateSheetId)
  → EstimateLineService.findBySlipId()
  → Map estimate fields → RO form (pre-fill)
  → User xem lại → POST register
```

**Evidence**: `LEGACY_CONFIRMED` — WF-03 Main Code Path

---

## 3. Target API Contract (TARGET_DECISION)

### POST /api/receive-orders

```typescript
interface CreateReceiveOrderDto {
  customerCode: string;      // required
  roDate: string;            // required, ISO date
  deliveryCode?: string;
  memo?: string;
  lines: CreateReceiveOrderLineDto[];  // required, min 1
}

interface CreateReceiveOrderLineDto {
  lineNo: number;            // 1-based
  productCode: string;       // required
  quantity: number;          // required, > 0
  unitPrice: number;         // required, >= 0
  discountRate?: number;     // % chiết khấu
  memo?: string;
}

// Response (201 Created)
interface ReceiveOrderResponseDto {
  roSlipId: string;
  customerCode: string;
  customerName: string;      // snapshot từ CUSTOMER_MST lúc tạo
  roDate: string;
  status: '1';               // luôn là "1" khi vừa tạo
  totalAmount: number;
  lines: ReceiveOrderLineDto[];
}
```

### PUT /api/receive-orders/:roSlipId

```typescript
// Request body — same structure as Create
// Constraint: chỉ update khi status = '1' (Open)
// Response (200 OK) — ReceiveOrderResponseDto
```

---

## 4. Data Model

### Prisma target

```prisma
model ReceiveOrder {
  roSlipId      String   @id @map("RO_SLIP_ID")
  customerCode  String   @map("CUSTOMER_CODE")
  customerName  String   @map("CUSTOMER_NAME")   // snapshot
  deliveryCode  String?  @map("DELIVERY_CODE")
  roDate        DateTime @map("RO_DATE")
  status        String   @default("1") @map("STATUS")
  totalAmount   Decimal  @map("TOTAL_AMOUNT")
  deletedAt     DateTime? @map("DEL_DATETM")
  createdAt     DateTime  @map("INS_DATETM")
  updatedAt     DateTime  @map("UPD_DATETM")

  lines ReceiveOrderLine[]
  history ReceiveOrderHistory[]

  @@map("RO_SLIP_TRN")
}

model ReceiveOrderLine {
  roLineId      String  @id @map("RO_LINE_ID")
  roSlipId      String  @map("RO_SLIP_ID")
  lineNo        Int     @map("LINE_NO")
  productCode   String  @map("PRODUCT_CODE")
  quantity      Decimal @map("QUANTITY")
  restQuantity  Decimal @map("REST_QUANTITY")  // = QUANTITY khi insert
  unitPrice     Decimal @map("UNIT_PRICE")
  deletedAt     DateTime? @map("DEL_DATETM")

  order ReceiveOrder @relation(fields: [roSlipId], references: [roSlipId])

  @@map("RO_LINE_TRN")
}
```

> `TARGET_DECISION`: `roSlipId` là String PK được allocate bởi SEQ_MAKER (không dùng `@default(autoincrement())`).  
> `LEGACY_CONFIRMED`: `restQuantity` luôn = `quantity` khi insert — NOT NULL.  
> `TARGET_DECISION`: Customer name snapshot vào `RO_SLIP_TRN` để không bị thay đổi khi CUSTOMER_MST update.

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | `customerCode` required, phải tồn tại (DEL_DATETM IS NULL) | WF-03 | `LEGACY_CONFIRMED` |
| V2 | `roDate` required, valid date | WF-03 | `LEGACY_CONFIRMED` |
| V3 | Phải có ít nhất 1 line | Convention | `INFERRED_FROM_CODE` |
| V4 | Mỗi line: `productCode` required, phải tồn tại | WF-03 | `LEGACY_CONFIRMED` |
| V5 | Mỗi line: `quantity` > 0 | WF-03 | `LEGACY_CONFIRMED` |
| V6 | Mỗi line: `unitPrice` >= 0 | WF-03 | `LEGACY_CONFIRMED` |
| V7 | Credit limit: warning nếu vượt, không block | WF-03 | `LEGACY_CONFIRMED` |
| V8 | Double-submit: idempotency key | WF-03 TokenProcessor | `LEGACY_CONFIRMED` |
| V9 | Stock: warning nếu không đủ, không block | WF-03 | `LEGACY_CONFIRMED` |

### Zod schema

```typescript
export const createReceiveOrderSchema = z.object({
  customerCode: z.string().min(1),
  roDate: z.string().datetime(),
  deliveryCode: z.string().optional(),
  lines: z.array(z.object({
    lineNo: z.number().int().positive(),
    productCode: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    discountRate: z.number().min(0).max(100).optional(),
  })).min(1),
});
```

---

## 6. Transaction Boundaries

| Operation | Legacy | Target |
|-----------|--------|--------|
| Create | Seasar2 auto-commit: INSERT slip + INSERT N lines + INSERT hist | `prisma.$transaction([createSlip, createLines, seqMaker, createHist])` |
| Update | Auto-commit: UPDATE slip + DELETE+INSERT lines + INSERT hist | `prisma.$transaction([updateSlip, deleteOldLines, createNewLines, createHist])` |

**Evidence**: `LEGACY_CONFIRMED` — Seasar2 `@Transaction` per service  
**Target**: `TARGET_DECISION` — explicit `prisma.$transaction()` để đảm bảo atomicity

---

## 7. Business Calculations

### Discount calculation

```typescript
// DiscountUtil.calcDiscount(quantity, unitPrice, discountMst)
// → Tính discount amount từ discount table
// → RETAIL_PRICE = UNIT_PRICE - DISCOUNT_AMOUNT
// → GM (Gross Margin) = RETAIL_PRICE - COST_PRICE
```

**Evidence**: `LEGACY_CONFIRMED` — WF-03 Main Code Path, `utility/DiscountUtil`

> `UNKNOWN`: Chưa biết cụ thể công thức discount (% hay fixed amount, theo qty brackets hay flat rate)

---

## 8. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| KH không tồn tại | 422 | `UnprocessableEntityException` | `errors.notExist` |
| Product không tồn tại | 422 | `UnprocessableEntityException` | `errors.notExist` |
| Stock không đủ | 200 + warning | — | warning message |
| Double submit | 409 | `ConflictException` | token error |
| `UnabledLockException` | 409 | `ConflictException` | `errors.lock` |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 9. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-RORDER-03 | SEQ_MAKER cho RO_SLIP_TRN: format của RO_SLIP_ID là gì? Số nguyên hay string có prefix? | HIGH | `UNKNOWN` |
| OQ-RORDER-04 | DiscountUtil: discount theo % hay fixed amount? Có bracket (qty range) không? | HIGH | `UNKNOWN` |
| OQ-RORDER-05 | REST_QUANTITY được xử lý khi UPDATE (thay đổi quantity) như thế nào? | HIGH | `UNKNOWN` |
| OQ-RORDER-06 | Copy từ Estimate: có trong scope P1 không? | LOW | `TARGET_DECISION` |
