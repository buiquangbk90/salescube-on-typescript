# CLAUDE.md

**Nguồn quy tắc chính là [`AGENTS.md`](./AGENTS.md)** — đọc trước, tuân thủ toàn bộ (stack, convention, quality gate, luật docs). File này chỉ bổ sung phần riêng cho Claude.

## Reverse-engineering benchmark (harness `docs/`)

Khi được giao RE một module SalesCube để so sánh 3 agent, Claude là agent `claude`:

1. Đọc theo thứ tự: `docs/README.md` → `.devin/overview.md` → `docs/modules/<module>.md` (task card).
2. Sinh đúng 3 tài liệu theo template dùng chung ở `docs/templates/`:
   - `docs/_generated/claude/requirements/<module>.md`
   - `docs/_generated/claude/technical/<module>.md`
   - `docs/_generated/claude/design/<module>.md`
3. **Chỉ ghi trong `docs/_generated/claude/**`** — không đụng thư mục `cursor/` hay `devin/`.
4. Bám source Java thật; thiếu thông tin → `[CẦN XÁC NHẬN]`, không bịa nghiệp vụ.
5. Không mở rộng ngoài scope file trong task card; phần liên quan ghi ở mục "phụ thuộc".
6. Giữ nguyên thứ tự & tiêu đề mục của template; viết tiếng Việt.

Module pilot hiện tại: **estimate (見積)** — xem `docs/modules/estimate.md`.
