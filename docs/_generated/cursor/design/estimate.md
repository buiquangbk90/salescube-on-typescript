# Design (To-Be TypeScript) – estimate (見積)

> Tài liệu **THIẾT KẾ BẢN PORT (to-be)** — module này sẽ được viết lại thế nào trên stack TypeScript.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Suy luận thiết kế PHẢI truy vết được về tài liệu Requirements + Technical; giả định chưa chốt → `[CẦN XÁC NHẬN]`.
> Stack đích (theo `AGENTS.md`): `apps/api` = **NestJS**, `apps/web` = **Next.js App Router**, `packages/types` = type dùng chung. TS strict, Biome.

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | estimate (見積) |
| Agent thực hiện | cursor |
| Ngày | 2026-07-20 |
| Dựa trên | `requirements/estimate.md` + `technical/estimate.md` cùng agent |
| Loại tài liệu | Design / To-Be (NestJS + Next.js + TS) |

## 1. Mục tiêu & nguyên tắc port
- Giữ nguyên hành vi nghiệp vụ đã chốt ở Requirements (BR-01…BR-20) và luồng Technical (search / upsert / delete / copy / excel / pdf / price check / exists).
- Hiện đại hoá kỹ thuật: bỏ Seasar/S2Struts/JSP; dùng NestJS DI + validation pipe; Next.js App Router thay JSP.
- **Giữ tách Slip / Line**: `EstimateSheet` và `EstimateLine` service/repository riêng; transaction bao cả hai khi upsert/delete.
- Không bịa rule mới (ví dụ không tự sinh `estimateSheetId` trừ khi product quyết định đổi BR-14).
- `apps/api` hiện chưa chọn ORM trong `package.json` → lựa chọn persistence đánh dấu `[CẦN XÁC NHẬN]`.

## 2. Kiến trúc đích
```
apps/api (NestJS)
  estimate.module.ts
    → estimate.controller.ts          (REST; map từ *Action)
    → estimate-sheet.service.ts       (map EstimateSheetService + AbstractSlip rules)
    → estimate-line.service.ts        (map EstimateLineService)
    → estimate.repository / entities  (sheet + line)
    → dto/*.dto.ts

apps/web (Next.js App Router)
  app/estimate/search/page.tsx
  app/estimate/[id]/page.tsx | app/estimate/new/page.tsx
  app/estimate/price-list/page.tsx
  components/estimate/*  → gọi API (fetch/client)

packages/types
  estimate.ts  — shared EstimateSheet, EstimateLine, SearchQuery, SearchResult
```

Phụ thuộc cross-module qua Nest modules: `CustomerModule`, `ProductModule`, `CategoryModule`, `DiscountModule`, `YmModule`, `SeqModule`, `Auth/Menu` — implement dần theo master port.

