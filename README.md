# SalesCube Monorepo

TypeScript monorepo powered by **pnpm**, **Turborepo**, **Biome**, and **Vitest**.

## Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Backend   | NestJS 10 (Node 24, Express)         |
| Frontend  | Next.js 16 (App Router) + Tailwind CSS |
| Language  | TypeScript 5.5                    |
| Monorepo  | pnpm workspaces + Turborepo       |
| Linting   | Biome                             |
| Testing   | Vitest                            |

## Project Structure

```
salescube/
├── apps/
│   ├── api/          # NestJS backend  (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   ├── tsconfig/     # Shared TypeScript configs
│   └── types/        # Shared TypeScript types
├── biome.json
├── turbo.json
└── pnpm-workspace.yaml
```


## Agent Benchmark Harness

Dựng một harness benchmark 3 agent (Claude / Cursor / Devin) cùng RE module SalesCube, tất cả trong `docs/`:

- **Templates chung:** `docs/templates/` — `requirements` (nghiệp vụ – what) → `technical` (Java as-is) → `design` (port NestJS/Next.js – to-be).
- **Task card cố định:** `docs/modules/estimate.md` — scope file khoá cứng cho module pilot, input giống hệt cho cả 3 agent.
- **Output riêng:** `docs/_generated/{claude,cursor,devin}/{requirements,technical,design}/` — không đè nhau.
- **README hub:** `docs/README.md` — quy trình + rubric chấm điểm 6 tiêu chí.
- **Wiring:** từng agent trỏ vào cùng harness: `CLAUDE.md`; `.cursor/rules/{00-project, 10-reverse-eng, 20-java-seasar}.mdc`; PROMPT 5 trong `.devin/DEVIN-PROMPTS.md`. Kèm `.cursorignore` / `.devinignore`.

### Cách chạy từng agent

Đường dẫn source dùng chung: `salescube/SalesCube/WEB/SalesCube/src/main`. Module pilot: `estimate`.

#### Claude (Cowork/Claude Code, mở tại root repo này)

- RE module `estimate` để benchmark. Bạn là agent `claude`.
- Source Java: `salescube/SalesCube/WEB/SalesCube/src/main`
- Đọc `docs/README.md` → `.devin/overview.md` → `docs/modules/estimate.md`, rồi sinh 3 tài liệu theo `docs/templates/` vào `docs/_generated/claude/{requirements,technical,design}/estimate.md`
- `CLAUDE.md` tự nạp nên có thể nói gọn "RE module estimate theo harness docs/".

#### Cursor (mở repo bằng Cursor IDE)

- 3 rule `.mdc` tự nạp (`00` luôn bật; `20-java-seasar` auto khi mở file `.java`/`.jsp`/`.sql`).
- Trong Cursor Chat/Composer (Agent mode), gõ:
  - `@10-reverse-eng RE module estimate. Bạn là agent cursor.`
  - `Source Java: salescube/SalesCube/WEB/SalesCube/src/main`
  - `Sinh 3 tài liệu vào docs/_generated/cursor/{requirements,technical,design}/estimate.md`

#### Devin

- Mở `.devin/DEVIN-PROMPTS.md`, copy nội dung PROMPT 5, thay `<SOURCE_REPO>` = `salescube/SalesCube/WEB/SalesCube/src/main`, dán cho Devin.

### Sau khi cả 3 xong

- So sánh 3 thư mục `_generated/*/…/estimate.md` theo rubric trong `docs/README.md` (gợi ý tạo `docs/_generated/scorecard.md`).