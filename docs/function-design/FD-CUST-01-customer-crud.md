# FD-01: Quản lý Khách hàng (得意先マスタ)

> **Module**: master  
> **Loại**: list | create | edit | delete | search  
> **Confidence**: HIGH (legacy WF-02, entity list) / MEDIUM (target implementation — controller đang mock)  
> **Legacy Action**: `InputCustomerAction`, `SearchCustomerAction` (inferred)  
> **Target**: `apps/web/(app)/customers/*` + `apps/api/modules/customers/*`

---

## 1. 概要 / Tổng quan

| Mục | Nội dung |
|-----|----------|
| **Mục đích** | CRUD master khách hàng (得意先): tìm kiếm, tạo, sửa, xóa mềm; thiết lập quy tắc thanh toán/chốt hóa đơn cho từng KH |
| **Actor** | Nhân viên bán hàng / kế toán có quyền menu Customer Master |
| **Điều kiện tiên quyết** | Đăng nhập; `customer.read` (xem) / `customer.write` (ghi) / `customer.delete` (xóa) |
| **Workflow liên quan** | [WF-02 — Customer Management](../../output/workflows/WF-02-customer-management.md) |

---

## 2. 画面仕様 / Screen Specification

### 2.1 Route mapping

| Chức năng | Legacy (Struts) | Target (Next.js) | Trạng thái |
|-----------|-----------------|------------------|------------|
| Danh sách + tìm kiếm | `GET /master/searchCustomer/index` | `GET /customers` | ✅ Implemented |
| Tạo mới | `GET /master/inputCustomer/index` | `GET /customers/new` | ✅ Implemented |
| Sửa | `GET /master/inputCustomer/edit/{id}` | `GET /customers/[id]` | ✅ Implemented |
| Lưu (create) | `POST /master/inputCustomer/register` | `POST /api/customers` | ⚠️ API mock |
| Lưu (update) | `POST /master/inputCustomer/register` | `PATCH /api/customers/:id` | ⚠️ API mock |
| Xóa | `POST /master/inputCustomer/delete` | `DELETE /api/customers/:id` | ⚠️ API mock |
| Copy KH | `GET /master/inputCustomer/copy` | TBD | ❌ Chưa có |

### 2.2 Layout — Danh sách (`/customers`)

| Vùng | Thành phần |
|------|------------|
| Header | Tiêu đề "Khách hàng", số kết quả, ô tìm kiếm, nút "+ Tạo mới" |
| Grid | Bảng: Mã, Tên (link), Kana, Liên hệ, Cutoff, Thao tác |
| Footer | Phân trang (20 bản ghi/trang) |

**Tìm kiếm**: theo mã, tên, kana, abbr (case-insensitive).  
**Evidence (target)**: `apps/web/src/app/(app)/customers/page.tsx`

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

**Evidence (legacy fields)**: `docs/spec/02-entity-list.md` §5.1  
**Evidence (target schema)**: `packages/shared/src/customer.ts`, `packages/db/prisma/schema.prisma` model `Customer`

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

**Implementation**: `CustomersService.findAll` + `CustomersRepository.search` — ✅ logic thật; controller hiện trả mock ⚠️

#### `GET /api/customers/:id` — Detail

**Permission**: `customer.read`  
**Response 200**: full `Customer` record (`deletedAt: null`)  
**Response 404**: `Customer not found`

#### `POST /api/customers` — Create

**Permission**: `customer.write`  
**Body**: `CreateCustomerInput` (`createCustomerSchema`)

**Response 201**: created customer  
**Response 409**: `Customer code "..." already exists`

**Business logic**:
1. Check duplicate `code`
2. `normalizeCompanyName(name)` — `packages/domain/src/customer/normalize.ts`
3. Insert với `createdBy`, `updatedBy`

#### `PATCH /api/customers/:id` — Update

**Permission**: `customer.write`  
**Body**: `UpdateCustomerInput` (partial, không có `code`)

