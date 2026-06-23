# 09 – External Integrations

> **Trạng thái**: Kết hợp xác nhận từ code và suy luận  
> **Nguồn**: Action classes (deposit/, rorder/), Service classes, MENU_MST.sql

---

## 1. Tổng quan

SalesCube tích hợp với các hệ thống bên ngoài chủ yếu qua **file import/export** (không có REST API hay message queue được xác nhận). Tất cả tích hợp đều là **batch-mode**, không real-time.

---

## 2. Tích hợp Ngân hàng (Bank Integration)

### 2.1. Import Sao kê Ngân hàng (銀行入金データ取込)

**Route**: `GET/POST /deposit/importBankDeposit`  
**Action**: `ImportBankDepositAction.java` (12KB)  
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/deposit/ImportBankDepositAction.java`

**Mô tả**: Import dữ liệu thu tiền từ file sao kê ngân hàng (tự động match với phiếu thu).

**Flow** (inferred từ class size và service):
```
Upload file (bank statement format)
    │
    ├── Parse: BankDepositWorkService (staging)
    │   └── Write: BANK_DEPOSIT_WORK_XXXXX
    │
    ├── Auto-match với outstanding bills:
    │   └── Read: BILL_TRN, ART_BALANCE_TRN
    │
    └── Confirm → tạo DEPOSIT_SLIP:
        ├── Write: DEPOSIT_SLIP_TRN
        ├── Write: DEPOSIT_LINE_TRN
        └── Write: BANK_DEPOSIT_REL_XXXXX (liên kết bank record → deposit)
```

**Format file**: Chưa xác nhận từ source (cần đọc `ImportBankDepositAction.java` chi tiết).  
**Ngân hàng hỗ trợ**: Chưa xác nhận (inferred: Japanese bank zengin format hoặc CSV).

---

## 3. Tích hợp Đơn vị Vận chuyển (Delivery/Shipper Integration)

### 3.1. Import Thu tiền Vận chuyển (配送業者入金データ取込)

**Route**: `GET/POST /deposit/importDeliveryDeposit`  
**Action**: `ImportDeliveryDepositAction.java` (20KB)  
**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/deposit/ImportDeliveryDepositAction.java`

**Mô tả**: Import dữ liệu thu tiền từ đơn vị vận chuyển (COD – Cash On Delivery), tự động tạo phiếu thu tương ứng.

**Flow** (inferred):
```
Upload file (shipper payment data)
    │
    ├── DeliveryDepositWorkService.import()
    │   └── Write: DELIVERY_DEPOSIT_WORK_XXXXX (staging)
    │
    ├── Match với SALES_SLIP_TRN (COD_SC = "1")
    │
    └── Confirm → tạo DEPOSIT_SLIP:
        ├── Write: DEPOSIT_SLIP_TRN (type = COD)
        ├── Write: DEPOSIT_LINE_TRN
        └── Write: DELIVERY_DEPOSIT_REL_XXXXX
```

**SALES_SLIP_TRN.COD_SC** – cờ COD trong schema (`CREATE.sql:1604`)

**Đơn vị vận chuyển hỗ trợ** (inferred từ field `DC_CATEGORY`, `DC_NAME`, `DC_TIMEZONE`):  
- Yamato Transport, Sagawa, JP Post, hoặc các shipper Nhật khác  
- **Chưa xác nhận tên shipper cụ thể từ source code**

---

## 4. Tích hợp Đặt hàng Online (EC/Online Order Integration)

### 4.1. Import Đơn hàng Online (オンライン受注データ取込)

**Route**: `GET/POST /rorder/importOnlineOrder`  
**Action**: `ImportOnlineOrderAction.java`  
**Service**: `OnlineOrderService.java` (12KB)

**Mô tả**: Import đơn hàng từ EC site (thương mại điện tử) vào hệ thống nhận đơn.

**Flow** (inferred):
```
Upload file (EC order data)
    │
    ├── Parse và staging:
    │   └── Write: ONLINE_ORDER_WORK_XXXXX
    │
    ├── Validate và match:
    │   ├── Match với PRODUCT_MST (bằng ONLINE_PCODE)
    │   └── Match hoặc tạo CUSTOMER_MST (bằng email/name)
    │
    └── Confirm → tạo RO:
        ├── Write: RO_SLIP_TRN
        ├── Write: RO_LINE_TRN
        └── Write: ONLINE_ORDER_REL_XXXXX (liên kết EC order → RO)
```

