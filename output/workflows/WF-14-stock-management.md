# WF-14 – Quản lý Tồn Kho (在庫管理 – Stock Management)

**Confidence**: MEDIUM – Xác nhận từ service imports, entity names, EAD DDL  
**Loại**: Inventory management + stock closing workflow

---

## Entry Route
```
GET  /stock/inputStock/index               → Điều chỉnh tồn kho thủ công
GET  /stock/searchStock/index              → Tìm kiếm tồn kho
GET  /setting/stockAction/index            → Cài đặt tồn kho (safety stock)
```

## User Role
- Kho / quản lý kho (inferred)
- `userDto.isMenuUpdate(MENU_ID.INPUT_STOCK)` (inferred)

---

## Main Code Path

### A. Stock Update (Automatic – via EAD)

Tồn kho được cập nhật **tự động** khi:

```
WF-04 Sales (xuất hàng):
  InputStockSalesService.createEadSlip()
    → INSERT EAD_SLIP_TRN (EAD_SLIP_CATEGORY = "出庫" dispatch)
    → INSERT EAD_LINE_TRN (product, rack, quantity)
    → UPDATE PRODUCT_STOCK_TRN:
        DISPATCH_NUM += QUANTITY
        STOCK_NUM -= QUANTITY

WF-08 Purchase (nhập hàng):
  InputStockPurchaseService.createEadSlip()
    → INSERT EAD_SLIP_TRN (EAD_SLIP_CATEGORY = "入庫" enter)
    → INSERT EAD_LINE_TRN
    → UPDATE PRODUCT_STOCK_TRN:
        ENTER_NUM += QUANTITY
        STOCK_NUM += QUANTITY

WF-04 Cancel (hủy xuất):
  → INSERT EAD_SLIP_TRN (EAD_CATEGORY = "返品" return)
  → UPDATE PRODUCT_STOCK_TRN:
      RETURN_NUM += QUANTITY
      STOCK_NUM += QUANTITY
```

### B. Manual Stock Adjustment

```
POST /stock/inputStock/register
  → StockAction (inferred)
    → EadService.createAdjustment()
      → INSERT EAD_SLIP_TRN (EAD_SLIP_CATEGORY = "調整" adjust)
      → INSERT EAD_LINE_TRN
      → UPDATE PRODUCT_STOCK_TRN.STOCK_NUM
    → INSERT EAD_SLIP_TRN_HIST
```

### C. Stock Closing (月次棚卸)