**Response 200**: updated customer  
**Response 404**: not found

#### `DELETE /api/customers/:id` — Soft delete

**Permission**: `customer.delete`  
**Response 204**: no content  
**Logic**: set `deletedAt = now()`, `updatedBy`

### 3.2 Error responses

| HTTP | Code / Message | Điều kiện | Legacy tương đương |
|------|----------------|-----------|-------------------|
| 400 | Zod field errors | Validation fail | inline form errors |
| 403 | Forbidden | Thiếu permission | menu check fail |
| 404 | Customer not found | id không tồn tại hoặc đã xóa | - |
| 409 | Customer code already exists | Trùng code | errors.duplicate |
| 409 | TBD — cannot delete | Có SALES_SLIP mở | errors.cannotDelete |

---

## 4. 処理フロー / Processing Logic

### 4.1 List / Search

```
1. Guard: customer.read
2. Parse query (Zod customerSearchSchema)
3. WHERE deletedAt IS NULL
4. IF q: OR match name, nameKana, code, abbr (insensitive)
5. ORDER BY code ASC
6. Paginate skip/take
7. Return { data, total, page, pageSize }
```

### 4.2 Create

```
1. Guard: customer.write
2. Validate body (createCustomerSchema)
3. findByCode(code) → if exists → 409 Conflict
4. normalizeCompanyName(name)
5. prisma.customer.create({ ...input, createdBy, updatedBy })
6. [LEGACY] INSERT CUSTOMER_MST_HIST — ❌ chưa implement target
7. Return 201
```

### 4.3 Update

```
1. Guard: customer.write
2. findOne(id) → 404 if missing/deleted
3. Validate partial body (updateCustomerSchema)
4. IF name: normalizeCompanyName
5. prisma.customer.update
6. [LEGACY] INSERT CUSTOMER_MST_HIST — ❌ chưa implement target
7. Return 200
```

### 4.4 Delete (soft-delete)

```
1. Guard: customer.delete
2. findOne(id)
3. [LEGACY] Check SALES_SLIP_TRN open — ❌ TBD target
4. SET deletedAt = now(), updatedBy
5. [LEGACY] INSERT CUSTOMER_MST_HIST — ❌ TBD
6. Return 204
```

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
| SEQ_MAKER | - | - | - | Thay bằng cuid() |
| ZIP_MST | TBD | SELECT | - | ZIP lookup |

### 5.2 Prisma model (target)

```prisma
model Customer {
  id        String    @id @default(cuid())
  code      String    @unique
  name      String
  // ... see packages/db/prisma/schema.prisma
  deletedAt DateTime? @map("deleted_at")
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
| 9 | Cannot delete if open sales | delete | TBD 409 | cannotDelete | WF-02 — Inferred |

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
    new/page.tsx                # create ✅
    [id]/page.tsx               # edit ✅
    _components/customer-form.tsx
  apps/api/src/modules/customers/
    customers.controller.ts     # ⚠️ mock responses
    customers.service.ts        # ✅
    customers.repository.ts     # ✅
  packages/shared/src/customer.ts
  packages/domain/src/customer/normalize.ts
  packages/db/prisma/schema.prisma  # model Customer
```

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

- [x] Prisma model `Customer`
- [x] Zod schemas (create/update/search)
- [x] Domain `normalizeCompanyName`
- [x] Repository (search, CRUD, soft-delete)
- [x] Service (duplicate check, not found)
- [ ] Controller wired to service (đang mock)
- [ ] Auth guard bật lại (bỏ `@Public()`)
- [x] Web list page + pagination
- [x] Web create/edit form (subset fields)
- [ ] UI: fields còn thiếu (bank, credit, rank, office...)
- [ ] ZIP lookup integration
- [ ] `customer_hist` audit trail
- [ ] `customer_rel` relationships
- [ ] Delete guard (open sales orders)
- [ ] Copy customer function
- [ ] E2E test happy path
