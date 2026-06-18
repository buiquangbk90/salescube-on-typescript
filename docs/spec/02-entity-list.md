# SalesCube - Entity List (Danh sách Entity/Table)

> Tài liệu này liệt kê toàn bộ entity và database table của SalesCube.
> **Source:** `workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/`

---

## 1. MASTER DATA Entities (Entity dữ liệu gốc)

### 1.1. Customer (得意先マスタ)

**Table:** `CUSTOMER_MST` | **Entity:** `Customer.java` | **File:** `@/workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/Customer.java:1-159`

| Field | Type | Mô tả | Notes |
|-------|------|-------|-------|
| customerCode | String | Mã khách hàng | PK |
| customerName | String | Tên khách hàng | - |
| customerKana | String | Tên Katakana | Dùng tìm kiếm |
| customerOfficeName | String | Tên văn phòng | - |
| customerAbbr | String | Tên viết tắt | - |
| customerDeptName | String | Tên bộ phận | - |
| customerZipCode | String | Mã bưu điện | - |
| customerAddress1/2 | String | Địa chỉ | - |
| customerPcName | String | Người liên hệ | - |
| customerPcPreCategory | String | Xưng hô (様/殿) | - |
| customerTel/Fax/Email | String | Liên lạc | - |
| customerBusinessCategory | String | Ngành nghề | - |
| customerRankCategory | String | Xếp hạng KH | - |
| taxShiftCategory | String | Cách tính thuế | 内税/外税 |
| rate | BigDecimal | Tỷ lệ chiết khấu | - |
| maxCreditLimit | BigDecimal | Hạn mức tín dụng | - |
| lastCutoffDate | Date | Ngày chốt cuối | - |
| cutoffGroup | String | Nhóm chốt | - |
| paybackTypeCategory | String | Hình thức thanh toán | - |
| paybackCycleCategory | String | Chu kỳ thanh toán | - |
| taxFractCategory | String | Làm tròn thuế | - |
| priceFractCategory | String | Làm tròn tiền | - |
| billPrintUnit | String | Đơn vị in hóa đơn | - |
| firstSalesDate | Date | Ngày mua đầu tiên | - |
| lastSalesDate | Date | Ngày mua cuối | - |
| salesPriceTotal | BigDecimal | Tổng doanh thu | - |
| tanCd/nTanCd/kTanCd | String | Mã người phụ trách | - |
| ginkno/ginknm/sitenm | String | Thông tin ngân hàng | - |
| kozsyu/kozano/kozame | String | Thông tin tài khoản | - |

---

### 1.2. Product (商品マスタ)

**Table:** `PRODUCT_MST` | **Entity:** `Product.java` | **File:** `@/workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/Product.java:1-328`

| Field | Type | Mô tả | Notes |
|-------|------|-------|-------|
| productCode | String | Mã sản phẩm | PK |
| productName | String | Tên sản phẩm | - |
| productKana | String | Tên Katakana | - |
| onlinePcode | String | Mã online | - |
| supplierPcode | String | Mã NCC | - |
| supplierCode | String | Mã nhà cung cấp | FK |
| rackCode | String | Mã kệ hàng | FK |
| supplierPriceYen/Dol | BigDecimal | Giá mua | - |
| retailPrice | BigDecimal | Giá bán lẻ 1 | - |
| retailStartDate/EndDate | Date | Thời hạn giá 1 | - |
| retailPrice2/3 | BigDecimal | Giá bán lẻ 2,3 | - |
| webRetailPrice | BigDecimal | Giá web | - |
| soRate | BigDecimal | Tỷ lệ SO | - |
| unitCategory | String | Đơn vị tính | - |
| packQuantity | Short | Số lượng/đóng gói | - |
| janPcode | String | Mã JAN (Barcode) | - |
| width/depth/height/weight/length | Float | Kích thước | - |
| poLot | BigDecimal | Lot đặt hàng | - |
| leadTime | Integer | Thời gian chờ | - |
| mineSafetyStock | Integer | Tồn kho an toàn | - |
| maxStockNum | Integer | Tồn kho tối đa | - |
| fractCategory | String | Phân loại làm tròn | - |
| taxCategory | String | Phân loại thuế | - |
| stockCtlCategory | String | Kiểm soát tồn kho | - |
| productCategory | String | Phân loại SP | - |
| product1/2/3 | String | Phân loại chi tiết | - |
| productRank | String | Xếp hạng SP | - |
| productStatusCategory | String | Trạng thái SP | - |
| discardDate | Date | Ngày ngừng bán | - |
| remarks | String | Ghi chú | - |

