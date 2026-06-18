# SalesCube TypeScript

Migration của hệ thống SalesCube (legacy Java) sang stack TypeScript hiện đại.

## Stack

- **Monorepo**: pnpm workspaces + Turbo
- **Frontend**: Next.js 15 (App Router) + Tailwind + shadcn/ui
- **Backend**: NestJS 11
- **ORM**: Prisma + PostgreSQL 16
- **Validation**: Zod
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form

## Cấu trúc

```
salescube-ts/
├── apps/
│   ├── web/          # Next.js
│   └── api/          # NestJS
├── packages/
│   ├── domain/       # Pure business logic
│   ├── db/           # Prisma schema + client
│   ├── shared/       # Types, Zod schemas, utils
│   └── ui/           # Shared React components
└── docker/
    └── docker-compose.yml
```

## Bắt đầu

### Yêu cầu

- Node.js >= 20
- pnpm >= 11
- Docker (cho PostgreSQL local)

### Cài đặt

```bash
# Cài dependencies
pnpm install

# Copy env
cp .env.example .env

# Khởi động PostgreSQL
pnpm db:up

# Chạy migration
pnpm db:migrate

# Khởi động dev (web :3000 + api :3001)
pnpm dev
```

### Verify

- Web: http://localhost:3000
- API health: http://localhost:3001/health
- Prisma Studio: `pnpm db:studio`

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy web + api song song |
| `pnpm build` | Build tất cả packages + apps |
| `pnpm lint` | Lint toàn workspace |
| `pnpm typecheck` | Kiểm tra type |
| `pnpm test` | Chạy test |
| `pnpm format` | Format code |
| `pnpm db:up` | Khởi động Postgres (Docker) |
| `pnpm db:down` | Dừng Postgres |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:studio` | Mở Prisma Studio |

## Tham chiếu

- [Migration plan](../docs/spec/salescube-typescript-migration-plan.md)
- [Module inventory](../docs/spec/01-module-inventory.md)
- [Entity list](../docs/spec/02-entity-list.md)
- [Business rules](../docs/spec/03-business-rules.md)
- [Migration map](../docs/spec/04-migration-map.md)
- [Screen inventory](../docs/spec/05-screen-inventory.md)
