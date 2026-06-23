# WF-15 – Batch Cập Nhật Rank Khách Hàng & Tồn Kho

**Confidence**: HIGH – Xác nhận từ shell scripts, stored procedures trong DB/batch/  
**Loại**: Background batch workflow (không có HTTP)

---

## Entry Route
```sh
# Trigger: cron job hoặc manual execution
./SalesCube/DB/batch/salescube_batch/UpdateCustomerRank.sh
./SalesCube/DB/batch/salescube_batch/UpdateProductStatusCategory.sh
./SalesCube/DB/batch/salescube_batch/UpdateProductStockValues.sh
```

## User Role
- Không có user role – chạy với DB user `salescube` (inferred)
- Batch domain hard-coded: `DOMAIN=SALES`

---

## Main Code Path

### A. UpdateCustomerRank

```sh
# UpdateCustomerRank.sh
DOMAIN="SALES"
mysql -u$USER -p$PASS $DB << EOF
CALL SP_UPDATE_CUSTOMER_RANK('$DOMAIN');
EOF

# SP_UPDATE_CUSTOMER_RANK(domain):
1. SELECT CUSTOMER_MST (tất cả KH active)
2. For each KH:
   → SELECT COUNT(*) FROM RO_SLIP_TRN WHERE CUSTOMER_CODE = ?
     → RO_COUNT (số đơn hàng)
   → SELECT SUM(SALES_PRICE_TOTAL) FROM SALES_SLIP_TRN WHERE CUSTOMER_CODE = ?
     → Monthly/yearly average
   → SELECT ENROLL_TERM (tính thời gian từ FIRST_SALES_DATE)
   → Match criteria → CUSTOMER_RANK_MST
     (RO_COUNT_FROM ≤ count ≤ RO_COUNT_TO)
     (RO_MONTHLY_AVG_FROM ≤ avg ≤ RO_MONTHLY_AVG_TO)
   → UPDATE CUSTOMER_MST.CUSTOMER_RANK_CATEGORY = matched RANK_CODE
3. COMMIT
```

### B. UpdateProductStatusCategory

```sh
# UpdateProductStatusCategory.sh
DOMAIN="SALES"
mysql ... << EOF
CALL SP_UPDATE_PRODUCT_STATUS_CATEGORY('$DOMAIN');
EOF

# SP_UPDATE_PRODUCT_STATUS_CATEGORY(domain):
1. SELECT PRODUCT_MST (tất cả sản phẩm active)
2. For each product:
   → SELECT STOCK_NUM FROM PRODUCT_STOCK_TRN
     WHERE PRODUCT_CODE = ? AND ANNUAL=current AND MONTHLY=current
   → Compare STOCK_NUM vs MINE_SAFETY_STOCK
   → Determine PRODUCT_STATUS_CATEGORY:
     "01" = 在庫あり (Có hàng)
     "02" = 在庫少 (Tồn kho thấp)
     "03" = 在庫なし (Hết hàng)
     "04" = 廃番 (Ngừng sản xuất – DISCARD_DATE <= TODAY)
   → UPDATE PRODUCT_MST.PRODUCT_STATUS_CATEGORY
3. COMMIT
```

### C. UpdateProductStockValues

```sh
# SP_UPDATE_PRODUCT_STOCK_VALUES(domain):
1. For each product:
   → Calculate AVG_SHIP_COUNT (N tháng gần nhất từ PRODUCT_STOCK_TRN.DISPATCH_NUM)
   → Calculate SALES_STANDARD_DEVIATION (độ lệch chuẩn doanh số)
   → Calculate MINE_SAFETY_STOCK:
     MINE_SAFETY_STOCK = AVG_SHIP_COUNT * LEAD_TIME * SAFETY_COEFFICIENT
                        + Z * SALES_STANDARD_DEVIATION * sqrt(LEAD_TIME)
     (dùng MINE_MST.SAFETY_COEFFICIENT và DEFICIENCY_RATE)
   → UPDATE PRODUCT_MST:
     SET AVG_SHIP_COUNT = ?
       , SALES_STANDARD_DEVIATION = ?
       , MINE_SAFETY_STOCK = ?
       , TERM_SHIP_NUM = ?
2. COMMIT
```

---

## Controllers / Services / Models

