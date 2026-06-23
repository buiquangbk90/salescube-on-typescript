# FD-DEPOSIT-02: Import Sao Kê Ngân Hàng & COD (入金データ取込)

> **Confidence**: MEDIUM-HIGH (WF-11) / MEDIUM (action line-level chưa verify)  
> **Evidence file**: [`_evidence/FD-DEPOSIT-02-bank-deposit-import.md`](./_evidence/FD-DEPOSIT-02-bank-deposit-import.md)  
> **Workflow**: [WF-11 Bank Deposit Import](../workflows/WF-11-bank-deposit-import.md)  
> **Scope**: Upload + xử lý file bank (0604) và COD shipper (0603); tự động tạo phiếu thu (không gồm nhập tay — FD-DEPOSIT-01)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) / Partial (methods) | `ImportBankDepositAction`, `ImportDeliveryDepositAction` — WF-11 |
| Service logic | Confirmed | `BankDepositWorkService`, `DeliveryDepositWorkService`, rel services — WF-11 |
| DDL mapping | Partial | `BANK_DEPOSIT_WORK`, `DELIVERY_DEPOSIT_WORK`, rel tables — WF-11 |
| Workflow coverage | Confirmed | WF-11 |
| Target API design | Target decision | NestJS `DepositsImportController` |

**Confidence: MEDIUM** — WF-11 ghi action files chưa đọc trực tiếp; staging/match logic confirmed từ WF narrative.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Import CSV/TSV sao kê ngân hàng hoặc COD shipper → match → tạo `DEPOSIT_SLIP_TRN` | LEGACY_CONFIRMED |
| **Module** | `deposit` / DEPOSIT | LEGACY_CONFIRMED |
| **Actor** | Kế toán có quyền import | WF_CONFIRMED |
| **Legacy URLs** | `/deposit/importBankDeposit/*`, `/deposit/importDeliveryDeposit/*` | LEGACY_CONFIRMED |
| **Target API** | `POST /api/deposits/import/bank`, `POST /api/deposits/import/delivery` | TARGET_DECISION |
| **Trigger** | User upload file + confirm process | LEGACY_CONFIRMED |

---

## 2. Input

### Target — Bank import (multipart)

```typescript
const bankImportUploadSchema = z.object({
  file: z.instanceof(File), // CSV/TSV — validated server-side
});

const bankImportProcessSchema = z.object({
  sessionId: z.string().optional(), // if staging server-side
  manualMatches: z.array(z.object({
    rowNo: z.number().int(),
    billId: z.string().optional(),
    customerCode: z.string().optional(),
  })).optional(),
});
```

### Target — Delivery COD import (multipart)

```typescript
const deliveryImportUploadSchema = z.object({
  file: z.instanceof(File), // shipper CSV
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy source | Provenance |
|-------|------|----------|------------|---------------|------------|
| Bank file | CSV/TSV | ✓ | parseable by XSV parser | Bank statement | LEGACY_CONFIRMED |
| `AMOUNT` / amount | decimal | ✓ | > 0 | `BANK_DEPOSIT_WORK` | LEGACY_CONFIRMED |
| `TRANSACTION_DATE` | date | ✓ | valid | Bank row | LEGACY_CONFIRMED |
| COD `DELIVERY_SLIP_ID` | string | ✓ | 12 chars | `DELIVERY_DEPOSIT_WORK` | LEGACY_CONFIRMED |
| COD `COD_PRICE` | decimal | ✓ | > 0 | Shipper file | LEGACY_CONFIRMED |
| Manual `billId` | string | | for unmatched rows | UI assign | INFERRED |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Upload success | Preview staged rows in JSP | WF-11 | LEGACY_CONFIRMED |
| Process success | Deposits created, staging cleanup | WF-11 | LEGACY_CONFIRMED |
| Bank match fail | Unmatched list for manual review | WF-11 | LEGACY_CONFIRMED |
| COD no match | Warning, skip row | WF-11 | LEGACY_CONFIRMED |
| Duplicate COD | Skip (REL exists) | WF-11 VAL #4 | LEGACY_CONFIRMED |
| Parse error | Reject upload | WF-11 Error | LEGACY_CONFIRMED |

### Target Response

```typescript
type BankImportResultDto = {
  totalRows: number;
  matchedCount: number;
  unmatchedCount: number;
  createdDepositIds: string[];
  unmatchedRows: Array<{
    rowNo: number;
    amount: number;
    date: string;
    description: string;
    reason: 'NO_MATCHING_BILL' | 'AMOUNT_MISMATCH' | 'PARSE_ERROR';
  }>;
};

