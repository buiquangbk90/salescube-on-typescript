# 10 – Risks, Unknowns & Priority Inspection List

> **Trạng thái**: Xác nhận từ source code + suy luận (được đánh dấu rõ)  
> **Nguồn**: Toàn bộ codebase đã phân tích

---

## 1. Security Risks (Xác nhận từ code)

### 🔴 CRITICAL

#### R-001: Hard-coded AES Key
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/common/EncryptUtil.java:26`

```java
private static final String DEFAULT_PRIVATE_KEY = "jp.co.arkinfosys";
```

- Bất kỳ ai đọc source code đều biết key AES
- **Nguy cơ**: Decrypt toàn bộ mật khẩu trong DB nếu có access vào DB
- AES/ECB không có IV → same password = same ciphertext → dễ identify duplicate passwords
- **Không phải hashing** → reversible encryption

#### R-002: Hard-coded Database Credentials
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/jdbc.dicon:120-123`

```xml
<arg>"salescube"</arg>  <!-- username -->
<arg>"salescube"</arg>  <!-- password -->
```

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/CallProc.sh:12`

```bash
/usr/bin/mysql salesweb -u salesweb --password=salesweb
```

- DB credentials hard-coded trong source code
- Batch script dùng user `salesweb` (khác với app user `salescube`) – hai sets credentials
- Credentials có thể lộ qua git history

#### R-003: SSO Credentials trong URL
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:98-101`

```java
if (StringUtil.hasLength(this.loginForm.userId) && StringUtil.hasLength(this.loginForm.password)) {
    return login();  // SSO: credentials passed via request params
}
```

- Password có thể xuất hiện trong access log của web server
- Credentials trong browser history nếu dùng GET

### 🟠 HIGH

#### R-004: demoFlag = "true" trong Production Config
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/appconfig.dicon:31-35`

```xml
<arg>"demoFlag"</arg>
<arg>"true"</arg>
```

- **Nguy cơ**: Demo mode có thể bỏ qua một số validations hoặc cho phép bypass security
- Cần xác minh `demoFlag` được sử dụng như thế nào trong code

#### R-005: MD5 Password Option
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/common/EncryptUtil.java:83-96`

- MD5 không có salt
- Rainbow table attack dễ dàng
- MD5 đã bị coi là unsafe từ 2004

#### R-006: CSRF Protection Không Xác Nhận
- Không tìm thấy CSRF token trong source code đã đọc
- **Inferred**: Struts 1.2 + SAStruts không có built-in CSRF protection
- Tất cả state-changing operations có thể bị CSRF attack

#### R-007: XSS Protection Không Xác Nhận
- Chưa xem JSP templates – không thể xác nhận có escape output hay không
- Struts 1.2 `<html:text>` tags có escaping mặc định, nhưng cần verify

### 🟡 MEDIUM

#### R-008: Session Fixation
- Không thấy session regeneration sau login trong `LoginAction.java`
- **Inferred**: Session ID có thể bị fixated

#### R-009: Không có HTTPS Enforcement
- Không có `web.xml` HTTPS redirect config
- Không có `security-constraint` cho transport-guarantee

#### R-010: File Upload Path Trống
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/appconfig.dicon:14-18`

```xml
<arg>"FileUploadDirPath"</arg>
<arg>""</arg>  <!-- EMPTY! -->
```

- Upload path chưa được cấu hình
- **Nguy cơ**: File upload có thể ghi vào thư mục web root hoặc fail

---

## 2. Code Quality Issues

### Bug đã xác nhận

#### B-001: Double Logging trong Interceptor
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/interceptor/AbstractLoginCheckInterceptor.java:87-91`

```java
this.logBeforeInvoke(invocation);
Object result = invocation.proceed();
this.logBeforeInvoke(invocation);  // BUG: nên là logAfterInvoke
return result;
```

- `logBeforeInvoke` được gọi 2 lần (trước và sau invoke)
- `logAfterInvoke` (nếu tồn tại) không bao giờ được gọi

#### B-002: Batch User Inconsistency
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/CallProc.sh:12`

- App kết nối bằng user `salescube`, password `salescube`
- Batch script kết nối bằng user `salesweb`, password `salesweb`
- Có thể là thiết kế intentional (separate permissions) nhưng tạo confusion

---

## 3. Dead Code (Inferred – cần xác minh)

#### D-001: ROLE '066' đã bị comment
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/ROLE_MST.sql:64`

```sql
-- INSERT INTO ROLE_MST_XXXXX ... VALUES ('066','スケジュール',...)
```

- Role "Schedule" (スケジュール) bị comment out
- Tính năng scheduling chưa bao giờ implement hoặc đã bị remove

