# 04 – Database Analysis

> **Trạng thái**: Xác nhận từ source code  
> **Nguồn**: `SalesCube/DB/sql/createtable/CREATE.sql`, `jdbc.dicon`, Entity classes

---

## 1. Database Configuration

- **RDBMS**: MySQL 5.x, Engine: **InnoDB** (tất cả bảng)
- **Schema**: `salescube`
- **Connection**: `jdbc:mysql://localhost:3306/salescube`
- **Credentials**: user=`salescube`, password=`salescube` (**HARD-CODED** – xem 10-risks)
- **Connection Pool**: max 10 connections, timeout 600s
- **Encoding**: UTF-8 (recommended, comment trong jdbc.dicon)

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/jdbc.dicon:118-129`

---

## 2. Multi-tenant Pattern

**Cơ chế**: Tên bảng có suffix `_XXXXX` được thay thế bằng DOMAIN ID tại runtime.

```bash
# Từ CallProc.sh:12
cat $BATCH_NAME.sql | sed -e s/XXXXX/$DOMAIN/
```

- Ví dụ: `SALES_SLIP_TRN_XXXXX` → `SALES_SLIP_TRN_SALES`
- DOMAIN mặc định trong batch: `SALES`
- Cơ chế này áp dụng cho **tất cả bảng**
- **Inferred**: Có thể có nhiều DOMAIN trong production (multi-tenant per-schema)

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/CallProc.sh:5-12`

---

## 3. Audit Trail Pattern

**Nhất quán toàn hệ thống**: Mỗi bảng nghiệp vụ có bảng `_HIST` tương ứng.

**Columns audit** (có trong tất cả bảng):
```sql
CRE_FUNC    VARCHAR(255)  -- Hàm tạo
CRE_DATETM  DATETIME      -- Thời gian tạo
CRE_USER    VARCHAR(30)   -- User tạo
UPD_FUNC    VARCHAR(255)  -- Hàm cập nhật
UPD_DATETM  DATETIME      -- Thời gian cập nhật
UPD_USER    VARCHAR(30)   -- User cập nhật
DEL_FUNC    VARCHAR(255)  -- Hàm xóa (soft delete)
DEL_DATETM  DATETIME      -- Thời gian xóa
DEL_USER    VARCHAR(30)   -- User xóa
```

**Columns bảng HIST thêm**:
```sql
HIST_ID      INT UNSIGNED  -- PK của HIST table
ACTION_TYPE  VARCHAR(20)   -- Loại action (INSERT/UPDATE/DELETE)
ACTION_FUNC  VARCHAR(255)  -- Hàm thực hiện action
REC_DATETM   DATETIME      -- Thời gian ghi HIST
REC_USER     VARCHAR(30)   -- User thực hiện
```

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/createtable/CREATE.sql:93-156`

---

## 4. Sequence Management

**Thay thế AUTO_INCREMENT** bằng custom sequence table:
- `SEQ_MAKER_XXXXX` – Sequence counter
- `SEQ_MAKER_HIST_XXXXX` – History của sequence

Managed bởi `SeqMakerService.java` (2KB).

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/createtable/CREATE.sql:3-34`

---

## 5. Danh sách Bảng (xác nhận từ CREATE.sql)

### 5.1. Infrastructure Tables

| Bảng | Mô tả | PK |
|------|-------|-----|
| `SEQ_MAKER_XXXXX` | Sequence generator | TABLE_NAME |
| `SEQ_MAKER_HIST_XXXXX` | Sequence history | TABLE_NAME |

### 5.2. Master Tables (MST)

