# Kế hoạch migrate SalesCube sang Full TypeScript

> **Lưu ý:** Kế hoạch này dựa trên phân tích source code legacy. Chi tiết reverse-engineered được ghi trong `01-module-inventory.md`, `02-entity-list.md`, `03-business-rules.md`, `05-screen-inventory.md`, `07-db-schema.md`, `08-api-contracts.md`, `09-service-inventory.md` và `10-batch-jobs.md`.

## 1. Mục tiêu

Migrate hệ thống SalesCube từ source legacy Java/WebApp sang hệ thống mới viết bằng TypeScript toàn phần.

Mục tiêu chính:

- Tách hệ thống khỏi kiến trúc Java legacy.
- Xây dựng backend hiện đại bằng NestJS.
- Xây dựng frontend hiện đại bằng Next.js.
- Chuẩn hóa domain bán hàng, hóa đơn, thanh toán, phân quyền.
- Giữ hệ thống cũ làm nguồn đối chiếu nghiệp vụ.
- Migrate theo module, tránh rewrite toàn bộ trong một lần.

---

## 2. Kết luận kiến trúc đề xuất

Không nên convert Java sang TypeScript theo kiểu 1:1.

Nên migrate theo hướng **rewrite có kiểm soát** bằng kiến trúc mới:

```txt
salescube-ts/
├── apps/
│   ├── web/              # Next.js / React / TypeScript
│   └── api/              # NestJS / TypeScript
├── packages/
│   ├── domain/           # Entity, value object, business rules
│   ├── db/               # Prisma schema, migrations, repositories
│   ├── shared/           # Types, constants, utils
│   └── ui/               # Shared UI components
├── legacy/
│   └── salescube-java/   # Source Java gốc để đối chiếu
└── docs/
    ├── migration-map.md
    ├── db-map.md
    └── module-specs/
```

---

## 3. Stack công nghệ đề xuất

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + RBAC |
| Validation | Zod hoặc class-validator |
| State/Data Fetching | TanStack Query, Zustand |
| Form | React Hook Form |
| PDF/Report | React PDF hoặc server-side PDF service |
| Batch Job | NestJS Schedule hoặc BullMQ |
| Test | Vitest/Jest + Playwright |
| Monorepo | pnpm workspace + Turbo |

---

## 4. Chiến lược migrate

Nên áp dụng chiến lược **Strangler Fig Migration**.

Tức là:

- Không đập bỏ toàn bộ hệ thống cũ ngay.
- Dựng hệ TypeScript mới chạy song song.
- Migrate từng module nghiệp vụ.
- So sánh output giữa legacy Java và TypeScript mới.
- Chỉ thay thế module khi đã đủ test và UAT.

---

## 5. Phase 0 — Audit hệ thống cũ

Mục tiêu: hiểu đầy đủ hệ thống SalesCube trước khi code.

Cần bóc tách:

```txt
Java Action / Controller
↓
Service
↓
Entity / DTO
↓
SQL / DAO / S2JDBC
↓
JSP / WebApp screen
↓
Batch / Report
```

Output cần có:

```txt
docs/
├── module-inventory.md
├── screen-list.md
├── api-candidate-list.md
├── db-table-list.md
├── business-rules.md
└── migration-priority.md
```

Checklist audit:

- [ ] Liệt kê toàn bộ table trong DB script.
- [ ] Liệt kê toàn bộ màn hình trong webapp.
- [ ] Liệt kê Java package/action/service/entity.
- [ ] Mapping màn hình với API tương ứng.
- [ ] Mapping API với table tương ứng.
- [ ] Ghi lại toàn bộ business rule quan trọng.
- [ ] Ghi lại batch job và report.
- [ ] Xác định module ưu tiên migrate.

---

## 6. Phase 1 — Thiết kế database mới

Không nên để Prisma introspection rồi dùng luôn.

Cần thiết kế lại model theo nghiệp vụ.

### Nhóm Master

```txt
- customers
- users
- departments
- products
- product_categories
- tax_rates
- payment_terms
```

### Nhóm Sales

```txt
- estimates
- estimate_lines
- orders
- order_lines
- shipments
- sales_slips
- sales_lines
```

### Nhóm Billing

```txt
- invoices
- invoice_lines
- payments
- receivables
- closing_periods
```

### Nhóm Purchase / Inventory

```txt
- suppliers
- purchase_orders
- stock_movements
- inventories
```

### Nhóm System

```txt
- roles
- permissions
- approval_requests
- audit_logs
```

Ví dụ Prisma model ban đầu:

```prisma
model Customer {
  id            String   @id @default(uuid())
  code          String   @unique
  name          String
  kana          String?
  postalCode    String?
  address1      String?
  address2      String?
  phone         String?
  fax           String?
  email         String?
  closingDay    Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  orders        SalesOrder[]
  invoices      Invoice[]

  @@index([name])
  @@index([kana])
}

model SalesOrder {
  id           String   @id @default(uuid())
  orderNo      String   @unique
  customerId   String
  orderDate    DateTime
  status       String
  subtotal     Decimal
  taxAmount    Decimal
  totalAmount  Decimal
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  customer     Customer @relation(fields: [customerId], references: [id])
  lines        SalesOrderLine[]
}

model SalesOrderLine {
  id             String   @id @default(uuid())
  salesOrderId   String
  productId      String?
  description    String
  quantity       Decimal
  unitPrice      Decimal
  taxRate        Decimal
  amount         Decimal
  taxAmount      Decimal
  totalAmount    Decimal

  salesOrder     SalesOrder @relation(fields: [salesOrderId], references: [id])
}
```

