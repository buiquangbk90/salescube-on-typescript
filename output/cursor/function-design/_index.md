# Function Design Index — output/cursor

> **Workflow:** `/generate-function-design`  
> **Nguồn:** WF tại `output/cursor/workflows/`, RE tại `output/cursor/`

| ID | File | Module | WF nguồn | Status |
|----|------|--------|----------|--------|
| FD-AUTH-01 | [FD-AUTH-01-login-auth.md](./FD-AUTH-01-login-auth.md) | AUTH (認証) | [WF-01](../workflows/WF-01-login-auth.md) | DRAFT |
| FD-CUST-01 | [FD-CUST-01-customer-crud.md](./FD-CUST-01-customer-crud.md) | CUST (得意先) | [WF-02](../workflows/WF-02-customer-management.md) | APPROVED |
| FD-CUST-02 | [FD-CUST-02-batch-rank-update.md](./FD-CUST-02-batch-rank-update.md) | CUST / batch | [WF-15](../workflows/WF-15-batch-rank-update.md) §A | DRAFT |
| FD-RORDER-01 | [FD-RORDER-01-receive-order-crud.md](./FD-RORDER-01-receive-order-crud.md) | RORDER (受注) | [WF-03](../workflows/WF-03-receive-order.md) | DRAFT |
| FD-RORDER-02 | [FD-RORDER-02-online-order-import.md](./FD-RORDER-02-online-order-import.md) | RORDER / import | [WF-10](../workflows/WF-10-online-order-import.md) | DRAFT |
| FD-SALES-01 | [FD-SALES-01-sales-slip-entry.md](./FD-SALES-01-sales-slip-entry.md) | SALES (売上) | [WF-04](../workflows/WF-04-sales-slip.md) | DRAFT |
| FD-BILL-01 | [FD-BILL-01-bill-closing.md](./FD-BILL-01-bill-closing.md) | BILL (請求締め) | [WF-05](../workflows/WF-05-bill-closing.md) | DRAFT |
| FD-DEPOSIT-01 | [FD-DEPOSIT-01-deposit-entry.md](./FD-DEPOSIT-01-deposit-entry.md) | DEPOSIT (入金) | [WF-06](../workflows/WF-06-deposit-entry.md) | DRAFT |
| FD-DEPOSIT-02 | [FD-DEPOSIT-02-bank-deposit-import.md](./FD-DEPOSIT-02-bank-deposit-import.md) | DEPOSIT / import | [WF-11](../workflows/WF-11-bank-deposit-import.md) | DRAFT |
| FD-PORDER-01 | [FD-PORDER-01-purchase-order.md](./FD-PORDER-01-purchase-order.md) | PORDER (発注) | [WF-07](../workflows/WF-07-purchase-order.md) | DRAFT |
| FD-PURCHASE-01 | [FD-PURCHASE-01-purchase-receipt.md](./FD-PURCHASE-01-purchase-receipt.md) | PURCHASE (仕入) | [WF-08](../workflows/WF-08-purchase-receipt.md) | DRAFT |
| FD-PAYMENT-01 | [FD-PAYMENT-01-payment-supplier.md](./FD-PAYMENT-01-payment-supplier.md) | PAYMENT (支払) | [WF-09](../workflows/WF-09-payment-to-supplier.md) | DRAFT |
| FD-REPORT-01 | [FD-REPORT-01-report-export.md](./FD-REPORT-01-report-export.md) | REPORT (レポート) | [WF-12](../workflows/WF-12-report-export.md) | DRAFT |
| FD-SETTING-01 | [FD-SETTING-01-user-permission.md](./FD-SETTING-01-user-permission.md) | SETTING (設定) | [WF-13](../workflows/WF-13-user-permission.md) | DRAFT |
| FD-STOCK-01 | [FD-STOCK-01-stock-management.md](./FD-STOCK-01-stock-management.md) | STOCK (在庫) | [WF-14](../workflows/WF-14-stock-management.md) | DRAFT |

**Tổng:** 15 FD — map 1:1 với 15 WF (WF-02→CUST-01; WF-15→CUST-02 batch).

## Inventory

| Module | File |
|--------|------|
| AUTH | [_inventory/auth.md](./_inventory/auth.md) |
| CUST | [_inventory/cust.md](./_inventory/cust.md) |
| RORDER | [_inventory/rorder.md](./_inventory/rorder.md) |
| SALES | [_inventory/sales.md](./_inventory/sales.md) |
| BILL | [_inventory/bill.md](./_inventory/bill.md) |
| DEPOSIT | [_inventory/deposit.md](./_inventory/deposit.md) |
| PORDER | [_inventory/porder.md](./_inventory/porder.md) |
| PURCHASE | [_inventory/purchase.md](./_inventory/purchase.md) |
| PAYMENT | [_inventory/payment.md](./_inventory/payment.md) |
| REPORT | [_inventory/report.md](./_inventory/report.md) |
| SETTING | [_inventory/setting.md](./_inventory/setting.md) |
| STOCK | [_inventory/stock.md](./_inventory/stock.md) |

## O2C / P2P mapping

```text
Auth:     FD-AUTH-01 (gate)
O2C:      FD-RORDER-01 → FD-RORDER-02 → FD-SALES-01 → FD-BILL-01 → FD-DEPOSIT-01 → FD-DEPOSIT-02
P2P:      FD-PORDER-01 → FD-PURCHASE-01 → FD-PAYMENT-01
Master:   FD-CUST-01, FD-SETTING-01 (+ FD-CUST-02 batch)
Stock:    FD-STOCK-01 (cross WF-04, WF-08)
Report:   FD-REPORT-01
```

## Pipeline

```text
Generate → Cross-reference → Gap Check → Review → Hoàn tất
```

| FD | Gap | Review |
|----|-----|--------|
| FD-CUST-01 | [GAP-02](../../../docs/spec/gaps/GAP-02-FD-CUST-01-customer-crud.md) `READY_FOR_REVIEW` | [REV-01](../../../docs/spec/reviews/REV-01-FD-CUST-01-customer-crud.md) `APPROVED` |
| FD-* (14 mới) | [GAP-03](../../../docs/spec/gaps/GAP-03-function-design-batch.md) `READY_FOR_REVIEW` | Pending |