## 3. Mô hình dữ liệu đích
| Trường (Java/DB) | Trường (TS) | Kiểu TS | Null? | Ghi chú |
|------------------|-------------|---------|-------|---------|
| ESTIMATE_SHEET_ID | estimateSheetId | string | N | PK; user-entered (BR-14) |
| ESTIMATE_ANNUAL | estimateAnnual | number \| null | Y | từ YmService |
| ESTIMATE_MONTHLY | estimateMonthly | number \| null | Y | |
| ESTIMATE_YM | estimateYm | number \| null | Y | |
| ESTIMATE_DATE | estimateDate | string (ISO date) | N | API dùng `YYYY-MM-DD` |
| DELIVERY_INFO | deliveryInfo | string \| null | Y | max 120 |
| VALID_DATE | validDate | string \| null | Y | |
| USER_ID / USER_NAME | userId / userName | string | N* | *set từ session khi tạo |
| REMARKS | remarks | string \| null | Y | max 120 |
| TITLE | title | string \| null | Y | max 100 |
| ESTIMATE_CONDITION | estimateCondition | string \| null | Y | max 120 |
| SUBMIT_NAME | submitName | string | N | max 60 |
| SUBMIT_PRE_CATEGORY / SUBMIT_PRE | submitPreCategory / submitPre | string \| null | Y | |
| CUSTOMER_CODE / NAME / REMARKS / COMMENT | customerCode / customerName / customerRemarks / customerCommentData | string \| null | Y | code max 15 |
| DELIVERY_NAME | deliveryName | string \| null | Y | default label |
| DELIVERY_ZIP_CODE | deliveryZipCode | string \| null | Y | copy từ customer ZIP khi save |
| CTAX_PRICE_TOTAL / CTAX_RATE | ctaxPriceTotal / ctaxRate | string \| number | Y | dùng `string` hoặc decimal lib `[CẦN XÁC NHẬN]` |
| COST_TOTAL / RETAIL_PRICE_TOTAL / ESTIMATE_TOTAL | costTotal / retailPriceTotal / estimateTotal | decimal-like | Y | |
| MEMO | memo | string \| null | Y | form max 1000; DB VARCHAR(2000) |
| TAX_FRACT_CATEGORY / PRICE_FRACT_CATEGORY | taxFractCategory / priceFractCategory | string \| null | Y | |
| UPD_DATETM | updDatetm | string (ISO datetime) | Y | optimistic lock token |
| CRE_*/UPD_*/DEL_* | creFunc, creDatetm, … | string \| null | Y | audit |
| ESTIMATE_LINE_ID | estimateLineId | string \| number | Y | null khi dòng mới |
| LINE_NO | lineNo | number | N | gán lại khi save |
| PRODUCT_CODE | productCode | string | N* | *bắt buộc trên dòng “có hiệu lực” |
| CUSTOMER_PCODE | customerPcode | string \| null | Y | |
| PRODUCT_ABSTRACT | productAbstract | string \| null | Y | max 60 |
| QUANTITY | quantity | decimal-like | N | |
| UNIT_COST / UNIT_RETAIL_PRICE | unitCost / unitRetailPrice | decimal-like | Y / N | |
| COST / RETAIL_PRICE | cost / retailPrice | decimal-like | Y / N | |
| (computed) GROSS_MARGIN / RATE | grossMargin / grossMarginRate | number \| null | Y | chỉ search response |

- ORM/cách truy cập dữ liệu đề xuất: **Prisma hoặc TypeORM** — `[CẦN XÁC NHẬN]` (repo `apps/api` chưa phụ thuộc ORM).
- Đề xuất interim: repository interface + SQL tương đương file `entity/sql/estimate/*` để port 1-1 trước khi chuẩn hoá schema naming (bỏ suffix `_XXXXX` domain).

