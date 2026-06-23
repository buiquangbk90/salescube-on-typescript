# Workflow Open Questions

> Tổng hợp từ [10-risks-unknowns.md](../../10-risks-unknowns.md), WF docs, RE gaps.  
> **Không dừng batch** — ghi tại đây và tiếp tục với `UNKNOWN`/`INFERRED`.

| ID | Workflow | Question | Proposed interpretation | Impact | Status |
|----|----------|----------|-------------------------|--------|--------|
| OQ-WF-01 | WF-01 | SSO qua GET params — production usage? | Treat as legacy feature; log warning on migrate | High | Open |
| OQ-WF-02 | WF-02 | Exact Action class names (`EditCustomer` vs convention) | Trace `action/master/*Customer*` from package | Medium | Open |
| OQ-WF-03 | WF-04 | EAD slip sync synchronous trong cùng HTTP request? | Assume same transaction until SP trace | High | Open |
| OQ-WF-04 | WF-05 | `CloseBillAction` transaction boundary across many slips | Characterization test before migrate | Critical | Open |
| OQ-WF-05 | WF-06 | 消込 allocation algorithm — implicit vs explicit table | See `docs/spec/06` payment_allocation TARGET_DECISION | High | Open |
| OQ-WF-06 | WF-07 | `makeOutPOrder` PDF vs screen-only | INFERRED Jasper — verify jrxml | Medium | Open |
| OQ-WF-07 | WF-11 | Bank CSV column mapping per bank format | Document per import template | Medium | Open |
| OQ-WF-08 | WF-12 | JasperReports version & template paths | Read `report/` package + WEB-INF | Medium | Open |
| OQ-WF-09 | WF-14 | Entrust stock vs normal stock split | Separate WF or section in WF-14 | Medium | Open |
| OQ-WF-10 | WF-15 | Batch DOMAIN suffix `XXXXX` runtime value | Default `SALES` from CallProc.sh | Medium | Open |
| OQ-WF-11 | ALL | CSRF protection absent? | INFERRED none — add in target NestJS | High | Open |
| OQ-WF-12 | ALL | `demoFlag=true` in appconfig — behavior impact | Grep demoFlag usages | Medium | Open |
| OQ-WF-13 | ALL | WF format legacy vs template §0–§11 | Reformat on next FD pass | Low | Open |
| OQ-WF-14 | WF-02 | AJAX delete vs screen delete — same soft-delete? | Trace `DeleteCustomerAjaxAction` | Medium | Open |

---

## Cross-ref RE unknowns

| RE ID | Topic | Link |
|-------|-------|------|
| R-003 | SSO credentials in URL | `10-risks-unknowns.md` §R-003 |
| R-006 | CSRF | `10-risks-unknowns.md` §R-006 |
| U-001 | SEQ_MAKER transaction | `10-risks-unknowns.md` |
