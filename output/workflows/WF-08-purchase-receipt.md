# WF-08 – Nhập Hàng từ NCC (仕入入力 – Purchase Receipt)

**Confidence**: HIGH – Xác nhận từ `InputPurchaseAction.java` (1037 dòng), service imports  
**Loại**: Transaction entry workflow (procure-to-pay, bước 2/3)

---

## Entry Route
```
GET  /purchase/inputPurchase/index                  → Tạo phiếu nhập hàng
GET  /purchase/inputPurchase/edit/{supplierSlipId} → Mở phiếu nhập hàng
POST /purchase/inputPurchase/register               → Lưu phiếu nhập hàng
POST /purchase/inputPurchase/delete                 → Xóa phiếu
GET  /purchase/searchPurchase/index                 → Tìm kiếm
```

## User Role
- Kho / mua hàng (inferred)
- `MENU_ID.INPUT_PURCHASE` (inferred)

---

## Main Code Path

```
GET /purchase/inputPurchase/edit/{supplierSlipId}
  → InputPurchaseAction (edit mode)
    → SupplierSlipService.findByPk(supplierSlipId) [nếu edit]
    → PoSlipService.findPendingBySupplier() [PO chưa nhập đủ]
    → Render inputPurchase.jsp

POST /purchase/inputPurchase/register
  → InputPurchaseAction.register()
    → validate
    → SupplierService.findByCode(supplierCode) → snapshot NCC
    → Với mỗi line:
      → ProductService.findByCode(productCode)
      → RackService.findByCode(rackCode) [kệ nhập]
      → PoSlipService.findByPk(poSlipId) [liên kết PO]
      → tính PRICE, CTAX_PRICE, DOL_PRICE (nếu ngoại tệ)
    → SeqMakerService.getNextSeqId("SUPPLIER_SLIP_TRN")
    → SupplierSlipService.insert(dto)
      → INSERT SUPPLIER_SLIP_TRN
    → SupplierLineService.insertLines(dto)
      → INSERT SUPPLIER_LINE_TRN (N lines)
    → INSERT SUPPLIER_SLIP_TRN_HIST + SUPPLIER_LINE_TRN_HIST
    → PO_LINE_TRN.REST_QUANTITY -= QUANTITY  [giảm PO rest]
    → InputStockPurchaseService.createEadSlip()
      → INSERT EAD_SLIP_TRN (nhập kho)
      → INSERT EAD_LINE_TRN (cập nhật vị trí kho)
      → UPDATE PRODUCT_STOCK_TRN (tăng ENTER_NUM + STOCK_NUM)
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `InputPurchaseAction.java` | Main controller (1037 dòng) |
| Service | `SupplierSlipService` | SUPPLIER_SLIP_TRN CRUD |
| Service | `SupplierLineService` | SUPPLIER_LINE_TRN CRUD |
| Service | `PoSlipService` | Lookup PO để liên kết |
| Service | `SupplierService` | Lookup + snapshot NCC |
| Service | `ProductService` | Lookup sản phẩm |
| Service | `RackService` | Kệ nhập hàng |
| Service | `InputStockPurchaseService` | Tạo EAD + cập nhật stock |
| Service | `CategoryService` | Dropdowns |
| Entity | `SupplierSlipTrn` | SUPPLIER_SLIP_TRN |
| Entity | `SupplierLineTrn` | SUPPLIER_LINE_TRN |
| Entity | `PoSlipTrn` | PO reference |
| Entity | `Product` | Sản phẩm |
| Entity | `Supplier` | NCC |
| Entity | `Rack` | Kệ |

**Imports (InputPurchaseAction.java:23-46)**:
```java
import jp.co.arkinfosys.entity.PoSlipTrn;               // line 23
import jp.co.arkinfosys.entity.SupplierLineTrn;          // line 27
import jp.co.arkinfosys.entity.SupplierSlipTrn;          // line 28
import jp.co.arkinfosys.service.PoSlipService;           // line 39
import jp.co.arkinfosys.service.SupplierLineService;     // line 42
import jp.co.arkinfosys.service.SupplierSlipService;     // line 44
import jp.co.arkinfosys.service.stock.InputStockPurchaseService; // line 46
```

---

## Database Tables

**READ**:
- `SUPPLIER_MST` – lookup NCC + snapshot
- `PO_SLIP_TRN` / `PO_LINE_TRN` – PO chưa nhập đủ (REST_QUANTITY > 0)
- `PRODUCT_MST` – thông tin sản phẩm
- `RACK_MST` – kệ nhập hàng
- `RATE_MST` / `RATE_TRN` – tỷ giá (ngoại tệ)
- `CATEGORY_MST` / `CATEGORY_TRN` – dropdowns

**WRITE**:
- `SUPPLIER_SLIP_TRN` – INSERT / UPDATE
- `SUPPLIER_LINE_TRN` – INSERT / UPDATE / DELETE
- `SUPPLIER_SLIP_TRN_HIST` + `SUPPLIER_LINE_TRN_HIST` – snapshots
- `PO_LINE_TRN.REST_QUANTITY` – giảm
- `EAD_SLIP_TRN` / `EAD_LINE_TRN` – phiếu nhập kho tự động
- `PRODUCT_STOCK_TRN.ENTER_NUM` + `STOCK_NUM` – tăng
- `SEQ_MAKER` – next IDs

---

## Validation Rules

1. `SUPPLIER_CODE` – required, phải tồn tại
2. `SUPPLIER_DATE` – required, valid date
3. Mỗi line: `PRODUCT_CODE` – required
4. Mỗi line: `QUANTITY` > 0
5. Mỗi line: `RACK_CODE` – required (kệ nhập)
6. Mỗi line: `PO_LINE_ID` – phải tồn tại nếu liên kết PO
7. Mỗi line: Quantity ≤ PO_LINE.REST_QUANTITY (warning nếu vượt)
8. `MAX_LINE_ROW_COUNT = 35` – giới hạn số dòng tối đa (`InputPurchaseAction.java:78`)

---

## Status Transitions

```
SUPPLIER_SLIP_TRN.STATUS:
  "0" = Mở (sau khi nhập)
  "1" = Đã link với PAYMENT_SLIP → WF-09