| Bảng | Mô tả | PK | Columns nổi bật |
|------|-------|-----|----------------|
| `MINE_MST_XXXXX` | Thông tin công ty (自社) | (no PK – singleton) | COMPANY_NAME, PASSWORD_VALID_DAYS, TOTAL_FAIL_COUNT, TAX_CATEGORY |
| `PRODUCT_MST_XXXXX` | Sản phẩm | PRODUCT_CODE | SUPPLIER_CODE, RACK_CODE, RETAIL_PRICE, TAX_CATEGORY, STOCK_CTL_CATEGORY, SALES_STANDARD_DEVIATION |
| `PRODUCT_CLASS_MST_XXXXX` | Phân loại sản phẩm | CLASS_CODE_1+2+3 | CLASS_NAME |
| `PRODUCT_SET_MST_XXXXX` | Bộ sản phẩm | SET_PRODUCT_CODE+PRODUCT_CODE | QUANTITY |
| `RACK_MST_XXXXX` | Kệ/vị trí kho | RACK_CODE | WAREHOUSE_CODE, RACK_CATEGORY, MULTI_FLAG |
| `WAREHOUSE_MST_XXXXX` | Kho | WAREHOUSE_CODE | WAREHOUSE_NAME, WAREHOUSE_STATE |
| `CUSTOMER_MST_XXXXX` | Khách hàng | CUSTOMER_CODE | CUSTOMER_NAME, RATE, MAX_CREDIT_LIMIT, CUTOFF_GROUP, PAYBACK_TYPE_CATEGORY, SALES_PRICE_TOTAL |
| `DELIVERY_MST_XXXXX` | Địa chỉ giao hàng | DELIVERY_CODE | DELIVERY_NAME, DELIVERY_ZIP_CODE, DELIVERY_ADDRESS_1 |
| `SUPPLIER_MST_XXXXX` | Nhà cung cấp | SUPPLIER_CODE | SUPPLIER_NAME, PAYMENT_TYPE_CATEGORY, RATE_ID |
| `ZIP_MST_XXXXX` | Mã bưu điện | ZIP_ID | ZIP_CODE, ZIP_ADDRESS_1, ZIP_ADDRESS_2 |
| `BANK_MST_XXXXX` | Ngân hàng | BANK_ID | BANK_CODE, ACCOUNT_NUM, DWB_TYPE |
| `TAX_RATE_MST_XXXXX` | Thuế suất | TAX_TYPE_CATEGORY+START_DATE | TAX_RATE |
| `RATE_MST_XXXXX` | Tỷ giá ngoại tệ | RATE_ID | NAME, SIGN |
| `RATE_TRN_XXXXX` | Lịch sử tỷ giá | RATE_ID+START_DATE | RATE |
| `CUSTOMER_RANK_MST_XXXXX` | Xếp hạng khách hàng | RANK_CODE | RANK_RATE, RO_COUNT_FROM/TO, ENROLL_TERM_FROM/TO |
| `CATEGORY_MST_XXXXX` | Danh mục/mã | CATEGORY_ID | GROUP_NAME, CATEGORY_NAME, CATEGORY_DATA_TYPE |
| `CATEGORY_TRN_XXXXX` | Giá trị danh mục | CATEGORY_ID+CATEGORY_CODE | CATEGORY_CODE_NAME, CATEGORY_STR, CATEGORY_NUM |
| `INIT_MST_XXXXX` | Giá trị mặc định cột | TABLE_NAME+COLUMN_NAME | STR_DATA, NUM_DATA, FLT_DATA |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/createtable/CREATE.sql:36-1013`

### 5.3. System/Config Tables

| Bảng | Mô tả | PK |
|------|-------|-----|
| `DOMAIN_MST_XXXXX` | Domain/tenant | (inferred) |
| `USER_MST_XXXXX` | Người dùng | USER_ID |
| `MENU_MST_XXXXX` | Menu hệ thống | MENU_ID |
| `ROLE_MST_XXXXX` | Roles | ROLE_ID |
| `GRANT_ROLE_XXXXX` | Phân quyền user-role | (composite) |
| `DEPT_MST_XXXXX` | Phòng ban | (inferred) |

### 5.4. Transaction Tables (TRN)

| Bảng | Mô tả | PK | FK quan trọng |
|------|-------|-----|--------------|
| `ESTIMATE_SHEET_TRN_XXXXX` | Phiếu báo giá | ESTIMATE_SHEET_ID | CUSTOMER_CODE |
| `ESTIMATE_LINE_TRN_XXXXX` | Dòng báo giá | ESTIMATE_LINE_ID | ESTIMATE_SHEET_ID, PRODUCT_CODE |
| `RO_SLIP_TRN_XXXXX` | Phiếu nhận đơn | RO_SLIP_ID | CUSTOMER_CODE, DELIVERY_CODE, ESTIMATE_SHEET_ID |
| `RO_LINE_TRN_XXXXX` | Dòng đơn hàng | RO_LINE_ID | RO_SLIP_ID, PRODUCT_CODE, ESTIMATE_LINE_ID |
| `SALES_SLIP_TRN_XXXXX` | Phiếu bán hàng | SALES_SLIP_ID | RO_SLIP_ID, BILL_ID, CUSTOMER_CODE |
| `SALES_LINE_TRN_XXXXX` | Dòng bán hàng | SALES_LINE_ID | SALES_SLIP_ID, RO_LINE_ID, PRODUCT_CODE |
| `BILL_TRN_XXXXX` | Hóa đơn | (inferred BILL_ID) | CUSTOMER_CODE |
| `DEPOSIT_SLIP_TRN_XXXXX` | Phiếu thu tiền | (inferred) | CUSTOMER_CODE |
| `DEPOSIT_LINE_TRN_XXXXX` | Dòng thu tiền | (inferred) | DEPOSIT_SLIP_ID |
| `PO_SLIP_TRN_XXXXX` | Phiếu đặt hàng | (inferred) | SUPPLIER_CODE |
| `PO_LINE_TRN_XXXXX` | Dòng đặt hàng | (inferred) | PO_SLIP_ID, PRODUCT_CODE |
| `SUPPLIER_SLIP_TRN_XXXXX` | Phiếu nhập hàng | (inferred) | SUPPLIER_CODE |
| `SUPPLIER_LINE_TRN_XXXXX` | Dòng nhập hàng | (inferred) | SUPPLIER_SLIP_TRN_ID |
| `PAYMENT_SLIP_TRN_XXXXX` | Phiếu thanh toán NCC | (inferred) | SUPPLIER_CODE |
| `PAYMENT_LINE_TRN_XXXXX` | Dòng thanh toán | (inferred) | PAYMENT_SLIP_ID |
| `EAD_SLIP_TRN_XXXXX` | Phiếu kho ủy thác | (inferred) | |
| `EAD_LINE_TRN_XXXXX` | Dòng kho ủy thác | (inferred) | |
| `ENTRUST_EAD_SLIP_TRN_XXXXX` | Phiếu kho ủy thác (nhận) | (inferred) | |
| `ENTRUST_EAD_LINE_TRN_XXXXX` | Dòng kho ủy thác (nhận) | (inferred) | |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/createtable/CREATE.sql:1372-2099`

