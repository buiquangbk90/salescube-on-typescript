# 05 – Background Jobs & Batch Processing

> **Trạng thái**: Xác nhận từ source code  
> **Nguồn**: `SalesCube/DB/batch/`

---

## 1. Tổng quan

SalesCube không có job scheduler tích hợp (không có Quartz, Spring Batch, hay cron trong WAR). Tất cả batch jobs được thực thi qua **shell scripts + MySQL stored procedures**, gọi từ crontab bên ngoài ứng dụng.

**KHÔNG có**: Background thread, queue worker, message broker, hay async job nào trong Java code (cần xác minh thêm).

---

## 2. Batch Scripts

### 2.1. Entry Point (CallProc.sh)

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/CallProc.sh:1-23`

```bash
#!/bin/sh
DOMAIN=SALES
LOG_FILE=/home/$DOMAIN/$BATCH_NAME.log
cat $BATCH_NAME.sql | sed -e s/XXXXX/$DOMAIN/ | /usr/bin/mysql salesweb -u salesweb --password=salesweb
```

**Quan sát**:
- DOMAIN hard-coded là `SALES`
- DB user trong batch: `salesweb` (khác với app user `salescube`) ⚠️
- Log ghi vào `/home/SALES/{BATCH_NAME}.log`
- Exit code truyền lại cho caller

---

### 2.2. Job 1: UpdateCustomerRank

**Shell**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/UpdateCustomerRank.sh`

```bash
BATCH_NAME=UpdateCustomerRank
./CallProc.sh
```

**SQL Wrapper**: `UpdateCustomerRank.sql`  
**Stored Procedure**: `SP_UPDATE_CUSTOMER_RANK_SALES.sql` (91KB)

**Mục đích**: Cập nhật xếp hạng khách hàng (`CUSTOMER_RANK_CATEGORY` trong `CUSTOMER_MST`) dựa trên lịch sử mua hàng, tần suất đặt hàng, doanh số.

**Tables liên quan** (inferred từ SP name và schema):
- Read: `RO_SLIP_TRN_XXXXX`, `SALES_SLIP_TRN_XXXXX`, `CUSTOMER_MST_XXXXX`
- Read: `CUSTOMER_RANK_MST_XXXXX` (criteria: RO_COUNT_FROM/TO, ENROLL_TERM_FROM/TO, RO_MONTHLY_AVG_FROM/TO)
- Write: `CUSTOMER_MST_XXXXX` (CUSTOMER_RANK_CATEGORY)
- Write: `CUSTOMER_RANK_SUMMARY_XXXXX`

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/UpdateCustomerRank.sql`

---

### 2.3. Job 2: UpdateProductStatusCategory

**Shell**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/UpdateProductStatusCategory.sh`

```bash
BATCH_NAME=UpdateProductStatusCategory
./CallProc.sh
```

**SQL Wrapper**: `UpdateProductStatusCategory.sql`  
**Stored Procedure**: `SP_UPDATE_PRODUCT_STATUS_CATEGORY_SALES.sql` (69KB)

**Mục đích**: Cập nhật trạng thái sản phẩm (`PRODUCT_STATUS_CATEGORY`) dựa trên tồn kho, lịch đặt hàng, ngày hết hạn.

**Tables liên quan** (inferred):
- Read: `PRODUCT_MST_XXXXX`, `PRODUCT_STOCK_TRN_XXXXX`
- Read: `PO_LINE_TRN_XXXXX`, `RO_LINE_TRN_XXXXX`
- Write: `PRODUCT_MST_XXXXX` (PRODUCT_STATUS_CATEGORY)

---

### 2.4. Job 3: UpdateProductStockIndexValues

**Shell**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/salescube_batch/UpdateProductStockIndexValues.sh`

```bash
BATCH_NAME=UpdateProductStockIndexValues
./CallProc.sh
```

**SQL Wrapper**: `UpdateProductStockIndexValues.sql`  
**Stored Procedure**: `SP_UPDATE_PRODUCT_STOCK_VALUES_SALES.sql` (78KB)

**Mục đích**: Cập nhật các chỉ số kho: AVG_SHIP_COUNT, SALES_STANDARD_DEVIATION, MINE_SAFETY_STOCK, safety stock.

**Tables liên quan** (inferred):
- Read: `SALES_LINE_TRN_XXXXX`, `PRODUCT_STOCK_TRN_XXXXX`
- Write: `PRODUCT_MST_XXXXX` (AVG_SHIP_COUNT, MAX_STOCK_NUM, SALES_STANDARD_DEVIATION, MINE_SAFETY_STOCK)

---

## 3. Stored Procedures Đăng ký

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/DB/batch/ENTRY_PROCEDURE.sql:1-6`

