# FD-RORDER-03 — Hủy Đơn hàng (Cancel Receive Order)

**Module**: RORDER  
**WF Source**: `output/cursor/workflows/WF-03-receive-order.md`  
**Priority**: P1-3  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Hủy đơn hàng — chuyển STATUS sang `"9"` |
| Legacy entry | `POST /rorder/inputROrder/cancel` |
| Target | `POST /api/receive-orders/:roSlipId/cancel` |
| Permission | `@RequirePermission('INPUT_RORDER')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Cancel flow

```
POST /rorder/inputROrder/cancel
  → InputROrderAction.cancel()
    → RoSlipService.findByPk(roSlipId) → kiểm tra tồn tại
    → kiểm tra STATUS cho phép cancel
    → RoSlipService.cancel(roSlipId)
      → UPDATE RO_SLIP_TRN SET STATUS = '9'
      → INSERT RO_SLIP_TRN_HIST (snapshot với STATUS = '9')
    → return success
```

**Evidence**: `Confirmed by code` — WF-03 Status Transitions  
**Evidence**: `Inferred from code` — cancel pattern từ SALES_SLIP cancel (WF-04)

### 2.2 Cancel guard

- Không thể cancel đơn hàng đã có STATUS `"3"` (Hoàn thành) — `Inferred from code`
- STATUS `"2"` (Partial): có thể cancel nếu cho phép — `Unknown / needs verification`

---

## 3. Target API Contract

### POST /api/receive-orders/:roSlipId/cancel

```typescript
// Request: PATH param roSlipId
// Response: 200 OK — ReceiveOrderResponseDto với status: "9"

// Errors:
// 404: không tồn tại
// 409: không thể cancel (status không hợp lệ)
// 409: UnabledLockException
```

---

## 4. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | Slip phải tồn tại | — | `Confirmed by code` |
| V2 | Status phải là `"1"` hoặc `"2"` để cancel | WF-03 | `Confirmed by code` |
| V3 | STATUS `"3"` (Complete): không thể cancel | WF-03 | `Inferred from code` |

---

## 5. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-RORDER-07 | Khi cancel STATUS `"2"` (Partial — đã có SALES liên kết): SALES bị ảnh hưởng gì không? | HIGH | `Unknown / needs verification` |
| OQ-RORDER-08 | Có reverse entry (đảo bút toán) khi cancel không? | HIGH | `Unknown / needs verification` |
