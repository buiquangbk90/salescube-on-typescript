# Evidence: FD-PAYMENT-01 Payment to Supplier

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-09-payment-to-supplier.md](../workflows/WF-09-payment-to-supplier.md) | Close + manual entry |
| WF evidence | [WF-09 evidence](../workflows/_evidence/WF-09-payment-to-supplier.md) | RE cross-ref |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.8 | MENU_ID 0900–0902 |
| Flow | [08-business-flow-hypotheses.md](../08-business-flow-hypotheses.md) | P2P step 3 |
| DDL | `CREATE.sql` PAYMENT_SLIP/LINE, APT_BALANCE | LEGACY_CONFIRMED via WF |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route close | `/payment/closePayment` | LEGACY_CONFIRMED | `03-route-api-inventory.md:130`, WF-09 |
| Route input | `/payment/inputPayment` | LEGACY_CONFIRMED | `03-route-api-inventory.md:128` |
| MENU_ID | `0900` input, `0901` search, `0902` close | LEGACY_CONFIRMED | `03-route-api-inventory.md:128-130` |
| Close action | `ClosePaymentAction.close()` L68-79 | LEGACY_CONFIRMED | WF-09 |
| Service | `ClosePaymentService.closePayment(closeDate)` | LEGACY_CONFIRMED | WF-09 |
| Reopen | `reopenPayment()` — DELETE slip, NULL `PAYMENT_SLIP_ID` | LEGACY_CONFIRMED | WF-09 |
| APT balance | `APT_BALANCE_TRN` INSERT mỗi kỳ | LEGACY_CONFIRMED | WF-09 |
| DDL constraints | `PO_LINE_ID`, `SUPPLIER_LINE_ID` NOT NULL on PAYMENT_LINE | LEGACY_CONFIRMED | WF-09 validation #4-5 |
| Partial commit risk | Không compensation nếu partial fail | LEGACY_CONFIRMED | WF-09 Error Handling |
| Manual entry | `InputPaymentAction.java` | LEGACY_CONFIRMED | WF-09 |

## Gaps

- `ClosePaymentService` transaction boundary chưa verify line-level
- `PAYMENT_SLIP_TRN.STATUS` "1" = đã thanh toán thực tế — INFERRED
- Jasper print cho payment slip — INFERRED từ AbstractReportService pattern
