# Design (To-Be TypeScript) – estimate (見積)

> Tài liệu **THIẾT KẾ BẢN PORT (to-be)** — module này sẽ được viết lại thế nào trên stack TypeScript.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Suy luận thiết kế PHẢI truy vết được về tài liệu Requirements + Technical; giả định chưa chốt → `[CẦN XÁC NHẬN]`.
> Stack đích (theo `AGENTS.md`): `apps/api` = **NestJS**, `apps/web` = **Next.js App Router**, `packages/types` = type dùng chung. TS strict, Biome.

## 0. Metadata

| Thuộc tính      | Giá trị                                                         |
| --------------- | --------------------------------------------------------------- |
| Module          | estimate (見積)                                                 |
| Agent thực hiện | devin                                                           |
| Ngày            | 2026-07-20                                                      |
| Dựa trên        | `requirements/estimate.md` + `technical/estimate.md` cùng agent |
| Loại tài liệu   | Design / To-Be (NestJS + Next.js + TS)                          |

## 1. Mục tiêu & nguyên tắc port

- Giữ nguyên hành vi nghiệp vụ (BR-01..BR-13 trong Requirements); hiện đại hoá kỹ thuật: bỏ Seasar2/S2Struts, dùng DI của NestJS, validation bằng `class-validator`/DTO, thay 2-way SQL bằng ORM.
- Giữ tách **Slip/Line** (đầu phiếu `EstimateSheet` vs dòng `EstimateLine`), giữ toàn bộ business rules và cơ chế khóa lạc quan.
- Thay JSP bằng React Server/Client Components của Next.js App Router; AJAX search → gọi REST API.
- Giữ nguyên ranh giới scope: estimate KHÔNG tự tạo 受注; chỉ cung cấp API "load để sao chép".
- Số báo giá (`estimateSheetId`) vẫn do người dùng nhập tay (không auto-generate) — khác với số dòng (auto).

## 2. Kiến trúc đích

```
apps/api (NestJS)   : estimate.module.ts → estimate.controller.ts → estimate.service.ts
                                                                   → estimate-line.service.ts
                                                                   → repository/entity (Sheet, Line)
apps/web (Next.js)  : app/estimate/search   (tìm kiếm)
                      app/estimate/[id]      (nhập/sửa/xoá/sao chép)
                      app/estimate/price     (tra giá sản phẩm)
                      → components → gọi API qua fetch/route handler
packages/types      : EstimateSheetDto, EstimateLineDto, SearchEstimateQueryDto, SearchEstimateResultDto...
```

## 3. Mô hình dữ liệu đích

Bảng ánh xạ trường (từ `*Trn` sang model TS). Nêu rõ kiểu, nullable, default.

