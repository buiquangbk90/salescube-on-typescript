# 01 – Architecture Overview

> **Trạng thái**: Xác nhận từ source code  
> **Nguồn chính**: `SalesCube/WEB/SalesCube/src/main/`

---

## 1. Tổng quan hệ thống

SalesCube là hệ thống quản lý bán hàng (販売管理システム) dạng monolith web application, được phát triển bởi **Ark Information Systems**. Hệ thống quản lý toàn bộ vòng đời giao dịch thương mại từ báo giá → nhận đơn → bán hàng → xuất kho → lập hóa đơn → thu tiền → thanh toán.

---

## 2. Technology Stack (Xác nhận từ code)

| Layer | Technology | Bằng chứng |
|-------|-----------|------------|
| **Web Framework** | Apache Struts 1.2 | `SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/struts-config.xml:3` |
| **DI Container** | Seasar2 (S2 Framework) | `web.xml:44-46` – `S2ContainerFilter`, `S2ContainerServlet` |
| **ORM** | S2JDBC | `src/main/resources/s2jdbc.dicon` |
| **Routing** | SAStruts `RoutingFilter` | `web.xml:49-54` – Convention-over-configuration |
| **Database** | MySQL 5.x | `jdbc.dicon:118-129` – `com.mysql.jdbc.Driver` |
| **Report Engine** | JasperReports | `src/main/resources/jasperreports_extension.properties` |
| **Logging** | Log4j | `src/main/resources/log4j.properties` |
| **Build** | Maven (inferred) | Standard `src/main/java` layout |
| **View** | JSP + Struts tags | `WEB-INF/view/` – 212 JSP files |
| **Encoding** | UTF-8 everywhere | `web.xml:30-36` – `EncodingFilter` |

---

## 3. Kiến trúc tổng thể

```
Browser (HTTP)
    │
    ▼
[EncodingFilter] → UTF-8
[HotdeployFilter] → S2 hot reload (dev mode)
[S2ContainerFilter] → DI injection
[RoutingFilter] → URL → Action class mapping
    │
    ▼
Apache Struts ActionServlet (*.do)
    │
    ▼
SAStruts Convention Routing
  /login → LoginAction.index()
  /menu  → MenuAction.index()
  /sales/inputSales → sales/InputSalesAction.index()
  ...
    │
    ▼
Action Class (extends CommonResources)
  ├── @ActionForm injected (form binding)
  ├── @Resource injected Services (S2 DI)
  ├── @Execute annotated methods (action handlers)
  └── Returns String → JSP path
    │
    ▼
Service Layer (jp.co.arkinfosys.service.*)
  └── S2JDBC → MySQL
    │
    ▼
JSP Views (WEB-INF/view/**/*.jsp)
```

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/web.xml:29-98`

---

## 4. Cấu trúc Package Java

```
jp.co.arkinfosys/
├── action/           230 files – Action classes (controllers)
│   ├── ajax/         105 files – AJAX handlers
│   ├── bill/         7 files   – Billing
│   ├── deposit/      6 files   – Payment receipt
│   ├── estimate/     6 files   – Quotation
│   ├── master/       34 files  – Master data CRUD
│   ├── payment/      5 files   – Supplier payment
│   ├── porder/       7 files   – Purchase order
│   ├── purchase/     4 files   – Purchase (仕入)
│   ├── report/       4 files   – Reports
│   ├── rorder/       5 files   – Receive order (受注)
│   ├── sales/        9 files   – Sales slip
│   ├── setting/      14 files  – System settings
│   └── stock/        13 files  – Inventory
├── common/           21 files  – Utilities
├── dto/              106 files – Data Transfer Objects
├── entity/           701 files – S2JDBC entities + SQL files
│   └── sql/          581 files – Named SQL queries
├── form/             159 files – ActionForms
├── interceptor/      4 files   – AOP interceptors
├── s2extend/         4 files   – S2 customizations
├── service/          124 files – Business logic
│   ├── deposit/      4 files
│   ├── payment/      5 files
│   ├── porder/       7 files
│   ├── purchase/     2 files
│   ├── report/       4 files
│   ├── rorder/       2 files
│   ├── sales/        4 files
│   └── stock/        16 files
└── taglib/           2 files   – Custom JSP tags
```

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/`

