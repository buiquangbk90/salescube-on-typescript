# WF-07 – Đặt Hàng Nhà Cung Cấp (発注入力 – Purchase Order)

**Confidence**: HIGH – Xác nhận từ `InputPOrderAction.java`, `InputPurchaseAction.java`  
**Loại**: Transaction entry workflow (procure-to-pay, bước 1/3)

---

## Entry Route
```
GET  /porder/inputPOrder/index                 → Form đặt hàng mới
GET  /porder/inputPOrder/edit/{poSlipId}      → Mở phiếu đặt hàng
POST /porder/inputPOrder/register              → Lưu phiếu đặt hàng
POST /porder/inputPOrder/delete                → Xóa phiếu
GET  /porder/searchPOrder/index                → Tìm kiếm
GET  /porder/outputRecommendList/index         → Danh sách đề xuất đặt hàng
GET  /porder/makeOutPOrder/index               → In phiếu đặt hàng (PDF)
```

## User Role
- Mua hàng / kho (inferred)
- `userDto.isMenuUpdate(MENU_ID.INPUT_PORDER)` (inferred từ pattern)

---

## Main Code Path

```
GET /porder/outputRecommendList/index
  → OutputRecommendListAction.index()
    → Phân tích PRODUCT_MST (MINE_SAFETY_STOCK, AVG_SHIP_COUNT)
    → So sánh với PRODUCT_STOCK_TRN hiện tại
    → Trả về danh sách sản phẩm cần đặt hàng

POST /porder/inputPOrder/register
  → InputPOrderAction.register()
    → validate form
    → SupplierService.findByCode(supplierCode) → snapshot
    → Với mỗi line:
      → ProductService.findByCode(productCode)
      → tính PRICE = QUANTITY * UNIT_PRICE
    → SeqMakerService.getNextSeqId("PO_SLIP_TRN")
    → InputPOrderSlipService.insert(dto)
      → INSERT PO_SLIP_TRN
    → InputPOrderLineService.insertLines(dto)
      → INSERT PO_LINE_TRN (N lines, REST_QUANTITY = QUANTITY)
    → INSERT PO_SLIP_TRN_HIST
    → INSERT PO_LINE_TRN_HIST
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `InputPOrderAction.java` | Phiếu đặt hàng CRUD |
| Action | `OutputRecommendListAction.java` | Danh sách sản phẩm cần đặt |
| Action | `MakeOutPOrderAction.java` | In phiếu đặt hàng |
| Service | `InputPOrderSlipService` | PO_SLIP_TRN CRUD |
| Service | `InputPOrderLineService` | PO_LINE_TRN CRUD |
| Service | `SupplierService` | Lookup NCC + snapshot |
| Service | `ProductService` | Lookup sản phẩm |
| Service | `CategoryService` | Dropdowns |
| Entity | `PoSlipTrn` | PO_SLIP_TRN |
| Entity | `PoLineTrn` | PO_LINE_TRN |
| Entity | `Supplier` | SUPPLIER_MST |

**Imports (InputPOrderAction.java:23-38)**:
```java
import jp.co.arkinfosys.entity.PoLineTrn;           // line 23
import jp.co.arkinfosys.entity.PoSlipTrn;           // line 24
import jp.co.arkinfosys.entity.Supplier;             // line 25
import jp.co.arkinfosys.service.porder.InputPOrderSlipService; // line 38
import jp.co.arkinfosys.service.porder.InputPOrderLineService; // line 37
```

---

## Database Tables

**READ**:
- `SUPPLIER_MST` – lookup NCC + snapshot
- `PRODUCT_MST` – thông tin sản phẩm, giá nhập
- `PRODUCT_STOCK_TRN` – tồn kho hiện tại (để tính recommend)
- `CATEGORY_MST` / `CATEGORY_TRN` – transport category dropdown
- `RATE_MST` – tỷ giá (nếu đặt hàng ngoại tệ)

**WRITE**:
- `PO_SLIP_TRN` – INSERT / UPDATE / soft-delete
- `PO_LINE_TRN` – INSERT / UPDATE / DELETE, `REST_QUANTITY = QUANTITY`
- `PO_SLIP_TRN_HIST` – snapshot
- `PO_LINE_TRN_HIST` – snapshot
- `SEQ_MAKER` – next IDs

---

## Validation Rules

1. `SUPPLIER_CODE` – required, phải tồn tại
2. `PO_DATE` – required
3. Mỗi line: `PRODUCT_CODE` – required
4. Mỗi line: `QUANTITY` > 0
5. Mỗi line: `UNIT_PRICE` >= 0
6. `REST_QUANTITY = QUANTITY` lúc tạo (NOT NULL)
7. Không xóa PO đã có SUPPLIER_SLIP liên kết

---

## Status Transitions (PO_SLIP_TRN.STATUS)

```
[Không tồn tại]
    │ register()
    ▼
"0" = Nháp / Đã gửi NCC
    │
    │ [Tạo SUPPLIER_SLIP → WF-08]
    ▼
"2" = Đang nhập (Partial, REST_QUANTITY giảm)
    │
    │ [REST_QUANTITY tất cả lines = 0]
    ▼
"3" = Hoàn thành
```

**PO_LINE_TRN.REST_QUANTITY**:
- NOT NULL – giảm khi `SUPPLIER_LINE_TRN` được tạo từ PO_LINE
- = 0 → line hoàn thành

---

## External Integrations

**In phiếu đặt hàng (PDF)**:
```
MakeOutPOrderAction → AbstractReportService → JasperReports
→ Render PO PDF → Browser download
```

**Recommend List**:
- Dựa trên `PRODUCT_MST.MINE_SAFETY_STOCK` (updated by batch)
- So sánh `PRODUCT_STOCK_TRN.STOCK_NUM` vs `MINE_SAFETY_STOCK`
- Không có auto-ordering – chỉ đề xuất

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| Supplier không tồn tại | "errors.notExist" |
| Product không tồn tại | "errors.notExist" |
| PO đã có supplier slip | Không cho xóa |
| ServiceException | Log + throw |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/porder/InputPOrderAction.java` | 1-100 | Class, imports, services |
| `action/porder/InputPOrderAction.java` | 51-99 | All services + dropdowns |
| `action/porder/OutputRecommendListAction.java` | all | Recommend list |
| `action/porder/MakeOutPOrderAction.java` | all | Print PO |
| `DB/sql/createtable/CREATE.sql` | 2683-2835 | PO_SLIP/LINE DDL |
