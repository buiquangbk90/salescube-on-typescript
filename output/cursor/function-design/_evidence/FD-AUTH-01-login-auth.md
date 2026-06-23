# Evidence: FD-AUTH-01 Login & Authentication

## Sources

| Type | Source | Relevance |
|------|--------|-----------|
| Workflow | [WF-01-login-auth.md](../workflows/WF-01-login-auth.md) | Business rules, DB R/W |
| WF evidence | [WF-01 evidence](../workflows/_evidence/WF-01-login-auth.md) | RE cross-ref |
| Auth deep-dive | [06-auth-permission-analysis.md](../06-auth-permission-analysis.md) | Login sequence, encryption, session |
| Screen/route | [07-screen-route-mapping.md](../07-screen-route-mapping.md) §3.1 | Login routes |
| Routes | [03-route-api-inventory.md](../03-route-api-inventory.md) §Public | `/login`, `/logout` |
| Module | [02-module-inventory.md](../02-module-inventory.md) | `LoginAction`, interceptors |
| Risks | [10-risks-unknowns.md](../10-risks-unknowns.md) | AES key, SSO URL |
| Target schema | `docs/spec/04-migration-map.md` | `USER_MST` → `User` |

## Extracted Evidence

| Category | Finding | Provenance | Evidence Anchor |
|----------|---------|------------|-----------------|
| Route login form | `GET /login/{domainId}` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:12-18`, `07-screen-route-mapping.md:54` |
| Route login POST | `POST /login/login` | LEGACY_CONFIRMED | `03-route-api-inventory.md:27`, WF-01 |
| Route logout | `POST /logout` | INFERRED | `03-route-api-inventory.md:28` |
| Password encrypt | AES-128 ECB, key `jp.co.arkinfosys` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:54-76`, `EncryptUtil.java:26` |
| Lock policy | `FAIL_COUNT` + `lockflg`, max `MINE_MST.TOTAL_FAIL_COUNT` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:29-38`, `LoginAction.java:136-200` |
| Password expiry | `PASSWORD_UPD_DATETM + PASSWORD_VALID_DAYS` → redirect change PW | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:46`, WF-01 |
| Session objects | `userDto`, `domainDto`, `mineDto` in HTTP session | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:92-104` |
| Login guard | AOP `AbstractLoginCheckInterceptor` — `userDto.userId != null` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:110-130` |
| Menu load on login | `menuService.findMenuByUserId` → session | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:162-176` |
| SSO | userId+password in request params → auto `login()` | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:214-224`, WF-01 |
| DB read login | `USER_MST`, `MINE_MST`, `GRANT_ROLE`, `MENU_MST` | LEGACY_CONFIRMED | WF-01 § Database |
| DB write login | Update `FAIL_COUNT`, `lockflg`, `LAST_LOGIN_DATETM` | LEGACY_CONFIRMED | WF-01, `06-auth-permission-analysis.md` |
| Session timeout | 60 phút | LEGACY_CONFIRMED | `06-auth-permission-analysis.md:102`, `web.xml` cited |
| CSRF | Không thấy token | UNKNOWN | `06-auth-permission-analysis.md:235` |

## Gaps

- Java source path cited trong RE (`SalesCube/WEB/...`) — **MEDIUM confidence** khi không spot-check trong workspace hiện tại
- `DOMAIN_MST` multi-tenant login — có migrate hay single-tenant target?
- Per-request server-side menu check ngoài login — INFERRED, chưa verify toàn bộ Action