| Layer | Class/File | Vai trò |
|-------|-----------|---------|
| Shell | `UpdateCustomerRank.sh` | Trigger SP A |
| Shell | `UpdateProductStatusCategory.sh` | Trigger SP B + C |
| Stored Proc | `SP_UPDATE_CUSTOMER_RANK` | MySQL SP |
| Stored Proc | `SP_UPDATE_PRODUCT_STATUS_CATEGORY` | MySQL SP |
| Stored Proc | `SP_UPDATE_PRODUCT_STOCK_VALUES` | MySQL SP |
| – | `CUSTOMER_MST` | Target table A |
| – | `CUSTOMER_RANK_MST` | Criteria lookup |
| – | `PRODUCT_MST` | Target table B+C |
| – | `PRODUCT_STOCK_TRN` | Source data |
| – | `MINE_MST` | Policy params (SAFETY_COEFFICIENT, DEFICIENCY_RATE) |

---

## Database Tables

**READ**:
- `CUSTOMER_MST` – tất cả KH active
- `CUSTOMER_RANK_MST` – tiêu chí xếp hạng
- `SALES_SLIP_TRN` – doanh số KH
- `RO_SLIP_TRN` – số đơn hàng KH
- `PRODUCT_MST` – tất cả sản phẩm active
- `PRODUCT_STOCK_TRN` – tồn kho N tháng
- `MINE_MST` – `SAFETY_COEFFICIENT`, `DEFICIENCY_RATE`, `CLOSE_MONTH`
- `SEQ_MAKER` – không dùng (batch không INSERT)

**WRITE**:
- `CUSTOMER_MST.CUSTOMER_RANK_CATEGORY` – UPDATE
- `PRODUCT_MST.PRODUCT_STATUS_CATEGORY` – UPDATE
- `PRODUCT_MST.AVG_SHIP_COUNT` – UPDATE
- `PRODUCT_MST.SALES_STANDARD_DEVIATION` – UPDATE
- `PRODUCT_MST.MINE_SAFETY_STOCK` – UPDATE
- `PRODUCT_MST.TERM_SHIP_NUM` – UPDATE

---

## Validation Rules

- Không có input validation (batch không có user input)
- Giả định data consistency từ application layer
- `DISCARD_DATE <= TODAY` → `PRODUCT_STATUS_CATEGORY = "04"` (hardcode rule)
- `LEAD_TIME` NULL → dùng default value (inferred)
- `AVG_SHIP_COUNT` = 0 → `MINE_SAFETY_STOCK` = 0 (no-demand product)

---

## Status Transitions

```
CUSTOMER_MST.CUSTOMER_RANK_CATEGORY:
  Bất kỳ → (batch chạy) → RANK_CODE mới
  [Không thay đổi nếu không đủ tiêu chí]

PRODUCT_MST.PRODUCT_STATUS_CATEGORY:
  Bất kỳ → (batch chạy) → "01"/"02"/"03"/"04"
  [Dynamic – thay đổi theo tồn kho thực tế]
```

---

## External Integrations

- **MySQL stored procedures** – business logic trong DB, không phải Java
- **Cron job** – schedule không rõ ràng từ code
- **Single tenant**: `DOMAIN=SALES` hard-coded trong shell script (chỉ chạy cho 1 tenant)
- **Không có notification** sau khi batch chạy xong

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| MySQL connection fail | Shell script exit code ≠ 0, không có retry |
| SP runtime error | MySQL error log, transaction rollback |
| Partial update | Không có compensation – SP phải atomic |
| Lock wait timeout | MySQL default 50s lock wait → deadlock |

---

## Risks

1. **No schedule visibility**: Không biết batch chạy lúc nào → có thể conflict với giờ làm việc
2. **Hard-coded DOMAIN**: Chỉ update cho `SALES` domain, multi-tenant không hoạt động
3. **No idempotency key**: Chạy 2 lần cùng lúc → race condition UPDATE CUSTOMER_RANK
4. **Long table scan**: `SELECT * FROM PRODUCT_MST` không có index hint → slow trên production
5. **Logic trong DB**: Không có unit test cho stored procedure

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `DB/batch/salescube_batch/UpdateCustomerRank.sh` | all | Shell script |
| `DB/batch/salescube_batch/UpdateProductStatusCategory.sh` | all | Shell script |
| `DB/sql/createtable/CREATE.sql` | 560-619 | CUSTOMER_MST (CUSTOMER_RANK_CATEGORY) |
| `DB/sql/createtable/CREATE.sql` | 158-243 | PRODUCT_MST (PRODUCT_STATUS_CATEGORY, MINE_SAFETY_STOCK...) |
| `DB/sql/createtable/CREATE.sql` | 1-91 | MINE_MST (SAFETY_COEFFICIENT, DEFICIENCY_RATE) |
| `output/05-background-jobs.md` | all | Phân tích batch đã có |
