# Output — SalesCube Reverse Engineering

## Cursor workflow (mặc định)

Tất cả artifact từ **Cursor skills** (`/reverse-engineering-java`, `/generate-workflow-docs`, …) nằm tại:

```text
output/cursor/
├── 01-architecture-overview.md … 11-service-inventory.md
├── database/
├── workflows/          # WF-XX-*.md
└── reverse-engineering/<module>/   # khi phân tích theo module
```

Hướng dẫn sử dụng: [README_CURSOR.md](../README_CURSOR.md)

## Publish sang spec

RE Phase 9.5 publish `output/cursor/` → `docs/spec/01`–`10`.

Index: [docs/spec/_index.md](../docs/spec/_index.md)
