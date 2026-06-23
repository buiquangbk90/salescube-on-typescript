# FD-BILL-01: Chốt Hóa Đơn (請求締め – Bill Closing / Reopen)

> **Confidence**: HIGH (WF-05, route inventory) / MEDIUM (Java line-level — source ngoài workspace)  
> **Evidence file**: [`_evidence/FD-BILL-01-bill-closing.md`](./_evidence/FD-BILL-01-bill-closing.md)  
> **Workflow**: [WF-05 Bill Closing](../workflows/WF-05-bill-closing.md)  
> **Scope**: Tìm KH cần chốt, chốt hóa đơn theo kỳ, mở lại (không gồm in PDF, tìm bill đã chốt)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class) / Partial (methods) | `CloseBillAction` — WF-05, `02-module-inventory.md` §2.4 |
| Service logic | Confirmed | `BillService`, `BillAndArtService` — WF-05 |
| DDL mapping | Partial | `BILL_TRN`, `SALES_SLIP_TRN` — WF-05, CREATE.sql L2366-2422 |
| Workflow coverage | Confirmed | WF-05 |
| Target API design | Target decision | NestJS `BillingController` |

**Confidence: MEDIUM-HIGH** — Flow và routes confirmed từ WF/RE; method-level cần verify khi có `SalesCube/`.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Chốt hóa đơn theo ngày cutoff cho từng KH; mở lại bill đã chốt | LEGACY_CONFIRMED |
| **Module** | `bill` / BILL | LEGACY_CONFIRMED |
| **Actor** | Kế toán có quyền chốt hóa đơn | WF_CONFIRMED |
| **Legacy URLs** | `/bill/closeBill/index`, `/find`, `/close`, `/reopen` | LEGACY_CONFIRMED |
| **Target API** | `GET/POST /api/billing/candidates`, `POST /api/billing/close`, `POST /api/billing/:billId/reopen` | TARGET_DECISION |
| **Trigger** | User action (HTTP POST) — chạy trong request, không batch job | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `closeBillSchema` (Zod)

```typescript
const closeBillSchema = z.object({
  cutOffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customerCodes: z.array(z.string().min(1)).min(1),
});
```

### Target — `billCandidateQuerySchema`

```typescript
const billCandidateQuerySchema = z.object({
  cutOffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cutoffGroup: z.string().optional(),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy equivalent | Provenance |
|-------|------|----------|------------|-------------------|------------|
| `cutOffDate` | date | ✓ | `yyyy/MM/dd` legacy → ISO target | Form cutoff date | LEGACY_CONFIRMED |
| `customerCodes` | string[] | ✓ | ≥1 checked KH | Checkbox list | LEGACY_CONFIRMED |
| `cutoffGroup` | string | | match `CUSTOMER_MST.CUTOFF_GROUP` | Filter nhóm chốt | LEGACY_CONFIRMED |

**Reopen input:** `billId` (path) hoặc `(billCutoffDate, customerCode)` — LEGACY_CONFIRMED từ `CloseBillAction.reopen()`.

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Find success | Forward JSP + danh sách KH cần chốt | `CloseBillAction.find()` | INFERRED |
| Close success | Re-search + `infos.closeBill.close` | WF-05 | LEGACY_CONFIRMED |
| Close partial | Một số KH chốt, timeout có thể partial commit | WF-05 Error Handling | LEGACY_CONFIRMED |
| Reopen success | Message success, list refresh | WF-05 | LEGACY_CONFIRMED |
| Validation error | ActionErrors trên form | Struts pattern | INFERRED |

### Target Response

```typescript
type CloseBillResultDto = {
  customerCode: string;
  customerName: string;
  billId?: string;
  totalAmount: number;
  status: 'SUCCESS' | 'SKIPPED' | 'ERROR';
  message?: string;
};

type CloseBillResponse = {
  processedCount: number;
  results: CloseBillResultDto[];
};

