# Relationship Map – SalesCube Legacy DB

> **Quan trọng**: DDL **KHÔNG có FOREIGN KEY constraints**. Toàn bộ quan hệ dưới đây được **inferred** từ:
> - Column naming convention (`TABLE_NAME_ID`, `TABLE_CODE`)  
> - NOT NULL constraints trên FK columns  
> - Service class logic (S2JDBC JOIN queries)  
> - Entity SQL files  
> **Độ tin cậy**: Cao (✅) = xác nhận từ ≥2 nguồn; Trung bình (⚠️) = inferred từ naming; Thấp (❓) = suy luận

---

## 1. Core Order-to-Cash Relationships

```
CUSTOMER_MST ────────────────────────────────┐
    │ 1                                        │
    │ (CUSTOMER_CODE)                          │
    ▼ N                                        │
ESTIMATE_SHEET_TRN ──(CUSTOMER_CODE)──────────┤
    │ 1                                        │
    ▼ N                                        │
ESTIMATE_LINE_TRN ──(PRODUCT_CODE)──────────┐ │
                                             │ │
CUSTOMER_MST ──────────────────────────────┐ │ │
    │ 1                                    │ │ │
    ▼ N                                    ▼ ▼ ▼
RO_SLIP_TRN ─────────────────────── PRODUCT_MST
    │ 1             (PRODUCT_CODE)         │ │
    ▼ N                                    │ │
RO_LINE_TRN ──(ESTIMATE_LINE_ID)──>        │ │
    │ 1             ESTIMATE_LINE_TRN      │ │
    │                                      │ │
    ▼ (via RO_LINE_ID)                     │ │
SALES_LINE_TRN ──(PRODUCT_CODE)────────────┘ │
    │ N                                        │
    ▼ 1                                        │
SALES_SLIP_TRN ──(CUSTOMER_CODE)─────────────┘
    │ 1
    ▼ 1 (via BILL_ID)
BILL_TRN ──(CUSTOMER_CODE)──> CUSTOMER_MST
    │ 1
    ▼ N (via BILL_ID in DEPOSIT_SLIP_TRN)
DEPOSIT_SLIP_TRN ──(CUSTOMER_CODE)──> CUSTOMER_MST
    │ 1
    ▼ N
DEPOSIT_LINE_TRN ──(BANK_ID)──> BANK_MST
```

---

## 2. Procure-to-Pay Relationships

```
SUPPLIER_MST ────────────────────────────────┐
    │ 1                                        │
    ▼ N                                        │
PO_SLIP_TRN ──(RATE_ID)──> RATE_MST          │
    │ 1                                        │
    ▼ N                                        │
PO_LINE_TRN ──(PRODUCT_CODE)──> PRODUCT_MST  │
    │ 1 (via PO_LINE_ID)                       │
    ▼ N                                        │
SUPPLIER_LINE_TRN ──(PRODUCT_CODE)──> PRODUCT_MST
    │ N                                        │
    ▼ 1                                        │
SUPPLIER_SLIP_TRN ──(SUPPLIER_CODE)──────────┘
    │ (via SUPPLIER_SLIP_ID)                   │
    ▼                                          │
PAYMENT_SLIP_TRN ──(SUPPLIER_CODE)───────────┘
    │ 1
    ▼ N
PAYMENT_LINE_TRN ──(PO_LINE_ID)──> PO_LINE_TRN
                ──(SUPPLIER_LINE_ID)──> SUPPLIER_LINE_TRN
```

---

## 3. Inventory Relationships

```
WAREHOUSE_MST
    │ 1
    ▼ N
RACK_MST ──(WAREHOUSE_CODE)──> WAREHOUSE_MST
    │ 1
    ▼ N
PRODUCT_STOCK_TRN ──(PRODUCT_CODE)──> PRODUCT_MST
    (PK: RACK_CODE + PRODUCT_CODE + ANNUAL + MONTHLY)

EAD_SLIP_TRN ──(SALES_SLIP_ID)──> SALES_SLIP_TRN
             ──(SUPPLIER_SLIP_ID)──> SUPPLIER_SLIP_TRN
    │ 1
    ▼ N
EAD_LINE_TRN ──(PRODUCT_CODE)──> PRODUCT_MST
             ──(RACK_CODE)──> RACK_MST
             ──(SALES_LINE_ID)──> SALES_LINE_TRN
             ──(SUPPLIER_LINE_ID)──> SUPPLIER_LINE_TRN
```

