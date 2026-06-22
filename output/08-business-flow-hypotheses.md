# 08 – Business Flow Hypotheses

> **Trạng thái**: Kết hợp xác nhận từ code và suy luận (mỗi phần được đánh dấu rõ)  
> **Nguồn**: Action classes, Service classes, DB schema, MENU_MST.sql

---

## 1. Flow Tổng quan (Core Order-to-Cash)

```
[見積] Báo giá
    │ inputEstimate → ESTIMATE_SHEET_TRN + ESTIMATE_LINE_TRN
    │ (optional – không bắt buộc)
    ▼
[受注] Nhận đơn
    │ inputROrder → RO_SLIP_TRN + RO_LINE_TRN
    │ (có thể import từ online: importOnlineOrder)
    ▼
[売上] Bán hàng
    │ inputSales → SALES_SLIP_TRN + SALES_LINE_TRN
    │           → PRODUCT_STOCK_TRN (trừ tồn kho)
    ▼
[請求] Lập hóa đơn
    │ closeBill → BILL_TRN (theo kỳ cutoff)
    │ makeOutBill → In hóa đơn (JasperReport PDF)
    ▼
[入金] Thu tiền
    │ inputDeposit → DEPOSIT_SLIP_TRN + DEPOSIT_LINE_TRN
    │ (có thể import: importBankDeposit / importDeliveryDeposit)
    ▼
[売掛締] Chốt phải thu
    │ closeArtBalance → ART_BALANCE_TRN
```

---

## 2. Flow Tổng quan (Procure-to-Pay)

```
[発注] Đặt hàng NCC
    │ inputPOrder → PO_SLIP_TRN + PO_LINE_TRN
    ▼
[仕入] Nhập hàng
    │ inputPurchase → SUPPLIER_SLIP_TRN + SUPPLIER_LINE_TRN
    │              → PRODUCT_STOCK_TRN (cộng tồn kho)
    ▼
[支払] Thanh toán NCC
    │ inputPayment → PAYMENT_SLIP_TRN + PAYMENT_LINE_TRN
    │ closePayment → APT_BALANCE_TRN
```

---

## 3. Flow Chi tiết: Login

**Entry point**: `GET /login/{domainId}`  
**Action**: `LoginAction.index()` → `LoginAction.login()`  
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/LoginAction.java:76-248`

```
Input: domainId (URL path), userId (form), password (form)
    │
    ├── DomainService.findById(domainId)
    │   └── Read: DOMAIN_MST_XXXXX
    │
    ├── MineService.findMine()
    │   └── Read: MINE_MST_XXXXX (totalFailCount, passwordPolicy)
    │
    ├── UserService.findByUserId(userId)
    │   └── Read: USER_MST_XXXXX
    │
    ├── EncryptUtil.encrypt(password) → AES-128
    │
    ├── [Fail path] UserService.updateFailCount()
    │   └── Write: USER_MST_XXXXX (FAIL_COUNT, LOCK_FLG)
    │
    ├── [Success path]
    │   ├── UserService.resetFailCount()
    │   │   └── Write: USER_MST_XXXXX (FAIL_COUNT=0, LOCK_FLG="0")
    │   │
    │   ├── MenuService.findMenuByUserId(userId)
    │   │   └── Read: MENU_MST_XXXXX JOIN GRANT_ROLE_XXXXX
    │   │
    │   ├── MineService.findMine() → MineDto (session)
    │   │
    │   └── Check password expiry
    │       ├── Expired → redirect /setting/changePassword
    │       └── OK → redirect /menu
    │
Output: Session (domainDto, userDto, mineDto) + redirect
DB touched: DOMAIN_MST, MINE_MST, USER_MST, MENU_MST, GRANT_ROLE
```

---

## 4. Flow Chi tiết: Nhập Phiếu Bán hàng (売上入力)

**Entry point**: `GET /sales/inputSales`  
**Action**: `InputSalesAction.index()`  
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/sales/InputSalesAction.java`

