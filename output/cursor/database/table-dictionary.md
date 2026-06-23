# Table Dictionary – SalesCube Legacy DB

> **Nguồn**: `SalesCube/DB/sql/createtable/CREATE.sql` (6661 dòng)  
> **Entity classes**: `SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/` (76 classes)  
> **Quy ước**: Tên bảng không có suffix `_XXXXX`. Engine=InnoDB. Không có FK constraint trong DDL.  
> **Audit columns** (có trong tất cả bảng, không liệt kê lại):  
> `CRE_FUNC`, `CRE_DATETM`, `CRE_USER`, `UPD_FUNC`, `UPD_DATETM`, `UPD_USER`, `DEL_FUNC`, `DEL_DATETM`, `DEL_USER`

---

## Nhóm 1: Infrastructure

### SEQ_MAKER
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Custom sequence generator thay thế AUTO_INCREMENT |
| **PK** | `TABLE_NAME` VARCHAR(40) |
| **FK inferred** | – |
| **Search fields** | `TABLE_NAME` |
| **Status flags** | – |
| **Soft-delete** | Không (DEL_* columns có nhưng không có soft-delete logic theo DDL) |
| **Audit** | CRE/UPD (không có DEL) |
| **Source** | `CREATE.sql:3-17` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `TABLE_NAME` | VARCHAR(40) | PK – tên bảng cần sequence |
| `ID` | INT UNSIGNED DEFAULT 0 | Giá trị sequence hiện tại |
| `WARNING_ID` | INT UNSIGNED | Ngưỡng cảnh báo khi gần hết |

---

## Nhóm 2: Master Tables (MST)

### MINE_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Thông tin công ty sử dụng hệ thống (自社) – singleton, không có PK |
| **PK** | Không có PK (singleton row) |
| **FK inferred** | – |
| **Search fields** | – (luôn lấy dòng duy nhất) |
| **Status flags** | – |
| **Soft-delete** | DEL_* columns có nhưng singleton |
| **Source** | `CREATE.sql:36-91` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `COMPANY_NAME` | VARCHAR(60) | Tên công ty |
| `CUTOFF_GROUP` | CHAR(2) | Nhóm chốt hóa đơn mặc định |
| `CLOSE_MONTH` | CHAR(2) | Tháng kết thúc năm tài chính |
| `STOCK_HOLD_DAYS` | SMALLINT | Số ngày giữ hàng tồn kho |
| `TAX_CATEGORY` | CHAR(1) | Chính sách thuế (nội/ngoại thuế) |
| `PRICE_FRACT_CATEGORY` | CHAR(1) | Cách làm tròn giá |
| `PASSWORD_VALID_DAYS` | SMALLINT | Số ngày hiệu lực mật khẩu |
| `TOTAL_FAIL_COUNT` | SMALLINT | Số lần đăng nhập sai tối đa |
| `PASSWORD_HIST_COUNT` | SMALLINT(2) | Số mật khẩu lịch sử không được dùng lại |
| `PASSWORD_LENGTH` | SMALLINT(2) | Độ dài tối thiểu mật khẩu |
| `PASSWORD_CHAR_TYPE` | CHAR(1) | Loại ký tự yêu cầu |
| `SAFETY_COEFFICIENT` | DECIMAL(6,3) | Hệ số an toàn tồn kho |
| `DEFICIENCY_RATE` | DECIMAL(6,3) | Tỷ lệ thiếu hụt chấp nhận |

---

