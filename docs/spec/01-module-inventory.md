# SalesCube - Module Inventory (Danh sách Module)
> Tài liệu này được tạo bằng reverse-engineering trực tiếp từ source code Java/JSP của SalesCube.
> **Source:** `/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys` và `/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/view`
> **Lưu ý:** URL và JSP được suy luận theo convention của S2Struts (class `EditCustomerAction` -> `/editCustomer.do` -> `editCustomer.jsp`).

---
## 1. Tổng quan cấu trúc
```
jp.co.arkinfosys.action/
├── ajax/           (88 actions) - AJAX API
├── master/           (32 actions) - Master data (マスタ)
├── sales/           (8 actions) - Bán hàng (売上)
├── bill/           (6 actions) - Hóa đơn (請求)
├── deposit/           (5 actions) - Thu tiền (入金)
├── stock/           (12 actions) - Tồn kho (在庫)
├── estimate/           (5 actions) - Báo giá (見積)
├── rorder/           (4 actions) - Đơn đặt hàng (受注)
├── porder/           (6 actions) - Đặt hàng mua (発注)
├── purchase/           (3 actions) - Mua hàng (仕入)
├── payment/           (4 actions) - Thanh toán (支払)
├── report/           (3 actions) - Báo cáo (帳票)
├── setting/           (13 actions) - Cài đặt (設定)
```

---
## 2. Chi tiết từng Module

### 2.x. MASTER DATA (マスタ) - 32 Actions
**Package:** `jp.co.arkinfosys.action.master`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `DownloadProductExcelAction` | DownloadProductExcel | `CommonResources` | `/downloadProductExcel.do` | `downloadProductExcel.jsp` |
| 2 | `EditBankAction` | Sửa Bank | `AbstractEditAction` | `/editBank.do` | `editBank.jsp` |
| 3 | `EditCategoryAction` | Sửa Category | `AbstractEditAction` | `/editCategory.do` | `editCategory.jsp` |
| 4 | `EditCustomerAction` | Sửa Customer | `AbstractEditAction` | `/editCustomer.do` | `editCustomer.jsp` |
| 5 | `EditCustomerRankAction` | Sửa CustomerRank | `AbstractEditAction` | `/editCustomerRank.do` | `editCustomerRank.jsp` |
| 6 | `EditDiscountAction` | Sửa Discount | `AbstractEditAction` | `/editDiscount.do` | `editDiscount.jsp` |
| 7 | `EditProductAction` | Sửa Product | `AbstractEditAction` | `/editProduct.do` | `editProduct.jsp` |
| 8 | `EditProductClassAction` | Sửa ProductClass | `AbstractEditAction` | `/editProductClass.do` | `editProductClass.jsp` |
| 9 | `EditProductSetAction` | Sửa ProductSet | `AbstractEditAction` | `/editProductSet.do` | `editProductSet.jsp` |
| 10 | `EditRackAction` | Sửa Rack | `AbstractEditAction` | `/editRack.do` | `editRack.jsp` |
| 11 | `EditRateAction` | Sửa Rate | `AbstractEditAction` | `/editRate.do` | `editRate.jsp` |
| 12 | `EditSupplierAction` | Sửa Supplier | `AbstractEditAction` | `/editSupplier.do` | `editSupplier.jsp` |
| 13 | `EditTaxRateAction` | Sửa TaxRate | `AbstractEditAction` | `/editTaxRate.do` | `editTaxRate.jsp` |
| 14 | `EditWarehouseAction` | Sửa Warehouse | `AbstractEditAction` | `/editWarehouse.do` | `editWarehouse.jsp` |
| 15 | `ImportProductExcelAction` | Import ProductExcel | `CommonResources` | `/importProductExcel.do` | `importProductExcel.jsp` |
| 16 | `ImportZipCodeCSVAction` | Import ZipCodeCSV | `AbstractXSVUploadAction` | `/importZipCodeCSV.do` | `importZipCodeCSV.jsp` |
| 17 | `SearchBankAction` | Tìm kiếm Bank | `AbstractSearchAction` | `/searchBank.do` | `searchBank.jsp` |
| 18 | `SearchCategoryAction` | Tìm kiếm Category | `AbstractSearchAction` | `/searchCategory.do` | `searchCategory.jsp` |
| 19 | `SearchCustomerAction` | Tìm kiếm Customer | `AbstractSearchAction` | `/searchCustomer.do` | `searchCustomer.jsp` |
| 20 | `SearchCustomerRankAction` | Tìm kiếm CustomerRank | `AbstractSearchAction` | `/searchCustomerRank.do` | `searchCustomerRank.jsp` |
| 21 | `SearchCustomerRankResultOutputAction` | Tìm kiếm CustomerRankResultOutput | `AbstractSearchResultAction` | `/searchCustomerRankResultOutput.do` | `searchCustomerRankResultOutput.jsp` |
| 22 | `SearchDiscountAction` | Tìm kiếm Discount | `AbstractSearchAction` | `/searchDiscount.do` | `searchDiscount.jsp` |
| 23 | `SearchProductAction` | Tìm kiếm Product | `AbstractSearchAction` | `/searchProduct.do` | `searchProduct.jsp` |
| 24 | `SearchProductClassAction` | Tìm kiếm ProductClass | `AbstractSearchAction` | `/searchProductClass.do` | `searchProductClass.jsp` |
| 25 | `SearchProductSetAction` | Tìm kiếm ProductSet | `AbstractSearchAction` | `/searchProductSet.do` | `searchProductSet.jsp` |
| 26 | `SearchRackAction` | Tìm kiếm Rack | `AbstractSearchAction` | `/searchRack.do` | `searchRack.jsp` |
| 27 | `SearchRackResultOutputAction` | Tìm kiếm RackResultOutput | `AbstractSearchResultAjaxAction` | `/searchRackResultOutput.do` | `searchRackResultOutput.jsp` |
| 28 | `SearchRateAction` | Tìm kiếm Rate | `AbstractSearchAction` | `/searchRate.do` | `searchRate.jsp` |
| 29 | `SearchSupplierAction` | Tìm kiếm Supplier | `AbstractSearchAction` | `/searchSupplier.do` | `searchSupplier.jsp` |
| 30 | `SearchTaxRateAction` | Tìm kiếm TaxRate | `AbstractSearchAction` | `/searchTaxRate.do` | `searchTaxRate.jsp` |
| 31 | `SearchWarehouseAction` | Tìm kiếm Warehouse | `AbstractSearchAction` | `/searchWarehouse.do` | `searchWarehouse.jsp` |
| 32 | `SearchWarehouseResultOutputAction` | Tìm kiếm WarehouseResultOutput | `AbstractSearchResultAjaxAction` | `/searchWarehouseResultOutput.do` | `searchWarehouseResultOutput.jsp` |

