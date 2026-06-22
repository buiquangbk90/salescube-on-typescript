# WF-06 – Nhập Phiếu Thu Tiền (入金入力 – Deposit Entry)

**Confidence**: HIGH – Xác nhận từ `InputDepositAction.java` (648 dòng)  
**Loại**: Transaction entry workflow

---

## Entry Route
```
GET  /deposit/inputDeposit/index               → Tạo phiếu thu mới
GET  /deposit/inputDeposit/edit/{depositId}   → Mở phiếu thu hiện có
POST /deposit/inputDeposit/register            → Lưu phiếu thu
POST /deposit/inputDeposit/delete              → Xóa phiếu thu
GET  /deposit/searchDeposit/index              → Tìm kiếm
GET  /deposit/importBankDeposit/index          → Import sao kê ngân hàng
GET  /deposit/importDeliveryDeposit/index      → Import COD từ shipper
```

## User Role
- Kế toán (inferred)
- `userDto.isMenuUpdate(MENU_ID.INPUT_DEPOSIT)`

---

## Main Code Path

```
GET /deposit/inputDeposit/index
  → InputDepositAction.index()
    → CustomerService.findAll() [dropdown]
    → BillService.findUnpaidByCustomer() [nếu chọn KH]
    → BankService.findAll() [tài khoản NH]
    → Render inputDeposit.jsp

POST /deposit/inputDeposit/register
  → InputDepositAction.register()
    → validate form
    → CustomerService.findByCode(customerCode) → snapshot
    → BillService.findByPk(billId) [nếu thu theo hóa đơn]
    → SeqMakerService.getNextSeqId("DEPOSIT_SLIP_TRN")
    → DepositSlipService.insert(dto)
      → INSERT DEPOSIT_SLIP_TRN (snapshot KH)
      → INSERT DEPOSIT_LINE_TRN (N lines)
        → line.DEPOSIT_CATEGORY ∈ {cash, check, transfer, bank, COD, setoff...}
        → BankService.findByPk(bankId) [nếu bank transfer]
      → INSERT DEPOSIT_SLIP_TRN_HIST
      → INSERT DEPOSIT_LINE_TRN_HIST
    → UPDATE BILL_TRN.DEPOSIT_PRICE [nếu link với bill]
    → INSERT BANK_DEPOSIT_REL [nếu từ bank import]
    → INSERT DELIVERY_DEPOSIT_REL [nếu từ delivery import]
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `InputDepositAction.java` | Main controller |
| Action | `ImportBankDepositAction.java` | Import bank statement |
| Action | `ImportDeliveryDepositAction.java` | Import COD từ shipper |
| Service | `DepositSlipService` | DEPOSIT_SLIP_TRN CRUD |
| Service | `DepositLineService` | DEPOSIT_LINE_TRN CRUD |
| Service | `BillService` | Lookup hóa đơn cần thanh toán |
| Service | `BillOldService` | Hóa đơn kỳ cũ |
| Service | `CustomerService` | Lookup + snapshot KH |
| Service | `BankService` | Tài khoản ngân hàng |
| Service | `BankDepositRelService` | Link bank import → deposit |
| Service | `DeliveryDepositRelService` | Link shipper import → deposit |
| Service | `SalesService` | Deposit trực tiếp không qua bill |
| Entity | `DepositSlip` (DEPOSIT_SLIP_TRN) | Phiếu thu |
| Entity | `DepositLine` (DEPOSIT_LINE_TRN) | Dòng chi tiết |
| Entity | `BankDepositRel` | Link bank statement |
| Entity | `DeliveryDepositRel` | Link shipper COD |

**Imports (InputDepositAction.java:21-46)**:
```java
import jp.co.arkinfosys.entity.BankDepositRel;    // line 22
import jp.co.arkinfosys.entity.Bill;               // line 23
import jp.co.arkinfosys.entity.DeliveryDepositRel; // line 24
import jp.co.arkinfosys.entity.DepositLine;        // line 25
import jp.co.arkinfosys.entity.DepositSlip;        // line 26
import jp.co.arkinfosys.service.BankDepositRelService; // line 36
import jp.co.arkinfosys.service.BillOldService;    // line 38
```

---

## Database Tables

**READ**:
- `CUSTOMER_MST` – lookup KH + snapshot
- `BILL_TRN` – hóa đơn cần thanh toán (BILL_ID)
- `BANK_MST` – tài khoản ngân hàng nhận
- `SALES_SLIP_TRN` – [nếu deposit trực tiếp không qua bill]
- `DELIVERY_MST` – địa chỉ giao hàng
- `CATEGORY_MST` / `CATEGORY_TRN` – deposit category dropdown
- `BANK_DEPOSIT_WORK` – [nếu import bank statement]
- `DELIVERY_DEPOSIT_WORK` – [nếu import COD]

**WRITE**:
- `DEPOSIT_SLIP_TRN` – INSERT / UPDATE
- `DEPOSIT_LINE_TRN` – INSERT / UPDATE / DELETE
- `DEPOSIT_SLIP_TRN_HIST` – snapshot
- `DEPOSIT_LINE_TRN_HIST` – snapshot
- `BILL_TRN.DEPOSIT_PRICE` – cập nhật số tiền đã thu
- `ART_BALANCE_TRN.ART_ID` – link sau ART closing
- `BANK_DEPOSIT_REL` – [từ bank import]
- `DELIVERY_DEPOSIT_REL` – [từ COD import]
- `SEQ_MAKER` – next IDs

---

## Validation Rules

1. `CUSTOMER_CODE` – required
2. `DEPOSIT_DATE` – required, valid date
3. Mỗi line: `DEPOSIT_CATEGORY` – required, phải có trong CATEGORY_TRN
4. Mỗi line: `PRICE` > 0
5. Mỗi line: `BANK_ID` – required nếu `DEPOSIT_CATEGORY` = bank transfer
6. Mỗi line: `INST_DATE` – required nếu category là installment
7. Tổng `DEPOSIT_LINE.PRICE` phải bằng `DEPOSIT_SLIP.DEPOSIT_TOTAL`
8. Không xóa phiếu đã chốt ART

---

## Status Transitions (DEPOSIT_SLIP_TRN.STATUS)

```
[Không tồn tại]
    │ register()
    ▼
