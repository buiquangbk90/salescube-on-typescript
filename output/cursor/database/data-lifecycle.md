# Data Lifecycle – SalesCube Legacy DB

> **Nguồn**: DDL + entity classes + service class naming + batch scripts  
> **Mục đích**: Ghi lại vòng đời dữ liệu, STATUS transitions, HIST write pattern

---

## 1. Audit Trail Pattern (_HIST Tables)

### 1.1 Cơ chế

Mỗi bảng nghiệp vụ đều có bảng HIST tương ứng với cùng cấu trúc cột, thêm:

```sql
HIST_ID     INT UNSIGNED    -- PK của HIST (từ SEQ_MAKER)
ACTION_TYPE VARCHAR(20)     -- 'INSERT' | 'UPDATE' | 'DELETE' | 'CANCEL'
ACTION_FUNC VARCHAR(255)    -- Tên Action class/method gọi
REC_DATETM  DATETIME        -- Thời điểm ghi hist
REC_USER    VARCHAR(30)     -- User thực hiện
```

### 1.2 Trigger

- **Không dùng DB trigger** – HIST được ghi thủ công trong Service class
- Pattern: trước mỗi INSERT/UPDATE/DELETE, service gọi `insertHist()` để snapshot trạng thái trước
- File mẫu: `entity/sql/UpdateAudit.sql` – SQL cập nhật audit columns

### 1.3 Danh sách HIST Tables

| Bảng gốc | Bảng HIST | PK HIST |
|----------|-----------|---------|
| SEQ_MAKER | SEQ_MAKER_HIST | TABLE_NAME |
| MINE_MST | MINE_MST_HIST | HIST_ID |
| PRODUCT_MST | PRODUCT_MST_HIST | HIST_ID |
| PRODUCT_CLASS_MST | PRODUCT_CLASS_MST_HIST | HIST_ID |
| PRODUCT_SET_MST | PRODUCT_SET_MST_HIST | HIST_ID |
| RACK_MST | RACK_MST_HIST | HIST_ID |
| WAREHOUSE_MST | WAREHOUSE_MST_HIST | HIST_ID |
| CUSTOMER_MST | CUSTOMER_MST_HIST | HIST_ID |
| DELIVERY_MST | DELIVERY_MST_HIST | HIST_ID |
| CUSTOMER_REL | CUSTOMER_REL_HIST | HIST_ID |
| SALES_SLIP_TRN | SALES_SLIP_TRN_HIST | HIST_ID |
| SALES_LINE_TRN | SALES_LINE_TRN_HIST | HIST_ID |
| PICKING_LIST_TRN | PICKING_LIST_TRN_HIST | HIST_ID |
| PICKING_LINE_TRN | PICKING_LINE_TRN_HIST | HIST_ID |
| BILL_TRN | BILL_TRN_HIST | HIST_ID |
| DEPOSIT_SLIP_TRN | DEPOSIT_SLIP_TRN_HIST | HIST_ID |
| DEPOSIT_LINE_TRN | DEPOSIT_LINE_TRN_HIST | HIST_ID |
| PO_SLIP_TRN | PO_SLIP_TRN_HIST | HIST_ID |
| PO_LINE_TRN | PO_LINE_TRN_HIST | HIST_ID |
| SUPPLIER_SLIP_TRN | SUPPLIER_SLIP_TRN_HIST | HIST_ID |
| SUPPLIER_LINE_TRN | SUPPLIER_LINE_TRN_HIST | HIST_ID |
| EAD_SLIP_TRN | EAD_SLIP_TRN_HIST | HIST_ID |
| EAD_LINE_TRN | EAD_LINE_TRN_HIST | HIST_ID |
| PAYMENT_SLIP_TRN | PAYMENT_SLIP_TRN_HIST | HIST_ID |
| PAYMENT_LINE_TRN | PAYMENT_LINE_TRN_HIST | HIST_ID |
| ART_BALANCE_TRN | ART_BALANCE_TRN_HIST | HIST_ID |
| APT_BALANCE_TRN | APT_BALANCE_TRN_HIST | HIST_ID |
| DISCOUNT_REL | DISCOUNT_REL_HIST | HIST_ID |

---

## 2. Soft-Delete Pattern

### 2.1 Cơ chế

Không có cột `IS_DELETED` hoặc `DELETED_AT`. Thay vào đó:

```sql
DEL_FUNC    VARCHAR(255)   -- Set khi xóa (không NULL = đã xóa)
DEL_DATETM  DATETIME       -- Thời điểm xóa
DEL_USER    VARCHAR(30)    -- User xóa
```

- **Soft-delete**: `DEL_DATETM IS NOT NULL` = record đã bị xóa
- Query thông thường phải có `WHERE DEL_DATETM IS NULL`
- **Risk**: Nếu quên điều kiện này → hiển thị record đã xóa

### 2.2 Áp dụng

