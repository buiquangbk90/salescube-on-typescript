---
description: Create a pull request with full quality checks (lint, type-check, test, build)
---

## Pre-PR Quality Gate — SalesCube Monorepo

Run ALL steps below in order before pushing and creating a PR. Do NOT skip any step. If any step fails, fix the issue first before proceeding.

### 1. Check current branch
// turbo
Run `git branch --show-current` to confirm you are NOT on `main` or `develop`. If on main/develop, create a feature branch first:
```
git checkout -b <type>/<short-description>
```
Branch naming convention: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`

### 2. Review code against project spec
Before running any checks, verify:
- Code follows existing patterns in the codebase (NestJS modules/controllers/services structure for api, Next.js App Router for web)
- No hardcoded secrets or credentials
- TypeScript strict mode satisfied (no `any` unless justified)
- No commented-out dead code left behind

### 3. Run Biome lint + format
// turbo
```
pnpm lint
```
If errors found, auto-fix:
// turbo
```
pnpm lint:fix
```
Then re-run lint to confirm clean. For NestJS files, `useImportType` is disabled — do NOT convert injected service imports to `import type`.

### 4. Run type-check
// turbo
```
pnpm type-check
```
Must exit 0 with no errors across all packages.

### 5. Run unit tests
// turbo
```
pnpm test
```
All test files must pass. If tests fail:
- Fix the root cause in source code, not the test
- Do NOT delete or weaken existing tests
- Re-run until green

### 6. Run build
// turbo
```
pnpm build
```
Both `@salescube/api` (NestJS) and `@salescube/web` (Next.js) must build successfully.

### 7. Commit with conventional commit message
Stage and commit:
```
git add -A
git commit -m "<type>(<scope>): <short description>

<optional body explaining why>"
```
Commit types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
Scopes: `api`, `web`, `types`, `tsconfig`, `ci`, `deps`

### 8. Push branch
```
git push origin <branch-name>
```

### 9. Create PR
Open PR via browser:
```
open "https://github.com/buiquangbk90/salescube-on-typescript/pull/new/<branch-name>"
```
PR title must follow: `<type>(<scope>): <description>`
PR body must use the `.github/pull_request_template.md` checklist — mark all completed items.
