# WF-01 – Đăng nhập & Xác thực (Login & Authentication)

**Confidence**: HIGH – Xác nhận từ source code trực tiếp  
**Loại**: Web workflow (HTTP POST)

---

## Entry Route
```
GET  /login/index     → Hiển thị trang login
POST /login/login     → Xử lý đăng nhập
POST /login/logout    → Đăng xuất
```

## User Role
- Không yêu cầu role (public endpoint)
- Sau login: role lấy từ `GRANT_ROLE` theo `USER_ID`

---

## Main Code Path

```
Browser POST /login/login
  → LoginAction.login()
    → UserService.findByUserId(userId)
    → EncryptUtil.encrypt(password) [AES-128 ECB]
    → So sánh với USER_MST.PASSWORD
    → Kiểm tra FAIL_COUNT >= MINE_MST.TOTAL_FAIL_COUNT → lock
    → Kiểm tra PASSWORD_UPD_DATETM + PASSWORD_VALID_DAYS → expired
    → Session.setAttribute("userDto", userDto)
    → Redirect → /menu/index
  → AbstractLoginCheckInterceptor.invoke() [AOP]
    → Mọi request sau đó đều check session.userDto != null
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `LoginAction` | Entry point, session setup |
| Interceptor | `AbstractLoginCheckInterceptor` | AOP session check cho tất cả actions |
| Service | `UserService` | Lookup user, cập nhật fail count |
| Utility | `EncryptUtil` | AES-128 ECB encryption |
| Entity | `User` (USER_MST) | User record |
| Entity | `Mine` (MINE_MST) | Password policy settings |
| DTO | `UserDto` | Session object |

---

## Database Tables

**READ**:
- `USER_MST` – `USER_ID`, `PASSWORD`, `FAIL_COUNT`, `LAST_LOGIN_DATETM`, `PASSWORD_UPD_DATETM`, `DEL_DATETM`
- `MINE_MST` – `TOTAL_FAIL_COUNT`, `PASSWORD_VALID_DAYS`
- `GRANT_ROLE` – roles của user
- `MENU_MST` – menu items user được phép

**WRITE**:
- `USER_MST.FAIL_COUNT` – tăng khi sai password
- `USER_MST.LAST_LOGIN_DATETM` – cập nhật khi login thành công
- `USER_MST.FAIL_COUNT = 0` – reset khi login thành công

---

## Validation Rules

1. `USER_ID` không được rỗng
2. `PASSWORD` không được rỗng
3. User phải tồn tại trong `USER_MST` (DEL_DATETM IS NULL)
4. Password sau encrypt phải khớp `USER_MST.PASSWORD`
5. `FAIL_COUNT < MINE_MST.TOTAL_FAIL_COUNT` → nếu vượt: account bị khóa
6. `PASSWORD_UPD_DATETM + PASSWORD_VALID_DAYS >= NOW()` → nếu hết hạn: redirect đổi mật khẩu
7. SSO: nếu `userId` và `password` có trong request params → auto-login (bỏ qua form)

---

## Status Transitions

```
[User chưa đăng nhập]
    │ POST /login/login (valid credentials)
    ▼
[Session active] ──→ redirect /menu/index
    │ POST /login/logout
    ▼
[Session invalidated]

[FAIL_COUNT >= MAX]
    ▼
[Account locked] → Chỉ admin reset được
```

---

## External Integrations

- **SSO (Single Sign-On)**: Nhận `userId` + `password` qua URL params (GET/POST) từ external system
  - `Evidence`: `LoginAction.java:98-101` – check `this.loginForm.userId` và `this.loginForm.password` từ request
- **Không có OAuth/SAML/LDAP** – xác thực hoàn toàn trong-house

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| User không tồn tại | Hiển thị "errors.login.notMatch" |
| Password sai | Tăng `FAIL_COUNT`, hiển thị "errors.login.notMatch" |
| Account bị lock | Hiển thị "errors.login.lock" |
| Password hết hạn | Redirect sang màn hình đổi mật khẩu |
| Session timeout | AOP interceptor redirect về `/login/index` |
| ServiceException | Log + hiển thị "errors.system" |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/LoginAction.java` | 1-50 | Class declaration, imports, services |
| `action/LoginAction.java` | 98-130 | SSO check + login() method |
| `interceptor/AbstractLoginCheckInterceptor.java` | 1-120 | AOP session check |
| `common/EncryptUtil.java` | 20-50 | AES-128 ECB `DEFAULT_PRIVATE_KEY = "jp.co.arkinfosys"` |
| `DB/sql/createtable/CREATE.sql` | 1-91 | MINE_MST schema (password policy) |
| `DB/sql/insertmaster/USER_MST.sql` | all | Initial user data |
