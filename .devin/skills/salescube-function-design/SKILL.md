---
name: salescube-function-design
description: Sinh Function Design cho Service/Action SalesCube. Follow workflow 6 bước, ghi vào .devin/output/function-design/.
triggers:
  - user
  - model
argument-hint: <ClassName> [source_path] hoặc "batch P1"
allowed-tools:
  - read
  - grep
  - glob
  - edit
  - exec
---

# SalesCube — Function Design (PROMPT 2)

## Workflow bắt buộc

Đọc và làm **đúng 6 bước** trong `.devin/agents/function-design-agent.md`.

## Scaffold (đọc khi cần — không auto-load)

| Mục đích | File |
|----------|------|
| Context | `.devin/overview.md` |
| Rules | `.devin/rules/general-rules.md`, `.devin/rules/function-design-rules.md` |
| Template | `.devin/templates/function-design-template.md` |
| Example | `.devin/examples/function-design/good-example-SearchSalesService.md` |

## Input

- Nếu có `$ARGUMENTS`: dùng làm `function_name` / `source_path`.
- Nếu không: lấy mục `[ ]` P1 tiếp theo từ `.devin/module-map.md`.
- Mặc định batch mẫu nếu chưa có module-map:
  1. `SearchSalesService` — `service/sales/SearchSalesService.java`
  2. `InputSalesAction` — `action/sales/InputSalesAction.java`

## Output

1. Ghi `.devin/output/function-design/{function_name}.md`
2. Cập nhật `[x]` trong `.devin/module-map.md`
3. Ghi log `.devin/output/function-design/_log.md`
4. Commit sau mỗi file. Batch tối đa 5–10, xử lý LẦN LƯỢT.

## Cấm

- Không sửa `.devin/overview.md`, `rules/`, `templates/`, `examples/`.
- Không bịa — không rõ ghi `[CẦN XÁC NHẬN]`.
