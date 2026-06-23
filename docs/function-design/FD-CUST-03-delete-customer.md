# FD-CUST-03 — Xóa Khách hàng (Soft Delete)

**Module**: CUST  
**WF Source**: `output/cursor/workflows/WF-02-customer-management.md`  
**Priority**: P1-2  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Xóa mềm (soft-delete) khách hàng bằng cách set `DEL_DATETM` |
| Legacy entry | `POST /master/inputCustomer/delete` |
| Target | `DELETE /api/customers/:customerCode` |
| Permission | `@RequirePermission('CUSTOMER_MST')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Delete flow

```
POST /master/inputCustomer/delete
  → CustomerMasterAction.delete()
    → validate: kiểm tra KH không có SALES_SLIP_TRN chưa đóng
    → CustomerService.delete(customerCode)
      → UPDATE CUSTOMER_MST SET DEL_DATETM = NOW()
      → INSERT CUSTOMER_MST_HIST (snapshot với DEL_DATETM set)
    → return success (redirect về list)
```

**Evidence**: `LEGACY_CONFIRMED` — WF-02 Status Transitions  
**Evidence**: `LEGACY_CONFIRMED` — `service/CustomerService.java`

### 2.2 Guard rule: không xóa KH có giao dịch đang mở

```
Trước khi DELETE:
  → CustomerService.checkDeletable(customerCode)
    → SELECT COUNT(*) FROM SALES_SLIP_TRN
      WHERE CUSTOMER_CODE = ? AND DEL_DATETM IS NULL AND STATUS != '9'
    → Nếu COUNT > 0 → throw ServiceException("errors.cannotDelete")
```

**Evidence**: `INFERRED_FROM_CODE` — WF-02 Validation Rules #9, pattern phổ biến trong hệ thống

### 2.3 Soft-delete behavior

- `DEL_DATETM` được set → bản ghi không bị DELETE vật lý
- Mọi query tìm kiếm phải filter `DEL_DATETM IS NULL`
- `CUSTOMER_MST_HIST` ghi lại snapshot với `DEL_DATETM` đã set

**Evidence**: `LEGACY_CONFIRMED` — WF-02 Status Transitions diagram

---

## 3. Target API Contract (TARGET_DECISION)

### DELETE /api/customers/:customerCode

```typescript
// Request: PATH param customerCode
// Response: 204 No Content (xóa thành công)

// Error responses:
// 404: KH không tồn tại
// 409: KH có giao dịch đang mở → ConflictException
// 403: Không có quyền update
```

---

## 4. Data Model

```typescript
// Service implementation
async softDelete(customerCode: string): Promise<void> {
  const customer = await this.prisma.customer.findFirst({
    where: { customerCode, deletedAt: null },
  });
  if (!customer) throw new NotFoundException();

  // Guard: check active sales
  const activeSales = await this.prisma.salesSlip.count({
    where: {
      customerCode,
      deletedAt: null,
      status: { not: '9' },
    },
  });
  if (activeSales > 0) {
    throw new ConflictException('errors.cannotDelete');
  }

  const now = new Date();
  await this.prisma.$transaction([
    this.prisma.customer.update({
      where: { customerCode },
      data: { deletedAt: now },
    }),
    this.prisma.customerHistory.create({
      data: { ...customer, deletedAt: now },
    }),
  ]);
}
```

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | KH phải tồn tại (`DEL_DATETM IS NULL`) | `CustomerService` | `LEGACY_CONFIRMED` |
| V2 | Không xóa KH có `SALES_SLIP_TRN` chưa đóng | WF-02 V#9 | `LEGACY_CONFIRMED` |

---

## 6. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| KH không tồn tại | 404 | `NotFoundException` | `errors.notExist` |
| Có giao dịch đang mở | 409 | `ConflictException` | `errors.cannotDelete` |
| `UnabledLockException` | 409 | `ConflictException` | `errors.lock` |

---

## 7. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-CUST-06 | Check giao dịch: chỉ SALES_SLIP_TRN hay cả RO_SLIP_TRN, BILL_TRN, DEPOSIT_SLIP_TRN? | HIGH | `INFERRED_FROM_CODE` |
| OQ-CUST-07 | Sau soft-delete, CUSTOMER_REL (parent-child) có bị cascade không? | MEDIUM | `UNKNOWN` |
