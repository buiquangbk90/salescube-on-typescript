# FD-SETTING-01: Quản lý User & Phân quyền (社員・権限管理)

> **Confidence**: HIGH (WF-13, screen map, MENU_ID) / MEDIUM (Java line-level — source có thể ngoài workspace)  
> **Evidence file**: [`_evidence/FD-SETTING-01-user-permission.md`](./_evidence/FD-SETTING-01-user-permission.md)  
> **Workflow**: [WF-13 User & Permission](../workflows/WF-13-user-permission.md)  
> **Scope**: User CRUD, GRANT_ROLE (menu permissions), MINE_MST security policy, đổi mật khẩu (không gồm dept/category/company — xem `_inventory/setting.md`)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Actions | Confirmed (class) / Partial (methods) | `SearchUserAction`, `EditUserAction`, `ChangePasswordAction`, `SetSecurityAction` — WF-13, `07-screen-route-mapping.md` |
| Service logic | Confirmed | `UserService`, `MenuService`, `MineService`, `DeptService` — WF-13 |
| DDL mapping | Partial | `USER_MST`, `GRANT_ROLE`, `MINE_MST` — WF-13, `02-entity-list.md` |
| Workflow coverage | Confirmed (scoped) | WF-13 — subset user/permission |
| Target API design | Target decision | NestJS `UsersController`, `SecuritySettingsController` |

**Confidence: MEDIUM-HIGH** — Routes và MENU_ID confirmed; GRANT_ROLE replace-all pattern INFERRED.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | CRUD user, gán quyền menu (GRANT_ROLE), cấu hình policy mật khẩu (MINE_MST), đổi mật khẩu | LEGACY_CONFIRMED |
| **Module** | `setting` / SETTING | LEGACY_CONFIRMED |
| **Actor** | Admin có quyền menu quản lý nhân viên / bảo mật | INFERRED |
| **Legacy URLs** | `/setting/searchUser`, `/setting/editUser`, `/setting/changePassword`, `/setting/setSecurity` | LEGACY_CONFIRMED |
| **Target API** | `/api/users`, `/api/users/:id/permissions`, `/api/settings/security`, `/api/auth/change-password` | TARGET_DECISION |
| **Trigger** | User action (HTTP) | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `createUserSchema` (Zod)

```typescript
const menuPermissionSchema = z.object({
  menuId: z.string(),
  canView: z.boolean(),
  canUpdate: z.boolean(),
});

const createUserSchema = z.object({
  userId: z.string().min(1).max(30).regex(/^[a-zA-Z0-9]+$/),
  userName: z.string().min(1).max(60),
  password: z.string().min(1), // validated against mine policy
  passwordConfirm: z.string().min(1),
  deptCode: z.string().min(1),
  menuPermissions: z.array(menuPermissionSchema).default([]),
});

const updateUserSchema = createUserSchema
  .omit({ userId: true, password: true, passwordConfirm: true })
  .extend({
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .partial({ userName: true, deptCode: true });
```

### Target — `changePasswordSchema`

```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  newPasswordConfirm: z.string().min(1),
});
```

### Target — `securityPolicySchema` (MINE_MST)

```typescript
const securityPolicySchema = z.object({
  totalFailCount: z.number().int().positive(),
  passwordValidDays: z.number().int().positive(),
  passwordLength: z.number().int().min(4),
  passwordCharType: z.string(), // legacy enum string
  passwordHistCount: z.number().int().nonnegative(),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `userId` | string | ✓ (create) | unique, alphanumeric max 30 | `USER_MST.USER_ID` | LEGACY_CONFIRMED |
| `userName` | string | ✓ | max length legacy | `USER_NAME` | ASSUMPTION |
| `password` | string | ✓ (create) | MINE_MST policy | `PASSWORD` (AES encrypted) | LEGACY_CONFIRMED |
| `deptCode` | string | ✓ | exists in DEPT_MST | `DEPT_CODE` | LEGACY_CONFIRMED |
| `menuPermissions` | array | | replace GRANT_ROLE | `GRANT_ROLE` + flags | INFERRED |
| `totalFailCount` | number | ✓ | > 0 | `MINE_MST.TOTAL_FAIL_COUNT` | LEGACY_CONFIRMED |
| `passwordValidDays` | number | ✓ | > 0 | `MINE_MST.PASSWORD_VALID_DAYS` | LEGACY_CONFIRMED |

### Search query — `userSearchSchema`

| Param | Type | Default | Legacy equivalent |
|-------|------|---------|-------------------|
| `q` | string | — | Search form userId/name |
| `deptCode` | string | — | Dept filter |
| `page` | number | 1 | pager |
| `pageSize` | number | 20 | pager |

**Evidence:** WF-13 § Validation, `06-auth-permission-analysis.md` §7

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Search success | Forward `searchUser.jsp` + list | `SearchUserAction` pattern | INFERRED |
| Register success | Stay on `editUser.jsp` + flash | `EditUserAction.register()` | LEGACY_CONFIRMED |
| Validation error | Same JSP + ActionErrors | Struts form | INFERRED |
| Delete success | Redirect list | WF-13 | INFERRED |
| Set security success | Stay on `setSecurity.jsp` | `SetSecurityAction` | INFERRED |
| Change password success | Redirect menu or login | `ChangePasswordAction` | INFERRED |

### Target Response

```typescript
type UserDto = {
  userId: string;
  userName: string;
  deptCode: string;
  failCount: number;
  locked: boolean;
  lastLoginAt?: string;
  passwordUpdatedAt?: string;
};

