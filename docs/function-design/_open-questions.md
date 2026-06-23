# Open Questions — Function Design (P1 Modules)

> Các câu hỏi chưa có đủ evidence từ source code. Cần xác minh qua: runtime, test data, hoặc domain expert.  
> Cập nhật khi có câu trả lời. Ghi nguồn xác minh vào cột "Resolved by".

---

## AUTH

| ID | Câu hỏi | Impact | FD File | Status |
|----|---------|--------|---------|--------|
| OQ-AUTH-01 | Password migration: AES-128 ECB → bcrypt? Force reset? | HIGH | FD-AUTH-01 | Open |
| OQ-AUTH-02 | SSO: external system có API key riêng không? | MEDIUM | FD-AUTH-01 | Open |
| OQ-AUTH-03 | Refresh token: DB blacklist hay token rotation? | MEDIUM | FD-AUTH-01 | Open |
| OQ-AUTH-04 | Admin reset locked account: có màn hình riêng không? | LOW | FD-AUTH-01 | Open |

---

## CUST

| ID | Câu hỏi | Impact | FD File | Status |
|----|---------|--------|---------|--------|
| OQ-CUST-01 | Sort order: luôn CUSTOMER_CODE ASC hay user chọn? | LOW | FD-CUST-01 | Open |
| OQ-CUST-02 | Page size legacy: bao nhiêu records/page? | LOW | FD-CUST-01 | Open |
| OQ-CUST-03 | SEQ_MAKER allocate field nào trong CUSTOMER_MST? | HIGH | FD-CUST-02 | Open |
| OQ-CUST-04 | ZIP_MST: giữ trong target DB hay call external API? | MEDIUM | FD-CUST-02 | Open |
| OQ-CUST-05 | CustomerRelService (parent-child): có trong scope P1? | MEDIUM | FD-CUST-02 | Open |
| OQ-CUST-06 | Delete check: chỉ SALES_SLIP_TRN hay cả RO, BILL, DEPOSIT? | HIGH | FD-CUST-03 | Open |
| OQ-CUST-07 | Sau soft-delete CUSTOMER: CUSTOMER_REL có cascade không? | MEDIUM | FD-CUST-03 | Open |

---

## RORDER

| ID | Câu hỏi | Impact | FD File | Status |
|----|---------|--------|---------|--------|
| OQ-RORDER-01 | SearchROrder: GET hay POST? | LOW | FD-RORDER-01 | Open |
| OQ-RORDER-02 | Filter theo product code? | LOW | FD-RORDER-01 | Open |
| OQ-RORDER-03 | SEQ_MAKER → RO_SLIP_ID: format (số nguyên hay string với prefix)? | HIGH | FD-RORDER-02 | Open |
| OQ-RORDER-04 | DiscountUtil: % hay fixed amount? Có bracket (qty range)? | HIGH | FD-RORDER-02 | Open |
| OQ-RORDER-05 | REST_QUANTITY khi UPDATE RO (thay đổi quantity): xử lý thế nào? | HIGH | FD-RORDER-02 | Open |
| OQ-RORDER-06 | Copy từ Estimate: có trong scope P1? | LOW | FD-RORDER-02 | Open |
| OQ-RORDER-07 | Cancel STATUS "2" (Partial): SALES liên kết bị ảnh hưởng? | HIGH | FD-RORDER-03 | Open |
| OQ-RORDER-08 | Cancel: có reverse entry không? | HIGH | FD-RORDER-03 | Open |

---

## SALES

| ID | Câu hỏi | Impact | FD File | Status |
|----|---------|--------|---------|--------|
| OQ-SALES-01 | calcCost(): FIFO hay LIFO hay average cost? | HIGH | FD-SALES-02 | Open |
| OQ-SALES-02 | Update SALES: EAD slip có được update/reverse không? | HIGH | FD-SALES-02 | Open |
| OQ-SALES-03 | 40+ snapshot columns: danh sách đầy đủ từ DDL | HIGH | FD-SALES-02 | Open |
| OQ-SALES-04 | Partial fulfillment (SALES qty < RO qty): có kiểm soát max không? | HIGH | FD-SALES-02 | Open |
| OQ-SALES-05 | Filter theo roSlipId trong search? | LOW | FD-SALES-01 | Open |
| OQ-SALES-06 | Export danh sách CSV? | LOW | FD-SALES-01 | Open |

---

## BILL

| ID | Câu hỏi | Impact | FD File | Status |
|----|---------|--------|---------|--------|
| OQ-BILL-01 | ART_BALANCE_TRN: cấu trúc? Có dùng trong target? | HIGH | FD-BILL-01 | Open |
| OQ-BILL-02 | BILL_TRN.STATUS: có các giá trị nào ngoài "0"? | MEDIUM | FD-BILL-01 | Open |
| OQ-BILL-03 | Reopen: LAST_CUTOFF_DATE set về ngày nào? | HIGH | FD-BILL-01 | Open |
| OQ-BILL-04 | Invoice PDF (MakeOutBillAction): trong scope P1? | MEDIUM | FD-BILL-01 | Open |

---

## DEPOSIT

| ID | Câu hỏi | Impact | FD File | Status |
|----|---------|--------|---------|--------|
| OQ-DEPOSIT-01 | ART closing process: qui trình là gì? Trong P1? | HIGH | FD-DEPOSIT-01 | Open |
| OQ-DEPOSIT-02 | DEPOSIT_CATEGORY: có thêm value nào từ CATEGORY_TRN? | MEDIUM | FD-DEPOSIT-01 | Open |
| OQ-DEPOSIT-03 | Bank match fail: cần manual review UI? | MEDIUM | FD-DEPOSIT-01 | Open |
| OQ-DEPOSIT-04 | "setoff" category: bù trừ công nợ — cơ chế cụ thể? | HIGH | FD-DEPOSIT-01 | Open |
| OQ-DEPOSIT-05 | Bank file format: CSV/TSV? Schema cố định hay per bank? | HIGH | FD-DEPOSIT-02 | Open |
| OQ-DEPOSIT-06 | COD file format: per shipper hay chuẩn? | HIGH | FD-DEPOSIT-02 | Open |
| OQ-DEPOSIT-07 | Staging: DB hay in-memory? | MEDIUM | FD-DEPOSIT-02 | Open |
| OQ-DEPOSIT-08 | Manual review UI cho unmatched: trong P1? | MEDIUM | FD-DEPOSIT-02 | Open |