---

## 4. Financial Balance Relationships

```
SALES_SLIP_TRN ──(ART_ID)──> ART_BALANCE_TRN
DEPOSIT_SLIP_TRN ──(ART_ID)──> ART_BALANCE_TRN
ART_BALANCE_TRN ──(CUSTOMER_CODE)──> CUSTOMER_MST
ART_BALANCE_TRN ──(BA_CODE)──> BANK_MST

APT_BALANCE_TRN ──(SUPPLIER_CODE)──> SUPPLIER_MST NOT NULL
                ──(PRODUCT_CODE)──> PRODUCT_MST NOT NULL
                ──(PO_SLIP_ID)──> PO_SLIP_TRN
                ──(SUPPLIER_SLIP_ID)──> SUPPLIER_SLIP_TRN
PAYMENT_SLIP_TRN ──(APT_BALANCE_ID)──> APT_BALANCE_TRN
```

---

## 5. Auth/Permission Relationships

```
DOMAIN_MST
    │
USER_MST ──(DOMAIN_ID)──> DOMAIN_MST [inferred]
    │
GRANT_ROLE ──(USER_ID)──> USER_MST
           ──(ROLE_ID)──> ROLE_MST
           ──(MENU_ID)──> MENU_MST
```

---

## 6. Picking Relationships

```
SALES_SLIP_TRN ──(SALES_SLIP_ID)──> PICKING_LIST_TRN
RO_SLIP_TRN ──(RO_SLIP_ID)──> PICKING_LIST_TRN
    │ 1
    ▼ N
PICKING_LINE_TRN ──(PICKING_LIST_ID)──> PICKING_LIST_TRN
                 ──(SALES_LINE_ID)──> SALES_LINE_TRN
                 ──(RO_LINE_ID)──> RO_LINE_TRN
```

---

## 7. Import/Work Table Relationships

```
ONLINE_ORDER_WORK ──(USER_ID)──> USER_MST [inferred]
    │ (via import process)
    ▼
RO_SLIP_TRN + RO_LINE_TRN
ONLINE_ORDER_REL ──(ONLINE_ORDER_ID)──> ONLINE_ORDER_WORK [inferred]
                ──(RO_SLIP_ID)──> RO_SLIP_TRN

BANK_DEPOSIT_WORK ──(USER_ID)──> USER_MST [inferred]
    │ (via import process)
    ▼
DEPOSIT_SLIP_TRN
BANK_DEPOSIT_REL ──(DEPOSIT_SLIP_ID)──> DEPOSIT_SLIP_TRN [inferred]

DELIVERY_DEPOSIT_WORK ──(USER_ID)──> USER_MST [inferred]
    │ (via import process)
    ▼
DEPOSIT_SLIP_TRN
DELIVERY_DEPOSIT_REL ──(DEPOSIT_SLIP_ID)──> DEPOSIT_SLIP_TRN [inferred]
```

---

## 8. Product Master Relationships

```
PRODUCT_MST ──(SUPPLIER_CODE)──> SUPPLIER_MST ✅
            ──(RACK_CODE)──> RACK_MST ✅
            ──(PRODUCT_1/2/3)──> PRODUCT_CLASS_MST ⚠️

PRODUCT_SET_MST ──(SET_PRODUCT_CODE)──> PRODUCT_MST ✅
                ──(PRODUCT_CODE)──> PRODUCT_MST ✅

DISCOUNT_REL ──(PRODUCT_CODE)──> PRODUCT_MST [inferred]
             ──(CUSTOMER_CODE)──> CUSTOMER_MST [inferred]
```

---

## 9. Bảng Quan hệ Chi tiết (FK References)

