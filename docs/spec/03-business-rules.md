# SalesCube - Business Rules (Luật nghiệp vụ)

> Tài liệu này ghi lại các luật nghiệp vụ quan trọng từ source code SalesCube.
> 
> **Lưu ý:** Các luật này PHẢI được verify kỹ khi migrate sang TypeScript.

---

## 1. Thuế (Tax) - 消費税

### 1.1. Thuế suất

| Loại hàng | Thuế suất | Tiếng Nhật |
|-----------|-----------|------------|
| Báo chí (News) | 8% | 新聞 |
| Sách (Books) | 10% | 書籍 |
| Quảng cáo (Web) | 10% | ウェブ広告 |
| Hàng hóa thông thường | 10% | 一般商品 |

**Source:** `TaxRate.java`, `Product.java` (taxCategory field)

### 1.2. Cách tính thuế (Tax Shift Category)

| Mã | Cách tính | Mô tả |
|----|-----------|-------|
| 内税 (Uchizei) | Tax included | Giá đã bao gồm thuế |
| 外税 (Sotozei) | Tax excluded | Giá chưa bao gồm thuế, tính thêm |

**Source:** `Customer.java` (taxShiftCategory), `SalesSlipTrn.java` (taxShiftCategory)

### 1.3. Làm tròn thuế (Tax Fraction)

| Mã | Cách làm tròn |
|----|---------------|
| 0 | Làm tròn xuống (切り捨て) |
| 1 | Làm tròn lên (切り上げ) |
| 2 | Làm tròn gần nhất (四捨五入) |

**Source:** `Customer.java` (taxFractCategory)

---

## 2. Chốt kỳ (Closing) - 締処理

### 2.1. Ngày chốt (Cutoff Day)

| Mã | Ý nghĩa |
|----|---------|
| 末日 | Ngày cuối tháng |
| 10 | Ngày 10 hàng tháng |
| 15 | Ngày 15 hàng tháng |
| 20 | Ngày 20 hàng tháng |
| 25 | Ngày 25 hàng tháng |

**Source:** `Customer.java` (lastCutoffDate, cutoffGroup)

### 2.2. Chu kỳ thanh toán (Payback Cycle)

| Mã | Ý nghĩa |
|----|---------|
| 当月 | Thanh toán trong tháng |
| 翌月 | Thanh toán tháng sau |
| 翌々月 | Thanh toán tháng sau nữa |
| 3ヶ月 | 3 tháng sau |

**Source:** `Customer.java` (paybackCycleCategory)

### 2.3. Quy trình chốt tháng

```
1. Kiểm tra dữ liệu ngày (Daily Check)
2. Chốt doanh thu ngày (Sales Daily Closing)
3. Tạo hóa đơn hàng loạt (Bill Make)
4. Chốt tháng (Monthly Closing)
5. Khóa sổ (Lock Period)
```

**Source:** `monthly/` package, `DailyClosingAction`, `MonthlyClosingAction`

---

## 3. Hóa đơn (Bill) - 請求書

### 3.1. Cấu trúc hóa đơn

```
Số dư kỳ trước (lastBillPrice)
+ Doanh thu tháng này (salesPrice)
+ Thuế (ctaxPrice)
- Tiền đã thu (depositPrice)
+ Điều chỉnh (adjPrice)
= Tổng phải thu (thisBillPrice)
```

**Source:** `Bill.java`

### 3.2. Trạng thái hóa đơn

| Mã | Trạng thái |
|----|------------|
| 0 | Khởi tạo (Init) |
| 9 | Đã chốt (Close) |

**Source:** `Bill.java` (STATUS_INIT)

### 3.3. Loại hóa đơn

| Mã | Loại | Tiếng Nhật |
|----|------|------------|
| 0 | Bán hàng | 売上 |
| 1 | Báo chí | 新聞 |
| 2 | Web | ウェブ |

**Source:** `Bill.java` (TYPE_SALES, TYPE_NEWS, TYPE_WEB)

---

## 4. Bán hàng (Sales) - 売上

### 4.1. Loại phiếu bán hàng

