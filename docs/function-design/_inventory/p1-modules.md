# Function Inventory — P1 Modules

> **Nguồn**: `output/cursor/workflows/WF-01..06`, `output/cursor/02-module-inventory.md`
> **Ngày**: 2026-06-23

---

## AUTH — Login & Authentication (WF-01)

| # | Function | Legacy Entry | Target Endpoint | FD File | Status |
|---|----------|-------------|-----------------|---------|--------|
| 1 | Hiển thị form login | `GET /login/index` | `GET /auth/login` | FD-AUTH-01-login.md | ✅ Generated |
| 2 | Xử lý đăng nhập | `POST /login/login` | `POST /auth/login` | FD-AUTH-01-login.md | ✅ Generated |
| 3 | Đăng xuất | `POST /login/logout` | `POST /auth/logout` | FD-AUTH-01-login.md | ✅ Generated |
| 4 | Đổi mật khẩu (redirect khi hết hạn) | Redirect từ login flow | `POST /auth/change-password` | FD-AUTH-02-change-password.md | ⚠️ Needs WF |

**Java classes**: `LoginAction.java`, `AbstractLoginCheckInterceptor.java`, `EncryptUtil.java`
**DB tables**: `USER_MST`, `MINE_MST`, `GRANT_ROLE`, `MENU_MST`

---

## CUST — Customer Management (WF-02)

| # | Function | Legacy Entry | Target Endpoint | FD File | Status |
|---|----------|-------------|-----------------|---------|--------|
| 1 | Tìm kiếm khách hàng | `POST /master/searchCustomer/find` | `GET /api/customers` | FD-CUST-01-search-customer.md | ✅ Generated |
| 2 | Tạo khách hàng mới | `POST /master/inputCustomer/register` (new) | `POST /api/customers` | FD-CUST-02-create-customer.md | ✅ Generated |
| 3 | Cập nhật khách hàng | `POST /master/inputCustomer/register` (edit) | `PUT /api/customers/:id` | FD-CUST-02-create-customer.md | ✅ Generated |
| 4 | Xóa mềm khách hàng | `POST /master/inputCustomer/delete` | `DELETE /api/customers/:id` | FD-CUST-03-delete-customer.md | ✅ Generated |
| 5 | Copy khách hàng | `GET /master/inputCustomer/copy` | `POST /api/customers/:id/copy` | ⚠️ Open Question | ❓ UNKNOWN |

**Java classes**: `CustomerMasterAction`, `CustomerService`, `CustomerHistoryService`, `CustomerRelService`
**DB tables**: `CUSTOMER_MST`, `CUSTOMER_MST_HIST`, `CUSTOMER_REL`, `SEQ_MAKER`

---

## RORDER — Receive Order (WF-03)

| # | Function | Legacy Entry | Target Endpoint | FD File | Status |
|---|----------|-------------|-----------------|---------|--------|
| 1 | Tìm kiếm đơn hàng | `GET /rorder/searchROrder/index` | `GET /api/receive-orders` | FD-RORDER-01-search-receive-order.md | ✅ Generated |
| 2 | Tạo đơn hàng mới | `POST /rorder/inputROrder/register` (new) | `POST /api/receive-orders` | FD-RORDER-02-create-receive-order.md | ✅ Generated |
| 3 | Cập nhật đơn hàng | `POST /rorder/inputROrder/register` (edit) | `PUT /api/receive-orders/:id` | FD-RORDER-02-create-receive-order.md | ✅ Generated |
| 4 | Hủy đơn hàng | `POST /rorder/inputROrder/cancel` | `POST /api/receive-orders/:id/cancel` | FD-RORDER-03-cancel-receive-order.md | ✅ Generated |
| 5 | Import EC online order | `GET /rorder/importOnlineOrder/index` | `POST /api/receive-orders/import-online` | FD-RORDER-04-import-online-order.md | ✅ Generated |