type DeliveryImportResultDto = {
  totalRows: number;
  matchedCount: number;
  unmatchedCount: number;
  createdDepositIds: string[];
  unmatchedRows: Array<{
    rowNo: number;
    deliverySlipId: string;
    codPrice: number;
    reason: string;
  }>;
};
```

| Field | Provenance |
|-------|------------|
| HTTP 200 with warnings for partial match | TARGET_DECISION |
| `createdDepositIds` | TARGET_DECISION |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Staging: `deleteAll` → INSERT work rows → process → `deleteAll` | LEGACY_CONFIRMED | WF-11 | Block |
| BR-02 | Bank: match `CUSTOMER_CODE` + `PRICE` → `BILL_TRN` | LEGACY_CONFIRMED | WF-11 | Block |
| BR-03 | Bank: tạo deposit category `transfer`, line với `BANK_ID` | LEGACY_CONFIRMED | WF-11 | Block |
| BR-04 | Bank: `INSERT BANK_DEPOSIT_REL` link work → slip | LEGACY_CONFIRMED | WF-11 | Block |
| BR-05 | COD: match `DELIVERY_SLIP_ID` → `SALES_SLIP_TRN` (`COD_SC='1'`) | LEGACY_CONFIRMED | WF-11 | Block |
| BR-06 | COD: deposit category COD | LEGACY_CONFIRMED | WF-11 | Block |
| BR-07 | COD: skip duplicate `DELIVERY_SLIP_ID` nếu REL tồn tại | LEGACY_CONFIRMED | WF-11 VAL #4 | Block |
| BR-08 | Unmatched rows không fail toàn batch | LEGACY_CONFIRMED | WF-11 Error | Info |
| BR-09 | Work table filter `USER_ID` = current user | INFERRED | WF-11 DB READ | Info |
| TD-01 | Staging in-memory vs DB work table | TARGET_DECISION | TBD parity | Info |
| TD-02 | Two-step upload/process → single API optional | TARGET_DECISION | UX simplification | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | file | CSV or TSV | 422 | LEGACY_CONFIRMED | WF-11, AbstractXSVUploadAction |
| VAL-02 | bank amount | > 0 | 422 skip row | LEGACY_CONFIRMED | WF-11 Bank #2 |
| VAL-03 | bank date | valid date | 422 skip row | LEGACY_CONFIRMED | WF-11 Bank #3 |
| VAL-04 | COD deliverySlipId | required | skip row | LEGACY_CONFIRMED | WF-11 COD #1 |
| VAL-05 | COD codPrice | > 0 | skip row | LEGACY_CONFIRMED | WF-11 COD #2 |
| VAL-06 | COD match | SALES_SLIP with COD_SC=1 | warning skip | LEGACY_CONFIRMED | WF-11 COD #3 |
| VAL-07 | COD duplicate | no existing DELIVERY_DEPOSIT_REL | skip | LEGACY_CONFIRMED | WF-11 COD #4 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| File parse error | AbstractXSVUploadAction reject | WF-11 |
| Bank match fail | Manual review queue | WF-11 |
| Delivery slip not found | Warning + skip + log | WF-11 |
| Duplicate delivery | Skip | WF-11 |
| ServiceException | Log + error message | WF-11 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| File parse error | 422 | `IMPORT_PARSE_ERROR` | TARGET_DECISION |
| Partial match | 200 | result + `unmatchedRows` | TARGET_DECISION |
| All rows failed | 422 or 200 empty | `IMPORT_NO_MATCH` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Service error | 500 | `INTERNAL_ERROR` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `BANK_DEPOSIT_WORK` | Staged bank rows | TBD / in-memory | USER_ID | LEGACY_CONFIRMED |
| `DELIVERY_DEPOSIT_WORK` | Staged COD rows | TBD / in-memory | USER_ID | LEGACY_CONFIRMED |
| `BILL_TRN` | Auto-match bank | `bill` | amount + customer | LEGACY_CONFIRMED |
| `SALES_SLIP_TRN` | COD match | `salesSlip` | DELIVERY_SLIP_ID, COD_SC | LEGACY_CONFIRMED |
| `CUSTOMER_MST` | Lookup from bank entry | `customer` | active | LEGACY_CONFIRMED |
| `BANK_MST` | Bank account on line | `bank` | active | LEGACY_CONFIRMED |
| `DELIVERY_DEPOSIT_REL` | Duplicate check | TBD | by deliverySlipId | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `BANK_DEPOSIT_WORK` | INSERT/DELETE | staging TBD | Transient | LEGACY_CONFIRMED |
| `DELIVERY_DEPOSIT_WORK` | INSERT/DELETE | staging TBD | Transient | LEGACY_CONFIRMED |
| `DEPOSIT_SLIP_TRN` | INSERT | `deposit` | Auto-created | LEGACY_CONFIRMED |
| `DEPOSIT_LINE_TRN` | INSERT | `depositLine` | Per matched row | LEGACY_CONFIRMED |
| `DEPOSIT_*_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `BANK_DEPOSIT_REL` | INSERT | TBD | Bank link | LEGACY_CONFIRMED |
| `DELIVERY_DEPOSIT_REL` | INSERT | TBD | COD link | LEGACY_CONFIRMED |
| `BILL_TRN` | UPDATE | `bill` | DEPOSIT_PRICE if linked | INFERRED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** `$transaction` per matched row (deposit + rel + bill update) — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0604` (`IMPORT_BANK_DEPOSIT`) | `isMenuUpdate` | `deposit.import.bank` | POST bank import |
| `0603` (`IMPORT_DELIVERY_DEPOSIT`) | `isMenuUpdate` | `deposit.import.delivery` | POST COD import |

> **Evidence:** `03-route-api-inventory.md:93-94`, WF-11.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| POST | `/api/deposits/import/bank` | `importBankDeposit/upload` + `update` | `deposit.import.bank` |
| POST | `/api/deposits/import/delivery` | `importDeliveryDeposit/upload` + `update` | `deposit.import.delivery` |

```typescript
@Controller('deposits/import')
@UseGuards(AuthGuard, PermissionGuard)
export class DepositsImportController {
  constructor(private readonly importService: DepositsImportService) {}