### 2.x. BÁN HÀNG (売上) - 8 Actions
**Package:** `jp.co.arkinfosys.action.sales`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `InputSalesAction` | Nhập Sales | `AbstractSlipEditAction` | `/inputSales.do` | `inputSales.jsp` |
| 2 | `OutputInvoiceAction` | Xuất/In Invoice | `AbstractSearchAction` | `/outputInvoice.do` | `outputInvoice.jsp` |
| 3 | `OutputInvoiceResultAction` | Xuất/In InvoiceResult | `AbstractSearchResultAction` | `/outputInvoiceResult.do` | `outputInvoiceResult.jsp` |
| 4 | `OutputSalesReportAction` | Xuất/In SalesReport | `AbstractSearchAction` | `/outputSalesReport.do` | `outputSalesReport.jsp` |
| 5 | `OutputSalesReportResultAction` | Xuất/In SalesReportResult | `AbstractReportWriterAction` | `/outputSalesReportResult.do` | `outputSalesReportResult.jsp` |
| 6 | `OutputSalesReportSingleAction` | Xuất/In SalesReportSingle | `OutputSalesReportResultAction` | `/outputSalesReportSingle.do` | `outputSalesReportSingle.jsp` |
| 7 | `SearchSalesAction` | Tìm kiếm Sales | `AbstractSearchAction` | `/searchSales.do` | `searchSales.jsp` |
| 8 | `SearchSalesResultOutputAction` | Tìm kiếm SalesResultOutput | `AbstractSearchResultAction` | `/searchSalesResultOutput.do` | `searchSalesResultOutput.jsp` |

### 2.x. HÓA ĐƠN (請求) - 6 Actions
**Package:** `jp.co.arkinfosys.action.bill`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `CloseArtBalanceAction` | Chốt ArtBalance | `CommonResources` | `/closeArtBalance.do` | `closeArtBalance.jsp` |
| 2 | `CloseBillAction` | Chốt Bill | `AbstractSearchAction` | `/closeBill.do` | `closeBill.jsp` |
| 3 | `MakeOutBillAction` | Tạo OutBill | `AbstractSearchAction` | `/makeOutBill.do` | `makeOutBill.jsp` |
| 4 | `MakeOutBillReportOutputAction` | Tạo OutBillReportOutput | `AbstractReportWriterAction` | `/makeOutBillReportOutput.do` | `makeOutBillReportOutput.jsp` |
| 5 | `SearchBillAction` | Tìm kiếm Bill | `AbstractSearchAction` | `/searchBill.do` | `searchBill.jsp` |
| 6 | `SearchBillResultOutputAction` | Tìm kiếm BillResultOutput | `AbstractSearchResultAction` | `/searchBillResultOutput.do` | `searchBillResultOutput.jsp` |

