# 06 – Authentication & Authorization Analysis

> **Trạng thái**: Xác nhận từ source code  
> **Nguồn**: `LoginAction.java`, `AbstractLoginCheckInterceptor.java`, `EncryptUtil.java`, `ROLE_MST.sql`, `GRANT_ROLE.sql`

---

## 1. Authentication Flow

### 1.1. Entry Point

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:76-116`

URL: `GET /login/{domainId}` → `LoginAction.index()`
1. Validate `domainId` từ URL path parameter
2. Lookup `DOMAIN_MST` bằng `DomainService.findById(domainId)`
3. Nếu không tìm thấy domain → lỗi `errors.missing.domain`
4. Nếu có `userId` và `password` trong request (SSO flow) → gọi `login()` trực tiếp

### 1.2. Login Processing

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:124-248`

URL: `POST /login/login` → `LoginAction.login()`

**Sequence**:
```
1. Validate domainId exists in session
2. Lấy totalFailCount từ MINE_MST (số lần nhập sai tối đa)
3. Lookup user từ USER_MST bằng userId
   - Không tìm thấy → lỗi "errors.invalid.login"
4. Check lockflg = "1" → lỗi lock account
5. Encrypt password: encryptedPassword = EncryptUtil.encrypt(loginForm.password)
6. So sánh với user.password trong DB
   - Không khớp:
     a. Tăng failCount
     b. Nếu failCount >= totalFailCount → set lockflg = "1"
     c. Update USER_MST (failCount, lockflg)
     d. Return lỗi
   - Khớp:
     a. Reset failCount = 0, lockflg = "0"
     b. Copy user → UserDto (session)
     c. Load menu list theo userId
     d. Set file access permissions
     e. Load MINE_MST → MineDto (session)
     f. Check password expiry → nếu expired → redirect /setting/changePassword
     g. Redirect → /menu
```

---

## 2. Password Encryption

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/common/EncryptUtil.java:20-128`

**Configurable** từ `appconfig.dicon:26-30`:
- Mặc định: **AES-128**
- Option: **MD5**

### AES-128 Implementation

```java
// Key: "jp.co.arkinfosys" (hard-coded, 16 bytes = 128-bit)
private static final String DEFAULT_PRIVATE_KEY = "jp.co.arkinfosys";

// Key generation: copy password bytes into key buffer (max 16 chars)
byte[] keySrc = DEFAULT_PRIVATE_KEY.getBytes();  // 16 bytes
byte[] userKeySrc = encSrc.getBytes();           // password bytes
System.arraycopy(userKeySrc, 0, keySrc, 0, Math.min(16, userKeySrc.length));

// Encryption: AES/ECB/PKCS5Padding (default Java)
Key key = new SecretKeySpec(keySrc, "AES");
Cipher cipher = Cipher.getInstance("AES");
cipher.init(Cipher.ENCRYPT_MODE, key);
byte[] encrypted = cipher.doFinal(encSrc.getBytes());
return asHex(encrypted);
```

**⚠️ SECURITY RISKS**:
1. **Hard-coded AES key** `jp.co.arkinfosys` (line 26) – bất kỳ ai đọc code đều biết key
2. **ECB mode** – không có IV, giống nhau input → giống nhau output
3. **Key derivation weak** – password overwrite vào key buffer → ≤16 chars password dùng làm key
4. **AES ECB không phải hashing** – có thể decrypt ngược lại mật khẩu
5. **MD5 option** – MD5 không có salt, dễ bị rainbow table attack

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/common/EncryptUtil.java:76-89`

---

## 3. Session Management

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/CommonResources.java:29-61`

3 objects trong HTTP Session (S2 session-scoped beans):

| Bean | Class | Nội dung |
|------|-------|----------|
| `domainDto` | `DomainDto` | domainId, domain name |
| `userDto` | `UserDto` | userId, userName, menuList, fileOpenLevel, lastRequestFunc |
| `mineDto` | `MineDto` | company settings, password policy, decimal format |

**Session timeout**: 60 phút (`web.xml:138-140`)

**SessionListener** registered: `jp.co.arkinfosys.common.SessionListener` (`web.xml:148-150`)

---

## 4. Login Check (Authorization Interceptor)

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/interceptor/AbstractLoginCheckInterceptor.java:74-94`

**AOP-based**: Intercept mọi `@Execute` method trong Action classes:

