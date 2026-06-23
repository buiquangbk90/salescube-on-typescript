# FD-CUST-01: Quản lý Khách hàng (得意先マスタ)

> **Module**: CUST  
> **Loại**: list | create | edit | delete | search  
> **WF Source**: `output/cursor/workflows/WF-02-customer-management.md`  
> **Confidence**: HIGH (legacy WF-02, entity list, source code) / MEDIUM (target — controller vẫn mock)  
> **Legacy Action**: `SearchCustomerAction` (search/list), `EditCustomerAction` (create/update/delete) — `Confirmed by code`  
> **Target**: `apps/web/(app)/customers/*` + `apps/api/src/modules/customers/*`  
> **Ngày cập nhật**: 2026-06-23

---

## 1. 概要 / Tổng quan

| Mục | Nội dung |
|-----|----------|
| **Mục đích** | CRUD master khách hàng (得意先): tìm kiếm, tạo, sửa, xóa mềm; thiết lập quy tắc thanh toán/chốt hóa đơn cho từng KH |
| **Actor** | Nhân viên bán hàng / kế toán có quyền menu Customer Master |
| **Điều kiện tiên quyết** | Đăng nhập; `customer.read` (xem) / `customer.write` (ghi) / `customer.delete` (xóa) |
| **Workflow liên quan** | [WF-02 — Customer Management](../cursor/workflows/WF-02-customer-management.md) |

---

## 2. 画面仕様 / Screen Specification

### 2.1 Route mapping

| Chức năng | Legacy (Struts) | Target (Next.js) | Trạng thái |
|-----------|-----------------|------------------|------------|
| Danh sách + tìm kiếm | `GET /master/searchCustomer/index` | `GET /customers` | ✅ Web page OK |
| Tạo mới | `GET /master/inputCustomer/index` | `GET /customers/new` | ✅ Web page OK |
| Sửa | `GET /master/inputCustomer/edit/{id}` | `GET /customers/[id]` | ✅ Web page OK |
| Lấy danh sách (API) | `POST /master/searchCustomer/find` | `GET /api/customers` | ⚠️ Controller mock — Service/Repo ✅ |
| Lấy chi tiết (API) | `GET /master/inputCustomer/edit/{id}` | `GET /api/customers/:id` | ⚠️ Controller mock |
| Lưu (create API) | `POST /master/inputCustomer/register` | `POST /api/customers` | ⚠️ Controller mock — Service ✅ |
| Lưu (update API) | `POST /master/inputCustomer/register` | `PATCH /api/customers/:id` | ⚠️ Controller mock — Service ✅ |
| Xóa (API) | `POST /master/inputCustomer/delete` | `DELETE /api/customers/:id` | ⚠️ Controller mock — Service ✅ |
| Copy KH | `GET /master/inputCustomer/copy` | TBD | ❌ Chưa có |

### 2.2 Layout — Danh sách (`/customers`)

| Vùng | Thành phần |
|------|------------|
| Header | Tiêu đề "Khách hàng", số kết quả, ô tìm kiếm, nút "+ Tạo mới" |
| Grid | Bảng: Mã, Tên (link), Kana, Liên hệ, Cutoff, Thao tác |
| Footer | Phân trang (20 bản ghi/trang) |

**Tìm kiếm**: theo mã, tên, kana, abbr (case-insensitive)  
**Legacy**: `SearchCustomerAction.createList()` load dropdowns [SearchCustomerAction.java:66-88]  
Sort mặc định: `CUSTOMER_CODE ASC` [SearchCustomerAction.java:56-57]  
**Target evidence**: `apps/web/src/app/(app)/customers/page.tsx`

### 2.3 Layout — Form tạo/sửa (`/customers/new`, `/customers/[id]`)

| Section | Fields hiển thị (target) |
|---------|--------------------------|
| Thông tin cơ bản | code*, name*, nameKana, abbr |
| Địa chỉ & Liên lạc | zipCode, address1, address2, contactName, phone, email |
| Quy tắc thanh toán | taxShift, taxFraction, cutoffGroup, cutoffDay, paybackCycle |
| Ghi chú | remarks |