**PRODUCT_MST.ONLINE_PCODE** – Mã sản phẩm của EC site (`appconfig.dicon:23`)

**EC platform hỗ trợ**: **Chưa xác nhận** – field `ONLINE_PCODE` cho thấy có mapping mã sản phẩm giữa EC và ERP.

---

## 5. Tích hợp Export Vận đơn (Invoice/Shipping Label Export)

### 5.1. Xuất Dữ liệu Vận đơn (送り状データ出力)

**Route**: `GET /sales/outputInvoice`  
**Action**: `OutputInvoiceAction.java`  
**Related Work Table**: `INVOICE_DATA_WORK_XXXXX`

**Mô tả**: Xuất dữ liệu địa chỉ giao hàng cho đơn vị vận chuyển (tạo vận đơn).

**Output format**: CSV hoặc fixed-format text (inferred – cần xác nhận).  
**Sử dụng**: Import vào phần mềm in vận đơn của shipper.

---

## 6. Export Sản phẩm Excel

### 6.1. Download/Upload Sản phẩm Excel (商品ダウンロード/アップロード)

**Routes**:
- `GET /master/downloadProductExcel` – `DownloadProductExcelAction.java` (1KB)
- `POST /master/importProductExcel` – `ImportProductExcelAction.java` (3KB)

**Mô tả**: Cho phép quản lý sản phẩm hàng loạt qua Excel.

**CSV/Excel Columns** (xác nhận từ `appconfig.dicon:22-24`):
```
PRODUCT_CODE, PRODUCT_NAME, PRODUCT_KANA, ONLINE_PCODE, SUPPLIER_PCODE,
SUPPLIER_CODE, RACK_CODE, SUPPLIER_PRICE_YEN, SUPPLIER_PRICE_DOL,
RETAIL_PRICE, SO_RATE, UNIT_CATEGORY, PACK_QUANTITY, JAN_PCODE,
WIDTH, DEPTH, HEIGHT, WEIGHT, LENGTH, PO_LOT, LEAD_TIME, ...
(67 columns total)
```

**File**: `@/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/resources/appconfig.dicon:21-24`

---

## 7. Import Mã Bưu điện Nhật (Japan Post Zip Code)

**Route**: `GET/POST /master/importZipCodeCSV`  
**Action**: `ImportZipCodeCSVAction.java` (5KB)

**Mô tả**: Import dữ liệu mã bưu điện từ Japan Post (update định kỳ).

**Format**: Japan Post official CSV format  
**Destination**: `ZIP_MST_XXXXX`  
**Sử dụng**: Auto-fill địa chỉ khi nhập ZIP code trong form

---

## 8. JasperReports (Report Engine)

**Không phải external API** – nhưng là thư viện tích hợp quan trọng.

**26 template files** trong `WEB-INF/report_template/`:
- Input: S2JDBC query data
- Output: PDF (hoặc Excel?)

**Base class**: `AbstractReportWriterAction.java` (11KB)  
**Config**: `src/main/resources/jasperreports_extension.properties`

---

## 9. Tích hợp Không Tìm Thấy trong Source

| Tích hợp | Status | Ghi chú |
|---------|--------|---------|
| Email/SMTP | ❌ NOT FOUND | Không có email send code |
| REST API ra ngoài | ❌ NOT FOUND | Không có HTTP client code |
| FTP/SFTP | ❓ UNKNOWN | Có thể dùng để transfer files |
| ERP tích hợp (SAP...) | ❌ NOT FOUND | |
| Payment gateway | ❌ NOT FOUND | |
| SSO/LDAP | ⚠️ PARTIAL | Có SSO flow trong LoginAction nhưng không rõ provider |
| Barcode/Scanner | ❓ UNKNOWN | JAN_PCODE trong PRODUCT_MST gợi ý barcode |

---

## 10. Tóm tắt Tích hợp

| Hệ thống | Hướng | Phương thức | Xác nhận |
|---------|-------|-------------|----------|
| Ngân hàng | Nhập | File upload | ✅ Confirmed (action class) |
| Shipper/COD | Nhập | File upload | ✅ Confirmed (action class) |
| EC platform | Nhập | File upload | ✅ Confirmed (action class) |
| Shipper (vận đơn) | Xuất | File download | ✅ Confirmed (action class) |
| Japan Post (zip) | Nhập | CSV import | ✅ Confirmed (action class) |
| Excel (sản phẩm) | Hai chiều | File upload/download | ✅ Confirmed (action class) |
| JasperReports | Nội bộ | Library | ✅ Confirmed |
