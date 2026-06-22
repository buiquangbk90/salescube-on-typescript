# SalesCube - Entity List (Danh sách Entity/Table)
> Tài liệu này liệt kê toàn bộ entity và bảng DB từ source code.
> **Source:** `/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/entity`
> **Lưu ý:** Bảng DB thực tế trong `CREATE.sql` có hậu tố `_XXXXX` (ví dụ `CUSTOMER_MST_XXXXX`) là placeholder cho instance/tenant. Entity Java tham chiếu bảng không có `_XXXXX`.

---
## 1. Tổng hợp Entity
- **Tổng số entity class:** 76
- **Tổng số bảng/view DB:** 129

## 2. Master Entities
| Entity | Table (entity) | SQL Table (with suffix) | Mô tả |
|--------|----------------|--------------------------|-------|
| `Bank` | `BANK_MST` | `BANK_MST_XXXXX` | - |
| `Category` | `CATEGORY_MST` | `CATEGORY_MST_XXXXX` | - |
| `Customer` | `CUSTOMER_MST` | `CUSTOMER_MST_XXXXX` | - |
| `CustomerRank` | `CUSTOMER_RANK_MST` | `CUSTOMER_RANK_MST_XXXXX` | - |
| `Delivery` | `DELIVERY_MST` | `DELIVERY_MST_XXXXX` | - |
| `Dept` | `DEPT_MST` | `DEPT_MST_XXXXX` | - |
| `DetailDispItem` | `-` | `-` | - |
| `Discount` | `DISCOUNT_MST` | `DISCOUNT_MST_XXXXX` | - |
| `Domain` | `DOMAIN_MST` | `DOMAIN_MST_XXXXX` | - |
| `FileInfo` | `FILE_INFO` | `FILE_INFO_XXXXX` | - |
| `GrantRole` | `GRANT_ROLE` | `GRANT_ROLE_XXXXX` | - |
| `InitMst` | `INIT_MST` | `INIT_MST_XXXXX` | - |
| `Menu` | `-` | `-` | - |
| `Mine` | `-` | `-` | - |
| `Product` | `PRODUCT_MST` | `PRODUCT_MST_XXXXX` | - |
| `ProductClass` | `PRODUCT_CLASS_MST` | `PRODUCT_CLASS_MST_XXXXX` | - |
| `ProductSet` | `PRODUCT_SET_MST` | `PRODUCT_SET_MST_XXXXX` | - |
| `Rack` | `RACK_MST` | `RACK_MST_XXXXX` | - |
| `Rate` | `RATE_MST` | `RATE_MST_XXXXX` | - |
| `ReportTemplate` | `-` | `-` | - |
| `Role` | `-` | `-` | - |
| `SeqMaker` | `-` | `-` | - |
| `Supplier` | `SUPPLIER_MST` | `SUPPLIER_MST_XXXXX` | - |
| `TaxRate` | `TAX_RATE_MST` | `TAX_RATE_MST_XXXXX` | - |
| `User` | `USER_MST` | `USER_MST_XXXXX` | - |
| `Warehouse` | `WAREHOUSE_MST` | `WAREHOUSE_MST_XXXXX` | - |
| `Zip` | `-` | `-` | - |

