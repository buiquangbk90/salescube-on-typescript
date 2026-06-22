# WF-13 – Quản lý User & Phân Quyền (社員・権限管理)

**Confidence**: HIGH – Xác nhận từ `EditUserAction.java` (352 dòng), imports trực tiếp  
**Loại**: System administration workflow

---

## Entry Route
```
GET  /setting/searchUser/index              → Tìm kiếm user
GET  /setting/editUser/index               → Tạo user mới
GET  /setting/editUser/edit/{userId}       → Sửa thông tin user
POST /setting/editUser/register            → Lưu user (tạo/cập nhật)
POST /setting/editUser/delete              → Xóa user (soft-delete)
POST /setting/changePassword/index         → Đổi mật khẩu
GET  /setting/setSecurityAction/index      → Cài đặt bảo mật (MINE_MST)
GET  /setting/editDept/index               → Quản lý phòng ban
GET  /setting/setCategory/index            → Quản lý categories (enum values)
GET  /setting/company/index                → Cài đặt thông tin công ty
```

## User Role
- Admin only – chỉ admin mới quản lý được user
- `userDto.isMenuUpdate(MENU_ID.EDIT_USER)` (inferred)

---

## Main Code Path

```
GET /setting/editUser/index
  → EditUserAction.index()                    ← line 75-80
    → this.init(null)
      → DeptService.findAll() → department dropdown
      → MenuService.findAll() → menu list (for role assignment)
      → MineService.findOne() → password policy (length, char type)
    → Render editUser.jsp

POST /setting/editUser/register
  → EditUserAction.register()
    → validate form (userId, password, dept)
    → EncryptUtil.encrypt(password)           ← AES-128 ECB
    → UserService.findByPk(userId)            ← check duplicate
    → SeqMakerService.getNextSeqId("USER_MST") [nếu insert]
    → UserService.insert() hoặc update()
      → INSERT / UPDATE USER_MST
      → UPDATE GRANT_ROLE (menu permissions)
    → Render editUser.jsp (success)
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `EditUserAction.java` | User CRUD |
| Action | `SearchUserAction.java` | Tìm kiếm user |
| Action | `ChangePasswordAction.java` | Đổi mật khẩu |
| Action | `SetSecurityAction.java` | Password policy (MINE_MST) |
| Action | `EditDeptAction.java` | Phòng ban CRUD |
| Action | `SetCategoryAction.java` | Category values CRUD |
| Action | `CompanyAction.java` | Thông tin công ty (MINE_MST) |
| Service | `UserService` | USER_MST CRUD |
| Service | `DeptService` | DEPT_MST CRUD |
| Service | `MenuService` | MENU_MST + GRANT_ROLE |
| Service | `MineService` | MINE_MST (singleton) |
| Utility | `EncryptUtil` | AES-128 ECB password encrypt |
| Entity | `User` (USER_MST) | User record |
| Entity | `Mine` (MINE_MST) | Company/policy settings |
| Entity | `Dept` (DEPT_MST) | Department |
| DTO | `UserDto` | Session object |
| DTO | `MenuDto` | Menu + permission DTO |
| Entity join | `MenuJoin` | Menu với permission flags |

**Imports (EditUserAction.java:11-24)**:
```java
import jp.co.arkinfosys.common.EncryptUtil;          // line 12
import jp.co.arkinfosys.dto.UserDto;                 // line 14
import jp.co.arkinfosys.dto.setting.MenuDto;         // line 15
import jp.co.arkinfosys.entity.Dept;                 // line 16
import jp.co.arkinfosys.entity.Mine;                 // line 17
import jp.co.arkinfosys.entity.User;                 // line 18
import jp.co.arkinfosys.entity.join.MenuJoin;        // line 19
import jp.co.arkinfosys.service.DeptService;         // line 21
import jp.co.arkinfosys.service.MenuService;         // line 22
import jp.co.arkinfosys.service.MineService;         // line 23
import jp.co.arkinfosys.service.UserService;         // line 24
```

---

## Database Tables

**READ**:
- `USER_MST` – tìm kiếm, kiểm tra duplicate, edit
- `DEPT_MST` – department dropdown
- `MENU_MST` – cấu trúc menu
- `GRANT_ROLE` – quyền menu của user
- `ROLE_MST` – danh sách role
- `MINE_MST` – password policy (length, char type, valid days)

**WRITE**:
- `USER_MST` – INSERT / UPDATE / soft-delete (DEL_DATETM)
- `GRANT_ROLE` – INSERT / DELETE (thay thế toàn bộ quyền)
- `MINE_MST` – UPDATE (password policy, company settings)
- `DEPT_MST` – INSERT / UPDATE / DELETE
- `CATEGORY_MST` / `CATEGORY_TRN` – INSERT / UPDATE / DELETE
- `SEQ_MAKER` – next USER_ID

---

## Validation Rules

1. `USER_ID` – required, max 30 chars, alphanumeric
2. `USER_ID` phải unique (check trước INSERT)
3. Password – min length theo `MINE_MST.PASSWORD_LENGTH`
4. Password – char type theo `MINE_MST.PASSWORD_CHAR_TYPE` (uppercase, number required, etc.)
5. Password confirm – phải khớp với password
6. `DEPT_CODE` – phải tồn tại trong DEPT_MST
7. Không thể xóa user đang đăng nhập (session user)
8. Không thể xóa admin user duy nhất (inferred)
9. Password history: không dùng lại `MINE_MST.PASSWORD_HIST_COUNT` lần gần nhất

---

## Status Transitions

```
USER_MST:
  [Không tồn tại] → register() → [Active] (DEL_DATETM IS NULL)
                                      │
                  [FAIL_COUNT >= MAX] ← [Login fail nhiều lần]
                                      ↓
                               [Locked] (FAIL_COUNT >= MINE_MST.TOTAL_FAIL_COUNT)
                                      │ [Admin reset]
                                      ↓
                               [Active again]
                                      │ [delete()]
                                      ↓
                               [Soft-deleted] (DEL_DATETM IS NOT NULL)

