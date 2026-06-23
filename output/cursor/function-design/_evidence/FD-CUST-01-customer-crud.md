# Evidence: FD-CUST-01 Customer CRUD

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-02-customer-management.md](../workflows/WF-02-customer-management.md) | Business rules, DB R/W |
| WF evidence | [WF-02 evidence](../workflows/_evidence/WF-02-customer-management.md) | RE cross-ref |
| Screen/route | [07-screen-route-mapping.md](../07-screen-route-mapping.md) §3.12 | `SearchCustomerAction`, `EditCustomerAction` |
| Module | [02-module-inventory.md](../02-module-inventory.md) §master | Services list |
| Entity fields | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) §5.1 | Column mapping |
| Business rules | [docs/spec/03-business-rules.md](../../../docs/spec/03-business-rules.md) | Cutoff, tax |
| Auth | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) | MENU_ID pattern |
| DDL | `SalesCube/DB/sql/createtable/CREATE.sql` CUSTOMER_MST | ASSUMPTION — repo path cited in WF-02 |
| Target schema | `salescube-ts/packages/db/prisma/schema.prisma` model `Customer` | TARGET_DECISION |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route search | `/master/searchCustomer` | LEGACY_CONFIRMED | `07-screen-route-mapping.md:185-186` |
| Route edit | `/master/editCustomer` | LEGACY_CONFIRMED | `07-screen-route-mapping.md:185-186` |
| Service | `CustomerService` CRUD | WF_CONFIRMED | `02-module-inventory.md`, WF-02 |
| History | `CUSTOMER_MST_HIST` on change | WF_CONFIRMED | WF-02, `04-database-analysis.md` audit pattern |
| Sequence | `SEQ_MAKER` on insert | WF_CONFIRMED | WF-02 |
| Soft delete | `DEL_DATETM` set on delete | INFERRED | WF-02 — cần SQL confirm |
| Permission | MENU customer master + `isMenuUpdate` | WF_CONFIRMED | WF-02 |
| ZIP lookup | AJAX → ZIP_MST | WF_CONFIRMED | WF-02 § External |
| Delete guard | Open SALES_SLIP blocks delete | INFERRED | WF-02 validation #9 |

## Gaps

- `SalesCube/` Java source không có trong workspace — spot-check `EditCustomerAction.java` khi có source
- WF-02 URL `inputCustomer` không khớp screen map → dùng `editCustomer`