| FK Column | Trong bảng | References | Độ tin cậy | NOT NULL? |
|-----------|-----------|------------|-----------|----------|
| `CUSTOMER_CODE` | RO_SLIP_TRN | CUSTOMER_MST | ✅ | No |
| `CUSTOMER_CODE` | SALES_SLIP_TRN | CUSTOMER_MST | ✅ | No |
| `CUSTOMER_CODE` | BILL_TRN | CUSTOMER_MST | ✅ | No |
| `CUSTOMER_CODE` | DEPOSIT_SLIP_TRN | CUSTOMER_MST | ✅ | No |
| `CUSTOMER_CODE` | ART_BALANCE_TRN | CUSTOMER_MST | ✅ | No |
| `DELIVERY_CODE` | RO_SLIP_TRN | DELIVERY_MST | ✅ | No |
| `DELIVERY_CODE` | SALES_SLIP_TRN | DELIVERY_MST | ✅ | No |
| `PRODUCT_CODE` | RO_LINE_TRN | PRODUCT_MST | ✅ | No |
| `PRODUCT_CODE` | SALES_LINE_TRN | PRODUCT_MST | ✅ | No |
| `PRODUCT_CODE` | PO_LINE_TRN | PRODUCT_MST | ✅ | No |
| `PRODUCT_CODE` | SUPPLIER_LINE_TRN | PRODUCT_MST | ✅ | No |
| `PRODUCT_CODE` | APT_BALANCE_TRN | PRODUCT_MST | ✅ | **YES** |
| `PRODUCT_CODE` | PRODUCT_STOCK_TRN | PRODUCT_MST | ✅ | Yes (PK) |
| `SUPPLIER_CODE` | PRODUCT_MST | SUPPLIER_MST | ✅ | No |
| `SUPPLIER_CODE` | PO_SLIP_TRN | SUPPLIER_MST | ✅ | No |
| `SUPPLIER_CODE` | SUPPLIER_SLIP_TRN | SUPPLIER_MST | ✅ | No |
| `SUPPLIER_CODE` | PAYMENT_SLIP_TRN | SUPPLIER_MST | ✅ | **YES** |
| `SUPPLIER_CODE` | APT_BALANCE_TRN | SUPPLIER_MST | ✅ | **YES** |
| `RACK_CODE` | PRODUCT_MST | RACK_MST | ✅ | No |
| `RACK_CODE` | PRODUCT_STOCK_TRN | RACK_MST | ✅ | Yes (PK) |
| `RACK_CODE` | EAD_LINE_TRN | RACK_MST | ✅ | No |
| `WAREHOUSE_CODE` | RACK_MST | WAREHOUSE_MST | ✅ | No |
| `RATE_ID` | PO_SLIP_TRN | RATE_MST | ✅ | No |
| `RATE_ID` | SUPPLIER_SLIP_TRN | RATE_MST | ✅ | No |
| `RATE_ID` | PAYMENT_SLIP_TRN | RATE_MST | ✅ | No |
| `BANK_ID` | DEPOSIT_LINE_TRN | BANK_MST | ✅ | No |
| `RO_SLIP_ID` | SALES_SLIP_TRN | RO_SLIP_TRN | ✅ | No |
| `RO_SLIP_ID` | PICKING_LIST_TRN | RO_SLIP_TRN | ✅ | No |
| `RO_LINE_ID` | SALES_LINE_TRN | RO_LINE_TRN | ✅ | No |
| `RO_LINE_ID` | PICKING_LINE_TRN | RO_LINE_TRN | ✅ | No |
| `SALES_SLIP_ID` | EAD_SLIP_TRN | SALES_SLIP_TRN | ✅ | No |
| `SALES_SLIP_ID` | PICKING_LIST_TRN | SALES_SLIP_TRN | ✅ | No |
| `SALES_LINE_ID` | EAD_LINE_TRN | SALES_LINE_TRN | ✅ | No |
| `SALES_LINE_ID` | PICKING_LINE_TRN | SALES_LINE_TRN | ✅ | No |
| `SALES_LINE_ID` | DEPOSIT_LINE_TRN | SALES_LINE_TRN | ⚠️ | No |
| `BILL_ID` | SALES_SLIP_TRN | BILL_TRN | ✅ | No |
| `BILL_ID` | DEPOSIT_SLIP_TRN | BILL_TRN | ✅ | No |
| `ART_ID` | SALES_SLIP_TRN | ART_BALANCE_TRN | ⚠️ | No |
| `ART_ID` | DEPOSIT_SLIP_TRN | ART_BALANCE_TRN | ⚠️ | No |
| `PO_SLIP_ID` | SUPPLIER_SLIP_TRN | PO_SLIP_TRN | ✅ | No |
| `PO_SLIP_ID` | PAYMENT_SLIP_TRN | PO_SLIP_TRN | ✅ | **YES** |
| `PO_SLIP_ID` | APT_BALANCE_TRN | PO_SLIP_TRN | ✅ | No |
| `PO_LINE_ID` | SUPPLIER_LINE_TRN | PO_LINE_TRN | ✅ | No |
| `PO_LINE_ID` | PAYMENT_LINE_TRN | PO_LINE_TRN | ✅ | **YES** |
| `PO_LINE_ID` | APT_BALANCE_TRN | PO_LINE_TRN | ✅ | No |
| `SUPPLIER_SLIP_ID` | EAD_SLIP_TRN | SUPPLIER_SLIP_TRN | ✅ | No |
| `SUPPLIER_SLIP_ID` | PAYMENT_SLIP_TRN | SUPPLIER_SLIP_TRN | ✅ | No |
| `SUPPLIER_SLIP_ID` | APT_BALANCE_TRN | SUPPLIER_SLIP_TRN | ✅ | No |
| `SUPPLIER_LINE_ID` | EAD_LINE_TRN | SUPPLIER_LINE_TRN | ✅ | No |
| `SUPPLIER_LINE_ID` | PAYMENT_LINE_TRN | SUPPLIER_LINE_TRN | ✅ | **YES** |
| `SUPPLIER_LINE_ID` | APT_BALANCE_TRN | SUPPLIER_LINE_TRN | ✅ | No |
| `PAYMENT_SLIP_ID` | SUPPLIER_SLIP_TRN | PAYMENT_SLIP_TRN | ⚠️ | No |
| `APT_BALANCE_ID` | PAYMENT_SLIP_TRN | APT_BALANCE_TRN | ⚠️ | No |
| `ESTIMATE_LINE_ID` | RO_LINE_TRN | ESTIMATE_LINE_TRN | ⚠️ | No |
| `PICKING_LIST_ID` | PICKING_LINE_TRN | PICKING_LIST_TRN | ✅ | No |
| `SET_PRODUCT_CODE` | PRODUCT_SET_MST | PRODUCT_MST | ✅ | No |