## 3. Transaction Entities
| Entity | Table (entity) | SQL Table (with suffix) | Mô tả |
|--------|----------------|--------------------------|-------|
| `AptBalanceTrn` | `APT_BALANCE_TRN` | `APT_BALANCE_TRN_XXXXX` | - |
| `ArtBalance` | `ART_BALANCE_TRN` | `ART_BALANCE_TRN_XXXXX` | - |
| `BankDepositRel` | `BANK_DEPOSIT_REL` | `BANK_DEPOSIT_REL_XXXXX` | - |
| `BankDepositWork` | `-` | `-` | - |
| `Bill` | `BILL_TRN` | `BILL_TRN_XXXXX` | - |
| `CategoryTrn` | `CATEGORY_TRN` | `CATEGORY_TRN_XXXXX` | - |
| `Delivery` | `DELIVERY_MST` | `DELIVERY_MST_XXXXX` | - |
| `DeliveryDepositRel` | `DELIVERY_DEPOSIT_REL` | `DELIVERY_DEPOSIT_REL_XXXXX` | - |
| `DeliveryDepositWork` | `-` | `-` | - |
| `DepositLine` | `DEPOSIT_LINE_TRN` | `DEPOSIT_LINE_TRN_XXXXX` | - |
| `DepositSlip` | `DEPOSIT_SLIP_TRN` | `DEPOSIT_SLIP_TRN_XXXXX` | - |
| `DiscountTrn` | `DISCOUNT_TRN` | `DISCOUNT_TRN_XXXXX` | - |
| `EadLineTrn` | `EAD_LINE_TRN` | `EAD_LINE_TRN_XXXXX` | - |
| `EadSlipTrn` | `EAD_SLIP_TRN` | `EAD_SLIP_TRN_XXXXX` | - |
| `EntrustEadLineTrn` | `ENTRUST_EAD_LINE_TRN` | `ENTRUST_EAD_LINE_TRN_XXXXX` | - |
| `EntrustEadSlipTrn` | `ENTRUST_EAD_SLIP_TRN` | `ENTRUST_EAD_SLIP_TRN_XXXXX` | - |
| `EstimateLineTrn` | `ESTIMATE_LINE_TRN` | `-` | - |
| `EstimateSheetTrn` | `ESTIMATE_SHEET_TRN` | `-` | - |
| `InvoiceDataWork` | `-` | `-` | - |
| `OnlineOrderWork` | `-` | `-` | - |
| `PaymentLineTrn` | `PAYMENT_LINE_TRN` | `-` | - |
| `PaymentSlipTrn` | `PAYMENT_SLIP_TRN` | `PAYMENT_SLIP_TRN_XXXXX` | - |
| `PickingLine` | `PICKING_LINE_TRN` | `PICKING_LINE_TRN_XXXXX` | - |
| `PickingList` | `PICKING_LIST_TRN` | `PICKING_LIST_TRN_XXXXX` | - |
| `PoLineTrn` | `PO_LINE_TRN` | `PO_LINE_TRN_XXXXX` | - |
| `PoSlipTrn` | `PO_SLIP_TRN` | `PO_SLIP_TRN_XXXXX` | - |
| `ProductStockInfo` | `-` | `-` | - |
| `ProductStockTrn` | `PRODUCT_STOCK_TRN` | `PRODUCT_STOCK_TRN_XXXXX` | - |
| `RateTrn` | `RATE_TRN` | `RATE_TRN_XXXXX` | - |
| `RoLineTrn` | `RO_LINE_TRN` | `-` | - |
| `RoSlipTrn` | `RO_SLIP_TRN` | `-` | - |
| `SalesLineTrn` | `SALES_LINE_TRN` | `SALES_LINE_TRN_XXXXX` | - |
| `SalesSlipTrn` | `SALES_SLIP_TRN` | `SALES_SLIP_TRN_XXXXX` | - |
| `SupplierLineTrn` | `SUPPLIER_LINE_TRN` | `-` | - |
| `SupplierSlipTrn` | `SUPPLIER_SLIP_TRN` | `-` | - |

