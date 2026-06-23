# Function Inventory: SETTING (User & Permission / 社員・権限管理)

> **Nguồn:** [07-screen-route-mapping.md](../07-screen-route-mapping.md), [02-module-inventory.md](../02-module-inventory.md), [WF-13](../workflows/WF-13-user-permission.md), [03-route-api-inventory.md](../03-route-api-inventory.md)

| Legacy Action | Method (typical) | Legacy URL | MENU_ID | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|---------|-----|---------------|------|-------------|--------|
| `SearchUserAction` | `index()` / `find()` | `/setting/searchUser` | 1203 | `searchUser.jsp` | `UserService.find*` | LIST_SEARCH | FD-SETTING-01 § list | LEGACY_CONFIRMED |
| `EditUserAction` | `index()` | `/setting/editUser` | 1203 | `editUser.jsp` | `DeptService`, `MenuService`, `MineService` | SCREEN_ENTRY | FD-SETTING-01 § create | LEGACY_CONFIRMED |
| `EditUserAction` | `register()` | `POST /setting/editUser/register` | 1203 | same | `UserService` insert/update, `MenuService` GRANT_ROLE | CREATE/UPDATE | FD-SETTING-01 § create/update | LEGACY_CONFIRMED |
| `EditUserAction` | `delete()` | `POST /setting/editUser/delete` | 1203 | redirect | soft-delete USER_MST | CANCEL_OR_STATUS | FD-SETTING-01 § delete | INFERRED |
| `ChangePasswordAction` | `register()` | `/setting/changePassword` | 1206 | `changePassword.jsp` | `UserService`, `EncryptUtil` | UPDATE | FD-SETTING-01 § change-password | LEGACY_CONFIRMED |
| `SetSecurityAction` | `register()` | `/setting/setSecurity` | 1207 | `setSecurity.jsp` | `MineService.update` | UPDATE | FD-SETTING-01 § mine-policy | LEGACY_CONFIRMED |

**Ngoài scope FD-SETTING-01** (WF-13 nhưng module khác):

| Action | URL | MENU_ID | Ghi chú |
|--------|-----|---------|---------|
| `EditDeptAction` | `/setting/editDept` | 1202 | FD-SETTING-02 (planned) |
| `SetCategoryAction` | `/setting/setCategory` | 1209 | FD-SETTING-03 (planned) |
| `CompanyAction` | `/setting/company` | 1200 | FD-SETTING-04 (planned) |
| `SetStockAction` | `/setting/stock` | 1201 | FD-SETTING-05 (planned) |
