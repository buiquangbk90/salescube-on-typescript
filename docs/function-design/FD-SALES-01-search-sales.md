# FD-SALES-01 — Tìm kiếm Phiếu Bán hàng (Sales Order Search)

**Module**: SALES  
**WF Source**: `output/cursor/workflows/WF-04-sales-slip.md`  
**Priority**: P1-3  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tìm kiếm phiếu bán hàng theo nhiều tiêu chí |
| Legacy entry | `GET /sales/searchSales/index` → `SearchSalesAction` |
| Target | `GET /api/sales-orders` với query params |
| Permission | `@RequirePermission('INPUT_SALES')` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Search flow

```
GET /sales/searchSales/index    → form tìm kiếm
POST /sales/searchSales/search  → SearchSalesAction.search()
  → SalesService.findByCondition(form)
    → Filter: CUSTOMER_CODE, SALES_DATE range, STATUS, BILL_ID IS NULL/NOT NULL
    → ORDER BY SALES_DATE DESC, SALES_SLIP_ID DESC
    → Pagination
  → Render searchSales.jsp
```

**Evidence**: `LEGACY_CONFIRMED` — `action/sales/InputSalesAction.java:1-65`  
**Evidence**: `LEGACY_CONFIRMED` — `service/SalesService.java`

### 2.2 Status display

| Status | Hiển thị |
|--------|---------|
| `"1"` | Tạm (Draft) |
| `"2"` | Xác nhận (Confirmed) |
| `"3"` | Đã chốt hóa đơn (Bill closed) |
| `"9"` | Hủy (Canceled) |

**Evidence**: `LEGACY_CONFIRMED` — WF-04 Status Transitions

---

## 3. Target API Contract (TARGET_DECISION)

### GET /api/sales-orders

```typescript
interface SalesOrderSearchQuery {
  customerCode?: string;
  salesDateFrom?: string;
  salesDateTo?: string;
  status?: '1' | '2' | '3' | '9';
  billId?: string;            // filter đã chốt bill
  hasBill?: boolean;          // true = đã chốt, false = chưa chốt
  page?: number;
  limit?: number;
}

interface SalesOrderListResponseDto {
  data: SalesOrderSummaryDto[];
  total: number;
  page: number;
  limit: number;
}

interface SalesOrderSummaryDto {
  salesSlipId: string;
  customerCode: string;
  customerName: string;
  salesDate: string;
  status: '1' | '2' | '3' | '9';
  totalAmount: number;
  billId?: string;
  lineCount: number;
}
```

---

## 4. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-SALES-05 | Có filter theo roSlipId (xem sales từ RO cụ thể) không? | LOW | `UNKNOWN` |
| OQ-SALES-06 | Export danh sách ra CSV? | LOW | `UNKNOWN` |
