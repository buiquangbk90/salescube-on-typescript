---
trigger: always_on
---

# SalesCube Agent Rules

Áp dụng cho **toàn bộ workflows** trong dự án SalesCube reverse engineering & migration.

## 1. Quy tắc bất biến (không được vi phạm)

- **KHÔNG sửa** bất kỳ file nào trong `SalesCube/` (legacy source)
- **KHÔNG bịa** business rules — mọi rule phải trích dẫn từ source code thực tế
- **KHÔNG dùng** production credentials, passwords, API keys thực
- **KHÔNG tạo file** ngoài các thư mục được chỉ định (`output/`, `docs/`, `salescube-ts/`, `.devin/`)

## 2. Trích dẫn bắt buộc

Mọi kết luận kỹ thuật **phải** kèm theo:
- Đường dẫn file tuyệt đối hoặc tương đối từ root
- Line range cụ thể: `ClassName.java:L10-L45`

Ví dụ đúng: `Confirmed by code: SalesCube/WEB/SalesCube/src/main/java/jp/co/arkinfosys/action/rorder/InputROrderAction.java:72-84`  
Ví dụ sai: "theo Java code", "trong service class"

## 3. Đánh dấu mức độ chắc chắn

Mọi finding **phải** được gắn một trong ba nhãn:

| Nhãn | Nghĩa | Khi dùng |
|------|-------|----------|
| `Confirmed by code` | Đọc trực tiếp từ source | Có file + line range rõ ràng |
| `Inferred from code` | Suy luận có cơ sở | Có pattern tương tự, không có line trực tiếp |
| `Unknown / needs verification` | Không xác định được | Không tìm được source, cần runtime/test |

**Nghiêm cấm** viết kết luận không có nhãn.

## 4. Output locations (theo AGENT.md)

| Output | Thư mục/File |
|--------|-------------|
| Architecture overview | `output/01-architecture-overview.md` |
| Module inventory | `output/02-module-inventory.md` |
| Route & API inventory | `output/03-route-api-inventory.md` |
| Database model & ERD | `output/04-database-analysis.md` |
| Batch / cron / jobs | `output/05-batch-jobs.md` (hoặc `docs/spec/10-batch-jobs.md`) |
| Auth & authorization | `output/06-auth-analysis.md` |
| Screen / template / route map | `docs/spec/05-screen-inventory.md` |
| Business workflows | `output/workflows/WF-XX-<name>.md` |
| External integrations | `output/09-external-integrations.md` |
| Risks & unknowns | `output/10-risks-unknowns.md` |
| Function Design | `docs/function-design/FD-<MODULE>-<NN>-<name>.md` |

## 5. Tech stack chuẩn (migration target)

Tham chiếu từ `CLAUDE.md` và `docs/spec/99-salescube-typescript-migration-plan.md`:

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | **NestJS** + TypeScript |
| ORM | Prisma + PostgreSQL |
| Validation | Zod hoặc class-validator |
| Auth | JWT + RBAC |
| State/Data fetching | TanStack Query |
| Form | React Hook Form |
| PDF/Report | React PDF hoặc server-side service |
| Batch | NestJS Schedule hoặc BullMQ |
| Monorepo | pnpm workspace + Turbo |

> ⚠️ Backend là **NestJS**, không phải tRPC hay Fastify standalone.

## 6. Mapping Java → TypeScript

| Java (Legacy) | TypeScript (Target) |
|---------------|---------------------|
| `*Action.java` | NestJS `@Controller` method |
| `*Service.java` | NestJS `@Injectable` service |
| `*Dto.java` | Zod schema + TypeScript type |
| Named SQL (S2JDBC) | Prisma query |
| `SEQ_MAKER` | `@default(autoincrement())` |
| `DEL_DATETM` | `deletedAt DateTime?` + Prisma middleware |
| `*_HIST` table | Prisma middleware hoặc explicit insert |
| `MENU_ID` check | NestJS Guard + `@RequirePermission()` decorator |
| `ServiceException` | `HttpException` |
| `UnabledLockException` | `ConflictException` (409) |

## 7. Output format

- Tất cả tài liệu: **Markdown**
- Ngôn ngữ: **Tiếng Việt** (ưu tiên) hoặc English cho thuật ngữ kỹ thuật
- Code snippets: có language tag (` ```typescript `, ` ```prisma `, ` ```java `)
- Bảng: dùng Markdown table, không dùng plain text