**Đầu phiếu — `EstimateSheet` (từ `ESTIMATE_SHEET_TRN`):**
| Trường (Java/DB) | Trường (TS) | Kiểu TS | Null? | Ghi chú |
|------------------|-------------|---------|-------|---------|
| ESTIMATE*SHEET_ID | estimateSheetId | string | N | PK, nhập tay |
| ESTIMATE_ANNUAL | estimateAnnual | number \| null | Y | sinh từ estimateDate |
| ESTIMATE_MONTHLY | estimateMonthly | number \| null | Y | sinh từ estimateDate |
| ESTIMATE_YM | estimateYm | number \| null | Y | sinh từ estimateDate |
| ESTIMATE_DATE | estimateDate | string (ISO date) | N | bắt buộc |
| VALID_DATE | validDate | string (ISO date) \| null | Y | hạn hiệu lực |
| DELIVERY_INFO | deliveryInfo | string \| null | Y | ≤120 |
| USER_ID / USER_NAME | userId / userName | string | N | người nhập (từ phiên đăng nhập) |
| TITLE | title | string \| null | Y | ≤100 |
| DELIVERY_NAME | deliveryName | string \| null | Y | ≤60, default `labels.deliveryDefault` |
| ESTIMATE_CONDITION | estimateCondition | string \| null | Y | ≤120 |
| SUBMIT_NAME | submitName | string | N | ≤60, bắt buộc |
| SUBMIT_PRE_CATEGORY / SUBMIT_PRE | submitPreCategory / submitPre | string \| null | Y | default kính ngữ "様" |
| CUSTOMER_CODE / CUSTOMER_NAME | customerCode / customerName | string \| null | Y | mã ≤15, phải tồn tại nếu nhập |
| CUSTOMER_REMARKS / CUSTOMER_COMMENT_DATA | customerRemarks / customerCommentData | string \| null | Y | |
| DELIVERY_ZIP_CODE | deliveryZipCode | string \| null | Y | lưu ZIP của khách (BR-05) |
| DELIVERY*_ (office/dept/address/tel/fax/email/url/pcName...) | delivery_ | string \| null | Y | các cột giao hàng (đầy đủ trong entity) |
| CTAX*RATE | ctaxRate | string \| null | Y | thuế suất áp cho phiếu |
| CTAX_PRICE_TOTAL | ctaxPriceTotal | number \| null | Y | tiền thuế |
| COST_TOTAL | costTotal | number \| null | Y | tổng vốn |
| RETAIL_PRICE_TOTAL | retailPriceTotal | number \| null | Y | tổng giá bán |
| ESTIMATE_TOTAL | estimateTotal | number \| null | Y | tổng phiếu |
| MEMO | memo | string \| null | Y | ≤1000 |
| TAX_FRACT_CATEGORY / PRICE_FRACT_CATEGORY | taxFractCategory / priceFractCategory | string \| null | Y | quy tắc làm tròn `[CẦN XÁC NHẬN]` |
| CRE*_/UPD\__ | creFunc/creDatetm/creUser/updFunc/updDatetm/updUser | string/Date | Y | audit; `updDatetm` dùng khóa lạc quan |

**Dòng — `EstimateLine` (từ `ESTIMATE_LINE_TRN`):**
| Trường (Java/DB) | Trường (TS) | Kiểu TS | Null? | Ghi chú |
|------------------|-------------|---------|-------|---------|
| ESTIMATE_LINE_ID | estimateLineId | number | N | PK, auto (sequence) |
| ESTIMATE_SHEET_ID | estimateSheetId | string | N | FK → Sheet |
| LINE_NO | lineNo | number | N | đánh lại từ 1 khi lưu |
| PRODUCT_CODE | productCode | string \| null | Y | ≤20; không bắt buộc tồn tại master |
| CUSTOMER_PCODE | customerPcode | string \| null | Y | mã sản phẩm phía khách |
| PRODUCT_ABSTRACT | productAbstract | string \| null | Y | ≤60 |
| QUANTITY | quantity | number | N | ≠0 |
| UNIT_COST / COST | unitCost / cost | number \| null | Y | vốn (0-check trừ sản phẩm đặc biệt) |
| UNIT_RETAIL_PRICE / RETAIL_PRICE | unitRetailPrice / retailPrice | number | N | ≠0, trong PRICE_MIN..MAX; cho phép âm |
| REMARKS | remarks | string \| null | Y | ≤120 |
| (join) SUPPLIER_PCODE / RO_MAX_NUM | supplierPcode / roMaxNum | string/number \| null | Y | từ LEFT JOIN PRODUCT_MST (EstimateLineProductJoin) |

- **ORM/cách truy cập dữ liệu đề xuất:** `[CẦN XÁC NHẬN]` chưa chốt ORM trong repo (`apps/api` NestJS hiện chưa có entity estimate). Đề xuất **Prisma** hoặc **TypeORM**; cần quyết định trước khi hiện thực. Multi-tenant bảng `..._TRN_<domainId>` (hậu tố domain động) cần map sang cơ chế schema/tenant tương ứng `[CẦN XÁC NHẬN]`.

## 4. API contract (REST)

