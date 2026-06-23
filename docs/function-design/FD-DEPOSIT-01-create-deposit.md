# FD-DEPOSIT-01 — Tạo & Tìm kiếm Phiếu Thu tiền (Deposit Entry)

**Module**: DEPOSIT  
**WF Source**: `output/cursor/workflows/WF-06-deposit-entry.md`  
**Priority**: P1-5  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tạo/cập nhật phiếu thu tiền từ khách hàng (nhiều hình thức thanh toán), tìm kiếm |
| Legacy entry | `POST /deposit/inputDeposit/register`, `GET /deposit/searchDeposit/index` |
| Target | `POST /api/deposits`, `GET /api/deposits` |
| Permission | `@RequirePermission('INPUT_DEPOSIT')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Create flow

```
POST /deposit/inputDeposit/register
  → InputDepositAction.register()
    → validate form
    → CustomerService.findByCode(customerCode) → snapshot KH
    → BillService.findByPk(billId) [nếu link với bill]
    → SeqMakerService.getNextSeqId("DEPOSIT_SLIP_TRN")
    → DepositSlipService.insert(dto)
      → INSERT DEPOSIT_SLIP_TRN (snapshot KH)
      → INSERT DEPOSIT_LINE_TRN × N lines
        → line.DEPOSIT_CATEGORY ∈ {cash, check, transfer, bank, COD, setoff, ...}
        → BankService.findByPk(bankId) [nếu bank transfer]
      → INSERT DEPOSIT_SLIP_TRN_HIST
      → INSERT DEPOSIT_LINE_TRN_HIST
    → UPDATE BILL_TRN.DEPOSIT_PRICE [nếu link với bill]
    → INSERT BANK_DEPOSIT_REL [nếu từ bank import staging]
    → INSERT DELIVERY_DEPOSIT_REL [nếu từ delivery import staging]
    → return success
```

**Evidence**: `LEGACY_CONFIRMED` — `action/deposit/InputDepositAction.java:1-60`  
**Evidence**: `LEGACY_CONFIRMED` — `action/deposit/InputDepositAction.java:64-100` (service injections)

### 2.2 DEPOSIT_CATEGORY values

| Category | Ý nghĩa |
|----------|---------|
| cash | Tiền mặt |
| check | Séc |
| transfer | Chuyển khoản |
| bank | Ngân hàng (qua BANK_MST) |
| COD | Thu hộ (shipper) |
| setoff | Bù trừ công nợ |

**Evidence**: `LEGACY_CONFIRMED` — WF-06 Line detail `DEPOSIT_CATEGORY ∈ {...}`

### 2.3 Total validation

- Tổng `DEPOSIT_LINE.PRICE` phải bằng `DEPOSIT_SLIP.DEPOSIT_TOTAL`
- Check trước INSERT

**Evidence**: `LEGACY_CONFIRMED` — WF-06 Validation Rules #7

### 2.4 Guard: không xóa phiếu đã chốt ART

- STATUS = `"1"` (đã chốt ART) → không được xóa/sửa
- Chỉ STATUS = `"0"` (Open) mới được xóa

**Evidence**: `LEGACY_CONFIRMED` — WF-06 Status Transitions

### 2.5 Link với BILL_TRN

- Khi tạo phiếu thu, có thể link với một `BILL_ID` cụ thể
- Sau khi link: `UPDATE BILL_TRN SET DEPOSIT_PRICE = DEPOSIT_PRICE + line.PRICE`

**Evidence**: `LEGACY_CONFIRMED` — WF-06 Main Code Path

---

## 3. Target API Contract (TARGET_DECISION)

### GET /api/deposits

```typescript
interface DepositSearchQuery {
  customerCode?: string;
  depositDateFrom?: string;
  depositDateTo?: string;
  status?: '0' | '1';
  page?: number;
  limit?: number;
}

interface DepositListResponseDto {
  data: DepositSummaryDto[];
  total: number;
}

interface DepositSummaryDto {
  depositSlipId: string;
  customerCode: string;
  customerName: string;
  depositDate: string;
  totalAmount: number;
  status: '0' | '1';
  billId?: string;
}
```

### POST /api/deposits

```typescript
interface CreateDepositDto {
  customerCode: string;    // required
  depositDate: string;     // required
  billId?: string;         // link với bill nếu có
  totalAmount: number;     // required — phải = sum(lines.price)
  lines: CreateDepositLineDto[];
}

interface CreateDepositLineDto {
  lineNo: number;
  depositCategory: 'cash' | 'check' | 'transfer' | 'bank' | 'cod' | 'setoff';
  price: number;           // > 0
  bankId?: string;         // required nếu depositCategory = 'bank'
  instDate?: string;       // required nếu category = installment
  memo?: string;
}

