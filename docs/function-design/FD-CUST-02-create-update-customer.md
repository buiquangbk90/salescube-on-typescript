# FD-CUST-02 — Tạo & Cập nhật Khách hàng

**Module**: CUST  
**WF Source**: `output/cursor/workflows/WF-02-customer-management.md`  
**Priority**: P1-2  
**Ngày**: 2026-06-23

---

## 1. Tổng quan

| Trường | Giá trị |
|--------|---------|
| Chức năng | Tạo mới hoặc cập nhật thông tin khách hàng (cùng một Action/Service) |
| Legacy entry | `POST /master/inputCustomer/register` (insert nếu không có PK, update nếu có) |
| Target | `POST /api/customers` (create) / `PUT /api/customers/:customerCode` (update) |
| Permission | `@RequirePermission('CUSTOMER_MST')` + `isMenuUpdate()` |

---

## 2. Legacy Behavior (LEGACY_CONFIRMED)

### 2.1 Create flow

```
POST /master/inputCustomer/register (new — không có customerCode hiện có)
  → CustomerMasterAction.register()
    → validate form
    → CustomerService.findByCode(code) → check duplicate
    → SeqMakerService.getNextSeqId("CUSTOMER_MST")   ← allocate sequence
    → CustomerService.insert(dto)
      → INSERT CUSTOMER_MST (59+ fields)
      → INSERT CUSTOMER_MST_HIST (snapshot đầu tiên)
    → return success
```

**Evidence**: `LEGACY_CONFIRMED` — `service/CustomerService.java`, `entity/Customer.java`

### 2.2 Update flow

```
POST /master/inputCustomer/register (edit — có customerCode)
  → CustomerMasterAction.register()
    → validate form
    → CustomerService.update(dto)
      → UPDATE CUSTOMER_MST
      → INSERT CUSTOMER_MST_HIST (snapshot sau thay đổi)
    → return success
```

**Evidence**: `LEGACY_CONFIRMED` — `service/CustomerHistoryService.java`

### 2.3 SEQ_MAKER pattern

```java
// SeqMakerService.getNextSeqId("CUSTOMER_MST")
// → SELECT SEQ_NO FROM SEQ_MAKER WHERE TABLE_NAME = 'CUSTOMER_MST' FOR UPDATE
// → UPDATE SEQ_MAKER SET SEQ_NO = SEQ_NO + 1
// → return SEQ_NO
```

**Evidence**: `LEGACY_CONFIRMED` — `service/SeqMakerService.java` (pattern chung toàn hệ thống)

### 2.4 ZIP lookup (AJAX)

```
User nhập ZIP_CODE
  → AJAX GET /master/ajax/.../zip?zipCode=XXX
    → ZipService.findByZipCode(zipCode)
    → Trả về ADDRESS_1 từ ZIP_MST
    → Auto-fill địa chỉ trên form
```

**Evidence**: `LEGACY_CONFIRMED` — WF-02 External Integrations section

### 2.5 CUSTOMER_MST_HIST (audit trail)

- Mỗi INSERT hoặc UPDATE đều tạo một snapshot vào `CUSTOMER_MST_HIST`
- Snapshot bao gồm toàn bộ 59+ fields tại thời điểm thay đổi
- **Không phải event log** — là full row copy

**Evidence**: `LEGACY_CONFIRMED` — `service/CustomerHistoryService.java`

---

## 3. Target API Contract (TARGET_DECISION)

### POST /api/customers

```typescript
// Request body
interface CreateCustomerDto {
  customerCode: string;     // required, max 15, alphanumeric — user-defined
  customerName: string;     // required, max 60
  customerNameKana?: string;
  customerTel?: string;     // max 15
  customerEmail?: string;   // email format
  zipCode?: string;
  address1?: string;
  address2?: string;
  cutoffGroup: string;      // required — CATEGORY_TRN lookup
  maxCreditLimit?: number;  // >= 0
  customerRankCategory?: string; // CUSTOMER_RANK_MST lookup
  // ... (các field master data khác)
}

// Response (201 Created)
interface CustomerResponseDto {
  customerCode: string;
  customerName: string;
  // ... full fields
  createdAt: string;
}
```

### PUT /api/customers/:customerCode

```typescript
// Request body — same as CreateCustomerDto (partial update TARGET_DECISION)
// Response (200 OK) — CustomerResponseDto

// Note: customerCode không thể thay đổi sau khi tạo (LEGACY_CONFIRMED — PK)
```

---

## 4. Data Model

### Prisma target

```prisma
model Customer {
  customerCode          String    @id @map("CUSTOMER_CODE")
  customerName          String    @map("CUSTOMER_NAME")
  customerNameKana      String?   @map("CUSTOMER_NAME_KANA")
  customerTel           String?   @map("CUSTOMER_TEL")
  customerEmail         String?   @map("CUSTOMER_EMAIL")
  zipCode               String?   @map("ZIP_CODE")
  address1              String?   @map("ADDRESS_1")
  address2              String?   @map("ADDRESS_2")
  cutoffGroup           String    @map("CUTOFF_GROUP")
  maxCreditLimit        Decimal?  @map("MAX_CREDIT_LIMIT")
  customerRankCategory  String?   @map("CUSTOMER_RANK_CATEGORY")
  deletedAt             DateTime? @map("DEL_DATETM")
  createdAt             DateTime  @map("INS_DATETM")
  updatedAt             DateTime  @map("UPD_DATETM")

  history CustomerHistory[]

  @@map("CUSTOMER_MST")
}

model CustomerHistory {
  id           Int      @id @default(autoincrement())
  customerCode String   @map("CUSTOMER_CODE")
  // ... snapshot fields (mirror Customer)
  createdAt    DateTime @map("INS_DATETM")

  @@map("CUSTOMER_MST_HIST")
}
```