### 2.x. THU TIỀN (入金) - 5 Actions
**Package:** `jp.co.arkinfosys.action.deposit`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `ImportBankDepositAction` | Import BankDeposit | `AbstractXSVUploadAction` | `/importBankDeposit.do` | `importBankDeposit.jsp` |
| 2 | `ImportDeliveryDepositAction` | Import DeliveryDeposit | `AbstractXSVUploadAction` | `/importDeliveryDeposit.do` | `importDeliveryDeposit.jsp` |
| 3 | `InputDepositAction` | Nhập Deposit | `AbstractSlipEditAction` | `/inputDeposit.do` | `inputDeposit.jsp` |
| 4 | `SearchDepositAction` | Tìm kiếm Deposit | `AbstractSearchAction` | `/searchDeposit.do` | `searchDeposit.jsp` |
| 5 | `SearchDepositResultOutputAction` | Tìm kiếm DepositResultOutput | `AbstractSearchResultAction` | `/searchDepositResultOutput.do` | `searchDepositResultOutput.jsp` |

### 2.x. TỒN KHO (在庫) - 12 Actions
**Package:** `jp.co.arkinfosys.action.stock`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `CloseStockAction` | Chốt Stock | `CommonResources` | `/closeStock.do` | `closeStock.jsp` |
| 2 | `DispProductStockListAction` | DispProductStockList | `CommonResources` | `/dispProductStockList.do` | `dispProductStockList.jsp` |
| 3 | `InputEntrustStockAction` | Nhập EntrustStock | `AbstractSlipEditAction` | `/inputEntrustStock.do` | `inputEntrustStock.jsp` |
| 4 | `InputStockAction` | Nhập Stock | `AbstractSlipEditAction` | `/inputStock.do` | `inputStock.jsp` |
| 5 | `InputStockTransferAction` | Nhập StockTransfer | `AbstractSlipEditAction` | `/inputStockTransfer.do` | `inputStockTransfer.jsp` |
| 6 | `OutputEntrustStockOrderAction` | Xuất/In EntrustStockOrder | `AbstractReportWriterAction` | `/outputEntrustStockOrder.do` | `outputEntrustStockOrder.jsp` |
| 7 | `OutputStockListAction` | Xuất/In StockList | `CommonResources` | `/outputStockList.do` | `outputStockList.jsp` |
| 8 | `OutputStockReportAction` | Xuất/In StockReport | `CommonResources` | `/outputStockReport.do` | `outputStockReport.jsp` |
| 9 | `SearchEntrustStockAction` | Tìm kiếm EntrustStock | `AbstractSearchAction` | `/searchEntrustStock.do` | `searchEntrustStock.jsp` |
| 10 | `SearchEntrustStockResultOutputAction` | Tìm kiếm EntrustStockResultOutput | `AbstractSearchResultAjaxAction` | `/searchEntrustStockResultOutput.do` | `searchEntrustStockResultOutput.jsp` |
| 11 | `SearchStockAction` | Tìm kiếm Stock | `AbstractSearchAction` | `/searchStock.do` | `searchStock.jsp` |
| 12 | `SearchStockResultOutputAction` | Tìm kiếm StockResultOutput | `AbstractSearchResultAjaxAction` | `/searchStockResultOutput.do` | `searchStockResultOutput.jsp` |

### 2.x. BÁO GIÁ (見積) - 5 Actions
**Package:** `jp.co.arkinfosys.action.estimate`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `DispProductPriceListAction` | DispProductPriceList | `CommonResources` | `/dispProductPriceList.do` | `dispProductPriceList.jsp` |
| 2 | `InputEstimateAction` | Nhập Estimate | `AbstractSlipEditAction` | `/inputEstimate.do` | `inputEstimate.jsp` |
| 3 | `OutputEstimateSheetSingleAction` | Xuất/In EstimateSheetSingle | `AbstractReportWriterAction` | `/outputEstimateSheetSingle.do` | `outputEstimateSheetSingle.jsp` |
| 4 | `SearchEstimateAction` | Tìm kiếm Estimate | `AbstractSearchAction` | `/searchEstimate.do` | `searchEstimate.jsp` |
| 5 | `SearchEstimateResultOutputAction` | Tìm kiếm EstimateResultOutput | `AbstractSearchResultAction` | `/searchEstimateResultOutput.do` | `searchEstimateResultOutput.jsp` |