### PRODUCT_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Danh mục sản phẩm |
| **PK** | `PRODUCT_CODE` VARCHAR(20) NOT NULL |
| **FK inferred** | `SUPPLIER_CODE` → SUPPLIER_MST, `RACK_CODE` → RACK_MST |
| **Search fields** | `PRODUCT_CODE`, `PRODUCT_NAME`, `PRODUCT_KANA`, `SUPPLIER_CODE`, `JAN_PCODE`, `ONLINE_PCODE` |
| **Status flags** | `PRODUCT_STATUS_CATEGORY` VARCHAR(2), `PRODUCT_STOCK_CATEGORY` VARCHAR(2), `STOCK_CTL_CATEGORY` VARCHAR(1) |
| **Soft-delete** | `DEL_DATETM` IS NOT NULL → deleted |
| **Source** | `CREATE.sql:158-243` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `PRODUCT_CODE` | VARCHAR(20) NOT NULL | PK – mã sản phẩm nội bộ |
| `PRODUCT_NAME` | VARCHAR(60) NOT NULL | Tên sản phẩm |
| `ONLINE_PCODE` | VARCHAR(50) | Mã sản phẩm EC platform |
| `SUPPLIER_PCODE` | VARCHAR(20) | Mã sản phẩm nhà cung cấp |
| `SUPPLIER_CODE` | VARCHAR(10) | FK → SUPPLIER_MST |
| `RACK_CODE` | VARCHAR(10) | FK → RACK_MST (vị trí kho mặc định) |
| `RETAIL_PRICE` | DECIMAL(12,3) | Giá bán lẻ |
| `SUPPLIER_PRICE_YEN` | DECIMAL(12,3) | Giá nhập (JPY) |
| `SUPPLIER_PRICE_DOL` | DECIMAL(12,3) | Giá nhập (USD) |
| `TAX_CATEGORY` | VARCHAR(1) | Loại thuế áp dụng |
| `STOCK_CTL_CATEGORY` | VARCHAR(1) | Có quản lý tồn kho không |
| `PRODUCT_STATUS_CATEGORY` | VARCHAR(2) | Trạng thái sản phẩm (updated by batch) |
| `PRODUCT_STOCK_CATEGORY` | VARCHAR(2) | Phân loại tồn kho |
| `SET_TYPE_CATEGORY` | VARCHAR(1) | Loại bộ sản phẩm |
| `SALES_STANDARD_DEVIATION` | DECIMAL(12,6) | Độ lệch chuẩn doanh số (updated by batch) |
| `AVG_SHIP_COUNT` | INT | Số xuất kho trung bình (updated by batch) |
| `MINE_SAFETY_STOCK` | INT | Safety stock nội bộ (updated by batch) |
| `ENTRUST_SAFETY_STOCK` | INT | Safety stock ủy thác |
| `LEAD_TIME` | INT | Thời gian chờ đặt hàng (ngày) |
| `JAN_PCODE` | VARCHAR(13) | Mã vạch JAN/EAN-13 |
| `DISCARD_DATE` | DATE | Ngày ngừng sản xuất |
| `LAST_RO_DATE` | DATE | Ngày đặt hàng cuối cùng |
| `PRODUCT_1/2/3` | VARCHAR(4) | Phân loại sản phẩm (3 cấp) → FK → PRODUCT_CLASS_MST |
| `NUM_1..5`, `DEC_1..5` | SMALLINT/FLOAT | Trường tùy chỉnh |

---

### PRODUCT_CLASS_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phân loại sản phẩm 3 cấp |
| **PK** | (`CLASS_CODE_1`, `CLASS_CODE_2`, `CLASS_CODE_3`) – composite |
| **FK inferred** | Được reference bởi PRODUCT_MST.PRODUCT_1/2/3 |
| **Source** | `CREATE.sql:337-358` |

---

### PRODUCT_SET_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Bộ sản phẩm (set product) – định nghĩa thành phần |
| **PK** | (`SET_PRODUCT_CODE`, `PRODUCT_CODE`) – composite |
| **FK inferred** | `SET_PRODUCT_CODE` → PRODUCT_MST, `PRODUCT_CODE` → PRODUCT_MST |
| **Source** | `CREATE.sql:386-405` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `SET_PRODUCT_CODE` | VARCHAR(20) | Mã sản phẩm bộ (container) |
| `PRODUCT_CODE` | VARCHAR(20) | Mã sản phẩm thành phần |
| `QUANTITY` | DECIMAL(12,3) | Số lượng thành phần trong bộ |

---