---

### 1.3. User (ユーザーマスタ)

**Table:** `USER_MST` | **Entity:** `User.java`

| Field | Type | Mô tả |
|-------|------|-------|
| userId | String | Mã người dùng | PK |
| nameKnj | String | Tên Hán tự | - |
| nameKana | String | Tên Katakana | - |
| deptId | String | Mã phòng ban | FK |
| email | String | Email | - |
| password | String | Mật khẩu (hash) | - |

---

### 1.4. Category (区分マスタ)

**Table:** `CATEGORY_MST` | **Entity:** `Category.java`

| Field | Type | Mô tả |
|-------|------|-------|
| categoryId | String | Mã phân loại | PK |
| categoryCode | String | Mã code | - |
| categoryName | String | Tên phân loại | - |

---

### 1.5. TaxRate (税率マスタ)

**Table:** `TAX_RATE_MST` | **Entity:** `TaxRate.java`

| Field | Type | Mô tả |
|-------|------|-------|
| taxType | String | Loại thuế | PK |
| startDate | Date | Ngày bắt đầu | PK |
| taxRate | BigDecimal | Thuế suất | - |
| taxShiftCategory | String | Cách tính thuế | - |

**Business Rule:**
- Báo chí: 8%
- Sách/Quảng cáo: 10%

---

### 1.6. Other Masters

| Entity | Table | Mô tả |
|--------|-------|-------|
| Bank | `BANK_MST` | Ngân hàng |
| Supplier | `SUPPLIER_MST` | Nhà cung cấp |
| Rack | `RACK_MST` | Kệ hàng |
| Department | `DEPT_MST` | Phòng ban |
| CustomerRank | `CUSTOMER_RANK_MST` | Xếp hạng KH |

---

## 2. TRANSACTION Entities (Giao dịch)

### 2.1. SalesSlipTrn (売上伝票)

**Table:** `SALES_SLIP_TRN` / `SALES_SLIP_TRN_HIST` | **Entity:** `SalesSlipTrn.java` | **File:** `@/workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/SalesSlipTrn.java:1-859`

**Constants:**
- `STATUS_INIT = "0"` | `STATUS_FINISH = "9"`
- `TYPE_SALES = "0"` | `TYPE_NEWS = "1"` | `TYPE_WEB = "2"`

| Field | Type | Mô tả | Notes |
|-------|------|-------|-------|
| salesSlipId | Integer | ID | PK, Auto |
| status | String | Trạng thái | 0=Init, 9=Finish |
| salesType | String | Loại | 0=Sales, 1=News, 2=Web |
| salesAnnual/Monthly | Short | Năm/Tháng | - |
| salesYm | Integer | YYYYMM | - |
| roSlipId | Integer | ID đơn hàng RO | FK |
| billId | Integer | ID hóa đơn | FK |
| billDate | Date | Ngày HĐ | - |
| billCutoffDate | Date | Ngày chốt HĐ | - |
| salesDate | Date | Ngày bán | - |
| deliveryDate | Date | Ngày giao | - |
| receptNo | String | Số biên nhận | - |
| customerCode | String | Mã KH | FK |
| customerName | String | Tên KH | - |
| deliveryCode | String | Mã nơi giao | FK |
| deliveryName | String | Tên nơi giao | - |
| deliveryZipCode | String | Mã bưu điện giao | - |
| deliveryAddress1/2 | String | Địa chỉ giao | - |
| deliveryPcName | String | Người nhận | - |
| deliveryTel | String | Điện thoại giao | - |
| baCode/baName | String | Mã/Tên BA | - |
| taxShiftCategory | String | Cách tính thuế | - |
| ctaxPriceTotal | BigDecimal | Tổng thuế | - |
| priceTotal | BigDecimal | Tổng tiền (chưa thuế) | - |
| gmTotal | BigDecimal | Tổng GM | - |
| billPrintCount | Integer | Số lần in HĐ | - |
| deliveryPrintCount | Integer | Số lần in giao | - |
| tanCd/tanName | String | Người phụ trách | - |
| nTanCd/nTanName | String | Người phụ trách mới | - |
| kTanCd/kTanName | String | Người phụ trách cũ | - |
| seiKbn | Integer | Phân loại thuế | - |
| ryoKbn | Integer | Phân loại RYO | - |
| zeiKbn | Integer | Phân loại thuế | - |
| simeDd | Integer | Ngày chốt | - |
| bankCode/storeCode/accountNum | String | Thông tin NH | - |
| creFunc/creDatetm/creUser | - | Audit create | - |
| updFunc/updDatetm/updUser | - | Audit update | - |