"0" = Mở (Open)
    │
    │ CloseArtBalance → WF liên quan
    ▼
"1" = Đã chốt ART (Closed in ART)
    │
    │ delete() → chỉ được nếu STATUS = "0"
    ▼
[Bị xóa] (soft-delete: DEL_DATETM set)
```

---

## External Integrations

### Import Sao Kê Ngân Hàng
```
ImportBankDepositAction.upload()
  → AbstractXSVUploadAction.parse() → read file (CSV/TSV)
  → BankDepositWorkService.deleteAll()
  → INSERT BANK_DEPOSIT_WORK (staging)
  → BankDepositWorkService.matchWithBill()
    → match BANK_DEPOSIT_WORK với BILL_TRN theo amount + date
  → Tạo DEPOSIT_SLIP_TRN + DEPOSIT_LINE_TRN tự động
  → INSERT BANK_DEPOSIT_REL (link)
  → cleanup BANK_DEPOSIT_WORK
```

### Import COD từ Shipper (Delivery Deposit)
```
ImportDeliveryDepositAction.upload()
  → Parse CSV shipper format
  → INSERT DELIVERY_DEPOSIT_WORK
  → Match DELIVERY_DEPOSIT_WORK với SALES_SLIP_TRN (via DELIVERY_SLIP_ID)
  → Tạo DEPOSIT_SLIP_TRN (COD type)
  → INSERT DELIVERY_DEPOSIT_REL
  → cleanup DELIVERY_DEPOSIT_WORK
```

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| Bill không tồn tại | "errors.notExist" |
| Phiếu đã chốt ART | Không cho xóa/sửa |
| Tổng line ≠ slip total | "errors.totalMismatch" (inferred) |
| Bank match fail (import) | Warning, manual review required |
| ServiceException | Log + throw |
| UnabledLockException | "errors.lock" |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/deposit/InputDepositAction.java` | 1-60 | Class + imports |
| `action/deposit/InputDepositAction.java` | 64-100 | Service injections |
| `action/deposit/ImportBankDepositAction.java` | all | Bank import |
| `action/deposit/ImportDeliveryDepositAction.java` | all | COD import |
| `service/DepositSlipService.java` | all | Main service |
| `service/BankDepositRelService.java` | all | Bank link |
| `service/DeliveryDepositRelService.java` | all | COD link |
| `DB/sql/createtable/CREATE.sql` | 2487-2647 | DEPOSIT_SLIP/LINE DDL |
