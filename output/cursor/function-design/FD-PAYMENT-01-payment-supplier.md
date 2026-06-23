# FD-PAYMENT-01: Thanh Toán Nhà Cung Cấp (支払 – Payment to Supplier)

> **Confidence**: HIGH (WF-09, ClosePaymentAction cited) / MEDIUM (ClosePaymentService internals)  
> **Evidence file**: [`_evidence/FD-PAYMENT-01-payment-supplier.md`](./_evidence/FD-PAYMENT-01-payment-supplier.md)  
> **Workflow**: [WF-09 Payment to Supplier](../workflows/WF-09-payment-to-supplier.md)  
> **Scope**: Chốt thanh toán NCC (`closePayment`), reopen, nhập phiếu thủ công (`inputPayment`), tìm kiếm

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed | `ClosePaymentAction.java`, `InputPaymentAction.java` — WF-09 |
| Service logic | Confirmed (close) | `ClosePaymentService`, `AptBalanceService` — WF-09 |
| DDL mapping | Confirmed (via WF) | `PAYMENT_SLIP_TRN`, `APT_BALANCE_TRN` — WF-09 |
| Workflow coverage | Confirmed | WF-09 |
| Target API design | Target decision | NestJS `SupplierPaymentsController` |

**Confidence: MEDIUM-HIGH** — Close flow confirmed L68-79; manual entry và reopen cần deep trace.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Chốt AP NCC theo kỳ, tạo PAYMENT_SLIP, cập nhật APT_BALANCE; nhập thủ công | LEGACY_CONFIRMED |
| **Module** | `payment` / PAYMENT | LEGACY_CONFIRMED |
| **Actor** | Kế toán — `isMenuUpdate(CLOSE_PAYMENT)` cho chốt | LEGACY_CONFIRMED |
| **Legacy URLs** | `/payment/closePayment`, `/payment/inputPayment`, `/payment/searchPayment` | LEGACY_CONFIRMED |
| **Target API** | `POST /api/supplier-payments/close`, CRUD `/api/supplier-payments` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `closeSupplierPaymentSchema` (Zod)

```typescript
const closeSupplierPaymentSchema = z.object({
  closeDate: z.coerce.date(),
  supplierCodes: z.array(z.string().min(1)).min(1),
});

const createManualPaymentSchema = z.object({
  supplierCode: z.string().min(1),
  poSlipId: z.string().min(1),
  paymentDate: z.coerce.date(),
  lines: z.array(z.object({
    supplierLineId: z.string().min(1),
    poLineId: z.string().min(1),
    amount: z.number().nonnegative(),
  })).min(1),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `closeDate` | date | ✓ | valid date | `closePaymentForm.closeDate` | LEGACY_CONFIRMED |
| `supplierCodes` | string[] | ✓ | min 1 NCC | form selection | LEGACY_CONFIRMED |
| `supplierCode` (manual) | string | ✓ | NOT NULL DDL | `PAYMENT_SLIP_TRN.SUPPLIER_CODE` | LEGACY_CONFIRMED |
| `poSlipId` (manual) | string | ✓ | NOT NULL DDL | `PAYMENT_SLIP_TRN.PO_SLIP_ID` | LEGACY_CONFIRMED |
| `poLineId` (line) | string | ✓ | NOT NULL DDL | `PAYMENT_LINE_TRN.PO_LINE_ID` | LEGACY_CONFIRMED |
| `supplierLineId` (line) | string | ✓ | NOT NULL DDL | `PAYMENT_LINE_TRN.SUPPLIER_LINE_ID` | LEGACY_CONFIRMED |

### Search query

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `supplierCode` | string | — | Search form |
| `closeDateFrom` / `closeDateTo` | date | — | Period |
| `page` | number | 1 | pager |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Close success | Redirect `closePayment.jsp` | WF-09 | LEGACY_CONFIRMED |
| Reopen success | Redirect same screen | WF-09 | LEGACY_CONFIRMED |
| Manual register | Stay / complete JSP | INFERRED | INFERRED |
| Validation error | ActionErrors on form | Struts | INFERRED |

### Target Response

```typescript
type PaymentLineDto = {
  id: string;
  supplierLineId: string;
  poLineId: string;
  amount: number;
};

