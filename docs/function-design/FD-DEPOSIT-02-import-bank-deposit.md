# FD-DEPOSIT-02 — Import Sao kê Ngân hàng & COD (Bank/Delivery Deposit Import)

**Module**: DEPOSIT  
**WF Source**: `output/cursor/workflows/WF-06-deposit-entry.md`  
**Priority**: P1-5  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Import file sao kê ngân hàng (CSV/TSV) hoặc file COD từ shipper để tự động tạo phiếu thu |
| Legacy entry | `GET /deposit/importBankDeposit/index`, `GET /deposit/importDeliveryDeposit/index` |
| Target | `POST /api/deposits/import-bank`, `POST /api/deposits/import-delivery` |
| Permission | `@RequirePermission('INPUT_DEPOSIT')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Bank statement import flow

```
ImportBankDepositAction.upload()
  → AbstractXSVUploadAction.parse()              → parse CSV/TSV file
  → BankDepositWorkService.deleteAll()           → cleanup BANK_DEPOSIT_WORK
  → INSERT BANK_DEPOSIT_WORK (staging table — batch)
  → BankDepositWorkService.matchWithBill()
    → Match BANK_DEPOSIT_WORK với BILL_TRN theo amount + date
    → matched records → tạo DEPOSIT_SLIP_TRN + DEPOSIT_LINE_TRN tự động
    → INSERT BANK_DEPOSIT_REL (link bank record → deposit)
  → cleanup BANK_DEPOSIT_WORK
  → Return: matched count, unmatched list
```

**Evidence**: `LEGACY_CONFIRMED` — WF-06 External Integrations "Import Sao Kê Ngân Hàng"  
**Evidence**: `LEGACY_CONFIRMED` — `action/deposit/ImportBankDepositAction.java` (all)

### 2.2 COD (shipper) import flow

```
ImportDeliveryDepositAction.upload()
  → Parse CSV shipper-specific format
  → INSERT DELIVERY_DEPOSIT_WORK (staging)
  → Match DELIVERY_DEPOSIT_WORK với SALES_SLIP_TRN via DELIVERY_SLIP_ID
  → Tạo DEPOSIT_SLIP_TRN (COD type)
  → INSERT DELIVERY_DEPOSIT_REL (link shipper → deposit)
  → cleanup DELIVERY_DEPOSIT_WORK
```

**Evidence**: `LEGACY_CONFIRMED` — WF-06 External Integrations "Import COD từ Shipper"  
**Evidence**: `LEGACY_CONFIRMED` — `action/deposit/ImportDeliveryDepositAction.java` (all)

### 2.3 Staging pattern (BANK_DEPOSIT_WORK)

- File CSV → staging table FIRST
- Match logic từ staging → production tables
- Cleanup staging sau xử lý
- Pattern: "deleteAll → insert batch → match → cleanup"

**Evidence**: `LEGACY_CONFIRMED` — WF-06 Import flows

---

## 3. Target API Contract (TARGET_DECISION)

### POST /api/deposits/import-bank

```typescript
// Request: multipart/form-data
// Body: { file: File (CSV/TSV) }

// Response (200 OK)
interface BankImportResultDto {
  totalRows: number;
  matchedCount: number;
  unmatchedCount: number;
  createdDepositIds: string[];
  unmatchedRows: BankImportRowDto[];  // cần manual review
}

interface BankImportRowDto {
  rowNo: number;
  amount: number;
  date: string;
  description: string;
  reason: string;  // "no_matching_bill" | "amount_mismatch" | ...
}
```

### POST /api/deposits/import-delivery

```typescript
// Request: multipart/form-data
// Body: { file: File (CSV) }

// Response (200 OK)
interface DeliveryImportResultDto {
  totalRows: number;
  matchedCount: number;
  unmatchedCount: number;
  createdDepositIds: string[];
  unmatchedRows: DeliveryImportRowDto[];
}
```

---

## 4. Data Model

```prisma
model BankDepositRel {
  id            Int    @id @default(autoincrement())
  depositSlipId String @map("DEPOSIT_SLIP_ID")
  bankWorkRef   String @map("BANK_WORK_REF")  // reference từ bank file

  @@map("BANK_DEPOSIT_REL")
}

model DeliveryDepositRel {
  id              Int    @id @default(autoincrement())
  depositSlipId   String @map("DEPOSIT_SLIP_ID")
  deliverySlipId  String @map("DELIVERY_SLIP_ID")

  @@map("DELIVERY_DEPOSIT_REL")
}
```

> `TARGET_DECISION`: Staging tables (`BANK_DEPOSIT_WORK`, `DELIVERY_DEPOSIT_WORK`) có thể implement bằng in-memory processing + transaction thay vì persist vào DB — cần confirm.

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | File type phải là CSV hoặc TSV | `AbstractXSVUploadAction` | `LEGACY_CONFIRMED` |
| V2 | SKU/product trong COD file phải match SALES_SLIP | WF-06 | `LEGACY_CONFIRMED` |
| V3 | Bank match: amount + date phải khớp với BILL_TRN | WF-06 | `LEGACY_CONFIRMED` |
| V4 | Unmatched rows → warning, không fail toàn bộ import | WF-06 | `LEGACY_CONFIRMED` |

---

## 6. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| File parse error | 422 | `UnprocessableEntityException` | `errors.import.parse` |
| Bank match fail (unmatched) | 200 + warning list | — | warning per row |
| SKU không match (COD) | 200 + warning + skip line | — | Log warning |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 7. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-DEPOSIT-05 | Bank file format: CSV hay TSV? Có schema cố định hay theo từng ngân hàng? | HIGH | `UNKNOWN` |
| OQ-DEPOSIT-06 | COD file format: shipper nào? Format có chuẩn không hay theo từng shipper? | HIGH | `UNKNOWN` |
| OQ-DEPOSIT-07 | Staging DB hay in-memory? Nếu DB thì cần Prisma model cho WORK tables | MEDIUM | `UNKNOWN` |
| OQ-DEPOSIT-08 | Manual review UI cho unmatched rows: có trong scope P1 không? | MEDIUM | `UNKNOWN` |