type UserDetailDto = UserDto & {
  menuPermissions: MenuPermissionDto[];
};

type ListUsersResponse = {
  data: UserDto[];
  total: number;
  page: number;
  pageSize: number;
};

type SecurityPolicyDto = {
  totalFailCount: number;
  passwordValidDays: number;
  passwordLength: number;
  passwordCharType: string;
  passwordHistCount: number;
};
```

| Field | Provenance |
|-------|------------|
| `userId` business key | LEGACY_CONFIRMED |
| `locked` từ `lockflg` | LEGACY_CONFIRMED |
| Permissions embedded in detail | TARGET_DECISION |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | `USER_ID` unique trên active records | LEGACY_CONFIRMED | WF-13 VAL #2 | Block |
| BR-02 | Password encrypt AES-128 ECB trước khi lưu (legacy parity) | LEGACY_CONFIRMED | WF-13, `EncryptUtil` | Block |
| BR-03 | Password phải thỏa `MINE_MST` (length, char type) | LEGACY_CONFIRMED | WF-13 VAL #3-4 | Block |
| BR-04 | `passwordConfirm` phải khớp `password` | LEGACY_CONFIRMED | WF-13 VAL #5 | Block |
| BR-05 | `DEPT_CODE` phải tồn tại | LEGACY_CONFIRMED | WF-13 VAL #6 | Block |
| BR-06 | Save user → replace toàn bộ `GRANT_ROLE` cho user | INFERRED | WF-13 main path | Info |
| BR-07 | Delete = set `DEL_DATETM` (soft) | INFERRED | WF-13 status diagram | Block |
| BR-08 | Không xóa user đang đăng nhập | INFERRED | WF-13 VAL #7 | Block |
| BR-09 | Không xóa admin duy nhất | INFERRED | WF-13 VAL #8 | Block |
| BR-10 | Đổi PW không trùng N mật khẩu gần nhất (`PASSWORD_HIST_COUNT`) | LEGACY_CONFIRMED | WF-13 VAL #9 | Block |
| BR-11 | `MINE_MST` singleton — cả hệ thống dùng chung | LEGACY_CONFIRMED | WF-13 | Info |
| BR-12 | Insert user allocate ID qua `SEQ_MAKER` (legacy) | INFERRED | WF-13 | Info |
| TD-01 | Target: bcrypt cho password mới; admin create vẫn policy | TARGET_DECISION | FD-AUTH-01 TD-02 | Block |
| TD-02 | Target: `deletedAt` thay `DEL_DATETM` | TARGET_DECISION | migration convention | Info |
| TD-03 | Permissions API tách khỏi user body | TARGET_DECISION | REST clarity | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `userId` | Required on create | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-02 | `userId` | Alphanumeric max 30 | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-03 | `userId` | Unique on create | 409 | LEGACY_CONFIRMED | WF-13 |
| VAL-04 | `password` | Min length per MINE_MST | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-05 | `password` | Char type per MINE_MST | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-06 | `passwordConfirm` | Match password | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-07 | `deptCode` | Valid DEPT_MST | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-08 | delete | Not current session user | 409 | INFERRED | WF-13 |
| VAL-09 | delete | Not last admin | 409 | INFERRED | WF-13 |
| VAL-10 | change PW | Not in password history | 422 | LEGACY_CONFIRMED | WF-13 |
| VAL-11 | security policy | Positive integers | 422 | LEGACY_CONFIRMED | MINE_MST schema |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Duplicate USER_ID | `errors.duplicate` | WF-13 |
| Password complexity | `errors.password.complexity` | INFERRED |
| Password confirm mismatch | `errors.password.confirm` | WF-13 |
| Cannot delete self | `errors.cannotDelete` | INFERRED |
| Lock conflict | `errors.lock` / `UnabledLockException` | WF-13 |
| System | `super.errorLog(e)` + throw | WF-13 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |
| Duplicate userId | 409 | `DUPLICATE_USER_ID` | TARGET_DECISION |
| Cannot delete self | 409 | `CANNOT_DELETE_SELF` | TARGET_DECISION |
| Cannot delete last admin | 409 | `CANNOT_DELETE_LAST_ADMIN` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Lock / version | 409 | `VERSION_CONFLICT` | ASSUMPTION |
| Password in history | 422 | `PASSWORD_REUSED` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `USER_MST` | Search/detail | `user` | `deletedAt IS NULL` | LEGACY_CONFIRMED |
| `DEPT_MST` | Dropdown | `dept` | active | LEGACY_CONFIRMED |
| `MENU_MST` | Menu tree | `menu` | active | LEGACY_CONFIRMED |
| `GRANT_ROLE` | User permissions | `grantRole` | by userId | LEGACY_CONFIRMED |
| `ROLE_MST` | Role metadata | `role` | join | LEGACY_CONFIRMED |
| `MINE_MST` | Security policy | `mine` | singleton | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `USER_MST` | INSERT/UPDATE | `prisma.user` | Encrypt/hash password | LEGACY_CONFIRMED |
| `USER_MST` | UPDATE soft-delete | `user.deletedAt` | Delete user | INFERRED |
| `GRANT_ROLE` | DELETE all + INSERT | `grantRole` | Replace on save | INFERRED |
| `MINE_MST` | UPDATE | `mine` | Security policy | LEGACY_CONFIRMED |
| `USER_MST` | UPDATE password fields | `user` | Change password | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy only | INFERRED |

### Delete Policy

| | Legacy | Target | Provenance |
|---|--------|--------|------------|
| Policy | Set `DEL_DATETM` | `deletedAt` timestamp | INFERRED / TARGET_DECISION |
| Filter reads | `DEL_DATETM IS NULL` | `where: { deletedAt: null }` | INFERRED |

**Transaction:** `$transaction` khi ghi `user` + replace `grantRole` (+ password hist nếu có) — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy URL | Legacy check | Target permission | Operations |
|----------------|------------|--------------|-------------------|------------|
| `1203` | `/setting/searchUser` | `isMenuValid` / `isMenuUpdate` | `setting.user.read` | GET users |
| `1203` | `/setting/editUser` | `isMenuUpdate` | `setting.user.write` | POST, PATCH |
| `1203` | delete | `isMenuUpdate` | `setting.user.delete` | DELETE |
| `1206` | `/setting/changePassword` | authenticated user | `auth.changePassword` | POST change-password |
| `1207` | `/setting/setSecurity` | admin | `setting.security.write` | GET/PATCH security policy |

> **Evidence:** `03-route-api-inventory.md` (MENU_ID 1203, 1206, 1207), WF-13 § Permission Model.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/users` | `searchUser` | `setting.user.read` |
| GET | `/api/users/:userId` | `editUser` load | `setting.user.read` |
| POST | `/api/users` | `register` create | `setting.user.write` |
| PATCH | `/api/users/:userId` | `register` update | `setting.user.write` |
| DELETE | `/api/users/:userId` | `delete` | `setting.user.delete` |
| PUT | `/api/users/:userId/permissions` | GRANT_ROLE save | `setting.user.write` |
| GET | `/api/settings/security` | `setSecurity` load | `setting.security.read` |
| PATCH | `/api/settings/security` | `setSecurity` save | `setting.security.write` |
| POST | `/api/auth/change-password` | `changePassword` | `auth.changePassword` (self) |

