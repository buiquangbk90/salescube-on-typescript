# AGENT.md

> Quy tắc reverse-engineering cho AI agent. Domain: **`CLAUDE.md`**. Cursor: **`AGENTS.md`**, `.cursor/` (sync từ `.devin/`).

## Goal
Reverse engineer this legacy SalesCube source code.

Do not rewrite or refactor the application yet.

## Rules
- Do not modify legacy source code.
- Do not use or request production credentials.
- Do not invent business rules.
- Every conclusion must cite exact source file paths and line ranges.
- Mark findings as:
  - Confirmed by code
  - Inferred from code
  - Unknown / needs verification

## Required outputs
Write all reports under `output/`.

1. Architecture overview
2. Module inventory
3. Route and API inventory
4. Database model and ERD
5. Background jobs / cron / batch inventory
6. Authentication and authorization analysis
7. Screen / template / route mapping
8. Core business workflow candidates
9. External integrations
10. Risks, dead code, legacy dependencies, unknowns

## Output format
Use Markdown.
Use English | Vietnamese for technical documents.