```
[Phase 1 - Hiển thị form]
GET /sales/inputSales
    │
    ├── AbstractSlipEditAction.index()
    │   ├── form.reset() + form.initialize()
    │   ├── createList() → Load dropdowns:
    │   │   ├── Read: CUSTOMER_MST (customer dropdown)
    │   │   ├── Read: WAREHOUSE_MST (warehouse dropdown)
    │   │   ├── Read: CATEGORY_TRN (enum values)
    │   │   └── Read: TAX_RATE_MST (tax rates)
    │   └── Trả về sales/inputSales.jsp

[Phase 2 - Chọn đơn hàng (từ RO)]
    │ AJAX: /ajax/searchROrderForSales
    │   └── Read: RO_SLIP_TRN + RO_LINE_TRN

[Phase 3 - Submit phiếu bán hàng]
POST /sales/inputSales/register
    │
    ├── SalesService.registerSalesSlip()
    │   ├── SeqMakerService.getNextSeqId("SALES_SLIP_TRN")
    │   │   └── Write: SEQ_MAKER_XXXXX
    │   │
    │   ├── Write: SALES_SLIP_TRN_XXXXX (INSERT)
    │   ├── Write: SALES_SLIP_TRN_HIST_XXXXX (audit)
    │   │
    │   ├── for each line:
    │   │   ├── Write: SALES_LINE_TRN_XXXXX (INSERT)
    │   │   └── Write: SALES_LINE_TRN_HIST_XXXXX
    │   │
    │   ├── Update stock:
    │   │   ├── Read: PRODUCT_STOCK_TRN_XXXXX (current stock)
    │   │   └── Write: PRODUCT_STOCK_TRN_XXXXX (DISPATCH_NUM +quantity)
    │   │
    │   └── Update RO_LINE status:
    │       ├── Read: RO_LINE_TRN_XXXXX
    │       └── Write: RO_LINE_TRN_XXXXX (REST_QUANTITY, STATUS)
    │
Output: SALES_SLIP_ID, redirect sang search hoặc in phiếu
DB touched: SEQ_MAKER, SALES_SLIP_TRN, SALES_LINE_TRN,
            PRODUCT_STOCK_TRN, RO_LINE_TRN + tất cả HIST
```

---

## 5. Flow Chi tiết: Chốt Hóa đơn (請求締処理)

**Entry point**: `GET /bill/closeBill`  
**Action**: `CloseBillAction.index()`  
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/bill/CloseBillAction.java`

```
[Phase 1 - Hiển thị điều kiện]
GET /bill/closeBill
    ├── Load MINE_MST (cutoff settings)
    └── Trả về bill/closeBill.jsp

[Phase 2 - Chạy chốt]
POST /bill/closeBill/execute
    │
    ├── BillService.closeBill(cutoffDate, cutoffGroup)
    │   ├── Read: SALES_SLIP_TRN (unbilled sales)
    │   ├── Tổng hợp theo CUSTOMER + CUTOFF_GROUP
    │   │
    │   ├── for each customer:
    │   │   ├── SeqMakerService.getNextSeqId("BILL_TRN")
    │   │   ├── Write: BILL_TRN_XXXXX (INSERT)
    │   │   ├── Write: BILL_TRN_HIST_XXXXX
    │   │   │
    │   │   └── Update SALES_SLIP_TRN:
    │   │       └── Write: SALES_SLIP_TRN.BILL_ID = billId
    │   │
    │   └── Write: ART_BALANCE_TRN (AR balance)
    │
Output: Số lượng hóa đơn tạo, redirect
DB touched: SALES_SLIP_TRN, BILL_TRN, ART_BALANCE_TRN, SEQ_MAKER + HIST
```

---

## 6. Flow Chi tiết: Thu tiền (入金入力)

**Entry point**: `GET /deposit/inputDeposit`  
**Action**: `InputDepositAction.index()`

```
[Phase 1 - Hiển thị form]
GET /deposit/inputDeposit
    ├── Load customers, payment methods (dropdowns)
    └── Trả về deposit/inputDeposit.jsp

[Phase 2 - Submit]
POST /deposit/inputDeposit/register
    │
    ├── DepositSlipService.registerDepositSlip()
    │   ├── SeqMakerService.getNextSeqId("DEPOSIT_SLIP_TRN")
    │   ├── Write: DEPOSIT_SLIP_TRN_XXXXX
    │   ├── Write: DEPOSIT_SLIP_TRN_HIST_XXXXX
    │   │
    │   ├── for each line:
    │   │   ├── Write: DEPOSIT_LINE_TRN_XXXXX
    │   │   └── Write: DEPOSIT_LINE_TRN_HIST_XXXXX
    │   │
    │   └── Update BILL_TRN:
    │       ├── Read: BILL_TRN (outstanding bills)
    │       └── Write: BILL_TRN (apply payment, update balance)
    │
DB touched: DEPOSIT_SLIP_TRN, DEPOSIT_LINE_TRN, BILL_TRN, SEQ_MAKER + HIST
```

---

## 7. Flow Chi tiết: Import Đơn Online (オンライン受注データ取込)

**Entry point**: `GET /rorder/importOnlineOrder`  
**Action**: `ImportOnlineOrderAction`

```
[Phase 1 - Upload file]
POST /rorder/importOnlineOrder/upload
    ├── Parse CSV/Excel file
    ├── Validate data
    └── Write: ONLINE_ORDER_WORK_XXXXX (staging)

