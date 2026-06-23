---
description: Từ DDL SQL và Java entity hỗ trợ, sinh Prisma schema models có truy vết evidence, an toàn cho migration SalesCube.
---

# Workflow: Generate & Review Prisma Schema Models từ SalesCube Legacy

## Mục tiêu

Sinh Prisma models chính xác từ DDL SQL của SalesCube, với các mục tiêu:

- Giữ nguyên cấu trúc database legacy: table, column, nullability, PK, unique constraint, index và default.
- Phân biệt rõ **schema fact từ DDL** với **quyết định target database**.
- Không tự suy diễn ID generation, soft delete, relation hoặc Boolean semantics.
- Sinh schema có thể format và validate bằng Prisma trước khi được merge.
- Không tự tạo migration thay đổi database hiện hữu nếu chưa được yêu cầu rõ ràng.

> `CREATE.sql` là nguồn chân lý cho physical schema. Java entity và Named SQL chỉ dùng để bổ sung ngữ cảnh hoặc xác minh usage; chúng không được ghi đè DDL.

---

## Quy ước Provenance

Mọi mapping không hiển nhiên phải ghi một trong các nhãn sau:

| Nhãn | Ý nghĩa |
|---|---|
| `DDL_CONFIRMED` | Có bằng chứng trực tiếp trong DDL |
| `JAVA_CONFIRMED` | Có bằng chứng từ Java entity/service, dùng bổ trợ DDL |
| `SQL_CONFIRMED` | Có bằng chứng từ Named SQL/query |
| `TARGET_DECISION` | Quyết định cho database/Prisma target |
| `ASSUMPTION` | Suy luận hợp lý nhưng chưa đủ evidence |
| `UNKNOWN` | Không thể xác minh từ source hiện có |

## Nguyên tắc bắt buộc

1. Không dùng Java entity để thay đổi type/nullability/PK đã xác định trong DDL.
2. Không biến `SEQ_NO` thành `@default(autoincrement())` nếu DDL không xác nhận auto increment hoặc sequence behavior.
3. Không map mọi `TINYINT(1)` thành `Boolean` chỉ vì display width là `1`.
4. Không dùng `@@ignore` để đánh dấu soft delete. `@@ignore` làm Prisma bỏ qua model.
5. Không tự thêm `@relation` nếu không có FK constraint hoặc quyết định target được phê duyệt.
6. Không tự thêm `@updatedAt`; chỉ dùng khi DDL hoặc behavior xác nhận.
7. Không chạy `prisma migrate dev` trên database legacy/production mà không có migration strategy rõ ràng.
8. Không append model trực tiếp vào schema trước khi tạo candidate và chạy validation.
9. Không dừng batch để hỏi user; ghi vào `_open-questions.md` và tiếp tục với `UNKNOWN`/`ASSUMPTION`.

---

## Output location

```text
salescube-ts/packages/db/prisma/
├── schema.prisma
├── schema.generated.prisma              # optional candidate / generated fragment
├── mappings/
│   ├── _index.md
│   ├── _open-questions.md
│   ├── _evidence/
│   │   └── <TABLE_NAME>.md
│   └── _reports/
│       └── <module>-schema-review.md
```

> Nếu repository đã có convention khác, tuân theo convention hiện có thay vì tạo path mới.

---

# Phase 0 – Prisma & Repository Preflight

## Mục tiêu

Xác minh target trước khi sinh schema. Không được giả định database provider là MySQL chỉ vì legacy DDL là MySQL.

## Kiểm tra bắt buộc

- Repository root.
- Branch hiện tại.
- DDL source path.
- Existing `schema.prisma`.
- Prisma CLI version và package version.
- `datasource.provider`.
- Target DB provider: `mysql`, `postgresql`, `sqlserver`, v.v.
- Existing model naming convention.
- Existing `@@map` / `@map` convention.
- Existing migration history.
- Môi trường database: local/dev/staging/production.
- Có hay không database schema đã tồn tại.
- Có hay không target Prisma schema là mirror legacy hay redesign database.