type SupplierPaymentDto = {
  id: string;
  supplierCode: string;
  poSlipId: string;
  closeDate: string;
  status: 'CREATED' | 'PAID';
  lines: PaymentLineDto[];
};

type ClosePaymentResponse = {
  success: true;
  payments: SupplierPaymentDto[];
  aptBalanceId: string;
};
```

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Close: tổng hợp `SUPPLIER_SLIP_TRN` chưa thanh toán (`PAYMENT_SLIP_ID IS NULL`) | LEGACY_CONFIRMED | WF-09 | Block |
| BR-02 | Close: INSERT `PAYMENT_SLIP_TRN` + `PAYMENT_LINE_TRN` | LEGACY_CONFIRMED | WF-09 | Block |
| BR-03 | Close: SET `SUPPLIER_SLIP_TRN.PAYMENT_SLIP_ID` | LEGACY_CONFIRMED | WF-09 | Block |
| BR-04 | Close: INSERT `APT_BALANCE_TRN` snapshot AP | LEGACY_CONFIRMED | WF-09 | Block |
| BR-05 | Reopen: DELETE payment slip/lines, NULL `PAYMENT_SLIP_ID` | LEGACY_CONFIRMED | WF-09 | Block |
| BR-06 | NCC không chốt 2 lần cùng kỳ | LEGACY_CONFIRMED | WF-09 VAL #3 | Block |
| BR-07 | PAYMENT_LINE bắt buộc `PO_LINE_ID` + `SUPPLIER_LINE_ID` | LEGACY_CONFIRMED | WF-09 DDL | Block |
| BR-08 | Ghi `PAYMENT_SLIP_TRN_HIST` on close | LEGACY_CONFIRMED | WF-09 | Info |
| BR-09 | Partial commit risk legacy — không compensation | LEGACY_CONFIRMED | WF-09 Error | Info |
| TD-01 | Target: single `$transaction` cho toàn bộ close | TARGET_DECISION | fix legacy risk | Block |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `closeDate` | Required, valid | 422 | LEGACY_CONFIRMED | WF-09 |
| VAL-02 | `supplierCodes` | Min 1 selected | 422 | LEGACY_CONFIRMED | WF-09 |
| VAL-03 | close | No duplicate close same period | 409 | LEGACY_CONFIRMED | WF-09 |
| VAL-04 | `poLineId` | NOT NULL per line | 422 | LEGACY_CONFIRMED | WF-09 |
| VAL-05 | `supplierLineId` | NOT NULL per line | 422 | LEGACY_CONFIRMED | WF-09 |
| VAL-06 | reopen | Payment slip exists | 404 | INFERRED | WF-09 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Invalid closeDate | Parse exception | WF-09 |
| ServiceException | `super.errorLog(se)` + throw L75-78 | WF-09 |
| Partial commit | Không rollback cross-table | WF-09 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Duplicate close period | 409 | `ALREADY_CLOSED` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |
| Forbidden (no close perm) | 403 | `FORBIDDEN` | TARGET_DECISION |
| Transaction failure | 500 | `CLOSE_FAILED` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `SUPPLIER_SLIP_TRN` | Pending AP | `supplierSlip` | `paymentSlipId IS NULL` | LEGACY_CONFIRMED |
| `SUPPLIER_LINE_TRN` | Line amounts | `supplierLine` | by slip | LEGACY_CONFIRMED |
| `APT_BALANCE_TRN` | Prior balance | `aptBalance` | by period | LEGACY_CONFIRMED |
| `SUPPLIER_MST` | NCC info | `supplier` | active | LEGACY_CONFIRMED |
| `PAYMENT_SLIP_TRN` | Search | `paymentSlip` | | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `PAYMENT_SLIP_TRN` | INSERT / DELETE | `paymentSlip` | Close / reopen | LEGACY_CONFIRMED |
| `PAYMENT_LINE_TRN` | INSERT / DELETE | `paymentLine` | Lines | LEGACY_CONFIRMED |
| `APT_BALANCE_TRN` | INSERT | `aptBalance` | AP snapshot | LEGACY_CONFIRMED |
| `SUPPLIER_SLIP_TRN` | UPDATE | `supplierSlip` | `paymentSlipId` | LEGACY_CONFIRMED |
| `*_HIST` tables | INSERT | TBD | Snapshots | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | LEGACY_CONFIRMED |

**Transaction:** Close/reopen phải atomic — TARGET_DECISION (khắc phục legacy partial commit risk).

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `0902` (`CLOSE_PAYMENT`) | `isMenuUpdate` | `supplier-payment.close` | POST close, reopen |
| `0900` (`INPUT_PAYMENT`) | `isMenuUpdate` | `supplier-payment.write` | POST manual |
| `0901` (`SEARCH_PAYMENT`) | `isMenuValid` | `supplier-payment.read` | GET search |
| `0900` / `0901` | `isMenuValid` | `supplier-payment.read` | GET detail |

> **Evidence:** `03-route-api-inventory.md:128-130`, WF-09.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/supplier-payments` | `searchPayment` | `supplier-payment.read` |
| GET | `/api/supplier-payments/pending` | close screen load | `supplier-payment.read` |
| POST | `/api/supplier-payments/close` | `closePayment/close` | `supplier-payment.close` |
| POST | `/api/supplier-payments/:id/reopen` | `closePayment/reopen` | `supplier-payment.close` |
| POST | `/api/supplier-payments` | `inputPayment/register` | `supplier-payment.write` |
| GET | `/api/supplier-payments/:id` | `inputPayment/edit` | `supplier-payment.read` |

