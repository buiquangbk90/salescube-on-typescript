# SalesCube - Screen Inventory (Danh sách Màn hình)
> Liệt kê toàn bộ màn hình JSP từ source code.
> **Source:** `/Users/peocandy/Project/salescube-on-typescript/SalesCube/WEB/SalesCube/src/main/webapp/WEB-INF/view/`

---
## 1. Tổng quan View Structure
```
ajax/           (93 files)
bill/           (6 files)
common/           (7 files)
deposit/           (6 files)
estimate/           (6 files)
login/           (1 files)
master/           (33 files)
menu/           (1 files)
payment/           (5 files)
porder/           (7 files)
purchase/           (4 files)
report/           (3 files)
rorder/           (5 files)
sales/           (8 files)
setting/           (13 files)
stock/           (14 files)
```
**Total: 212 JSP files**

---

## 2. AJAX (93 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `ajax/bill/makeOutBillAjax/result.jsp` | - |
| 2 | `ajax/bill/searchBillResultAjax/result.jsp` | - |
| 3 | `ajax/bill/searchCloseBillResultAjax/result.jsp` | - |
| 4 | `ajax/deposit/importBankDepositAjax/excel.jsp` | - |
| 5 | `ajax/deposit/importBankDepositAjax/searchResultList.jsp` | - |
| 6 | `ajax/deposit/importBankDepositAjax/searchResultListExls.jsp` | - |
| 7 | `ajax/deposit/importDeliveryDepositAjax/excel.jsp` | - |
| 8 | `ajax/deposit/importDeliveryDepositAjax/searchResultList.jsp` | - |
| 9 | `ajax/deposit/importDeliveryDepositAjax/searchResultListExls.jsp` | - |
| 10 | `ajax/deposit/searchDepositResultAjax/result.jsp` | - |
| 11 | `ajax/dialog/copySlipDialog/dialog.jsp` | - |
| 12 | `ajax/dialog/copySlipDialog/result/deposit.jsp` | - |
| 13 | `ajax/dialog/copySlipDialog/result/entrustPorder.jsp` | - |
| 14 | `ajax/dialog/copySlipDialog/result/estimate.jsp` | - |
| 15 | `ajax/dialog/copySlipDialog/result/porder.jsp` | - |
| 16 | `ajax/dialog/copySlipDialog/result/rorder.jsp` | - |
| 17 | `ajax/dialog/copySlipDialog/result/sales.jsp` | - |
| 18 | `ajax/dialog/copySlipDialog/result/supplier.jsp` | - |
| 19 | `ajax/dialog/copySlipDialog/slip/deposit.jsp` | - |
| 20 | `ajax/dialog/copySlipDialog/slip/entrustPorder.jsp` | - |
| 21 | `ajax/dialog/copySlipDialog/slip/estimate.jsp` | - |
| 22 | `ajax/dialog/copySlipDialog/slip/porder.jsp` | - |
| 23 | `ajax/dialog/copySlipDialog/slip/rorder.jsp` | - |
| 24 | `ajax/dialog/copySlipDialog/slip/sales.jsp` | - |
| 25 | `ajax/dialog/copySlipDialog/slip/supplier.jsp` | - |
| 26 | `ajax/dialog/detailDispSettingDialog/dialog.jsp` | - |
| 27 | `ajax/dialog/masterDefaultSettingDialog/dialog.jsp` | - |
| 28 | `ajax/dialog/referFilesDialog/dialog.jsp` | - |
| 29 | `ajax/dialog/searchCustomerDialog/dialog.jsp` | - |
| 30 | `ajax/dialog/searchCustomerDialog/result.jsp` | - |
| 31 | `ajax/dialog/searchDiscountDialog/dialog.jsp` | - |
| 32 | `ajax/dialog/searchDiscountDialog/result.jsp` | - |
| 33 | `ajax/dialog/searchProductDialog/dialog.jsp` | - |
| 34 | `ajax/dialog/searchProductDialog/result.jsp` | - |
| 35 | `ajax/dialog/searchRackDialog/dialog.jsp` | - |
| 36 | `ajax/dialog/searchRackDialog/result.jsp` | - |
| 37 | `ajax/dialog/searchSupplierDialog/dialog.jsp` | - |
| 38 | `ajax/dialog/searchSupplierDialog/result.jsp` | - |
| 39 | `ajax/dialog/searchUserDialog/dialog.jsp` | - |
| 40 | `ajax/dialog/searchUserDialog/result.jsp` | - |
| 41 | `ajax/dialog/searchWarehouseDialog/dialog.jsp` | - |
| 42 | `ajax/dialog/searchWarehouseDialog/result.jsp` | - |
| 43 | `ajax/dialog/searchZipCodeDialog/dialog.jsp` | - |
| 44 | `ajax/dialog/searchZipCodeDialog/result.jsp` | - |
| 45 | `ajax/dialog/showCategoryDialog/dialog.jsp` | - |
| 46 | `ajax/dialog/showProductInfoDialog/dialog.jsp` | - |
| 47 | `ajax/dialog/showStockInfoDialog/dialog.jsp` | - |
| 48 | `ajax/errorResponse.jsp` | - |
| 49 | `ajax/estimate/searchEstimateResultAjax/result.jsp` | - |
| 50 | `ajax/master/searchBankAjax/result.jsp` | - |
| 51 | `ajax/master/searchCustomerAjax/result.jsp` | - |
| 52 | `ajax/master/searchCustomerRankAjax/result.jsp` | - |
| 53 | `ajax/master/searchDiscountAjax/result.jsp` | - |
| 54 | `ajax/master/searchProductAjax/result.jsp` | - |
| 55 | `ajax/master/searchProductClassAjax/result.jsp` | - |
| 56 | `ajax/master/searchProductSetAjax/result.jsp` | - |
| 57 | `ajax/master/searchRackAjax/result.jsp` | - |
| 58 | `ajax/master/searchRateAjax/result.jsp` | - |
| 59 | `ajax/master/searchSupplierAjax/result.jsp` | - |
| 60 | `ajax/master/searchWarehouseAjax/result.jsp` | - |
| 61 | `ajax/outputBalanceListAjax/excel.jsp` | - |
| 62 | `ajax/outputBalanceListAjax/searchResultList.jsp` | - |
| 63 | `ajax/outputCustomerHistAjax/excel.jsp` | - |
| 64 | `ajax/outputCustomerHistAjax/searchResultList.jsp` | - |
| 65 | `ajax/outputProductHistAjax/excel.jsp` | - |
| 66 | `ajax/outputProductHistAjax/searchResultList.jsp` | - |
| 67 | `ajax/outputRecommendListAjax/excel.jsp` | - |
| 68 | `ajax/outputRecommendListAjax/searchResultList.jsp` | - |
| 69 | `ajax/outputStockListAjax/excel.jsp` | - |
| 70 | `ajax/outputStockListAjax/outputResultList.jsp` | - |
| 71 | `ajax/outputStockListAjax/outputStockListResult.jsp` | - |
| 72 | `ajax/outputStockReportAjax/excel.jsp` | - |
| 73 | `ajax/outputStockReportAjax/outputResultList.jsp` | - |
| 74 | `ajax/outputStockReportAjax/outputStockReportResult.jsp` | - |
| 75 | `ajax/payment/searchPaymentResultAjax/result.jsp` | - |
| 76 | `ajax/porder/makeOutPOrderAjax/result.jsp` | - |
| 77 | `ajax/porder/searchPOrderResultAjax/result.jsp` | - |
| 78 | `ajax/purchase/searchPurchaseResultAjax/result.jsp` | - |
| 79 | `ajax/referenceHistoryAjax/excel.jsp` | - |
| 80 | `ajax/referenceHistoryAjax/searchResultList.jsp` | - |
| 81 | `ajax/referenceMstAjax/excel.jsp` | - |
| 82 | `ajax/referenceMstAjax/searchResultList.jsp` | - |
| 83 | `ajax/rorder/importOnlineOrderResultAjax/result.jsp` | - |
| 84 | `ajax/rorder/searchROrderResultAjax/result.jsp` | - |
| 85 | `ajax/sales/searchOutputInvoiceAjax/outputDummy.jsp` | - |
| 86 | `ajax/sales/searchOutputInvoiceAjax/result.jsp` | - |
| 87 | `ajax/sales/searchOutputSalesReportAjax/result.jsp` | - |
| 88 | `ajax/sales/searchSalesResultAjax/result.jsp` | - |
| 89 | `ajax/setting/searchDeptResultAjax/result.jsp` | - |
| 90 | `ajax/setting/searchFileResultAjax/result.jsp` | - |
| 91 | `ajax/setting/searchUserResultAjax/result.jsp` | - |
| 92 | `ajax/stock/searchEntrustStockResultAjax/result.jsp` | - |
| 93 | `ajax/stock/searchStockResultAjax/result.jsp` | - |

