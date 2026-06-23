# Gap Check: Function Design Batch (14 FD mới)

> **Path:** `output/cursor/function-design/` (trừ FD-CUST-01 đã có GAP-02)  
> **Workflow:** `/generate-function-design` từ WF-01,03–15  
> **Date:** 2026-06-23

## Verdict: `READY_FOR_REVIEW`

Tất cả 14 FD mới đủ template §0–§11, có `_evidence/` companion và `_inventory/<module>.md`.

### Summary matrix

| FD | WF | §0–§11 | Evidence | Inventory | WF rules | Provenance | Verdict |
|----|-----|--------|----------|-----------|----------|------------|---------|
| FD-AUTH-01 | WF-01 | MET | MET | MET | MET | MET | PASS |
| FD-RORDER-01 | WF-03 | MET | MET | MET | MET | MET | PASS |
| FD-RORDER-02 | WF-10 | MET | MET | MET | MET | MET | PASS |
| FD-SALES-01 | WF-04 | MET | MET | MET | MET | MET | PASS |
| FD-BILL-01 | WF-05 | MET | MET | MET | MET | MET | PASS |
| FD-DEPOSIT-01 | WF-06 | MET | MET | MET | MET | MET | PASS |
| FD-DEPOSIT-02 | WF-11 | MET | MET | MET | MET | MET | PASS |
| FD-PORDER-01 | WF-07 | MET | MET | MET | MET | MET | PASS |
| FD-PURCHASE-01 | WF-08 | MET | MET | MET | MET | MET | PASS |
| FD-PAYMENT-01 | WF-09 | MET | MET | MET | MET | MET | PASS |
| FD-REPORT-01 | WF-12 | MET | MET | MET | MET | MET | PASS |
| FD-SETTING-01 | WF-13 | MET | MET | MET | MET | MET | PASS |
| FD-STOCK-01 | WF-14 | MET | MET | MET | MET | MET | PASS |
| FD-CUST-02 | WF-15 | MET | MET | MET | MET | MET | PASS |

### FD-R00..R13 (áp dụng chung)

| ID | Status | Notes |
|----|--------|-------|
| FD-R00–R11 | MET | 12 sections mỗi file |
| FD-R12 | MET | `_evidence/FD-*.md` |
| FD-R13 | MET | `_inventory/*.md` |
| FD-X01 | MET | Provenance labels |
| FD-X02 | MET | WF rules reflected |
| FD-X03 | MET | Grouped use cases, không map Action→REST máy móc |

### P1 notes (chấp nhận cho review)

- Java line-level **BLOCKED** — `SalesCube/` có trong repo nhưng chưa spot-check từng FD trong batch này
- WF-11, WF-12, WF-14 confidence MEDIUM ở WF — FD ghi ASSUMPTION/UNKNOWN tương ứng
- **PROD** (商品マスタ) chưa có WF riêng — không nằm trong batch 15 WF
- FD-SETTING-01: dept/category/company (WF-13) out of scope → FD-SETTING-02 planned
- FD-CUST-02: chỉ WF-15 §A; product batch §B/C → FD-STOCK/P2

### P2 (không block review)

- Field-level map entity §5.1 subset — bổ sung khi migrate từng module
- `salescube-ts/` code parity chưa đối chiếu (chỉ FD-CUST-01 có code partial)

## Next

```text
/review-workflow-output output/cursor/function-design/
```

Hoặc review từng FD theo priority O2C: RORDER → SALES → BILL → DEPOSIT.