```typescript
@Controller('supplier-payments')
@UseGuards(AuthGuard, PermissionGuard)
export class SupplierPaymentsController {
  @Post('close')
  @RequirePermission('supplier-payment.close')
  close(@Body() dto: CloseSupplierPaymentInput, @CurrentUser() user: UserDto) {
    return this.service.close(dto, user);
  }
}
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| Close | `/payments/suppliers/close` | `closePayment.jsp` |
| Manual entry | `/payments/suppliers/new` | `inputPayment.jsp` |
| Search | `/payments/suppliers` | `searchPayment.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Close happy path | closeDate + suppliers | payment slips + apt balance | Integration | LEGACY_CONFIRMED |
| TC-02 | Duplicate close same period | same NCC twice | 409 | Integration | LEGACY_CONFIRMED |
| TC-03 | Reopen | existing payment id | slips unlinked | Integration | LEGACY_CONFIRMED |
| TC-04 | Manual payment | valid lines | 201 | Integration | INFERRED |
| TC-05 | Missing closeDate | invalid | 422 | Unit | LEGACY_CONFIRMED |
| TC-06 | No supplier selected | empty array | 422 | Unit | LEGACY_CONFIRMED |
| TC-07 | Permission denied close | no 0902 perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-08 | Atomic close | simulate mid-fail | full rollback | Integration | TARGET_DECISION |

---

## 10. Risked Items

- [ ] Legacy partial commit — SUPPLIER_SLIP có thể không update khi PAYMENT đã tạo
- [ ] `InputPaymentAction` flow chưa trace đầy đủ
- [ ] Jasper PDF in phiếu thanh toán — INFERRED, chưa có template path
- [ ] `PAYMENT_SLIP_TRN.STATUS` "1" paid — INFERRED
- [ ] Reopen khi đã có thanh toán thực tế — UNKNOWN guard

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | LEGACY_CONFIRMED | Partial commit behavior | Target must be atomic | High | Open |
| OQ-02 | INFERRED | Manual vs close slip cùng entity? | Unified `PaymentSlip` model | Medium | Open |
| TD-01 | TARGET_DECISION | Reopen as DELETE vs status flag | DELETE match legacy | High | Proposed |
| TD-02 | TARGET_DECISION | PDF report endpoint | `GET .../pdf` separate | Medium | Proposed |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-09](../workflows/WF-09-payment-to-supplier.md) |
| Purchase link | [FD-PURCHASE-01](./FD-PURCHASE-01-purchase-receipt.md) |
| Route | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.8 |
| Index | [_index.md](./_index.md) |