### 5.5. Stock/Balance Tables

| Bảng | Mô tả | PK |
|------|-------|-----|
| `PRODUCT_STOCK_TRN_XXXXX` | Tồn kho theo tháng | RACK_CODE+PRODUCT_CODE+ANNUAL+MONTHLY |
| `ART_BALANCE_TRN_XXXXX` | Số dư tài khoản phải thu | (inferred) |
| `APT_BALANCE_TRN_XXXXX` | Số dư tài khoản phải trả | (inferred) |
| `PICKING_LIST_XXXXX` | Danh sách picking | (inferred) |
| `PICKING_LINE_XXXXX` | Dòng picking | (inferred) |

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/createtable/CREATE.sql:1310-1370`

### 5.6. Work/Import Tables

| Bảng | Mô tả |
|------|-------|
| `BANK_DEPOSIT_WORK_XXXXX` | Work table import sao kê NH |
| `BANK_DEPOSIT_REL_XXXXX` | Liên kết import NH → phiếu thu |
| `DELIVERY_DEPOSIT_WORK_XXXXX` | Work table import thu tiền vận chuyển |
| `DELIVERY_DEPOSIT_REL_XXXXX` | Liên kết vận chuyển → phiếu thu |
| `ONLINE_ORDER_WORK_XXXXX` | Work table import đơn online |
| `ONLINE_ORDER_REL_XXXXX` | Liên kết đơn online → RO |
| `INVOICE_DATA_WORK_XXXXX` | Work table xuất dữ liệu vận đơn |
| `OUTPUT_SALES_REPORT_XXXXX` | Work table báo cáo bán hàng |

### 5.7. Other Tables

| Bảng | Mô tả |
|------|-------|
| `CUSTOMER_RANK_SUMMARY_XXXXX` | Tổng hợp xếp hạng KH |
| `CUSTOMER_REL_XXXXX` | Liên kết KH-KH (quan hệ) |
| `CUSTOMER_HIST_XXXXX` | Lịch sử khách hàng |
| `PRODUCT_HIST_XXXXX` | Lịch sử sản phẩm |
| `DETAIL_DISP_ITEM_XXXXX` | Cấu hình cột hiển thị |
| `REPORT_TEMPLATE_XXXXX` | Template báo cáo |
| `FILE_INFO_XXXXX` | Metadata file upload |
| `NEWS_XXXXX` | Tin tức/thông báo |
| `DISCOUNT_XXXXX` | Chiết khấu |
| `DISCOUNT_REL_XXXXX` | Liên kết chiết khấu |
| `DISCOUNT_TRN_XXXXX` | Giao dịch chiết khấu |
| `CLOSE_CUSTOMER_XXXXX` | KH đã chốt |
| `PRODUCT_STOCK_INFO_XXXXX` | Thông tin tồn kho tổng hợp |
| `YM_XXXXX` | Year-Month table (lịch) |

---

## 6. Quan hệ Bảng Chính (Core Flow)

```
CUSTOMER_MST
    │
    ▼
