# Data Integrity Risks – SalesCube Legacy DB

> **Nguồn**: DDL analysis + service code patterns + batch scripts  
> **Mục đích**: Liệt kê tất cả rủi ro toàn vẹn dữ liệu cần giải quyết khi migrate sang TypeScript  
> **Severity**: 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

---

## 1. Không có Foreign Key Constraints

### R-INT-001: Zero FK Enforcement 🔴 CRITICAL

**Mô tả**: Toàn bộ DDL dùng `ENGINE=INNODB` nhưng **không định nghĩa một FK constraint nào**.

```sql
-- Ví dụ: PO_LINE_TRN có PRODUCT_CODE nhưng:
PRODUCT_CODE  VARCHAR(20)   ,  -- không có REFERENCES PRODUCT_MST(PRODUCT_CODE)
```

**Hậu quả**:
- Có thể INSERT `PRODUCT_CODE` không tồn tại trong PRODUCT_MST
- Có thể DELETE PRODUCT_MST mà không cascade hoặc restrict
- Orphaned records tích lũy theo thời gian
- Không thể biết orphan records đang tồn tại mà không có cleanup job

**Rủi ro khi migrate**: TypeScript ORM (Prisma) sẽ enforce FK nếu được khai báo → break nếu có orphan data

**Khuyến nghị**: Trước migration, chạy audit query:
```sql
-- Ví dụ kiểm tra orphan:
SELECT COUNT(*) FROM SALES_LINE_TRN sl
LEFT JOIN PRODUCT_MST pm ON sl.PRODUCT_CODE = pm.PRODUCT_CODE
WHERE pm.PRODUCT_CODE IS NULL;
```

---

## 2. Không có Unique Constraints

### R-INT-002: Duplicate Master Records 🟠 HIGH

**Mô tả**: Không tìm thấy `UNIQUE` constraint nào trong DDL ngoài PRIMARY KEY.

**Bảng có nguy cơ cao**:
| Bảng | Column dễ bị duplicate | Ảnh hưởng |
|------|-----------------------|-----------|
| `CUSTOMER_MST` | `CUSTOMER_NAME` + `CUSTOMER_TEL` | Trùng khách hàng |
| `PRODUCT_MST` | `JAN_PCODE` (mã vạch) | Trùng sản phẩm |
| `PRODUCT_MST` | `ONLINE_PCODE` (mã EC) | Import EC nhầm |
| `SUPPLIER_MST` | `SUPPLIER_NAME` | Trùng nhà cung cấp |
| `BILL_TRN` | `(CUSTOMER_CODE, BILL_CUTOFF_DATE)` | Double-chốt hóa đơn |

**Rủi ro**: Batch closing có thể tạo BILL_TRN trùng nếu được chạy 2 lần

---

## 3. SEQ_MAKER Race Condition

### R-INT-003: Sequence Generator Not Atomic 🟠 HIGH

**Mô tả**: Custom sequence thay thế AUTO_INCREMENT:

```java
// SeqMakerService (inferred pattern):
UPDATE SEQ_MAKER SET ID = ID + 1 WHERE TABLE_NAME = ?
SELECT ID FROM SEQ_MAKER WHERE TABLE_NAME = ?
// Dùng ID này làm PK
```

**Vấn đề**: Giữa UPDATE và SELECT, một request khác có thể đã increment thêm.

**Điều kiện xảy ra**: Concurrent users tạo cùng loại phiếu đồng thời.

**Hậu quả**: 
- Duplicate PK → INSERT fail → User thấy lỗi
- Hoặc nếu dùng `SELECT FOR UPDATE` thì deadlock potential

**Cần xác minh**: Xem `entity/sql/seqmaker/` có dùng `FOR UPDATE` không:
```
SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity/sql/seqmaker/
```

---

## 4. Denormalized Data Inconsistency

### R-INT-004: Snapshot Columns Out of Sync 🟡 MEDIUM

**Mô tả**: Thông tin KH/NCC được copy vào phiếu khi tạo (snapshot pattern). Điều này là **intentional** cho audit, nhưng tạo ra rủi ro:

**Columns bị denormalize** (ví dụ trong SALES_SLIP_TRN):
```
CUSTOMER_NAME, CUSTOMER_ADDRESS_1, CUSTOMER_ADDRESS_2,
DELIVERY_NAME, DELIVERY_ADDRESS_1, DELIVERY_ADDRESS_2,
BA_CODE, BA_NAME, BA_ADDRESS_1, ...
```

