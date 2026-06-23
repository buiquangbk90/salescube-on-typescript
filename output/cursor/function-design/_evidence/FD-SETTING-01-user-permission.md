# Evidence: FD-SETTING-01 User & Permission

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-13-user-permission.md](../workflows/WF-13-user-permission.md) | User CRUD, GRANT_ROLE, MINE_MST |
| WF evidence | [WF-13 evidence](../workflows/_evidence/WF-13-user-permission.md) | RE cross-ref |
| Auth / RBAC | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) §5 | GRANT_ROLE, ROLE_MST |
| Screen/route | [07-screen-route-mapping.md](../07-screen-route-mapping.md) §3.14 | Setting screens |
| Routes + MENU_ID | [03-route-api-inventory.md](../03-route-api-inventory.md) §Setting | 1203, 1206, 1207 |
| Module | [02-module-inventory.md](../02-module-inventory.md) §setting | Action list |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) | `USER_MST`, `GRANT_ROLE` |
| DDL | `CREATE.sql` MINE_MST | Password policy columns |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route search user | `/setting/searchUser` MENU_ID `1203` | LEGACY_CONFIRMED | `03-route-api-inventory.md:173`, `07-screen-route-mapping.md:204` |
| Route edit user | `/setting/editUser` | LEGACY_CONFIRMED | `03-route-api-inventory.md:236`, WF-13 |
| User register | `EditUserAction.register()` — validate, encrypt PW, insert/update USER_MST + GRANT_ROLE | LEGACY_CONFIRMED | WF-13 § Main Code Path, `EditUserAction.java:74-80` cited |
| User delete | soft-delete `DEL_DATETM` | INFERRED | WF-13 status diagram |
| GRANT_ROLE replace | Thay toàn bộ quyền menu khi save user | INFERRED | WF-13 § Main Code Path |
| Permission flags | `isMenuUpdate`, `isMenuValid` per MENU_ID | LEGACY_CONFIRMED | WF-13 § Permission Model, `ImportOnlineOrderAction.java:64-65` |
| Change password | `ChangePasswordAction` — MENU_ID `1206` | LEGACY_CONFIRMED | `03-route-api-inventory.md:176`, `07-screen-route-mapping.md:208` |
| Security policy | `SetSecurityAction` — UPDATE `MINE_MST` MENU_ID `1207` | LEGACY_CONFIRMED | WF-13, `03-route-api-inventory.md:177` |
| Password rules | `PASSWORD_LENGTH`, `PASSWORD_CHAR_TYPE`, `PASSWORD_HIST_COUNT` từ MINE_MST | LEGACY_CONFIRMED | WF-13 § Validation, `06-auth-permission-analysis.md:199-208` |
| Sequence insert | `SEQ_MAKER` cho USER_MST | INFERRED | WF-13 § Database WRITE |
| Encrypt on save | `EncryptUtil.encrypt(password)` AES-128 ECB | LEGACY_CONFIRMED | WF-13 imports, `06-auth-permission-analysis.md` |
| Delete guard | Không xóa user đang login | INFERRED | WF-13 validation #7 |
| Admin-only delete | Không xóa admin duy nhất | INFERRED | WF-13 validation #8 |

## Gaps

- `EditUserAction.java` line-level — WF cites 352 lines nhưng workspace có thể không mount `SalesCube/` → **MEDIUM confidence**
- GRANT_ROLE schema chi tiết (ROLE_ID vs MENU_ID columns) — cần DDL/SQL confirm
- `USER_MST` có `USER_MST_HIST` hay không — UNKNOWN
- Optimistic lock `UnabledLockException` trên user edit — INFERRED từ WF-13 errors

## Out of scope (WF-13)

- `EditDeptAction`, `SetCategoryAction`, `CompanyAction` — inventory `_inventory/setting.md`
