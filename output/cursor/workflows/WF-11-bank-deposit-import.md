# WF-11 – Import Sao Kê Ngân Hàng & COD (入金データ取込)

**Confidence**: MEDIUM – Xác nhận từ service classes, entity imports; action files chưa đọc trực tiếp  
**Loại**: File import workflow → Tự động tạo phiếu thu

---

## Entry Route
```
GET  /deposit/importBankDeposit/index         → Upload sao kê ngân hàng
POST /deposit/importBankDeposit/upload        → Upload CSV bank
POST /deposit/importBankDeposit/update        → Xử lý: tạo DEPOSIT_SLIP
GET  /deposit/importDeliveryDeposit/index     → Upload COD từ shipper
POST /deposit/importDeliveryDeposit/upload    → Upload CSV shipper
POST /deposit/importDeliveryDeposit/update    → Xử lý: tạo DEPOSIT_SLIP COD
```

## User Role
- Kế toán (inferred từ menu structure)
- `userDto.isMenuUpdate(MENU_ID.INPUT_DEPOSIT)` (inferred)

---

## Main Code Path

### A. Bank Statement Import

```
POST /deposit/importBankDeposit/upload
  → ImportBankDepositAction (extends AbstractXSVUploadAction)
    → parse CSV bank statement format (Zengin format inferred)
    → BankDepositWorkService.deleteAll()     ← cleanup cũ
    → INSERT INTO BANK_DEPOSIT_WORK
    → Hiển thị preview

POST /deposit/importBankDeposit/update
  → BankDepositWorkService.matchWithBill()
    → SELECT BANK_DEPOSIT_WORK WHERE USER_ID = currentUser
    → For each bank entry:
      → match CUSTOMER_CODE + PRICE → BILL_TRN (auto-match)
      → hoặc: manual assign BILL_ID
    → INSERT DEPOSIT_SLIP_TRN (DEPOSIT_CATEGORY = transfer)
    → INSERT DEPOSIT_LINE_TRN (BANK_ID = matching bank account)
    → INSERT BANK_DEPOSIT_REL (link work → deposit_slip)
    → BankDepositWorkService.deleteAll()     ← cleanup
```

### B. Delivery COD Import