| Method | Path                                   | Mô tả                                       | Request DTO              | Response DTO                                          |
| ------ | -------------------------------------- | ------------------------------------------- | ------------------------ | ----------------------------------------------------- |
| GET    | `/estimate`                            | tìm kiếm (phân trang)                       | `SearchEstimateQueryDto` | `{ items: EstimateSearchResultDto[]; total: number }` |
| GET    | `/estimate/:id`                        | lấy 1 phiếu + dòng                          | —                        | `EstimateDto` (sheet + lines)                         |
| GET    | `/estimate/:id/exists`                 | kiểm tra tồn tại số phiếu                   | —                        | `{ exists: boolean; estimateSheetId?: string }`       |
| POST   | `/estimate`                            | tạo mới                                     | `UpsertEstimateDto`      | `EstimateDto`                                         |
| PUT    | `/estimate/:id`                        | cập nhật (kèm `updDatetm` để khóa lạc quan) | `UpsertEstimateDto`      | `EstimateDto`                                         |
| DELETE | `/estimate/:id`                        | xoá (kèm `updDatetm`)                       | `{ updDatetm: string }`  | `{ deleted: true }`                                   |
| POST   | `/estimate/:id/copy`                   | nạp dữ liệu để tạo bản sao (không ghi DB)   | —                        | `UpsertEstimateDto` (đã xoá khóa/audit)               |
| GET    | `/estimate/:id/pdf`                    | in phiếu PDF (template `0000B`)             | —                        | file PDF                                              |
| GET    | `/estimate/export`                     | xuất kết quả tìm kiếm ra Excel              | `SearchEstimateQueryDto` | file Excel                                            |
| GET    | `/estimate/product-price/:productCode` | tra giá & chiết khấu sản phẩm               | —                        | `ProductPriceDto` (+ discountTrnList)                 |

- Ghi chú: gộp `upsert` Java (một endpoint) thành POST/PUT tách theo REST; cờ `newData` thay bằng chọn method. `updDatetm` truyền trong body PUT/DELETE để giữ khóa lạc quan (BR-13).

## 5. NestJS module design (apps/api)

| Thành phần      | File đề xuất                                                                                                                             | Trách nhiệm                                                                               | Map từ (Java)                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Module          | `estimate/estimate.module.ts`                                                                                                            | khai báo controller + provider + import ORM                                               | (cấu hình dicon Seasar)                                                                                               |
| Controller      | `estimate/estimate.controller.ts`                                                                                                        | route + validate DTO (`ValidationPipe`)                                                   | `InputEstimateAction`, `SearchEstimate*`, `OutputEstimate*`, `DispProductPriceListAction`, `CheckEstimateSheetAction` |
| Service (sheet) | `estimate/estimate.service.ts`                                                                                                           | logic đầu phiếu: save/update/delete/search/load; tính năm-tháng độ; khóa lạc quan         | `EstimateSheetService`                                                                                                |
| Service (line)  | `estimate/estimate-line.service.ts`                                                                                                      | logic dòng: save (insert/update/reindex lineNo), delete theo sheet/ids, load join product | `EstimateLineService`                                                                                                 |
| DTO             | `estimate/dto/*.dto.ts` (`UpsertEstimateDto`, `EstimateLineDto`, `SearchEstimateQueryDto`, `SearchEstimateResultDto`, `ProductPriceDto`) | input/output + class-validator                                                            | `InputEstimateForm`/`*Dto`, `SearchEstimateForm`, `DispProductPriceListForm`                                          |
| Entity/Model    | `estimate/entities/{estimate-sheet,estimate-line}.entity.ts`                                                                             | ánh xạ bảng                                                                               | `EstimateSheetTrn`, `EstimateLineTrn`                                                                                 |
| Phụ thuộc       | inject `CustomerService`, `ProductService`, `CategoryService`, `DiscountService`, `TaxRateService`, `YmService`, `SeqService`            | dịch vụ master/nền tảng                                                                   | các `@Resource` tương ứng                                                                                             |

- Validate: chuyển các annotation S2Struts sang class-validator: `@IsNotEmpty` (estimateSheetId, estimateDate, submitName), `@MaxLength` (title 100, submitName/deliveryName 60, deliveryInfo/estimateCondition/remarks 120, memo 1000, customerCode 15), `@Matches` cho half-width mask, kiểm tra ngày (`estimateDate <= validDate`) bằng custom validator, kiểm tra từng dòng (số lượng/đơn giá/thành tiền ≠0, khoảng giá) trong service hoặc DTO nâng cao (giữ message tương đương `errors.line.*`).

