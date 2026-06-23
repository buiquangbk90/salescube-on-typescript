# WF-04 – Nhập Phiếu Bán Hàng (売上伝票入力 – Sales Slip Entry)

**Confidence**: HIGH – Xác nhận từ `InputSalesAction.java` (1147 dòng), service imports  
**Loại**: Transaction entry workflow – bảng nghiệp vụ trung tâm

---

## Entry Route
```
GET  /sales/inputSales/index                → Form nhập phiếu bán hàng mới
GET  /sales/inputSales/edit/{salesSlipId}  → Mở phiếu bán hàng hiện có
GET  /sales/inputSales/copy?copySlipName=RORDER&copySlipId={id} → Copy từ RO
GET  /sales/inputSales/copy?copySlipName=SALES&copySlipId={id}  → Copy từ SALES
POST /sales/inputSales/register             → Lưu phiếu
POST /sales/inputSales/delete               → Xóa/hủy phiếu
GET  /sales/searchSales/index               → Tìm kiếm phiếu
GET  /sales/outputInvoice/index             → Xuất vận đơn (invoice)
GET  /sales/outputSalesReport/index         → Xuất báo cáo bán hàng
```

## User Role
- `MENU_ID.INPUT_SALES` – kiểm tra qua `userDto.isMenuUpdate()`
- `userDto.isMenuValid()` – quyền xem

---

## Main Code Path

```
GET /sales/inputSales/copy?copySlipName=RORDER
  → InputSalesAction.copy()                     ← line 167
    → prepareForm()
    → inputSalesForm.initialize()
    → createSalesSlipByRo(copySlipId)           ← tạo từ RO
      → RoSlipSalesService.findByPk(roSlipId)
      → Map RO_SLIP → SALES_SLIP (snapshot customer, delivery)
      → Map RO_LINE → SALES_LINE
    → createList()                              ← load dropdowns
    → createDeliveryList()                      ← delivery list cho KH
    → Render inputSales.jsp

POST /sales/inputSales/register
  → InputSalesAction.register()                 ← inherited AbstractSlipEditAction
    → validate form
    → CustomerService.findByCode()
    → RoSlipSalesService.findByPk()             ← nếu từ RO
    → InputStockSalesService.calcCost()         ← tính giá vốn từ stock
    → DiscountUtil.calcDiscount()               ← chiết khấu
    → SeqMakerService.getNextSeqId("SALES_SLIP_TRN")
    → SalesService.insert(dto)
      → INSERT SALES_SLIP_TRN (với snapshot KH/delivery)
      → INSERT SALES_LINE_TRN (N lines)
      → INSERT SALES_SLIP_TRN_HIST
      → INSERT SALES_LINE_TRN_HIST
    → RoLineService.updateRestQuantity()        ← giảm REST_QUANTITY
    → InputStockSalesService.createEadSlip()    ← tạo phiếu xuất kho EAD
    → Render inputSales.jsp
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `InputSalesAction.java` | Main controller (1147 dòng) |
| Action | `SearchSalesAction.java` | Tìm kiếm phiếu |
| Action | `OutputInvoiceAction.java` | Xuất vận đơn |
| Action | `OutputSalesReportAction.java` | Báo cáo bán hàng |
| Service | `SalesService` | SALES_SLIP_TRN CRUD |
| Service | `SalesLineService` | SALES_LINE_TRN CRUD |
| Service | `RoSlipSalesService` | Đọc RO để copy vào SALES |
| Service | `RoLineService` | Cập nhật REST_QUANTITY |
| Service | `InputStockSalesService` | Tính giá vốn + tạo EAD |
| Service | `CustomerService` | Lookup + snapshot KH |
| Service | `ProductService` | Lookup sản phẩm |
| Service | `DeliveryService` | Delivery list cho KH |
| Service | `BillService` | Kiểm tra bill đã chốt |
| Service | `DepositSlipService` | Liên kết phiếu thu (COD) |
| Service | `RackService` | Vị trí kho xuất hàng |
| Service | `CategoryService` | Dropdowns |
| Utility | `DiscountUtil` | Tính chiết khấu số lượng |
| Entity | `SalesSlipTrn` | SALES_SLIP_TRN |
| Entity | `SalesLineTrn` | SALES_LINE_TRN |

**Evidence (InputSalesAction.java)**:
```java
// line 81-115: Service injections
private SalesService salesService;
private SalesLineService salesLineService;
protected CustomerService customerService;
protected BillService billService;
public ProductService productService;
protected RoSlipSalesService roSlipSalesService;
protected RoLineService roLineService;
protected CategoryService categoryService;
protected DeliveryService deliveryService;
protected InputStockSalesService inputStockSalesService;
protected DepositSlipService depositSlipService;
protected RackService rackService;
```

---

## Database Tables

**READ**:
- `RO_SLIP_TRN` / `RO_LINE_TRN` – [nếu copy từ RO]
- `CUSTOMER_MST` – lookup + snapshot
- `DELIVERY_MST` – danh sách địa chỉ giao hàng
- `PRODUCT_MST` – thông tin sản phẩm, giá
- `PRODUCT_STOCK_TRN` – tính giá vốn (FIFO/LIFO inferred)
- `RACK_MST` – vị trí kho
- `DISCOUNT_MST` / `DISCOUNT_TRN` / `DISCOUNT_REL` – chiết khấu
- `BILL_TRN` – kiểm tra đã chốt chưa
- `TAX_RATE_MST` – thuế suất
- `CATEGORY_MST` / `CATEGORY_TRN` – dropdowns (vận chuyển, timezone, v.v.)
- `MINE_MST` – tax policy

**WRITE**:
- `SALES_SLIP_TRN` – INSERT / UPDATE (với 40+ denormalized snapshot columns)
- `SALES_LINE_TRN` – INSERT / UPDATE / DELETE
- `SALES_SLIP_TRN_HIST` – snapshot
- `SALES_LINE_TRN_HIST` – snapshot mỗi line
- `RO_LINE_TRN.REST_QUANTITY` – giảm khi SALES được tạo từ RO
- `EAD_SLIP_TRN` / `EAD_LINE_TRN` – phiếu xuất kho tự động
- `PRODUCT_STOCK_TRN` – cập nhật tồn kho
- `SEQ_MAKER` – next IDs cho tất cả bảng trên

---

## Validation Rules

1. `CUSTOMER_CODE` – required, phải tồn tại (DEL_DATETM IS NULL)
2. `SALES_DATE` – required, valid date
3. Mỗi line: `PRODUCT_CODE` – required, phải tồn tại
4. Mỗi line: `QUANTITY` > 0, `UNIT_PRICE` >= 0
5. Mỗi line: `RACK_CODE_SRC` – phải tồn tại nếu nhập
6. Phiếu đã có `BILL_ID` (đã chốt hóa đơn) → không được sửa
7. Token validator – phòng double submit
8. `SALES_CM_CATEGORY` – phải có trong CATEGORY_TRN

---

## Status Transitions (SALES_SLIP_TRN.STATUS)

```
[Chưa tồn tại]
    │ register() → SALES_SLIP_TRN INSERT
    ▼