### RACK_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Kệ/vị trí lưu trữ trong kho |
| **PK** | `RACK_CODE` VARCHAR(10) |
| **FK inferred** | `WAREHOUSE_CODE` → WAREHOUSE_MST |
| **Search fields** | `RACK_CODE`, `RACK_NAME`, `WAREHOUSE_CODE` |
| **Status flags** | `RACK_CATEGORY` VARCHAR(1), `MULTI_FLAG` CHAR(1) |
| **Source** | `CREATE.sql:432-459` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `WAREHOUSE_CODE` | VARCHAR(10) | FK → WAREHOUSE_MST |
| `RACK_CODE` | VARCHAR(10) | PK |
| `RACK_CATEGORY` | VARCHAR(1) | Loại kệ |
| `MULTI_FLAG` | CHAR(1) | Cho phép nhiều sản phẩm trên cùng kệ |

---

### WAREHOUSE_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Quản lý kho vật lý |
| **PK** | `WAREHOUSE_CODE` VARCHAR(10) NOT NULL |
| **Search fields** | `WAREHOUSE_CODE`, `WAREHOUSE_NAME` |
| **Status flags** | `WAREHOUSE_STATE` VARCHAR(10) |
| **Source** | `CREATE.sql:495-523` |

---

### CUSTOMER_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Danh mục khách hàng |
| **PK** | `CUSTOMER_CODE` VARCHAR(15) |
| **FK inferred** | `CUSTOMER_RANK_CATEGORY` → CUSTOMER_RANK_MST |
| **Search fields** | `CUSTOMER_CODE`, `CUSTOMER_NAME`, `CUSTOMER_KANA`, `CUSTOMER_TEL`, `CUSTOMER_EMAIL` |
| **Status flags** | `CUSTOMER_RANK_CATEGORY` VARCHAR(2), `CUSTOMER_UPD_FLAG` VARCHAR(1), `SALES_CM_CATEGORY` VARCHAR(1) |
| **Soft-delete** | `DEL_DATETM` IS NOT NULL |
| **Source** | `CREATE.sql:560-619` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `CUSTOMER_CODE` | VARCHAR(15) | PK |
| `CUSTOMER_RANK_CATEGORY` | VARCHAR(2) | Xếp hạng KH (updated by batch) |
| `CUTOFF_GROUP` | CHAR(2) | Nhóm chốt hóa đơn |
| `PAYBACK_TYPE_CATEGORY` | VARCHAR(3) | Phương thức thanh toán |
| `PAYBACK_CYCLE_CATEGORY` | VARCHAR(1) | Chu kỳ thanh toán |
| `MAX_CREDIT_LIMIT` | DECIMAL(15,3) | Hạn mức tín dụng |
| `FIRST_SALES_DATE` | DATE | Ngày bán hàng đầu tiên |
| `LAST_SALES_DATE` | DATE | Ngày bán hàng cuối (updated by batch) |
| `SALES_PRICE_TOTAL` | DECIMAL(15,3) | Tổng doanh số tích lũy |
| `LAST_CUTOFF_DATE` | DATE | Ngày chốt hóa đơn cuối |
| `TAX_SHIFT_CATEGORY` | VARCHAR(1) | Chuyển đổi thuế |
| `TEMP_DELIVERY_SLIP_FLAG` | CHAR(1) | In phiếu giao hàng tạm |

---

### DELIVERY_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Địa chỉ giao hàng (khác với địa chỉ thanh toán của KH) |
| **PK** | `DELIVERY_CODE` VARCHAR(15) |
| **FK inferred** | Được reference bởi CUSTOMER_MST (implicit) |
| **Search fields** | `DELIVERY_CODE`, `DELIVERY_NAME`, `DELIVERY_ZIP_CODE` |
| **Source** | `CREATE.sql:687-719` |

---

### CUSTOMER_REL
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Quan hệ giữa khách hàng (phụ huynh-con, nhóm, v.v.) |
| **PK** | (`CUSTOMER_CODE`, `REL_CODE`, `CUST_REL_CATEGORY`) |
| **FK inferred** | `CUSTOMER_CODE` → CUSTOMER_MST, `REL_CODE` → CUSTOMER_MST |
| **Source** | `CREATE.sql:760-780` |

---