ESTIMATE_SHEET_TRN ──→ ESTIMATE_LINE_TRN ──→ PRODUCT_MST
    │
    ▼
RO_SLIP_TRN ──→ RO_LINE_TRN ──→ PRODUCT_MST
    │
    ▼
SALES_SLIP_TRN ──→ SALES_LINE_TRN ──→ PRODUCT_STOCK_TRN
    │
    ▼
BILL_TRN ──→ ART_BALANCE_TRN
    │
    ▼
DEPOSIT_SLIP_TRN ──→ DEPOSIT_LINE_TRN
```

---

## 7. Tổng số bảng

- **MST tables**: ~18 bảng chính + HIST
- **TRN tables**: ~20 bảng giao dịch + HIST
- **Work tables**: ~8 bảng
- **System tables**: ~6 bảng
- **HIST tables**: ~38 bảng (1 per MST/TRN)
- **Tổng ước tính**: **~90 bảng** (per tenant/domain)

---

## 8. SQL Query Pattern

Hệ thống sử dụng **Named SQL files** thay vì annotation:
- Mỗi entity có thư mục SQL tương ứng: `entity/sql/sales/`, `entity/sql/customer/`, ...
- Tổng **581 SQL files** trong `entity/sql/`
- Pattern: `{operation}.sql` (e.g., `findById.sql`, `updateByCondition.sql`)

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/sql/`

---

## 9. Khởi tạo Database

**Order thực hiện**:
1. `CREATE_DATABASE.sql` – Tạo database
2. `createtable/CREATE.sql` – Tạo tất cả bảng
3. `insertmaster/ALL.sql` – Chạy tất cả insert scripts:
   - CATEGORY_MST (33KB), CATEGORY_TRN (109KB), DETAIL_DISP_ITEM (113KB)
   - MENU_MST, ROLE_MST, ROLE_CFG, GRANT_ROLE
   - PRODUCT_MST, BANK_MST, TAX_RATE_MST, RATE_MST
   - SEQ_MAKER, MINE_MST, INIT_MST
4. `ENTRY_PROCEDURE.sql` – Đăng ký stored procedures

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/sql/insertmaster/ALL.sql`
