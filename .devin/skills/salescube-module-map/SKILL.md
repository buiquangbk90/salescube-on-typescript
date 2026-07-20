---
name: salescube-module-map
description: Bước 1 — quét source SalesCube và tạo .devin/module-map.md (danh sách target Function/Screen Design).
triggers:
  - user
  - model
argument-hint: <optional SOURCE_REPO path or URL>
allowed-tools:
  - read
  - grep
  - glob
  - edit
  - exec
---

# SalesCube — Lập Module Map (PROMPT 1)

## Đọc trước

1. `.devin/overview.md`
2. `.devin/module-map.template.md` — khung output

## Việc cần làm

1. Quét toàn bộ source SalesCube (`$ARGUMENTS` hoặc SOURCE_REPO trong `rules/general-rules.md`).
2. Tạo `.devin/module-map.md` theo template.
3. Liệt kê đầy đủ:
   - **Function Design**: mọi Service + Action chứa logic (kèm đường dẫn file).
   - **Screen Design**: mọi thư mục JSP `WEB-INF/view/{domain}/{screen}/` (kèm Action tương ứng).
4. Gán P1 cho domain core: `sales`, `rorder`, `porder`, `master`.
5. **KHÔNG** sinh tài liệu design ở bước này.
6. Commit `module-map.md` khi xong.

## Bước tiếp theo

`/salescube-function-design` hoặc `/salescube-screen-design` với batch từ module-map P1.