---

## 7. Phase 2 — Backend NestJS

Cấu trúc module backend:

```txt
apps/api/src/modules/
├── auth/
├── users/
├── customers/
├── products/
├── estimates/
├── orders/
├── shipments/
├── sales/
├── invoices/
├── payments/
├── reports/
├── approvals/
└── system/
```

Mapping API đề xuất:

| Legacy | TypeScript API |
|---|---|
| Customer screen | `GET /customers`, `POST /customers`, `PATCH /customers/:id` |
| Product master | `GET /products`, `POST /products` |
| Sales order | `POST /sales-orders` |
| Invoice generate | `POST /invoices/generate-monthly` |
| Payment import | `POST /payments/import` |
| Reports | `GET /reports/sales-summary` |

Nguyên tắc backend:

- Controller chỉ nhận request/response.
- Service chỉ orchestration.
- Business rule đặt trong `packages/domain`.
- Repository đặt trong `packages/db`.
- Không để logic tính tiền nằm rải rác trong controller/service.

Ví dụ domain package:

```txt
packages/domain/src/sales/
├── calculate-tax.ts
├── calculate-order-total.ts
├── closing-period-policy.ts
├── invoice-generation-policy.ts
└── payment-allocation-policy.ts
```

Ví dụ pure function:

```ts
export function generateInvoice(input: GenerateInvoiceInput): InvoiceDraft {
  // Pure business logic
}
```

Ví dụ application service:

```ts
@Injectable()
export class InvoiceApplicationService {
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly salesRepo: SalesRepository,
    private readonly invoiceRepo: InvoiceRepository,
  ) {}

  async generateMonthlyInvoice(command: GenerateMonthlyInvoiceCommand) {
    const customer = await this.customerRepo.findById(command.customerId);
    const sales = await this.salesRepo.findUnbilledSales(command.customerId);

    const draft = generateInvoice({
      customer,
      sales,
    });

    return this.invoiceRepo.save(draft);
  }
}
```

---

## 8. Phase 3 — Frontend Next.js

Cấu trúc frontend đề xuất:

```txt
apps/web/src/app/
├── login/
├── dashboard/
├── customers/
├── products/
├── sales-orders/
├── invoices/
├── payments/
├── reports/
└── admin/
```

Thư viện nên dùng:

```txt
- React Hook Form
- Zod
- TanStack Query
- Zustand hoặc Jotai
- Tailwind CSS
- shadcn/ui hoặc custom UI components
```

Thứ tự migrate màn hình:

1. Login / layout / menu
2. Master khách hàng
3. Master sản phẩm
4. Đơn hàng / bán hàng
5. Hóa đơn / thanh toán
6. Báo cáo
7. Admin / phân quyền

---

## 9. Roadmap migrate theo sprint

### Sprint 1 — Chuẩn bị nền

```txt
- Fork repo gốc
- Import source vào /legacy
- Dựng monorepo pnpm
- Setup NestJS + Next.js + Prisma
- Dựng PostgreSQL local bằng Docker
- Tạo auth cơ bản
- Tạo coding convention
```

### Sprint 2 — Reverse engineering

```txt
- Liệt kê toàn bộ table trong DB/sql
- Liệt kê toàn bộ screen trong webapp
- Liệt kê Java package/action/service/entity
- Mapping screen → API → table
- Ghi lại business rule quan trọng
```

### Sprint 3 — Master data

```txt
- Customer master
- Product master
- User / role / permission
- Import dữ liệu mẫu từ DB cũ
- Làm UI CRUD
```

### Sprint 4 — Sales flow

```txt
- Estimate nếu có
- Order
- Sales slip
- Tax calculation
- Status transition
- Audit log
```

### Sprint 5 — Billing / payment

```txt
- Invoice generation
- Closing period
- Payment registration
- Receivable balance
- PDF invoice
```

### Sprint 6 — Report / batch

```txt
- Sales report
- Customer report
- Monthly closing report
- Batch job
- CSV / Excel export
```

### Sprint 7 — Parallel run

```txt
- Chạy song song Java cũ và TypeScript mới
- So sánh output theo cùng dataset
- Fix lệch số tiền / thuế / trạng thái
- UAT
```

---

## 10. Characterization Test

Trước khi rewrite một nghiệp vụ, cần viết test mô phỏng output của hệ Java cũ.

Ví dụ:

```txt
Case 1:
Order amount = 10,000円
Tax = 10%
Expected:
- subtotal = 10,000
- tax = 1,000
- total = 11,000

Case 2:
Customer closing day = 末日
Expected:
- invoice period = 2026-06-01 → 2026-06-30

Case 3:
Partial payment
Expected:
- receivable balance updated correctly
```