## Output

```markdown
## Preflight Result

| Item | Value | Status |
|---|---|---|
| Legacy DDL | `SalesCube/DB/sql/CREATE.sql` | Found |
| Prisma schema | `salescube-ts/packages/db/prisma/schema.prisma` | Found |
| Prisma provider | `postgresql` | Confirmed |
| Prisma version | `x.y.z` | Confirmed |
| Existing migrations | `packages/db/prisma/migrations/` | Found |
| Target mode | Mirror legacy / Redesign / Unknown | Confirmed |
| Database environment | Local / Dev / Staging / Production | Confirmed |
```

Nếu `Target mode` là `Unknown`, chỉ được sinh **candidate schema fragment**, không tự merge hoặc tạo migration.

---

# Phase 1 – Table Inventory

## Mục tiêu

Không sinh model theo tên module ước đoán. Phải inventory bảng thực tế từ DDL.

## Cách thực hiện

1. Parse toàn bộ `CREATE TABLE`.
2. Lập danh sách table, schema/database name nếu có, table comment, engine, charset/collation.
3. Xác định:
   - Primary key.
   - Composite primary key.
   - Unique constraints.
   - Non-unique indexes.
   - Foreign keys.
   - Auto increment.
   - Defaults.
   - Generated columns.
   - Triggers / procedures liên quan nếu có.
4. Map table vào module theo evidence từ Java/SQL/WF; nếu chưa chắc thì `UNKNOWN`.
5. Đánh dấu loại bảng:
   - `MASTER`
   - `TRANSACTION_HEADER`
   - `TRANSACTION_DETAIL`
   - `HISTORY`
   - `WORK`
   - `SYSTEM`
   - `SEQUENCE`
   - `VIEW_OR_EXTERNAL`
   - `UNKNOWN`

## Output

```text
salescube-ts/packages/db/prisma/mappings/_index.md
```

Template:

```markdown
# Prisma Table Inventory

| Table | Type | Module | PK | FK count | Existing Prisma model | Status |
|---|---|---|---|---:|---|---|
| `CUSTOMER_MST` | MASTER | CUST | `CUSTOMER_CD` | 0 | `Customer` | Existing |
| `SALES_SLIP_TRN` | TRANSACTION_HEADER | SALES | `SEQ_NO` | 2 | — | Planned |
| `SEQ_MAKER` | SEQUENCE | SYSTEM | `SEQ_NAME` | 0 | — | Needs policy |
```

---

# Phase 2 – DDL Evidence Extraction

## Source priority

1. `SalesCube/DB/sql/CREATE.sql` — source of truth.
2. ALTER scripts and migrations after `CREATE.sql` — may override initial DDL.
3. Java entity classes — verify application representation.
4. Named SQL — verify read/write usage and app-layer relation hints.
5. Workflow/spec docs — identify business ownership only.

> Nếu `CREATE.sql` và ALTER scripts mâu thuẫn, phiên bản DDL áp dụng cuối cùng là source of truth. Không dùng Java entity để giải quyết mâu thuẫn DDL.

## Evidence file

Tạo cho từng bảng:

```text
salescube-ts/packages/db/prisma/mappings/_evidence/<TABLE_NAME>.md
```

Template:

```markdown
# Evidence: <TABLE_NAME>

## DDL Summary

| Attribute | Value | Provenance |
|---|---|---|
| Table | `TABLE_NAME` | DDL_CONFIRMED |
| Engine | InnoDB | DDL_CONFIRMED |
| Charset | utf8mb4 | DDL_CONFIRMED |
| Primary key | `(SEQ_NO)` | DDL_CONFIRMED |
| Auto increment | No / Yes | DDL_CONFIRMED |
| Foreign keys | None / list | DDL_CONFIRMED |

## Columns

| Column | SQL Type | Nullable | Default | Extra | Comment | Evidence |
|---|---|---:|---|---|---|---|
| `SEQ_NO` | `INT` | No | — | `AUTO_INCREMENT` | — | DDL_CONFIRMED |
| `CUSTOMER_CD` | `VARCHAR(20)` | No | — | — | — | DDL_CONFIRMED |

## Constraints & Indexes

| Type | Name | Columns | Evidence |
|---|---|---|---|
| PK | `PRIMARY` | `SEQ_NO` | DDL_CONFIRMED |
| INDEX | `IDX_CUSTOMER_CD` | `CUSTOMER_CD` | DDL_CONFIRMED |

## Usage Signals

| Source | Finding | Provenance |
|---|---|---|
| `CustomerEntity.java` | Customer code represented as String | JAVA_CONFIRMED |
| `SalesSearch.sql` | Filters `DEL_DATETM IS NULL` | SQL_CONFIRMED |
```

---

# Phase 3 – SQL to Prisma Mapping Rules

## 3.1 Core scalar mapping

| SQL type | Prisma type | Native annotation guidance |
|---|---|---|
| `CHAR(n)` | `String` | `@db.Char(n)` when provider supports it |
| `VARCHAR(n)` | `String` | `@db.VarChar(n)` when provider supports it |
| `TEXT` / `MEDIUMTEXT` / `LONGTEXT` | `String` | `@db.Text` / provider equivalent when needed |
| `INT` / `INTEGER` | `Int` | Native annotation if needed |
| `SMALLINT` | `Int` | `@db.SmallInt` where supported |
| `TINYINT` | `Int` by default | Do not infer Boolean without evidence |
| `BIGINT` | `BigInt` | Native annotation if needed |
| `DECIMAL(p,s)` / `NUMERIC(p,s)` | `Decimal` | Preserve `@db.Decimal(p, s)` when supported |
| `FLOAT` | `Float` | Preserve native type if relevant |
| `DOUBLE` / `DOUBLE PRECISION` | `Float` | Preserve native type if relevant |
| `DATE` | `DateTime` | `@db.Date` where supported |
| `DATETIME` | `DateTime` | Keep timezone semantics documented |
| `TIMESTAMP` | `DateTime` | Preserve default/auto-update semantics exactly |
| `TIME` | `DateTime` or `String` | Requires provider and business-semantics decision |
| `YEAR` | `Int` | Add native type if supported |
| `JSON` | `Json` | Only if actual JSON column type |
| `BLOB` / `BINARY` / `VARBINARY` | `Bytes` | Preserve length when supported |
| `ENUM(...)` | `String` or Prisma enum | Only create enum after extracting allowed values |
| `SET(...)` | `String` | Record as special handling; Prisma has no direct SET equivalent |
| spatial types | `Unsupported("...")` | Do not invent scalar mapping |

## 3.2 Required precision and length preservation

When target provider supports native types, preserve:

- `VARCHAR(n)` length.
- `CHAR(n)` length.
- `DECIMAL(p,s)` precision and scale.
- `UNSIGNED` semantics.
- Binary size.
- Date-only vs datetime distinction.

Example:

```prisma
amount Decimal @db.Decimal(15, 2)
customerCode String @db.VarChar(20)
```

> Native annotations must match the Prisma datasource provider. Do not copy MySQL `@db.*` annotations into a PostgreSQL schema.

## 3.3 `TINYINT(1)` rule

`TINYINT(1)` is not automatically Boolean.

Map to `Boolean` only when at least one condition is true:

1. DDL comment explicitly states flag/boolean.
2. CHECK constraint limits values to `0/1`.
3. Java field is `boolean`/`Boolean`.
4. SQL usage consistently compares only with `0` and `1`.
5. Target design explicitly decides it is Boolean.

Otherwise:

```prisma
statusFlag Int @db.TinyInt
```

Record evidence in the mapping report.

## 3.4 `SEQ_NO` / ID generation rule

Do not map `SEQ_NO` to:

```prisma
id Int @id @default(autoincrement())
```

