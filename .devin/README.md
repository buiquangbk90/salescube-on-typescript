# SalesCube Docs – Bộ scaffold Reverse Engineering Documentation (Phase 1)

Đây là bộ "knowledge base" để Devin AI (hoặc agent tương đương) đọc source code
SalesCube và **tự động sinh ra bộ tài liệu Design** với chất lượng nhất quán, theo số lượng lớn.

## Devin auto-load vs scaffold thủ công

| Thành phần | Devin tự load? | Ghi chú |
|------------|----------------|---------|
| `AGENTS.md` (repo root) | ✅ Luôn | Con trỏ tới `.devin/` + bảng skills |
| `.devin/skills/*/SKILL.md` | ✅ Session start | Trigger: `/salescube-*` hoặc `@skills:...` |
| `.cursor/rules/*` | ✅ Nếu `read_config_from.cursor` | Chưa có trong repo này |
| `.windsurf/rules/*` | ✅ Nếu `read_config_from.windsurf` | Chưa có — chỉ có `.windsurf/workflows/` (gọi thủ công) |
| `.claude/*` | ✅ Nếu `read_config_from.claude` | |
| `.devin/overview.md`, `rules/`, `templates/`, `agents/`, `examples/` | ❌ | Agent đọc khi skill/prompt trỏ tới |

Cấu hình import: `.devin/config.json` → `read_config_from`.

## SalesCube là gì
Hệ thống quản lý bán hàng (販売管理システム) mã nguồn mở, viết bằng **Java + Seasar2 / S2Struts**.
Kiến trúc phân tầng: `Action → Form/DTO → Service → Entity (+ SQL)`, view bằng JSP.
(Repo gốc: https://github.com/salescube/SalesCube — license AGPLv3)

## Cấu trúc thư mục
```
.devin/
├── config.json                     ← permissions, read_config_from, MCP
├── README.md                       ← file này
├── overview.md                     ← tổng quan (đọc khi skill setup chạy)
├── module-map.template.md          ← khung module-map
├── DEVIN-PROMPTS.md                ← prompt copy-paste (thay thế skill nếu cần)
├── skills/                         ← TRIGGER workflows (Devin auto-discover)
│   ├── salescube-setup/SKILL.md
│   ├── salescube-module-map/SKILL.md
│   ├── salescube-function-design/SKILL.md
│   ├── salescube-screen-design/SKILL.md
│   └── salescube-consistency/SKILL.md
├── templates/
├── examples/
├── rules/
├── agents/                         ← workflow 6 bước (đọc qua skill)
└── output/                         ← Devin ghi tài liệu sinh ra
    ├── function-design/
    └── screen-design/
```

## Thứ tự sử dụng
1. **Người**: review `overview.md`, `rules/`, `examples/`.
2. **Devin**: `/salescube-setup` → `/salescube-module-map` → batch function/screen → `/salescube-consistency`.
3. **Người**: review batch → sửa `rules/` hoặc `examples/` → regenerate.

> ⚠️ Chất lượng `examples/` và `rules/` quyết định ~80% chất lượng output.

## Cấu hình nhanh
- **SOURCE_REPO**: URL repo Java SalesCube (read-only) — điền trong `rules/general-rules.md`.
- **OUTPUT_LANG**: `vi` (mặc định) hoặc `ja` — trong `rules/general-rules.md`.
- **DOMAIN_SCOPE**: sales, rorder, porder, master (P1).

## Playbook macro (tùy chọn, Devin web app)

Import nội dung từ `DEVIN-PROMPTS.md` vào Playbook org và gán macro, ví dụ:
`!salescube-setup`, `!salescube-module-map`, `!salescube-fd`, `!salescube-sd`.

Skills trong repo đã đủ cho CLI + cloud khi repo được index.