  @Post('bank')
  @RequirePermission('deposit.import.bank')
  @UseInterceptors(FileInterceptor('file'))
  importBank(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: UserDto) {
    return this.importService.processBankFile(file, user);
  }
}
```

### Service pattern (bank)

```typescript
const rows = await this.parseBankCsv(file.buffer);
const results: BankImportResultDto = { /* ... */ };

for (const row of rows) {
  const bill = await this.matchBill(row);
  if (!bill) {
    results.unmatchedRows.push({ ...row, reason: 'NO_MATCHING_BILL' });
    continue;
  }
  await this.prisma.$transaction(async (tx) => {
    const deposit = await tx.deposit.create({ /* transfer category */ });
    await tx.bankDepositRel.create({ depositSlipId: deposit.id, bankWorkRef: row.ref });
    results.createdDepositIds.push(deposit.id);
  });
}
return results;
```

### Next.js UI

| Screen | Route | Legacy |
|--------|-------|--------|
| Bank import | `/deposits/import/bank` | `importBankDeposit` |
| COD import | `/deposits/import/delivery` | `importDeliveryDeposit` |
| Unmatched review | `/deposits/import/bank/review` | manual assign UI — TBD P1 |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Bank file happy path | valid CSV, matching bill | deposits created | Integration | TARGET_DECISION |
| TC-02 | Bank unmatched row | no bill match | 200 + unmatched list | Integration | LEGACY_CONFIRMED |
| TC-03 | Invalid file format | corrupt CSV | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | COD match sales slip | valid deliverySlipId | COD deposit created | Integration | LEGACY_CONFIRMED |
| TC-05 | COD duplicate | existing REL | row skipped | Integration | LEGACY_CONFIRMED |
| TC-06 | COD no sales match | unknown slip id | warning skip | Integration | LEGACY_CONFIRMED |
| TC-07 | Permission bank only | 0604 perm | 403 on delivery | Unit | TARGET_DECISION |
| TC-08 | Staging cleanup | after process | work table empty | Integration | LEGACY_CONFIRMED — TBD impl |

---

## 10. Risked Items

- [ ] Zengin / Yamato / Sagawa format specifics — ASSUMPTION from WF-11
- [ ] `ImportBankDepositAction.java` not in workspace — line-level unverified
- [ ] Staging DB vs in-memory — impacts Prisma models
- [ ] Manual review UI for unmatched — scope P1 unclear
- [ ] Bank file format varies by bank — UNKNOWN

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Exact bank CSV column schema per bank | Support 1 format P1 | High | Open |
| OQ-02 | UNKNOWN | Shipper formats (Yamato vs Sagawa) | Parser strategy per format | High | Open |
| OQ-03 | UNKNOWN | Manual review UI in P1? | API returns unmatched; UI defer | Medium | Open |
| TD-01 | TARGET_DECISION | Persist WORK tables vs in-memory | In-memory + session | Medium | Proposed |
| TD-02 | TARGET_DECISION | Merge upload+process to one endpoint | Yes for API simplicity | Low | Proposed |
| TD-03 | TARGET_DECISION | Separate perms `deposit.import.bank` vs `.delivery` | Yes (0603/0604) | Medium | Proposed |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-11](../workflows/WF-11-bank-deposit-import.md) |
| Entry FD | [FD-DEPOSIT-01](./FD-DEPOSIT-01-deposit-entry.md) |
| Inventory | [_inventory/deposit.md](./_inventory/deposit.md) |
| Index | [_index.md](./_index.md) |