unless DDL confirms `AUTO_INCREMENT`, an equivalent identity definition, or the target redesign explicitly adopts database-generated IDs.

Possible cases:

| Legacy behavior | Prisma direction | Provenance |
|---|---|---|
| `AUTO_INCREMENT` in DDL | `@default(autoincrement())` | DDL_CONFIRMED |
| `SEQ_MAKER` updated by application | Scalar PK without autoincrement; generation handled in service/DB policy | DDL + JAVA/SQL evidence |
| Composite business key | `@@id([...])` | DDL_CONFIRMED |
| Target UUID redesign | `@default(uuid())` or `uuid_v7()` policy | TARGET_DECISION |

## 3.5 Default value rule

Map defaults only after exact comparison.

| SQL default | Prisma candidate | Notes |
|---|---|---|
| Constant string/number | `@default(...)` | Preserve value |
| `CURRENT_TIMESTAMP` | `@default(now())` only if semantically equivalent for target provider | Verify provider behavior |
| `ON UPDATE CURRENT_TIMESTAMP` | Do not automatically use `@updatedAt` | Requires exact behavior check |
| DB expression | `@default(dbgenerated("..."))` or document unsupported behavior | Provider-specific |
| `NULL` | Nullable field; do not add `@default(null)` unless supported/needed | Usually unnecessary |

## 3.6 Soft delete rule

`DEL_DATETM` does not automatically mean all queries must filter deleted rows.

For every table with `DEL_DATETM`, determine:

1. Does DDL allow null?
2. Do read SQL queries filter `DEL_DATETM IS NULL`?
3. Is there a delete/update action that writes it?
4. Do reports/history intentionally include deleted rows?
5. Is physical delete also used?

Correct Prisma model example:

```prisma
deletedAt DateTime? @map("DEL_DATETM")
```

Do **not** use `@@ignore`.

Document query policy separately:

```markdown
| Table | Delete column | Default filter policy | Evidence |
|---|---|---|---|
| `CUSTOMER_MST` | `DEL_DATETM` | filter active by default | SQL_CONFIRMED |
| `SALES_HIST` | `DEL_DATETM` | include all in audit search | SQL_CONFIRMED |
```

## 3.7 Naming rule

- Prisma model names: PascalCase.
- Prisma field names: camelCase.
- Physical table names: preserve with `@@map("TABLE_NAME")`.
- Physical column names: preserve with `@map("COLUMN_NAME")`.
- Do not rename a field to `id` unless it is the actual primary identifier and naming is agreed.
- If a table has a business-code PK such as `CUSTOMER_CD`, prefer:

```prisma
customerCode String @id @map("CUSTOMER_CD")
```

rather than inventing an `id` field.

## 3.8 Index rule

| DDL construct | Prisma mapping |
|---|---|
| Primary key | `@id` or `@@id([...])` |
| Unique constraint | `@unique` or `@@unique([...])` |
| Non-unique index | `@@index([...], map: "INDEX_NAME")` where supported |
| Prefix index / functional index / unsupported index | Preserve as comment/report and create raw SQL migration only if approved |
| Fulltext/spatial index | Provider-specific; do not assume normal `@@index` is equivalent |

## 3.9 Relation rule

Create Prisma relation automatically only when:

- DDL contains a real FK constraint, and
- referenced columns are compatible, and
- the Prisma provider/relation mode supports it.

If app-layer FK is inferred from Java/SQL but no DDL FK exists:

```prisma
// app-layer reference to CUSTOMER_MST.CUSTOMER_CD; no DB FK constraint
customerCode String @map("CUSTOMER_CD")
```

Do not add `@relation` automatically.

If target architecture uses `relationMode = "prisma"` and relations are intentionally designed without DB FKs, that is a `TARGET_DECISION`, not a DDL fact.

---

# Phase 4 – Candidate Model Generation

## Generation approach

1. Generate models in a temporary candidate fragment.
2. Compare against existing schema for duplicates and compatible mappings.
3. Merge only when validation passes.
4. Preserve existing manually maintained models and comments.

