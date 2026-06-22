# Prisma Schema - Priority 1 Modules

> Source of truth: `@/salescube-ts/packages/db/prisma/schema.prisma`
> **Lưu ý:** Tài liệu này là đề xuất thiết kế schema cho hệ thống TypeScript mới. Dữ liệu nguồn legacy được reverse-engineered trong các file `01-module-inventory.md`, `02-entity-list.md`, `05-screen-inventory.md` và `07-db-schema.md`.

## Tổng quan

Schema bao gồm **19 tables** cho 6 nhóm chức năng Priority 1:

| Nhóm | Tables | Mục đích |
|------|--------|----------|
| **Auth/RBAC** | `user`, `role`, `permission`, `user_role`, `role_permission`, `department` | Đăng nhập, phân quyền, phòng ban |
| **Master** | `customer`, `product`, `supplier`, `product_price_history`, `tax_rate` | Dữ liệu gốc |
| **Sales** | `sales_order`, `sales_order_line` | Phiếu bán hàng |
| **Billing** | `invoice`, `invoice_line` | Hóa đơn |
| **Payment** | `deposit`, `deposit_line`, `payment_allocation` | Thu tiền + gạch nợ |

## Conventions áp dụng

- **PK**: `cuid()` (string, sortable, URL-safe)
- **Business identifier**: `code` field, unique
- **Money**: `Decimal(18, 4)` - đủ cho mọi đồng tiền
- **Quantity**: `Decimal(18, 4)` - cho phép số thập phân
- **Rate** (thuế, chiết khấu): `Decimal(8, 6)` - đủ chính xác cho 0.080000
- **Audit fields**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` trên mọi table chính
- **Soft delete**: `deletedAt` (nullable timestamp)
- **DB column naming**: `snake_case` qua `@map`; TS/JS: `camelCase`

## Khác biệt với Legacy SalesCube

| Aspect | Legacy Java | New TypeScript |
|--------|-------------|----------------|
| PK | Auto-increment `Integer` | `cuid()` String |
| Money | `BigDecimal` không quy chuẩn | `Decimal(18, 4)` thống nhất |
| Status code | "0" / "9" raw string | Enum (`DRAFT`, `FINALIZED`, ...) |
| Tax shift | "0"/"1" code | Enum `INCLUDED` / `EXCLUDED` |
| Lịch sử giá | Cố định 3 mức trong `Product` | Bảng `product_price_history` không giới hạn |
| Customer info trên Sales | Denormalize nhiều fields | Snapshot tối thiểu (code, name) + FK |
| Gạch nợ (消込) | Implicit qua billId | Bảng riêng `payment_allocation` (m:n) |
| Audit | Phân tán | Chuẩn hóa `created/updated/deletedAt` |

## Enums

```ts
SalesType:     SALES | NEWS | WEB
SlipStatus:    DRAFT | FINALIZED | CLOSED | CANCELLED
InvoiceStatus: DRAFT | ISSUED | PARTIALLY_PAID | PAID | CANCELLED
TaxShift:      INCLUDED (内税) | EXCLUDED (外税)
Fraction:      FLOOR | CEIL | ROUND
PaybackCycle:  CURRENT_MONTH | NEXT_MONTH | AFTER_NEXT_MONTH | MONTHS_3
DepositMethod: CASH | TRANSFER | CHECK | AUTO_DEBIT | CARD | OTHER
TaxCategory:   STANDARD (10%) | REDUCED (8%, báo chí) | EXEMPT
```

## Quan hệ chính

```
Customer 1───n SalesOrder ───n SalesOrderLine ──n──1 Product
   │                                                    │
   │                                                    └─n ProductPriceHistory
   │
   ├───n Invoice ──n SalesOrder (gán khi billing)
   │       │
   │       └──n InvoiceLine
   │
   └───n Deposit ──n PaymentAllocation──n Invoice
           │
           └──n DepositLine

User n──m Role n──m Permission
User n──1 Department (self-referencing tree)
```

## Decision: Snapshot vs Reference

Trên các bảng giao dịch (`SalesOrder`, `Invoice`, `Deposit`), tôi giữ:

- **FK** đến `customerId` (lấy data live khi cần)
- **Snapshot** `customerCodeSnapshot`, `customerNameSnapshot` (bất biến)

Lý do: Khi KH đổi tên hoặc bị xóa mềm, hóa đơn cũ vẫn hiển thị đúng tên tại thời điểm tạo. Đây là chuẩn industry cho hệ thống kế toán/ERP.

Tương tự `SalesOrderLine` snapshot `productCode` + `productName`.

## Bảng đặc biệt: `payment_allocation`

Gạch nợ (消込 - keshikomi) là quan hệ **m:n** giữa Deposit và Invoice. Một phiếu thu có thể chia gạch cho nhiều hóa đơn (vd: trả 1 lần 100k cho 3 hóa đơn nhỏ), và ngược lại 1 hóa đơn có thể được gạch bằng nhiều phiếu thu.

Constraints:
- `@@unique([depositId, invoiceId])` - 1 cặp chỉ link 1 lần
- `Deposit.allocatedAmount = SUM(allocations.amount)`
- `Deposit.unallocatedAmount = totalAmount - allocatedAmount`

Logic này sẽ được implement trong `packages/domain/src/deposits/payment-allocation-policy.ts`.

## Bảng đặc biệt: `invoice` (rolling balance)

Cấu trúc theo legacy SalesCube `BILL_TRN`:

```
closingBalance = openingBalance        (số dư đầu kỳ)
              + salesAmount + taxAmount (phát sinh kỳ)
              - receivedAmount          (đã thu)
              + adjustmentAmount        (điều chỉnh)
              - discountAmount          (chiết khấu)
```

`openingBalance` được carry từ `closingBalance` của kỳ trước cùng customer + cutoffGroup.

Unique key `[customerId, billYear, billMonth, cutoffGroup]` đảm bảo 1 KH chỉ có 1 HĐ/kỳ/nhóm chốt.

## Migration

```bash
# Reset (chỉ dev)
pnpm --filter @salescube/db exec prisma migrate reset --force

# Tạo migration mới
pnpm db:migrate

# Apply ở môi trường khác
pnpm --filter @salescube/db exec prisma migrate deploy
```

Migration đầu tiên: `20260617033540_init_priority1`

## Verify

```bash
docker exec salescube_postgres psql -U salescube -d salescube -c "\dt"
# 19 tables created
```

## Bước tiếp theo

1. **Seed data** cơ bản: tax rates (8%, 10%), default roles, admin user.
2. **Customer Master pipeline**: Domain → DB → API → Web (Module đầu tiên end-to-end).
3. **Auth**: implement JWT + RBAC guards với schema này.