PASSWORD:
  [Set] → [Valid until PASSWORD_UPD_DATETM + PASSWORD_VALID_DAYS]
       → [Expired] → Force change password on next login
```

---

## External Integrations

- **Không có LDAP/Active Directory integration**
- **Không có SSO provider** – xác thực hoàn toàn internal (trừ SSO qua URL param – WF-01)
- **MINE_MST** là singleton – cả hệ thống dùng chung policy

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| Duplicate USER_ID | "errors.duplicate" |
| Password không đủ độ phức tạp | "errors.password.complexity" (inferred) |
| Password confirm mismatch | "errors.password.confirm" |
| UnabledLockException | "errors.lock" |
| Xóa user đang login | "errors.cannotDelete" (inferred) |
| ServiceException | `super.errorLog(e)` + throw |

---

## Permission Model

```
USER_MST (user)
    │ N:M
GRANT_ROLE ──(ROLE_ID)──→ ROLE_MST
           ──(MENU_ID)──→ MENU_MST
                              │
                         isMenuUpdate  (quyền sửa)
                         isMenuValid   (quyền xem)
                         isMenuDelete  (quyền xóa, inferred)
```

**Cơ chế check quyền**:
```java
// Mọi action:
importOnlineOrderForm.isUpdate = userDto.isMenuUpdate(Constants.MENU_ID.INPUT_RORDER);
importOnlineOrderForm.isInputValid = userDto.isMenuValid(Constants.MENU_ID.INPUT_RORDER);
// Evidence: ImportOnlineOrderAction.java:64-65
```

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/setting/EditUserAction.java` | 1-80 | Class, imports, services |
| `action/setting/EditUserAction.java` | 41-66 | Services injected |
| `action/setting/EditUserAction.java` | 74-80 | index() method |
| `action/setting/ChangePasswordAction.java` | all | Password change |
| `action/setting/SetSecurityAction.java` | all | Security policy |
| `action/setting/CompanyAction.java` | all | Company settings |
| `action/setting/SetCategoryAction.java` | all | Category CRUD |
| `action/rorder/ImportOnlineOrderAction.java` | 64-65 | isMenuUpdate/isMenuValid pattern |
| `common/EncryptUtil.java` | 26 | `DEFAULT_PRIVATE_KEY = "jp.co.arkinfosys"` |