### 2.x. ĐƠN ĐẶT HÀNG (受注) - 4 Actions
**Package:** `jp.co.arkinfosys.action.rorder`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `ImportOnlineOrderAction` | Import OnlineOrder | `AbstractXSVUploadAction` | `/importOnlineOrder.do` | `importOnlineOrder.jsp` |
| 2 | `InputROrderAction` | Nhập ROrder | `AbstractSlipEditAction` | `/inputROrder.do` | `inputROrder.jsp` |
| 3 | `SearchROrderAction` | Tìm kiếm ROrder | `AbstractSearchAction` | `/searchROrder.do` | `searchROrder.jsp` |
| 4 | `SearchROrderResultOutputAction` | Tìm kiếm ROrderResultOutput | `AbstractSearchResultAction` | `/searchROrderResultOutput.do` | `searchROrderResultOutput.jsp` |

### 2.x. ĐẶT HÀNG MUA (発注) - 6 Actions
**Package:** `jp.co.arkinfosys.action.porder`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `InputPOrderAction` | Nhập POrder | `AbstractSlipEditAction` | `/inputPOrder.do` | `inputPOrder.jsp` |
| 2 | `MakeOutPOrderAction` | Tạo OutPOrder | `AbstractSearchAction` | `/makeOutPOrder.do` | `makeOutPOrder.jsp` |
| 3 | `MakeOutPOrderResultOutputAction` | Tạo OutPOrderResultOutput | `AbstractReportWriterAction` | `/makeOutPOrderResultOutput.do` | `makeOutPOrderResultOutput.jsp` |
| 4 | `OutputRecommendListAction` | Xuất/In RecommendList | `CommonResources` | `/outputRecommendList.do` | `outputRecommendList.jsp` |
| 5 | `SearchPOrderAction` | Tìm kiếm POrder | `AbstractSearchAction` | `/searchPOrder.do` | `searchPOrder.jsp` |
| 6 | `SearchPOrderResultOutputAction` | Tìm kiếm POrderResultOutput | `AbstractSearchResultAction` | `/searchPOrderResultOutput.do` | `searchPOrderResultOutput.jsp` |

### 2.x. MUA HÀNG (仕入) - 3 Actions
**Package:** `jp.co.arkinfosys.action.purchase`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `InputPurchaseAction` | Nhập Purchase | `AbstractSlipEditAction` | `/inputPurchase.do` | `inputPurchase.jsp` |
| 2 | `SearchPurchaseAction` | Tìm kiếm Purchase | `AbstractSearchAction` | `/searchPurchase.do` | `searchPurchase.jsp` |
| 3 | `SearchPurchaseResultOutputAction` | Tìm kiếm PurchaseResultOutput | `AbstractSearchResultAction` | `/searchPurchaseResultOutput.do` | `searchPurchaseResultOutput.jsp` |

### 2.x. THANH TOÁN (支払) - 4 Actions
**Package:** `jp.co.arkinfosys.action.payment`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `ClosePaymentAction` | Chốt Payment | `CommonResources` | `/closePayment.do` | `closePayment.jsp` |
| 2 | `InputPaymentAction` | Nhập Payment | `AbstractSlipEditAction` | `/inputPayment.do` | `inputPayment.jsp` |
| 3 | `SearchPaymentAction` | Tìm kiếm Payment | `AbstractSearchAction` | `/searchPayment.do` | `searchPayment.jsp` |
| 4 | `SearchPaymentResultOutputAction` | Tìm kiếm PaymentResultOutput | `AbstractSearchResultAction` | `/searchPaymentResultOutput.do` | `searchPaymentResultOutput.jsp` |

### 2.x. BÁO CÁO (帳票) - 3 Actions
**Package:** `jp.co.arkinfosys.action.report`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `OutputBalanceListAction` | Xuất/In BalanceList | `CommonResources` | `/outputBalanceList.do` | `outputBalanceList.jsp` |
| 2 | `ReferenceHistoryAction` | ReferenceHistory | `CommonResources` | `/referenceHistory.do` | `referenceHistory.jsp` |
| 3 | `ReferenceMstAction` | ReferenceMst | `CommonResources` | `/referenceMst.do` | `referenceMst.jsp` |