---

### 2.2. SalesLineTrn (売上伝票明細行)

**Table:** `SALES_LINE_TRN` | **Entity:** `SalesLineTrn.java` | **File:** `@/workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/SalesLineTrn.java:1-251`

| Field | Type | Mô tả | Notes |
|-------|------|-------|-------|
| salesLineId | Integer | ID dòng | PK, Auto |
| status | String | Trạng thái | - |
| salesSlipId | Integer | ID phiếu bán | FK |
| lineNo | Short | Số dòng | - |
| roLineId | Integer | ID dòng RO | FK |
| salesDetailCategory | String | Loại chi tiết | - |
| productCode | String | Mã SP | FK |
| customerPcode | String | Mã SP KH | - |
| productAbstract | String | Tóm tắt SP | - |
| quantity | BigDecimal | Số lượng | - |
| deliveryProcessCategory | String | Xử lý giao hàng | - |
| unitPrice | BigDecimal | Đơn giá | - |
| unitCategory | String | Đơn vị | - |
| unitName | String | Tên đơn vị | - |
| packQuantity | Short | Số lượng/đóng gói | - |
| unitRetailPrice | BigDecimal | Giá bán lẻ 1 | - |
| unitRetailPriceStart/EndDate | Date | Thời hạn giá 1 | - |
| unitRetailPrice2/3 | BigDecimal | Giá bán lẻ 2,3 | - |
| retailPrice | BigDecimal | Giá bán lẻ | - |
| unitCost | BigDecimal | Giá vốn | - |
| cost | BigDecimal | Chi phí | - |
| taxCategory | String | Loại thuế | - |
| ctaxRate | BigDecimal | Thuế suất | - |
| ctaxPrice | BigDecimal | Tiền thuế | - |
| gm | BigDecimal | GM (Gross Margin) | - |
| remarks | String | Ghi chú | - |
| eadRemarks | String | Ghi chú EAD | - |
| rackCodeSrc | String | Mã kệ nguồn | - |
| depositPrice | BigDecimal | Tiền đặt cọc | - |

---

### 2.3. Bill (請求書)

**Table:** `BILL_TRN` | **Entity:** `Bill.java` | **File:** `@/workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/Bill.java:1-157`

**Constants:**
- `STATUS_INIT = "0"`
- `TYPE_SALES = "0"` | `TYPE_NEWS = "1"` | `TYPE_WEB = "2"`

| Field | Type | Mô tả | Notes |
|-------|------|-------|-------|
| billId | Integer | ID HĐ | PK |
| status | String | Trạng thái | - |
| billYear/Month | Short | Năm/Tháng HĐ | - |
| billYm | Integer | YYYYMM | - |
| billCutoffDate | Date | Ngày chốt HĐ | - |
| cutoffGroup | String | Nhóm chốt | - |
| remarks | String | Ghi chú | - |
| baCode | String | Mã BA | - |
| customerCode | String | Mã KH | FK |
| lastBillPrice | BigDecimal | Số dư kỳ trước | - |
| depositPrice | BigDecimal | Tiền đã thu | - |
| adjPrice | BigDecimal | Điều chỉnh | - |
| covPrice | BigDecimal | Chuyển khoản | - |
| salesPrice | BigDecimal | Doanh thu | - |
| ctaxPrice | BigDecimal | Thuế | - |
| rguPrice | BigDecimal | RGU | - |
| dctPrice | BigDecimal | Chiết khấu | - |
| etcPrice | BigDecimal | Khác | - |
| thisBillPrice | BigDecimal | Tổng cộng | - |
| slipNum | Short | Số phiếu | - |
| codLastBillPrice ~ codThisBillPrice | BigDecimal | Các trường COD | - |
| codSlipNum | Short | Số phiếu COD | - |
| userId | String | Người tạo | - |

---

### 2.4. DepositSlip (入金伝票)

**Table:** `DEPOSIT_SLIP_TRN` | **Entity:** `DepositSlip.java` | **File:** `@/workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/DepositSlip.java:1-223`

**Constants:**
- `STATUS_INIT = "0"` | `STATUS_CLOSE = "9"`