```typescript
@Controller('users')
@UseGuards(AuthGuard, PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermission('setting.user.write')
  create(@Body() dto: CreateUserInput) {
    return this.usersService.create(dto);
  }

  @Put(':userId/permissions')
  @RequirePermission('setting.user.write')
  setPermissions(
    @Param('userId') userId: string,
    @Body() dto: SetPermissionsInput,
  ) {
    return this.usersService.replacePermissions(userId, dto);
  }
}
```

### Service pattern (user + permissions)

```typescript
return this.prisma.$transaction(async (tx) => {
  const existing = await tx.user.findFirst({
    where: { userId: dto.userId, deletedAt: null },
  });
  if (existing) throw new ConflictException('DUPLICATE_USER_ID');

  const user = await tx.user.create({
    data: {
      userId: dto.userId,
      userName: dto.userName,
      password: await this.passwordService.hash(dto.password),
      deptCode: dto.deptCode,
    },
  });

  await tx.grantRole.deleteMany({ where: { userId: dto.userId } });
  await tx.grantRole.createMany({
    data: dto.menuPermissions.map((p) => ({
      userId: dto.userId,
      menuId: p.menuId,
      canView: p.canView,
      canUpdate: p.canUpdate,
    })),
  });

  return { success: true, data: user };
});
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| User list | `/settings/users` | `searchUser.jsp` |
| Create user | `/settings/users/new` | `editUser.jsp` |
| Edit user | `/settings/users/[userId]` | `editUser.jsp` |
| Change password | `/settings/change-password` | `changePassword.jsp` |
| Security policy | `/settings/security` | `setSecurity.jsp` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Create user happy path | valid dto + permissions | 201 | Integration | TARGET_DECISION |
| TC-02 | Duplicate userId | same id twice | 409 | Unit | LEGACY_CONFIRMED |
| TC-03 | Password too short | per MINE_MST | 422 | Unit | LEGACY_CONFIRMED |
| TC-04 | Replace permissions | PUT permissions | old grants removed | Integration | INFERRED |
| TC-05 | Soft delete user | DELETE | deletedAt set | Integration | INFERRED |
| TC-06 | Delete self | current user id | 409 | Integration | INFERRED |
| TC-07 | Change password | valid current + new | 200, PASSWORD_UPD updated | Integration | LEGACY_CONFIRMED |
| TC-08 | Password reuse | in history | 422 PASSWORD_REUSED | Integration | LEGACY_CONFIRMED |
| TC-09 | Update MINE_MST | PATCH security | policy persisted | Integration | LEGACY_CONFIRMED |
| TC-10 | Permission denied | no write perm | 403 | Unit | LEGACY_CONFIRMED |
| TC-11 | Unlock user | admin reset failCount/lock | login works | Integration | LEGACY_CONFIRMED |

---

## 10. Risked Items

- [ ] Java `EditUserAction.java` 352 lines — chưa verify line-level trong workspace
- [ ] GRANT_ROLE schema (ROLE_ID vs MENU_ID) — cần DDL confirm trước Prisma model
- [ ] Password history table — UNKNOWN có bảng riêng hay chỉ column
- [ ] `SEQ_MAKER` vs `userId` as natural key — legacy dùng USER_ID làm PK lookup
- [ ] Admin detection — INFERRED "last admin" rule, chưa có role constant rõ
- [ ] AES encrypt on save vs bcrypt target — dual path during migration
- [ ] Dept master (`FD-SETTING-02`) dependency cho dropdown

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | `GRANT_ROLE` ghi theo ROLE_ID hay MENU_ID trực tiếp? | Mirror SQL `GRANT_ROLE.sql` | High | Open |
| OQ-02 | UNKNOWN | Password history storage table | `user_password_hist` table | Medium | Open |
| OQ-03 | INFERRED | `isMenuDelete` flag tồn tại? | Chỉ view/update flags | Medium | Open |
| TD-01 | TARGET_DECISION | Permissions: nested PUT vs PATCH user | Separate `PUT .../permissions` | Low | Proposed |
| TD-02 | TARGET_DECISION | Change password under `/api/auth` vs `/api/users` | `/api/auth/change-password` for self | Medium | Proposed |
| TD-03 | TARGET_DECISION | Admin unlock UI | PATCH user `locked: false` + reset failCount | Medium | Proposed |
| AS-01 | ASSUMPTION | `register()` handles create+update | POST vs PATCH split | Low | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-13](../workflows/WF-13-user-permission.md) |
| Auth login | [FD-AUTH-01](./FD-AUTH-01-login-auth.md) |
| Auth analysis | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) |
| Routes + MENU_ID | [03-route-api-inventory.md](../03-route-api-inventory.md) |
| Entity | [docs/spec/02-entity-list.md](../../../docs/spec/02-entity-list.md) |
| Inventory | [_inventory/setting.md](./_inventory/setting.md) |
| Index | [_index.md](./_index.md) |