### SUPPLIER_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Danh mục nhà cung cấp |
| **PK** | `SUPPLIER_CODE` VARCHAR(10) |
| **FK inferred** | `RATE_ID` → RATE_MST |
| **Search fields** | `SUPPLIER_CODE`, `SUPPLIER_NAME`, `SUPPLIER_KANA` |
| **Status flags** | `SUPPLIER_CM_CATEGORY` VARCHAR(1) |
| **Source** | `CREATE.sql:800-950` (inferred từ entity list) |

---

### CATEGORY_MST & CATEGORY_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Enum/lookup values (mã phân loại động) |
| **PK** | `CATEGORY_MST`: `CATEGORY_ID`; `CATEGORY_TRN`: (`CATEGORY_ID`, `CATEGORY_CODE`) |
| **Mô tả** | CATEGORY_MST định nghĩa nhóm; CATEGORY_TRN chứa các giá trị trong nhóm |

---

### TAX_RATE_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Thuế suất theo loại và thời gian |
| **PK** | (`TAX_TYPE_CATEGORY`, `START_DATE`) – composite |
| **Search fields** | `TAX_TYPE_CATEGORY`, `START_DATE` |

---

### BANK_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Thông tin tài khoản ngân hàng của công ty |
| **PK** | `BANK_ID` INT UNSIGNED |
| **Search fields** | `BANK_CODE`, `BANK_NAME` |

---

### RATE_MST & RATE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | RATE_MST: Loại tiền tệ; RATE_TRN: Tỷ giá theo ngày |
| **PK** | `RATE_MST`: `RATE_ID`; `RATE_TRN`: (`RATE_ID`, `START_DATE`) |

---

### CUSTOMER_RANK_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Tiêu chí xếp hạng khách hàng |
| **PK** | `RANK_CODE` VARCHAR(2) |
| **Key columns** | `RO_COUNT_FROM/TO`, `ENROLL_TERM_FROM/TO`, `RO_MONTHLY_AVG_FROM/TO`, `RANK_RATE` |

---

### DISCOUNT_MST & DISCOUNT_TRN & DISCOUNT_REL
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Chiết khấu số lượng: định nghĩa, giao dịch áp dụng, liên kết KH/sản phẩm |

---

### INIT_MST
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Giá trị mặc định cho từng cột trong từng bảng |
| **PK** | (`TABLE_NAME`, `COLUMN_NAME`) |
| **Columns** | `STR_DATA`, `NUM_DATA`, `FLT_DATA` |

---

## Nhóm 3: Transaction Tables (TRN)

### ESTIMATE_SHEET_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu báo giá |
| **PK** | `ESTIMATE_SHEET_ID` INT UNSIGNED |
| **FK inferred** | `CUSTOMER_CODE` → CUSTOMER_MST |
| **Search fields** | `ESTIMATE_SHEET_ID`, `CUSTOMER_CODE`, `SALES_DATE` |
| **Status flags** | `STATUS` CHAR(1) |

---

### ESTIMATE_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết phiếu báo giá |
| **PK** | `ESTIMATE_LINE_ID` INT UNSIGNED |
| **FK inferred** | `ESTIMATE_SHEET_ID` → ESTIMATE_SHEET_TRN, `PRODUCT_CODE` → PRODUCT_MST |

---

