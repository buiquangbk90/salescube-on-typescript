# FD-RORDER-01 — Tìm kiếm Đơn hàng (Receive Order Search)

**Module**: RORDER  
**WF Source**: `output/cursor/workflows/WF-03-receive-order.md`  
**Priority**: P1-3  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tìm kiếm đơn hàng theo nhiều tiêu chí, xem danh sách + status |
| Legacy entry | `GET /rorder/searchROrder/index` → `SearchROrderAction` |
| Target | `GET /api/receive-orders` với query params |
| Permission | `@RequirePermission('INPUT_RORDER')` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Search flow

```
GET /rorder/searchROrder/index   → form tìm kiếm
POST (hoặc GET) /rorder/searchROrder/search
  → SearchROrderAction.search()
    → RoSlipService.findByCondition(form)
      → Named SQL với điều kiện: CUSTOMER_CODE, RO_DATE range, STATUS
      → JOIN với CUSTOMER_MST để lấy tên KH
      → ORDER BY RO_DATE DESC, RO_SLIP_ID DESC
      → Pagination
    → Render searchROrder.jsp
```

**Evidence**: `Confirmed by code` — `action/rorder/InputROrderAction.java:72-84` (URL constants)  
**Evidence**: `Confirmed by code` — `service/RoSlipService.java` (search pattern)

### 2.2 Status display

| Status value | Hiển thị |
|-------------|---------|
| `"1"` | Mở (Open) |
| `"2"` | Đang xử lý (Partial) |
| `"3"` | Hoàn thành (Complete) |
| `"9"` | Hủy (Canceled) |

**Evidence**: `Confirmed by code` — WF-03 Status Transitions

---

## 3. Target API Contract (TARGET_DECISION)

### GET /api/receive-orders

```typescript
interface ReceiveOrderSearchQuery {
  customerCode?: string;
  roDateFrom?: string;   // ISO date
  roDateTo?: string;     // ISO date
  status?: '1' | '2' | '3' | '9';
  page?: number;         // default 1
  limit?: number;        // default 20
}

interface ReceiveOrderListResponseDto {
  data: ReceiveOrderSummaryDto[];
  total: number;
  page: number;
  limit: number;
}

interface ReceiveOrderSummaryDto {
  roSlipId: string;
  customerCode: string;
  customerName: string;   // JOIN CUSTOMER_MST
  roDate: string;
  status: '1' | '2' | '3' | '9';
  totalAmount: number;
  lineCount: number;
}
```

---

## 4. Validation & Permission

```typescript
@Get()
@RequirePermission('INPUT_RORDER')
async search(@Query() query: ReceiveOrderSearchQuery) {}
```

---

## 5. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-RORDER-01 | Search action dùng GET hay POST? Legacy có thể dùng POST (Struts form) | LOW | `Inferred from code` |
| OQ-RORDER-02 | Có filter theo product code không? | LOW | `Unknown / needs verification` |
