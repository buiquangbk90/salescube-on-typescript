# SalesCube - Hệ thống Quản lý Bán hàng (販売管理システム)

> **Mục tiêu hệ thống:** Quản lý bán hàng tích hợp (All-in-one) cho doanh nghiệp Nhật Bản – hàng hóa vật lý (sách/ấn phẩm).  
> **Stack legacy:** Java EE + Apache Struts 1.2 + Seasar2 DI + S2JDBC + MySQL 5.x  
> **Migration target:** TypeScript (Node.js + Prisma + Next.js)

---

## 1. Tổng quan Nghiệp vụ

SalesCube quản lý vòng đời bán hàng đầy đủ cho hàng hóa vật lý:

| Module | Quy trình |
|--------|-----------|
| **Bán hàng (販売)** | Báo giá → Đặt hàng → Phiếu bán → Xuất kho → Hóa đơn → Thu tiền |
| **Mua hàng (購買)** | Đặt hàng NCC → Nhập hàng → Thanh toán NCC |
| **Kho (在庫)** | Nhập/Xuất tự động qua EAD, Safety Stock, Điều chỉnh tồn kho |
| **Tài chính (財務)** | Chốt hóa đơn, Đối soát AR/AP, Số dư tháng |

---

## 2. Các Module Nghiệp vụ Chính

### 2.1. Master Data (マスタ管理)

**Master Khách hàng (得意先マスタ)**
- Tìm kiếm theo mã, tên, điện thoại
- ZIP lookup: Nhập mã bưu điện → tự điền địa chỉ (Japan Post ZIP_MST)
- Lịch sử thay đổi qua `CUSTOMER_MST_HIST`
- Rank KH: Tự động cập nhật hàng tháng qua batch `SP_UPDATE_CUSTOMER_RANK`
- Soft-delete: `DEL_DATETM` (không xóa vật lý)

**Master Sản phẩm (商品マスタ)**
- Mã sản phẩm, JAN code (mã vạch), mã EC (`ONLINE_PCODE`)
- Trọng lượng, kích thước (FLOAT – phục vụ logistics)
- Thuế suất liên kết qua `TAX_RATE_MST`
- Cập nhật `PRODUCT_STATUS_CATEGORY`, `MINE_SAFETY_STOCK`, `AVG_SHIP_COUNT` bằng batch

**Master Nhà cung cấp (仕入先マスタ)**
- Thông tin NCC + tài khoản ngân hàng NCC

**Master Người dùng (社員マスタ)**
- Xác thực nội bộ: AES-128 ECB (key hard-coded `jp.co.arkinfosys`)
- SSO đơn giản qua URL param (không có AD/LDAP)
- Phân quyền menu: `GRANT_ROLE` (USER_ID × MENU_ID)

### 2.2. Quy trình Bán hàng (Order-to-Cash)

```
ESTIMATE_SHEET → RO_SLIP (受注) → SALES_SLIP (売上) → EAD_SLIP (出庫)
                                                    ↓
                                              BILL_TRN (請求締め)
                                                    ↓
                                          DEPOSIT_SLIP (入金) → ART_BALANCE
```

- **Báo giá** (`ESTIMATE_SHEET_TRN`): Tùy chọn, copy sang RO
- **Đặt hàng** (`RO_SLIP_TRN`): Tạo thủ công hoặc import CSV từ EC platform
- **Phiếu bán** (`SALES_SLIP_TRN`): Copy từ RO, snapshot 40+ columns KH/giao hàng
- **Xuất kho** (`EAD_SLIP_TRN`): Tự động khi lưu phiếu bán
- **Chốt hóa đơn** (`BILL_TRN`): Chạy thủ công từ màn hình `CloseBillAction`
- **Thu tiền** (`DEPOSIT_SLIP_TRN`): Nhập tay hoặc import CSV ngân hàng/shipper COD

### 2.3. Quy trình Mua hàng (Procure-to-Pay)

```
PO_SLIP (発注) → SUPPLIER_SLIP (仕入) → EAD_SLIP (入庫)
                                      ↓
                               PAYMENT_SLIP (支払締め) → APT_BALANCE
```

### 2.4. Quản lý Kho (在庫管理)

- Tồn kho theo dõi qua `PRODUCT_STOCK_TRN` (ANNUAL × MONTHLY)
- Mọi nhập/xuất đều ghi vào `EAD_SLIP_TRN` (append-only ledger)
- Điều chỉnh tồn kho thủ công qua màn hình stock
- Safety Stock tính tự động: `MINE_SAFETY_STOCK = AVG_SHIP_COUNT × LEAD_TIME × SAFETY_COEFFICIENT`
- Danh sách đề xuất đặt hàng (`OutputRecommendListAction`)