### RO_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu nhận đơn hàng (受注伝票) |
| **PK** | `RO_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `CUSTOMER_CODE` → CUSTOMER_MST, `DELIVERY_CODE` → DELIVERY_MST |
| **Search fields** | `RO_SLIP_ID`, `CUSTOMER_CODE`, `RO_DATE`, `RECEPT_NO` |
| **Status flags** | `STATUS` CHAR(1) |
| **Year-Month** | `RO_ANNUAL` SMALLINT, `RO_MONTHLY` SMALLINT, `RO_YM` INT |

---

### RO_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết đơn hàng |
| **PK** | `RO_LINE_ID` INT UNSIGNED |
| **FK inferred** | `RO_SLIP_ID` → RO_SLIP_TRN, `PRODUCT_CODE` → PRODUCT_MST, `ESTIMATE_LINE_ID` → ESTIMATE_LINE_TRN |
| **Status flags** | `STATUS` CHAR(1) |
| **Key columns** | `REST_QUANTITY` NOT NULL – số lượng chưa xử lý còn lại |

---

### SALES_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu bán hàng (売上伝票) – bảng nghiệp vụ trung tâm |
| **PK** | `SALES_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `RO_SLIP_ID` → RO_SLIP_TRN, `BILL_ID` → BILL_TRN, `CUSTOMER_CODE` → CUSTOMER_MST |
| **Search fields** | `SALES_SLIP_ID`, `CUSTOMER_CODE`, `SALES_DATE`, `RECEPT_NO` |
| **Status flags** | `STATUS` CHAR(1), `SALES_CM_CATEGORY` VARCHAR(1) |
| **Year-Month** | `SALES_ANNUAL`, `SALES_MONTHLY`, `SALES_YM` |
| **Source** | `CREATE.sql:1755-1906` |

| Column nổi bật | Type | Ý nghĩa |
|---------------|------|---------|
| `STATUS` | CHAR(1) | Trạng thái phiếu |
| `BILL_ID` | INT UNSIGNED | FK → BILL_TRN (sau khi chốt) |
| `SALES_BILL_ID` | INT UNSIGNED | ID lần in hóa đơn |
| `BILL_CUTOFF_DATE` | DATE | Ngày chốt hóa đơn |
| `COD_SC` | CHAR(1) | Cờ COD (thanh toán khi giao hàng) |
| `DC_CATEGORY` | VARCHAR(5) | Phân loại đơn vị vận chuyển |
| `CTAX_PRICE_TOTAL` | DECIMAL(12,3) | Tổng thuế |
| `PRICE_TOTAL` | DECIMAL(15,3) | Tổng tiền |
| `GM_TOTAL` | DECIMAL(15,3) | Tổng lợi nhuận gộp |
| `ART_ID` | INT UNSIGNED | FK → ART_BALANCE_TRN |
| Denormalized: `CUSTOMER_NAME`, `DELIVERY_*`, `BA_*` | | Snapshot tại thời điểm tạo |

---

### SALES_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết phiếu bán hàng |
| **PK** | `SALES_LINE_ID` INT UNSIGNED |
| **FK inferred** | `SALES_SLIP_ID` → SALES_SLIP_TRN, `RO_LINE_ID` → RO_LINE_TRN, `PRODUCT_CODE` → PRODUCT_MST |
| **Source** | `CREATE.sql:2031-2073` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `LINE_NO` | SMALLINT | Số dòng trong phiếu |
| `SALES_DETAIL_CATEGORY` | VARCHAR(2) | Loại chi tiết (hàng hóa, phí, v.v.) |
| `QUANTITY` | DECIMAL(12,3) | Số lượng |
| `UNIT_PRICE` | DECIMAL(12,3) | Đơn giá |
| `RETAIL_PRICE` | DECIMAL(15,3) | Thành tiền |
| `UNIT_COST` | DECIMAL(12,3) | Giá vốn đơn vị |
| `GM` | DECIMAL(15,3) | Lợi nhuận gộp dòng |
| `CTAX_RATE` | DECIMAL(6,3) | Thuế suất |
| `RACK_CODE_SRC` | VARCHAR(10) | Kệ xuất hàng |

---

### PICKING_LIST_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Danh sách picking (lấy hàng từ kho) |
| **PK** | `PICKING_LIST_ID` INT UNSIGNED |
| **FK inferred** | `RO_SLIP_ID` → RO_SLIP_TRN, `SALES_SLIP_ID` → SALES_SLIP_TRN |
| **Source** | `CREATE.sql:2124-2194` |

---

### PICKING_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết picking |
| **PK** | `PICKING_LINE_ID` INT UNSIGNED |
| **FK inferred** | `PICKING_LIST_ID` → PICKING_LIST_TRN, `SALES_LINE_ID` → SALES_LINE_TRN, `RO_LINE_ID` → RO_LINE_TRN |
| **Source** | `CREATE.sql:2273-2315` |