#### D-002: Nhiều DB Drivers Comment-out
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/jdbc.dicon:1-117`

- HSQLDB, H2, Oracle, DB2, PostgreSQL configs đều bị comment
- Chỉ MySQL được activate
- Comment-out code có thể được enable nhầm nếu ai đó "uncomment"

#### D-003: BillOldService
**File**: `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/BillOldService.java` (2KB)

- Tên "Old" gợi ý đây là code cũ không còn dùng
- **Inferred**: Có thể là dead code

---

## 4. Hard-coded Values

| Location | Value | Risk |
|----------|-------|------|
| `EncryptUtil.java:26` | AES key `jp.co.arkinfosys` | CRITICAL |
| `jdbc.dicon:120-123` | DB credentials `salescube/salescube` | HIGH |
| `CallProc.sh:12` | DB credentials `salesweb/salesweb` | HIGH |
| `CallProc.sh:3` | DOMAIN `SALES` | MEDIUM |
| `appconfig.dicon:11` | Search limit `100` | LOW |
| `struts-config.xml:38` | Max upload `20971520` (20MB) | LOW |
| `web.xml:139` | Session timeout `60` minutes | LOW |

---

## 5. Architectural Risks

#### A-001: Monolith với 70KB+ Service Files
- `SalesService.java` (71KB), `ProductService.java` (54KB), `EadService.java` (40KB)
- Quá lớn, vi phạm Single Responsibility Principle
- Khó test, khó maintain

#### A-002: 581 SQL Files – Rủi ro Inconsistency
- 581 named SQL files không có migration framework
- Không có version control cho schema changes (ngoài CREATE.sql ban đầu)
- **Inferred**: Schema drift giữa environments có thể xảy ra

#### A-003: Closing Operations trong Web Request
- `CloseBillAction`, `CloseStockAction`, `ClosePaymentAction` chạy trong HTTP request
- Nếu data lớn → HTTP timeout → partial commit
- Không có retry mechanism
- **Nguy cơ**: Data inconsistency sau failed closing

#### A-004: Multi-tenant bằng sed Replacement
- `sed -e s/XXXXX/$DOMAIN/` trong shell script
- Không phải multi-tenant thực sự (shared schema, not schema-per-tenant)
- Nếu DOMAIN có ký tự đặc biệt → sed failure
- Batch hard-code `DOMAIN=SALES` – không đa tenant

#### A-005: Không có Connection Pool Monitoring
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/jdbc.dicon:134-168`

- Max pool: 10 connections
- Không có health check, no timeout on checkout
- Production với nhiều concurrent users có thể bị connection exhaustion

---

## 6. Unknowns (Cần Xác minh Thêm)

| Unknown | File cần đọc | Priority |
|---------|-------------|----------|
| CSRF protection có hay không | `WEB-INF/view/*.jsp`, custom tags | HIGH |
| `demoFlag` được dùng ở đâu | Grep `demoFlag` trong action classes | HIGH |
| Authorization server-side check | `customizer.dicon`, `ActionMethodInvocationInterceptor.java` | HIGH |
| Exact bank file format supported | `ImportBankDepositAction.java` | MEDIUM |
| EC platform tích hợp (tên) | `ImportOnlineOrderAction.java`, `ONLINE_ORDER_WORK` DDL | MEDIUM |
| Cron schedule thực tế | Server configuration (ngoài scope source) | MEDIUM |
| SP_UPDATE_STDDEV_WORK được gọi khi nào | Tìm trong batch scripts | MEDIUM |
| Session fixation protection | `LoginAction.java:200-230` | HIGH |
| XSS output escaping | JSP templates | HIGH |
| `BillOldService.java` có được reference không | Grep toàn codebase | LOW |

---

## 7. Duplicated Logic (Inferred)

#### DUP-001: Customer/Delivery Info Denormalization
- Thông tin KH được sao chép vào `SALES_SLIP_TRN`, `RO_SLIP_TRN`, `ESTIMATE_SHEET_TRN`
- Pattern: snapshot tại thời điểm tạo phiếu (intentional denormalization)
- Nhưng update logic có thể bị duplicate ở nhiều Service classes

#### DUP-002: Audit Fields
- `CRE_FUNC`, `UPD_FUNC`, etc. được set thủ công trong mỗi Service
- Không có AOP-based audit mechanism
- Có thể bị quên set trong một số code paths

#### DUP-003: SEQ_MAKER Pattern
- `SeqMakerService.getNextSeqId()` được gọi trước mỗi INSERT
- Pattern này duplicate trong ~20 services
- Race condition possible nếu không có row-level lock trong `SEQ_MAKER`

---

## 8. Priority List: 10 Files/Modules Quan trọng Nhất

| # | File/Module | Lý do |
|---|-------------|-------|
| 1 | `service/SalesService.java` (71KB) | Toàn bộ nghiệp vụ bán hàng – core của hệ thống |
| 2 | `service/ProductService.java` (54KB) | Quản lý sản phẩm – liên kết với mọi flow |
| 3 | `service/stock/EadService.java` (40KB) | Kho ủy thác – complex inventory logic |
| 4 | `DB/batch/sp/SP_UPDATE_CUSTOMER_RANK_SALES.sql` (91KB) | Stored proc lớn nhất – business critical |
| 5 | `DB/batch/sp/SP_UPDATE_PRODUCT_STOCK_VALUES_SALES.sql` (78KB) | Stock calculation – safety stock logic |
| 6 | `action/sales/InputSalesAction.java` (40KB) | Controller phức tạp nhất – nhiều business rules |
| 7 | `service/BillService.java` (30KB) | Closing/invoicing – financial critical |
| 8 | `service/DepositSlipService.java` (32KB) | Thu tiền – liên kết bank + delivery |
| 9 | `customizer.dicon` | AOP interceptor config – ảnh hưởng authorization |
| 10 | `WEB-INF/view/sales/inputSales.jsp` | JSP phức tạp nhất – kiểm tra XSS |

---

## 9. Migration Risks (cho TypeScript rewrite)

| Risk | Mô tả | Severity |
|------|-------|---------|
| Business logic trong stored procedures | 312KB+ SQL stored procedure code chứa business rules | CRITICAL |
| `_HIST` audit pattern | Cần replicate đầy đủ audit trail | HIGH |
| 581 named SQL queries | Cần map sang ORM queries | HIGH |
| `SEQ_MAKER` custom sequence | MySQL AUTO_INCREMENT hoặc UUID cần xem xét | MEDIUM |
| Multi-tenant `_XXXXX` suffix | Thiết kế lại multi-tenancy | HIGH |
| `demoFlag` behavior | Cần xác định và replicate | MEDIUM |
| JasperReport templates | Cần tool report khác (PDF generation) | MEDIUM |
| Excel import/export | Cần library tương đương | MEDIUM |