**Chưa có trên UI (có trong schema Prisma/Zod)**: officeName, fax, url, rankCategory, creditLimit, discountRate, bank info, inChargeUserId.

### 2.4 Fields — Legacy vs Target

| # | Label (JP) | Legacy column | Target field | Type | Required | Max | Ghi chú |
|---|------------|---------------|--------------|------|----------|-----|---------|
| 1 | 得意先コード | CUSTOMER_CODE | `code` | string | Y | 15 (legacy) / 20 (target) | Unique; khóa khi edit |
| 2 | 得意先名 | CUSTOMER_NAME | `name` | string | Y | 60 (legacy) / 255 (target) | normalizeCompanyName |
| 3 | 得意先カナ | CUSTOMER_KANA | `nameKana` | string | N | - | Tìm kiếm |
| 4 | 略称 | CUSTOMER_ABBR | `abbr` | string | N | - | |
| 5 | 郵便番号 | CUSTOMER_ZIP_CODE | `zipCode` | string | N | - | ZIP lookup legacy |
| 6 | 住所1 | CUSTOMER_ADDRESS1 | `address1` | string | N | - | Auto-fill từ ZIP_MST |
| 7 | 住所2 | CUSTOMER_ADDRESS2 | `address2` | string | N | - | |
| 8 | 担当者名 | CUSTOMER_PC_NAME | `contactName` | string | N | - | |
| 9 | 電話 | CUSTOMER_TEL | `phone` | string | N | 15 | |
| 10 | メール | CUSTOMER_EMAIL | `email` | string | N | - | Email format |
| 11 | 税区分 | TAX_SHIFT_CATEGORY | `taxShift` | enum | Y | - | INCLUDED / EXCLUDED |
| 12 | 税端数 | TAX_FRACT_CATEGORY | `taxFraction` | enum | Y | - | FLOOR/CEIL/ROUND |
| 13 | 金額端数 | PRICE_FRACT_CATEGORY | `priceFraction` | enum | Y | - | FLOOR/CEIL/ROUND |
| 14 | 締グループ | CUTOFF_GROUP | `cutoffGroup` | string | Y (legacy) | - | CATEGORY_TRN |
| 15 | 締日 | (inferred) | `cutoffDay` | int | N | 1-31 | 31 = cuối tháng |
| 16 | 回収サイクル | PAYBACK_CYCLE_CATEGORY | `paybackCycle` | enum | Y | - | |
| 17 | 与信限度額 | MAX_CREDIT_LIMIT | `creditLimit` | decimal | N | >= 0 | UI TBD |
| 18 | 得意先ランク | CUSTOMER_RANK_CATEGORY | `rankCategory` | string | N | - | Batch auto-update |
| 19 | 備考 | REMARKS | `remarks` | text | N | 2000 | |

**Legacy source**: `EditCustomerAction.java` — `doInsert()` [L161], `doUpdate()` [L223], `delete()` [L393]  
**Legacy schema**: `Customer.java` (entity class)  
**Target schema**: `packages/shared/src/customer.ts` — `createCustomerSchema` [L24-87]  
**Target DB**: `packages/db/prisma/schema.prisma` model `Customer`

### 2.5 Buttons & Actions

| Button | Legacy | Target | Permission |
|--------|--------|--------|------------|
| 新規 / Tạo mới | navigate input | `/customers/new` | `customer.write` |
| 登録 / Lưu | POST register | POST/PATCH API | `customer.write` |
| 削除 / Xóa | POST delete + confirm | confirm dialog + DELETE | `customer.delete` |
| 戻る | navigate list | browser back / link | `customer.read` |
| Copy | copy action | TBD | `customer.write` |

### 2.6 Navigation flow