```sql
SOURCE ./sp/SP_UPDATE_CUSTOMER_RANK_SALES.sql
SOURCE ./sp/SP_UPDATE_PRODUCT_STATUS_CATEGORY_SALES.sql
SOURCE ./sp/SP_UPDATE_PRODUCT_STOCK_VALUES_SALES.sql
SOURCE ./sp/SP_UPDATE_STDDEV_WORK_SALES.sql
SOURCE ./sp/SP_WRITE_LOG.sql
```

| Stored Procedure | Size | Mục đích |
|-----------------|------|----------|
| `SP_UPDATE_CUSTOMER_RANK_SALES` | 91KB | Cập nhật xếp hạng KH |
| `SP_UPDATE_PRODUCT_STATUS_CATEGORY_SALES` | 69KB | Cập nhật trạng thái sản phẩm |
| `SP_UPDATE_PRODUCT_STOCK_VALUES_SALES` | 78KB | Cập nhật chỉ số tồn kho |
| `SP_UPDATE_STDDEV_WORK_SALES` | 74KB | Cập nhật độ lệch chuẩn (statistical deviation) |
| `SP_WRITE_LOG` | 491 bytes | Ghi log vào DB |

**Tổng**: ~312KB stored procedure code

---

## 4. Cron Schedule (Inferred – KHÔNG có trong source)

Không có cron config trong repository. Dựa trên nghiệp vụ, ước tính lịch chạy:

| Job | Tần suất khuyến nghị | Lý do |
|-----|---------------------|-------|
| UpdateCustomerRank | Hàng ngày (đêm) | Xếp hạng dựa trên lịch sử mua |
| UpdateProductStatusCategory | Hàng ngày (sáng) | Phụ thuộc vào đơn hàng hàng ngày |
| UpdateProductStockIndexValues | Hàng ngày (đêm) | Tính toán thống kê |
| SP_UPDATE_STDDEV_WORK | Hàng ngày | Tính độ lệch chuẩn bán hàng |

**⚠️ CẢNH BÁO**: Lịch cron thực tế KHÔNG được xác nhận từ source code.

---

## 5. Online Processing (không phải batch)

Một số "batch-like" operations được thực hiện **trong web request** (không phải background job):

| Operation | Action Class | Trigger |
|-----------|-------------|---------|
| 請求締処理 (Bill closing) | `CloseBillAction.java` | User thủ công click |
| 売掛締処理 (AR closing) | `CloseArtBalanceAction.java` | User thủ công click |
| 支払実績締処理 (AP closing) | `ClosePaymentAction.java` | User thủ công click |
| 在庫締処理 (Stock closing) | `CloseStockAction.java` | User thủ công click |
| 顧客ランク更新 (Customer rank update) | Inferred từ `CustomerRankService.java` | Có thể cả tự động |

**Rủi ro**: Các closing operations trong web request có thể gây timeout nếu data lớn.

---

## 6. Import Jobs (batch trong UI)

Các import từ external systems thực hiện qua UI nhưng có tính chất batch:

| Feature | Action Class | Data Source |
|---------|-------------|-------------|
| Import đơn online | `ImportOnlineOrderAction.java` | File CSV/Excel |
| Import sao kê NH | `ImportBankDepositAction.java` (12KB) | Bank statement file |
| Import thu vận chuyển | `ImportDeliveryDepositAction.java` (20KB) | Shipper data file |
| Import mã bưu điện | `ImportZipCodeCSVAction.java` (5KB) | Japan Post CSV |
| Import sản phẩm Excel | `ImportProductExcelAction.java` (3KB) | Excel file |

---

## 7. Rủi ro & Quan sát

- **Hard-coded domain** `SALES` trong batch – không đa tenant
- **Hard-coded credentials** trong CallProc.sh: `salesweb/salesweb`
- **Không có error handling** tốt trong shell script (chỉ check exit code)
- **Không có retry logic** khi stored procedure thất bại
- **Không có monitoring** tích hợp
- **Log chỉ ghi file** – không alert hệ thống
- `SP_UPDATE_STDDEV_WORK_SALES.sql` (74KB) – không có shell wrapper riêng, cách gọi chưa rõ