---

### BILL_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Hóa đơn định kỳ (請求書) tổng hợp nhiều phiếu bán |
| **PK** | `BILL_ID` INT UNSIGNED |
| **FK inferred** | `CUSTOMER_CODE` → CUSTOMER_MST, `BA_CODE` → BANK_MST |
| **Search fields** | `BILL_ID`, `CUSTOMER_CODE`, `BILL_CUTOFF_DATE`, `CUTOFF_GROUP` |
| **Status flags** | `STATUS` CHAR(1), `BILL_CRT_CATEGORY` VARCHAR(2) |
| **Source** | `CREATE.sql:2366-2422` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `STATUS` | CHAR(1) | Trạng thái hóa đơn |
| `BILL_CUTOFF_DATE` | DATE | Ngày chốt |
| `CUTOFF_GROUP` | CHAR(2) | Nhóm chốt |
| `LAST_BILL_PRICE` | DECIMAL(15,3) | Số dư kỳ trước |
| `DEPOSIT_PRICE` | DECIMAL(15,3) | Tiền đã thu kỳ này |
| `SALES_PRICE` | DECIMAL(15,3) | Doanh số kỳ này |
| `THIS_BILL_PRICE` | DECIMAL(15,3) | Số tiền cần thanh toán |
| `PAYBACK_PLAN_DATE` | DATE | Ngày dự kiến thanh toán |
| `BILL_PRINT_COUNT` | INT | Số lần in hóa đơn |
| COD_ variants | DECIMAL | Tương tự nhưng cho COD |

---

### DEPOSIT_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu thu tiền (入金伝票) |
| **PK** | `DEPOSIT_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `CUSTOMER_CODE` → CUSTOMER_MST, `BILL_ID` → BILL_TRN, `ART_ID` → ART_BALANCE_TRN |
| **Status flags** | `STATUS` VARCHAR(1) |
| **Source** | `CREATE.sql:2487-2549` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `DEPOSIT_CATEGORY` | VARCHAR(3) | Phân loại thu tiền |
| `DEPOSIT_TOTAL` | DECIMAL(15,3) | Tổng số tiền thu |
| `BILL_ID` | INT UNSIGNED | FK → BILL_TRN |
| `ART_ID` | INT UNSIGNED | FK → ART_BALANCE_TRN |
| `SALES_SLIP_ID` | INT UNSIGNED | FK → SALES_SLIP_TRN (direct sales) |
| `SALES_CM_CATEGORY` | VARCHAR(1) | Phân loại bán hàng |

---

### DEPOSIT_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết phiếu thu tiền |
| **PK** | `DEPOSIT_LINE_ID` INT UNSIGNED |
| **FK inferred** | `DEPOSIT_SLIP_ID` → DEPOSIT_SLIP_TRN, `BANK_ID` → BANK_MST, `SALES_LINE_ID` → SALES_LINE_TRN |
| **Source** | `CREATE.sql:2620-2647` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `DEPOSIT_CATEGORY` | VARCHAR(3) | Phân loại (tiền mặt, chuyển khoản, séc...) |
| `PRICE` | DECIMAL(15,3) | Số tiền dòng này |
| `BANK_ID` | INT UNSIGNED | FK → BANK_MST (tài khoản nhận) |
| `INST_DATE` | DATE | Ngày phiếu thanh toán |
| `INST_NO` | VARCHAR(10) | Số phiếu ngân hàng |

---

### PO_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu đặt hàng nhà cung cấp (発注伝票) |
| **PK** | `PO_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `SUPPLIER_CODE` → SUPPLIER_MST, `RATE_ID` → RATE_MST |
| **Status flags** | `STATUS` CHAR(1) |
| **Source** | `CREATE.sql:2683-2736` |

---

### PO_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết đặt hàng NCC |
| **PK** | `PO_LINE_ID` INT UNSIGNED |
| **FK inferred** | `PO_SLIP_ID` → PO_SLIP_TRN, `PRODUCT_CODE` → PRODUCT_MST |
| **Key columns** | `REST_QUANTITY` DECIMAL NOT NULL – số lượng chưa nhập kho |
| **Source** | `CREATE.sql:2798-2835` |