Các phần bắt buộc phải test kỹ:

```txt
- 消費税 / thuế tiêu dùng
- rounding / làm tròn
- 締処理 / closing
- 請求 / invoice
- 入金消込 / payment allocation
- status transition
- permission
- report output
```

---

## 11. Mapping JP | VN

| JP | VN |
|---|---|
| 販売管理 | Quản lý bán hàng |
| 見積 | Báo giá |
| 受注 | Đơn đặt hàng |
| 売上 | Doanh thu / phiếu bán hàng |
| 請求 | Hóa đơn / yêu cầu thanh toán |
| 入金 | Thu tiền |
| 消込 | Gạch nợ / đối trừ thanh toán |
| 締処理 | Chốt kỳ |
| 得意先 | Khách hàng |
| 商品 | Sản phẩm |
| 在庫 | Tồn kho |
| 仕入 | Mua hàng |
| 権限 | Phân quyền |
| 承認 | Phê duyệt |
| 帳票 | Báo cáo / biểu mẫu |
| 税率 | Thuế suất |
| 部門 | Phòng ban |
| 担当者 | Người phụ trách |
| 取引先 | Đối tác giao dịch |
| 売掛金 | Công nợ phải thu |

---

## 12. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
|---|---|
| Không hiểu hết logic Java cũ | Audit + migration map |
| Sai database schema | Import DB cũ, so sánh dữ liệu thực tế |
| Sai tiền / thuế | Characterization test |
| Màn hình quá nhiều | Migrate theo module |
| Báo cáo PDF/Excel khó giống cũ | Tách report engine riêng |
| Batch cũ bị bỏ sót | Audit toàn bộ batch job |
| Logic closing phức tạp | Viết test theo từng kỳ |
| AGPLv3 license | Kiểm tra pháp lý trước khi thương mại hóa |

---

## 13. Lệnh khởi tạo project

```bash
mkdir salescube-ts
cd salescube-ts

pnpm init
pnpm add -D turbo typescript eslint prettier

mkdir apps packages legacy docs
```

```bash
cd apps
pnpm create next-app web --ts --tailwind --app
nest new api
```

```bash
cd ../packages
mkdir domain db shared ui
```

Cấu hình `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Ví dụ root `package.json`:

```json
{
  "name": "salescube-ts",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

---

## 14. File migration-map.md khởi đầu

```md
# SalesCube Migration Map

## 1. Legacy Structure

- DB/
- WEB/SalesCube/src/main/java
- WEB/SalesCube/src/main/resources
- WEB/SalesCube/src/main/webapp

## 2. Module Inventory

| Legacy Module | Screen | Java Class | Table | New TS Module | Priority |
|---|---|---|---|---|---|
| Customer | TBD | TBD | TBD | customers | High |
| Product | TBD | TBD | TBD | products | High |
| Sales Order | TBD | TBD | TBD | sales-orders | High |
| Invoice | TBD | TBD | TBD | invoices | High |
| Payment | TBD | TBD | TBD | payments | Medium |

## 3. Migration Strategy

- Keep legacy source for comparison.
- Rebuild domain logic in TypeScript.
- Write tests before replacing module.
- Run Java and TypeScript versions in parallel.
```

---

## 15. Thứ tự ưu tiên triển khai

Ưu tiên migrate theo thứ tự sau:

```txt
1. Auth / User / Role / Permission
2. Customer Master
3. Product Master
4. Sales Order
5. Sales Slip
6. Invoice
7. Payment
8. Reports
9. Batch Jobs
10. Admin / System Settings
```

Lý do:

- Auth và phân quyền là nền tảng.
- Customer/Product là dữ liệu master.
- Sales Order là luồng nghiệp vụ chính.
- Invoice/Payment có nhiều logic kế toán nên cần xử lý sau khi domain sales ổn định.
- Report/Batch nên làm sau khi dữ liệu ổn.

---

## 16. Nguyên tắc khi dùng AI để migrate

Có thể dùng Claude Code, Cursor hoặc ChatGPT để hỗ trợ:

```txt
- Đọc source legacy.
- Tạo migration map.
- Sinh API skeleton.
- Convert DTO/entity đơn giản.
- Viết test.
- Tạo Prisma schema draft.
- So sánh logic cũ và mới.
```

Không nên để AI tự quyết:

```txt
- Logic tính thuế.
- Logic làm tròn.
- Logic closing.
- Logic invoice.
- Logic payment allocation.
- Logic permission phức tạp.
```

Các logic này phải được xác nhận bằng test và tài liệu nghiệp vụ.

---

## 17. Kết luận

Hướng migrate tốt nhất là:

```txt
SalesCube Java Legacy
↓
Audit + Migration Map
↓
NestJS API + Domain Package
↓
Prisma + PostgreSQL
↓
Next.js Frontend
↓
Parallel Run
↓
UAT
↓
Cutover
```

Không nên migrate kiểu convert file Java sang TypeScript 1:1.

Nên migrate theo module nghiệp vụ, có test đối chiếu, chạy song song với hệ thống cũ, sau đó thay thế từng phần.
