# FD-AUTH-01 — Login & Authentication

**Module**: AUTH  
**WF Source**: `output/cursor/workflows/WF-01-login-auth.md`  
**Legacy Source**: `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java`  
**Priority**: P1-1 (phải xong trước tất cả modules khác)  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Đăng nhập, đăng xuất, kiểm tra session |
| Legacy entry | `LoginAction.java`, `AbstractLoginCheckInterceptor.java` |
| Target | NestJS `AuthController` + `AuthService` + JWT Guard |
| Loại | Stateless JWT (TARGET_DECISION) thay cho Struts session |

---

## 2. Legacy Behavior

### 2.1 Login flow

`Confirmed by code` — `LoginAction.java:125-248`

```
GET  /login/{domainId}   → LoginAction.index()   [L77]
POST /login/login        → LoginAction.login()   [L125]

LoginAction.login():
  L127: kiểm tra domainDto.domainId != null
  L137: mineService.getMine() → lấy Mine.totalFailCount (retryCount)
  L143: userService.findById(loginForm.userId)  → USER lookup
  L146: user == null → errors.invalid.login, return INPUT
  L154: user.lockflg == null → set "0"
  L159: user.lockflg == "1" → errors.lock.user, return INPUT
  L168: EncryptUtil.encrypt(loginForm.password) → encryptPassword
  L171: encryptPassword != user.password → errors.invalid.login
  L185: user.failCount++
  L188: failCount >= retryCount → user.lockflg = "1"
  L192: userService.updateFailCountAndLockFlg(userId, lockflg, failCount)
  L205: [login OK] userService.updateFailCountAndLockFlg(userId, "0", 0)
  L208: Beans.copy(user, userDto)
  L211: menuService.findMenuByUserId(userId) → menuDtoList
  L235: mine.passwordValidDays != null && userDto.isPasswordExpired()
          → return Mapping.PASSWORD ("/setting/changePassword")
  L242: return Mapping.SUCCESS ("/menu")
```

### 2.2 Session check (AOP Interceptor)

`Confirmed by code` — `AbstractLoginCheckInterceptor.java:75-94`

```
AbstractLoginCheckInterceptor.invoke() [L75]:
  L77: if (!isLogin()) → doAfterError() → return errorURIString ("/login")
  isLogin() [L101]: userDto == null || userDto.userId == null → false
  → áp dụng cho MỌI Action method qua Seasar2 AOP
```

### 2.3 Password encryption

`Confirmed by code` — `EncryptUtil.java:45-67`

- `EncryptUtil.encrypt(str)` [L45]: đọc config `PASSWORD_ENCRYPT_STYLE`
  - Nếu `null` hoặc rỗng → default = **AES** [L50-51]
  - Nếu `"MD5"` → gọi `encryptMD5()` [L58]
  - Else → gọi `encryptAES()` [L63]
- `encryptAES()` [L76]: key = `"jp.co.arkinfosys"` (16 bytes) XOR với password bytes [L78-81]
- **Quan trọng**: thuật toán mặc định là AES, nhưng **có thể config MD5** — không phải cố định AES-ECB

### 2.4 SSO (External login)

`Confirmed by code` — `LoginAction.java:99-101`

```java
// L99-101: SSO bypass — nếu userId và password đã có trong form params
if (StringUtil.hasLength(loginForm.userId) && StringUtil.hasLength(loginForm.password)) {
    return login();
}
```

- SSO trigger trong `index()` [L77], không phải riêng endpoint
- Không có OAuth/SAML/LDAP

### 2.5 Lock mechanism

`Confirmed by code` — `LoginAction.java:154-166, 185-192`

- Lock field: `User.lockflg` (String `"0"`/`"1"`) — không phải `FAIL_COUNT >= MAX` trực tiếp
- Khi `failCount >= retryCount` [L188]: set `lockflg = "1"` → locked
- Check lock ở L159: `lockflg == "1"` → reject trước khi verify password
- Unlock: chỉ khi admin reset (không có tự động unlock)

### 2.6 Password expiry

`Confirmed by code` — `LoginAction.java:235-238`

```java
if (mine.passwordValidDays != null && userDto.isPasswordExpired()) {
    return LoginAction.Mapping.PASSWORD;  // "/setting/changePassword"
}
```

