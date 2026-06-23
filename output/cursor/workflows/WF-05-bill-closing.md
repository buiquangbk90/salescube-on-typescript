# WF-05 – Chốt Hóa Đơn (請求締め – Bill Closing)

**Confidence**: HIGH – Xác nhận từ `CloseBillAction.java` (486 dòng), `BillService.java`  
**Loại**: Closing/Accounting workflow – chạy trong HTTP request

---

## Entry Route
```
GET  /bill/closeBill/index                  → Màn hình chốt hóa đơn
POST /bill/closeBill/find                   → Tìm kiếm KH cần chốt
POST /bill/closeBill/close                  → Thực hiện chốt
POST /bill/closeBill/reopen                 → Mở lại (reopen)
GET  /bill/makeOutBill/index                → Xuất hóa đơn (in)
GET  /bill/searchBill/index                 → Tìm kiếm hóa đơn đã chốt
```

## User Role
- Kế toán / quản lý (inferred từ menu structure)
- `userDto.isMenuUpdate(MENU_ID.CLOSE_BILL)` – quyền thực hiện chốt

---

## Main Code Path

```
POST /bill/closeBill/close
  → CloseBillAction.close()                 ← line 100-141
    → validate: validateCheckClose()         ← line 277+
      → ymService.getYm(cutOffDate)          → kiểm tra ngày hợp lệ
      → kiểm tra có KH nào được check không
      → kiểm tra không chốt 2 lần cùng tháng
    → for each checked customer:
      → billService.closeBillArt(cutOffDate, customerCode)
        → SalesService.findUnbilledByCustomer()   ← lấy phiếu chưa chốt
        → BillAndArtService.calcArtBalance()      ← tính số dư AR
        → SeqMakerService.getNextSeqId("BILL_TRN")
        → INSERT BILL_TRN
        → UPDATE SALES_SLIP_TRN SET BILL_ID, STATUS = '3'
        → UPDATE CUSTOMER_MST.LAST_CUTOFF_DATE
        → INSERT BILL_TRN_HIST
    → find()                                      ← re-search
    → addMessage("infos.closeBill.close")

POST /bill/closeBill/reopen
  → CloseBillAction.reopen()                ← line 150-196
    → billService.reOpenBillArt(billCutoffDate, customerCode)
      → UPDATE SALES_SLIP_TRN SET BILL_ID = NULL, STATUS = '2'
      → DELETE BILL_TRN
      → UPDATE CUSTOMER_MST.LAST_CUTOFF_DATE (rollback)
      → INSERT BILL_TRN_HIST (reopen event)
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `CloseBillAction.java` | Chốt/mở lại hóa đơn |
| Action | `MakeOutBillAction.java` | Xuất/in hóa đơn |
| Action | `SearchBillAction.java` | Tìm kiếm bill |
| Service | `BillService.java` | Business logic chốt |
| Service | `BillAndArtService.java` | Tính số dư AR kết hợp |
| Service | `BillJoinService.java` | JOIN queries cho bill list |
| Service | `BillOldService.java` | Xử lý bill kỳ trước |
| Service | `SalesService` | Lấy phiếu bán chưa chốt |
| Service | `CustomerService` | Cập nhật LAST_CUTOFF_DATE |
| Service | `DepositSlipService` | Lấy tiền thu trong kỳ |
| Service | `YmService` | Parse ngày → kỳ kế toán |
| Entity | `Bill` (BILL_TRN) | Hóa đơn |
| DTO | `CloseBillLineDto` | Display DTO trong form |

**Service imports (BillService.java:47-80)**:
```java
protected SalesService salesService;          // line 51
protected SalesLineService salesLineService;  // line 55
protected DepositSlipService depositSlipService; // line 59
protected DepositLineService depositLineService; // line 63
protected CustomerService customerService;    // line 67
private BillAndArtService billAndArtService;  // line 79
```

---

## Database Tables

**READ**:
- `SALES_SLIP_TRN` – phiếu bán chưa chốt (`BILL_ID IS NULL`, `STATUS = '2'`)
- `SALES_LINE_TRN` – chi tiết để tính tổng
- `DEPOSIT_SLIP_TRN` / `DEPOSIT_LINE_TRN` – tiền thu trong kỳ
- `CUSTOMER_MST` – `CUTOFF_GROUP`, `PAYBACK_TYPE_CATEGORY`, `LAST_CUTOFF_DATE`
- `BILL_TRN` – kiểm tra đã chốt tháng này chưa
- `ART_BALANCE_TRN` – số dư AR kỳ trước

**WRITE**:
- `BILL_TRN` – INSERT (chốt) / DELETE (reopen)
- `BILL_TRN_HIST` – snapshot
- `SALES_SLIP_TRN.BILL_ID` – set khi chốt, NULL khi reopen
- `SALES_SLIP_TRN.STATUS` – `'3'` khi chốt, `'2'` khi reopen
- `CUSTOMER_MST.LAST_CUTOFF_DATE` – cập nhật
- `SEQ_MAKER` – next BILL_ID

---

## Validation Rules

1. `cutOffDate` – required, format `yyyy/MM/dd`
2. `ymService.getYm(cutOffDate)` phải trả về kết quả hợp lệ
3. Ít nhất 1 KH phải được chọn (checkbox)
4. Không thể chốt KH đã có BILL_TRN cùng `BILL_CUTOFF_DATE` trong tháng
5. `CUTOFF_GROUP` của KH phải khớp với nhóm đang chốt
6. Validation riêng cho reopen: `validateCheckReopen()` – kiểm tra trạng thái bill

---

## Status Transitions

```
SALES_SLIP_TRN.STATUS:
  "2" (Confirmed) ──close()──→ "3" (Bill closed, BILL_ID set)
  "3" (Bill closed) ──reopen()──→ "2" (Confirmed, BILL_ID=NULL)

BILL_TRN:
  [Không tồn tại] ──close()──→ [Tồn tại, STATUS="0"]
  [Tồn tại] ──reopen()──→ [Bị DELETE]

CUSTOMER_MST.LAST_CUTOFF_DATE:
  ← cập nhật mỗi lần chốt/reopen
```

---

## External Integrations

**Hóa đơn Export (MakeOutBillAction)**:
```
MakeOutBillAction → BillReportService → JasperReports
→ PDF render → Browser download
```

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| `cutOffDate` invalid | "errors.date" với label |
| Không chọn KH nào | "errors.noSelect" (inferred) |
| Đã chốt tháng này | ActionMessage trả về từ `billService.closeBillArt()` |
| UnabledLockException | "errors.lock" – record bị lock |
| ServiceException | `errProc(e)` + `e.getMessage()` |
| Partial commit (timeout) | **Không có compensation** – BILL_TRN có thể tạo mà SALES_SLIP không update |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/bill/CloseBillAction.java` | 1-52 | Class, services injected |
| `action/bill/CloseBillAction.java` | 99-141 | close() method |
| `action/bill/CloseBillAction.java` | 150-196 | reopen() method |
| `action/bill/CloseBillAction.java` | 277-350 | validateCheckClose() |
| `service/BillService.java` | 47-80 | Class + all service injections |
| `service/BillAndArtService.java` | all | AR balance calculation |
| `DB/sql/createtable/CREATE.sql` | 2366-2422 | BILL_TRN DDL |