### 2.x. CÀI ĐẶT (設定) - 13 Actions
**Package:** `jp.co.arkinfosys.action.setting`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `ChangePasswordAction` | ChangePassword | `CommonResources` | `/changePassword.do` | `changePassword.jsp` |
| 2 | `CompanyAction` | Company | `CommonResources` | `/company.do` | `company.jsp` |
| 3 | `EditDeptAction` | Sửa Dept | `CommonResources` | `/editDept.do` | `editDept.jsp` |
| 4 | `EditFileUploadAction` | Sửa FileUpload | `CommonResources` | `/editFileUpload.do` | `editFileUpload.jsp` |
| 5 | `EditUserAction` | Sửa User | `CommonResources` | `/editUser.do` | `editUser.jsp` |
| 6 | `FileDownloadAction` | FileDownload | `CommonResources` | `/fileDownload.do` | `fileDownload.jsp` |
| 7 | `NewsAction` | News | `CommonResources` | `/news.do` | `news.jsp` |
| 8 | `SearchDeptAction` | Tìm kiếm Dept | `AbstractSearchAction` | `/searchDept.do` | `searchDept.jsp` |
| 9 | `SearchFileUploadAction` | Tìm kiếm FileUpload | `AbstractSearchAction` | `/searchFileUpload.do` | `searchFileUpload.jsp` |
| 10 | `SearchUserAction` | Tìm kiếm User | `AbstractSearchAction` | `/searchUser.do` | `searchUser.jsp` |
| 11 | `SetCategoryAction` | SetCategory | `CommonResources` | `/setCategory.do` | `setCategory.jsp` |
| 12 | `SetSecurityAction` | SetSecurity | `CommonResources` | `/setSecurity.do` | `setSecurity.jsp` |
| 13 | `StockAction` | Stock | `CommonResources` | `/stock.do` | `stock.jsp` |