PO_LINE_TRN.REST_QUANTITY:
  QUANTITY → giảm dần → 0 (nhập đủ)
  Khi tất cả lines = 0: PO_SLIP_TRN.STATUS = "3" (Complete)

PRODUCT_STOCK_TRN:
  STOCK_NUM += QUANTITY  ← tăng tồn kho thực tế
  ENTER_NUM += QUANTITY  ← ghi nhận nhập kho kỳ này
```

---

## External Integrations

- Không có file import – nhập hàng luôn manual
- **EAD automatic**: Mỗi lần lưu → `InputStockPurchaseService` tự tạo EAD phiếu nhập kho

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| NCC không tồn tại | "errors.notExist" |
| PO_LINE không tồn tại | "errors.notExist" |
| Quantity vượt PO REST | Warning (không block) |
| Rack không tồn tại | "errors.notExist" |
| MAX_LINE exceeded | "errors.maxLine" (inferred) |
| ServiceException | Log + throw |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/purchase/InputPurchaseAction.java` | 1-80 | Class, MAX_LINE_ROW_COUNT = 35 |
| `action/purchase/InputPurchaseAction.java` | 38-46 | Key service imports |
| `service/SupplierSlipService.java` | all | Main business logic |
| `service/SupplierLineService.java` | all | Line management |
| `service/stock/InputStockPurchaseService.java` | all | EAD + stock update |
| `DB/sql/createtable/CREATE.sql` | 2881-3015 | SUPPLIER_SLIP/LINE DDL |
| `DB/sql/createtable/CREATE.sql` | 3065-3160 | EAD_SLIP/LINE DDL |
