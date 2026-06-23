# Function Design — Open Questions

| ID | FD | Question | Impact | Status |
|----|-----|----------|--------|--------|
| OQ-FD-01 | FD-CUST-01 | Verify `EditCustomerAction.register()` signature in Java | High | Open |
| OQ-FD-02 | FD-CUST-01 | Confirm soft-delete chỉ set DEL_DATETM (không status flag) | High | Open |
| OQ-FD-03 | FD-CUST-01 | `customer_hist` parity — full snapshot vs changed fields | Medium | Open |
| OQ-FD-04 | FD-PURCHASE-01 | Delete reversal EAD + PO REST | High | Open |
| OQ-FD-05 | FD-PAYMENT-01 | Legacy partial commit — atomic close parity | High | Open |
| OQ-FD-06 | FD-REPORT-01 | Jasper `.jrxml` migration strategy | High | Open |
| OQ-FD-07 | FD-STOCK-01 | Verify `StockAction` / `InputStockAction` class names | Medium | Open |
| OQ-FD-08 | FD-CUST-02 | Cron schedule + SP SQL body verification | High | Open |