## 2. BILL (6 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `bill/closeArtBalance/closeArtBalance.jsp` | - |
| 2 | `bill/closeBill/closeBill.jsp` | - |
| 3 | `bill/makeOutBill/search.jsp` | - |
| 4 | `bill/searchBill/search.jsp` | - |
| 5 | `bill/searchBillResultOutput/excel.jsp` | - |
| 6 | `bill/searchBillResultOutput/resultList.jsp` | - |

## 2. COMMON (7 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `common/common.jsp` | - |
| 2 | `common/error.jsp` | - |
| 3 | `common/footer.jsp` | - |
| 4 | `common/header.jsp` | - |
| 5 | `common/menubar.jsp` | - |
| 6 | `common/rowcount.jsp` | - |
| 7 | `common/titlebar.jsp` | - |

## 2. DEPOSIT (6 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `deposit/importBankDeposit/importBankDeposit.jsp` | - |
| 2 | `deposit/importDeliveryDeposit/importDeliveryDeposit.jsp` | - |
| 3 | `deposit/inputDeposit/inputDeposit.jsp` | - |
| 4 | `deposit/searchDeposit/search.jsp` | - |
| 5 | `deposit/searchDepositResultOutput/excel.jsp` | - |
| 6 | `deposit/searchDepositResultOutput/resultList.jsp` | - |

