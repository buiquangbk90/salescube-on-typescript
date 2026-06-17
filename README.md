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

## Getting Started

### Prerequisites

- Node.js >= 24
- pnpm >= 9  (`npm i -g pnpm`)

### Install dependencies

```bash
pnpm install
```

### Development

```bash
# Run all apps concurrently
pnpm dev

# Run individual apps
pnpm --filter @salescube/api dev
pnpm --filter @salescube/web dev
```

### Build

```bash
pnpm build
```

### Tests

```bash
pnpm test

# With coverage
pnpm --filter @salescube/api test:coverage
pnpm --filter @salescube/web test:coverage
```

### Lint & Format

```bash
pnpm lint        # check
pnpm lint:fix    # auto-fix
pnpm format      # format all files
```

## Environment Variables

Copy `.env.example` to `.env` in each app directory and fill in the values.

### `apps/api/.env`

```
PORT=3001
NODE_ENV=development
```