"1" = Tạm (Temp/Draft)
    │         [Confirmed delivery]
    ▼
"2" = Xác nhận (Confirmed)
    │
    │ CloseBillAction.close() → WF-05
    ▼
"3" = Đã chốt hóa đơn (Bill closed)
    │   SALES_SLIP_TRN.BILL_ID được set
    │
    │ cancel()
    ▼
"9" = Hủy (Canceled)
    [EAD_SLIP reverse entry được tạo]
```

---

## External Integrations

**Vận đơn (Invoice) Export**:
```
OutputInvoiceAction.index()
  → Tạo INVOICE_DATA_WORK từ SALES_SLIP_TRN
  → Transform sang format shipper
  → Export CSV → Browser download
```

**COD (Thanh toán khi giao hàng)**:
- `SALES_SLIP_TRN.COD_SC = '1'` → phiếu COD
- Sau khi shipper xác nhận → `ImportDeliveryDepositAction` (WF-11)

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| BILL_ID đã set (đã chốt) | "errors.closedBill" – không cho sửa |
| Product không tồn tại | "errors.notExist" |
| RO đã canceled/completed | "errors.roOrder.status" (inferred) |
| Stock không đủ | Warning + tiếp tục |
| Double submit | Token check |
| ServiceException | `super.errorLog(e)` + throw |
| UnabledLockException | "errors.lock" |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/sales/InputSalesAction.java` | 1-65 | Class declaration, extends |
| `action/sales/InputSalesAction.java` | 79-115 | All service injections |
| `action/sales/InputSalesAction.java` | 150-205 | copy() method từ RO |
| `action/sales/InputSalesAction.java` | 220-240 | initCategoryList() – dropdowns |
| `action/sales/OutputInvoiceAction.java` | all | Vận đơn export |
| `action/sales/OutputSalesReportAction.java` | all | Báo cáo bán hàng |
| `DB/sql/createtable/CREATE.sql` | 1755-1906 | SALES_SLIP_TRN DDL |
| `DB/sql/createtable/CREATE.sql` | 2031-2073 | SALES_LINE_TRN DDL |