- Redirect đến `/setting/changePassword` — không phải `/auth/change-password`
- Logic `isPasswordExpired()` nằm trong `UserDto` — `INFERRED_FROM_CODE`

---

## 3. Target API Contract (TARGET_DECISION)

### POST /api/auth/login

```typescript
// Request
interface LoginRequestDto {
  userId: string;    // required, non-empty
  password: string;  // required, non-empty
}

// Response (200 OK)
interface LoginResponseDto {
  accessToken: string;   // JWT, expires 8h (TARGET_DECISION)
  refreshToken: string;  // JWT, expires 7d (TARGET_DECISION)
  user: {
    userId: string;
    userName: string;
    menuPermissions: string[];  // từ GRANT_ROLE + MENU_MST
  }
}

// Error responses
// 401: userId/password sai → message "errors.login.notMatch"
// 403: account locked → message "errors.login.lock"
// 403: password expired → redirect info đổi PW
```

### POST /api/auth/logout

```typescript
// Request: Authorization header với Bearer token
// Response: 204 No Content
// Hành vi: invalidate refresh token (TARGET_DECISION — blacklist hoặc token rotation)
```

### GET /api/auth/me

```typescript
// Response (200 OK) — thông tin user hiện tại từ JWT
interface MeResponseDto {
  userId: string;
  userName: string;
  menuPermissions: string[];
  passwordExpired: boolean;
}
```

---

## 4. Data Model

### USER_MST (legacy, đọc trực tiếp)

| Column | Type | Vai trò | Notes |
|--------|------|---------|-------|
| `USER_ID` | VARCHAR | PK (lookup key) | `LEGACY_CONFIRMED` |
| `PASSWORD` | VARCHAR | AES-128 ECB encrypted | `LEGACY_CONFIRMED` |
| `FAIL_COUNT` | INT | Đếm sai password | `LEGACY_CONFIRMED` |
| `LAST_LOGIN_DATETM` | DATETIME | Cập nhật khi login | `LEGACY_CONFIRMED` |
| `PASSWORD_UPD_DATETM` | DATETIME | Ngày đổi PW gần nhất | `LEGACY_CONFIRMED` |
| `DEL_DATETM` | DATETIME | Soft-delete | `LEGACY_CONFIRMED` |

### Prisma target

```prisma
model User {
  userId              String    @id @map("USER_ID")
  password            String    @map("PASSWORD")
  failCount           Int       @default(0) @map("FAIL_COUNT")
  lastLoginAt         DateTime? @map("LAST_LOGIN_DATETM")
  passwordUpdatedAt   DateTime? @map("PASSWORD_UPD_DATETM")
  deletedAt           DateTime? @map("DEL_DATETM")

  @@map("USER_MST")
}
```

> `TARGET_DECISION`: Không dùng `@default(autoincrement())` vì PK là `USER_ID` (string, user-defined).  
> `TARGET_DECISION`: `deletedAt` field giữ tên gốc semantics — filter `deletedAt IS NULL` khi lookup.

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | `userId` required, non-empty | Struts validator — `LoginForm` | `INFERRED_FROM_CODE` |
| V2 | `password` required, non-empty | Struts validator — `LoginForm` | `INFERRED_FROM_CODE` |
| V3 | User phải tồn tại (`userService.findById`) | `LoginAction.java:143-151` | `Confirmed by code` |
| V4 | `User.lockflg != "1"` | `LoginAction.java:159-166` | `Confirmed by code` |
| V5 | Password sau encrypt phải khớp `user.password` | `LoginAction.java:171` | `Confirmed by code` |
| V6 | `failCount >= retryCount` → set `lockflg="1"` | `LoginAction.java:188-192` | `Confirmed by code` |
| V7 | `mine.passwordValidDays != null && isPasswordExpired()` → redirect | `LoginAction.java:235-238` | `Confirmed by code` |

### Zod schema (target)

```typescript
export const loginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1),
});
```

---

## 6. Permission & Guard