## 4. API contract (REST)
| Method | Path | Mô tả | Request DTO | Response DTO |
|--------|------|-------|-------------|--------------|
| GET | `/estimates` | Tìm kiếm phân trang | `SearchEstimateQueryDto` | `{ total, items: SearchEstimateItemDto[], columns? }` |
| GET | `/estimates/export` | Xuất Excel (cùng filter, no limit) | `SearchEstimateQueryDto` | file stream (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` hoặc giữ xls legacy `[CẦN XÁC NHẬN]`) |
| GET | `/estimates/:estimateSheetId` | Load phiếu + dòng | — | `EstimateDetailDto` |
| HEAD/GET | `/estimates/:estimateSheetId/exists` | Check tồn tại (UC AJAX) | — | `{ exists: boolean }` hoặc 404 |
| POST | `/estimates` | Tạo mới | `UpsertEstimateDto` | `EstimateDetailDto` |
| PUT | `/estimates/:estimateSheetId` | Cập nhật (kèm `updDatetm`) | `UpsertEstimateDto` | `EstimateDetailDto` |
| DELETE | `/estimates/:estimateSheetId` | Xoá | body/header `updDatetm` | `{ ok: true }` |
| POST | `/estimates/:estimateSheetId/copy` | Chuẩn bị bản copy (không persist) | — | `EstimateDetailDto` (id/lineId/audit cleared) |
| GET | `/estimates/:estimateSheetId/pdf` | Xuất PDF | — | `application/pdf` |
| GET | `/estimates/product-price` | Tra giá + discount tiers | `productCode` | `ProductPriceListDto` |

`UpsertEstimateDto` gồm header fields + `lines: EstimateLineDto[]` + `deleteLineIds: string[]` + `updDatetm?`.

## 5. NestJS module design (apps/api)
| Thành phần | File đề xuất | Trách nhiệm | Map từ (Java) |
|-----------|--------------|-------------|---------------|
| Module | `estimate/estimate.module.ts` | wiring | — |
| Controller | `estimate.controller.ts` | HTTP + pipes | `*Action` |
| Sheet service | `estimate-sheet.service.ts` | YM, customer ZIP, insert/update/lock/search/delete | `EstimateSheetService` |
| Line service | `estimate-line.service.ts` | renumber, seq, CRUD lines | `EstimateLineService` |
| Facade (optional) | `estimate.service.ts` | `@Transactional` upsert/delete orchestration | `AbstractSlipEditAction#upsert/delete` |
| Validation | `estimate-validation.service.ts` hoặc class-validator + custom | BR-01…BR-10 | `InputEstimateAction#validateAtCreateSlip` |
| DTOs | `dto/search-estimate-query.dto.ts`, `upsert-estimate.dto.ts`, … | input/output | Form + DTO Java |
| Entities | `entities/estimate-sheet.entity.ts`, `estimate-line.entity.ts` | persistence | `*Trn` |
| Excel | `estimate-export.service.ts` | stream workbook | `SearchEstimateResultOutputAction` |
| PDF | `estimate-pdf.service.ts` | render template | `OutputEstimateSheetSingleAction` (`0000B`) |
| Price | method trong controller hoặc `product-price.service.ts` | product + discount | `DispProductPriceListAction` |

Guards: map `SEARCH_ESTIMATE` / `INPUT_ESTIMATE` / `menuUpdate` → Nest guards/casl — chi tiết auth `[CẦN XÁC NHẬN]`.

## 6. Web design (apps/web – Next.js)
| Màn hình | Route | Component chính | State / data | Gọi API |
|----------|-------|-----------------|--------------|---------|
| Tìm kiếm | `app/estimate/search/page.tsx` | `EstimateSearchForm`, `EstimateSearchTable` | query string + pagination client | `GET /estimates` |
| Xuất Excel | nút trên search | — | reuse query | `GET /estimates/export` |
| Nhập mới | `app/estimate/new/page.tsx` | `EstimateEditor` | form state (RHF/zod) | `POST /estimates`, `GET …/exists` |
| Sửa | `app/estimate/[estimateSheetId]/page.tsx` | `EstimateEditor` | load detail + `updDatetm` | `GET/PUT/DELETE`, PDF |
| Copy | action trên editor | `EstimateEditor` prefilled | từ `POST …/copy` | rồi `POST /estimates` |
| Tra giá | `app/estimate/price-list/page.tsx` | `ProductPriceList` | productCode | `GET /estimates/product-price` |

- Server Components cho shell trang; Client Components cho lưới dòng, AJAX exists, phân trang.
- Giữ UX: xác nhận khi số phiếu đã tồn tại (`confirm.estimateSheetId.upd`); khoá PDF/xoá khi phiếu mới; tôn trọng `menuUpdate`.

## 7. Business rules → nơi hiện thực
| Mã BR (từ Requirements) | Hiện thực ở đâu | Cách làm |
|-------------------------|-----------------|----------|
| BR-01 ngày ≤ valid | DTO validator + service | `class-validator` custom + mirror Java parse |
| BR-02 customer tồn tại | `estimate-sheet.service` / validation svc | gọi `CustomerService.isExist` |
| BR-03…BR-10 dòng | `validateForUpsert` | port nguyên logic `validateAtCreateSlip` (kể cả exceptional product) |
| BR-11 YM | `estimate-sheet.service.save` | inject `YmService` |
| BR-12 ZIP | cùng `save` | copy `customerZipCode` → `deliveryZipCode` |
| BR-13 line id + lineNo | `estimate-line.service.save` | sequence + renumber 1..n |
| BR-14 sheet id | API không auto-gen; client bắt buộc | DB PK = request id |
| BR-15 optimistic lock | update path | `WHERE id AND updDatetm = :token`; 409 nếu mismatch |
| BR-16 physical delete | delete facade | delete sheet + lines trong 1 transaction |
| BR-17 tax rate | upsert prep | giữ `ctaxRate` phiếu nếu khác rate hiện hành |
| BR-18 defaults | web form init + API optional defaults | `deliveryName`, `submitPreCategory=PREFIX_SAMA` |
| BR-19 search LIKE | repository query | prefix vs contains như Java |
| BR-20 margin | SQL/select map | tính khi search; document rủi ro chia 0 |

## 8. Bảng ánh xạ Java → TypeScript (truy vết)
| Java (class/method) | TypeScript (tương đương) | Ghi chú khác biệt |
|---------------------|--------------------------|-------------------|
| `SearchEstimateAction` | `GET /estimates` page + column config endpoint (reuse setting) | REST thay JSP init |
| `SearchEstimateResultAjaxAction#doCount/execSearch` | `EstimateSheetService.search` | JSON thay JSP fragment |
| `SearchEstimateResultOutputAction#excel` | `GET /estimates/export` | định dạng xlsx vs xls `[CẦN XÁC NHẬN]` |
| `InputEstimateAction` + `AbstractSlipEditAction#upsert` | `EstimateController.create/update` + facade `@Transactional` | gộp validate vào pipe/service |
| `InputEstimateAction#validateAtCreateSlip` | `EstimateValidationService.validateUpsert` | giữ message key tương đương |
| `AbstractSlipEditAction#delete/copy` | `DELETE …` / `POST …/copy` | copy không ghi DB |
| `CheckEstimateSheetAction#exists` | `GET …/exists` | JSON rõ `exists` |
| `OutputEstimateSheetSingleAction#pdf` | `GET …/pdf` | thay Jasper bằng PDF lib `[CẦN XÁC NHẬN]` |
| `DispProductPriceListAction#show` | `GET /estimates/product-price` | tính đơn giá CK phía API hoặc web (Java tính ở JSP) — đề xuất **tính ở API** để nhất quán |
| `EstimateSheetService#save` | `estimate-sheet.service.save` | Nest DI thay `@Resource` |
| `EstimateLineService#save` | `estimate-line.service.save` | |
| `Beans.copy` | `plain map` / `class-transformer` | bỏ Seasar |
| `UnabledLockException` | `ConflictException` (HTTP 409) | |

## 9. Quyết định thiết kế & khác biệt so với bản Java
1. **REST + JSON** thay ActionForm/JSP; giữ semantic endpoint 1-1 với use case.
2. **Transaction tường minh** bằng `@Transactional` (hoặc Unit of Work) bao sheet+lines — khắc phục điểm `[CẦN XÁC NHẬN]` của Seasar config.
3. **Optimistic lock** trả HTTP 409 + message key tương đương exclusive control.
4. **Decimal**: dùng `string` trên wire hoặc thư viện decimal — `[CẦN XÁC NHẬN]` chuẩn monorepo.
5. **PDF/Excel**: tách service; template report id `0000B` cần port asset — `[CẦN XÁC NHẬN]` công cụ render.
6. **Không tự sinh `estimateSheetId`** trong giai đoạn 1 (trung thực BR-14); nếu UX muốn sequence sau này → đổi Requirements trước.
7. **Gross margin rate khi mẫu số 0**: giai đoạn 1 giữ SQL behavior hoặc trả `null` có document — chọn `null` an toàn hơn nếu product đồng ý (`[CẦN XÁC NHẬN]`).
8. **Domain table suffix `_XXXXX`**: schema TS dùng tên logic không suffix; multi-tenant strategy `[CẦN XÁC NHẬN]`.

## 10. Rủi ro / điểm chưa rõ
- [CẦN XÁC NHẬN] ORM và chuẩn decimal/money trong monorepo.
- [CẦN XÁC NHẬN] AuthZ model (menu IDs → Nest guards).
- [CẦN XÁC NHẬN] Port Jasper `0000B` và format Excel đích.
- [CẦN XÁC NHẬN] Có port trigger HIST / soft-delete hay chỉ physical delete + application audit.
- [CẦN XÁC NHẬN] Tích hợp copy-slip sang rorder (ngoài scope nhưng ảnh hưởng API search `fromCopySlip`).
- [CẦN XÁC NHẬN] Các cột `DELIVERY_*` thừa trên DB: expose trên API hay ẩn cho đến khi có use case.
