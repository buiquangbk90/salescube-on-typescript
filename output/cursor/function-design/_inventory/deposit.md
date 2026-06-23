# Function Inventory: DEPOSIT (入金 – Deposit)

> **Nguồn:** [03-route-api-inventory.md](../03-route-api-inventory.md), [02-module-inventory.md](../02-module-inventory.md), [WF-06](../workflows/WF-06-deposit-entry.md), [WF-11](../workflows/WF-11-bank-deposit-import.md)

| Legacy Action | Method (typical) | Legacy URL | MENU_ID | Service Calls | Type | Proposed FD | Status |
|---------------|------------------|------------|---------|---------------|------|-------------|--------|
| `InputDepositAction` | `index()` | `/deposit/inputDeposit/index` | 0600 | dropdowns | SCREEN_ENTRY | FD-DEPOSIT-01 § create | Documented |
| `InputDepositAction` | `edit()` | `/deposit/inputDeposit/edit/{id}` | 0600 | load slip | SCREEN_ENTRY | FD-DEPOSIT-01 § edit | LEGACY_CONFIRMED |
| `InputDepositAction` | `register()` | `/deposit/inputDeposit/register` | 0600 | `DepositSlipService` | CREATE/UPDATE | FD-DEPOSIT-01 | LEGACY_CONFIRMED |
| `InputDepositAction` | `delete()` | `/deposit/inputDeposit/delete` | 0600 | soft-delete | CANCEL_OR_STATUS | FD-DEPOSIT-01 § delete | LEGACY_CONFIRMED |
| `SearchDepositAction` | `index()` / `find()` | `/deposit/searchDeposit` | 0601 | search | LIST_SEARCH | FD-DEPOSIT-01 § search | LEGACY_CONFIRMED |
| `ImportBankDepositAction` | `upload()` | `/deposit/importBankDeposit/upload` | 0604 | `BankDepositWorkService` | IMPORT | FD-DEPOSIT-02 § bank upload | Documented |
| `ImportBankDepositAction` | `update()` | `/deposit/importBankDeposit/update` | 0604 | match + create deposit | IMPORT | FD-DEPOSIT-02 § bank process | LEGACY_CONFIRMED |
| `ImportDeliveryDepositAction` | `upload()` | `/deposit/importDeliveryDeposit/upload` | 0603 | `DeliveryDepositWorkService` | IMPORT | FD-DEPOSIT-02 § COD upload | Documented |
| `ImportDeliveryDepositAction` | `update()` | `/deposit/importDeliveryDeposit/update` | 0603 | match + create deposit | IMPORT | FD-DEPOSIT-02 § COD process | LEGACY_CONFIRMED |

**Lưu ý:** FD-DEPOSIT-01 = nhập tay + tìm kiếm; FD-DEPOSIT-02 = import bank (0604) + COD shipper (0603).
