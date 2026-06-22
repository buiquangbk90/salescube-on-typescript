# WF-03 – Nhận Đơn hàng (受注入力 – Receive Order)

**Confidence**: HIGH – Xác nhận từ `InputROrderAction.java` và service imports  
**Loại**: Transaction entry workflow

---

## Entry Route
```
GET  /rorder/inputROrder/index              → Form nhập đơn hàng mới
GET  /rorder/inputROrder/edit/{roSlipId}   → Mở đơn hàng hiện có
POST /rorder/inputROrder/register           → Lưu đơn hàng
POST /rorder/inputROrder/cancel             → Hủy đơn hàng
GET  /rorder/inputROrder/copy              → Copy từ phiếu khác
GET  /rorder/searchROrder/index             → Tìm kiếm đơn hàng
GET  /rorder/importOnlineOrder/index        → Import đơn online (EC)
```

## User Role
- `MENU_ID.INPUT_RORDER` – kiểm tra qua `userDto.isMenuUpdate()`
- Role yêu cầu: Sales staff (inferred)

---

## Main Code Path

```
GET /rorder/inputROrder/index
  → InputROrderAction.index()
    → RoSlipService.createNew() → empty DTO
    → CategoryService.findAll() → dropdowns
    → Render inputROrder.jsp

POST /rorder/inputROrder/register
  → InputROrderAction.register()
    → validate (AbstractSlipEditAction)
    → CustomerService.findByCode(customerCode)
      → Kiểm tra credit limit (MAX_CREDIT_LIMIT)
      → Copy customer snapshot vào form
    → DeliveryService.findByCode(deliveryCode)
    → Với mỗi line:
      → ProductService.findByCode(productCode)
      → ProductStockService.checkStock()  ← check tồn kho
      → DiscountUtil.calcDiscount()       ← tính chiết khấu
      → Tính UNIT_PRICE, RETAIL_PRICE, GM
    → SeqMakerService.getNextSeqId("RO_SLIP_TRN")
    → RoSlipService.insert(dto)           → INSERT RO_SLIP_TRN
    → RoLineService.insertLines(dto)      → INSERT RO_LINE_TRN (1..N)
    → Render inputROrder.jsp (success)

[Optional: Copy từ Estimate]
  → EstimateSheetService.findByPk(estimateSheetId)
  → EstimateLineService.findBySlipId()
  → Map estimate → RO form (pre-fill)
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `InputROrderAction.java` | Main controller |
| Action | `ImportOnlineOrderAction.java` | EC import controller |
| Service | `RoSlipService` | RO_SLIP_TRN CRUD |
| Service | `RoLineService` | RO_LINE_TRN CRUD |
| Service | `CustomerService` | Lookup KH, credit check |
| Service | `ProductService` | Lookup sản phẩm |
| Service | `ProductStockService` | Kiểm tra tồn kho |
| Service | `DeliveryService` | Địa chỉ giao hàng |
| Service | `EstimateSheetService` | Copy từ báo giá |
| Service | `EstimateLineService` | Copy lines từ báo giá |
| Service | `OnlineOrderService` | Xử lý ONLINE_ORDER_WORK |
| Service | `OnlineOrderRelService` | Link ONLINE_ORDER → RO |
| Service | `CategoryService` | Dropdowns |
| Utility | `DiscountUtil` | Tính chiết khấu |
| Entity | `RoSlipTrn` | RO_SLIP_TRN |
| Entity | `RoLineTrn` | RO_LINE_TRN |
| Entity | `OnlineOrderWork` | Staging table EC |

---

## Database Tables

**READ**:
- `CUSTOMER_MST` – lookup KH + credit limit
- `DELIVERY_MST` – địa chỉ giao hàng
- `PRODUCT_MST` – thông tin sản phẩm
- `PRODUCT_STOCK_TRN` – tồn kho hiện tại
- `DISCOUNT_MST` / `DISCOUNT_TRN` / `DISCOUNT_REL` – chiết khấu
- `CATEGORY_MST` / `CATEGORY_TRN` – dropdowns
- `ESTIMATE_SHEET_TRN` / `ESTIMATE_LINE_TRN` – [nếu copy từ báo giá]
- `ONLINE_ORDER_WORK` – [nếu import EC]
- `TAX_RATE_MST` – thuế suất hiện tại
- `MINE_MST` – policy (tax category)

**WRITE**:
- `RO_SLIP_TRN` – INSERT / UPDATE
- `RO_LINE_TRN` – INSERT / UPDATE / DELETE lines
- `RO_SLIP_TRN_HIST` – snapshot
- `RO_LINE_TRN_HIST` – snapshot mỗi line
- `SEQ_MAKER` – next ID
- `ONLINE_ORDER_REL` – [nếu import EC] link EC → RO
- `ONLINE_ORDER_WORK` – [cleanup sau import]

---

## Validation Rules

1. `CUSTOMER_CODE` – required, phải tồn tại trong CUSTOMER_MST
2. `RO_DATE` – required, valid date format
3. Mỗi line: `PRODUCT_CODE` – required, phải tồn tại
4. Mỗi line: `QUANTITY` > 0
5. Mỗi line: `UNIT_PRICE` >= 0
6. Credit check: `CUSTOMER_MST.MAX_CREDIT_LIMIT` – nếu vượt → warning (không block)
7. Duplicate token check (Struts TokenProcessor) – phòng double submit
8. `REST_QUANTITY = QUANTITY` khi insert (chưa xử lý)

---

## Status Transitions (RO_SLIP_TRN.STATUS)

```
[Chưa tồn tại]
    │ register()
    ▼