**Rủi ro**:
- Nếu update logic không copy đúng tất cả columns → inconsistent snapshot
- Report tổng hợp dùng CUSTOMER_MST nhưng phiếu dùng snapshot → mismatch
- Khi cancel và re-create phiếu, snapshot có thể khác phiếu gốc

**Số lượng**: 30-50 denormalized columns per slip table, áp dụng cho 8+ bảng TRN

---

## 5. Partial Commit trong Closing Operations

### R-INT-005: No Distributed Transaction 🔴 CRITICAL

**Mô tả**: Các closing operations (CloseBillAction, CloseStockAction, ClosePaymentAction) chạy **trong HTTP request** mà không có saga/compensation pattern.

**Flow nguy hiểm** (CloseBillAction):
```
Step 1: INSERT BILL_TRN ← commit ngay nếu auto-commit
Step 2: UPDATE SALES_SLIP_TRN SET BILL_ID = ? ← timeout ở đây?
Step 3: UPDATE CUSTOMER_MST.LAST_CUTOFF_DATE ← có thể skip
```

**Hậu quả nếu timeout/error ở Step 2**:
- BILL_TRN tồn tại nhưng SALES_SLIP không có BILL_ID
- Phiếu bán "chưa chốt" nhưng hóa đơn đã tạo
- Chạy lại closing sẽ tạo BILL_TRN thứ 2 (duplicate)

**Cần xác minh**: Transaction boundary trong Seasar2 + SAStruts:
- `customizer.dicon` có `@Transaction` interceptor không?
- Nếu có → toàn bộ action method trong 1 transaction

---

## 6. Soft-Delete Pattern Risks

### R-INT-006: DEL_DATETM Filter Miss 🟡 MEDIUM

**Mô tả**: Không có `IS_DELETED` boolean – dùng `DEL_DATETM IS NULL` làm điều kiện.

**Rủi ro**:
- Developer quên thêm `WHERE DEL_DATETM IS NULL` → hiển thị deleted records
- JOIN query không filter → count inflated
- Named SQL files phải manually check mỗi file trong 581 SQL files

**Phát hiện tiềm năng**: Nếu có query không có `DEL_DATETM` filter cho MST tables → data leak

---

## 7. Không có NOT NULL trên Business-Critical Columns

### R-INT-007: NULL trong Critical Fields 🟠 HIGH

**Columns quan trọng có thể NULL** (từ DDL):

| Bảng | Column | Vấn đề nếu NULL |
|------|--------|----------------|
| `CUSTOMER_MST` | `CUSTOMER_CODE` | PK – không NULL nhưng không có NOT NULL keyword |
| `CUSTOMER_MST` | `CUSTOMER_NAME` | Không có NOT NULL |
| `PRODUCT_MST` | `PRODUCT_CODE` | NOT NULL ✅ |
| `PRODUCT_MST` | `PRODUCT_NAME` | NOT NULL ✅ |
| `SALES_SLIP_TRN` | `CUSTOMER_CODE` | Không có NOT NULL |
| `SALES_SLIP_TRN` | `SALES_DATE` | Không có NOT NULL |
| `BILL_TRN` | `BILL_CUTOFF_DATE` | Không có NOT NULL |
| `RO_LINE_TRN` | `REST_QUANTITY` | **NOT NULL** ✅ |
| `PO_LINE_TRN` | `REST_QUANTITY` | **NOT NULL** ✅ |
| `PAYMENT_SLIP_TRN` | `SUPPLIER_CODE` | **NOT NULL** ✅ |
| `PAYMENT_SLIP_TRN` | `PO_SLIP_ID` | **NOT NULL** ✅ |
| `PAYMENT_LINE_TRN` | `PO_LINE_ID` | **NOT NULL** ✅ |
| `PAYMENT_LINE_TRN` | `SUPPLIER_LINE_ID` | **NOT NULL** ✅ |

**Pattern**: Payment tables có NOT NULL nhiều hơn (tài chính quan trọng hơn)

---

## 8. Audit Column Inconsistency

### R-INT-008: DEL_* Columns trong Singleton Table 🟢 LOW