| Mã | Loại | Mô tả |
|----|------|-------|
| 0 | Bán hàng thông thường | Sales |
| 1 | Báo chí | News |
| 2 | Web/Quảng cáo | Web |

**Source:** `SalesSlipTrn.java` (TYPE_SALES, TYPE_NEWS, TYPE_WEB)

### 4.2. Trạng thái phiếu bán

| Mã | Trạng thái |
|----|------------|
| 0 | Khởi tạo (Init) |
| 9 | Hoàn thành (Finish) |

**Source:** `SalesSlipTrn.java` (STATUS_INIT, STATUS_FINISH)

### 4.3. Tính tiền trong SalesLine

```
quantity × unitPrice = retailPrice
retailPrice × ctaxRate = ctaxPrice
retailPrice - cost = gm (Gross Margin)
```

**Source:** `SalesLineTrn.java`

### 4.4. Giá bán lẻ (Retail Price)

Có 3 mức giá bán lẻ với thời hạn khác nhau:
- unitRetailPrice (Thời hạn: unitRetailPriceStartDate ~ unitRetailPriceEndDate)
- unitRetailPrice2 (Thời hạn 2)
- unitRetailPrice3 (Thời hạn 3)

**Source:** `Product.java`, `SalesLineTrn.java`

---

## 5. Thu tiền (Deposit) - 入金

### 5.1. Phương thức thu tiền

| Mã | Phương thức | Tiếng Nhật |
|----|-------------|------------|
| 1 | Tiền mặt | 現金 |
| 2 | Chuyển khoản | 振込 |
| 3 | Séc | 小切手 |
| 4 | Lệnh chi trả | 振替 |
| 5 | Thẻ tín dụng | カード |

**Source:** `deposit/` package

### 5.2. Trạng thái phiếu thu

| Mã | Trạng thái |
|----|------------|
| 0 | Khởi tạo (Init) |
| 9 | Đã chốt (Close) |

**Source:** `DepositSlip.java` (STATUS_INIT, STATUS_CLOSE)

### 5.3. Gạch nợ (消込 - Keshikomi)

Khi thu tiền, phải gạch nợ với hóa đơn tương ứng:

```
1. Tìm hóa đơn chưa thanh toán của khách hàng
2. Liên kết phiếu thu với hóa đơn
3. Cập nhật số dư công nợ
```

**Source:** `DepositCloseAction`, `BillCloseAction`

---

## 6. Tồn kho (Stock) - 在庫

### 6.1. Kiểm soát tồn kho

| Mã | Kiểm soát | Mô tả |
|----|-----------|-------|
| 0 | Không kiểm soát | - |
| 1 | Kiểm soát | Có quản lý tồn |
| 2 | Kiểm soát nghiêm ngặt | Bắt buộc có tồn mới bán |

**Source:** `Product.java` (stockCtlCategory)

### 6.2. Công thức tồn kho

```
Tồn đầu kỳ
+ Nhập kho (Purchase)
- Xuất kho (Sales)
= Tồn cuối kỳ
```

**Source:** `EadSlipTrn.java` (EAD = 入出庫 = Nhập/Xuất kho)

### 6.3. Tồn kho an toàn

- `mineSafetyStock`: Tồn kho an toàn tối thiểu
- `maxStockNum`: Tồn kho tối đa cho phép

**Source:** `Product.java`

---

## 7. Người dùng & Phân quyền (User & RBAC)

### 7.1. Các vai trò chính

| Role | Quyền hạn |
|------|-----------|
| Admin | Toàn quyền |
| Sales | Tạo đơn, xem KH của mình |
| Manager | Duyệt đơn, xem báo cáo |
| Accounting | Quản lý thu tiền, hóa đơn |
| Warehouse | Quản lý kho |

**Source:** `setting/` package, `EditRoleAction`

---

## 8. Xử lý ngày/tháng (Daily/Monthly Processing)

### 8.1. Daily Closing (日次締め処理)