### 2.x. AJAX API - 88 Actions
**Package:** `jp.co.arkinfosys.action.ajax`
| # | Class | Mô tả | Extends | URL (convention) | JSP (convention) |
|----|-------|-------|---------|------------------|------------------|
| 1 | `CheckZipCodeAndAddressAjaxAction` | CheckZipCodeAndAddressAjax | `CommonAjaxResources` | `/ajax/checkZipCodeAndAddressAjax.do` | `checkZipCodeAndAddressAjax.jsp` |
| 2 | `CommonAjaxResources` | CommonAjaxResources | `CommonResources` | `/ajax/commonAjaxResources.do` | `commonAjaxResources.jsp` |
| 3 | `CommonBulkRetailPriceAction` | CommonBulkRetailPrice | `CommonResources` | `/ajax/commonBulkRetailPrice.do` | `commonBulkRetailPrice.jsp` |
| 4 | `CommonCustomerAction` | CommonCustomer | `CommonAjaxResources` | `/ajax/commonCustomer.do` | `commonCustomer.jsp` |
| 5 | `CommonDeliveryAction` | CommonDelivery | `CommonAjaxResources` | `/ajax/commonDelivery.do` | `commonDelivery.jsp` |
| 6 | `CommonDepositAction` | CommonDeposit | `CommonAjaxResources` | `/ajax/commonDeposit.do` | `commonDeposit.jsp` |
| 7 | `CommonDiscountAction` | CommonDiscount | `CommonAjaxResources` | `/ajax/commonDiscount.do` | `commonDiscount.jsp` |
| 8 | `CommonPOrderAction` | CommonPOrder | `CommonResources` | `/ajax/commonPOrder.do` | `commonPOrder.jsp` |
| 9 | `CommonProductAction` | CommonProduct | `CommonAjaxResources` | `/ajax/commonProduct.do` | `commonProduct.jsp` |
| 10 | `CommonPurchaseAction` | CommonPurchase | `CommonResources` | `/ajax/commonPurchase.do` | `commonPurchase.jsp` |
| 11 | `CommonRackAction` | CommonRack | `CommonAjaxResources` | `/ajax/commonRack.do` | `commonRack.jsp` |
| 12 | `CommonRateAction` | CommonRate | `CommonAjaxResources` | `/ajax/commonRate.do` | `commonRate.jsp` |
| 13 | `CommonSupplierAction` | CommonSupplier | `CommonAjaxResources` | `/ajax/commonSupplier.do` | `commonSupplier.jsp` |
| 14 | `CommonTaxRateAction` | CommonTaxRate | `CommonResources` | `/ajax/commonTaxRate.do` | `commonTaxRate.jsp` |
| 15 | `CommonWarehouseAction` | CommonWarehouse | `CommonAjaxResources` | `/ajax/commonWarehouse.do` | `commonWarehouse.jsp` |
| 16 | `ConvertPaymentNameAjaxAction` | ConvertPaymentNameAjax | `CommonAjaxResources` | `/ajax/convertPaymentNameAjax.do` | `convertPaymentNameAjax.jsp` |
| 17 | `DispProductStockListAjaxAction` | DispProductStockListAjax | `CommonAjaxResources` | `/ajax/dispProductStockListAjax.do` | `dispProductStockListAjax.jsp` |
| 18 | `OutputBalanceListAjaxAction` | Xuất/In BalanceListAjax | `CommonAjaxResources` | `/ajax/outputBalanceListAjax.do` | `outputBalanceListAjax.jsp` |
| 19 | `OutputCustomerHistAjaxAction` | Xuất/In CustomerHistAjax | `CommonAjaxResources` | `/ajax/outputCustomerHistAjax.do` | `outputCustomerHistAjax.jsp` |
| 20 | `OutputProductHistAjaxAction` | Xuất/In ProductHistAjax | `CommonAjaxResources` | `/ajax/outputProductHistAjax.do` | `outputProductHistAjax.jsp` |
| 21 | `OutputRecommendListAjaxAction` | Xuất/In RecommendListAjax | `CommonAjaxResources` | `/ajax/outputRecommendListAjax.do` | `outputRecommendListAjax.jsp` |
| 22 | `OutputStockListAjaxAction` | Xuất/In StockListAjax | `CommonAjaxResources` | `/ajax/outputStockListAjax.do` | `outputStockListAjax.jsp` |
| 23 | `OutputStockReportAjaxAction` | Xuất/In StockReportAjax | `CommonAjaxResources` | `/ajax/outputStockReportAjax.do` | `outputStockReportAjax.jsp` |
| 24 | `ProductClassAjaxAction` | ProductClassAjax | `AbstractSearchResultAjaxAction` | `/ajax/productClassAjax.do` | `productClassAjax.jsp` |
| 25 | `ReferenceHistoryAjaxAction` | ReferenceHistoryAjax | `CommonAjaxResources` | `/ajax/referenceHistoryAjax.do` | `referenceHistoryAjax.jsp` |
| 26 | `ReferenceMstAjaxAction` | ReferenceMstAjax | `CommonAjaxResources` | `/ajax/referenceMstAjax.do` | `referenceMstAjax.jsp` |
| 27 | `MakeOutBillAjaxAction` | Tạo OutBillAjax | `AbstractSearchResultAjaxAction` | `/ajax/makeOutBillAjax.do` | `makeOutBillAjax.jsp` |
| 28 | `SearchBillResultAjaxAction` | Tìm kiếm BillResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchBillResultAjax.do` | `searchBillResultAjax.jsp` |
| 29 | `SearchCloseBillResultAjaxAction` | Tìm kiếm CloseBillResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchCloseBillResultAjax.do` | `searchCloseBillResultAjax.jsp` |
| 30 | `ImportBankDepositAjaxAction` | Import BankDepositAjax | `CommonAjaxResources` | `/ajax/importBankDepositAjax.do` | `importBankDepositAjax.jsp` |
| 31 | `ImportDeliveryDepositAjaxAction` | Import DeliveryDepositAjax | `CommonAjaxResources` | `/ajax/importDeliveryDepositAjax.do` | `importDeliveryDepositAjax.jsp` |
| 32 | `SearchDepositResultAjaxAction` | Tìm kiếm DepositResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchDepositResultAjax.do` | `searchDepositResultAjax.jsp` |
| 33 | `CopySlipDialogAction` | CopySlipDialog | `AbstractDialogAction` | `/ajax/copySlipDialog.do` | `copySlipDialog.jsp` |
| 34 | `DetailDispSettingDialogAction` | DetailDispSettingDialog | `AbstractDialogAction` | `/ajax/detailDispSettingDialog.do` | `detailDispSettingDialog.jsp` |
| 35 | `MasterDefaultSettingDialogAction` | MasterDefaultSettingDialog | `AbstractDialogAction` | `/ajax/masterDefaultSettingDialog.do` | `masterDefaultSettingDialog.jsp` |
| 36 | `ReferFilesDialogAction` | ReferFilesDialog | `AbstractDialogAction` | `/ajax/referFilesDialog.do` | `referFilesDialog.jsp` |
| 37 | `SearchCustomerDialogAction` | Tìm kiếm CustomerDialog | `AbstractSearchDialogAction` | `/ajax/searchCustomerDialog.do` | `searchCustomerDialog.jsp` |
| 38 | `SearchDiscountDialogAction` | Tìm kiếm DiscountDialog | `AbstractSearchDialogAction` | `/ajax/searchDiscountDialog.do` | `searchDiscountDialog.jsp` |
| 39 | `SearchProductDialogAction` | Tìm kiếm ProductDialog | `AbstractSearchDialogAction` | `/ajax/searchProductDialog.do` | `searchProductDialog.jsp` |
| 40 | `SearchRackDialogAction` | Tìm kiếm RackDialog | `AbstractSearchDialogAction` | `/ajax/searchRackDialog.do` | `searchRackDialog.jsp` |
| 41 | `SearchSupplierDialogAction` | Tìm kiếm SupplierDialog | `AbstractSearchDialogAction` | `/ajax/searchSupplierDialog.do` | `searchSupplierDialog.jsp` |
| 42 | `SearchUserDialogAction` | Tìm kiếm UserDialog | `AbstractSearchDialogAction` | `/ajax/searchUserDialog.do` | `searchUserDialog.jsp` |
| 43 | `SearchWarehouseDialogAction` | Tìm kiếm WarehouseDialog | `AbstractSearchDialogAction` | `/ajax/searchWarehouseDialog.do` | `searchWarehouseDialog.jsp` |
| 44 | `SearchZipCodeDialogAction` | Tìm kiếm ZipCodeDialog | `AbstractSearchDialogAction` | `/ajax/searchZipCodeDialog.do` | `searchZipCodeDialog.jsp` |
| 45 | `ShowCategoryDialogAction` | ShowCategoryDialog | `AbstractDialogAction` | `/ajax/showCategoryDialog.do` | `showCategoryDialog.jsp` |
| 46 | `ShowProductInfoDialogAction` | ShowProductInfoDialog | `CommonAjaxResources` | `/ajax/showProductInfoDialog.do` | `showProductInfoDialog.jsp` |
| 47 | `ShowStockInfoDialogAction` | ShowStockInfoDialog | `AbstractDialogAction` | `/ajax/showStockInfoDialog.do` | `showStockInfoDialog.jsp` |
| 48 | `CheckEstimateSheetAction` | CheckEstimateSheet | `CommonAjaxResources` | `/ajax/checkEstimateSheet.do` | `checkEstimateSheet.jsp` |
| 49 | `SearchEstimateResultAjaxAction` | Tìm kiếm EstimateResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchEstimateResultAjax.do` | `searchEstimateResultAjax.jsp` |
| 50 | `DeleteBankAjaxAction` | Xóa BankAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteBankAjax.do` | `deleteBankAjax.jsp` |
| 51 | `DeleteCustomerAjaxAction` | Xóa CustomerAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteCustomerAjax.do` | `deleteCustomerAjax.jsp` |
| 52 | `DeleteCustomerRankAjaxAction` | Xóa CustomerRankAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteCustomerRankAjax.do` | `deleteCustomerRankAjax.jsp` |
| 53 | `DeleteDiscountAjaxAction` | Xóa DiscountAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteDiscountAjax.do` | `deleteDiscountAjax.jsp` |
| 54 | `DeleteProductAjaxAction` | Xóa ProductAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteProductAjax.do` | `deleteProductAjax.jsp` |
| 55 | `DeleteProductClassAjaxAction` | Xóa ProductClassAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteProductClassAjax.do` | `deleteProductClassAjax.jsp` |
| 56 | `DeleteRackAjaxAction` | Xóa RackAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteRackAjax.do` | `deleteRackAjax.jsp` |
| 57 | `DeleteRateAjaxAction` | Xóa RateAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteRateAjax.do` | `deleteRateAjax.jsp` |
| 58 | `DeleteSupplierAjaxAction` | Xóa SupplierAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteSupplierAjax.do` | `deleteSupplierAjax.jsp` |
| 59 | `DeleteWarehouseAjaxAction` | Xóa WarehouseAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteWarehouseAjax.do` | `deleteWarehouseAjax.jsp` |
| 60 | `SearchBankAjaxAction` | Tìm kiếm BankAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchBankAjax.do` | `searchBankAjax.jsp` |
| 61 | `SearchCustomerAjaxAction` | Tìm kiếm CustomerAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchCustomerAjax.do` | `searchCustomerAjax.jsp` |
| 62 | `SearchCustomerRankAjaxAction` | Tìm kiếm CustomerRankAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchCustomerRankAjax.do` | `searchCustomerRankAjax.jsp` |
| 63 | `SearchDiscountAjaxAction` | Tìm kiếm DiscountAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchDiscountAjax.do` | `searchDiscountAjax.jsp` |
| 64 | `SearchProductAjaxAction` | Tìm kiếm ProductAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchProductAjax.do` | `searchProductAjax.jsp` |
| 65 | `SearchProductClassAjaxAction` | Tìm kiếm ProductClassAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchProductClassAjax.do` | `searchProductClassAjax.jsp` |
| 66 | `SearchProductSetAjaxAction` | Tìm kiếm ProductSetAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchProductSetAjax.do` | `searchProductSetAjax.jsp` |
| 67 | `SearchRackAjaxAction` | Tìm kiếm RackAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchRackAjax.do` | `searchRackAjax.jsp` |
| 68 | `SearchRateAjaxAction` | Tìm kiếm RateAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchRateAjax.do` | `searchRateAjax.jsp` |
| 69 | `SearchSupplierAjaxAction` | Tìm kiếm SupplierAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchSupplierAjax.do` | `searchSupplierAjax.jsp` |
| 70 | `SearchWarehouseAjaxAction` | Tìm kiếm WarehouseAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchWarehouseAjax.do` | `searchWarehouseAjax.jsp` |
| 71 | `SearchZipCodeAjaxAction` | Tìm kiếm ZipCodeAjax | `CommonAjaxResources` | `/ajax/searchZipCodeAjax.do` | `searchZipCodeAjax.jsp` |
| 72 | `SearchPaymentResultAjaxAction` | Tìm kiếm PaymentResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchPaymentResultAjax.do` | `searchPaymentResultAjax.jsp` |
| 73 | `MakeOutPOrderAjaxAction` | Tạo OutPOrderAjax | `AbstractSearchResultAjaxAction` | `/ajax/makeOutPOrderAjax.do` | `makeOutPOrderAjax.jsp` |
| 74 | `SearchPOrderResultAjaxAction` | Tìm kiếm POrderResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchPOrderResultAjax.do` | `searchPOrderResultAjax.jsp` |
| 75 | `SearchPurchaseResultAjaxAction` | Tìm kiếm PurchaseResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchPurchaseResultAjax.do` | `searchPurchaseResultAjax.jsp` |
| 76 | `ImportOnlineOrderResultAjaxAction` | Import OnlineOrderResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/importOnlineOrderResultAjax.do` | `importOnlineOrderResultAjax.jsp` |
| 77 | `SearchROrderResultAjaxAction` | Tìm kiếm ROrderResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchROrderResultAjax.do` | `searchROrderResultAjax.jsp` |
| 78 | `SearchOutputInvoiceAjaxAction` | Tìm kiếm OutputInvoiceAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchOutputInvoiceAjax.do` | `searchOutputInvoiceAjax.jsp` |
| 79 | `SearchOutputSalesReportAjaxAction` | Tìm kiếm OutputSalesReportAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchOutputSalesReportAjax.do` | `searchOutputSalesReportAjax.jsp` |
| 80 | `SearchSalesResultAjaxAction` | Tìm kiếm SalesResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchSalesResultAjax.do` | `searchSalesResultAjax.jsp` |
| 81 | `DeleteDeptAjaxAction` | Xóa DeptAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteDeptAjax.do` | `deleteDeptAjax.jsp` |
| 82 | `DeleteFileAjaxAction` | Xóa FileAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteFileAjax.do` | `deleteFileAjax.jsp` |
| 83 | `DeleteUserAjaxAction` | Xóa UserAjax | `AbstractDeleteAjaxAction` | `/ajax/deleteUserAjax.do` | `deleteUserAjax.jsp` |
| 84 | `SearchDeptResultAjaxAction` | Tìm kiếm DeptResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchDeptResultAjax.do` | `searchDeptResultAjax.jsp` |
| 85 | `SearchFileResultAjaxAction` | Tìm kiếm FileResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchFileResultAjax.do` | `searchFileResultAjax.jsp` |
| 86 | `SearchUserResultAjaxAction` | Tìm kiếm UserResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchUserResultAjax.do` | `searchUserResultAjax.jsp` |
| 87 | `SearchEntrustStockResultAjaxAction` | Tìm kiếm EntrustStockResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchEntrustStockResultAjax.do` | `searchEntrustStockResultAjax.jsp` |
| 88 | `SearchStockResultAjaxAction` | Tìm kiếm StockResultAjax | `AbstractSearchResultAjaxAction` | `/ajax/searchStockResultAjax.do` | `searchStockResultAjax.jsp` |

---
## 3. Tổng hợp số lượng (theo source thực tế)
| Module | Actions | Views |
|--------|---------|-------|
| master | 32 | 33 |
| sales | 8 | 8 |
| bill | 6 | 6 |
| deposit | 5 | 6 |
| stock | 12 | 14 |
| estimate | 5 | 6 |
| rorder | 4 | 5 |
| porder | 6 | 7 |
| purchase | 3 | 4 |
| payment | 4 | 5 |
| report | 3 | 3 |
| setting | 13 | 13 |
| ajax | 88 | 93 |
| **TOTAL** | **194** | **212** |

---
*Generated from SalesCube source analysis*
