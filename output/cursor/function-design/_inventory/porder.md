# Function Inventory: PORDER (発注 – Purchase Order)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md), [02-module-inventory.md](../02-module-inventory.md), [WF-07](../workflows/WF-07-purchase-order.md)

| Legacy Action | Method (typical) | Legacy URL | MENU_ID | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|---------|---------------|------|-------------|--------|
| `InputPOrderAction` | `index()` | `/porder/inputPOrder/index` | 0700 | dropdowns | SCREEN_ENTRY | FD-PORDER-01 § create | Documented |
| `InputPOrderAction` | `edit()` | `/porder/inputPOrder/edit/{id}` | 0700 | load PO | SCREEN_ENTRY | FD-PORDER-01 § edit | LEGACY_CONFIRMED |
| `InputPOrderAction` | `register()` | `/porder/inputPOrder/register` | 0700 | `InputPOrderSlipService` | CREATE/UPDATE | FD-PORDER-01 | LEGACY_CONFIRMED |
| `InputPOrderAction` | `delete()` | `/porder/inputPOrder/delete` | 0700 | soft-delete | CANCEL_OR_STATUS | FD-PORDER-01 § delete | LEGACY_CONFIRMED |
| `SearchPOrderAction` | `index()` / `find()` | `/porder/searchPOrder` | 0701 | search | LIST_SEARCH | FD-PORDER-02 (planned) | Planned |
| `OutputRecommendListAction` | `index()` | `/porder/outputRecommendList` | 0704 | stock analysis | LIST_SEARCH | FD-PORDER-03 (planned) | Planned |
| `MakeOutPOrderAction` | `index()` | `/porder/makeOutPOrder` | 0702 | JasperReports | REPORT_EXPORT | FD-PORDER-04 (planned) | Planned |

**Lưu ý:** FD-PORDER-01 chỉ scope nhập/sửa/xóa phiếu đặt hàng (`InputPOrderAction`); không gồm recommend list hay in PDF.