```
1. Kiểm tra dữ liệu ngày có đầy đủ
2. Tính tổng doanh thu ngày
3. Tính tổng thu tiền ngày
4. Cập nhật sổ sách
5. In báo cáo ngày
```

**Source:** `daily/DailyClosingAction.java`

### 8.2. Monthly Closing (月次締め処理)

```
1. Kiểm tra ngày chốt của từng nhóm KH
2. Tạo hóa đơn hàng loạt
3. Tính tổng doanh thu tháng
4. Tính tổng thu tiền tháng
5. Chốt sổ kế toán
6. Khóa không cho sửa dữ liệu cũ
```

**Source:** `monthly/MonthlyClosingAction.java`

---

## 9. Validation Rules

### 9.1. Customer Validation

- `customerCode`: Required, Unique
- `customerName`: Required
- `customerKana`: Required (cho tìm kiếm)
- `taxShiftCategory`: Required
- `cutoffGroup`: Required nếu có chốt kỳ

### 9.2. Product Validation

- `productCode`: Required, Unique
- `productName`: Required
- `taxCategory`: Required
- `unitCategory`: Required

### 9.3. Sales Validation

- `customerCode`: Required, must exist
- `productCode`: Required, must exist
- `quantity`: > 0
- `unitPrice`: >= 0
- Kiểm tra tồn kho nếu `stockCtlCategory = 2`

### 9.4. Deposit Validation

- `customerCode`: Required
- `depositDate`: Required
- Số tiền thu > 0

---

## 10. Business Logic cần Test kỹ

### 10.1. Cần viết Characterization Test

| # | Logic | Importance |
|---|-------|------------|
| 1 | Tính thuế (8% vs 10%) | **CRITICAL** |
| 2 | Làm tròn tiền/thuế | **CRITICAL** |
| 3 | Chốt kỳ (締処理) | **CRITICAL** |
| 4 | Tạo hóa đơn tự động | **CRITICAL** |
| 5 | Gạch nợ (消込) | **CRITICAL** |
| 6 | Tính GM (Gross Margin) | HIGH |
| 7 | Cập nhật tồn kho | HIGH |
| 8 | Tính số dư công nợ | HIGH |

### 10.2. Test Case Examples

**Test Case 1: Tính thuế**
```
Input: quantity=10, unitPrice=1000, taxRate=0.10
Expected: 
  - retailPrice = 10,000
  - ctaxPrice = 1,000 (外税) or 909 (内税)
  - total = 11,000 (外税) or 10,000 (内税)
```

**Test Case 2: Chốt kỳ**
```
Input: customer có cutoffDay = "末日"
Expected: bill period = 2026-06-01 ~ 2026-06-30
```

**Test Case 3: Gạch nợ**
```
Input: billPrice = 10,000, deposit = 6,000
Expected: remaining = 4,000
```

---

## 11. Mapping JP → VN

| Tiếng Nhật | Tiếng Việt | Entity/Field |
|------------|------------|--------------|
| 売上 | Bán hàng/Doanh thu | SalesSlipTrn |
| 売上伝票 | Phiếu bán hàng | SalesSlipTrn |
| 売上明細 | Chi tiết bán hàng | SalesLineTrn |
| 請求書 | Hóa đơn | Bill |
| 入金 | Thu tiền | DepositSlip |
| 入金明細 | Chi tiết thu tiền | DepositLine |
| 得意先 | Khách hàng | Customer |
| 商品 | Sản phẩm | Product |
| 在庫 | Tồn kho | Stock/Ead |
| 仕入 | Mua hàng | Purchase |
| 締め処理 | Chốt kỳ | Closing |
| 消込 | Gạch nợ | Payment allocation |
| 売掛金 | Công nợ phải thu | Receivable |
| 消費税 | Thuế tiêu dùng | Tax |
| 内税 | Giá đã gồm thuế | Tax included |
| 外税 | Giá chưa gồm thuế | Tax excluded |
| 締日 | Ngày chốt | Cutoff day |
| 支払サイクル | Chu kỳ thanh toán | Payback cycle |
| 担当者 | Người phụ trách | User (tanCd) |

---

*Generated from SalesCube source analysis*
