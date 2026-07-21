# Design (To-Be TypeScript) – estimate (見積)

> Tài liệu **THIẾT KẾ BẢN PORT (to-be)** — module này sẽ được viết lại thế nào trên stack TypeScript.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Suy luận thiết kế PHẢI truy vết được về tài liệu Requirements + Technical; giả định chưa chốt → `[CẦN XÁC NHẬN]`.
> Stack đích (theo `AGENTS.md`): `apps/api` = **NestJS**, `apps/web` = **Next.js App Router**, `packages/types` = type dùng chung. TS strict, Biome.

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | estimate (見積) |
| Agent thực hiện | claude |
| Ngày | 2026-07-21 |
| Dựa trên | `requirements/estimate.md` + `technical/estimate.md` cùng agent |
| Loại tài liệu | Design / To-Be (NestJS + Next.js + TS) |

## 1. Mục tiêu & nguyên tắc port
- **Giữ nguyên hành vi nghiệp vụ** (mọi BR-01..BR-15 ở Requirements) nhưng hiện đại hoá kỹ thuật: bỏ Seasar2/S2Struts, dùng DI + module của NestJS; validate bằng `class-validator`/`Zod` thay annotation S2Struts; thay JSP bằng React Server/Client Components (Next.js App Router).
- **Giữ tách Slip/Line:** đầu phiếu (`EstimateSheet`) và dòng (`EstimateLine`) là 2 entity riêng, quan hệ 1–N. Service riêng cho sheet và line, gộp giao dịch ở tầng service phối hợp (`EstimateService`).
- **Tập trung logic tính tiền về server (khác bản Java):** bản Java tính số tiền phía JS. Bản port nên **tính lại & xác thực totals ở service** (an toàn, tránh tin client) — xem mục 9.
- **Multi-tenant:** thay tên bảng động `_<domainId>` bằng cột `domainId`/schema-per-tenant (quyết định ở mục 9).
- **Khóa lạc quan:** giữ cơ chế so `updDatetm` (chuyển thành cột `version`/`updatedAt` optimistic lock).

## 2. Kiến trúc đích
```
apps/api (NestJS)   : estimate.module.ts
                       → estimate.controller.ts            (map *Action)
                       → estimate.service.ts               (điều phối giao dịch: sheet + line)
                       → estimate-sheet.service.ts         (EstimateSheetService)
                       → estimate-line.service.ts          (EstimateLineService)
                       → repositories/ (estimate-sheet.repository.ts, estimate-line.repository.ts)
                       → entities/ (estimate-sheet.entity.ts, estimate-line.entity.ts)
                       → dto/ (create/update/search/... .dto.ts)
                     + tích hợp: customer, product, discount, category, tax, ym, sequence (module/service dùng chung)
apps/web (Next.js)  : app/estimate/
                       → search/ (page.tsx + client search grid)
                       → [id]/ input form (page.tsx + client form)
                       → price-list/ (単価照会)
                       → components/ (EstimateForm, EstimateLineTable, EstimateSearchForm, ...)
packages/types      : estimate.types.ts (DTO/enum dùng chung cho api & web)
```

## 3. Mô hình dữ liệu đích