```
StockAction.close()
  → Carry-forward: PRODUCT_STOCK_TRN (tháng mới)
    → INSERT PRODUCT_STOCK_TRN (ANNUAL=new, MONTHLY=new)
    → STOCK_NUM = previous month STOCK_NUM + ENTER_NUM - DISPATCH_NUM + RETURN_NUM
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `action/stock/*` | Stock management |
| Action | `setting/StockAction.java` | Stock settings |
| Service | `EadService` (inferred) | EAD_SLIP/LINE CRUD |
| Service | `InputStockSalesService` | Auto EAD khi xuất hàng bán |
| Service | `InputStockPurchaseService` | Auto EAD khi nhập hàng |
| Service | `ProductStockService` | PRODUCT_STOCK_TRN CRUD |
| Service | `RackService` | Rack management |
| Service | `WarehouseService` (inferred) | Warehouse management |
| Entity | `EadSlipTrn` | EAD_SLIP_TRN |
| Entity | `EadLineTrn` | EAD_LINE_TRN |
| Entity | `ProductStockTrn` | PRODUCT_STOCK_TRN |
| Entity | `Rack` | RACK_MST |

---

## Database Tables

**READ**:
- `PRODUCT_STOCK_TRN` – tồn kho hiện tại
- `PRODUCT_MST` – thông tin sản phẩm, safety stock
- `RACK_MST` – vị trí kho
- `WAREHOUSE_MST` – kho vật lý
- `EAD_SLIP_TRN` / `EAD_LINE_TRN` – lịch sử nhập/xuất
- `SALES_LINE_TRN` – link xuất hàng
- `SUPPLIER_LINE_TRN` – link nhập hàng

**WRITE**:
- `EAD_SLIP_TRN` – INSERT mỗi lần nhập/xuất/điều chỉnh
- `EAD_LINE_TRN` – INSERT chi tiết
- `EAD_SLIP_TRN_HIST` + `EAD_LINE_TRN_HIST` – snapshots
- `PRODUCT_STOCK_TRN.STOCK_NUM` – cập nhật mỗi transaction
- `PRODUCT_STOCK_TRN.ENTER_NUM` / `DISPATCH_NUM` / `RETURN_NUM` – tích lũy kỳ
- `SEQ_MAKER` – next EAD IDs

---

## EAD_SLIP_TRN Categories

```
EAD_SLIP_CATEGORY:
  "01" = 入庫 (nhập kho) ← từ WF-08
  "02" = 出庫 (xuất kho) ← từ WF-04
  "03" = 調整 (điều chỉnh) ← manual
  "04" = 返品 (hàng trả) ← cancel WF-04
  "05" = 棚卸 (kiểm kê) ← closing

EAD_CATEGORY (ủy thác):
  "01" = 自社在庫 (tồn kho nội bộ)
  "02" = 委託在庫 (tồn kho ủy thác)

SRC_FUNC (nguồn tạo phiếu):
  "SA" = Sales (từ phiếu bán)
  "PU" = Purchase (từ phiếu nhập)
  "MN" = Manual
```

---

## Batch: SP_UPDATE_PRODUCT_STATUS_CATEGORY

```sh
# UpdateProductStatusCategory.sh
mysql → SP_UPDATE_PRODUCT_STATUS_CATEGORY(domain)
      → SP_UPDATE_PRODUCT_STOCK_VALUES(domain)
```

**Cập nhật trên PRODUCT_MST**:
- `PRODUCT_STATUS_CATEGORY` – dựa trên tồn kho vs. safety stock
- `MINE_SAFETY_STOCK` – tính lại safety stock
- `AVG_SHIP_COUNT` – trung bình xuất kho N tháng
- `SALES_STANDARD_DEVIATION` – độ lệch chuẩn doanh số
- `TERM_SHIP_NUM` – số lần xuất trong kỳ

**Input**: `PRODUCT_STOCK_TRN`, `SALES_LINE_TRN`, `MINE_MST`

---

## Validation Rules

1. `RACK_CODE` – required cho EAD line
2. `QUANTITY` > 0 (hoặc < 0 nếu điều chỉnh âm)
3. Điều chỉnh âm: `STOCK_NUM + adjustment` phải >= 0 (không cho tồn kho âm) [inferred]
4. `RACK_MULTI_FLAG` = '0' → một sản phẩm một kệ
5. Không thể nhập/xuất sản phẩm không có `STOCK_CTL_CATEGORY` = '1'

---

## Status Transitions

```
PRODUCT_STOCK_TRN:
  STOCK_NUM biến động liên tục
  ENTER_NUM + DISPATCH_NUM + RETURN_NUM tích lũy trong tháng

  Cuối tháng (stock close):
    → INSERT row mới cho tháng sau (carry-forward)
    → Row cũ giữ nguyên (lịch sử)

EAD_SLIP_TRN:
  Luôn INSERT mới, không UPDATE
  → Append-only ledger của tất cả stock movements
```

---

## External Integrations

- **Batch** cập nhật `PRODUCT_STATUS_CATEGORY` từ stored procedure
- Không có WMS (Warehouse Management System) integration
- Không có barcode scanner integration (manual entry)

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| RACK không tồn tại | "errors.notExist" |
| Tồn kho âm (nếu validate) | "errors.stockNegative" (inferred) |
| Product không có STOCK_CTL | Skip EAD creation (inferred) |
| ServiceException | Log + throw |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `action/stock/` | all | Stock action classes |
| `action/setting/StockAction.java` | all | Stock settings |
| `service/stock/InputStockSalesService.java` | all | Auto EAD khi bán |
| `service/stock/InputStockPurchaseService.java` | all | Auto EAD khi nhập |
| `service/ProductStockService.java` | all | PRODUCT_STOCK_TRN |
| `DB/sql/createtable/CREATE.sql` | 3065-3160 | EAD_SLIP/LINE DDL |
| `DB/sql/createtable/CREATE.sql` | 1310-1370 | PRODUCT_STOCK_TRN DDL (inferred range) |
| `DB/batch/salescube_batch/UpdateProductStatusCategory.sh` | all | Batch script |