type ReopenBillResponse = {
  billId: string;
  customerCode: string;
  status: 'REOPENED';
  affectedSalesCount: number;
};
```

| Field | Provenance |
|-------|------------|
| `billId` cuid/autoincrement | TARGET_DECISION (thay `SEQ_MAKER`) |
| `totalAmount`, `artBalance` | LEGACY_CONFIRMED (`BILL_TRN`) |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Chỉ chốt `SALES_SLIP_TRN` có `BILL_ID IS NULL`, `STATUS='2'` | LEGACY_CONFIRMED | WF-05 Main Code Path | Block |
| BR-02 | Sau chốt: set `BILL_ID`, `STATUS='3'` trên sales slips | LEGACY_CONFIRMED | WF-05 Status Transitions | Block |
| BR-03 | `INSERT BILL_TRN` + `BILL_TRN_HIST` mỗi KH chốt | LEGACY_CONFIRMED | WF-05 | Block |
| BR-04 | Cập nhật `CUSTOMER_MST.LAST_CUTOFF_DATE` | LEGACY_CONFIRMED | WF-05 | Block |
| BR-05 | Tính AR qua `BillAndArtService.calcArtBalance()` | LEGACY_CONFIRMED | WF-05 | Block |
| BR-06 | Không chốt 2 lần cùng tháng cho cùng KH | LEGACY_CONFIRMED | WF-05 VAL #4 | Block |
| BR-07 | `CUTOFF_GROUP` KH phải khớp nhóm đang chốt | LEGACY_CONFIRMED | WF-05 VAL #5 | Block |
| BR-08 | Reopen: `DELETE BILL_TRN`, rollback sales `STATUS='2'`, `BILL_ID=NULL` | LEGACY_CONFIRMED | WF-05 reopen path | Block |
| BR-09 | Loop từng KH — không transaction toàn batch legacy | LEGACY_CONFIRMED | WF-05 partial commit risk | Info |
| TD-01 | Target: `$transaction` per customer | TARGET_DECISION | giảm partial commit | Block |
| TD-02 | Target: `billId` autoincrement/cuid | TARGET_DECISION | migration convention | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `cutOffDate` | Required, valid date | 422 | LEGACY_CONFIRMED | WF-05 #1 |
| VAL-02 | `cutOffDate` | `ymService.getYm()` valid | 422 | LEGACY_CONFIRMED | WF-05 #2 |
| VAL-03 | `customerCodes` | ≥1 KH selected | 422 | LEGACY_CONFIRMED | WF-05 #3 |
| VAL-04 | per KH | No duplicate bill same month | 409 | LEGACY_CONFIRMED | WF-05 #4 |
| VAL-05 | per KH | `CUTOFF_GROUP` match | 422 | LEGACY_CONFIRMED | WF-05 #5 |
| VAL-06 | reopen | `validateCheckReopen()` pass | 409 | LEGACY_CONFIRMED | WF-05 #6 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Invalid date | `errors.date` | WF-05 |
| No customer selected | `errors.noSelect` | INFERRED |
| Already closed | ActionMessage từ `billService` | WF-05 |
| Lock conflict | `errors.lock` / `UnabledLockException` | WF-05 |
| Service error | `errProc(e)` | WF-05 |
| Partial commit | Không compensation | WF-05 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Already closed | 409 | `BILL_ALREADY_CLOSED` | TARGET_DECISION |
| Lock / version | 409 | `VERSION_CONFLICT` | ASSUMPTION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Per-KH error in batch | 200 + partial results | `PARTIAL_SUCCESS` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `SALES_SLIP_TRN` | Unbilled sales | `salesSlip` | `billId IS NULL`, status confirmed | LEGACY_CONFIRMED |
| `SALES_LINE_TRN` | Tính tổng | `salesLine` | by slip | LEGACY_CONFIRMED |
| `DEPOSIT_SLIP_TRN` / `DEPOSIT_LINE_TRN` | Thu trong kỳ | TBD | by customer + date range | LEGACY_CONFIRMED |
| `CUSTOMER_MST` | Cutoff group, last date | `customer` | active | LEGACY_CONFIRMED |
| `BILL_TRN` | Check đã chốt | `bill` | by customer + cutoff | LEGACY_CONFIRMED |
| `ART_BALANCE_TRN` | Số dư AR kỳ trước | TBD | by customer | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `BILL_TRN` | INSERT / DELETE | `bill` | Close / reopen | LEGACY_CONFIRMED |
| `BILL_TRN_HIST` | INSERT | `billHist` TBD | Snapshot event | LEGACY_CONFIRMED |
| `SALES_SLIP_TRN` | UPDATE bulk | `salesSlip` | BILL_ID, STATUS | LEGACY_CONFIRMED |
| `CUSTOMER_MST` | UPDATE | `customer` | LAST_CUTOFF_DATE | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** `$transaction` per customer (close + reopen) — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0501` (`CLOSE_BILL`) | `isMenuValid` | `billing.read` | GET candidates |
| `0501` | `isMenuUpdate` | `billing.close` | POST close, reopen |