### EstimateSheet (từ `ESTIMATE_SHEET_TRN` / `EstimateSheetTrn`)
| Trường (Java/DB) | Trường (TS) | Kiểu TS | Null? | Ghi chú |
|------------------|-------------|---------|-------|---------|
| ESTIMATE_SHEET_ID | estimateSheetId | string | N | PK, nhập tay (BR-01) |
| ESTIMATE_ANNUAL | estimateAnnual | number \| null | Y | tính từ ngày (BR-02) |
| ESTIMATE_MONTHLY | estimateMonthly | number \| null | Y | tính từ ngày (BR-02) |
| ESTIMATE_YM | estimateYm | number \| null | Y | tính từ ngày (BR-02) |
| ESTIMATE_DATE | estimateDate | string (ISO date) | N | required |
| DELIVERY_INFO | deliveryInfo | string \| null | Y | 納入期限, ≤120 |
| VALID_DATE | validDate | string \| null | Y | hạn hiệu lực |
| USER_ID / USER_NAME | userId / userName | string | N | người nhập (auto) |
| REMARKS | remarks | string \| null | Y | ≤120 |
| TITLE | title | string \| null | Y | ≤100 |
| ESTIMATE_CONDITION | estimateCondition | string \| null | Y | ≤120 |
| SUBMIT_NAME | submitName | string | N | required, ≤60 |
| SUBMIT_PRE_CATEGORY / SUBMIT_PRE | submitPreCategory / submitPre | string \| null | Y | kính ngữ |
| CUSTOMER_CODE / CUSTOMER_NAME | customerCode / customerName | string \| null | Y | ≤15 (code) |
| CUSTOMER_REMARKS / CUSTOMER_COMMENT_DATA | customerRemarks / customerCommentData | string \| null | Y | |
| DELIVERY_* (name/office/dept/zip/address1-2/pc*/tel/fax/email/url) | delivery* | string \| null | Y | nhóm cột giao hàng |
| DELIVERY_ZIP_CODE | deliveryZipCode | string \| null | Y | copy từ zip khách (BR-05) |
| CTAX_PRICE_TOTAL | ctaxPriceTotal | number (Decimal) | Y | thuế (BR-09) |
| CTAX_RATE | ctaxRate | number (Decimal) | Y | thuế suất phiếu (BR-10) |
| COST_TOTAL | costTotal | number (Decimal) | Y | Σ vốn |
| RETAIL_PRICE_TOTAL | retailPriceTotal | number (Decimal) | Y | Σ bán |
| ESTIMATE_TOTAL | estimateTotal | number (Decimal) | Y | tổng phiếu |
| MEMO | memo | string \| null | Y | ≤1000 |
| TAX_FRACT_CATEGORY / PRICE_FRACT_CATEGORY | taxFractCategory / priceFractCategory | string \| null | Y | cách làm tròn |
| CRE_*/UPD_* | createdBy/At, updatedBy/At, creFunc/updFunc | string / Date | Y | audit; `updatedAt` dùng cho optimistic lock |

> Trường **chỉ ở tầng tính toán/hiển thị** (không lưu DB sheet): `grossMargin`, `grossMarginRate` — tính ở service/SQL, trả trong response search.

### EstimateLine (từ `ESTIMATE_LINE_TRN` / `EstimateLineTrn`)
| Trường (Java/DB) | Trường (TS) | Kiểu TS | Null? | Ghi chú |
|------------------|-------------|---------|-------|---------|
| ESTIMATE_LINE_ID | estimateLineId | number | N | PK auto (sequence, BR-03) |
| ESTIMATE_SHEET_ID | estimateSheetId | string | N | FK → sheet |
| LINE_NO | lineNo | number | N | đánh số lại 1..n khi lưu |
| PRODUCT_CODE | productCode | string | N (theo dòng hợp lệ) | ≤20 |
| CUSTOMER_PCODE | customerPcode | string \| null | Y | mã SP phía khách |
| PRODUCT_ABSTRACT | productAbstract | string \| null | Y | ≤60 |
| QUANTITY | quantity | number (Decimal) | N | ≠0 |
| UNIT_COST | unitCost | number (Decimal) | Y | |
| UNIT_RETAIL_PRICE | unitRetailPrice | number (Decimal) | N | cho phép âm (BR-11) |
| COST | cost | number (Decimal) | Y | = unitCost×quantity (BR-07) |
| RETAIL_PRICE | retailPrice | number (Decimal) | N | = unitRetailPrice×quantity |
| REMARKS | remarks | string \| null | Y | ≤120 |
| (join) RO_MAX_NUM / SUPPLIER_PCODE | roMaxNum / supplierPcode | number/string \| null | Y | từ product master (chỉ đọc) |

- **Kiểu tiền:** dùng `Decimal` (Prisma.Decimal / decimal.js) — **không** dùng `number` float cho tính tiền để tránh sai số. Ở API contract có thể serialize sang `string`. `[CẦN XÁC NHẬN]` chuẩn hóa kiểu tiền toàn dự án.
- **ORM/cách truy cập dữ liệu đề xuất:** `[CẦN XÁC NHẬN]` — `apps/api` hiện là scaffold NestJS trống, chưa chọn ORM. Đề xuất **Prisma** (hoặc TypeORM) — chưa chốt trong repo.