```
[/customers] --Tạo mới--> [/customers/new] --Lưu--> [/customers]
[/customers] --click tên--> [/customers/:id] --Lưu--> [/customers/:id]
[/customers] --Xóa confirm--> soft-delete --> refresh list
```

---

## 3. API仕様 / API Specification

### 3.1 Endpoints

#### `GET /api/customers` — Search / List

**Permission**: `customer.read`  
**Query** (`customerSearchSchema`):

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| q | string | N | - | Tìm code, name, nameKana, abbr |
| page | number | N | 1 | |
| pageSize | number | N | 20 | max 100 |

**Response 200**:
```typescript
{
  data: CustomerDto[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Implementation**:  
- `CustomersService.findAll()` → `CustomersRepository.search()` — ✅ logic thật  
- `LEGACY_CONFIRMED`: `customers.service.ts:10-16`, `customers.repository.ts:21-49`  
- Controller hiện trả **mock cứng** — chưa inject `CustomersService` ⚠️ (`customers.controller.ts:28-60`)

#### `GET /api/customers/:id` — Detail

**Permission**: `customer.read`  
**Response 200**: full `Customer` record (`deletedAt: null`)  
**Response 404**: `Customer not found`

#### `POST /api/customers` — Create

**Permission**: `customer.write`  
**Body**: `CreateCustomerInput` (`createCustomerSchema`)

**Response 201**: created customer  
**Response 409**: `Customer code "..." already exists`

**Business logic** (`LEGACY_CONFIRMED` — `customers.service.ts:25-36`):
1. `repo.findByCode(code)` → if exists → `ConflictException` 409
2. `normalizeCompanyName(name)` — `packages/domain/src/customer/normalize.ts`
3. `repo.create({ ...input, createdBy, updatedBy })`  
4. ❌ **MISSING**: `INSERT CUSTOMER_MST_HIST` (audit trail) — chưa implement

#### `PATCH /api/customers/:id` — Update

**Permission**: `customer.write`  
**Body**: `UpdateCustomerInput` (partial, không có `code`)

**Response 200**: updated customer  
**Response 404**: not found

**Business logic** (`LEGACY_CONFIRMED` — `customers.service.ts:39-44`):
1. `findOne(id)` → 404 nếu không tìm thấy  
2. `normalizeCompanyName(name)` nếu name thay đổi  
3. `repo.update(id, { ...data, updatedBy })`  
4. ❌ **MISSING**: `INSERT CUSTOMER_MST_HIST`

#### `DELETE /api/customers/:id` — Soft delete

**Permission**: `customer.delete`  
**Response 204**: no content  
**Logic** (`LEGACY_CONFIRMED` — `customers.repository.ts:60-65`): `SET deletedAt = now(), updatedBy = userId`  
❌ **MISSING**: Check SALES_SLIP_TRN open trước khi xóa  
❌ **MISSING**: `INSERT CUSTOMER_MST_HIST`

### 3.2 Error responses

| HTTP | Code / Message | Điều kiện | Legacy tương đương |
|------|----------------|-----------|-------------------|
| 400 | Zod field errors | Validation fail | inline form errors |
| 403 | Forbidden | Thiếu permission | menu check fail |
| 404 | Customer not found | id không tồn tại hoặc đã xóa | - |
| 409 | Customer code already exists | Trùng code | errors.duplicate |
| 409 | TBD — cannot delete | Có relation (đọc `CustomerService.countRelations()`) | `errors.db.delete.relation` (L412) |

---

## 4. 処理フロー / Processing Logic

### 4.1 List / Search

`Confirmed by code` — `SearchCustomerAction.java:32-110`, `customers.repository.ts:21-49`

```
LEGACY:
  SearchCustomerAction.doBeforeIndex() [L55]: set sortColumn=CUSTOMER_CODE, sortOrderAsc=true
  SearchCustomerAction.createList() [L66]: load customerRankList + cutoffGroupList (dropdowns)
  → CustomerService.search(form) [inferred]

