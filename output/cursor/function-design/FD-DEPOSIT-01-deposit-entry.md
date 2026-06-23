# FD-DEPOSIT-01: Nhập Phiếu Thu Tiền (入金入力 – Deposit Entry)

> **Confidence**: HIGH (WF-06, route inventory) / MEDIUM (Java line-level — source ngoài workspace)  
> **Evidence file**: [`_evidence/FD-DEPOSIT-01-deposit-entry.md`](./_evidence/FD-DEPOSIT-01-deposit-entry.md)  
> **Workflow**: [WF-06 Deposit Entry](../workflows/WF-06-deposit-entry.md)  
> **Scope**: Tạo/sửa/xóa phiếu thu tay, tìm kiếm (không gồm import bank/COD — xem FD-DEPOSIT-02)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) / Partial (methods) | `InputDepositAction` — WF-06, `02-module-inventory.md` §2.5 |
| Service logic | Confirmed | `DepositSlipService`, `DepositLineService` — WF-06 |
| DDL mapping | Partial | `DEPOSIT_SLIP_TRN`, `DEPOSIT_LINE_TRN` — WF-06 |
| Workflow coverage | Confirmed | WF-06 |
| Target API design | Target decision | NestJS `DepositsController` |

**Confidence: MEDIUM-HIGH** — Flow confirmed từ WF; import flows tách sang FD-DEPOSIT-02.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Nhập phiếu thu tiền từ KH (nhiều hình thức), link bill, tìm kiếm | LEGACY_CONFIRMED |
| **Module** | `deposit` / DEPOSIT | LEGACY_CONFIRMED |
| **Actor** | Kế toán có quyền nhập phiếu thu | WF_CONFIRMED |
| **Legacy URLs** | `/deposit/inputDeposit/*`, `/deposit/searchDeposit/*` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST/PATCH/DELETE /api/deposits` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createDepositSchema` (Zod)

```typescript
const depositLineSchema = z.object({
  lineNo: z.number().int().positive(),
  depositCategory: z.enum(['cash', 'check', 'transfer', 'bank', 'cod', 'setoff']),
  price: z.number().positive(),
  bankId: z.string().optional(),
  instDate: z.string().optional(),
  memo: z.string().optional(),
});

const createDepositSchema = z.object({
  customerCode: z.string().min(1),
  depositDate: z.string(),
  billId: z.string().optional(),
  totalAmount: z.number().positive(),
  lines: z.array(depositLineSchema).min(1),
}).refine(
  (d) => d.lines.reduce((s, l) => s + l.price, 0) === d.totalAmount,
  { message: 'TOTAL_MISMATCH' },
);
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `customerCode` | string | ✓ | exists in CUSTOMER_MST | `CUSTOMER_CODE` | LEGACY_CONFIRMED |
| `depositDate` | date | ✓ | valid date | `DEPOSIT_DATE` | LEGACY_CONFIRMED |
| `billId` | string | | exists if provided | `BILL_ID` | LEGACY_CONFIRMED |
| `totalAmount` | decimal | ✓ | = sum(lines) | `DEPOSIT_TOTAL` | LEGACY_CONFIRMED |
| `lines[].depositCategory` | enum | ✓ | in CATEGORY_TRN | `DEPOSIT_CATEGORY` | LEGACY_CONFIRMED |
| `lines[].price` | decimal | ✓ | > 0 | `PRICE` | LEGACY_CONFIRMED |
| `lines[].bankId` | string | conditional | required if bank transfer | `BANK_ID` | LEGACY_CONFIRMED |
| `lines[].instDate` | date | conditional | if installment category | `INST_DATE` | LEGACY_CONFIRMED |

### Search query — `depositSearchSchema`

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `customerCode` | string | — | Search form |
| `depositDateFrom` / `To` | date | — | Date range |
| `status` | `'0' \| '1'` | — | Open / ART closed |
| `page` / `pageSize` | number | 1 / 20 | pager |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Register success | Stay on form + flash message | `InputDepositAction.register()` | INFERRED |
| Delete success | Redirect / refresh | WF-06 | INFERRED |
| Validation error | ActionErrors on JSP | Struts pattern | INFERRED |
| Search | Result list JSP | `SearchDepositAction` | INFERRED |

### Target Response

```typescript
type DepositLineDto = {
  lineNo: number;
  depositCategory: string;
  price: number;
  bankId?: string;
};