## 4. API contract (REST)
| Method | Path | Mô tả | Request DTO | Response DTO |
|--------|------|-------|-------------|--------------|
| GET | `/estimates` | tìm kiếm (phân trang) | `SearchEstimateQueryDto` (query) | `EstimateSearchResultDto` (items + total) |
| GET | `/estimates/export` | xuất Excel kết quả | `SearchEstimateQueryDto` | file (stream xlsx) |
| GET | `/estimates/:id` | lấy 1 phiếu (sheet + lines) | – | `EstimateDto` |
| GET | `/estimates/:id/exists` | kiểm tra tồn tại số báo giá | – | `{ exists: boolean }` |
| POST | `/estimates` | tạo mới | `CreateEstimateDto` | `EstimateDto` |
| PUT | `/estimates/:id` | cập nhật (kèm optimistic lock) | `UpdateEstimateDto` (có `updatedAt`) | `EstimateDto` |
| DELETE | `/estimates/:id` | xóa (kèm `updatedAt`) | `{ updatedAt }` | `{ success: true }` |
| POST | `/estimates/:id/copy` | sao chép thành phiếu nháp | – | `EstimateDto` (draft, không id) |
| GET | `/estimates/:id/report.pdf` | in PDF (mẫu 0000B) | – | file (stream pdf) |
| GET | `/estimates/price-list` | tra bảng giá & chiết khấu (単価照会) | `{ productCode }` (query) | `ProductPriceListDto` |

> Ghi chú map: `upsert()` của Java tách thành **POST** (tạo) + **PUT** (sửa) theo REST. `exists` giữ đúng bán chất chỉ-đọc. `copy` trả về DTO nháp, chưa ghi DB (đúng như `initCopy` bên Java).

## 5. NestJS module design (apps/api)
| Thành phần | File đề xuất | Trách nhiệm | Map từ (Java) |
|-----------|--------------|-------------|---------------|
| Module | `estimate/estimate.module.ts` | wiring controller + services + import Customer/Product/Discount/Tax/Ym/Sequence module | (dicon Seasar) |
| Controller | `estimate/estimate.controller.ts` | định tuyến REST, validate DTO, map lỗi → HTTP | `*Action` (Input/Search/Output/DispProductPriceList + ajax) |
| Service điều phối | `estimate/estimate.service.ts` | 1 transaction: save sheet + lines, delete, copy, load | `AbstractSlipEditAction.upsert/delete/copy` (phần orchestration) |
| Service sheet | `estimate/estimate-sheet.service.ts` | insert/update/delete/find sheet, tính annual/monthly/ym, copy zip khách | `EstimateSheetService` |
| Service line | `estimate/estimate-line.service.ts` | insert/update/delete lines, đánh `lineNo`, sinh id | `EstimateLineService` |
| Repository | `estimate/repositories/*.repository.ts` | truy vấn DB (thay `*.sql`) | `entity/sql/estimate/*.sql` |
| DTO | `estimate/dto/*.dto.ts` | Create/Update/Search/Result/PriceList + validate | `*Form` / `*Dto` |
| Entity/Model | `estimate/entities/*.entity.ts` | ánh xạ bảng | `EstimateSheetTrn` / `EstimateLineTrn` / `Discount` |
| Report | `estimate/estimate-report.service.ts` | sinh PDF (0000B) + Excel export | `OutputEstimateSheetSingleAction` / `SearchEstimateResultOutputAction` |

- **Optimistic lock:** dùng cột `updatedAt`/`version`; PUT/DELETE nhận `updatedAt` client → nếu lệch → ném `ConflictException (409)` (map từ `UnabledLockException`).
- **Transaction:** dùng `@Transactional` (nếu ORM hỗ trợ) hoặc `prisma.$transaction` bao quanh save sheet+lines.
- **Sequence:** thay `SeqMakerService` bằng auto-increment/identity của DB cho `estimateLineId`.

## 6. Web design (apps/web – Next.js)
| Màn hình | Route | Component chính | State / data | Gọi API |
|----------|-------|-----------------|--------------|---------|
| Tìm kiếm báo giá | `app/estimate/search/page.tsx` | `EstimateSearchForm` (client), `EstimateResultTable` | điều kiện tìm; kết quả phân trang | `GET /estimates`, `GET /estimates/export` |
| Nhập/sửa phiếu | `app/estimate/[id]/page.tsx` (+ `new`) | `EstimateForm`, `EstimateLineTable`, `TotalsPanel` | form đầu phiếu + mảng dòng; totals | `GET/POST/PUT/DELETE /estimates`, `GET /estimates/:id/exists` |
| Sao chép | (nút trong form) | dùng lại `EstimateForm` | draft từ copy | `POST /estimates/:id/copy` |
| In PDF | (nút trong form) | link tải | – | `GET /estimates/:id/report.pdf` |
| Tra bảng giá (単価照会) | `app/estimate/price-list/page.tsx` | `PriceListForm`, `DiscountTierTable` | productCode → thông tin + bậc chiết khấu | `GET /estimates/price-list` |