### 2.5. Phân quyền (権限管理)

| Đối tượng | Mô tả |
|-----------|-------|
| `USER_MST` | Thông tin user, password (AES), fail count, lock |
| `MENU_MST` | Danh sách menu trong hệ thống |
| `GRANT_ROLE` | USER_ID × MENU_ID → isUpdate, isValid |
| `MINE_MST` | Policy: độ dài password, số lần fail tối đa, ngày hết hạn |

Kiểm tra quyền tại mỗi Action:
```java
userDto.isMenuUpdate(Constants.MENU_ID.INPUT_SALES)
userDto.isMenuValid(Constants.MENU_ID.INPUT_SALES)
```

### 2.6. Báo cáo & Xuất file (帳票)

- **PDF**: JasperReports – in hóa đơn, phiếu đặt hàng, sổ bán hàng
- **CSV**: Xuất vận đơn shipper (`INVOICE_DATA_WORK`), export search results
- **Import**: EC order CSV → `ONLINE_ORDER_WORK`, bank CSV → `BANK_DEPOSIT_WORK`, COD CSV → `DELIVERY_DEPOSIT_WORK`

---

## 3. Luồng Nghiệp vụ Tích hợp

```
Estimate ──→ RO_SLIP ──────────────────────────────→ SALES_SLIP
(báo giá)   (受注)    EC CSV Import                  (売上伝票)
                      ↑                                   │
              ONLINE_ORDER_WORK                     EAD_SLIP (出庫)
                                                    PRODUCT_STOCK_TRN ↓

BILL_TRN ←── (CloseBillAction) ←── SALES_SLIP (STATUS=2)
(請求締め)                                │
    │                                     └── ART_BALANCE_TRN
    ↓
DEPOSIT_SLIP ←── import bank CSV / shipper COD CSV
(入金伝票)        BANK_DEPOSIT_WORK / DELIVERY_DEPOSIT_WORK

PO_SLIP ──→ SUPPLIER_SLIP ──→ EAD_SLIP (入庫) ──→ PRODUCT_STOCK_TRN ↑
(発注)       (仕入)
    └──────────────────────→ PAYMENT_SLIP (ClosePaymentAction)
                               (支払締め) → APT_BALANCE_TRN
```

---

## 4. Kiến trúc Kỹ thuật (Legacy)

| Thành phần | Công nghệ |
|-----------|-----------|
| Web framework | Apache Struts 1.2 + SAStruts (Seasar2) |
| DI container | Seasar2 (S2Container) |
| ORM | S2JDBC (Named SQL files – 581 files trong `entity/sql/`) |
| DB | MySQL 5.x, InnoDB, không có FK constraints |
| Template | JSP + JSTL |
| Report | JasperReports (`.jrxml`) |
| Multi-tenant | Table suffix `_XXXXX` replaced by `sed` in shell scripts |
| Sequence | `SEQ_MAKER` table (thay thế AUTO_INCREMENT) |
| Audit trail | `*_HIST` tables – ghi snapshot sau mỗi thay đổi |
| Soft-delete | `DEL_DATETM IS NULL` pattern |
| Batch | Shell scripts → MySQL Stored Procedures |

---

## 5. Tích hợp Thực tế (Đã xác nhận từ source code)

| Tích hợp | Mô tả | Evidence |
|----------|-------|---------|
| **Japan Post ZIP** | Lookup địa chỉ từ mã bưu điện | `ZIP_MST` table, AJAX call |
| **EC Platform (Amazon/Rakuten)** | Import CSV đơn hàng online | `ImportOnlineOrderAction`, `ONLINE_ORDER_WORK` |
| **Ngân hàng (bank statement)** | Import CSV sao kê | `ImportBankDepositAction`, `BANK_DEPOSIT_WORK` |
| **Shipper (Yamato/Sagawa)** | Import CSV COD + xuất CSV vận đơn | `ImportDeliveryDepositAction`, `INVOICE_DATA_WORK` |
| **SSO qua URL param** | External system pass userId+password qua GET/POST | `LoginAction` |

---

## 6. Các Điểm Rủi ro Quan trọng (Migration)

- **Zero FK constraints**: Toàn bộ referential integrity ở application layer
- **SEQ_MAKER**: Custom sequence – cần replace bằng AUTO_INCREMENT hoặc UUID
- **AES key hard-coded**: `"jp.co.arkinfosys"` trong `EncryptUtil.java`
- **Closing operations trong HTTP request**: Không có distributed transaction
- **Multi-tenant bằng table suffix**: Không phải row-level isolation
- **581 named SQL files**: Mọi query đều là raw SQL – cần migrate sang Prisma

---

*Dựa trên phân tích source code thực tế: `CREATE.sql`, Java entity/action/service classes, batch scripts*