**Mô tả**: MINE_MST (singleton – không có PK) có `DEL_FUNC`, `DEL_DATETM`, `DEL_USER`.  
Nếu bị set → company settings bị "xóa" → system có thể crash.

---

### R-INT-009: HIST Table có thể bị bỏ sót 🟡 MEDIUM

**Mô tả**: HIST được ghi thủ công trong service. Nếu developer tạo service mới mà quên gọi `insertHist()` → không có audit trail.

**Không thể verify** từ DDL – phải check từng service class.

---

## 9. Work Table Cleanup Risk

### R-INT-010: Work Tables Không Được Cleanup 🟡 MEDIUM

**Bảng**: `ONLINE_ORDER_WORK`, `INVOICE_DATA_WORK`, `DELIVERY_DEPOSIT_WORK`, `BANK_DEPOSIT_WORK`

**Pattern**: Import → load vào WORK → process → cleanup WORK

**Rủi ro**:
- Nếu process step fail → WORK không được cleanup
- Lần import tiếp theo: WORK còn data cũ → conflict hoặc duplicate processing
- PK của ONLINE_ORDER_WORK: `(USER_ID, ONLINE_ORDER_ID, ONLINE_ITEM_ID)` – có thể conflict nếu re-import

---

## 10. Multi-Tenant Isolation Risk

### R-INT-011: Tenant Separation bằng Table Suffix 🟠 HIGH

**Mô tả**: Multi-tenancy bằng `_XXXXX` suffix được replace bằng `sed` trong shell scripts.

**Rủi ro**:
```bash
sed -e "s/XXXXX/$DOMAIN/g" script.sql | mysql
# Nếu DOMAIN = "SALES" thì OK
# Nếu DOMAIN = "A;DROP TABLE" → SQL injection trong batch
```

**Rủi ro khác**:
- Không có isolation thực sự (chỉ naming)
- Query cross-tenant có thể xảy ra nếu dùng wrong schema
- Batch script hard-code `DOMAIN=SALES` → chỉ chạy cho 1 tenant

---

## 11. Data Type Risks

### R-INT-012: DECIMAL Precision Mismatch 🟡 MEDIUM

**Vấn đề**: Các DECIMAL columns có precision khác nhau:

| Column Pattern | Precision | Dùng cho |
|---------------|-----------|----------|
| `UNIT_PRICE` | DECIMAL(12,3) | Đơn giá |
| `RETAIL_PRICE` | DECIMAL(15,3) | Thành tiền |
| `CTAX_PRICE` | DECIMAL(12,3) | Thuế |
| `GM` | DECIMAL(15,3) | Lợi nhuận |
| `CTAX_RATE` | DECIMAL(6,3) | Thuế suất |
| `RATE` | DECIMAL(8,3) | Tỷ giá |
| `SALES_STANDARD_DEVIATION` | DECIMAL(12,6) | Độ lệch chuẩn |

**Rủi ro**: Khi tính toán `UNIT_PRICE * QUANTITY` → result vượt precision → rounding error

---

### R-INT-013: FLOAT cho Kích thước/Trọng lượng 🟡 MEDIUM

**Mô tả**: PRODUCT_MST dùng FLOAT cho dimensions:
```sql
WIDTH   FLOAT
DEPTH   FLOAT
HEIGHT  FLOAT
WEIGHT  FLOAT(15)
LENGTH  FLOAT(15)
```

**Rủi ro**: FLOAT không exact → arithmetic errors khi tính volume/weight cho logistics

---

## 12. Batch Processing Risks

### R-INT-014: Batch Chạy trong Business Hours 🟠 HIGH

**Mô tả**: Không có schedule rõ ràng. Nếu batch chạy ban ngày:

```
SP_UPDATE_CUSTOMER_RANK:
- READ CUSTOMER_MST (lock?)
- READ SALES_SLIP_TRN (long table scan)
- UPDATE CUSTOMER_MST.CUSTOMER_RANK_CATEGORY

Concurrent user đang tạo phiếu bán → lock wait → timeout
```

---

### R-INT-015: Không có Idempotency cho Batch 🟡 MEDIUM

**Mô tả**: Nếu batch chạy 2 lần:
- SP_UPDATE_CUSTOMER_RANK: OK (update, không insert)
- SP_UPDATE_PRODUCT_STATUS_CATEGORY: OK (update)
- Closing operations: **NOT OK** – tạo duplicate BILL_TRN

