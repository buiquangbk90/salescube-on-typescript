---
name: salescube-screen-design
description: Sinh Screen Design cho màn hình JSP SalesCube. Follow workflow 6 bước, ghi vào .devin/output/screen-design/.
triggers:
  - user
  - model
argument-hint: <screen_id> [domain] hoặc "batch P1"
allowed-tools:
  - read
  - grep
  - glob
  - edit
  - exec
---

# SalesCube — Screen Design (PROMPT 3)

## Workflow bắt buộc

Đọc và làm **đúng 6 bước** trong `.devin/agents/screen-design-agent.md`.

## Scaffold (đọc khi cần — không auto-load)

| Mục đích | File |
|----------|------|
| Context | `.devin/overview.md` |
| Rules | `.devin/rules/general-rules.md`, `.devin/rules/screen-design-rules.md` |
| Template | `.devin/templates/screen-design-template.md` |
| Example | `.devin/examples/screen-design/good-example-inputSales.md` |

## Input

- Nếu có `$ARGUMENTS`: dùng làm `screen_id` / `domain`.
- Nếu không: lấy mục `[ ]` P1 tiếp theo từ `.devin/module-map.md`.
- Mặc định batch mẫu:
  1. `inputSales` — `WEB-INF/view/sales/inputSales/` (domain: sales)
  2. `searchSales` — `WEB-INF/view/sales/searchSales/` (domain: sales)

## Output

1. Ghi `.devin/output/screen-design/{screen_id}.md`
2. Cập nhật `[x]` trong `.devin/module-map.md`
3. Ghi log `.devin/output/screen-design/_log.md`
4. Commit sau mỗi màn hình. Batch tối đa 5–10, xử lý LẦN LƯỢT.

## Cấm

- Không sửa scaffold (overview, rules, templates, examples).
- Không bịa — không rõ ghi `[CẦN XÁC NHẬN]`.