---

## 10. Cardinality Summary

| Quan hệ | Cardinality | Ghi chú |
|---------|------------|---------|
| CUSTOMER_MST → ESTIMATE_SHEET_TRN | 1:N | |
| CUSTOMER_MST → RO_SLIP_TRN | 1:N | |
| CUSTOMER_MST → SALES_SLIP_TRN | 1:N | |
| CUSTOMER_MST → BILL_TRN | 1:N | |
| CUSTOMER_MST → DEPOSIT_SLIP_TRN | 1:N | |
| ESTIMATE_SHEET_TRN → RO_SLIP_TRN | 1:1 or 0:1 | Optional |
| RO_SLIP_TRN → SALES_SLIP_TRN | 1:1 | |
| RO_SLIP_TRN → PICKING_LIST_TRN | 1:1 | |
| SALES_SLIP_TRN → BILL_TRN | N:1 | Nhiều phiếu bán → 1 hóa đơn |
| SALES_SLIP_TRN → EAD_SLIP_TRN | 1:N | |
| BILL_TRN → DEPOSIT_SLIP_TRN | 1:N | |
| PRODUCT_MST → PRODUCT_STOCK_TRN | 1:N | Per rack per month |
| SUPPLIER_MST → PO_SLIP_TRN | 1:N | |
| PO_SLIP_TRN → SUPPLIER_SLIP_TRN | 1:N | |
| PO_SLIP_TRN → PAYMENT_SLIP_TRN | 1:N | |
| PRODUCT_MST → PRODUCT_SET_MST | 1:N (as set) | |
| PRODUCT_MST → PRODUCT_SET_MST | 1:N (as component) | |
