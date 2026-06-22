# SalesCube Migration Map (Bản đồ Migration)
> Mapping từ SalesCube Legacy (Java/S2Struts) sang kiến trúc TypeScript hiện đại. Dựa trên phân tích source thực tế.
> **Legacy Source:** `/Users/peocandy/Project/salescube-on-typescript/SalesCube`

---
## 1. Legacy Architecture (thực tế từ source)
```
SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/
├── action/           (194 classes) - Struts/S2Struts Actions
├── service/          (106 classes) - Business services
├── entity/           (76 classes)  - JPA entities
├── dto/              (106 classes) - DTOs
├── form/             (136 classes) - Action forms
├── common/           (21 items)    - Constants, utils
└── webapp/WEB-INF/view/ (212 JSP)  - UI
```

## 2. Module Mapping (Legacy -> TypeScript)
| Module | Legacy Actions | Legacy Views | TypeScript Backend | TypeScript Frontend | Priority |
|--------|----------------|--------------|--------------------|---------------------|----------|
| master | 32 | 33 | customers, products, suppliers, ... | customers, products, suppliers, ... | P1 |
| sales | 8 | 8 | sales-orders | sales-orders | P1 |
| bill | 6 | 6 | invoices | invoices | P1 |
| deposit | 5 | 6 | deposits | deposits | P1 |
| stock | 12 | 14 | stock-movements | stock-movements | P2 |
| estimate | 5 | 6 | estimates | estimates | P2 |
| rorder | 4 | 5 | rorders | rorders | P2 |
| porder | 6 | 7 | porders | porders | P3 |
| purchase | 3 | 4 | purchases | purchases | P3 |
| payment | 4 | 5 | payments | payments | P3 |
| report | 3 | 3 | reports | reports | P2 |
| setting | 13 | 13 | settings | settings | P2 |

## 3. Database Mapping (Legacy -> Prisma)
| Legacy Table (logic) | Legacy Entity | Prisma Model | Notes |
|----------------------|---------------|--------------|-------|
| `CUSTOMER_MST` | `Customer` | `Customer` | - |
| `PRODUCT_MST` | `Product` | `Product` | - |
| `USER_MST` | `User` | `User` | - |
| `SUPPLIER_MST` | `Supplier` | `Supplier` | - |
| `RACK_MST` | `Rack` | `Rack` | - |
| `WAREHOUSE_MST` | `Warehouse` | `Warehouse` | - |
| `BANK_MST` | `Bank` | `Bank` | - |
| `TAX_RATE_MST` | `TaxRate` | `TaxRate` | - |
| `CATEGORY_MST` | `Category` | `Category` | - |
| `SALES_SLIP_TRN` | `SalesSlipTrn` | `SalesOrder` | - |
| `SALES_LINE_TRN` | `SalesLineTrn` | `SalesLine` | - |
| `BILL_TRN` | `Bill` | `Invoice` | - |
| `DEPOSIT_SLIP_TRN` | `DepositSlip` | `Deposit` | - |
| `DEPOSIT_LINE_TRN` | `DepositLine` | `DepositLine` | - |
| `RO_SLIP_TRN` | `RoSlipTrn` | `RoOrder` | - |
| `RO_LINE_TRN` | `RoLineTrn` | `RoLine` | - |
| `PO_SLIP_TRN` | `PoSlipTrn` | `PoOrder` | - |
| `PO_LINE_TRN` | `PoLineTrn` | `PoLine` | - |
| `EAD_SLIP_TRN` | `EadSlipTrn` | `EadOrder` | - |
| `EAD_LINE_TRN` | `EadLineTrn` | `EadLine` | - |

## 4. Characterization Test Plan
| # | Logic | Mức độ quan trọng |
|----|-------|-------------------|
| 1 | Tính thuế 8%/10% và cách tính 内税/外税 | CRITICAL |
| 2 | Làm tròn tiền/thuế (切捨て/四捨五入/切り上げ) | CRITICAL |
| 3 | Chốt kỳ (締処理) và tạo hóa đơn hàng loạt | CRITICAL |
| 4 | Gạch nợ (消込) | CRITICAL |
| 5 | Tính GM và cập nhật tồn kho | HIGH |
| 6 | Tính số dư công nợ (rolling balance) | HIGH |

---
*Generated from SalesCube source analysis*