TARGET:
  1. Guard: customer.read  [⚠️ @Public() bypass hiện tại]
  2. Parse query (Zod customerSearchSchema)  [✅ ZodValidationPipe]
  3. WHERE deletedAt IS NULL  [✅ customers.repository.ts:27-28]
  4. IF q: OR match name/nameKana/code/abbr insensitive  [✅ customers.repository.ts:31-37]
  5. ORDER BY code ASC  [✅ customers.repository.ts:45]
  6. skip/take paginate  [✅ customers.repository.ts:40-48]
  7. Return { data, total, page, pageSize }  [✅ customers.service.ts:16]
```

### 4.2 Create

`Confirmed by code` — `EditCustomerAction.java:108-163`, `customers.service.ts:25-36`

```
LEGACY — EditCustomerAction:
  index() [L108]: init form mới, load InitMstService defaults [L438]
  insert() [L161]: → super.doInsert() → CustomerService.insert(dto)
  doInsertAfter() [L172]: INSERT DELIVERY_MST (deliveryList) + INSERT CUSTOMER_REL
  → ZipService.checkZipCodeAndAddress() → warning nếu ZIP không khớp

TARGET:
  1. Guard: customer.write  [⚠️ @Public() bypass — customers.controller.ts:29]
  2. Validate body (createCustomerSchema)  [✅ ZodValidationPipe]
  3. repo.findByCode(code) → ConflictException 409  [✅ customers.service.ts:26-28]
  4. normalizeCompanyName(name)  [✅ customers.service.ts:33]
  5. repo.create({ ...input, createdBy, updatedBy })  [✅ customers.service.ts:31-36]
  6. INSERT CUSTOMER_MST_HIST (snapshot)  [❌ MISSING]
  7. INSERT DELIVERY_MST + CUSTOMER_REL  [❌ MISSING]
  8. Return 201  [⚠️ controller mock]
```

### 4.3 Update

`Confirmed by code` — `EditCustomerAction.java:223-383`, `customers.service.ts:39-44`

```
LEGACY — EditCustomerAction:
  update() [L223]: → doUpdate() [L233]
  doUpdate() [L233]: customerService.findCustomerByCode(key) → null → errors.exclusive.control.deleted
  → so sánh dto vs customer [L247]: chỉ UPDATE nếu có thay đổi
  doUpdateAfter() [L279]: sync deliveryList + billTo (DELIVERY_MST + CUSTOMER_REL)
  → ZipService checks [L346, L356, L365]

TARGET:
  1. Guard: customer.write  [⚠️ @Public() bypass]
  2. findOne(id) → NotFoundException 404  [✅ customers.service.ts:19-22]
  3. Validate partial body (updateCustomerSchema)  [✅ ZodValidationPipe]
  4. IF name: normalizeCompanyName  [✅ customers.service.ts:42]
  5. repo.update(id, data)  [✅ customers.service.ts:39-44]
  6. Sync DELIVERY_MST + CUSTOMER_REL  [❌ MISSING]
  7. INSERT CUSTOMER_MST_HIST  [❌ MISSING]
  8. Return 200  [⚠️ controller mock]
```

### 4.4 Delete (soft-delete)

`Confirmed by code` — `EditCustomerAction.java:393-425`, `customers.repository.ts:60-64`

```
LEGACY — EditCustomerAction:
  delete() [L393]: → doDelete() [L402]
  doDelete() [L402]: customerService.countRelations(customerCode) [L404]
    → Map<String, Object> result — đếm quan hệ từ NHIỀU bảng (không chỉ SALES_SLIP)
    → nếu bất kỳ count > 0 → errors.db.delete.relation [L412]
    → super.doDelete() → CustomerService.delete() → SET DEL_DATETM