```java
public Object invoke(MethodInvocation invocation) throws Throwable {
    if (!this.isLogin()) {
        this.doAfterError(invocation);
        return this.getErrorURIString();  // Redirect → /login
    }
    this.recordRequestFunc(invocation);  // Log last accessed function
    this.logBeforeInvoke(invocation);
    Object result = invocation.proceed();
    this.logBeforeInvoke(invocation);    // Bug: gọi Before thay vì After
    return result;
}

protected boolean isLogin() {
    return userDto != null && userDto.userId != null;
}
```

**⚠️ BUG**: `logBeforeInvoke` được gọi 2 lần (line 91) thay vì gọi `logAfterInvoke`.

---

## 5. Authorization (RBAC)

### 5.1. Role System

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/ROLE_MST.sql`

**80+ roles** được định nghĩa, mỗi role tương ứng một menu/function:

| Role ID | Tên | Loại |
|---------|-----|------|
| 001-023 | Quyền đọc (参照) | Read-only |
| 024-079 | Quyền ghi (入力/処理) | Read-Write |
| F01 | File tham khảo (1 phần) | Special |
| F02 | File tham khảo (đầy đủ) | Special |
| 080 | Xem đơn giá | Special |

**Pattern**: Mỗi menu item có 2 roles: một read-only và một full-access.

### 5.2. Role Assignment

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/GRANT_ROLE.sql` (11KB)

Bảng `GRANT_ROLE_XXXXX` liên kết USER → ROLE → MENU.

### 5.3. Menu-based Authorization

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:211-226`

```java
List<MenuJoin> menuJoinList = menuService.findMenuByUserId(loginForm.userId);
userDto.menuDtoList = menuService.convertMenuJoinToDto(menuJoinList);

for (MenuJoin menuJoin : menuJoinList) {
    if (Constants.MENU_ID.REFERENCE_FILES.equals(menuJoin.menuId)) {
        userDto.fileOpenLevel = menuJoin.validFlag;  // File access level
    }
    if (Constants.MENU_ID.MASTER_PRODUCT_UPDWN.equals(menuJoin.menuId)) {
        userDto.validUpDwnProducts = true;  // Product Excel upload permission
    }
}
```

**Cơ chế**: Menu được gán cho user tại login, lưu trong session. UI ẩn/hiện menu items dựa trên `userDto.menuDtoList`.

**⚠️ INFERRED**: Chưa xác nhận có server-side authorization check per-request hay không (ngoài login check). Cần kiểm tra `ActionMethodInvocationInterceptor.java`.

---

## 6. Account Lockout Policy

**Cấu hình**: `MINE_MST.TOTAL_FAIL_COUNT` – số lần nhập sai tối đa

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:136-200`

```
Nếu TOTAL_FAIL_COUNT = 5:
- Lần 1-4: thông báo "còn N lần"
- Lần 5: lockflg = "1" → tài khoản bị khóa
- Unlock: cần admin reset thủ công trong USER_MST
```

---

## 7. Password Policy

Từ `MINE_MST` schema (`CREATE.sql:63-78`):

| Column | Mô tả |
|--------|-------|
| `PASSWORD_VALID_DAYS` | Số ngày hiệu lực mật khẩu |
| `PASSWORD_HIST_COUNT` | Số lịch sử mật khẩu lưu (không dùng lại) |
| `PASSWORD_LENGTH` | Độ dài tối thiểu |
| `PASSWORD_CHAR_TYPE` | Loại ký tự yêu cầu |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/createtable/CREATE.sql:63-78`

---

## 8. SSO Support

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:98-101`

```java
// SSO用修正 (SSO修正)
if (StringUtil.hasLength(this.loginForm.userId) && StringUtil.hasLength(this.loginForm.password)) {
    return login();
}
```

**Inferred**: Hỗ trợ SSO bằng cách truyền userId/password qua URL parameters từ external system. **⚠️ Credentials trong URL là security risk nghiêm trọng**.

---

## 9. Security Summary

| Aspect | Status | Chi tiết |
|--------|--------|---------|
| Password hashing | ❌ WEAK | AES-128 ECB với hard-coded key |
| Session management | ✅ OK | Server-side session, 60 min timeout |
| CSRF protection | ❓ UNKNOWN | Không tìm thấy CSRF token |
| SQL injection | ✅ OK | S2JDBC với named queries |
| XSS protection | ❓ UNKNOWN | Cần xem JSP templates |
| HTTPS | ❓ UNKNOWN | Không có config trong source |
| Account lockout | ✅ OK | Configurable fail count |
| Password expiry | ✅ OK | Configurable days |
| Audit logging | ✅ OK | `_HIST` tables + Log4j |
| SSO credentials in URL | ❌ RISK | Password có thể xuất hiện trong access log |