"1" = Mở (Open) ── REST_QUANTITY = QUANTITY
    │
    │ [Tạo SALES_SLIP → WF-04]
    ▼
"2" = Đang xử lý (Partial) ── REST_QUANTITY giảm dần
    │
    │ [REST_QUANTITY của tất cả lines = 0]
    ▼
"3" = Hoàn thành (Complete)
    │
    │ cancel()
    ▼
"9" = Hủy (Canceled)
```

**RO_LINE_TRN.REST_QUANTITY**:
- Giảm dần mỗi lần tạo SALES_LINE_TRN từ line này
- NOT NULL constraint – không bao giờ được NULL

---

## External Integrations

**EC Import (Online Order)**:
```
EC CSV file → ImportOnlineOrderAction.upload()
  → importOnlineOrderService.deleteWorksAll()    ← cleanup cũ
  → Parse CSV → List<OnlineOrderWorkDto>
  → INSERT INTO ONLINE_ORDER_WORK (batch)
  → Validate: SKU phải có trong PRODUCT_MST
  → Generate RO_SLIP + RO_LINE từ ONLINE_ORDER_WORK
  → INSERT ONLINE_ORDER_REL (link EC order → RO slip)
  → importOnlineOrderService.deleteWorksAll()    ← cleanup sau xử lý
```

**Evidence**:
- `action/rorder/ImportOnlineOrderAction.java:35-92` – class, index(), init()
- `action/rorder/ImportOnlineOrderAction.java:78` – `deleteWorksAll()`

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| KH không tồn tại | "errors.notExist" với label |
| Product không tồn tại | "errors.notExist" với product code |
| Tồn kho không đủ | Warning (không block, tiếp tục được) |
| Double submit | TokenProcessor.isTokenValid() = false → error |
| UnabledLockException | "errors.lock" |
| ServiceException | Log + "errors.system" |
| CSV parse error (import) | "errors.import.parse" (inferred) |
| SKU không match | Log warning, skip line |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/rorder/InputROrderAction.java` | 1-100 | Class, imports, services injected |
| `action/rorder/InputROrderAction.java` | 72-84 | Mapping constants (URLs) |
| `action/rorder/ImportOnlineOrderAction.java` | 1-92 | EC import action |
| `service/RoSlipService.java` | all | RO_SLIP_TRN business logic |
| `service/RoLineService.java` | all | RO_LINE_TRN line management |
| `service/OnlineOrderService.java` | all | ONLINE_ORDER_WORK management |
| `entity/RoSlipTrn.java` | all | Entity class |
| `entity/RoLineTrn.java` | all | Entity class |
| `entity/OnlineOrderWork.java` | all | Staging entity |
| `DB/sql/createtable/CREATE.sql` | 1655-1760 | RO_SLIP_TRN DDL (inferred range) |
