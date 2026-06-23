---
title: SalesCube – Suspected ERD (Core Tables, inferred FK)
---
erDiagram

    DOMAIN_MST {
        varchar DOMAIN_ID PK
        varchar DOMAIN_NAME
    }

    USER_MST {
        varchar USER_ID PK
        varchar USER_NAME
        varchar PASSWORD
        varchar DOMAIN_ID FK
        smallint FAIL_COUNT
        datetime LAST_LOGIN_DATETM
        datetime PASSWORD_UPD_DATETM
    }

    ROLE_MST {
        varchar ROLE_ID PK
        varchar ROLE_NAME
    }

    GRANT_ROLE {
        varchar USER_ID PK_FK
        varchar ROLE_ID PK_FK
        varchar MENU_ID FK
    }

    MINE_MST {
        varchar COMPANY_NAME
        char CUTOFF_GROUP
        smallint PASSWORD_VALID_DAYS
        smallint TOTAL_FAIL_COUNT
        decimal SAFETY_COEFFICIENT
    }

    CUSTOMER_MST {
        varchar CUSTOMER_CODE PK
        varchar CUSTOMER_NAME
        varchar CUSTOMER_KANA
        varchar CUSTOMER_RANK_CATEGORY FK
        char CUTOFF_GROUP
        varchar PAYBACK_TYPE_CATEGORY
        decimal MAX_CREDIT_LIMIT
        date FIRST_SALES_DATE
        date LAST_SALES_DATE
        decimal SALES_PRICE_TOTAL
    }

    CUSTOMER_RANK_MST {
        varchar RANK_CODE PK
        varchar RANK_NAME
        int RO_COUNT_FROM
        int RO_COUNT_TO
    }

    DELIVERY_MST {
        varchar DELIVERY_CODE PK
        varchar DELIVERY_NAME
        varchar DELIVERY_KANA
        char DELIVERY_ZIP_CODE
        varchar DELIVERY_ADDRESS_1
    }

    PRODUCT_MST {
        varchar PRODUCT_CODE PK
        varchar PRODUCT_NAME
        varchar SUPPLIER_CODE FK
        varchar RACK_CODE FK
        decimal RETAIL_PRICE
        decimal SUPPLIER_PRICE_YEN
        varchar PRODUCT_STATUS_CATEGORY
        varchar STOCK_CTL_CATEGORY
        int MINE_SAFETY_STOCK
        decimal SALES_STANDARD_DEVIATION
        varchar PRODUCT_1 FK
        varchar PRODUCT_2 FK
        varchar PRODUCT_3 FK
    }

    PRODUCT_CLASS_MST {
        varchar CLASS_CODE_1 PK
        varchar CLASS_CODE_2 PK
        varchar CLASS_CODE_3 PK
        varchar CLASS_NAME
    }

    PRODUCT_SET_MST {
        varchar SET_PRODUCT_CODE PK_FK
        varchar PRODUCT_CODE PK_FK
        decimal QUANTITY
    }

    SUPPLIER_MST {
        varchar SUPPLIER_CODE PK
        varchar SUPPLIER_NAME
        varchar SUPPLIER_KANA
        int RATE_ID FK
        varchar SUPPLIER_CM_CATEGORY
    }

    WAREHOUSE_MST {
        varchar WAREHOUSE_CODE PK
        varchar WAREHOUSE_NAME
        varchar WAREHOUSE_STATE
    }

    RACK_MST {
        varchar RACK_CODE PK
        varchar WAREHOUSE_CODE FK
        varchar RACK_NAME
        varchar RACK_CATEGORY
        char MULTI_FLAG
    }

    BANK_MST {
        int BANK_ID PK
        varchar BANK_CODE
        varchar BANK_NAME
    }

    RATE_MST {
        int RATE_ID PK
        varchar CURRENCY_CODE
        varchar CURRENCY_NAME
    }

    SEQ_MAKER {
        varchar TABLE_NAME PK
        int ID
        int WARNING_ID
    }

    ESTIMATE_SHEET_TRN {
        int ESTIMATE_SHEET_ID PK
        char STATUS
        varchar CUSTOMER_CODE FK
        date ESTIMATE_DATE
        decimal PRICE_TOTAL
    }

    ESTIMATE_LINE_TRN {
        int ESTIMATE_LINE_ID PK
        int ESTIMATE_SHEET_ID FK
        varchar PRODUCT_CODE FK
        smallint LINE_NO
        decimal QUANTITY
        decimal UNIT_PRICE
        decimal RETAIL_PRICE
    }

    RO_SLIP_TRN {
        int RO_SLIP_ID PK
        char STATUS
        varchar CUSTOMER_CODE FK
        varchar DELIVERY_CODE FK
        date RO_DATE
        int RO_ANNUAL
        int RO_MONTHLY
        varchar RECEPT_NO
    }

    RO_LINE_TRN {
        int RO_LINE_ID PK
        char STATUS
        int RO_SLIP_ID FK
        varchar PRODUCT_CODE FK
        int ESTIMATE_LINE_ID FK
        smallint LINE_NO
        decimal QUANTITY
        decimal REST_QUANTITY
        decimal UNIT_PRICE
    }

    SALES_SLIP_TRN {
        int SALES_SLIP_ID PK
        char STATUS
        int RO_SLIP_ID FK
        varchar CUSTOMER_CODE FK
        varchar DELIVERY_CODE FK
        int BILL_ID FK
        int ART_ID FK
        date SALES_DATE
        int SALES_ANNUAL
        int SALES_MONTHLY
        varchar RECEPT_NO
        decimal PRICE_TOTAL
        decimal GM_TOTAL
        decimal CTAX_PRICE_TOTAL
        char COD_SC
    }

    SALES_LINE_TRN {
        int SALES_LINE_ID PK
        int SALES_SLIP_ID FK
        int RO_LINE_ID FK
        varchar PRODUCT_CODE FK
        smallint LINE_NO
        decimal QUANTITY
        decimal UNIT_PRICE
        decimal RETAIL_PRICE
        decimal UNIT_COST
        decimal GM
        varchar RACK_CODE_SRC FK
    }

    PICKING_LIST_TRN {
        int PICKING_LIST_ID PK
        int RO_SLIP_ID FK
        int SALES_SLIP_ID FK
        varchar CUSTOMER_CODE
        date PRINT_DATE
    }

    PICKING_LINE_TRN {
        int PICKING_LINE_ID PK
        int PICKING_LIST_ID FK
        int SALES_LINE_ID FK
        int RO_LINE_ID FK
        smallint LINE_NO
        varchar PRODUCT_CODE FK
        decimal QUANTITY
    }

    BILL_TRN {
        int BILL_ID PK
        char STATUS
        varchar CUSTOMER_CODE FK
        varchar BA_CODE FK
        date BILL_CUTOFF_DATE
        char CUTOFF_GROUP
        int BILL_YEAR
        int BILL_MONTH
        decimal LAST_BILL_PRICE
        decimal DEPOSIT_PRICE
        decimal SALES_PRICE
        decimal THIS_BILL_PRICE
        int BILL_PRINT_COUNT
    }

    ART_BALANCE_TRN {
        int ART_BALANCE_ID PK
        varchar CUSTOMER_CODE FK
        varchar BA_CODE FK
        int ART_ANNUAL
        int ART_MONTHLY
        date ART_CUTOFF_DATE
        decimal LAST_ART_PRICE
        decimal SALES_PRICE
        decimal DEPOSIT_PRICE
        decimal THIS_ART_PRICE
        decimal GM_PRICE
    }

    DEPOSIT_SLIP_TRN {
        int DEPOSIT_SLIP_ID PK
        varchar STATUS
        varchar CUSTOMER_CODE FK
        int BILL_ID FK
        int ART_ID FK
        int SALES_SLIP_ID FK
        date DEPOSIT_DATE
        int DEPOSIT_ANNUAL
        int DEPOSIT_MONTHLY
        decimal DEPOSIT_TOTAL
        varchar DEPOSIT_CATEGORY
    }

    DEPOSIT_LINE_TRN {
        int DEPOSIT_LINE_ID PK
        varchar STATUS
        int DEPOSIT_SLIP_ID FK
        int BANK_ID FK
        int SALES_LINE_ID FK
        smallint LINE_NO
        varchar DEPOSIT_CATEGORY
        decimal PRICE
        date INST_DATE
    }

    PO_SLIP_TRN {
        int PO_SLIP_ID PK
        char STATUS
        varchar SUPPLIER_CODE FK
        int RATE_ID FK
        date PO_DATE
        int PO_ANNUAL
        int PO_MONTHLY
        decimal PRICE_TOTAL
        decimal CTAX_TOTAL
    }

    PO_LINE_TRN {
        int PO_LINE_ID PK
        char STATUS
        int PO_SLIP_ID FK
        varchar PRODUCT_CODE FK
        smallint LINE_NO
        decimal QUANTITY
        decimal REST_QUANTITY
        decimal UNIT_PRICE
        decimal PRICE
    }

    SUPPLIER_SLIP_TRN {
        int SUPPLIER_SLIP_ID PK
        char STATUS
        varchar SUPPLIER_CODE FK
        int PO_SLIP_ID FK
        int PAYMENT_SLIP_ID FK
        int RATE_ID FK
        date SUPPLIER_DATE
        decimal PRICE_TOTAL
        varchar SUPPLIER_SLIP_CATEGORY
    }

    SUPPLIER_LINE_TRN {
        int SUPPLIER_LINE_ID PK
        char STATUS
        int SUPPLIER_SLIP_ID FK
        varchar PRODUCT_CODE FK
        int PO_LINE_ID FK
        int PAYMENT_LINE_ID FK
        varchar RACK_CODE FK
        smallint LINE_NO
        decimal QUANTITY
        decimal UNIT_PRICE
    }

    EAD_SLIP_TRN {
        int EAD_SLIP_ID PK
        int SALES_SLIP_ID FK
        int SUPPLIER_SLIP_ID FK
        date EAD_DATE
        varchar EAD_SLIP_CATEGORY
        varchar EAD_CATEGORY
        char SRC_FUNC
    }

    EAD_LINE_TRN {
        int EAD_LINE_ID PK
        int EAD_SLIP_ID FK
        varchar PRODUCT_CODE FK
        varchar RACK_CODE FK
        int SALES_LINE_ID FK
        int SUPPLIER_LINE_ID FK
        smallint LINE_NO
        decimal QUANTITY
    }

    PAYMENT_SLIP_TRN {
        int PAYMENT_SLIP_ID PK
        char STATUS
        varchar SUPPLIER_CODE FK
        int PO_SLIP_ID FK
        int SUPPLIER_SLIP_ID FK
        int APT_BALANCE_ID FK
        date PAYMENT_DATE
        decimal PRICE_TOTAL
    }

    PAYMENT_LINE_TRN {
        int PAYMENT_LINE_ID PK
        char STATUS
        int PAYMENT_SLIP_ID FK
        int PO_LINE_ID FK
        int SUPPLIER_LINE_ID FK
        varchar PRODUCT_CODE FK
        smallint LINE_NO
        decimal QUANTITY
        decimal PRICE
    }

    APT_BALANCE_TRN {
        int APT_BALANCE_ID PK
        varchar SUPPLIER_CODE FK
        varchar PRODUCT_CODE FK
        int PO_SLIP_ID FK
        int PO_LINE_ID FK
        int SUPPLIER_SLIP_ID FK
        int SUPPLIER_LINE_ID FK
        int APT_ANNUAL
        int APT_MONTHLY
        decimal UNPAID_PRICE
    }

    PRODUCT_STOCK_TRN {
        varchar RACK_CODE PK_FK
        varchar PRODUCT_CODE PK_FK
        int ANNUAL PK
        int MONTHLY PK
        decimal STOCK_NUM
        decimal ENTER_NUM
        decimal DISPATCH_NUM
        decimal RETURN_NUM
    }

    ONLINE_ORDER_WORK {
        varchar USER_ID PK
        varchar ONLINE_ORDER_ID PK
        varchar ONLINE_ITEM_ID PK
        varchar SKU
        varchar CUSTOMER_EMAIL
        varchar RECIPIENT_NAME
        decimal QUANTITY
        decimal PRICE
        datetime LOAD_DATE
    }

    INVOICE_DATA_WORK {
        varchar USER_ID PK
        varchar DELIVERY_SLIP_ID PK
        varchar CUSTOMER_CODE FK
        date SHIP_DATE
        date DELIVERY_DATE
        varchar DELIVERY_NAME
    }

    BANK_DEPOSIT_REL {
        int DEPOSIT_SLIP_ID FK
        varchar USER_ID
    }

    DELIVERY_DEPOSIT_REL {
        int DEPOSIT_SLIP_ID FK
        varchar USER_ID
    }

    ONLINE_ORDER_REL {
        varchar ONLINE_ORDER_ID FK
        int RO_SLIP_ID FK
    }

    %% Auth
    USER_MST ||--o{ GRANT_ROLE : "has roles"
    ROLE_MST ||--o{ GRANT_ROLE : "granted to"
    DOMAIN_MST ||--o{ USER_MST : "belongs to"

    %% Customer hierarchy
    CUSTOMER_RANK_MST ||--o{ CUSTOMER_MST : "ranks"
    CUSTOMER_MST ||--o{ ESTIMATE_SHEET_TRN : "requests"
    CUSTOMER_MST ||--o{ RO_SLIP_TRN : "orders"
    CUSTOMER_MST ||--o{ SALES_SLIP_TRN : "buys"
    CUSTOMER_MST ||--o{ BILL_TRN : "billed"
    CUSTOMER_MST ||--o{ DEPOSIT_SLIP_TRN : "pays"
    CUSTOMER_MST ||--o{ ART_BALANCE_TRN : "balance"
    DELIVERY_MST ||--o{ RO_SLIP_TRN : "delivers to"
    DELIVERY_MST ||--o{ SALES_SLIP_TRN : "delivers to"

    %% Product hierarchy
    SUPPLIER_MST ||--o{ PRODUCT_MST : "supplies"
    RACK_MST ||--o{ PRODUCT_MST : "stores (default)"
    PRODUCT_CLASS_MST ||--o{ PRODUCT_MST : "classifies"
    PRODUCT_MST ||--o{ PRODUCT_SET_MST : "is set"
    PRODUCT_MST ||--o{ PRODUCT_SET_MST : "is component"
    WAREHOUSE_MST ||--o{ RACK_MST : "contains"
    RATE_MST ||--o{ SUPPLIER_MST : "currency"

    %% Order flow
    ESTIMATE_SHEET_TRN ||--o{ ESTIMATE_LINE_TRN : "has lines"
    PRODUCT_MST ||--o{ ESTIMATE_LINE_TRN : "referenced"
    ESTIMATE_LINE_TRN }o--|| RO_LINE_TRN : "becomes"
    RO_SLIP_TRN ||--o{ RO_LINE_TRN : "has lines"
    PRODUCT_MST ||--o{ RO_LINE_TRN : "ordered"
    RO_SLIP_TRN ||--|| SALES_SLIP_TRN : "fulfills"
    SALES_SLIP_TRN ||--o{ SALES_LINE_TRN : "has lines"
    PRODUCT_MST ||--o{ SALES_LINE_TRN : "sold"
    RO_LINE_TRN ||--o{ SALES_LINE_TRN : "backs"

    %% Picking
    RO_SLIP_TRN ||--o| PICKING_LIST_TRN : "picked via"
    SALES_SLIP_TRN ||--o| PICKING_LIST_TRN : "picked via"
    PICKING_LIST_TRN ||--o{ PICKING_LINE_TRN : "has lines"
    SALES_LINE_TRN ||--o{ PICKING_LINE_TRN : "picked"

    %% Billing & deposit
    SALES_SLIP_TRN }o--|| BILL_TRN : "billed in"
    BILL_TRN ||--o{ DEPOSIT_SLIP_TRN : "paid via"
    DEPOSIT_SLIP_TRN ||--o{ DEPOSIT_LINE_TRN : "has lines"
    BANK_MST ||--o{ DEPOSIT_LINE_TRN : "bank account"

    %% Balance
    ART_BALANCE_TRN ||--o{ SALES_SLIP_TRN : "tracks"
    ART_BALANCE_TRN ||--o{ DEPOSIT_SLIP_TRN : "tracks"
    BANK_MST ||--o{ ART_BALANCE_TRN : "clearing account"
    BANK_MST ||--o{ BILL_TRN : "billing account"

    %% Inventory
    RACK_MST ||--o{ PRODUCT_STOCK_TRN : "stores in"
    PRODUCT_MST ||--o{ PRODUCT_STOCK_TRN : "stocked"

    %% EAD (entrust stock)
    SALES_SLIP_TRN ||--o{ EAD_SLIP_TRN : "triggers"
    SUPPLIER_SLIP_TRN ||--o{ EAD_SLIP_TRN : "triggers"
    EAD_SLIP_TRN ||--o{ EAD_LINE_TRN : "has lines"
    PRODUCT_MST ||--o{ EAD_LINE_TRN : "moved"
    RACK_MST ||--o{ EAD_LINE_TRN : "to/from rack"

    %% Purchase flow
    SUPPLIER_MST ||--o{ PO_SLIP_TRN : "ordered from"
    PO_SLIP_TRN ||--o{ PO_LINE_TRN : "has lines"
    PRODUCT_MST ||--o{ PO_LINE_TRN : "ordered"
    PO_SLIP_TRN ||--o{ SUPPLIER_SLIP_TRN : "received as"
    SUPPLIER_SLIP_TRN ||--o{ SUPPLIER_LINE_TRN : "has lines"
    PO_LINE_TRN ||--o{ SUPPLIER_LINE_TRN : "fulfilled by"

    %% Payment to supplier
    PO_SLIP_TRN ||--o{ PAYMENT_SLIP_TRN : "paid via"
    SUPPLIER_SLIP_TRN ||--o{ PAYMENT_SLIP_TRN : "paid for"
    PAYMENT_SLIP_TRN ||--o{ PAYMENT_LINE_TRN : "has lines"
    PO_LINE_TRN ||--o{ PAYMENT_LINE_TRN : "paid"
    SUPPLIER_LINE_TRN ||--o{ PAYMENT_LINE_TRN : "paid"

    %% AP balance
    APT_BALANCE_TRN }o--|| SUPPLIER_MST : "tracks"
    APT_BALANCE_TRN }o--|| PRODUCT_MST : "tracks"
    PAYMENT_SLIP_TRN }o--o| APT_BALANCE_TRN : "settles"

    %% Import work tables
    BANK_DEPOSIT_REL }o--|| DEPOSIT_SLIP_TRN : "links"
    DELIVERY_DEPOSIT_REL }o--|| DEPOSIT_SLIP_TRN : "links"
    ONLINE_ORDER_REL }o--|| RO_SLIP_TRN : "links"