## 4. History/Work/Rel/Support Entities
| Entity | Table (entity) | SQL Table (with suffix) | Mô tả |
|--------|----------------|--------------------------|-------|
| `ArtBalance` | `ART_BALANCE_TRN` | `ART_BALANCE_TRN_XXXXX` | - |
| `BankDepositRel` | `BANK_DEPOSIT_REL` | `BANK_DEPOSIT_REL_XXXXX` | - |
| `BankDepositWork` | `-` | `-` | - |
| `CategoryTrn` | `CATEGORY_TRN` | `CATEGORY_TRN_XXXXX` | - |
| `CloseCustomer` | `-` | `-` | - |
| `CustomerAndDate` | `-` | `-` | - |
| `CustomerHist` | `CUSTOMER_MST_HIST` | `CUSTOMER_MST_HIST_XXXXX` | - |
| `CustomerRel` | `CUSTOMER_REL` | `CUSTOMER_REL_XXXXX` | - |
| `DeliveryBillHist` | `DELIVERY_MST_HIST` | `DELIVERY_MST_HIST_XXXXX` | - |
| `DeliveryDepositRel` | `DELIVERY_DEPOSIT_REL` | `DELIVERY_DEPOSIT_REL_XXXXX` | - |
| `DeliveryDepositWork` | `-` | `-` | - |
| `DeliveryHist` | `DELIVERY_MST_HIST` | `DELIVERY_MST_HIST_XXXXX` | - |
| `DepositLineHist` | `DEPOSIT_LINE_TRN_HIST` | `DEPOSIT_LINE_TRN_HIST_XXXXX` | - |
| `DepositSlipHist` | `DEPOSIT_SLIP_TRN_HIST` | `DEPOSIT_SLIP_TRN_HIST_XXXXX` | - |
| `DiscountRel` | `DISCOUNT_REL` | `DISCOUNT_REL_XXXXX` | - |
| `DiscountRelHist` | `DISCOUNT_REL_HIST` | `DISCOUNT_REL_HIST_XXXXX` | - |
| `DiscountTrn` | `DISCOUNT_TRN` | `DISCOUNT_TRN_XXXXX` | - |
| `InvoiceDataWork` | `-` | `-` | - |
| `OnlineOrderRel` | `ONLINE_ORDER_REL` | `ONLINE_ORDER_REL_XXXXX` | - |
| `OnlineOrderWork` | `-` | `-` | - |
| `ProductHist` | `PRODUCT_MST_HIST` | `PRODUCT_MST_HIST_XXXXX` | - |
| `Rate` | `RATE_MST` | `RATE_MST_XXXXX` | - |
| `RateTrn` | `RATE_TRN` | `RATE_TRN_XXXXX` | - |

## 5. Core Entity Fields (trích xuất từ source)

### 5.1. Customer (`CUSTOMER_MST`)
| Field | Type | Mô tả |
|-------|------|-------|
| `customerCode` | `String` | - |
| `customerName` | `String` | - |
| `customerKana` | `String` | - |
| `customerOfficeName` | `String` | - |
| `customerOfficeKana` | `String` | - |
| `customerAbbr` | `String` | - |
| `customerDeptName` | `String` | - |
| `customerZipCode` | `String` | - |
| `customerAddress1` | `String` | - |
| `customerAddress2` | `String` | - |
| `customerPcPost` | `String` | - |
| `customerPcName` | `String` | - |
| `customerPcKana` | `String` | - |
| `customerPcPreCategory` | `String` | - |
| `customerTel` | `String` | - |
| `customerFax` | `String` | - |
| `customerEmail` | `String` | - |
| `customerUrl` | `String` | - |
| `customerBusinessCategory` | `String` | - |
| `customerJobCategory` | `String` | - |
| `customerRoCategory` | `String` | - |
| `customerRankCategory` | `String` | - |
| `customerUpdFlag` | `String` | - |
| `salesCmCategory` | `String` | - |
| `taxShiftCategory` | `String` | - |
| `rate` | `BigDecimal` | - |
| `maxCreditLimit` | `BigDecimal` | - |
| `lastCutoffDate` | `Date` | - |
| `cutoffGroup` | `String` | - |
| `paybackTypeCategory` | `String` | - |
| `paybackCycleCategory` | `String` | - |
| `taxFractCategory` | `String` | - |
| `priceFractCategory` | `String` | - |
| `billPrintUnit` | `String` | - |
| `billDatePrint` | `String` | - |
| `tempDeliverySlipFlag` | `String` | - |
| `paymentName` | `String` | - |
| `remarks` | `String` | - |
| `firstSalesDate` | `Date` | - |
| `lastSalesDate` | `Date` | - |
| `salesPriceTotal` | `BigDecimal` | - |
| `salesPriceLsm` | `BigDecimal` | - |
| `commentData` | `String` | - |
| `customerPcPreCategoryName` | `String` | - |
| `categoryId4` | `Integer` | - |
| `lastSalesCutoffDate` | `Date` | - |