// Response (201 Created)
interface DepositResponseDto {
  depositSlipId: string;
  customerCode: string;
  customerName: string;    // snapshot
  depositDate: string;
  totalAmount: number;
  status: '0';
  lines: DepositLineDto[];
}
```

---

## 4. Data Model

```prisma
model Deposit {
  depositSlipId  String    @id @map("DEPOSIT_SLIP_ID")
  customerCode   String    @map("CUSTOMER_CODE")
  customerName   String    @map("CUSTOMER_NAME")   // snapshot
  depositDate    DateTime  @map("DEPOSIT_DATE")
  totalAmount    Decimal   @map("DEPOSIT_TOTAL")
  billId         String?   @map("BILL_ID")          // app-layer FK
  status         String    @default("0") @map("STATUS")
  deletedAt      DateTime? @map("DEL_DATETM")
  createdAt      DateTime  @map("INS_DATETM")

  lines   DepositLine[]
  history DepositHistory[]

  @@map("DEPOSIT_SLIP_TRN")
}

model DepositLine {
  depositLineId    String   @id @map("DEPOSIT_LINE_ID")
  depositSlipId    String   @map("DEPOSIT_SLIP_ID")
  lineNo           Int      @map("LINE_NO")
  depositCategory  String   @map("DEPOSIT_CATEGORY")
  price            Decimal  @map("PRICE")
  bankId           String?  @map("BANK_ID")
  instDate         DateTime? @map("INST_DATE")

  deposit Deposit @relation(fields: [depositSlipId], references: [depositSlipId])

  @@map("DEPOSIT_LINE_TRN")
}
```

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | `customerCode` required | WF-06 | `LEGACY_CONFIRMED` |
| V2 | `depositDate` required, valid date | WF-06 | `LEGACY_CONFIRMED` |
| V3 | Lines: `depositCategory` required, in enum | WF-06 | `LEGACY_CONFIRMED` |
| V4 | Lines: `price` > 0 | WF-06 | `LEGACY_CONFIRMED` |
| V5 | Lines: `bankId` required nếu category = bank | WF-06 | `LEGACY_CONFIRMED` |
| V6 | Lines: `instDate` required nếu category = installment | WF-06 | `LEGACY_CONFIRMED` |
| V7 | sum(lines.price) = totalAmount | WF-06 | `LEGACY_CONFIRMED` |
| V8 | Không xóa/sửa phiếu STATUS = `"1"` | WF-06 | `LEGACY_CONFIRMED` |

### Zod schema

```typescript
export const createDepositSchema = z.object({
  customerCode: z.string().min(1),
  depositDate: z.string().datetime(),
  billId: z.string().optional(),
  totalAmount: z.number().positive(),
  lines: z.array(z.object({
    lineNo: z.number().int().positive(),
    depositCategory: z.enum(['cash', 'check', 'transfer', 'bank', 'cod', 'setoff']),
    price: z.number().positive(),
    bankId: z.string().optional(),
    instDate: z.string().datetime().optional(),
  })).min(1),
}).refine(
  (data) => data.lines.reduce((sum, l) => sum + l.price, 0) === data.totalAmount,
  { message: 'errors.totalMismatch' }
);
```

---

## 6. Transaction Boundaries

| Operation | Entities write | Target |
|-----------|---------------|--------|
| Create | DEPOSIT_SLIP + DEPOSIT_LINE(N) + DEPOSIT_HIST + LINE_HIST + UPDATE BILL (nếu có) | `prisma.$transaction()` |
| Delete | UPDATE DEL_DATETM + INSERT HIST | `prisma.$transaction()` |

---

## 7. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| Bill không tồn tại | 422 | `UnprocessableEntityException` | `errors.notExist` |
| STATUS = "1" (ART closed) — không cho xóa | 409 | `ConflictException` | — |
| sum(lines) ≠ totalAmount | 422 | `UnprocessableEntityException` | `errors.totalMismatch` |
| `UnabledLockException` | 409 | `ConflictException` | `errors.lock` |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 8. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-DEPOSIT-01 | `ART_BALANCE_TRN.ART_ID` link sau ART closing: qui trình ART closing là gì? Có trong P1 không? | HIGH | `UNKNOWN` |
| OQ-DEPOSIT-02 | DEPOSIT_CATEGORY enum: có thêm value nào ngoài danh sách không? (check CATEGORY_TRN) | MEDIUM | `UNKNOWN` |
| OQ-DEPOSIT-03 | Bank match fail khi import: cần manual review UI riêng không? | MEDIUM | `UNKNOWN` |
| OQ-DEPOSIT-04 | `setoff` category: bù trừ công nợ — cơ chế cụ thể là gì? Link với giao dịch nào? | HIGH | `UNKNOWN` |
