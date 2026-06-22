# WF-10 – Import Đơn Hàng EC Online (オンライン受注取込)

**Confidence**: HIGH – Xác nhận từ `ImportOnlineOrderAction.java` (426 dòng)  
**Loại**: File import workflow → Tự động tạo đơn hàng

---

## Entry Route
```
GET  /rorder/importOnlineOrder/index            → Màn hình upload
POST /rorder/importOnlineOrder/init             → Reset (xóa WORK cũ)
POST /rorder/importOnlineOrder/upload           → Upload CSV
GET  /rorder/importOnlineOrder/redraw/{showExist} → Xem lại danh sách
POST /rorder/importOnlineOrder/update           → Xử lý: tạo RO từ WORK
POST /rorder/importOnlineOrder/cancel           → Hủy (rollback)
```

## User Role
- `userDto.isMenuUpdate(Constants.MENU_ID.INPUT_RORDER)` ← `line 64`
- `userDto.isMenuValid(Constants.MENU_ID.INPUT_RORDER)` ← `line 65`

---

## Main Code Path

```
POST /rorder/importOnlineOrder/init
  → ImportOnlineOrderAction.init()                       ← line 76-92
    → importOnlineOrderService.deleteWorksAll()           ← line 78 (cleanup cũ)
    → importOnlineOrderForm.showExist = true

POST /rorder/importOnlineOrder/upload
  → ImportOnlineOrderAction (extends AbstractXSVUploadAction)
    → validate: file type (CSV/TSV)
    → validate: encoding (UTF-8 inferred)
    → parse: List<OnlineOrderWorkDto>
    → for each row:
      → validate: required fields (ONLINE_ORDER_ID, SKU, QUANTITY)
    → INSERT INTO ONLINE_ORDER_WORK (batch)
    → importOnlineOrderForm.showExist = true

POST /rorder/importOnlineOrder/update
  → ImportOnlineOrderAction.update()
    → importOnlineOrderService.importOnlineOrders()
      → SELECT FROM ONLINE_ORDER_WORK WHERE USER_ID = currentUser
      → Group by ONLINE_ORDER_ID (1 order = 1 RO_SLIP)
      → For each ONLINE_ORDER:
        → match SKU → PRODUCT_MST.ONLINE_PCODE
        → CustomerService lookup by email? (inferred)
        → SeqMakerService.getNextSeqId("RO_SLIP_TRN")
        → INSERT RO_SLIP_TRN (snapshot: CUSTOMER_NAME, address from ONLINE_ORDER_WORK)
        → For each item (ONLINE_ITEM):
          → INSERT RO_LINE_TRN (PRODUCT_CODE, QUANTITY, REST_QUANTITY = QUANTITY)
        → INSERT ONLINE_ORDER_REL (ONLINE_ORDER_ID → RO_SLIP_ID)
        → INSERT RO_SLIP_TRN_HIST + RO_LINE_TRN_HIST
      → onlineOrderService.deleteWorks() [cleanup sau xử lý]
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `ImportOnlineOrderAction.java` | Main controller |
| Parent Action | `AbstractXSVUploadAction` | CSV/TSV parsing base class |
| Service | `ImportOnlineOrderService` | Business logic import |
| Service | `OnlineOrderService` | ONLINE_ORDER_WORK CRUD |
| Service | `OnlineOrderRelService` | Link EC order → RO |
| Entity | `OnlineOrderWork` | Staging table |
| DTO | `OnlineOrderWorkDto` | Parsed CSV row |
| Form | `ImportOnlineOrderForm` | Upload form |

**Imports (ImportOnlineOrderAction.java:14-21)**:
```java
import jp.co.arkinfosys.action.AbstractXSVUploadAction; // line 12
import jp.co.arkinfosys.dto.rorder.OnlineOrderWorkDto;  // line 16
import jp.co.arkinfosys.entity.OnlineOrderWork;          // line 17
import jp.co.arkinfosys.service.OnlineOrderService;      // line 18
import jp.co.arkinfosys.service.rorder.ImportOnlineOrderService; // line 21
```

---

## Database Tables

**READ**:
- `ONLINE_ORDER_WORK` – staged CSV data (filter: `USER_ID = currentUser`)
- `PRODUCT_MST` – match `ONLINE_PCODE` với CSV SKU
- `CUSTOMER_MST` – lookup KH qua email (inferred)

**WRITE**:
- `ONLINE_ORDER_WORK` – TRUNCATE (init) / INSERT (upload) / DELETE (cleanup)
- `RO_SLIP_TRN` – INSERT (1 per EC order)
- `RO_LINE_TRN` – INSERT (1 per EC order item)
- `ONLINE_ORDER_REL` – INSERT (link)
- `RO_SLIP_TRN_HIST` + `RO_LINE_TRN_HIST` – snapshots
- `SEQ_MAKER` – next IDs

---

## ONLINE_ORDER_WORK Schema

```sql
PRIMARY KEY (USER_ID, ONLINE_ORDER_ID, ONLINE_ITEM_ID)  ← composite
```

Key fields từ CSV (EC format – Amazon/Rakuten style):
| Column | Ý nghĩa |
|--------|---------|
| `ONLINE_ORDER_ID` | Mã đơn hàng EC |
| `ONLINE_ITEM_ID` | Mã item trong đơn |
| `SKU` | Mã sản phẩm EC → match `PRODUCT_MST.ONLINE_PCODE` |
| `CUSTOMER_EMAIL` | Email KH đặt hàng |
| `RECIPIENT_NAME` | Tên người nhận |
| `QUANTITY` | Số lượng |
| `PRICE` | Đơn giá |
| `ZIP_CODE` + `ADDRESS_*` | Địa chỉ giao hàng |
| `SUPPLIER_DATE` | Ngày yêu cầu giao |
| `LOAD_DATE` | Thời điểm import |

---

## Validation Rules

1. File upload – required, phải là CSV/TSV
2. `ONLINE_ORDER_ID` – required, not empty
3. `ONLINE_ITEM_ID` – required, not empty
4. `SKU` – phải match với `PRODUCT_MST.ONLINE_PCODE` (nếu không match → skip row + warning)
5. `QUANTITY` > 0
6. Duplicate `(ONLINE_ORDER_ID, ONLINE_ITEM_ID)` trong cùng file → reject
7. `USER_ID` isolation – mỗi user chỉ thấy WORK của mình

---

## Status Transitions

```
ONLINE_ORDER_WORK:
  [Không có] → init() xóa hết → upload() INSERT → update() DELETE