## Candidate output

```text
salescube-ts/packages/db/prisma/schema.generated.prisma
```

or a module-specific fragment consistent with repository conventions.

## Model template

```prisma
/// DDL_CONFIRMED: `CUSTOMER_MST` from CREATE.sql
model Customer {
  customerCode String    @id @map("CUSTOMER_CD") @db.VarChar(20)
  customerName String    @map("CUSTOMER_NAME") @db.VarChar(100)
  deletedAt    DateTime? @map("DEL_DATETM")

  @@map("CUSTOMER_MST")
}
```

## Composite key example

```prisma
model SalesDetail {
  salesSlipNo Int @map("SALES_SLIP_NO")
  lineNo      Int @map("LINE_NO")
  productCode String @map("PRODUCT_CD")

  @@id([salesSlipNo, lineNo])
  @@map("SALES_SLIP_DTL")
}
```

## Sequence-managed key example

```prisma
/// Sequence is generated by legacy SEQ_MAKER / application logic.
/// Do not add autoincrement unless target policy changes.
model SalesSlip {
  sequenceNo Int @id @map("SEQ_NO")

  @@map("SALES_SLIP_TRN")
}
```

## Unknown / unsupported type example

```prisma
model LegacyGeo {
  id Int @id @map("ID")
  shape Unsupported("geometry")? @map("SHAPE")

  @@map("LEGACY_GEO")
}
```

---

# Phase 5 – Schema Merge, Format & Validation

## Merge rule

Before writing to `schema.prisma`:

- Check existing model with same physical `@@map`.
- Check existing field with same physical `@map`.
- Check model-name collision.
- Check enum-name collision.
- Check relation-name collision.
- Keep comments that contain manual decisions.

## Required commands

Run commands appropriate to the repository and provider:

```bash
npx prisma format --schema=salescube-ts/packages/db/prisma/schema.prisma
npx prisma validate --schema=salescube-ts/packages/db/prisma/schema.prisma
```

If a database connection is safely available in local/dev only, optionally run:

```bash
npx prisma db pull --schema=salescube-ts/packages/db/prisma/schema.prisma
```

Do not run `db pull` blindly when it would overwrite manually curated target schema.

## Additional validation

When database URL and environment are explicitly safe:

```bash
npx prisma migrate diff \
  --from-schema-datamodel=salescube-ts/packages/db/prisma/schema.prisma \
  --to-schema-datasource=salescube-ts/packages/db/prisma/schema.prisma \
  --script
```

Use only as a diagnostic, not as permission to apply changes.

---

# Phase 5.5 – Spec/06 Document Sync

## Mục tiêu

Sau khi `schema.prisma` được validate, cập nhật `docs/spec/06-prisma-schema.md` để phản ánh trạng thái hiện tại của Prisma schema. File này là tham chiếu cho các workflow downstream (FD, Migration).

## Thực hiện

1. Đọc `docs/spec/06-prisma-schema.md` hiện tại.
2. So sánh với `schema.prisma` vừa cập nhật.
3. Cập nhật các section sau nếu có thay đổi:

```markdown
## Models đã sinh (cập nhật)

| Prisma Model | DDL Table (@@map) | Type | Status |
|---|---|---|---|
| `Customer` | `CUSTOMER_MST` | MASTER | ✅ Generated |
| `SalesSlip` | `SALES_SLIP_TRN` | TRANSACTION | ✅ Generated |

## Conventions áp dụng

| Convention | Giá trị | Evidence |
|---|---|---|
| PK convention | `String @id` hoặc composite? | DDL_CONFIRMED |
| Soft delete col | `DEL_DATETM DateTime?` | DDL_CONFIRMED |
| Audit cols | `INS_DATETM`, `UPD_DATETM` | DDL_CONFIRMED |
| SEQ_MAKER tables | List tên table | JAVA_CONFIRMED |
| Tenant suffix | `_XXXXX` → `@@map` strategy | DDL_CONFIRMED |

## Open decisions

| Table | Decision | Provenance |
|---|---|---|
| `SEQ_MAKER` | App-layer sequence — không dùng autoincrement() | TARGET_DECISION |
```