type DepositDto = {
  depositSlipId: string;
  customerCode: string;
  customerName: string;
  depositDate: string;
  totalAmount: number;
  billId?: string;
  status: '0' | '1';
  lines: DepositLineDto[];
};

type ListDepositsResponse = {
  data: DepositDto[];
  total: number;
  page: number;
  pageSize: number;
};
```

| Field | Provenance |
|-------|------------|
| `customerName` snapshot | LEGACY_CONFIRMED |
| `depositSlipId` cuid | TARGET_DECISION |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Snapshot KH fields vào `DEPOSIT_SLIP_TRN` on insert | LEGACY_CONFIRMED | WF-06 | Block |
| BR-02 | N lines `DEPOSIT_LINE_TRN` per slip | LEGACY_CONFIRMED | WF-06 | Block |
| BR-03 | Ghi `DEPOSIT_SLIP_TRN_HIST` + `DEPOSIT_LINE_TRN_HIST` | LEGACY_CONFIRMED | WF-06 | Info |
| BR-04 | Link bill → `UPDATE BILL_TRN.DEPOSIT_PRICE` | LEGACY_CONFIRMED | WF-06 | Block |
| BR-05 | STATUS `0`=Open; `1`=ART closed | LEGACY_CONFIRMED | WF-06 Status | Block |
| BR-06 | Chỉ xóa/sửa khi STATUS=`0` | LEGACY_CONFIRMED | WF-06 | Block |
| BR-07 | `bankId` required cho category bank/transfer | LEGACY_CONFIRMED | WF-06 VAL #5 | Block |
| BR-08 | Delete = soft `DEL_DATETM` | INFERRED | WF-06 pattern | Block |
| TD-01 | Target `deletedAt` thay `DEL_DATETM` | TARGET_DECISION | migration convention | Info |
| TD-02 | Import rel (`BANK_DEPOSIT_REL`) — FD-DEPOSIT-02 | TARGET_DECISION | scope split | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `customerCode` | Required | 422 | LEGACY_CONFIRMED | WF-06 #1 |
| VAL-02 | `depositDate` | Required, valid | 422 | LEGACY_CONFIRMED | WF-06 #2 |
| VAL-03 | `lines[].depositCategory` | Required, in enum | 422 | LEGACY_CONFIRMED | WF-06 #3 |
| VAL-04 | `lines[].price` | > 0 | 422 | LEGACY_CONFIRMED | WF-06 #4 |
| VAL-05 | `lines[].bankId` | Required if bank category | 422 | LEGACY_CONFIRMED | WF-06 #5 |
| VAL-06 | `lines[].instDate` | Required if installment | 422 | LEGACY_CONFIRMED | WF-06 #6 |
| VAL-07 | totals | sum(lines) = totalAmount | 422 | LEGACY_CONFIRMED | WF-06 #7 |
| VAL-08 | delete/update | STATUS must be `0` | 409 | LEGACY_CONFIRMED | WF-06 #8 |
| VAL-09 | `billId` | Bill exists if provided | 422 | LEGACY_CONFIRMED | WF-06 Error |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Bill not found | `errors.notExist` | WF-06 |
| ART closed slip | Block delete/edit | WF-06 |
| Total mismatch | `errors.totalMismatch` | INFERRED |
| Lock conflict | `errors.lock` | WF-06 |
| Service error | Log + throw | WF-06 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Bill not found | 422 | `BILL_NOT_FOUND` | TARGET_DECISION |
| ART closed | 409 | `DEPOSIT_ART_CLOSED` | TARGET_DECISION |
| Total mismatch | 422 | `TOTAL_MISMATCH` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `CUSTOMER_MST` | Lookup + snapshot | `customer` | active | LEGACY_CONFIRMED |
| `BILL_TRN` | Unpaid bills dropdown | `bill` | by customer | LEGACY_CONFIRMED |
| `BANK_MST` | Bank account dropdown | `bank` | active | LEGACY_CONFIRMED |
| `CATEGORY_TRN` | Deposit category | TBD | category type | LEGACY_CONFIRMED |
| `DEPOSIT_SLIP_TRN` | Search/detail | `deposit` | `deletedAt IS NULL` | LEGACY_CONFIRMED |
| `DEPOSIT_LINE_TRN` | Line detail | `depositLine` | by slip | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `DEPOSIT_SLIP_TRN` | INSERT/UPDATE | `deposit` | Main | LEGACY_CONFIRMED |
| `DEPOSIT_LINE_TRN` | INSERT/UPDATE/DELETE | `depositLine` | Lines | LEGACY_CONFIRMED |
| `DEPOSIT_*_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `BILL_TRN` | UPDATE | `bill` | DEPOSIT_PRICE | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** `$transaction` khi slip + lines + hist + bill update — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0600` (`INPUT_DEPOSIT`) | `isMenuValid` | `deposit.read` | GET list/detail |
| `0600` | `isMenuUpdate` | `deposit.write` | POST, PATCH |
| `0600` | `isMenuUpdate` (delete) | `deposit.delete` | DELETE |
| `0601` (`SEARCH_DEPOSIT`) | `isMenuValid` | `deposit.read` | GET search |

> **Evidence:** `03-route-api-inventory.md:91-92`, WF-06 § User Role.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/deposits` | `searchDeposit` | `deposit.read` |
| GET | `/api/deposits/:id` | `inputDeposit/edit` | `deposit.read` |
| POST | `/api/deposits` | `register` create | `deposit.write` |
| PATCH | `/api/deposits/:id` | `register` update | `deposit.write` |
| DELETE | `/api/deposits/:id` | `delete` | `deposit.delete` |

