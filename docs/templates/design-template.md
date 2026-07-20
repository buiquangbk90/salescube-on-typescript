# Design (To-Be TypeScript) – {{MODULE}} ({{MODULE_JP}})

> Tài liệu **THIẾT KẾ BẢN PORT (to-be)** — module này sẽ được viết lại thế nào trên stack TypeScript.
> Template BẮT BUỘC: giữ nguyên thứ tự & tiêu đề. Suy luận thiết kế PHẢI truy vết được về tài liệu Requirements + Technical; giả định chưa chốt → `[CẦN XÁC NHẬN]`.
> Stack đích (theo `AGENTS.md`): `apps/api` = **NestJS**, `apps/web` = **Next.js App Router**, `packages/types` = type dùng chung. TS strict, Biome.

## 0. Metadata
| Thuộc tính | Giá trị |
|-----------|---------|
| Module | {{MODULE}} ({{MODULE_JP}}) |
| Agent thực hiện | {{claude \| cursor \| devin}} |
| Ngày | {{YYYY-MM-DD}} |
| Dựa trên | `requirements/{{MODULE}}.md` + `technical/{{MODULE}}.md` cùng agent |
| Loại tài liệu | Design / To-Be (NestJS + Next.js + TS) |

## 1. Mục tiêu & nguyên tắc port
- Giữ nguyên hành vi nghiệp vụ; hiện đại hoá kỹ thuật (bỏ Seasar, dùng DI của NestJS, validation bằng class-validator...).
- Nguyên tắc: giữ tách Slip/Line, giữ business rules, thay JSP bằng React Server/Client Components.

## 2. Kiến trúc đích
```
apps/api (NestJS)   : {{module}}.module.ts → controller → service → repository/entity
apps/web (Next.js)  : app/{{module}}/... (route) → components → gọi API
packages/types      : DTO & type dùng chung cho cả api và web
```

## 3. Mô hình dữ liệu đích
Bảng ánh xạ trường (từ `*Trn` sang model TS). Nêu rõ kiểu, nullable, default.
| Trường (Java/DB) | Trường (TS) | Kiểu TS | Null? | Ghi chú |
|------------------|-------------|---------|-------|---------|
| ESTIMATE_SHEET_ID | estimateSheetId | string | N | PK |
| ... | ... | ... | ... | ... |

- ORM/cách truy cập dữ liệu đề xuất: {{Prisma/TypeORM/...}} `[CẦN XÁC NHẬN]` nếu chưa chốt trong repo.

## 4. API contract (REST)
| Method | Path | Mô tả | Request DTO | Response DTO |
|--------|------|-------|-------------|--------------|
| GET | `/{{module}}` | tìm kiếm | {{Search}}QueryDto | {{}}ListDto |
| POST | `/{{module}}` | tạo | Create{{}}Dto | {{}}Dto |
| PUT | `/{{module}}/:id` | sửa | Update{{}}Dto | {{}}Dto |
| ... | | | | |

## 5. NestJS module design (apps/api)
| Thành phần | File đề xuất | Trách nhiệm | Map từ (Java) |
|-----------|--------------|-------------|---------------|
| Controller | `{{module}}.controller.ts` | route + validate | `*Action` |
| Service | `{{module}}.service.ts` | business logic | `*Service` |
| DTO | `dto/*.dto.ts` | input/output | `*Form` / `*Dto` |
| Entity/Model | `entities/*.ts` | ánh xạ bảng | `*Trn` |

## 6. Web design (apps/web – Next.js)
| Màn hình | Route | Component chính | State / data | Gọi API |
|----------|-------|-----------------|--------------|---------|
| ... | `app/{{module}}/...` | ... | ... | ... |

## 7. Business rules → nơi hiện thực
| Mã BR (từ Requirements) | Hiện thực ở đâu | Cách làm |
|-------------------------|-----------------|----------|
| BR-01 | service method / DB constraint / validation pipe | ... |

## 8. Bảng ánh xạ Java → TypeScript (truy vết)
| Java (class/method) | TypeScript (tương đương) | Ghi chú khác biệt |
|---------------------|--------------------------|-------------------|
| `InputEstimateAction#doRegister` | `EstimateController.create()` | ... |
| `Beans.copy` | `class-transformer` / map thủ công | bỏ Seasar |

## 9. Quyết định thiết kế & khác biệt so với bản Java
Liệt kê các quyết định (vd: thay sinh số phiếu bằng sequence DB; transaction bằng `@Transactional` của NestJS...) + lý do.

## 10. Rủi ro / điểm chưa rõ
- [CẦN XÁC NHẬN] ...