- Áp dụng cho tất cả MST tables (CUSTOMER_MST, PRODUCT_MST, SUPPLIER_MST, RACK_MST...)
- Transaction tables có thể dùng STATUS = 'X' (canceled) thay vì soft-delete
- Work tables không có DEL columns (truncate hoặc delete khi import xong)

---

## 3. STATUS Transitions

### 3.1 SALES_SLIP_TRN.STATUS (Phiếu bán hàng)

```
[Tạo mới]
    │
    ▼
  "1" = Tạm (Draft/Temporary delivery slip)
    │
    │ [Xác nhận giao hàng]
    ▼
  "2" = Xác nhận (Confirmed)
    │
    │ [Chốt hóa đơn – CloseAction]
    ▼
  "3" = Đã chốt (Bill closed)
    │
    │ [Hủy]
    ▼
  "9" = Hủy (Canceled) [inferred]
```

**Nguồn**: inferred từ `TEMP_DELIVERY_SLIP_FLAG` trong CUSTOMER_MST, `CloseSalesAction` class name

---

### 3.2 BILL_TRN.STATUS (Hóa đơn)

```
[Tạo trong CloseBillAction]
    │
    ▼
  "0" = Mở (Open – sau khi close)
    │
    │ [Thu tiền đủ]
    ▼
  "1" = Đã thanh toán (Paid) [inferred]
    │
    │ [Hủy]
    ▼
  "9" = Hủy [inferred]
```

**Note**: `BILL_CRT_CATEGORY` VARCHAR(2) – phân loại tạo hóa đơn (tự động/thủ công)

---

### 3.3 RO_SLIP_TRN.STATUS (Đơn hàng)

```
[Nhận đơn hàng]
    │
    ▼
  "1" = Mở (Open)
    │
    │ [Tạo SALES_SLIP]
    ▼
  "2" = Đang xử lý (Partial)
    │
    │ [Hoàn thành xuất hàng]
    ▼
  "3" = Hoàn thành (Complete)
    │
    │ [Hủy]
    ▼
  "9" = Hủy
```

---

### 3.4 RO_LINE_TRN.REST_QUANTITY / PO_LINE_TRN.REST_QUANTITY

- `REST_QUANTITY` NOT NULL = số lượng chưa xử lý còn lại
- Khi `REST_QUANTITY = 0` → dòng đã hoàn thành
- Giảm dần khi xuất hàng (sales) hoặc nhập hàng (purchase)

---

### 3.5 PO_SLIP_TRN.STATUS (Đặt hàng NCC)

```
  "0" = Nháp (Draft) [inferred]
    │
    ▼
  "1" = Đã gửi NCC
    │
    │ [Nhập hàng]
    ▼
  "2" = Đang nhập (Partial received)
    │
    │ [Nhập đủ]
    ▼
  "3" = Hoàn thành
```

---

### 3.6 DEPOSIT_SLIP_TRN.STATUS (Phiếu thu)

```
  "0" = Mở
    │
    ▼
  "1" = Đã xác nhận
    │
    │ [Chốt]
    ▼
  "2" = Đã chốt kế toán [inferred]
```

---

### 3.7 PAYMENT_SLIP_TRN.STATUS (Phiếu thanh toán NCC)

```
  "0" = Mở
    │
    ▼
  "1" = Đã thanh toán [inferred]
```

---

## 4. Year-Month Pattern

Nhiều bảng transaction lưu trùng thông tin năm/tháng:

```sql
SALES_ANNUAL  SMALLINT   -- Năm
SALES_MONTHLY SMALLINT   -- Tháng (1-12)
SALES_YM      INT        -- = ANNUAL * 100 + MONTHLY (ví dụ: 202401)
```

- Dùng cho filter, report, và closing operations theo kỳ kế toán
- Pattern lặp lại trong: SALES, RO, DEPOSIT, PO, SUPPLIER, EAD, PAYMENT, BILL, ART_BALANCE, APT_BALANCE

---

## 5. Denormalization Pattern (Snapshot at Creation)

Khi tạo phiếu, thông tin KH/NCC được **copy** vào phiếu (không FK lookup):

```sql
-- SALES_SLIP_TRN có đầy đủ:
CUSTOMER_CODE       -- FK reference
CUSTOMER_NAME       -- snapshot
CUSTOMER_ADDRESS_1  -- snapshot
DELIVERY_CODE       -- FK reference
DELIVERY_NAME       -- snapshot
DELIVERY_ADDRESS_1  -- snapshot
BA_CODE             -- billing address FK
BA_NAME             -- billing address snapshot
-- ...
```

**Lý do**: Bảo toàn thông tin giao dịch kể cả khi KH thay đổi địa chỉ sau

**Áp dụng cho**: SALES_SLIP_TRN, RO_SLIP_TRN, PICKING_LIST_TRN, BILL_TRN, DEPOSIT_SLIP_TRN, PO_SLIP_TRN, SUPPLIER_SLIP_TRN

---

## 6. Closing Operations (Chốt Kỳ)

### 6.1 Bill Closing (CloseBillAction)