```typescript
@Controller('deposits')
@UseGuards(AuthGuard, PermissionGuard)
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Post()
  @RequirePermission('deposit.write')
  create(@Body() dto: CreateDepositInput, @CurrentUser() user: UserDto) {
    return this.depositsService.create(dto, user);
  }
}
```

### Service pattern

```typescript
return this.prisma.$transaction(async (tx) => {
  const customer = await tx.customer.findFirst({
    where: { code: dto.customerCode, deletedAt: null },
  });
  if (!customer) throw new NotFoundException('CUSTOMER_NOT_FOUND');

  const slip = await tx.deposit.create({
    data: {
      customerCode: customer.code,
      customerName: customer.name,
      depositDate: dto.depositDate,
      totalAmount: dto.totalAmount,
      billId: dto.billId,
      status: '0',
      lines: { create: dto.lines },
    },
    include: { lines: true },
  });

  if (dto.billId) {
    await tx.bill.update({
      where: { id: dto.billId },
      data: { depositPrice: { increment: dto.totalAmount } },
    });
  }
  return { success: true, data: slip };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| Create | `/deposits/new` | `inputDeposit.jsp` |
| Edit | `/deposits/[id]` | `inputDeposit.jsp` |
| Search | `/deposits` | `searchDeposit.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Create happy path | valid dto + 2 lines | 201 + slip id | Integration | TARGET_DECISION |
| TC-02 | Total mismatch | lines sum ≠ total | 422 | Unit | LEGACY_CONFIRMED |
| TC-03 | Bank line without bankId | category=bank | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | Link to bill | billId set | BILL.DEPOSIT_PRICE updated | Integration | LEGACY_CONFIRMED |
| TC-05 | Delete open slip | STATUS=0 | 204 soft delete | Integration | INFERRED |
| TC-06 | Delete ART closed | STATUS=1 | 409 | Integration | LEGACY_CONFIRMED |
| TC-07 | Permission denied | no write perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-08 | Hist on update | PATCH | hist records | Integration | LEGACY_CONFIRMED — TBD |

---

## 10. Risked Items

- [ ] Full `DEPOSIT_CATEGORY` enum từ `CATEGORY_TRN` — chưa verify
- [ ] `setoff` category business logic — UNKNOWN
- [ ] `ART_BALANCE_TRN.ART_ID` link — workflow ART chưa có FD
- [ ] Soft-delete read filter — INFERRED
- [ ] Bank/delivery import overlap — scoped FD-DEPOSIT-02

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | ART closing workflow & `ART_ID` link | Defer FD-ART | High | Open |
| OQ-02 | UNKNOWN | Full deposit category list from DB | Characterization test | Medium | Open |
| OQ-03 | UNKNOWN | `setoff` mechanism | Defer | High | Open |
| TD-01 | TARGET_DECISION | `depositHist` model | Snapshot JSON | Medium | Proposed |
| TD-02 | TARGET_DECISION | Search on 0601 separate perm vs 0600 | `deposit.read` covers both | Low | Proposed |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-06](../workflows/WF-06-deposit-entry.md) |
| Import FD | [FD-DEPOSIT-02](./FD-DEPOSIT-02-bank-deposit-import.md) |
| Inventory | [_inventory/deposit.md](./_inventory/deposit.md) |
| Index | [_index.md](./_index.md) |
