# FD-AUTH-01: Đăng nhập & Xác thực (Login & Authentication)

> **Confidence**: HIGH (WF-01, `06-auth-permission-analysis.md`) / MEDIUM (Java line-level — source có thể ngoài workspace)  
> **Evidence file**: [`_evidence/FD-AUTH-01-login-auth.md`](./_evidence/FD-AUTH-01-login-auth.md)  
> **Workflow**: [WF-01 Login & Authentication](../workflows/WF-01-login-auth.md)  
> **Scope**: Login, logout, session/JWT guard, SSO URL param, account lockout, password expiry redirect (không gồm user CRUD — xem FD-SETTING-01)

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Confirmed (class + flow) | `LoginAction`, `LogoutAction` — `06-auth-permission-analysis.md`, WF-01 |
| Interceptor | Confirmed | `AbstractLoginCheckInterceptor` — `06-auth-permission-analysis.md:110-130` |
| Encryption | Confirmed | `EncryptUtil` AES-128 ECB — `06-auth-permission-analysis.md:54-76` |
| DDL / policy | Confirmed | `USER_MST`, `MINE_MST` — WF-01, `CREATE.sql` cited |
| Workflow coverage | Confirmed | WF-01 |
| Target API design | Target decision | NestJS `AuthController` + JWT |

**Confidence: MEDIUM-HIGH** — Flow và encryption confirmed từ RE có Java path; spot-check `LoginAction.java:124-248` khi migrate.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Đăng nhập, đăng xuất, kiểm tra phiên, load menu permissions vào session/token | LEGACY_CONFIRMED |
| **Module** | `auth` / AUTH | LEGACY_CONFIRMED |
| **Actor** | Public (login); sau login mọi API cần guard | LEGACY_CONFIRMED |
| **Legacy URLs** | `GET /login/{domainId}`, `POST /login/login`, `POST /logout` | LEGACY_CONFIRMED |
| **Target API** | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/refresh` | TARGET_DECISION |
| **Trigger** | User action (HTTP) / SSO query params | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `loginSchema` (Zod)

```typescript
const loginSchema = z.object({
  userId: z.string().min(1).max(30),
  password: z.string().min(1),
  // TARGET_DECISION: domainId optional nếu single-tenant
  domainId: z.string().optional(),
});