> `TARGET_DECISION`: `customerCode` là String PK (user-defined) — không dùng `@default(autoincrement())`.  
> `TARGET_DECISION`: SEQ_MAKER trong legacy dùng cho internal ID phân biệt với `customerCode` — cần xác minh.  
> `UNKNOWN`: Chưa rõ `SEQ_MAKER` allocate field nào trong CUSTOMER_MST (PK hay internal seq?).

---

## 5. Validation Rules

| # | Rule | Source | Provenance |
|---|------|--------|------------|
| V1 | `customerCode` required, max 15 chars, alphanumeric | WF-02 | `LEGACY_CONFIRMED` |
| V2 | `customerName` required, max 60 chars | WF-02 | `LEGACY_CONFIRMED` |
| V3 | `customerCode` phải unique (check trước INSERT) | `CustomerService.findByCode()` | `LEGACY_CONFIRMED` |
| V4 | `customerTel` max 15 chars | WF-02 | `LEGACY_CONFIRMED` |
| V5 | `customerEmail` format validation | WF-02 | `LEGACY_CONFIRMED` |
| V6 | `maxCreditLimit` numeric >= 0 | WF-02 | `LEGACY_CONFIRMED` |
| V7 | `cutoffGroup` phải có trong CATEGORY_TRN | WF-02 | `LEGACY_CONFIRMED` |
| V8 | `customerRankCategory` phải có trong CUSTOMER_RANK_MST | WF-02 | `LEGACY_CONFIRMED` |

### Zod schema (target)

```typescript
export const createCustomerSchema = z.object({
  customerCode: z.string().min(1).max(15).regex(/^[a-zA-Z0-9]+$/),
  customerName: z.string().min(1).max(60),
  customerNameKana: z.string().max(60).optional(),
  customerTel: z.string().max(15).optional(),
  customerEmail: z.string().email().optional(),
  zipCode: z.string().max(8).optional(),
  cutoffGroup: z.string().min(1),
  maxCreditLimit: z.number().min(0).optional(),
  customerRankCategory: z.string().optional(),
});
```

---

## 6. Transaction Boundaries

| Operation | Legacy | Target |
|-----------|--------|--------|
| Create | Auto-commit: INSERT CUSTOMER_MST + INSERT CUSTOMER_MST_HIST | `prisma.$transaction([create, createHistory])` |
| Update | Auto-commit: UPDATE CUSTOMER_MST + INSERT CUSTOMER_MST_HIST | `prisma.$transaction([update, createHistory])` |

**Evidence**: `LEGACY_CONFIRMED` — Seasar2 `@Transaction` interceptor pattern

---

## 7. Error Handling

| Lỗi | HTTP | Exception | Legacy message |
|-----|------|-----------|----------------|
| Duplicate `customerCode` | 409 | `ConflictException` | `errors.duplicate` |
| `cutoffGroup` không valid | 422 | `UnprocessableEntityException` | validation error |
| `UnabledLockException` | 409 | `ConflictException` | `errors.lock` |
| `ServiceException` | 500 | `InternalServerErrorException` | `errors.system` |

---

## 8. NestJS Implementation Outline

```typescript
// customers.controller.ts
@Controller('api/customers')
@RequirePermission('CUSTOMER_MST')
export class CustomersController {
  @Post()
  @RequireMenuUpdate('CUSTOMER_MST')
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponseDto> {}

  @Put(':customerCode')
  @RequireMenuUpdate('CUSTOMER_MST')
  async update(
    @Param('customerCode') code: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {}
}

// customers.service.ts
@Injectable()
export class CustomersService {
  async create(dto: CreateCustomerDto): Promise<Customer> {
    // 1. check duplicate customerCode
    // 2. SeqMaker.getNext('CUSTOMER_MST') — nếu cần seq internal
    // 3. prisma.$transaction([create + createHistory])
  }

  async update(code: string, dto: UpdateCustomerDto): Promise<Customer> {
    // 1. findOrThrow(code)
    // 2. prisma.$transaction([update + createHistory])
  }
}
```

---

## 9. Open Questions

| ID | Câu hỏi | Impact | Provenance |
|----|---------|--------|------------|
| OQ-CUST-02 | SEQ_MAKER allocate field nào trong CUSTOMER_MST? Không phải `CUSTOMER_CODE` (user-defined) | HIGH | `UNKNOWN` |
| OQ-CUST-03 | Cần ZIP_MST trong target DB không? Hay call external Japan Post API? | MEDIUM | `UNKNOWN` |
| OQ-CUST-04 | `CustomerRelService` (parent-child KH): có bao gồm trong scope P1 không? | MEDIUM | `UNKNOWN` |
| OQ-CUST-05 | Copy customer: copy toàn bộ 59 fields hay chỉ master fields? | LOW | `UNKNOWN` |