## 6. Web design (apps/web – Next.js)

| Màn hình | Route                          | Component chính                                         | State / data                                       | Gọi API                                                    |
| -------- | ------------------------------ | ------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Tìm kiếm | `app/estimate/search`          | `EstimateSearchForm`, `EstimateResultTable`             | điều kiện lọc, danh sách + phân trang, cột lãi gộp | `GET /estimate`                                            |
| Nhập/sửa | `app/estimate/[id]` (và `new`) | `EstimateHeaderForm`, `EstimateLineGrid`, `TotalsPanel` | đầu phiếu + grid dòng, tổng tính realtime          | `GET/POST/PUT/DELETE /estimate`, `POST /estimate/:id/copy` |
| Tra giá  | `app/estimate/price`           | `ProductPriceLookup`, `DiscountTable`                   | productCode → giá + bậc chiết khấu                 | `GET /estimate/product-price/:code`                        |
| In/Xuất  | (nút trong 2 màn hình trên)    | link tải file                                           | —                                                  | `GET /estimate/:id/pdf`, `GET /estimate/export`            |

- Kiểm tra số phiếu khi blur ô số báo giá → `GET /estimate/:id/exists` (thay AJAX `CheckEstimateSheet`).
- Tính `cost`/`retailPrice`/các tổng ở client (như bản Java) trong `EstimateLineGrid`/`TotalsPanel`; nên **đồng thời** tính lại/kiểm tra ở service (xem mục 9 & BR-14).

## 7. Business rules → nơi hiện thực

| Mã BR (từ Requirements)                   | Hiện thực ở đâu                    | Cách làm                                                                  |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| BR-01 (số phiếu nhập tay, unique)         | DTO + service + `GET :id/exists`   | `@IsNotEmpty`; check tồn tại trước insert                                 |
| BR-02 (năm-tháng độ từ ngày)              | `estimate.service`                 | gọi `YmService` khi save                                                  |
| BR-03 (ngày ≤ hạn hiệu lực)               | custom validator/DTO               | so sánh 2 ngày, message tương đương `errors.date.estimate`                |
| BR-04 (khách phải tồn tại)                | `estimate.service`                 | gọi `CustomerService.exists`                                              |
| BR-05 (lưu ZIP khách vào deliveryZipCode) | `estimate.service`                 | nạp Customer, set field khi save                                          |
| BR-06 (≥1 dòng có productCode)            | `estimate.service`/DTO             | kiểm mảng lines                                                           |
| BR-07 (auto lineId + reindex lineNo)      | `estimate-line.service`            | sequence DB + đánh lại lineNo từ 1                                        |
| BR-08 (bỏ 0-check cho sản phẩm đặc biệt)  | validator dòng                     | port `DiscountUtil.isExceptianalProduct`                                  |
| BR-09 (cho phép đơn giá bán âm)           | validator dòng                     | không chặn số âm                                                          |
| BR-10 (lãi gộp & tỷ lệ)                   | truy vấn tìm kiếm                  | tính trong query/ORM: `retailPriceTotal - costTotal`, `/retailPriceTotal` |
| BR-11 (chiết khấu số lượng)               | `estimate.service` (product-price) | join Discount + discountTrn                                               |
| BR-12 (default kính ngữ/ nơi giao)        | DTO default / web                  | set khi tạo mới                                                           |
| BR-13 (khóa lạc quan theo updDatetm)      | `estimate.service` (PUT/DELETE)    | so `updDatetm`; xung đột → 409 Conflict                                   |
| BR-14 (công thức tính dòng/tổng)          | `[CẦN XÁC NHẬN]`                   | cần xác nhận nơi tính trước khi port (client + kiểm ở service)            |

## 8. Bảng ánh xạ Java → TypeScript (truy vết)

