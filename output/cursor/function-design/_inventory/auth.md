# Function Inventory: AUTH (Login & Authentication)

> **Nguồn:** [07-screen-route-mapping.md](../07-screen-route-mapping.md), [02-module-inventory.md](../02-module-inventory.md), [WF-01](../workflows/WF-01-login-auth.md), [06-auth-permission-analysis.md](../06-auth-permission-analysis.md)

| Legacy Action | Method (typical) | Legacy URL | JSP | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|-----|---------------|------|-------------|--------|
| `LoginAction` | `index()` | `GET /login/{domainId}` | `login/login.jsp` | `DomainService.findById` | SCREEN_ENTRY | FD-AUTH-01 § login form | LEGACY_CONFIRMED |
| `LoginAction` | `login()` | `POST /login/login` | redirect | `UserService`, `MenuService`, `MineService` | AUTH | FD-AUTH-01 § login | LEGACY_CONFIRMED |
| `LoginAction` | SSO branch | `GET /login/{domainId}?userId&password` | redirect | same as login | AUTH | FD-AUTH-01 § SSO | LEGACY_CONFIRMED |
| `LogoutAction` | `index()` | `POST /logout` | redirect | session invalidate | AUTH | FD-AUTH-01 § logout | INFERRED |
| `AbstractLoginCheckInterceptor` | `invoke()` | (AOP all `@Execute`) | redirect login | session check | AUTH_GUARD | FD-AUTH-01 § guard | LEGACY_CONFIRMED |
| `MenuAction` | `index()` | `GET /menu` | `menu.jsp` | — | POST_LOGIN | Out of FD-AUTH-01 | — |

**Lưu ý:** WF-01 ghi `/login/index` — RE xác nhận pattern `GET /login/{domainId}` (`06-auth-permission-analysis.md` §1.1). Domain lookup qua `DOMAIN_MST` — **UNKNOWN** có migrate multi-tenant domain hay không.

**Không thuộc AUTH:** `ChangePasswordAction` → FD-SETTING-01 (đổi mật khẩu sau expiry hoặc user tự đổi).
