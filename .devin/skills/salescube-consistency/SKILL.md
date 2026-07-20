---
name: salescube-consistency
description: Rà soát nhất quán toàn bộ .devin/output/ (glossary, tham chiếu chéo, navigation). PROMPT 4.
triggers:
  - user
allowed-tools:
  - read
  - grep
  - glob
  - edit
---

# SalesCube — Consistency Pass (PROMPT 4)

## Việc cần làm

1. Rà soát toàn bộ `.devin/output/`.
2. Kiểm tra:
   - Thuật ngữ thống nhất theo glossary trong `.devin/rules/general-rules.md` (R3).
   - Tham chiếu chéo đúng (Action/Service/Entity/màn hình khớp giữa các tài liệu).
   - Navigation giữa Screen Design nhất quán.
3. Liệt kê điểm chưa nhất quán + đề xuất sửa.
4. **Chỉ sửa file output sau khi user xác nhận.**