| Java (class/method)                                    | TypeScript (tương đương)                    | Ghi chú khác biệt                                   |
| ------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------- |
| `InputEstimateAction#upsert`                           | `EstimateController.create()` / `.update()` | tách POST/PUT thay cờ `newData`                     |
| `InputEstimateAction#delete`                           | `EstimateController.remove()`               | truyền `updDatetm` để khóa lạc quan                 |
| `InputEstimateAction#copy`                             | `EstimateController.copy()`                 | trả DTO đã xoá khóa/audit, không ghi DB             |
| `SearchEstimateResultAjaxAction#execSearch`            | `EstimateService.search()`                  | LIMIT/OFFSET → phân trang                           |
| `SearchEstimateResultOutputAction#excel`               | `EstimateController.export()`               | rowCount = null (không giới hạn)                    |
| `OutputEstimateSheetSingleAction#pdf`                  | `EstimateController.pdf()`                  | template `0000B` (module report)                    |
| `CheckEstimateSheetAction#exists`                      | `EstimateController.exists()`               | JSON → REST                                         |
| `DispProductPriceListAction#show`                      | `EstimateController.productPrice()`         | gộp Product + Discount + DiscountTrn                |
| `EstimateSheetService.save/loadBySlipId`               | `EstimateService.save/findById`             | ORM thay 2-way SQL                                  |
| `EstimateLineService.save/loadBySlip`                  | `EstimateLineService.save/findBySheet`      | join product qua relation                           |
| `Beans.createAndCopy` / `Beans.copy` + `dateConverter` | `class-transformer` / map thủ công          | bỏ Seasar; xử lý ngày bằng ISO string               |
| `lockRecord` + `LockEstimateSheet.sql (FOR UPDATE)`    | transaction ORM + so `updDatetm`            | bi quan (FOR UPDATE) + lạc quan (version/timestamp) |
| `SeqMakerService.nextval`                              | sequence/auto-increment DB                  |                                                     |
| `BeanMap`                                              | interface/type TS rõ kiểu                   | tránh `any` (theo AGENTS.md)                        |

## 9. Quyết định thiết kế & khác biệt so với bản Java

- Tách endpoint `upsert` → POST/PUT theo REST; `delete`/`copy` thành route riêng.
- Số dòng (`estimateLineId`) dùng auto-increment/sequence của DB thay `SeqMakerService`; `lineNo` vẫn đánh lại từ 1 khi lưu để giữ hành vi.
- Khóa lạc quan: chuyển so sánh `updDatetm` thủ công sang version column hoặc so timestamp trong transaction; xung đột trả HTTP 409 (thay `UnabledLockException`).
- Validation dời từ annotation S2Struts sang class-validator + custom validators; giữ nguyên message keys để tra cứu i18n (`errors.line.*`, `errors.date.estimate`, `errors.dataNotExist`, `errors.noline`).
- Tính lãi gộp & tỷ lệ: ưu tiên tính trong truy vấn (giữ tương đương SQL) để dùng cho sắp xếp/xuất; tránh chia cho 0 khi `retailPriceTotal = 0` (SQL gốc có rủi ro chia 0 — cần xử lý ở bản TS).
- Chuẩn hóa full→half width (`zenkakuNumToHankaku`) cho ô ngày: xử lý ở tầng web/DTO transform.
- Bỏ hậu tố bảng động `_<domainId>`: thay bằng cơ chế multi-tenant của ORM/schema `[CẦN XÁC NHẬN]`.

## 10. Rủi ro / điểm chưa rõ

- [CẦN XÁC NHẬN] Chọn ORM (Prisma/TypeORM) và cách map multi-tenant (`..._TRN_<domainId>`).
- [CẦN XÁC NHẬN] Công thức tính dòng (`cost`, `retailPrice`) và các tổng/`grossMargin` (Technical mục 10) — cần chốt để đặt logic đúng chỗ (client vs service).
- [CẦN XÁC NHẬN] Quy tắc `taxFractCategory`/`priceFractCategory` (làm tròn thuế/đơn giá) khi tính tổng.
- [CẦN XÁC NHẬN] Engine xuất PDF (template `0000B`) & Excel trên stack TS (thư viện, template) — thuộc phối hợp với module report.
- [CẦN XÁC NHẬN] Cơ chế phân quyền tương ứng `MENU_ID.*` trên NestJS (guard/role).
- [CẦN XÁC NHẬN] Xử lý chia cho 0 ở tỷ lệ lãi gộp khi `retailPriceTotal = 0`.
