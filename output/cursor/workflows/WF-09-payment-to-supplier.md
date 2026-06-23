# WF-09 – Thanh Toán Nhà Cung Cấp (支払実績締 – Payment to Supplier)

**Confidence**: HIGH – Xác nhận từ `ClosePaymentAction.java`, `InputPaymentAction.java`  
**Loại**: Closing + entry workflow (procure-to-pay, bước 3/3)

---

## Entry Route
```
GET  /payment/inputPayment/index                  → Tạo phiếu thanh toán thủ công
GET  /payment/inputPayment/edit/{paymentSlipId}  → Mở phiếu thanh toán
POST /payment/inputPayment/register               → Lưu phiếu thanh toán
GET  /payment/closePayment/index                  → Màn hình chốt thanh toán
POST /payment/closePayment/close                  → Thực hiện chốt
POST /payment/closePayment/reopen                 → Mở lại
GET  /payment/searchPayment/index                 → Tìm kiếm
```

## User Role
- Kế toán (inferred)
- `userDto.isMenuUpdate(MENU_ID.CLOSE_PAYMENT)` (inferred)

---

## Main Code Path

```
POST /payment/closePayment/close
  → ClosePaymentAction.close()                   ← line 68-79
    → parse closePaymentForm.closeDate
    → closePaymentService.closePayment(closeDate)
      → AptBalanceService.findPendingBySupplier()
        → Tổng hợp SUPPLIER_SLIP_TRN chưa thanh toán
      → SeqMakerService.getNextSeqId("PAYMENT_SLIP_TRN")
      → INSERT PAYMENT_SLIP_TRN
      → INSERT PAYMENT_LINE_TRN (N lines từ SUPPLIER_LINE_TRN)
      → UPDATE SUPPLIER_SLIP_TRN.PAYMENT_SLIP_ID
      → INSERT APT_BALANCE_TRN (số dư phải trả kỳ này)
      → INSERT PAYMENT_SLIP_TRN_HIST
    → redirect về closePayment.jsp

POST /payment/closePayment/reopen
  → ClosePaymentAction.reopen()
    → closePaymentService.reopenPayment()
      → UPDATE SUPPLIER_SLIP_TRN.PAYMENT_SLIP_ID = NULL
      → DELETE PAYMENT_LINE_TRN
      → DELETE PAYMENT_SLIP_TRN
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `ClosePaymentAction.java` | Chốt thanh toán NCC |
| Action | `InputPaymentAction.java` | Nhập phiếu thanh toán thủ công |
| Service | `ClosePaymentService` | Business logic chốt |
| Service | `AptBalanceService` | Tổng hợp AP balance |
| Service | `SupplierSlipService` | Lookup phiếu nhập hàng |
| Service | `SupplierLineService` | Lines từ SUPPLIER_LINE_TRN |
| Entity | `PaymentSlipTrn` | PAYMENT_SLIP_TRN |
| Entity | `PaymentLineTrn` | PAYMENT_LINE_TRN |
| Entity | `AptBalanceTrn` | APT_BALANCE_TRN |

**Imports (ClosePaymentAction.java:22-24)**:
```java
import jp.co.arkinfosys.service.AptBalanceService;         // line 22
import jp.co.arkinfosys.service.payment.ClosePaymentService; // line 24
```

---

## Database Tables

**READ**:
- `SUPPLIER_SLIP_TRN` – phiếu nhập chưa thanh toán (`PAYMENT_SLIP_ID IS NULL`)
- `SUPPLIER_LINE_TRN` – chi tiết để tính tổng thanh toán
- `PO_LINE_TRN` – FK reference (NOT NULL trong PAYMENT_LINE_TRN)
- `APT_BALANCE_TRN` – số dư AP kỳ trước
- `SUPPLIER_MST` – thông tin NCC

**WRITE**:
- `PAYMENT_SLIP_TRN` – INSERT (chốt) / DELETE (reopen)
- `PAYMENT_LINE_TRN` – INSERT / DELETE (`PO_LINE_ID` NOT NULL, `SUPPLIER_LINE_ID` NOT NULL)
- `PAYMENT_SLIP_TRN_HIST` – snapshot
- `PAYMENT_LINE_TRN_HIST` – snapshot
- `APT_BALANCE_TRN` – INSERT (tổng hợp số dư AP)
- `APT_BALANCE_TRN_HIST` – snapshot
- `SUPPLIER_SLIP_TRN.PAYMENT_SLIP_ID` – set khi chốt, NULL khi reopen
- `SUPPLIER_SLIP_TRN.STATUS` – cập nhật
- `SEQ_MAKER` – next IDs

---

## Validation Rules

1. `closeDate` – required, valid date format
2. Ít nhất 1 NCC phải được chọn
3. NCC không được chốt 2 lần cùng kỳ
4. `PAYMENT_LINE_TRN.PO_LINE_ID` NOT NULL (constraint từ DDL)
5. `PAYMENT_LINE_TRN.SUPPLIER_LINE_ID` NOT NULL (constraint từ DDL)
6. `PAYMENT_SLIP_TRN.SUPPLIER_CODE` NOT NULL (constraint từ DDL)
7. `PAYMENT_SLIP_TRN.PO_SLIP_ID` NOT NULL (constraint từ DDL)

---

## Status Transitions

```
SUPPLIER_SLIP_TRN:
  PAYMENT_SLIP_ID = NULL → (chốt) → PAYMENT_SLIP_ID set
  PAYMENT_SLIP_ID set → (reopen) → PAYMENT_SLIP_ID = NULL

PAYMENT_SLIP_TRN.STATUS:
  "0" = Tạo (sau close)
  "1" = Đã thanh toán thực tế [inferred]

APT_BALANCE_TRN:
  INSERT mỗi kỳ (snapshot số dư AP)
```

---

## External Integrations

- Không có file import cho payment
- **In phiếu thanh toán**: Qua `AbstractReportService` + JasperReports (inferred)

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| `closeDate` invalid | Parse exception caught |
| ServiceException | `super.errorLog(se)` + throw (`line 75-78`) |
| Partial commit | **Không có compensation** – PAYMENT_SLIP tạo nhưng SUPPLIER_SLIP có thể không update |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/payment/ClosePaymentAction.java` | 1-80 | Full class, services, close() |
| `action/payment/ClosePaymentAction.java` | 68-79 | close() implementation |
| `action/payment/InputPaymentAction.java` | all | Manual payment entry |
| `service/payment/ClosePaymentService.java` | all | Closing logic |
| `service/AptBalanceService.java` | all | AP balance |
| `DB/sql/createtable/CREATE.sql` | 3195-3355 | PAYMENT_SLIP/LINE DDL |
| `DB/sql/createtable/CREATE.sql` | 3470-3555 | APT_BALANCE_TRN DDL |
