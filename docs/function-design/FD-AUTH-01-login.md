# FD-AUTH-01 — Login & Authentication

**Module**: AUTH  
**WF Source**: `output/cursor/workflows/WF-01-login-auth.md`  
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

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Login flow

```
POST /login/login
  → LoginAction.login()
    → UserService.findByUserId(userId)             ← USER_MST lookup
    → EncryptUtil.encrypt(password) [AES-128 ECB]  ← so sánh với DB
    → if FAIL_COUNT >= MINE_MST.TOTAL_FAIL_COUNT   → account locked
    → if PASSWORD_UPD_DATETM + PASSWORD_VALID_DAYS < NOW() → redirect đổi PW
    → Session.setAttribute("userDto", userDto)
    → UPDATE USER_MST SET FAIL_COUNT=0, LAST_LOGIN_DATETM=NOW()
    → Redirect /menu/index
```

**Evidence**: `LEGACY_CONFIRMED` — `action/LoginAction.java:98-130`

### 2.2 Session check (AOP)

```
AbstractLoginCheckInterceptor.invoke()
  → kiểm tra session.getAttribute("userDto") != null
  → nếu null → redirect /login/index
  → áp dụng cho MỌI Action request
```

**Evidence**: `LEGACY_CONFIRMED` — `interceptor/AbstractLoginCheckInterceptor.java:1-120`

### 2.3 Password encryption

- Thuật toán: **AES-128 ECB**
- Key cố định: `"jp.co.arkinfosys"` (16 bytes)
- Không có salt — **đây là rủi ro bảo mật** (`LEGACY_CONFIRMED`)

**Evidence**: `LEGACY_CONFIRMED` — `common/EncryptUtil.java:20-50`

### 2.4 SSO (External login)

- External system gửi `userId` + `password` qua URL params
- `LoginAction` check params trước form submit
- Không có OAuth/SAML/LDAP

**Evidence**: `LEGACY_CONFIRMED` — `action/LoginAction.java:98-101`

### 2.5 Password policy (MINE_MST)

| Field | Ý nghĩa |
|-------|---------|
| `TOTAL_FAIL_COUNT` | Số lần sai tối đa trước khi lock |
| `PASSWORD_VALID_DAYS` | Số ngày password còn hiệu lực |

**Evidence**: `LEGACY_CONFIRMED` — `DB/sql/createtable/CREATE.sql:1-91` (MINE_MST schema)

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
| V1 | `userId` required, non-empty | `LoginAction.validate()` | `LEGACY_CONFIRMED` |
| V2 | `password` required, non-empty | `LoginAction.validate()` | `LEGACY_CONFIRMED` |
| V3 | User phải tồn tại (`DEL_DATETM IS NULL`) | `UserService.findByUserId()` | `LEGACY_CONFIRMED` |
| V4 | Password (sau encrypt) phải khớp `USER_MST.PASSWORD` | `LoginAction.login():105-115` | `LEGACY_CONFIRMED` |
| V5 | `FAIL_COUNT < MINE_MST.TOTAL_FAIL_COUNT` | `LoginAction.login():120` | `LEGACY_CONFIRMED` |
| V6 | `PASSWORD_UPD_DATETM + VALID_DAYS >= NOW()` | `LoginAction.login():125` | `LEGACY_CONFIRMED` |

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
| User không tồn tại | 401 | `UnauthorizedException` | `errors.login.notMatch` |
| Password sai | 401 | `UnauthorizedException` | `errors.login.notMatch` |
| Account locked | 403 | `ForbiddenException` | `errors.login.lock` |
| Password expired | 403 | `ForbiddenException` | redirect info |
| Session timeout | — | JWT expiry → 401 | — |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 8. Transaction Boundaries

| Operation | Legacy | Target |
|-----------|--------|--------|
| Login success | Auto-commit: UPDATE USER_MST (FAIL_COUNT=0, LAST_LOGIN_DATETM) | `prisma.$transaction([updateFailCount, updateLastLogin])` |
| Login fail | Auto-commit: UPDATE USER_MST (FAIL_COUNT++) | `prisma.user.update({ failCount: { increment: 1 } })` |

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
| OQ-AUTH-01 | Password migration: AES-128 ECB → bcrypt? Có thể force reset all passwords? | HIGH | `UNKNOWN` |
| OQ-AUTH-02 | SSO integration: external system có API key không? Hay vẫn dùng userId/password? | MEDIUM | `UNKNOWN` |
| OQ-AUTH-03 | Refresh token strategy: DB blacklist hay token rotation? | MEDIUM | `TARGET_DECISION` cần confirm |
| OQ-AUTH-04 | Admin reset account locked: có màn hình riêng không? | LOW | `UNKNOWN` |