- **Server vs Client Components:** trang là Server Component tải dữ liệu ban đầu; form nhập & lưới kết quả là Client Component (nhiều tương tác/tính toán).
- **Tính totals:** thực hiện realtime ở client để UX (giống JS cũ) **nhưng** server vẫn tính lại/xác thực trước khi ghi (nguồn sự thật là server).

## 7. Business rules → nơi hiện thực
| Mã BR (từ Requirements) | Hiện thực ở đâu | Cách làm |
|-------------------------|-----------------|----------|
| BR-01 số báo giá nhập tay, HANKAKU | DTO validate + DB unique | `@Matches(/^[\x20-\x7E]+$/)` + unique key; check trùng qua `exists` |
| BR-02 annual/monthly/ym từ ngày | `estimate-sheet.service` khi create/update | gọi `YmService.getYm(estimateDate)` |
| BR-03 lineId auto + lineNo tuần tự | ORM auto-increment + service | gán `lineNo = index+1` khi lưu |
| BR-04 estimateDate ≤ validDate | DTO custom validator | validator so 2 ngày |
| BR-05 khách phải tồn tại + copy zip | service (gọi CustomerService) | `findByCode`; copy `zipCode`→`deliveryZipCode` |
| BR-06 ≥1 dòng có sản phẩm; loại dòng trống | service + DTO | lọc dòng `productCode` rỗng; lỗi nếu rỗng hết |
| BR-07/BR-08 tính thành tiền & totals | service (nguồn sự thật) + client (hiển thị) | Decimal: cost=unitCost×qty; retail=unitRetail×qty; grossMargin=Σretail−Σcost; rate=grossMargin/Σretail |
| BR-09 thuế theo 課税区分 | service (đọc `mineDto.taxCategory`) | nếu ngoại thuế → Σretail×rate; nội thuế → 0 |
| BR-10 giữ thuế suất lúc lập | service khi load/save | so `ctaxRate` phiếu với thuế hiện hành |
| BR-11 cho phép đơn giá bán âm | DTO validate | không ràng `min:0` cho `unitRetailPrice` |
| BR-12 bỏ check 0 với SP đặc biệt | service/validator | tái hiện `DiscountUtil.isExceptianalProduct` |
| BR-13 cho phép SP ngoài master | service | không bắt buộc kiểm tra tồn tại product ở dòng |
| BR-14 copy xóa khóa/định danh | `estimate.service.copy` | trả draft bỏ id/audit |
| BR-15 tra chiết khấu theo SP | `estimate.service` gọi Discount/Product service | `findDiscountByProduct` + `findDiscountTiers` |

## 8. Bảng ánh xạ Java → TypeScript (truy vết)
| Java (class/method) | TypeScript (tương đương) | Ghi chú khác biệt |
|---------------------|--------------------------|-------------------|
| `AbstractSlipEditAction#upsert` | `EstimateController.create()` + `.update()` | tách 1 endpoint → POST/PUT |
| `AbstractSlipEditAction#load` | `EstimateController.findOne()` | trả sheet+lines |
| `AbstractSlipEditAction#delete` | `EstimateController.remove()` | truyền `updatedAt` cho lock |
| `AbstractSlipEditAction#copy` | `EstimateController.copy()` | trả draft |
| `InputEstimateAction#validateAtCreateSlip` | `CreateEstimateDto` + custom validators | validate chuyển sang class-validator |
| `EstimateSheetService#save` | `EstimateSheetService.save()` | ym + copy zip giữ nguyên |
| `EstimateSheetService#updateRecord` + `LockEstimateSheet.sql` | `EstimateSheetService.update()` với optimistic lock | `SELECT ... FOR UPDATE` → cơ chế version của ORM |
| `EstimateLineService#save` | `EstimateLineService.saveLines()` | sequence → auto-increment |
| `EstimateSheetService#findEstimateSheetByCondition` (+ SQL) | `EstimateSheetRepository.search()` | 2-way SQL → query builder; `GROSS_MARGIN`/RATE tính trong query |
| `CheckEstimateSheetAction#exists` | `EstimateController.exists()` | JSON → `{exists}` |
| `OutputEstimateSheetSingleAction#pdf` | `EstimateReportService.renderPdf()` | template `0000B` |
| `SearchEstimateResultOutputAction#excel` | `EstimateReportService.exportExcel()` | không LIMIT |
| `DispProductPriceListAction#show` | `EstimateController.priceList()` | dùng Product/Discount service |
| `Beans.copy` / `Beans.createAndCopy` | map thủ công / `class-transformer` | bỏ Seasar |
| `BeanMap` | plain object / DTO có kiểu | bỏ map động, dùng type rõ |
| `ESTIMATE_SHEET_TRN_/*$domainId*/` | cột `domainId` / schema-per-tenant | bỏ tên bảng động |