TARGET:
  1. Guard: customer.delete  [⚠️ @Public() bypass]
  2. findOne(id) → 404  [✅ customers.service.ts:46-48]
  3. countRelations() — check NHIỀU bảng, không chỉ SALES_SLIP  [❌ MISSING — cần xác định customerService.countRelations() query]
  4. repo.softDelete(id, userId): SET deletedAt=now()  [✅ customers.repository.ts:60-64]
  5. INSERT CUSTOMER_MST_HIST  [❌ MISSING]
  6. Return 204  [⚠️ controller mock]
```

> ⚠️ **Correction**: Legacy `doDelete()` [L402-426] gọi `customerService.countRelations()` — check nhiều quan hệ, không chỉ SALES_SLIP_TRN. Cần đọc `CustomerService.countRelations()` để biết đủ danh sách bảng.

### 4.5 ZIP lookup (legacy only — TBD target)

```
User nhập zipCode → blur
  → AJAX CheckZipCodeAndAddressAjaxAction
  → ZIP_MST lookup
  → auto-fill address1
```

---

## 5. DBアクセス / Database Access

### 5.1 Tables

| Bảng (legacy) | Target (Prisma) | Đọc | Ghi | Ghi chú |
|---------------|-----------------|-----|-----|---------|
| CUSTOMER_MST | `customer` | SELECT | INSERT/UPDATE | Main |
| CUSTOMER_MST_HIST | TBD `customer_hist` | - | INSERT | Audit — chưa migrate |
| CUSTOMER_REL | TBD | SELECT | INSERT/DELETE | Quan hệ KH — chưa migrate |
| CUSTOMER_RANK_MST | TBD | SELECT | - | Dropdown rank |
| CATEGORY_TRN | TBD | SELECT | - | cutoffGroup dropdown |
| DELIVERY_MST | TBD | SELECT | - | Địa chỉ giao hàng |
| SEQ_MAKER | — | — | — | Legacy allocate seq — Target: `@default(cuid())` `TARGET_DECISION` |
| ZIP_MST | TBD | SELECT | - | ZIP lookup |

### 5.2 Prisma model (target)

```prisma
// LEGACY_CONFIRMED — packages/db/prisma/schema.prisma (Customer model)
model Customer {
  id              String    @id @default(cuid())   // TARGET_DECISION: cuid() thay SEQ_MAKER
  code            String    @unique                // CUSTOMER_CODE — user-defined
  name            String                           // CUSTOMER_NAME
  nameKana        String?                          // CUSTOMER_KANA
  abbr            String?                          // CUSTOMER_ABBR
  zipCode         String?                          // CUSTOMER_ZIP_CODE
  address1        String?                          // CUSTOMER_ADDRESS1
  phone           String?                          // CUSTOMER_TEL
  email           String?                          // CUSTOMER_EMAIL
  taxShift        String    @default("EXCLUDED")   // TAX_SHIFT_CATEGORY
  taxFraction     String    @default("FLOOR")      // TAX_FRACT_CATEGORY
  priceFraction   String    @default("FLOOR")      // PRICE_FRACT_CATEGORY
  cutoffGroup     String?                          // CUTOFF_GROUP
  cutoffDay       Int?                             // inferred
  paybackCycle    String    @default("NEXT_MONTH") // PAYBACK_CYCLE_CATEGORY
  creditLimit     Decimal?                         // MAX_CREDIT_LIMIT
  discountRate    Decimal?                         // inferred
  rankCategory    String?                          // CUSTOMER_RANK_CATEGORY — batch updated
  remarks         String?                          // REMARKS
  deletedAt       DateTime?                        // DEL_DATETM
  createdBy       String?
  updatedBy       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("customer")
}
```

### 5.3 Transaction boundary

- Legacy: single HTTP request = app-layer transaction (Seasar2)  
- Target: mỗi create/update/delete = 1 Prisma operation; cần `$transaction` khi thêm `customer_hist` + `customer_rel`

---

## 6. バリデーション / Validation Rules

| # | Rule | Timing | Error (target) | Legacy | Evidence |
|---|------|--------|----------------|--------|----------|
| 1 | code required | submit | Mã khách hàng là bắt buộc | required | `customer.ts:28` |
| 2 | code alphanumeric | submit | Chỉ chấp nhận chữ, số... | alphanumeric | `customer.ts:30` |
| 3 | code unique | create | 409 Conflict | duplicate | `customers.service.ts:26-28` |
| 4 | name required | submit | Tên là bắt buộc | required | WF-02 |
| 5 | email format | submit | Email không hợp lệ | format | `customer.ts:49-54` |
| 6 | cutoffDay 1-31 | submit | Zod int min/max | - | `customer.ts:65-71` |
| 7 | creditLimit >= 0 | submit | nonnegative | >= 0 | WF-02 |
| 8 | cutoffGroup in CATEGORY | submit | TBD | required legacy | WF-02 — UI chưa enforce |
| 9 | `customerService.countRelations()` → bất kỳ count > 0 → reject delete | delete | TBD 409 | `errors.db.delete.relation` | `EditCustomerAction.java:402-423` — `Confirmed by code` |

### Zod schemas (implemented)

- `createCustomerSchema` — `packages/shared/src/customer.ts`
- `updateCustomerSchema` — partial, omit `code`
- `customerSearchSchema` — list query

---

## 7. 権限 / Permission

| Check | Legacy | Target | Ghi chú |
|-------|--------|--------|---------|
| View list/detail | `MENU_ID.CUSTOMER_MST` + `isMenuValid()` | `customer.read` | |
| Create/Update | `isMenuUpdate()` | `customer.write` | |
| Delete | `isMenuUpdate()` | `customer.delete` | |

**Gap**: Controller đang `@Public()` — bỏ qua auth guard tạm thời ⚠️ (`customers.controller.ts:29`)

---

## 8. エラー処理 / Error Handling

| Scenario | Legacy | Target |
|----------|--------|--------|
| Validation fail | Giữ form + inline errors | 400 + Zod errors |
| Duplicate code | errors.duplicate | 409 ConflictException |
| Not found | error page | 404 NotFoundException |
| Cannot delete | errors.cannotDelete | TBD 409 |
| Record lock | errors.lock (UnabledLockException) | TBD optimistic lock |
| System error | errors.system + log | 500 + server log |

---

## 9. 外部連携 / External Integrations

| Integration | Trigger | Legacy | Target |
|-------------|---------|--------|--------|
| Japan Post ZIP | blur zipCode | AJAX → ZIP_MST | ❌ TBD — API `/api/zip/:code` |
| Customer rank batch | monthly SP | `SP_UPDATE_CUSTOMER_RANK` | ❌ TBD — NestJS Schedule |

---

## 10. Migration Mapping

### 10.1 File structure (target — hiện trạng)

```
salescube-ts/
  apps/web/src/app/(app)/customers/
    page.tsx                    # list ✅
    new/page.tsx                # create form ✅
    [id]/page.tsx               # edit form ✅
    _components/customer-form.tsx  # form component
  apps/api/src/modules/customers/
    customers.controller.ts     # ⚠️ MOCK — không inject service, trả hardcode
    customers.service.ts        # ✅ logic thật (duplicate check, normalize, soft-delete)
    customers.repository.ts     # ✅ Prisma queries (search, CRUD, softDelete)
    customers.module.ts         # module wiring
  apps/web/src/lib/customers-api.ts  # client-side API calls
  packages/shared/src/customer.ts   # Zod schemas + DTO types
  packages/domain/src/customer/normalize.ts  # normalizeCompanyName
  packages/db/prisma/schema.prisma  # model Customer