4. Ghi ngày cập nhật cuối cùng và schema version ở đầu file.

## Checklist

- [ ] Số model trong `docs/spec/06` khớp với `schema.prisma` (X/129 tables)
- [ ] Tenant suffix `_XXXXX` strategy được document
- [ ] Mọi `TARGET_DECISION` có lý do rõ ràng
- [ ] `docs/spec/06` không cite thông tin từ `docs/spec/07-db-schema.md` nếu file đó bị corrupt

---

# Phase 6 – Migration Policy

## Default policy

Do not automatically create migrations.

A Prisma schema model may represent either:

1. Existing legacy tables being accessed by Prisma.
2. New target database tables.
3. A redesigned schema intended to replace legacy database.

These require different migration strategies.

## Decision matrix

| Situation | Recommended action |
|---|---|
| Prisma accesses existing legacy DB | Baseline/introspect; avoid `migrate dev` against legacy database |
| New empty target DB | Generate reviewed migration after schema validation |
| Existing target DB with migrations | Create migration only after diff review |
| Production DB | Never run dev migration; use reviewed deployment process |
| Cross-provider migration MySQL → PostgreSQL | Treat as data/schema migration project, not just Prisma generate |

## Migration preconditions

Create migration only if all are true:

- User explicitly requested it.
- Target database and environment are confirmed.
- Provider is confirmed.
- Schema is validated.
- Migration diff has been reviewed.
- Data migration implications are recorded.
- Rollback/forward strategy is documented.

## Command example

Only after preconditions:

```bash
npx prisma migrate dev \
  --name add_<module>_tables \
  --schema=salescube-ts/packages/db/prisma/schema.prisma
```

For deployment pipelines, use the repository-approved command, often:

```bash
npx prisma migrate deploy --schema=salescube-ts/packages/db/prisma/schema.prisma
```

> Do not run either command against production from this workflow unless the user explicitly directs it and the project deployment policy permits it.

---

# Phase 7 – Gap Check

## G1 – Build requirement list from DDL

For each table:

```markdown
REQUIREMENT LIST — TABLE_NAME:
[ ] TABLE: physical table mapping
[ ] COL: each column name
[ ] TYPE: each column type, length, precision, scale, unsigned if relevant
[ ] NULLABILITY: nullable vs NOT NULL
[ ] DEFAULT: exact default behavior
[ ] PK: primary key definition
[ ] UNIQUE: each unique constraint
[ ] INDEX: each non-unique index
[ ] FK: each actual foreign key
[ ] AUTO_INCREMENT: generation behavior
[ ] SOFT_DELETE: delete field and query behavior if applicable
[ ] SPECIAL: enum/set/json/blob/generated/spatial/unsupported feature
```

## G2 – Compare DDL to model

Use statuses:

- `[x]` Correctly represented in Prisma.
- `[~]` Present but partially represented or provider-specific limitation exists.
- `[ ]` Missing from Prisma or mapped incorrectly.

## G3 – Resolve gaps

- Add missing field when DDL evidence is sufficient.
- Preserve unsupported DB feature as comment/evidence and report it.
- Mark `UNKNOWN` when DDL is ambiguous or altered by scripts not found.
- Do not ask user during batch; record an open question.
- Do not silently drop indexes, constraints, defaults, or special types.

## G4 – Gap report

```markdown
🔍 Gap Check: <TABLE_NAME or module>

Column coverage: <X>/<N>
Constraint coverage: <X>/<N>
Index coverage: <X>/<N>
Defaults verified: <X>/<N>

Auto-fixed gaps: <N>
Unsupported features: <N>
Unknown mappings: <N>
High-risk migration items: <N>

Open items:
- [ ] <table.column> — <reason>
```