---

### SUPPLIER_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu nhập hàng từ NCC (仕入伝票) |
| **PK** | `SUPPLIER_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `SUPPLIER_CODE` → SUPPLIER_MST, `PO_SLIP_ID` → PO_SLIP_TRN, `PAYMENT_SLIP_ID` → PAYMENT_SLIP_TRN |
| **Status flags** | `STATUS` CHAR(1), `SUPPLIER_SLIP_CATEGORY` VARCHAR(2) |
| **Source** | `CREATE.sql:2881-2923` |

---

### SUPPLIER_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết phiếu nhập hàng |
| **PK** | `SUPPLIER_LINE_ID` INT UNSIGNED |
| **FK inferred** | `SUPPLIER_SLIP_ID` → SUPPLIER_SLIP_TRN, `PRODUCT_CODE` → PRODUCT_MST, `PO_LINE_ID` → PO_LINE_TRN, `PAYMENT_LINE_ID` → PAYMENT_LINE_TRN |
| **Source** | `CREATE.sql:2974-3015` |

---

### EAD_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu nhập/xuất kho ủy thác (委託入出庫伝票) |
| **PK** | `EAD_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `SALES_SLIP_ID` → SALES_SLIP_TRN, `SUPPLIER_SLIP_ID` → SUPPLIER_SLIP_TRN |
| **Status flags** | `EAD_SLIP_CATEGORY` VARCHAR(2), `EAD_CATEGORY` VARCHAR(2) |
| **Source** | `CREATE.sql:3065-3095` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `EAD_SLIP_CATEGORY` | VARCHAR(2) | Loại phiếu (nhập/xuất) |
| `EAD_CATEGORY` | VARCHAR(2) | Loại ủy thác |
| `SRC_FUNC` | CHAR(2) | Hàm nguồn tạo phiếu |

---

### EAD_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết phiếu kho ủy thác |
| **PK** | `EAD_LINE_ID` INT UNSIGNED |
| **FK inferred** | `EAD_SLIP_ID` → EAD_SLIP_TRN, `PRODUCT_CODE` → PRODUCT_MST, `RACK_CODE` → RACK_MST, `SALES_LINE_ID` → SALES_LINE_TRN, `SUPPLIER_LINE_ID` → SUPPLIER_LINE_TRN |
| **Source** | `CREATE.sql:3134-3160` |

---

### PAYMENT_SLIP_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Phiếu thanh toán cho NCC (支払伝票) |
| **PK** | `PAYMENT_SLIP_ID` INT UNSIGNED |
| **FK inferred** | `SUPPLIER_CODE` → SUPPLIER_MST, `PO_SLIP_ID` → PO_SLIP_TRN NOT NULL, `SUPPLIER_SLIP_ID` → SUPPLIER_SLIP_TRN, `APT_BALANCE_ID` → APT_BALANCE_TRN |
| **Status flags** | `STATUS` CHAR(1) |
| **Source** | `CREATE.sql:3195-3233` |

---

### PAYMENT_LINE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Dòng chi tiết phiếu thanh toán NCC |
| **PK** | `PAYMENT_LINE_ID` INT UNSIGNED |
| **FK inferred** | `PAYMENT_SLIP_ID` → PAYMENT_SLIP_TRN, `PO_LINE_ID` → PO_LINE_TRN NOT NULL, `SUPPLIER_LINE_ID` → SUPPLIER_LINE_TRN NOT NULL |
| **Source** | `CREATE.sql:3280-3314` |

---

