# Cursor AI Config

Cấu hình agent cho SalesCube — **sync từ** `.devin/workflows/` và `.devin/rules/`.

## Cập nhật từ Devin

Khi sửa workflow Devin, copy sang skill tương ứng:

```bash
cp .devin/workflows/<name>.md .cursor/skills/<skill>/reference-workflow.md
```

| Devin | Cursor skill |
|-------|----------------|
| `generate-function-design.md` | `generate-function-design/` |
| `reverse-engineering-java.md` | `reverse-engineering-java/` |
| `generate-workflow-docs.md` | `generate-workflow-docs/` |
| `migration-typescript.md` | `migration-typescript/` |
| `generate-prisma-schema.md` | `generate-prisma-schema/` |
| `rules/agent-rules.md` | `rules/05-agent-rules.mdc` |

## Dùng

- **Rules:** tự load từ `rules/*.mdc`
- **Skills:** gọi `/tên-skill` trong Agent chat
- **Index:** đọc `AGENTS.md` ở repo root