const ssoLoginSchema = loginSchema.extend({
  // Legacy: credentials trong URL — parity flag ASSUMPTION
  viaSso: z.boolean().optional(),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column / behavior | Provenance |
|-------|------|----------|------------|--------------------------|------------|
| `userId` | string | ✓ | non-empty, max 30 | `USER_MST.USER_ID` | LEGACY_CONFIRMED |
| `password` | string | ✓ | non-empty | plain → encrypt compare | LEGACY_CONFIRMED |
| `domainId` | string | ✓ (legacy) | exists in `DOMAIN_MST` | URL path param | LEGACY_CONFIRMED |
| SSO params | same | optional | auto-call login | request query/form | LEGACY_CONFIRMED |

### Logout — `logoutSchema`

| Field | Type | Required | Legacy equivalent |
|-------|------|----------|-------------------|
| — | — | — | Session invalidate; target: revoke refresh token |

**Evidence:** WF-01 § Validation, `06-auth-permission-analysis.md` §1.2

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Login success | Redirect `/menu`, session `userDto` + `mineDto` + menus | `LoginAction.java:211-248` | LEGACY_CONFIRMED |
| Login fail | Same JSP + `errors.login.notMatch` / `errors.invalid.login` | WF-01 | LEGACY_CONFIRMED |
| Account locked | `errors.login.lock` / lock message | WF-01, `06-auth-permission-analysis.md` §6 | LEGACY_CONFIRMED |
| Password expired | Redirect `/setting/changePassword` | `06-auth-permission-analysis.md:46` | LEGACY_CONFIRMED |
| Logout | Session invalidated → login page | WF-01 | INFERRED |
| Not logged in | AOP redirect `/login` | `AbstractLoginCheckInterceptor` | LEGACY_CONFIRMED |

### Target Response

```typescript
type MenuPermissionDto = {
  menuId: string;
  canView: boolean;
  canUpdate: boolean;
};

type AuthUserDto = {
  userId: string;
  userName: string;
  menuPermissions: MenuPermissionDto[];
  fileOpenLevel?: string;
  passwordExpired: boolean;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
};

type MeResponse = AuthUserDto;
```

| Field | Provenance |
|-------|------------|
| JWT access + refresh | TARGET_DECISION (thay HTTP session) |
| `menuPermissions` từ GRANT_ROLE + MENU_MST | LEGACY_CONFIRMED |
| `passwordExpired` computed | LEGACY_CONFIRMED |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | User phải tồn tại, `DEL_DATETM IS NULL` | LEGACY_CONFIRMED | WF-01 VAL #3 | Block |
| BR-02 | Password so sánh sau `EncryptUtil.encrypt` (AES-128 ECB) | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:33-34` | Block |
| BR-03 | Sai password → tăng `FAIL_COUNT`; đạt `MINE_MST.TOTAL_FAIL_COUNT` → `lockflg=1` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:36-38` | Block |
| BR-04 | Login thành công → reset `FAIL_COUNT=0`, `lockflg=0`, cập nhật `LAST_LOGIN_DATETM` | LEGACY_CONFIRMED | WF-01 § Database WRITE | Info |
| BR-05 | `lockflg=1` → từ chối login (admin unlock thủ công) | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:32` | Block |
| BR-06 | Password hết hạn → bắt đổi mật khẩu trước khi dùng hệ thống | LEGACY_CONFIRMED | WF-01, `MINE_MST.PASSWORD_VALID_DAYS` | Block |
| BR-07 | Sau login load menu list theo `userId` vào session | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:162-176` | Info |
| BR-08 | SSO: nếu `userId`+`password` trong request → gọi login không qua form | LEGACY_CONFIRMED | `LoginAction.java:98-101` | Info |
| BR-09 | Mọi protected Action phải có `userDto.userId != null` | LEGACY_CONFIRMED | `AbstractLoginCheckInterceptor` | Block |
| TD-01 | Target: bcrypt/argon2 cho password mới; legacy AES chỉ verify migration | TARGET_DECISION | security hardening | Block |
| TD-02 | Target: JWT thay session; permissions trong claims hoặc `/me` | TARGET_DECISION | NestJS Guard | Info |
| TD-03 | Target: SSO qua signed token thay credentials trong URL | TARGET_DECISION | mitigate URL leak | Info |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `userId` | Required | 422 | LEGACY_CONFIRMED | WF-01 |
| VAL-02 | `password` | Required | 422 | LEGACY_CONFIRMED | WF-01 |
| VAL-03 | `domainId` | Valid domain (legacy) | 404 `DOMAIN_NOT_FOUND` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:15-17` |
| VAL-04 | credentials | User exists + password match | 401 `INVALID_CREDENTIALS` | LEGACY_CONFIRMED | WF-01 |
| VAL-05 | account | Not locked | 403 `ACCOUNT_LOCKED` | LEGACY_CONFIRMED | WF-01 |
| VAL-06 | password age | Not expired (hoặc flag trong response) | 403 `PASSWORD_EXPIRED` | LEGACY_CONFIRMED | WF-01 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| User/password sai | `errors.login.notMatch` / `errors.invalid.login` | WF-01 |
| Account locked | `errors.login.lock` | WF-01 |
| Domain missing | `errors.missing.domain` | `06-auth-permission-analysis.md:17` |
| Password expired | Redirect change password | WF-01 |
| Session timeout | Interceptor → `/login` | WF-01 |
| System | `errors.system` + log | WF-01 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Invalid credentials | 401 | `INVALID_CREDENTIALS` | TARGET_DECISION |
| Account locked | 403 | `ACCOUNT_LOCKED` | TARGET_DECISION |
| Password expired | 403 | `PASSWORD_EXPIRED` | TARGET_DECISION |
| Unauthorized (no/invalid JWT) | 401 | `UNAUTHORIZED` | TARGET_DECISION |
| Domain not found | 404 | `DOMAIN_NOT_FOUND` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `USER_MST` | Lookup user, fail count, lock | `user` | `deletedAt IS NULL` | LEGACY_CONFIRMED |
| `MINE_MST` | `TOTAL_FAIL_COUNT`, `PASSWORD_VALID_DAYS` | `mine` / settings singleton | active row | LEGACY_CONFIRMED |
| `GRANT_ROLE` | Permissions | `grantRole` | by `userId` | LEGACY_CONFIRMED |
| `MENU_MST` | Menu metadata | `menu` | join grant | LEGACY_CONFIRMED |
| `DOMAIN_MST` | Domain validation | TBD / omit single-tenant | by domainId | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `USER_MST` | UPDATE failCount, lockflg | `user` | On failed login | LEGACY_CONFIRMED |
| `USER_MST` | UPDATE failCount=0, lastLoginAt | `user` | On success | LEGACY_CONFIRMED |

### Delete Policy

Không có delete trong AUTH login flow.

**Transaction:** Single-row update `user` — không bắt buộc `$transaction` trừ khi gộp audit log — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy | Target permission | Operations |
|--------|-------------------|------------|
| Public | — | `POST /api/auth/login` |
| Session user | JWT `AuthGuard` | `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/refresh` |

> **MENU_ID:** Login không có MENU_ID (public). Permission check sau login dùng data từ GRANT_ROLE — xem FD-SETTING-01.

| Method | Path | Legacy equivalent | Guard |
|--------|------|-------------------|-------|
| POST | `/api/auth/login` | `LoginAction.login()` | Public |
| POST | `/api/auth/logout` | `LogoutAction` | `AuthGuard` |
| GET | `/api/auth/me` | session `userDto` | `AuthGuard` |
| POST | `/api/auth/refresh` | — (new) | Refresh token |
| GET | `/api/auth/sso` | SSO URL param login | Public + feature flag |

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginInput) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@CurrentUser() user: AuthUserDto) {
    return this.authService.logout(user);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: AuthUserDto) {
    return this.authService.getProfile(user.userId);
  }
}
```

### Legacy password verify (migration bridge)

```typescript
// LEGACY_CONFIRMED parity — thay bằng bcrypt khi user đổi PW
function verifyLegacyPassword(plain: string, storedHex: string): boolean {
  return legacyAesEcbEncrypt(plain) === storedHex;
}
```

### AuthGuard (thay `AbstractLoginCheckInterceptor`)

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // từ JwtStrategy
    if (!user?.userId) throw new UnauthorizedException('UNAUTHORIZED');
    return true;
  }
}
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| Login | `/login` | `login/login.jsp` |
| Post-login redirect | `/menu` hoặc `/` | `menu.jsp` |
| Password expired | `/settings/change-password` | `changePassword.jsp` |

