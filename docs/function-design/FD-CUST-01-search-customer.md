# FD-CUST-01 — Tìm kiếm Khách hàng

**Module**: CUST  
**WF Source**: `output/cursor/workflows/WF-02-customer-management.md`  
**Priority**: P1-2  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tìm kiếm khách hàng theo nhiều tiêu chí |
| Legacy entry | `POST /master/searchCustomer/find` → `SearchCustomerAction.find()` |
| Target | `GET /api/customers` với query params |
| Permission | `MENU_ID: CUSTOMER_MST` — `@RequirePermission('CUSTOMER_MST')` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Search flow

```
GET  /master/searchCustomer/index   → form tìm kiếm
POST /master/searchCustomer/find
  → SearchCustomerAction.find()
    → CustomerService.findByCondition(form)
      → Named SQL: entity/sql/customer/findByCondition.sql (inferred)
      → Filter: CUSTOMER_CODE LIKE, CUSTOMER_NAME LIKE, DEL_DATETM IS NULL
      → ORDER BY CUSTOMER_CODE ASC
      → Pagination: offset/limit từ form
    → Render searchCustomer.jsp (table + pagination)
```

**Evidence**: `LEGACY_CONFIRMED` — `entity/Customer.java` (59 fields), `service/CustomerService.java`  
**Evidence**: `LEGACY_CONFIRMED` — `entity/sql/customer/` (21 SQL files)

### 2.2 Search criteria

| Criteria | Column | Operator |
|----------|--------|----------|
| Mã KH | `CUSTOMER_CODE` | LIKE (prefix) |
| Tên KH | `CUSTOMER_NAME` | LIKE (contains) |
| Tên KH (kana) | `CUSTOMER_NAME_KANA` | LIKE |
| Điện thoại | `CUSTOMER_TEL` | LIKE |
| Rank | `CUSTOMER_RANK_CATEGORY` | = |
| Chỉ hiện active | `DEL_DATETM IS NULL` | WHERE cố định |

**Evidence**: `INFERRED_FROM_CODE` — từ entity fields `Customer.java`, SQL pattern của module tương tự

---

## 3. Target API Contract (TARGET_DECISION)

### GET /api/customers

```typescript
// Query params
interface CustomerSearchQuery {
  code?: string;         // CUSTOMER_CODE LIKE prefix
  name?: string;         // CUSTOMER_NAME LIKE contains
  nameKana?: string;     // CUSTOMER_NAME_KANA LIKE
  tel?: string;          // CUSTOMER_TEL LIKE
  rank?: string;         // CUSTOMER_RANK_CATEGORY exact
  page?: number;         // default 1
  limit?: number;        // default 20, max 100 (TARGET_DECISION)
  includeDeleted?: boolean; // default false (TARGET_DECISION)
}

// Response (200 OK)
interface CustomerListResponseDto {
  data: CustomerSummaryDto[];
  total: number;
  page: number;
  limit: number;
}

interface CustomerSummaryDto {
  customerCode: string;
  customerName: string;
  customerNameKana?: string;
  customerTel?: string;
  customerRankCategory?: string;
  cutoffGroup?: string;
  deletedAt?: string | null;
}
```

---

## 4. Data Model

### Prisma query pattern

```typescript
// customers.service.ts
async search(query: CustomerSearchQuery) {
  const where: Prisma.CustomerWhereInput = {
    deletedAt: query.includeDeleted ? undefined : null,
    ...(query.code && { customerCode: { startsWith: query.code } }),
    ...(query.name && { customerName: { contains: query.name } }),
    ...(query.rank && { customerRankCategory: query.rank }),
  };

  const [data, total] = await this.prisma.$transaction([
    this.prisma.customer.findMany({
      where,
      orderBy: { customerCode: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { customerCode: true, customerName: true, /* ... */ },
    }),
    this.prisma.customer.count({ where }),
  ]);

  return { data, total, page, limit };
}
```

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | Tất cả criteria là optional (search all nếu không nhập) | Convention Struts form | `LEGACY_CONFIRMED` |
| V2 | `DEL_DATETM IS NULL` mặc định (chỉ hiện active) | SQL pattern | `LEGACY_CONFIRMED` |
| V3 | Pagination: offset/limit | Struts pagination | `INFERRED_FROM_CODE` |

---

## 6. Permission

```typescript
@Get()
@RequirePermission('CUSTOMER_MST')
async search(@Query() query: CustomerSearchQuery) {}
```

---

## 7. Error Handling

| Lỗi | HTTP | Exception |
|-----|------|-----------|
| Không có permission | 403 | `ForbiddenException` |
| DB error | 500 | `InternalServerErrorException` |

---

## 8. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-CUST-01 | Sort order: luôn là CUSTOMER_CODE ASC hay user có thể chọn? | LOW | `INFERRED_FROM_CODE` |
| OQ-CUST-02 | Page size: legacy dùng bao nhiêu records/page? | LOW | `UNKNOWN` |