### 5.1. Product (`PRODUCT_MST`)
| Field | Type | Mô tả |
|-------|------|-------|
| `productCode` | `String` | - |
| `productName` | `String` | - |
| `productKana` | `String` | - |
| `onlinePcode` | `String` | - |
| `supplierPcode` | `String` | - |
| `supplierCode` | `String` | - |
| `rackCode` | `String` | - |
| `supplierPriceYen` | `BigDecimal` | - |
| `supplierPriceDol` | `BigDecimal` | - |
| `retailPrice` | `BigDecimal` | - |
| `soRate` | `BigDecimal` | - |
| `unitCategory` | `String` | - |
| `packQuantity` | `Short` | - |
| `janPcode` | `String` | - |
| `width` | `Float` | - |
| `widthUnitSizeCategory` | `String` | - |
| `depth` | `Float` | - |
| `depthUnitSizeCategory` | `String` | - |
| `height` | `Float` | - |
| `heightUnitSizeCategory` | `String` | - |
| `weight` | `Float` | - |
| `weightUnitSizeCategory` | `String` | - |
| `length` | `Float` | - |
| `lengthUnitSizeCategory` | `String` | - |
| `poLot` | `BigDecimal` | - |
| `lotUpdFlag` | `Short` | - |
| `leadTime` | `Integer` | - |
| `poNum` | `Integer` | - |
| `poUpdFlag` | `Short` | - |
| `mineSafetyStock` | `Integer` | - |
| `mineSafetyStockUpdFlag` | `Short` | - |
| `entrustSafetyStock` | `Integer` | - |
| `salesStandardDeviation` | `BigDecimal` | - |
| `avgShipCount` | `Integer` | - |
| `maxStockNum` | `Integer` | - |
| `stockUpdFlag` | `Short` | - |
| `termShipNum` | `Integer` | - |
| `maxPoNum` | `Integer` | - |
| `maxPoUpdFlag` | `Short` | - |
| `fractCategory` | `String` | - |
| `taxCategory` | `String` | - |
| `stockCtlCategory` | `String` | - |
| `stockAssesCategory` | `String` | - |
| `productCategory` | `String` | - |
| `product1` | `String` | - |
| `product2` | `String` | - |
| `product3` | `String` | - |
| `roMaxNum` | `Short` | - |
| `productRank` | `String` | - |
| `setTypeCategory` | `String` | - |
| `productStatusCategory` | `String` | - |
| `productStockCategory` | `String` | - |
| `productPurvayCategory` | `String` | - |
| `productStandardCategory` | `String` | - |
| `coreNum` | `String` | - |
| `num1` | `Short` | - |
| `num2` | `Short` | - |
| `num3` | `Short` | - |
| `num4` | `Short` | - |
| `num5` | `Short` | - |
| `dec1` | `Float` | - |
| `dec2` | `Float` | - |
| `dec3` | `Float` | - |
| `dec4` | `Float` | - |
| `dec5` | `Float` | - |
| `discardDate` | `Date` | - |
| `remarks` | `String` | - |
| `eadRemarks` | `String` | - |
| `commentData` | `String` | - |
| `lastRoDate` | `Date` | - |

