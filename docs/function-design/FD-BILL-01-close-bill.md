# FD-BILL-01 — Chốt Hóa đơn (Bill Closing / Reopen)

**Module**: BILL  
**WF Source**: `output/cursor/workflows/WF-05-bill-closing.md`  
**Priority**: P1-4  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Chốt hóa đơn theo kỳ kế toán (cutoff date) cho từng khách hàng; mở lại nếu cần |
| Legacy entry | `POST /bill/closeBill/close` + `POST /bill/closeBill/reopen` |
| Target | `POST /api/billing/close` + `POST /api/billing/:billId/reopen` |
| Permission | `@RequirePermission('CLOSE_BILL')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Close flow (chi tiết)

```
POST /bill/closeBill/close
  → CloseBillAction.close()                           ← line 100-141
    → validateCheckClose(cutOffDate, checkedCustomers)  ← line 277+
      → ymService.getYm(cutOffDate)                   → parse → kỳ kế toán
      → Ít nhất 1 KH được check
      → Với mỗi KH: BILL_TRN không tồn tại cùng tháng (chống chốt 2 lần)
    → for each checked customer:
      → billService.closeBillArt(cutOffDate, customerCode)
        → SalesService.findUnbilledByCustomer()       → SALES_SLIP (BILL_ID IS NULL, STATUS='2')
        → BillAndArtService.calcArtBalance()          → tính số dư AR
        → SeqMakerService.getNextSeqId("BILL_TRN")
        → INSERT BILL_TRN
        → UPDATE SALES_SLIP_TRN SET BILL_ID=?, STATUS='3'  ← bulk update
        → UPDATE CUSTOMER_MST SET LAST_CUTOFF_DATE=cutOffDate
        → INSERT BILL_TRN_HIST
    → re-search → addMessage("infos.closeBill.close")
```

**Evidence**: `LEGACY_CONFIRMED` — `action/bill/CloseBillAction.java:99-141`  
**Evidence**: `LEGACY_CONFIRMED` — `service/BillService.java:47-80`

### 2.2 Reopen flow

```
POST /bill/closeBill/reopen
  → CloseBillAction.reopen()                     ← line 150-196
    → validateCheckReopen()                       → kiểm tra trạng thái bill
    → billService.reOpenBillArt(billCutoffDate, customerCode)
      → UPDATE SALES_SLIP_TRN SET BILL_ID=NULL, STATUS='2'  ← rollback
      → DELETE BILL_TRN
      → UPDATE CUSTOMER_MST SET LAST_CUTOFF_DATE=(previous date)
      → INSERT BILL_TRN_HIST (reopen event)
```

**Evidence**: `LEGACY_CONFIRMED` — `action/bill/CloseBillAction.java:150-196`

### 2.3 Cutoff date / YM parsing

- `YmService.getYm(cutOffDate)` parse ngày → kỳ kế toán (yyyyMM)
- Cutoff group của KH (`CUSTOMER_MST.CUTOFF_GROUP`) xác định ngày chốt trong tháng

**Evidence**: `LEGACY_CONFIRMED` — WF-05 Validation Rules #2, `service/YmService`

### 2.4 ART Balance calculation

```
BillAndArtService.calcArtBalance(customerCode, cutOffDate)
  → Đọc ART_BALANCE_TRN (số dư AR kỳ trước)
  → Cộng với SALES trong kỳ - DEPOSIT trong kỳ
  → Kết quả = số tiền KH còn nợ
  → Ghi vào BILL_TRN.ART_BALANCE (inferred)
```

**Evidence**: `LEGACY_CONFIRMED` — WF-05 Main Code Path, `service/BillAndArtService.java`

### 2.5 Risk: partial commit

> **LEGACY_CONFIRMED risk**: Nếu loop qua nhiều KH và timeout giữa chừng → BILL_TRN của KH đầu được tạo nhưng SALES_SLIP_TRN chưa update. Không có compensation/rollback mechanism trong legacy.

**Evidence**: `LEGACY_CONFIRMED` — WF-05 Error Handling: "Partial commit (timeout)"

---

## 3. Target API Contract (TARGET_DECISION)

### POST /api/billing/close

```typescript
interface CloseBillDto {
  cutOffDate: string;          // required, format yyyy-MM-dd
  customerCodes: string[];     // required, ≥ 1 KH
}

// Response (200 OK)
interface CloseBillResponseDto {
  processedCount: number;
  results: CloseBillResultDto[];
}