**Trigger**: User chọn "Chốt hóa đơn"  
**Input**: Ngày chốt, nhóm chốt (`CUTOFF_GROUP`)  
**Process** (trong HTTP request – không có transaction coordinator):

```
1. Tổng hợp SALES_SLIP_TRN trong kỳ → BILL_TRN (INSERT)
2. Cập nhật SALES_SLIP_TRN.BILL_ID + STATUS
3. Cập nhật CUSTOMER_MST.LAST_CUTOFF_DATE
4. INSERT BILL_TRN_HIST (snapshot)
```

**Risk**: Nếu timeout → BILL_TRN tạo nhưng SALES_SLIP không cập nhật

---

### 6.2 ART Balance Closing (CloseArtAction)

**Trigger**: User chọn "Chốt tài khoản phải thu"  
**Input**: Ngày chốt, tháng kế toán  
**Process**:

```
1. Tổng hợp DEPOSIT_SLIP_TRN + SALES_SLIP_TRN → ART_BALANCE_TRN
2. Cập nhật SALES_SLIP_TRN.ART_ID
3. Cập nhật DEPOSIT_SLIP_TRN.ART_ID
```

---

### 6.3 Stock Closing (CloseStockAction)

**Trigger**: User chọn "Chốt tồn kho tháng"  
**Input**: Tháng kế toán  
**Process**:

```
1. Tính toán PRODUCT_STOCK_TRN cho tháng mới
2. Carry-forward từ tháng trước
```

---

### 6.4 Payment Closing (ClosePaymentAction)

**Trigger**: User chọn "Chốt thanh toán NCC"  
**Input**: Ngày chốt, NCC  
**Process**:

```
1. Tổng hợp SUPPLIER_SLIP_TRN → PAYMENT_SLIP_TRN
2. Tổng hợp → APT_BALANCE_TRN
```

---

## 7. Batch Data Lifecycle

### 7.1 SP_UPDATE_CUSTOMER_RANK

**Trigger**: `UpdateCustomerRank.sh` (cron, không rõ schedule)  
**Input**: `CUSTOMER_MST`, `SALES_SLIP_TRN`, `CUSTOMER_RANK_MST`  
**Output**: Update `CUSTOMER_MST.CUSTOMER_RANK_CATEGORY`  
**Data changed**: Chỉ 1 column trên CUSTOMER_MST

---

### 7.2 SP_UPDATE_PRODUCT_STATUS_CATEGORY & SP_UPDATE_PRODUCT_STOCK_VALUES

**Trigger**: `UpdateProductStatusCategory.sh` (cron)  
**Input**: `PRODUCT_MST`, `SALES_LINE_TRN`, `RO_LINE_TRN`, `PRODUCT_STOCK_TRN`  
**Output**: Update trên PRODUCT_MST:
- `PRODUCT_STATUS_CATEGORY`
- `MINE_SAFETY_STOCK`
- `AVG_SHIP_COUNT`
- `SALES_STANDARD_DEVIATION`
- `TERM_SHIP_NUM`

---

## 8. Import/Export Data Lifecycle

### 8.1 Online Order Import

```
CSV file → ONLINE_ORDER_WORK (truncate & load)
         → Validate & match SKU → PRODUCT_MST
         → CREATE RO_SLIP_TRN + RO_LINE_TRN
         → CREATE ONLINE_ORDER_REL (link)
         → DELETE from ONLINE_ORDER_WORK (sau khi process)
```

### 8.2 Bank Statement Import

```
File bank → BANK_DEPOSIT_WORK (load)
          → Match với BILL_TRN
          → CREATE DEPOSIT_SLIP_TRN + DEPOSIT_LINE_TRN
          → CREATE BANK_DEPOSIT_REL (link)
          → BANK_DEPOSIT_WORK cleared
```

### 8.3 Delivery COD Import

```
Shipper file → DELIVERY_DEPOSIT_WORK (load)
             → Match với SALES_SLIP_TRN (via DELIVERY_SLIP_ID)
             → CREATE DEPOSIT_SLIP_TRN (COD)
             → CREATE DELIVERY_DEPOSIT_REL (link)
             → DELIVERY_DEPOSIT_WORK cleared
```

### 8.4 Invoice Export (Vận đơn)

```
SALES_SLIP_TRN → Transform → INVOICE_DATA_WORK (insert)
INVOICE_DATA_WORK → Export CSV (shipper format)
INVOICE_DATA_WORK cleared after export
```

---

## 9. SEQ_MAKER Lifecycle

```
1. Service cần INSERT vào bảng X
2. Gọi SeqMakerService.getNextSeqId("TABLE_X")
3. UPDATE SEQ_MAKER SET ID = ID + 1 WHERE TABLE_NAME = "TABLE_X"
4. SELECT ID FROM SEQ_MAKER WHERE TABLE_NAME = "TABLE_X"
5. Dùng ID vừa lấy làm PK cho INSERT

⚠️ Race condition: Bước 3-4 không atomic nếu không có row-level lock
Cần verify xem có SELECT ... FOR UPDATE không
```