> **Evidence:** `03-route-api-inventory.md:79`, WF-05 § User Role.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/billing/candidates` | `closeBill/find` | `billing.read` |
| POST | `/api/billing/close` | `closeBill/close` | `billing.close` |
| POST | `/api/billing/:billId/reopen` | `closeBill/reopen` | `billing.close` |

```typescript
@Controller('billing')
@UseGuards(AuthGuard, PermissionGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('close')
  @RequirePermission('billing.close')
  close(@Body() dto: CloseBillInput, @CurrentUser() user: UserDto) {
    return this.billingService.close(dto, user);
  }
}
```

### Service pattern

```typescript
for (const customerCode of dto.customerCodes) {
  await this.prisma.$transaction(async (tx) => {
    const unbilled = await tx.salesSlip.findMany({
      where: { customerCode, billId: null, status: '2', /* date range */ },
    });
    const bill = await tx.bill.create({ data: { /* calc totals */ } });
    await tx.salesSlip.updateMany({
      where: { id: { in: unbilled.map((s) => s.id) } },
      data: { billId: bill.id, status: '3' },
    });
    await tx.customer.update({
      where: { code: customerCode },
      data: { lastCutoffDate: dto.cutOffDate },
    });
  });
}
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| Close bill | `/billing/close` | closeBill screen |
| Candidate list | same (table) | checkbox list |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Close happy path | valid date + 1 KH | bill created, sales status 3 | Integration | TARGET_DECISION |
| TC-02 | Duplicate close same month | same KH twice | 409 | Integration | LEGACY_CONFIRMED |
| TC-03 | Invalid cutoff date | bad date | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | No customer selected | empty array | 422 | Unit | LEGACY_CONFIRMED |
| TC-05 | Reopen bill | valid billId | sales status 2, bill deleted | Integration | LEGACY_CONFIRMED |
| TC-06 | Permission denied | no close perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-07 | Per-customer transaction rollback | simulate mid-fail | prior KH committed, failed KH rolled back | Integration | TARGET_DECISION |
| TC-08 | ART balance calc | KH with prior balance | correct artBalance on bill | Integration | LEGACY_CONFIRMED — TBD |

---

## 10. Risked Items

- [ ] Java source không trong workspace — `validateCheckClose` line ranges chưa verify
- [ ] Partial commit legacy — target phải dùng per-customer transaction
- [ ] `ART_BALANCE_TRN` model chưa có trong Prisma P1
- [ ] Reopen `LAST_CUTOFF_DATE` rollback value — UNKNOWN (kỳ trước?)
- [ ] `MakeOutBillAction` (0502), `SearchBillAction` (0500) — chưa có FD
- [ ] Optimistic lock trên `BILL_TRN` — ASSUMPTION

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | `ART_BALANCE_TRN` structure & target usage | Defer to FD-ART | High | Open |
| OQ-02 | UNKNOWN | `BILL_TRN.STATUS` enum values | Map `"0"` only initially | Medium | Open |
| OQ-03 | INFERRED | Reopen `LAST_CUTOFF_DATE` = previous cutoff? | Characterization test | High | Open |
| OQ-04 | TARGET_DECISION | Invoice PDF (0502) in P1? | Defer FD-BILL-03 | Medium | Proposed |
| TD-01 | TARGET_DECISION | Batch response: all-or-nothing vs partial | Partial per-KH results | Medium | Proposed |
| TD-02 | TARGET_DECISION | `billHist` snapshot shape | JSON column | Medium | Proposed |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-05](../workflows/WF-05-bill-closing.md) |
| Inventory | [_inventory/bill.md](./_inventory/bill.md) |
| Route | [03-route-api-inventory.md](../03-route-api-inventory.md) |
| Index | [_index.md](./_index.md) |