---

## 5. Database Architecture

- **RDBMS**: MySQL 5.x, InnoDB engine
- **Schema**: `salescube` (hard-coded trong jdbc.dicon)
- **Multi-tenant pattern**: Tên bảng có suffix `_XXXXX` được thay thế bằng DOMAIN ID tại runtime
  - Ví dụ: `SALES_SLIP_TRN_XXXXX` → `SALES_SLIP_TRN_SALES` (khi domain = `SALES`)
  - **File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/CallProc.sh:12`
- **Audit trail**: Mỗi bảng nghiệp vụ có bảng `_HIST` tương ứng (pattern nhất quán)
- **Sequence**: Bảng `SEQ_MAKER_XXXXX` + `SEQ_MAKER_HIST_XXXXX` thay thế auto-increment

---

## 6. Session Management

Session được quản lý qua 3 DTO trong S2 container:
- `DomainDto` – thông tin domain/tenant hiện tại
- `UserDto` – thông tin user đã đăng nhập + menu quyền + `lastRequestFunc`
- `MineDto` – cấu hình công ty (tự sở), bao gồm định dạng số, chính sách mật khẩu

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/CommonResources.java:29-61`

Session timeout: **60 phút** (`web.xml:138-140`)

---

## 7. Configuration Files

| File | Mục đích |
|------|----------|
| `web.xml` | Servlet, filter chain, session config |
| `struts-config.xml` | Struts global config, max upload 20MB |
| `jdbc.dicon` | JDBC connection (MySQL localhost:3306/salescube) |
| `appconfig.dicon` | App config: search limit=100, upload path, CSV columns, password encrypt style |
| `s2jdbc.dicon` | ORM configuration |
| `log4j.properties` | Logging config |
| `application.properties` | i18n messages (English baseline) |
| `application_ja.properties` | i18n messages (Japanese – 168KB) |
| `customizer.dicon` | S2 component customization |

---

## 8. Deployment Structure

```
SalesCube.war
├── WEB-INF/
│   ├── web.xml
│   ├── struts-config.xml
│   ├── validator-rules.xml
│   ├── lib/           (42 JARs)
│   ├── view/          (JSP files)
│   ├── tags/          (custom tag definitions)
│   └── report_template/ (26 JasperReport templates)
├── css/
├── images/
├── scripts/
└── licenses/
```

---

## 9. New TypeScript Project (salescube-ts/)

Tồn tại project TypeScript mới trong workspace:
- **Location**: `salescube-ts/`
- **Structure**: Turborepo monorepo với `apps/api/` và `apps/web/`
- **Packages**: `packages/db/`, `packages/domain/`, `packages/shared/`
- **Trạng thái**: Chưa có implementation đáng kể (inferred – không phân tích sâu)

---

## 10. Top 10 Files Quan trọng Cần Inspect Tiếp

1. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/SalesService.java` (71KB – lớn nhất)
2. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/EadService.java` (40KB –委託)
3. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/ProductService.java` (54KB)
4. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/DepositSlipService.java` (32KB)
5. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/CustomerService.java` (30KB)
6. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/sales/InputSalesAction.java` (40KB)
7. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/service/BillService.java` (30KB)
8. `SalesCube/DB/batch/sp/SP_UPDATE_CUSTOMER_RANK_SALES.sql` (91KB – stored proc)
9. `SalesCube/DB/sql/insertmaster/ROLE_CFG.sql` (18KB – role assignments)
10. `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/AbstractSlipEditAction.java` (18KB – base slip logic)