Middleware Next.js: redirect unauthenticated → `/login` (thay AOP interceptor).

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Login happy path | valid userId/password | 200 + JWT + menus | Integration | TARGET_DECISION |
| TC-02 | Wrong password | bad password | 401, failCount++ | Integration | LEGACY_CONFIRMED |
| TC-03 | Lock after N fails | N+1 wrong attempts | 403 ACCOUNT_LOCKED | Integration | LEGACY_CONFIRMED |
| TC-04 | Locked account | lockflg=1 | 403 | Unit | LEGACY_CONFIRMED |
| TC-05 | Password expired | old PASSWORD_UPD_DATETM | 403 PASSWORD_EXPIRED | Integration | LEGACY_CONFIRMED |
| TC-06 | Soft-deleted user | DEL_DATETM set | 401 | Integration | LEGACY_CONFIRMED |
| TC-07 | Logout | valid JWT | 204, token revoked | Integration | TARGET_DECISION |
| TC-08 | Me without token | no Authorization | 401 | Unit | TARGET_DECISION |
| TC-09 | Legacy AES verify | known test vector | match legacy EncryptUtil | Unit | LEGACY_CONFIRMED |
| TC-10 | SSO param login | userId+password query | 200 (parity) hoặc 410 deprecated | Integration | ASSUMPTION |

---

## 10. Risked Items

- [ ] AES-128 ECB hard-coded key — **không replicate** cho password mới; chỉ verify legacy
- [ ] SSO credentials trong URL — security risk; target nên deprecate
- [ ] Java source path ngoài workspace — verify `LoginAction.java:124-248` trước parity test
- [ ] `DOMAIN_MST` multi-tenant — chưa quyết định single-tenant target
- [ ] CSRF legacy UNKNOWN — JWT + SameSite cookies mitigate
- [ ] Menu permissions chỉ load lúc login — đổi GRANT_ROLE cần re-login hoặc refresh permissions
- [ ] MD5 option trong `EncryptUtil` — UNKNOWN có user nào dùng không

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Có bao nhiêu tenant `DOMAIN_MST` production? | Single-tenant, bỏ domainId | High | Open |
| OQ-02 | UNKNOWN | Per-request `isMenuUpdate` server check trên mọi Action? | `PermissionGuard` per route | High | Open |
| TD-01 | TARGET_DECISION | JWT access 8h / refresh 7d | Config env | Medium | Proposed |
| TD-02 | TARGET_DECISION | Password migration: rehash on login | bcrypt cost 12 | High | Proposed |
| TD-03 | TARGET_DECISION | SSO replacement | HMAC signed one-time token | High | Proposed |
| AS-01 | ASSUMPTION | `LogoutAction` = POST `/logout` | Map `POST /api/auth/logout` | Low | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-01](../workflows/WF-01-login-auth.md) |
| Setting (user/PW) | [FD-SETTING-01](./FD-SETTING-01-user-permission.md) |
| Auth analysis | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) |
| Inventory | [_inventory/auth.md](./_inventory/auth.md) |
| Index | [_index.md](./_index.md) |