### 5.1. SalesSlipTrn (`SALES_SLIP_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `salesSlipId` | `Integer` | - |
| `status` | `String` | - |
| `salesAnnual` | `Short` | - |
| `salesMonthly` | `Short` | - |
| `salesYm` | `Integer` | - |
| `roSlipId` | `Integer` | - |
| `billId` | `Integer` | - |
| `salesBillId` | `Integer` | - |
| `billDate` | `Date` | - |
| `billCutoffGroup` | `String` | - |
| `billCutoffDate` | `Date` | - |
| `billCutoffPdate` | `Timestamp` | - |
| `salesDate` | `Date` | - |
| `deliveryDate` | `Date` | - |
| `receptNo` | `String` | - |
| `customerSlipNo` | `String` | - |
| `salesCmCategory` | `String` | - |
| `salesCutoffDate` | `Date` | - |
| `salesCutoffPdate` | `Timestamp` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `remarks` | `String` | - |
| `pickingRemarks` | `String` | - |
| `dcCategory` | `String` | - |
| `dcName` | `String` | - |
| `dcTimezoneCategory` | `String` | - |
| `dcTimezone` | `String` | - |
| `customerCode` | `String` | - |
| `customerName` | `String` | - |
| `customerRemarks` | `String` | - |
| `customerCommentData` | `String` | - |
| `deliveryCode` | `String` | - |
| `deliveryName` | `String` | - |
| `deliveryKana` | `String` | - |
| `deliveryOfficeName` | `String` | - |
| `deliveryOfficeKana` | `String` | - |
| `deliveryDeptName` | `String` | - |
| `deliveryZipCode` | `String` | - |
| `deliveryAddress1` | `String` | - |
| `deliveryAddress2` | `String` | - |
| `deliveryPcName` | `String` | - |
| `deliveryPcKana` | `String` | - |
| `deliveryPcPreCategory` | `String` | - |
| `deliveryPcPre` | `String` | - |
| `deliveryTel` | `String` | - |
| `deliveryFax` | `String` | - |
| `deliveryEmail` | `String` | - |
| `deliveryUrl` | `String` | - |
| `baCode` | `String` | - |
| `baName` | `String` | - |
| `baKana` | `String` | - |
| `baOfficeName` | `String` | - |
| `baOfficeKana` | `String` | - |
| `baDeptName` | `String` | - |
| `baZipCode` | `String` | - |
| `baAddress1` | `String` | - |
| `baAddress2` | `String` | - |
| `baPcName` | `String` | - |
| `baPcKana` | `String` | - |
| `baPcPreCategory` | `String` | - |
| `baPcPre` | `String` | - |
| `baTel` | `String` | - |
| `baFax` | `String` | - |
| `baEmail` | `String` | - |
| `baUrl` | `String` | - |
| `taxShiftCategory` | `String` | - |
| `ctaxPriceTotal` | `BigDecimal` | - |
| `ctaxRate` | `BigDecimal` | - |
| `priceTotal` | `BigDecimal` | - |
| `gmTotal` | `BigDecimal` | - |
| `codSc` | `String` | - |
| `billPrintCount` | `Integer` | - |
| `deliveryPrintCount` | `Integer` | - |
| `tempDeliveryPrintCount` | `Integer` | - |
| `shippingPrintCount` | `Integer` | - |
| `siPrintCount` | `Integer` | - |
| `adlabel` | `String` | - |
| `disclaimer` | `String` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| ... | ... | +27 fields |

### 5.1. SalesLineTrn (`SALES_LINE_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `salesLineId` | `Integer` | - |
| `status` | `String` | - |
| `salesSlipId` | `Integer` | - |
| `lineNo` | `Short` | - |
| `roLineId` | `Integer` | - |
| `salesDetailCategory` | `String` | - |
| `productCode` | `String` | - |
| `customerPcode` | `String` | - |
| `productAbstract` | `String` | - |
| `quantity` | `BigDecimal` | - |
| `deliveryProcessCategory` | `String` | - |
| `unitPrice` | `BigDecimal` | - |
| `unitCategory` | `String` | - |
| `unitName` | `String` | - |
| `packQuantity` | `Short` | - |
| `unitRetailPrice` | `BigDecimal` | - |
| `retailPrice` | `BigDecimal` | - |
| `unitCost` | `BigDecimal` | - |
| `cost` | `BigDecimal` | - |
| `taxCategory` | `String` | - |
| `ctaxRate` | `BigDecimal` | - |
| `ctaxPrice` | `BigDecimal` | - |
| `gm` | `BigDecimal` | - |
| `remarks` | `String` | - |
| `eadRemarks` | `String` | - |
| `productRemarks` | `String` | - |
| `rackCodeSrc` | `String` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |

### 5.1. Bill (`BILL_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `billId` | `Integer` | - |
| `status` | `String` | - |
| `billYear` | `Short` | - |
| `billMonth` | `Short` | - |
| `billYm` | `Integer` | - |
| `billCutoffDate` | `Date` | - |
| `cutoffGroup` | `String` | - |
| `cutoffPdate` | `Timestamp` | - |
| `remarks` | `String` | - |
| `baCode` | `String` | - |
| `customerCode` | `String` | - |
| `lastBillPrice` | `BigDecimal` | - |
| `depositPrice` | `BigDecimal` | - |
| `adjPrice` | `BigDecimal` | - |
| `covPrice` | `BigDecimal` | - |
| `salesPrice` | `BigDecimal` | - |
| `ctaxPrice` | `BigDecimal` | - |
| `rguPrice` | `BigDecimal` | - |
| `dctPrice` | `BigDecimal` | - |
| `etcPrice` | `BigDecimal` | - |
| `thisBillPrice` | `BigDecimal` | - |
| `slipNum` | `Short` | - |
| `codLastBillPrice` | `BigDecimal` | - |
| `codDepositPrice` | `BigDecimal` | - |
| `codAdjPrice` | `BigDecimal` | - |
| `codCovPrice` | `BigDecimal` | - |
| `codSalesPrice` | `BigDecimal` | - |
| `codCtaxPrice` | `BigDecimal` | - |
| `codRguPrice` | `BigDecimal` | - |
| `codDctPrice` | `BigDecimal` | - |
| `codEtcPrice` | `BigDecimal` | - |
| `codThisBillPrice` | `BigDecimal` | - |
| `codSlipNum` | `Short` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `paybackPlanDate` | `Date` | - |
| `lastPrintDate` | `Date` | - |
| `billPrintCount` | `Integer` | - |
| `billCrtCategory` | `String` | - |
| `lastSalesDate` | `Date` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |
| `paybackCycleCategory` | `String` | - |