| Aspect | Legacy | Target | Provenance |
|--------|--------|--------|------------|
| Auth check | `AbstractLoginCheckInterceptor` AOP | NestJS `JwtAuthGuard` global | `TARGET_DECISION` |
| Public endpoints | Không có annotation — convention | `@Public()` decorator | `TARGET_DECISION` |
| Menu permission | `userDto.isMenuValid(menuId)` | `@RequirePermission(menuId)` | `TARGET_DECISION` |
| SSO | URL params userId/password | `POST /api/auth/sso` với API key | `TARGET_DECISION` — cần confirm |

---

## 7. Error Handling

| Legacy Error | HTTP Status | NestJS Exception | Message key |
|-------------|-------------|-----------------|-------------|
| User không tồn tại | 401 | `UnauthorizedException` | `errors.invalid.login` (L148) |
| `lockflg = "1"` | 401 | `UnauthorizedException` | `errors.invalid.login` + `errors.lock.user` (L161-163) |
| Password sai | 401 | `UnauthorizedException` | `errors.invalid.login` (L174-175) |
| Password expired | 302→`/auth/change-password` | redirect | `Mapping.PASSWORD` (L238) |
| Session timeout | — | JWT expiry → 401 | — |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 8. Transaction Boundaries

| Operation | Legacy | Target |
|-----------|--------|--------|
| Login success | `userService.updateFailCountAndLockFlg(userId, "0", 0)` [L205] | `prisma.user.update({ failCount: 0, lockflg: '0' })` |
| Login fail (wrong PW) | `userService.updateFailCountAndLockFlg(userId, lockflg, failCount)` [L192] | `prisma.user.update({ failCount: { increment: 1 }, lockflg })` |

**Evidence**: `LEGACY_CONFIRMED` — Seasar2 auto-commit per service method  
**Target**: `TARGET_DECISION` — wrap trong transaction để tránh partial update

---

## 9. NestJS Implementation Outline

```typescript
// auth.controller.ts
@Controller('api/auth')
export class AuthController {
  @Public()
  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {}

  @Post('logout')
  async logout(@CurrentUser() user: UserPayload): Promise<void> {}

  @Get('me')
  async me(@CurrentUser() user: UserPayload): Promise<MeResponseDto> {}
}

// auth.service.ts
@Injectable()
export class AuthService {
  async login(userId: string, password: string): Promise<LoginResponseDto> {
    // 1. findUser (DEL_DATETM IS NULL)
    // 2. encrypt(password) → compare
    // 3. checkFailCount vs MINE_MST.TOTAL_FAIL_COUNT
    // 4. checkPasswordExpiry vs MINE_MST.PASSWORD_VALID_DAYS
    // 5. resetFailCount + updateLastLogin (transaction)
    // 6. buildPermissions from GRANT_ROLE + MENU_MST
    // 7. signJwt → return tokens
  }
}
```

---

## 10. Test Surface

| Test | Type | Scenario |
|------|------|---------|
| Login thành công | Unit | Valid user + password → JWT returned |
| Login sai password | Unit | FAIL_COUNT tăng 1, error 401 |
| Account locked | Unit | FAIL_COUNT >= MAX → 403 |
| Password expired | Unit | PASSWORD_UPD_DATETM + DAYS < NOW() → 403 |
| SSO auto-login | Integration | Params bypass form check |
| JWT guard block | E2E | Request không có token → 401 |
| Soft-deleted user | Unit | DEL_DATETM NOT NULL → 401 |

---

## 11. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-AUTH-01 | Password encrypt style: `ConfigUtil.KEY.PASSWORD_ENCRYPT_STYLE` được set là AES hay MD5 trong production? Cần đọc config file | HIGH | `Unknown / needs verification` |
| OQ-AUTH-02 | Password migration khi chuyển sang bcrypt: cần force reset tất cả users | HIGH | `Unknown / needs verification` |
| OQ-AUTH-03 | `UserDto.isPasswordExpired()`: logic cụ thể — đọc `passwordValidDays` vs ngày nào? | MEDIUM | `Unknown / needs verification` |
| OQ-AUTH-04 | SSO: external system gọi `/login/{domainId}` với GET params hay có form POST riêng? | MEDIUM | `Unknown / needs verification` |
| OQ-AUTH-05 | Admin unlock account: có màn hình riêng (`lockflg = "0"` reset)? Cần tìm Action class | LOW | `Unknown / needs verification` |