---

# Phase 8 – Review

## R1 – Re-read changed schema

Read the exact model blocks that were added or modified in `schema.prisma`.

## R2 – Quality checklist

### DDL fidelity

- [ ] Every DDL column has one corresponding Prisma field.
- [ ] Physical table uses `@@map("TABLE_NAME")`.
- [ ] Physical columns use `@map("COLUMN_NAME")`.
- [ ] Nullability matches DDL.
- [ ] Type mapping preserves meaningful length, precision and scale.
- [ ] `DATE` is distinct from datetime when provider supports it.
- [ ] Decimal precision/scale are preserved.
- [ ] `UNSIGNED` semantics are accounted for or reported.
- [ ] PK is accurately represented, including composite keys.
- [ ] Unique constraints are accurately represented.
- [ ] Non-unique indexes are mapped or reported as unsupported.
- [ ] Defaults are accurately represented or explicitly reported.
- [ ] Auto-increment is used only when confirmed.
- [ ] No `@updatedAt` is inferred without evidence.
- [ ] No `@@ignore` is used to represent soft delete.

### Relations and naming

- [ ] Model names are PascalCase.
- [ ] Field names are camelCase.
- [ ] No model/field naming collision with existing schema.
- [ ] DB FK relations are accurately represented when approved.
- [ ] App-layer FK remains a documented scalar field unless target design approves a relation.
- [ ] `SEQ_NO` is not renamed to `id` unless policy allows it.

### Prisma integrity

- [ ] No duplicate model maps to same table unintentionally.
- [ ] `prisma format` passes.
- [ ] `prisma validate` passes.
- [ ] Schema changes do not overwrite manual target decisions.
- [ ] Migration has not been created/applied unless explicitly requested.

## R3 – Review report

```markdown
✅ Prisma schema models generated/updated

Tables processed: <N>
Models added: <N>
Models updated: <N>

DDL column coverage: <X>/<N>
Constraint coverage: <X>/<N>
Schema validation: Passed / Failed

Unsupported DB features: <N>
Unknown mappings: <N>
Migration created: No / Yes (name)

Open questions:
1. <question>
2. <question>
```

---

# Open Questions

Create or update:

```text
salescube-ts/packages/db/prisma/mappings/_open-questions.md
```

Template:

```markdown
# Prisma Schema Open Questions

| ID | Table | Item | Proposed mapping | Impact | Status |
|---|---|---|---|---|---|
| OQ-SALES-01 | `SALES_SLIP_TRN` | `SEQ_NO` generated by SEQ_MAKER | Keep scalar Int PK; service allocates sequence | High | Open |
| OQ-CUST-02 | `CUSTOMER_MST` | `DEL_DATETM` query filtering | Add repository-level active filter, not middleware | Medium | Proposed |
| OQ-INV-03 | `PRODUCT_STOCK` | App-layer FK to product master | Keep scalar field; no relation | Low | Open |
```

---

# Recommended processing order

## Phase 1 – Foundation

1. System/sequence tables and common audit columns.
2. Customer, supplier, product, category masters.
3. User, department, permission masters.

## Phase 2 – Sales

4. Receive order header/detail.
5. Sales slip header/detail.
6. Billing/deposit tables.
7. Sales history/audit tables.

## Phase 3 – Purchase & Inventory

8. Purchase order header/detail.
9. Purchase receipt/payment tables.
10. Stock transaction and inventory balance tables.

## Phase 4 – Supporting

11. Export/report work tables.
12. Batch/system configuration tables.
13. Legacy-only, external or unsupported tables.

---

# Completion criteria

A table/model is considered complete only when:

1. DDL evidence is captured.
2. Candidate model matches all columns, PK and nullability.
3. Defaults/indexes/constraints are mapped or explicitly reported.
4. Schema format and validation pass.
5. All unresolved semantics are in `_open-questions.md`.
6. Migration behavior is explicitly documented and has not been applied without authorization.