### 5.1. DepositSlip (`DEPOSIT_SLIP_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `depositSlipId` | `Integer` | - |
| `status` | `String` | - |
| `depositDate` | `Date` | - |
| `inputPdate` | `Date` | - |
| `depositAnnual` | `Short` | - |
| `depositMonthly` | `Short` | - |
| `depositYm` | `Integer` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `depositAbstract` | `String` | - |
| `remarks` | `String` | - |
| `customerCode` | `String` | - |
| `customerName` | `String` | - |
| `customerRemarks` | `String` | - |
| `customerCommentData` | `String` | - |
| `cutoffGroup` | `String` | - |
| `paybackCycleCategory` | `String` | - |
| `baCode` | `String` | - |
| `baName` | `String` | - |
| `baKana` | `String` | - |
| `baOfficeName` | `String` | - |
| `baOfficeKana` | `String` | - |
| `baDeptName` | `String` | - |
| `baZipCode` | `String` | - |
| `baAddress1` | `String` | - |
| `baAddress2` | `String` | - |
| `baPcName` | `String` | - |
| `baPcKana` | `String` | - |
| `baPcPreCatrgory` | `String` | - |
| `baPcPre` | `String` | - |
| `baTel` | `String` | - |
| `baFax` | `String` | - |
| `baEmail` | `String` | - |
| `baUrl` | `String` | - |
| `salesCmCategory` | `String` | - |
| `depositCategory` | `String` | - |
| `depositTotal` | `BigDecimal` | - |
| `billId` | `Integer` | - |
| `billCutoffDate` | `Date` | - |
| `billCutoffPdate` | `Timestamp` | - |
| `artId` | `Integer` | - |
| `salesSlipId` | `Integer` | - |
| `depositMethodTypeCategory` | `String` | - |
| `taxFractCategory` | `String` | - |
| `priceFractCategory` | `String` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |
| `salesCutoffDate` | `Date` | - |
| `salesCutoffPdate` | `Timestamp` | - |

### 5.1. DepositLine (`DEPOSIT_LINE_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `depositLineId` | `Integer` | - |
| `status` | `String` | - |
| `depositSlipId` | `Integer` | - |
| `lineNo` | `Short` | - |
| `depositCategory` | `String` | - |
| `price` | `BigDecimal` | - |
| `instDate` | `Date` | - |
| `instNo` | `String` | - |
| `bankId` | `Integer` | - |
| `bankInfo` | `String` | - |
| `remarks` | `String` | - |
| `salesLineId` | `Integer` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |

### 5.1. RoSlipTrn (`RO_SLIP_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `roSlipId` | `Integer` | - |
| `status` | `String` | - |
| `roAnnual` | `Short` | - |
| `roMonthly` | `Short` | - |
| `roYm` | `Integer` | - |
| `roDate` | `Date` | - |
| `shipDate` | `Date` | - |
| `deliveryDate` | `Date` | - |
| `receptNo` | `String` | - |
| `customerSlipNo` | `String` | - |
| `salesCmCategory` | `String` | - |
| `cutoffGroup` | `String` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `remarks` | `String` | - |
| `customerCode` | `String` | - |
| `customerName` | `String` | - |
| `customerRemarks` | `String` | - |
| `customerCommentData` | `String` | - |
| `deliveryCode` | `String` | - |
| `deliveryName` | `String` | - |
| `deliveryKana` | `String` | - |
| `deliveryOfficeName` | `String` | - |
| `deliveryOfficeKana` | `String` | - |
| `deliveryDeptName` | `String` | - |
| `deliveryZipCode` | `String` | - |
| `deliveryAddress1` | `String` | - |
| `deliveryAddress2` | `String` | - |
| `deliveryPcName` | `String` | - |
| `deliveryPcKana` | `String` | - |
| `deliveryPcPreCategory` | `String` | - |
| `deliveryPcPre` | `String` | - |
| `deliveryTel` | `String` | - |
| `deliveryFax` | `String` | - |
| `deliveryEmail` | `String` | - |
| `deliveryUrl` | `String` | - |
| `estimateSheetId` | `Integer` | - |
| `taxShiftCategory` | `String` | - |
| `ctaxPriceTotal` | `BigDecimal` | - |
| `ctaxRate` | `BigDecimal` | - |
| `costTotal` | `BigDecimal` | - |
| `retailPriceTotal` | `BigDecimal` | - |
| `priceTotal` | `BigDecimal` | - |
| `printCount` | `Integer` | - |
| `codSc` | `String` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |
| `paybackCycleCategory` | `String` | - |
| `taxFractCategory` | `String` | - |
| `priceFractCategory` | `String` | - |
| `dcCategory` | `String` | - |
| `dcName` | `String` | - |
| `dcTimezoneCategory` | `String` | - |
| `dcTimezone` | `String` | - |

### 5.1. EstimateSheetTrn (`ESTIMATE_SHEET_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `estimateSheetId` | `String` | - |
| `estimateAnnual` | `Short` | - |
| `estimateMonthly` | `Short` | - |
| `estimateYm` | `Integer` | - |
| `estimateDate` | `Date` | - |
| `deliveryInfo` | `String` | - |
| `validDate` | `Date` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `remarks` | `String` | - |
| `title` | `String` | - |
| `estimateCondition` | `String` | - |
| `submitName` | `String` | - |
| `submitPreCategory` | `String` | - |
| `submitPre` | `String` | - |
| `customerCode` | `String` | - |
| `customerName` | `String` | - |
| `customerRemarks` | `String` | - |
| `customerCommentData` | `String` | - |
| `deliveryName` | `String` | - |
| `deliveryOfficeName` | `String` | - |
| `deliveryDeptName` | `String` | - |
| `deliveryZipCode` | `String` | - |
| `deliveryAddress1` | `String` | - |
| `deliveryAddress2` | `String` | - |
| `deliveryPcName` | `String` | - |
| `deliveryPcKana` | `String` | - |
| `deliveryPcPreCategory` | `String` | - |
| `deliveryPcPre` | `String` | - |
| `deliveryTel` | `String` | - |
| `deliveryFax` | `String` | - |
| `deliveryEmail` | `String` | - |
| `deliveryUrl` | `String` | - |
| `ctaxPriceTotal` | `BigDecimal` | - |
| `ctaxRate` | `BigDecimal` | - |
| `costTotal` | `BigDecimal` | - |
| `retailPriceTotal` | `BigDecimal` | - |
| `estimateTotal` | `BigDecimal` | - |
| `memo` | `String` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |
| `taxFractCategory` | `String` | - |
| `priceFractCategory` | `String` | - |

### 5.1. PoSlipTrn (`PO_SLIP_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `poSlipId` | `Integer` | - |
| `status` | `String` | - |
| `poDate` | `Date` | - |
| `poAnnual` | `Short` | - |
| `poMonthly` | `Short` | - |
| `poYm` | `Integer` | - |
| `deliveryDate` | `Date` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `remarks` | `String` | - |
| `supplierCode` | `String` | - |
| `supplierName` | `String` | - |
| `supplierKana` | `String` | - |
| `supplierZipCode` | `String` | - |
| `supplierAddress1` | `String` | - |
| `supplierAddress2` | `String` | - |
| `supplierPcName` | `String` | - |
| `supplierPcKana` | `String` | - |
| `supplierPcPreCategory` | `String` | - |
| `supplierPcPost` | `String` | - |
| `supplierTel` | `String` | - |
| `supplierFax` | `String` | - |
| `supplierEmail` | `String` | - |
| `supplierUrl` | `String` | - |
| `transportCategory` | `String` | - |
| `taxShiftCategory` | `String` | - |
| `taxFractCategory` | `String` | - |
| `priceFractCategory` | `String` | - |
| `rateId` | `Integer` | - |
| `supplierCmCategory` | `String` | - |
| `priceTotal` | `BigDecimal` | - |
| `ctaxTotal` | `BigDecimal` | - |
| `ctaxRate` | `BigDecimal` | - |
| `fePriceTotal` | `BigDecimal` | - |
| `printCount` | `Integer` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |
| `supplierAbbr` | `String` | - |
| `supplierDeptName` | `String` | - |
| `supplierPcPre` | `String` | - |