```
POST /deposit/importDeliveryDeposit/upload
  → ImportDeliveryDepositAction (extends AbstractXSVUploadAction)
    → parse CSV shipper format (Yamato/Sagawa format)
    → DeliveryDepositWorkService.deleteAll()
    → INSERT INTO DELIVERY_DEPOSIT_WORK
    → Hiển thị preview

POST /deposit/importDeliveryDeposit/update
  → DeliveryDepositWorkService.matchWithSalesSlip()
    → match DELIVERY_SLIP_ID → SALES_SLIP_TRN (COD_SC = '1')
    → INSERT DEPOSIT_SLIP_TRN (DEPOSIT_CATEGORY = COD)
    → INSERT DEPOSIT_LINE_TRN
    → INSERT DELIVERY_DEPOSIT_REL
    → DeliveryDepositWorkService.deleteAll()
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `ImportBankDepositAction.java` | Bank statement import |
| Action | `ImportDeliveryDepositAction.java` | COD shipper import |
| Parent | `AbstractXSVUploadAction` | CSV/TSV parsing base |
| Service | `BankDepositWorkService` | BANK_DEPOSIT_WORK CRUD |
| Service | `BankDepositRelService` | Link bank work → deposit |
| Service | `DeliveryDepositWorkService` | DELIVERY_DEPOSIT_WORK CRUD |
| Service | `DeliveryDepositRelService` | Link delivery work → deposit |
| Service | `DepositSlipService` | Tạo DEPOSIT_SLIP_TRN |
| Service | `DepositLineService` | Tạo DEPOSIT_LINE_TRN |
| Service | `BillService` | Lookup BILL_TRN để match |
| Service | `SalesService` | Lookup SALES_SLIP (COD) |
| Entity | `BankDepositRel` | Link bảng bank |
| Entity | `DeliveryDepositRel` | Link bảng delivery |

---

## Database Tables

**READ**:
- `BANK_DEPOSIT_WORK` – staged bank data (filter: USER_ID)
- `DELIVERY_DEPOSIT_WORK` – staged COD data (filter: USER_ID)
- `BILL_TRN` – auto-match theo amount + customer (bank)
- `SALES_SLIP_TRN` – match theo DELIVERY_SLIP_ID (COD)
- `CUSTOMER_MST` – lookup KH từ bank entry
- `BANK_MST` – tài khoản ngân hàng nhận tiền

**WRITE**:
- `BANK_DEPOSIT_WORK` – INSERT (upload) / DELETE (cleanup)
- `DELIVERY_DEPOSIT_WORK` – INSERT (upload) / DELETE (cleanup)
- `DEPOSIT_SLIP_TRN` – INSERT
- `DEPOSIT_LINE_TRN` – INSERT
- `DEPOSIT_SLIP_TRN_HIST` + `DEPOSIT_LINE_TRN_HIST` – snapshots
- `BANK_DEPOSIT_REL` – INSERT (link)
- `DELIVERY_DEPOSIT_REL` – INSERT (link)
- `SEQ_MAKER` – next IDs

---

## DELIVERY_DEPOSIT_WORK Schema

```sql
-- CREATE.sql:3682-3699
USER_ID              VARCHAR(30)
PAYMENT_CATEGORY     VARCHAR(1)
CUSTOMER_CODE        VARCHAR(23)     -- shipper format, can differ
DELIVERY_SLIP_ID     VARCHAR(12)     -- match key
DATA_CATEGORY        VARCHAR(2)
SETTLE_CATEGORY      VARCHAR(2)
DELIVERY_DATE        DATE
PRODUCT_PRICE        DECIMAL(15,3)
COD_PRICE            DECIMAL(12,3)   -- actual COD collected
SERVICE_PRICE        DECIMAL(12,3)   -- shipper fee
```

---

## Validation Rules

**Bank Import**:
1. File type – CSV/TSV
2. `AMOUNT` > 0
3. `TRANSACTION_DATE` – valid date
4. Match confidence: exact match BILL → auto; fuzzy → manual review

**COD Import**:
1. `DELIVERY_SLIP_ID` – required
2. `COD_PRICE` > 0
3. `DELIVERY_SLIP_ID` phải match với `SALES_SLIP_TRN` có `COD_SC = '1'`
4. Không xử lý trùng lặp (same `DELIVERY_SLIP_ID` đã có `DELIVERY_DEPOSIT_REL`)

---

## Status Transitions

```
DELIVERY_DEPOSIT_WORK:
  [None] → upload() INSERT → update() DELETE

DEPOSIT_SLIP_TRN:
  [None] → update() INSERT STATUS="0"
  → ART closing (WF liên quan) → STATUS="1"

BANK_DEPOSIT_REL / DELIVERY_DEPOSIT_REL:
  INSERT khi update() thành công → permanent link
```

---

## External Integrations

**Bank Format (Zengin standard)**:
- Định dạng cố định (fixed-width hoặc CSV)
- Fields: bank code, branch code, account number, amount, transfer date
- Phổ biến trong banking Nhật Bản

**Shipper Format**:
- Yamato TA-Q-BIN / Sagawa CSV
- `DELIVERY_SLIP_ID` = 伝票番号 (12 chars)
- `COD_PRICE` = 代引き金額
- `DELIVERY_DATE` = 配達日

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| File parse error | AbstractXSVUploadAction reject |
| Bank match fail | Manual review queue (unmatched list) |
| DELIVERY_SLIP không tìm thấy | Warning, skip + log |
| Duplicate DELIVERY_SLIP_ID | Skip (REL đã tồn tại) |
| ServiceException | Log + error message |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/deposit/ImportBankDepositAction.java` | all | Bank import controller |
| `action/deposit/ImportDeliveryDepositAction.java` | all | COD import controller |
| `service/BankDepositWorkService.java` | all | BANK_DEPOSIT_WORK logic |
| `service/BankDepositRelService.java` | all | Bank link |
| `service/DeliveryDepositWorkService.java` | all | DELIVERY_DEPOSIT_WORK logic |
| `service/DeliveryDepositRelService.java` | all | COD link |
| `entity/BankDepositRel.java` | all | Entity class |
| `entity/DeliveryDepositRel.java` | all | Entity class |
| `DB/sql/createtable/CREATE.sql` | 3682-3699 | DELIVERY_DEPOSIT_WORK DDL |