**Java classes**: `InputROrderAction`, `ImportOnlineOrderAction`, `RoSlipService`, `RoLineService`
**DB tables**: `RO_SLIP_TRN`, `RO_LINE_TRN`, `RO_SLIP_TRN_HIST`, `RO_LINE_TRN_HIST`, `ONLINE_ORDER_WORK`

---

## SALES — Sales Slip (WF-04)

| # | Function | Legacy Entry | Target Endpoint | FD File | Status |
|---|----------|-------------|-----------------|---------|--------|
| 1 | Tìm kiếm phiếu bán | `GET /sales/searchSales/index` | `GET /api/sales-orders` | FD-SALES-01-search-sales.md | ✅ Generated |
| 2 | Tạo phiếu bán từ RO | `GET /sales/inputSales/copy?copySlipName=RORDER` | `POST /api/sales-orders/from-receive-order` | FD-SALES-02-create-sales-from-ro.md | ✅ Generated |
| 3 | Tạo phiếu bán mới | `POST /sales/inputSales/register` (new) | `POST /api/sales-orders` | FD-SALES-02-create-sales-from-ro.md | ✅ Generated |
| 4 | Hủy phiếu bán | `POST /sales/inputSales/delete` | `POST /api/sales-orders/:id/cancel` | FD-SALES-03-cancel-sales.md | ✅ Generated |
| 5 | Xuất vận đơn | `GET /sales/outputInvoice/index` | `GET /api/sales-orders/:id/invoice` | ⚠️ Phase 2 scope | ❓ UNKNOWN |

**Java classes**: `InputSalesAction`, `SalesService`, `SalesLineService`, `InputStockSalesService`
**DB tables**: `SALES_SLIP_TRN`, `SALES_LINE_TRN`, `EAD_SLIP_TRN`, `PRODUCT_STOCK_TRN`

---

## BILL — Bill Closing (WF-05)

| # | Function | Legacy Entry | Target Endpoint | FD File | Status |
|---|----------|-------------|-----------------|---------|--------|
| 1 | Tìm kiếm KH để chốt | `POST /bill/closeBill/find` | `GET /api/billing/candidates` | FD-BILL-01-close-bill.md | ✅ Generated |
| 2 | Thực hiện chốt hóa đơn | `POST /bill/closeBill/close` | `POST /api/billing/close` | FD-BILL-01-close-bill.md | ✅ Generated |
| 3 | Mở lại hóa đơn | `POST /bill/closeBill/reopen` | `POST /api/billing/:id/reopen` | FD-BILL-01-close-bill.md | ✅ Generated |

**Java classes**: `CloseBillAction`, `BillService`, `BillAndArtService`, `YmService`
**DB tables**: `BILL_TRN`, `BILL_TRN_HIST`, `SALES_SLIP_TRN`, `CUSTOMER_MST`

---

## DEPOSIT — Deposit Entry (WF-06)

| # | Function | Legacy Entry | Target Endpoint | FD File | Status |
|---|----------|-------------|-----------------|---------|--------|
| 1 | Tạo phiếu thu tiền | `POST /deposit/inputDeposit/register` | `POST /api/deposits` | FD-DEPOSIT-01-create-deposit.md | ✅ Generated |
| 2 | Tìm kiếm phiếu thu | `GET /deposit/searchDeposit/index` | `GET /api/deposits` | FD-DEPOSIT-01-create-deposit.md | ✅ Generated |
| 3 | Import sao kê ngân hàng | `GET /deposit/importBankDeposit/index` | `POST /api/deposits/import-bank` | FD-DEPOSIT-02-import-bank-deposit.md | ✅ Generated |
| 4 | Import COD (shipper) | `GET /deposit/importDeliveryDeposit/index` | `POST /api/deposits/import-delivery` | FD-DEPOSIT-02-import-bank-deposit.md | ✅ Generated |

**Java classes**: `InputDepositAction`, `ImportBankDepositAction`, `DepositSlipService`
**DB tables**: `DEPOSIT_SLIP_TRN`, `DEPOSIT_LINE_TRN`, `BILL_TRN`, `BANK_DEPOSIT_REL`