### ART_BALANCE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Số dư tài khoản phải thu (売掛残高) |
| **PK** | `ART_BALANCE_ID` INT UNSIGNED |
| **FK inferred** | `CUSTOMER_CODE` → CUSTOMER_MST, `BA_CODE` → BANK_MST |
| **Source** | `CREATE.sql:3357-3409` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `ART_ANNUAL/MONTHLY/YM` | SMALLINT/INT | Kỳ kế toán |
| `LAST_ART_PRICE` | DECIMAL(15,3) | Số dư đầu kỳ |
| `DEPOSIT_PRICE` | DECIMAL(15,3) | Tiền thu trong kỳ |
| `SALES_PRICE` | DECIMAL(15,3) | Doanh số trong kỳ |
| `THIS_ART_PRICE` | DECIMAL(15,3) | Số dư cuối kỳ |
| `GM_PRICE` | DECIMAL(15,3) | Lợi nhuận gộp kỳ |
| `DEPOSIT_CASH/CHECK/TRANSFER/SC/INST/SETOFF/ETC` | DECIMAL | Chi tiết thu tiền theo phương thức |

---

### APT_BALANCE_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Số dư tài khoản phải trả NCC (買掛残高) |
| **PK** | `APT_BALANCE_ID` INT UNSIGNED |
| **FK inferred** | `SUPPLIER_CODE` → SUPPLIER_MST NOT NULL, `PRODUCT_CODE` → PRODUCT_MST NOT NULL, `PO_SLIP_ID` → PO_SLIP_TRN, `SUPPLIER_SLIP_ID` → SUPPLIER_SLIP_TRN |
| **Source** | `CREATE.sql:3470-3509` |

| Column | Type | Ý nghĩa |
|--------|------|---------|
| `UNPAID_PRICE` | DECIMAL(15,3) | Số tiền chưa thanh toán |

---

### PRODUCT_STOCK_TRN
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Tồn kho theo tháng, theo kệ |
| **PK** | (`RACK_CODE`, `PRODUCT_CODE`, `ANNUAL`, `MONTHLY`) – composite |
| **FK inferred** | `RACK_CODE` → RACK_MST, `PRODUCT_CODE` → PRODUCT_MST |
| **Key columns** | `STOCK_NUM`, `ENTER_NUM`, `DISPATCH_NUM`, `RETURN_NUM` |
| **Source** | `CREATE.sql:1310-1370` |

---

## Nhóm 4: Work/Import Tables

### ONLINE_ORDER_WORK
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Staging table cho import đơn hàng EC |
| **PK** | (`USER_ID`, `ONLINE_ORDER_ID`, `ONLINE_ITEM_ID`) |
| **Source** | `CREATE.sql:3557-3597` |

### INVOICE_DATA_WORK
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Staging table xuất dữ liệu vận đơn (送り状) |
| **PK** | (`USER_ID`, `DELIVERY_SLIP_ID`) |
| **Source** | `CREATE.sql:3599-3680` |

### DELIVERY_DEPOSIT_WORK
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Staging table import thu tiền COD từ shipper |
| **PK** | (`USER_ID`, `DELIVERY_SLIP_ID`) inferred |
| **Source** | `CREATE.sql:3682-3699+` |

### BANK_DEPOSIT_WORK
| Thuộc tính | Giá trị |
|-----------|---------|
| **Ý nghĩa** | Staging table import sao kê ngân hàng |
| **PK** | (`USER_ID`, ...) inferred |

---

## Nhóm 5: System Tables (inferred từ entity classes)

| Bảng | PK | Ý nghĩa |
|------|----|---------|
| `DOMAIN_MST` | `DOMAIN_ID` | Multi-tenant domain |
| `USER_MST` | `USER_ID` | Người dùng hệ thống |
| `DEPT_MST` | `DEPT_CODE` | Phòng ban |
| `MENU_MST` | `MENU_ID` | Cấu trúc menu |
| `ROLE_MST` | `ROLE_ID` | Vai trò |
| `GRANT_ROLE` | (`USER_ID`, `ROLE_ID`) | Phân quyền |
| `FILE_INFO` | `FILE_ID` | Metadata file upload |
| `NEWS` | `NEWS_ID` | Tin tức/thông báo |
| `ZIP_MST` | `ZIP_ID` | Mã bưu điện Nhật |
| `REPORT_TEMPLATE` | `TEMPLATE_ID` | Template báo cáo |
| `DETAIL_DISP_ITEM` | composite | Cấu hình cột hiển thị per-user |
