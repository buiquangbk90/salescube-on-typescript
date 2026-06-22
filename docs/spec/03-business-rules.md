# SalesCube - Business Rules (Luật nghiệp vụ)
> Các luật nghiệp vụ được trích xuất từ `Constants.java` và `CategoryTrns.java` và entity constants.

---
## 1. Trạng thái (Status) 
| Nhóm | Code | Ý nghĩa | Nguồn |
|------|------|---------|-------|
| SalesSlipTrn | `STATUS_INIT="0"` | 未請求 (Chưa lập hóa đơn) | `SalesSlipTrn` |
| SalesSlipTrn | `STATUS_FINISH="9"` | 請求完了 (Đã lập HĐ) | `SalesSlipTrn` |
| SalesLineTrn | `STATUS_INIT="0"` | 未請求 | `SalesLineTrn` |
| SalesLineTrn | `STATUS_FINISH="9"` | 請求完了 | `SalesLineTrn` |
| Bill | `STATUS_INIT="0"` | 請求完了 (Đã lập HĐ) | `Bill` |
| DepositSlip | `STATUS_INIT="0"` | 入金 (Đã thu) | `DepositSlip` |
| DepositSlip | `STATUS_CLOSE="9"` | 入金締終了 (Chốt thu) | `DepositSlip` |
| DepositLine | `STATUS_INIT="0"` | 入金 | `DepositLine` |
| DepositLine | `STATUS_CLOSE="9"` | 入金締終了 | `DepositLine` |
| ROrder slip | `RECEIVED="0"` | 受注 | `Constants.STATUS_RORDER_SLIP` |
| ROrder slip | `SALES_NOW="1"` | 売上中 | `Constants.STATUS_RORDER_SLIP` |
| ROrder slip | `SALES_FINISH="9"` | 売上完了 | `Constants.STATUS_RORDER_SLIP` |
| POrder slip | `ORDERED="0"` | 発注 | `Constants.STATUS_PORDER_SLIP` |
| POrder slip | `PURCHASED="9"` | 仕入完了 | `Constants.STATUS_PORDER_SLIP` |

## 2. Thuế và phân loại thuế (Tax)
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `TAX_CATEGORY_IMPOSITION="0"` | 課税 | Chịu thuế (10%) |
| `TAX_CATEGORY_IMPOSITION_OLD="1"` | 課税（旧） | Thuế cũ (8%) |
| `TAX_CATEGORY_NO="2"` | 非課税 | Không chịu thuế |
| `TAX_CATEGORY_OFF="3"` | 対象外 | Không áp dụng |
| `TAX_CATEGORY_INCLUDED="4"` | 内税 | Giá đã gồm thuế |
| `TAX_CATEGORY_FREE="5"` | 免税 | Miễn thuế |
| `TAX_TYPE_CTAX="1"` | 消費税 | Thuế tiêu dùng |

### 2.1. Cách tính thuế (Tax Shift)
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `TAX_SHIFT_CATEGORY_SLIP_TOTAL="1"` | 外税伝票計 | Thuế ngoại giá - tính theo phiếu |
| `TAX_SHIFT_CATEGORY_INCLUDE_CTAX="3"` | 内税 | Thuế nội giá |
| `TAX_SHIFT_CATEGORY_CLOSE_THE_BOOKS="0"` | 外税締単位 | Thuế ngoại giá - theo kỳ chốt |

### 2.2. Làm tròn tiền/thuế (Fraction)
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `FLACT_CATEGORY_DOWN="0"` | 切捨て | Làm tròn xuống |
| `FLACT_CATEGORY_HALF_UP="1"` | 四捨五入 | Làm tròn gần nhất |
| `FLACT_CATEGORY_UP="2"` | 切り上げ | Làm tròn lên |

## 3. Chốt kỳ (Cutoff)
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `CUTOFF_GROUP_10_NEXT10="101"` | 10日締め翌月10日 | Chốt ngày 10, thanh toán ngày 10 tháng sau |
| `CUTOFF_GROUP_20_NEXT20="201"` | 20日締め翌月20日 | Chốt ngày 20, thanh toán ngày 20 tháng sau |
| `CUTOFF_GROUP_25_NEXTEND="251"` | 25日締め翌月末 | Chốt ngày 25, thanh toán cuối tháng sau |
| `CUTOFF_GROUP_END_NEXTEND="311"` | 月末締め翌月末 | Chốt cuối tháng, thanh toán cuối tháng sau |
| `CUTOFF_GROUP_END_NN05="312"` | 月末締め翌々月5日 | Chốt cuối tháng, thanh toán ngày 5 tháng sau nữa |
| `CUTOFF_GROUP_OTHER="999"` | その他 | Khác |