```

**Vấn đề chính**: `CustomersController` có `constructor()` rỗng — không inject `CustomersService`.  
Cần wire lại: `constructor(private readonly service: CustomersService)` và gọi `service.*` thay mock.

`LEGACY_CONFIRMED` — `customers.controller.ts:31-33`

### 10.2 Field mapping (legacy → Prisma)

| Legacy (Java entity) | Prisma field | Ghi chú |
|----------------------|--------------|---------|
| customerCode | code | PK business key |
| customerName | name | |
| customerKana | nameKana | |
| customerAbbr | abbr | |
| customerZipCode | zipCode | |
| customerAddress1 | address1 | |
| customerTel | phone | |
| taxShiftCategory | taxShift | enum remap |
| taxFractCategory | taxFraction | enum remap |
| paybackCycleCategory | paybackCycle | enum remap |
| maxCreditLimit | creditLimit | Decimal |
| DEL_DATETM | deletedAt | soft-delete |

### 10.3 Gap analysis (legacy → target)

| Tính năng legacy | Trạng thái target |
|------------------|-------------------|
| CRUD cơ bản | ⚠️ Service/repo OK, controller mock |
| CUSTOMER_MST_HIST audit | ❌ Chưa có |
| CUSTOMER_REL | ❌ Chưa có |
| Copy customer | ❌ Chưa có |
| ZIP auto-fill | ❌ Chưa có |
| Delete guard (open sales) | ❌ Chưa có |
| Rank batch update | ❌ Chưa có |
| Full form fields (59 legacy) | ⚠️ ~15 fields trên UI |

---

## 11. Evidence

| Mục | File | Ghi chú |
|-----|------|---------|
| Workflow | `output/workflows/WF-02-customer-management.md` | Business flow |
| Entity fields | `docs/spec/02-entity-list.md` §5.1 | 45+ fields |
| Zod schema | `salescube-ts/packages/shared/src/customer.ts` | Validation |
| Prisma model | `salescube-ts/packages/db/prisma/schema.prisma` | Customer model |
| API service | `salescube-ts/apps/api/src/modules/customers/customers.service.ts` | Business logic |
| API repository | `salescube-ts/apps/api/src/modules/customers/customers.repository.ts` | DB access |
| Web list | `salescube-ts/apps/web/src/app/(app)/customers/page.tsx` | UI list |
| Web form | `salescube-ts/apps/web/src/app/(app)/customers/_components/customer-form.tsx` | UI form |
| Legacy Java source | `SalesCube/` | ❌ Không có trong repo — dùng WF-02 + spec |

---

## 12. 実装チェックリスト / Implementation Checklist

**Đã hoàn thành** (`LEGACY_CONFIRMED` từ source code):
- [x] Prisma model `Customer` — `packages/db/prisma/schema.prisma`
- [x] Zod schemas: `createCustomerSchema`, `updateCustomerSchema`, `customerSearchSchema` — `packages/shared/src/customer.ts`
- [x] Domain `normalizeCompanyName` — `packages/domain/src/customer/normalize.ts`
- [x] Repository: `search`, `findById`, `findByCode`, `create`, `update`, `softDelete` — `customers.repository.ts`
- [x] Service: duplicate check, 404, normalize, soft-delete — `customers.service.ts`
- [x] Web list page + pagination — `apps/web/.../customers/page.tsx`
- [x] Web create/edit form (partial fields) — `customers/new/page.tsx`, `[id]/page.tsx`

**Cần làm tiếp** (ưu tiên theo impact):
- [ ] **[HIGH]** Wire controller → service: bỏ mock, inject `CustomersService` — `customers.controller.ts:31`
- [ ] **[HIGH]** Bỏ `@Public()` — bật `JwtAuthGuard` + `RolesGuard` — `customers.controller.ts:29`
- [ ] **[HIGH]** Delete guard: check `SALES_SLIP_TRN` open trước khi xóa
- [ ] **[HIGH]** `customer_hist` audit trail: INSERT snapshot sau mỗi create/update/delete
- [ ] **[MEDIUM]** UI fields còn thiếu: bank info, creditLimit, rankCategory, officeName...
- [ ] **[MEDIUM]** `customer_rel` parent-child relationships
- [ ] **[LOW]** ZIP lookup: `/api/zip/:code` → ZIP_MST lookup
- [ ] **[LOW]** Copy customer function
- [ ] **[LOW]** E2E test happy path