| Field | Type | Mô tả |
|-------|------|-------|
| depositSlipId | Integer | ID phiếu thu | PK |
| status | String | Trạng thái |
| depositDate | Date | Ngày thu |
| inputPdate | Date | Ngày nhập |
| depositAnnual/Monthly | Short | Năm/Tháng |
| depositYm | Integer | YYYYMM |
| userId/Name | String | Người tạo |
| depositAbstract | String | Tóm tắt |
| remarks | String | Ghi chú |
| customerCode/Name | String | Khách hàng |
| cutoffGroup | String | Nhóm chốt |
| paybackCycleCategory | String | Chu kỳ thanh toán |
| baCode/baName | String | Mã/Tên BA |

---

### 2.5. Other Transaction Entities

| Entity | Table | Mô tả |
|--------|-------|-------|
| DepositLine | `DEPOSIT_LINE_TRN` | Chi tiết thu tiền |
| RoSlipTrn | `RO_SLIP_TRN` | Đơn đặt hàng |
| RoLineTrn | `RO_LINE_TRN` | Chi tiết đơn đặt hàng |
| EadSlipTrn | `EAD_SLIP_TRN` | Phiếu nhập/xuất kho |
| EadLineTrn | `EAD_LINE_TRN` | Chi tiết nhập/xuất kho |
| BillLine | `BILL_LINE_TRN` | Chi tiết hóa đơn |
| EstimateSlip | `ESTIMATE_SLIP_TRN` | Phiếu báo giá |
| PurchaseSlip | `PURCHASE_SLIP_TRN` | Phiếu mua hàng |

---

## 3. HISTORY Entities (Lịch sử)

| Entity | Table | Mô tả |
|--------|-------|-------|
| CustomerHist | `CUSTOMER_MST_HIST` | Lịch sử KH |
| SalesSlipTrnHist | `SALES_SLIP_TRN_HIST` | Lịch sử bán hàng |
| DepositSlipHist | `DEPOSIT_SLIP_TRN_HIST` | Lịch sử thu tiền |
| DepositLineHist | `DEPOSIT_LINE_TRN_HIST` | Lịch sử chi tiết thu |

---

## 4. Entity Relationship

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   Customer  │◄──────│   SalesSlipTrn  │──────►│ SalesLineTrn│
│  (得意先)   │       │   (売上伝票)     │       │ (売上明細)  │
└─────────────┘       └────────┬────────┘       └──────┬──────┘
        │                        │                       │
        │                        ▼                       ▼
        │                 ┌─────────────┐         ┌─────────────┐
        │                 │    Bill     │         │   Product   │
        │                 │   (請求書)   │         │  (商品)     │
        │                 └──────┬──────┘         └─────────────┘
        │                        │
        ▼                        ▼
┌─────────────┐       ┌─────────────────┐
│ DepositSlip │◄──────│   DepositLine   │
│  (入金伝票)  │       │   (入金明細)    │
└─────────────┘       └─────────────────┘
```

---

## 5. Priority Tables for Migration

### Priority 1 - Core Business (Quan trọng nhất)
| # | Table | Entity | Description |
|---|-------|--------|-------------|
| 1 | `CUSTOMER_MST` | Customer | Khách hàng |
| 2 | `PRODUCT_MST` | Product | Sản phẩm |
| 3 | `SALES_SLIP_TRN` | SalesSlipTrn | Phiếu bán hàng |
| 4 | `SALES_LINE_TRN` | SalesLineTrn | Chi tiết bán hàng |
| 5 | `BILL_TRN` | Bill | Hóa đơn |
| 6 | `DEPOSIT_SLIP_TRN` | DepositSlip | Phiếu thu tiền |
| 7 | `DEPOSIT_LINE_TRN` | DepositLine | Chi tiết thu tiền |

### Priority 2 - Supporting (Hỗ trợ)
| # | Table | Description |
|---|-------|-------------|
| 8 | `USER_MST` | Người dùng |
| 9 | `CATEGORY_MST` | Phân loại |
| 10 | `TAX_RATE_MST` | Thuế suất |
| 11 | `RACK_MST` | Kệ hàng |
| 12 | `BANK_MST` | Ngân hàng |
| 13 | `SUPPLIER_MST` | Nhà cung cấp |

### Priority 3 - History (Lịch sử)
| # | Table | Description |
|---|-------|-------------|
| 14 | `*_HIST` | Các bảng lịch sử |

---

*Generated from SalesCube source analysis*