RO_SLIP_TRN:
  [Không có] → update() INSERT → STATUS = "1" (Open)
  REST_QUANTITY = QUANTITY (tất cả lines)

ONLINE_ORDER_REL:
  INSERT khi update() thành công (link EC → RO)
```

---

## External Integrations

**EC Platform (Amazon Japan, Rakuten, etc.)**:
- CSV format: Amazon-style TSV export (tab-separated)
- Không có real-time API – batch file import
- `SHIP_SERVICE_LEVEL`, `DELIVERY_TIME_ZONE` = EC platform specific fields
- `CURRENCY` – hỗ trợ nhiều loại tiền tệ (JPY, USD)

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| File không đúng format | `AbstractXSVUploadAction` reject + message |
| SKU không match PRODUCT | Warning per row, skip và continue |
| Duplicate ORDER+ITEM key | Reject row (PK violation) |
| `isStopOnError()` = true | `throw e` stop toàn bộ (line 86-89) |
| `isStopOnError()` = false | Log warning, continue next row |
| ServiceException (soft) | `super.errorLog(e)` + continue |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/rorder/ImportOnlineOrderAction.java` | 1-35 | Class, extends AbstractXSVUploadAction |
| `action/rorder/ImportOnlineOrderAction.java` | 40-54 | Services injected |
| `action/rorder/ImportOnlineOrderAction.java` | 62-92 | index(), init(), permission check |
| `action/rorder/ImportOnlineOrderAction.java` | 99-100 | redraw() method |
| `service/rorder/ImportOnlineOrderService.java` | all | Core import logic |
| `service/OnlineOrderService.java` | all | WORK table management |
| `DB/sql/createtable/CREATE.sql` | 3557-3597 | ONLINE_ORDER_WORK DDL |