interface CloseBillResultDto {
  customerCode: string;
  customerName: string;
  billId?: string;             // null nếu không có sales trong kỳ
  totalAmount: number;
  status: 'SUCCESS' | 'SKIPPED' | 'ERROR';
  message?: string;
}
```

### POST /api/billing/:billId/reopen

```typescript
// Request: PATH param billId
// Response (200 OK)
interface ReopenBillResponseDto {
  billId: string;
  customerCode: string;
  status: 'REOPENED';
  affectedSalesCount: number;
}
```

### GET /api/billing/candidates

```typescript
// Tìm KH cần chốt trong kỳ
interface BillCandidateQuery {
  cutOffDate: string;
  cutoffGroup?: string;
}

interface BillCandidateDto {
  customerCode: string;
  customerName: string;
  cutoffGroup: string;
  lastCutoffDate?: string;
  unbilledSalesCount: number;
  unbilledAmount: number;
  alreadyClosed: boolean;      // đã chốt tháng này chưa
}
```

---

## 4. Data Model

```prisma
model Bill {
  billId           String    @id @map("BILL_ID")
  customerCode     String    @map("CUSTOMER_CODE")
  billCutoffDate   DateTime  @map("BILL_CUTOFF_DATE")
  totalAmount      Decimal   @map("TOTAL_AMOUNT")
  depositPrice     Decimal   @default(0) @map("DEPOSIT_PRICE")
  artBalance       Decimal   @map("ART_BALANCE")
  status           String    @default("0") @map("STATUS")
  createdAt        DateTime  @map("INS_DATETM")

  salesOrders SalesOrder[]   // app-layer relation via BILL_ID
  history     BillHistory[]

  @@map("BILL_TRN")
}
```

> `TARGET_DECISION`: Implement close bill trong **một transaction duy nhất per customer** (không phải một transaction cho tất cả KH) — giảm risk partial commit.

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | `cutOffDate` required, format valid | WF-05 | `LEGACY_CONFIRMED` |
| V2 | `ymService.getYm(cutOffDate)` phải valid | WF-05 | `LEGACY_CONFIRMED` |
| V3 | Ít nhất 1 KH được chọn | WF-05 | `LEGACY_CONFIRMED` |
| V4 | Không chốt 2 lần cùng tháng cho cùng KH | WF-05 | `LEGACY_CONFIRMED` |
| V5 | `CUTOFF_GROUP` KH phải khớp với nhóm đang chốt | WF-05 | `LEGACY_CONFIRMED` |
| V6 | Reopen: kiểm tra trạng thái bill hợp lệ | WF-05 | `LEGACY_CONFIRMED` |

---

## 6. Transaction Boundaries

| Operation | Per customer | Target |
|-----------|-------------|--------|
| Close | INSERT BILL + UPDATE SALES(N) + UPDATE CUSTOMER + INSERT HIST | `prisma.$transaction()` per KH |
| Reopen | UPDATE SALES(N) SET BILL_ID=NULL + DELETE BILL + UPDATE CUSTOMER + INSERT HIST | `prisma.$transaction()` per KH |

**Target**: `TARGET_DECISION` — một transaction per customer để tránh partial commit toàn bộ batch.

---

## 7. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| `cutOffDate` invalid | 422 | `UnprocessableEntityException` | `errors.date` |
| Không chọn KH | 422 | `UnprocessableEntityException` | `errors.noSelect` |
| Đã chốt tháng này | 409 | `ConflictException` | ActionMessage từ billService |
| `UnabledLockException` | 409 | `ConflictException` | `errors.lock` |
| Partial commit risk | — | Log + rollback per KH | `errors.system` |

---

## 8. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-BILL-01 | `ART_BALANCE_TRN`: có sử dụng trong target không? Cấu trúc bảng này là gì? | HIGH | `UNKNOWN` |
| OQ-BILL-02 | `BILL_TRN.STATUS` có các giá trị nào? WF chỉ thấy "0" | MEDIUM | `UNKNOWN` |
| OQ-BILL-03 | Reopen: CUSTOMER_MST.LAST_CUTOFF_DATE được set về ngày nào? (kỳ trước?) | HIGH | `INFERRED_FROM_CODE` |
| OQ-BILL-04 | Invoice PDF (MakeOutBillAction) có trong scope P1 không? | MEDIUM | `TARGET_DECISION` |