### 3.1. Chu kỳ thanh toán (Payback Cycle)
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `PAYBACK_CYCLE_CATEGORY_0="0"` | 当月 | Thanh toán trong tháng |
| `PAYBACK_CYCLE_CATEGORY_1="1"` | 翌月 | Thanh toán tháng sau |
| `PAYBACK_CYCLE_CATEGORY_2="2"` | 翌々月 | Thanh toán tháng sau nữa |
| `PAYBACK_CYCLE_CATEGORY_ETC="9"` | その他 | Khác |

## 4. Phân loại hàng hóa & kho
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `PRODUCT_STOCK_CTL_NO="0"` | 在庫管理しない | Không quản lý tồn |
| `PRODUCT_STOCK_CTL_YES="1"` | 在庫管理する | Có quản lý tồn |
| `EAD_CATEGORY_ENTER="1"` | 入庫 | Nhập kho |
| `EAD_CATEGORY_DISPATCH="2"` | 出庫 | Xuất kho |
| `DELIVERY_PROCESS_CATEGORY_NONE="0"` | 未納 | Chưa giao |
| `DELIVERY_PROCESS_CATEGORY_PARTIAL="1"` | 分納中 | Đang giao dở |
| `DELIVERY_PROCESS_CATEGORY_FULL="2"` | 完納 | Đã giao đủ |
| `PRODUCT_STATUS_ONSALE="1"` | 販売中 | Đang bán |
| `PRODUCT_STATUS_SALE_CANCEL="2"` | 販売中止 | Ngừng bán |

## 5. Hình thức giao dịch
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `SALES_CM_CREDIT="0"` | 掛売 | Bán chịu |
| `SALES_CM_CASH="1"` | 現金 | Tiền mặt |
| `SALES_CM_SAMPLE="2"` | サンプル | Mẫu |
| `SALES_CM_CASH_ON_DELIVERY="3"` | 代引き | COD |
| `SALES_CM_CREDIT_CARD="4"` | クレジット | Thẻ tín dụng |
| `SALES_CM_PAY_FIRST="5"` | 先入金 | Thu trước |
| `SALES_CM_ONLINE="6"` | Online | Online |

## 6. Phương thức thu/chi tiền
| Mã | Ý nghĩa | Tiếng Việt |
|----|---------|------------|
| `DEPOSIT_CATEGORY_CASH="01"` | 現金 | Tiền mặt |
| `DEPOSIT_CATEGORY_TRANSFER="03"` | 振込 | Chuyển khoản |
| `DEPOSIT_CATEGORY_CASH_ON_DELIVERY="10"` | 代引き | COD |
| `DEPOSIT_CATEGORY_CREDIT_CARD="11"` | クレジット | Thẻ tín dụng |
| `DEPOSIT_CATEGORY_PAY_FIRST="12"` | 先入金 | Thu trước |
| `PAYBACK_TYPE_CASH="1"` | 現金 | Thu tiền mặt |
| `PAYBACK_TYPE_CHECK="2"` | 小切手 | Séc |
| `PAYBACK_TYPE_BANK="3"` | 振込 | Chuyển khoản |
| `PAYBACK_TYPE_NOTE="4"` | 手形 | Lệnh phiếu |
| `PAYBACK_TYPE_OTHER="5"` | その他 | Khác |

## 7. Cấu trúc tính toán
### 7.1. Hóa đơn (Bill)
```
thisBillPrice = lastBillPrice + salesPrice + ctaxPrice - depositPrice + adjPrice + covPrice + etcPrice - dctPrice - rguPrice
```
### 7.2. Dòng bán hàng (SalesLine)
```
retailPrice = quantity * unitPrice
gm = retailPrice - cost
ctaxPrice = retailPrice * ctaxRate (tùy cách tính thuế)
```

---
*Generated from SalesCube source analysis*