---

## 13. Tổng hợp Priority cho Migration

| ID | Risk | Severity | Action cần thiết |
|----|------|---------|-----------------|
| R-INT-001 | Zero FK enforcement | 🔴 | Audit orphan data trước migration; thêm FK trong Prisma schema |
| R-INT-002 | Duplicate master records | 🟠 | Chạy dedup report; thêm unique constraints |
| R-INT-003 | SEQ_MAKER race condition | 🟠 | Replace bằng DB AUTO_INCREMENT hoặc UUID trong TypeScript |
| R-INT-004 | Snapshot inconsistency | 🟡 | Document các columns cần snapshot; viết test |
| R-INT-005 | Partial commit closing | 🔴 | Implement saga pattern hoặc compensation logic |
| R-INT-006 | Soft-delete filter miss | 🟡 | Prisma middleware tự động filter deleted records |
| R-INT-007 | NULL critical fields | 🟠 | Thêm NOT NULL trong Prisma schema; validate trước migrate |
| R-INT-008 | MINE_MST DEL columns | 🟢 | Bỏ DEL columns trong singleton |
| R-INT-009 | HIST không nhất quán | 🟡 | Implement audit via Prisma middleware (tự động) |
| R-INT-010 | Work table cleanup | 🟡 | Thêm cleanup step trong import flow |
| R-INT-011 | Multi-tenant by suffix | 🟠 | Thiết kế lại multi-tenancy (schema-per-tenant hoặc row-level) |
| R-INT-012 | DECIMAL precision | 🟡 | Standardize precision trong Prisma; dùng Decimal.js |
| R-INT-013 | FLOAT dimensions | 🟡 | Chuyển sang DECIMAL trong schema mới |
| R-INT-014 | Batch trong giờ làm | 🟠 | Implement job queue với lock; schedule off-hours |
| R-INT-015 | Batch không idempotent | 🟡 | Thêm idempotency key cho closing operations |

---

## 14. Audit Queries để Verify Trước Migration

```sql
-- 1. Orphan SALES_LINE_TRN (product không tồn tại)
SELECT COUNT(*) AS orphan_sales_lines
FROM SALES_LINE_TRN_SALES sl
WHERE NOT EXISTS (
  SELECT 1 FROM PRODUCT_MST_SALES pm
  WHERE pm.PRODUCT_CODE = sl.PRODUCT_CODE
);

-- 2. Duplicate bills (customer + cutoff date)
SELECT CUSTOMER_CODE, BILL_CUTOFF_DATE, COUNT(*) AS cnt
FROM BILL_TRN_SALES
GROUP BY CUSTOMER_CODE, BILL_CUTOFF_DATE
HAVING cnt > 1;

-- 3. SALES_SLIP với BILL_ID nhưng BILL không tồn tại
SELECT COUNT(*) AS orphan_billed_slips
FROM SALES_SLIP_TRN_SALES ss
WHERE ss.BILL_ID IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM BILL_TRN_SALES bt WHERE bt.BILL_ID = ss.BILL_ID
);

-- 4. RO_LINE với REST_QUANTITY âm (lỗi logic)
SELECT COUNT(*) AS negative_rest
FROM RO_LINE_TRN_SALES
WHERE REST_QUANTITY < 0;

-- 5. Soft-deleted records vẫn còn FK reference
SELECT COUNT(*) AS deleted_product_in_use
FROM PRODUCT_MST_SALES pm
WHERE pm.DEL_DATETM IS NOT NULL
AND EXISTS (
  SELECT 1 FROM SALES_LINE_TRN_SALES sl WHERE sl.PRODUCT_CODE = pm.PRODUCT_CODE
    AND sl.DEL_DATETM IS NULL
);

-- 6. SEQ_MAKER gaps (PK không liên tục)
-- Cần check từng bảng cụ thể

-- 7. PAYMENT_LINE với PO_LINE_ID không tồn tại
SELECT COUNT(*) AS orphan_payment_lines
FROM PAYMENT_LINE_TRN_SALES pl
WHERE NOT EXISTS (
  SELECT 1 FROM PO_LINE_TRN_SALES pol WHERE pol.PO_LINE_ID = pl.PO_LINE_ID
);
```
