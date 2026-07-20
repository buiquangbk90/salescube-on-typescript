---
name: salescube-setup
description: Bước 0 — đọc context SalesCube (overview, rules) trước khi sinh design docs. Dùng khi bắt đầu session reverse-engineering.
triggers:
  - user
  - model
allowed-tools:
  - read
  - grep
  - glob
---

# SalesCube — Setup (PROMPT 0)

Bạn reverse-engineer SalesCube (Java / Seasar2 + S2Struts) để sinh design docs.

## Scaffold (đọc theo thứ tự — KHÔNG auto-load, phải mở file)

1. `.devin/README.md` — cấu trúc thư mục
2. `.devin/overview.md` — kiến trúc layered, 12 domain, glossary
3. `.devin/rules/general-rules.md` — OUTPUT_LANG, quy tắc chung

## Việc cần làm

1. Đọc đủ 3 file trên.
2. Xác nhận đã hiểu: Action → Form/DTO → Service → Entity, 12 domain nghiệp vụ.
3. **Chưa sinh tài liệu design** ở bước này.
4. Hỏi user nếu chưa rõ `SOURCE_REPO` (repo Java SalesCube gốc).

## Bước tiếp theo

Gợi ý user chạy `/salescube-module-map` hoặc `@skills:salescube-function-design`.