## 2. ESTIMATE (6 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `estimate/dispProductPriceList/dispProductPriceList.jsp` | - |
| 2 | `estimate/inputEstimate/inputEstimate.jsp` | - |
| 3 | `estimate/searchEstimate/dispProductPriceList.jsp` | - |
| 4 | `estimate/searchEstimate/search.jsp` | - |
| 5 | `estimate/searchEstimateResultOutput/excel.jsp` | - |
| 6 | `estimate/searchEstimateResultOutput/resultList.jsp` | - |

## 2. LOGIN (1 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `login/login.jsp` | - |

## 2. MASTER (33 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `master/editBank/editBank.jsp` | - |
| 2 | `master/editCategory/editCategory.jsp` | - |
| 3 | `master/editCustomer/editCustomer.jsp` | - |
| 4 | `master/editCustomerRank/editCustomerRank.jsp` | - |
| 5 | `master/editDiscount/editDiscount.jsp` | - |
| 6 | `master/editProduct/editProduct.jsp` | - |
| 7 | `master/editProductClass/editProductClass.jsp` | - |
| 8 | `master/editProductSet/editProductSet.jsp` | - |
| 9 | `master/editRack/editRack.jsp` | - |
| 10 | `master/editRate/editRate.jsp` | - |
| 11 | `master/editSupplier/editSupplier.jsp` | - |
| 12 | `master/editTaxRate/editTaxRate.jsp` | - |
| 13 | `master/editWarehouse/editWarehouse.jsp` | - |
| 14 | `master/importZipCodeCSV/importZipCodeCSV.jsp` | - |
| 15 | `master/searchBank/search.jsp` | - |
| 16 | `master/searchCategory/search.jsp` | - |
| 17 | `master/searchCustomer/search.jsp` | - |
| 18 | `master/searchCustomerRank/search.jsp` | - |
| 19 | `master/searchCustomerRankResultOutput/excel.jsp` | - |
| 20 | `master/searchCustomerRankResultOutput/summary.jsp` | - |
| 21 | `master/searchDiscount/search.jsp` | - |
| 22 | `master/searchProduct/search.jsp` | - |
| 23 | `master/searchProductClass/search.jsp` | - |
| 24 | `master/searchProductSet/search.jsp` | - |
| 25 | `master/searchRack/search.jsp` | - |
| 26 | `master/searchRackResultOutput/excel.jsp` | - |
| 27 | `master/searchRackResultOutput/resultList.jsp` | - |
| 28 | `master/searchRate/search.jsp` | - |
| 29 | `master/searchSupplier/search.jsp` | - |
| 30 | `master/searchTaxRate/search.jsp` | - |
| 31 | `master/searchWarehouse/search.jsp` | - |
| 32 | `master/searchWarehouseResultOutput/excel.jsp` | - |
| 33 | `master/searchWarehouseResultOutput/resultList.jsp` | - |

## 2. MENU (1 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `menu/menu.jsp` | - |

