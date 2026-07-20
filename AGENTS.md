# SalesCube (TypeScript) — Agent Rules

Monorepo for SalesCube, a sales-management system. Keep these rules in mind every session.

## Stack & layout

- **Package manager: pnpm only** (`pnpm@9.4.0`). Never use `npm` or `yarn`. Node `>=24`.
- **Monorepo: pnpm workspaces + Turborepo.** Run tasks from the root via `turbo`.
- **Apps:** `apps/api` (NestJS), `apps/web` (Next.js App Router).
- **Packages:** `packages/types` (shared types), `packages/tsconfig` (shared TS config).
- **Lint/format: Biome** (not ESLint/Prettier).

## Conventions

- TypeScript strict mode. No `any` unless justified with a comment.
- Follow existing patterns: NestJS modules/controllers/services in `apps/api`; Next.js App Router in `apps/web`.
- In `apps/api`, Biome's `useImportType` is **off** — do NOT convert injected NestJS service imports to `import type`.
- Formatting (enforced by Biome): 2-space indent, line width 100, single quotes (double for JSX in `apps/web`), trailing commas, semicolons.
- Conventional commits: `<type>(<scope>): <desc>`. Types: `feat fix chore docs refactor test style`. Scopes: `api web types tsconfig ci deps`.
- Branch names: `feat/ fix/ chore/ docs/ refactor/` + short description. Never commit to `main`/`develop`.

## Before declaring work done (quality gate)

Run from the repo root and ensure all pass:

```
pnpm lint        # auto-fix with: pnpm lint:fix
pnpm type-check
pnpm test
pnpm build
```

Fix the root cause, not the test. Do not delete or weaken existing tests.
The full PR workflow is in `.windsurf/workflows/create-pr.md`; PRs must follow `.github/pull_request_template.md`.

## Reverse-engineering documentation tasks

Scaffold lives in `.devin/`. Only `AGENTS.md` (this file) and `.devin/skills/*/SKILL.md` are auto-discovered by Devin — `rules/`, `templates/`, `agents/` must be read explicitly when a skill or prompt points to them.

**Trigger workflows** (slash command, `@skills:name`, or let Devin auto-pick when relevant):

| Skill | When |
|-------|------|
| `/salescube-setup` | Session start — read overview + rules, no doc output yet |
| `/salescube-module-map` | Scan Java source → `.devin/module-map.md` |
| `/salescube-function-design` | Batch Function Design → `.devin/output/function-design/` |
| `/salescube-screen-design` | Batch Screen Design → `.devin/output/screen-design/` |
| `/salescube-consistency` | Cross-check all output (user confirms before edits) |

Copy-paste prompts: `.devin/DEVIN-PROMPTS.md`. Do not invent business logic — mark unknowns `[CẦN XÁC NHẬN]`.

## Don't

- Don't introduce a second package manager or lockfile.
- Don't hardcode secrets or credentials.
- Don't leave commented-out dead code.
- For docs: don't invent business logic not in the source — mark unknowns `[CẦN XÁC NHẬN]`.