[Phase 2 - Confirm & Import]
POST /rorder/importOnlineOrder/import
    ├── Read: ONLINE_ORDER_WORK_XXXXX
    │
    ├── for each online order:
    │   ├── Match với customer: Read CUSTOMER_MST
    │   ├── Match với product: Read PRODUCT_MST
    │   │
    │   ├── Write: RO_SLIP_TRN_XXXXX (INSERT)
    │   ├── Write: RO_LINE_TRN_XXXXX
    │   └── Write: ONLINE_ORDER_REL_XXXXX (link)
    │
DB touched: ONLINE_ORDER_WORK, RO_SLIP_TRN, RO_LINE_TRN, ONLINE_ORDER_REL
```

---

## 8. Flow Chi tiết: Batch – Cập nhật Xếp hạng Khách hàng

**Entry point**: `UpdateCustomerRank.sh` (cron)  
**Stored Procedure**: `SP_UPDATE_CUSTOMER_RANK_SALES.sql`

```
Input: Không có (tự động)
    │
    ├── SP_WRITE_LOG('START UpdateCustomerRank')
    │   └── Write: LOG table
    │
    ├── Tính toán tổng hợp KH:
    │   ├── Read: SALES_SLIP_TRN (doanh số theo KH theo tháng)
    │   ├── Read: RO_SLIP_TRN (số đơn hàng)
    │   ├── Read: CUSTOMER_MST (FIRST_SALES_DATE, LAST_SALES_DATE)
    │   └── Read: CUSTOMER_RANK_MST (criteria thứ hạng)
    │
    ├── for each customer:
    │   ├── Tính: enroll_term (tháng từ first_sales)
    │   ├── Tính: defect_term (tháng từ last_sales)
    │   ├── Tính: ro_monthly_avg (doanh số trung bình/tháng)
    │   ├── Tính: ro_count (số đơn hàng)
    │   ├── Match với CUSTOMER_RANK_MST criteria
    │   └── Write: CUSTOMER_MST (CUSTOMER_RANK_CATEGORY)
    │
    ├── Write: CUSTOMER_RANK_SUMMARY_XXXXX
    │
    └── SP_WRITE_LOG('END UpdateCustomerRank')
    
Output: CUSTOMER_MST.CUSTOMER_RANK_CATEGORY updated
DB touched: SALES_SLIP_TRN, RO_SLIP_TRN, CUSTOMER_MST, CUSTOMER_RANK_MST,
            CUSTOMER_RANK_SUMMARY, LOG table
```

---

## 9. Flow Chi tiết: Nhập hàng → Tồn kho (仕入 → 在庫)

```
[inputPurchase] Nhập phiếu nhập hàng
    │
    ├── Write: SUPPLIER_SLIP_TRN + SUPPLIER_LINE_TRN
    │
    └── Update stock:
        ├── Read: PRODUCT_STOCK_TRN (current)
        └── Write: PRODUCT_STOCK_TRN (ENTER_NUM + quantity, STOCK_NUM + quantity)

[Kết quả]: PRODUCT_STOCK_TRN.STOCK_NUM tăng lên
```

---

## 10. Danh sách DB Tables Được Chạm theo Flow

| Flow | Tables Read | Tables Write |
|------|-------------|-------------|
| Login | DOMAIN_MST, MINE_MST, USER_MST, MENU_MST, GRANT_ROLE | USER_MST |
| Nhập bán hàng | CUSTOMER_MST, PRODUCT_MST, TAX_RATE_MST, RO_SLIP_TRN, RO_LINE_TRN, PRODUCT_STOCK_TRN, SEQ_MAKER | SALES_SLIP_TRN, SALES_LINE_TRN, PRODUCT_STOCK_TRN, RO_LINE_TRN, SEQ_MAKER + HIST |
| Chốt hóa đơn | SALES_SLIP_TRN, CUSTOMER_MST, SEQ_MAKER | BILL_TRN, ART_BALANCE_TRN, SALES_SLIP_TRN + HIST |
| Thu tiền | BILL_TRN, CUSTOMER_MST, SEQ_MAKER | DEPOSIT_SLIP_TRN, DEPOSIT_LINE_TRN, BILL_TRN + HIST |
| Nhập hàng | PRODUCT_MST, SUPPLIER_MST, PRODUCT_STOCK_TRN, SEQ_MAKER | SUPPLIER_SLIP_TRN, SUPPLIER_LINE_TRN, PRODUCT_STOCK_TRN + HIST |
| Batch rank KH | SALES_SLIP_TRN, RO_SLIP_TRN, CUSTOMER_MST, CUSTOMER_RANK_MST | CUSTOMER_MST, CUSTOMER_RANK_SUMMARY |