## 2. PAYMENT (5 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `payment/closePayment/closePayment.jsp` | - |
| 2 | `payment/inputPayment/inputPayment.jsp` | - |
| 3 | `payment/searchPayment/search.jsp` | - |
| 4 | `payment/searchPaymentResultOutput/excel.jsp` | - |
| 5 | `payment/searchPaymentResultOutput/resultList.jsp` | - |

## 2. PORDER (7 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `porder/inputPOrder/inputPOrder.jsp` | - |
| 2 | `porder/makeOutPOrder/search.jsp` | - |
| 3 | `porder/outputRecommendList/orderResult.jsp` | - |
| 4 | `porder/outputRecommendList/outputRecommendList.jsp` | - |
| 5 | `porder/searchPOrder/search.jsp` | - |
| 6 | `porder/searchPOrderResultOutput/excel.jsp` | - |
| 7 | `porder/searchPOrderResultOutput/resultList.jsp` | - |

## 2. PURCHASE (4 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `purchase/inputPurchase/inputPurchase.jsp` | - |
| 2 | `purchase/searchPurchase/search.jsp` | - |
| 3 | `purchase/searchPurchaseResultOutput/excel.jsp` | - |
| 4 | `purchase/searchPurchaseResultOutput/resultList.jsp` | - |

## 2. REPORT (3 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `report/outputBalanceList/outputBalanceList.jsp` | - |
| 2 | `report/referenceHistory/referenceHistory.jsp` | - |
| 3 | `report/referenceMst/referenceMst.jsp` | - |

## 2. RORDER (5 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `rorder/importOnlineOrder/importOnlineOrder.jsp` | - |
| 2 | `rorder/inputROrder/inputROrder.jsp` | - |
| 3 | `rorder/searchROrder/search.jsp` | - |
| 4 | `rorder/searchROrderResultOutput/excel.jsp` | - |
| 5 | `rorder/searchROrderResultOutput/resultList.jsp` | - |

## 2. SALES (8 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `sales/inputSales/inputSales.jsp` | - |
| 2 | `sales/outputInvoice/search.jsp` | - |
| 3 | `sales/outputInvoiceResult/excel.jsp` | - |
| 4 | `sales/outputInvoiceResult/resultList.jsp` | - |
| 5 | `sales/outputSalesReport/search.jsp` | - |
| 6 | `sales/searchSales/search.jsp` | - |
| 7 | `sales/searchSalesResultOutput/excel.jsp` | - |
| 8 | `sales/searchSalesResultOutput/resultList.jsp` | - |

## 2. SETTING (13 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `setting/changePassword/changePassword.jsp` | - |
| 2 | `setting/company/company.jsp` | - |
| 3 | `setting/editDept/editDept.jsp` | - |
| 4 | `setting/editFileUpload/editFileUpload.jsp` | - |
| 5 | `setting/editUser/editUser.jsp` | - |
| 6 | `setting/editUser/editUserRole.jsp` | - |
| 7 | `setting/news/news.jsp` | - |
| 8 | `setting/searchDept/search.jsp` | - |
| 9 | `setting/searchFileUpload/search.jsp` | - |
| 10 | `setting/searchUser/search.jsp` | - |
| 11 | `setting/setCategory/inputCategory.jsp` | - |
| 12 | `setting/setSecurity/setSecurity.jsp` | - |
| 13 | `setting/stock/stock.jsp` | - |

## 2. STOCK (14 files)
| # | JSP File | Mô tả |
|----|----------|-------|
| 1 | `stock/closeStock/closeStock.jsp` | - |
| 2 | `stock/dispProductStockList/dispProductStockList.jsp` | - |
| 3 | `stock/dispProductStockList/dispStockInfo.jsp` | - |
| 4 | `stock/inputEntrustStock/inputEntrustStock.jsp` | - |
| 5 | `stock/inputStock/inputStock.jsp` | - |
| 6 | `stock/inputStockTransfer/inputStockTransfer.jsp` | - |
| 7 | `stock/outputStockList/outputStockList.jsp` | - |
| 8 | `stock/outputStockReport/outputStockReport.jsp` | - |
| 9 | `stock/searchEntrustStock/search.jsp` | - |
| 10 | `stock/searchEntrustStockResultOutput/excel.jsp` | - |
| 11 | `stock/searchEntrustStockResultOutput/resultList.jsp` | - |
| 12 | `stock/searchStock/search.jsp` | - |
| 13 | `stock/searchStockResultOutput/excel.jsp` | - |
| 14 | `stock/searchStockResultOutput/resultList.jsp` | - |

---
*Generated from SalesCube JSP analysis*