### 5.1. EadSlipTrn (`EAD_SLIP_TRN`)
| Field | Type | Mô tả |
|-------|------|-------|
| `eadSlipId` | `Integer` | - |
| `eadDate` | `Date` | - |
| `eadAnnual` | `Short` | - |
| `eadMonthly` | `Short` | - |
| `eadYm` | `Integer` | - |
| `userId` | `String` | - |
| `userName` | `String` | - |
| `eadSlipCategory` | `String` | - |
| `eadCategory` | `String` | - |
| `remarks` | `String` | - |
| `srcFunc` | `String` | - |
| `salesSlipId` | `Integer` | - |
| `supplierSlipId` | `Integer` | - |
| `moveDepositSlipId` | `Integer` | - |
| `stockPdate` | `Date` | - |
| `creFunc` | `String` | - |
| `creDatetm` | `Timestamp` | - |
| `creUser` | `String` | - |
| `updFunc` | `String` | - |
| `updDatetm` | `Timestamp` | - |
| `updUser` | `String` | - |

### 5.1. ProductStockInfo (`-`)
| Field | Type | Mô tả |
|-------|------|-------|
| `aggregateMonthsRange` | `Integer` | - |
| `numDecAlignment` | `Short` | - |
| `unitPriceDecAlignment` | `Short` | - |
| `statsDecAlignment` | `Short` | - |
| `priceFractCategory` | `String` | - |
| `productFractCategory` | `String` | - |
| `productCode` | `String` | - |
| `productName` | `String` | - |
| `rackCode` | `String` | - |
| `rackName` | `String` | - |
| `avgShipCount` | `Integer` | - |
| `maxStockNum` | `Integer` | - |
| `poNum` | `Integer` | - |
| `poLot` | `BigDecimal` | - |
| `supplierPriceYen` | `BigDecimal` | - |
| `supplierPriceDol` | `BigDecimal` | - |
| `retailPrice` | `BigDecimal` | - |
| `leadTime` | `Integer` | - |
| `salesStandardDeviation` | `BigDecimal` | - |
| `mineSafetyStock` | `Integer` | - |
| `entrustSafetyStock` | `Integer` | - |
| `stockQuantityEadUnclosed` | `BigDecimal` | - |
| `stockQuantityEadClosed` | `BigDecimal` | - |
| `stockQuantityEntrustEad` | `BigDecimal` | - |
| `restQuantityRo` | `BigDecimal` | - |
| `restQuantityPoShip` | `BigDecimal` | - |
| `restQuantityPoAir` | `BigDecimal` | - |
| `restQuantityPoDelivery` | `BigDecimal` | - |
| `restQuantityEntrust` | `BigDecimal` | - |
| `deliveryDate` | `Date` | - |
| `restQuantityPo` | `BigDecimal` | - |
| `currentStockQuantity` | `BigDecimal` | - |
| `availableStockQuantity` | `BigDecimal` | - |
| `holdingStockQuantity` | `BigDecimal` | - |
| `holdingStockMonth` | `BigDecimal` | - |
| `roQuantity` | `BigDecimal` | - |
| `salesQuantity` | `BigDecimal` | - |
| `maxSalesQuantity` | `BigDecimal` | - |
| `retailPriceTotal` | `BigDecimal` | - |
| `grossMarginTotal` | `BigDecimal` | - |
| `entrustPoNum` | `BigDecimal` | - |
| `poSlipId` | `Integer` | - |

---
*Generated from SalesCube source analysis*