## 9. Quyết định thiết kế & khác biệt so với bản Java
1. **Tính tiền ở server:** chuyển toàn bộ công thức từ JS `inputEstimate.jsp` (`culcCost`, `culcRetailPrice`, `sum`) vào `EstimateSheetService`/`EstimateLineService` bằng `Decimal`. Client vẫn tính realtime để UX nhưng server là nguồn sự thật → bảo mật & nhất quán. Lý do: bản Java tin số tiền client gửi lên (rủi ro).
2. **Tách `upsert` → POST/PUT:** theo REST; phân biệt tạo/sửa rõ ràng thay cờ `newData`.
3. **Optimistic lock bằng `updatedAt`/`version`:** thay `SELECT ... FOR UPDATE` + so `UPD_DATETM`. Xung đột → HTTP 409. Lý do: phù hợp ORM & stateless API.
4. **Sequence → auto-increment DB** cho `estimateLineId`. Lý do: bỏ `SeqMakerService`.
5. **Multi-tenant:** thay hậu tố bảng động bằng cột `domainId` (+ index) hoặc schema riêng; chọn qua middleware/context. `[CẦN XÁC NHẬN]` chiến lược tenant toàn dự án.
6. **Validation:** annotation S2Struts → `class-validator` DTO + validator nghiệp vụ (ngày, dòng); gom lỗi trả `400` với danh sách (giữ tinh thần `stopOnValidationError=false`).
7. **Kiểu tiền `Decimal`:** không dùng float; serialize `string` ở API. Lý do: tránh sai số làm tròn (Java dùng `BigDecimal`).
8. **DTO dùng chung** đặt ở `packages/types` để `apps/web` và `apps/api` chia sẻ (Create/Update/Search/Result/PriceList + enum danh mục).
9. **Report (PDF/Excel):** tách `EstimateReportService`; template `0000B` cần cổng sang thư viện PDF (thay `AbstractReportWriterAction`). `[CẦN XÁC NHẬN]` thư viện báo cáo (mẫu gốc ở `WEB-INF/report_template`).
10. **Bỏ `findEstimateSheetByConditionLimit` trùng lặp:** hợp nhất thành 1 hàm search có tham số phân trang.

## 10. Rủi ro / điểm chưa rõ
- [CẦN XÁC NHẬN] Chọn ORM (Prisma/TypeORM) — `apps/api` chưa có; ảnh hưởng cách viết repository/lock/transaction.
- [CẦN XÁC NHẬN] Chiến lược multi-tenant (cột `domainId` vs schema) — bản Java dùng tên bảng động theo domain.
- [CẦN XÁC NHẬN] Logic làm tròn (`priceFractCategory`/`taxFractCategory`) và phân loại 課税区分 của 自社 — cần port chính xác từ cấu hình `mineDto`/JS `SetBigDecimalScale` (ngoài scope estimate).
- [CẦN XÁC NHẬN] Thư viện & cơ chế sinh PDF (mẫu `0000B`) và xuất Excel (cột hiển thị lấy từ `detailDispItemService`).
- [CẦN XÁC NHẬN] Các service phụ thuộc ngoài scope (`CustomerService`, `ProductService`, `DiscountRelService`, `DiscountTrnService`, `YmService`, `SeqMakerService`, `commonBulkRetailPrice`) — cần thiết kế/port song song để module estimate chạy được.
- [CẦN XÁC NHẬN] Công thức `estimateTotal` (tổng phiếu) — suy ra = tổng tiền bán + thuế; cần xác nhận với đoạn JS sau dòng 1144 của `inputEstimate.jsp`.
- Rủi ro: dữ liệu báo giá cũ có sản phẩm không còn trong master (BR-13) → join product phải là LEFT JOIN, cột `roMaxNum/supplierPcode` nullable.
