# So sánh 3 AI agent khi reverse-engineering SalesCube — Hướng dẫn step-by-step

Mục tiêu: chạy cùng một nhiệm vụ RE trên Claude Code / Cursor / Devin một cách **độc lập**, rồi so sánh
**chất lượng tài liệu, input đã dùng, và token/chi phí tiêu hao**.

---

## 0. Cơ chế tổng quan (đọc trước)

- Mỗi tool làm việc trong **worktree riêng** = branch riêng = thư mục checkout riêng:

  | Tool | Worktree | Branch | Ghi output vào |
  |---|---|---|---|
  | Claude Code | `.worktrees/claude` | `re/claude` | `docs/_generated/claude/{requirements,technical,design}/` |
  | Cursor | `.worktrees/cursor` | `re/cursor` | `docs/_generated/cursor/{requirements,technical,design}/` |
  | Devin | (VM cloud, branch `re/devin`) | `re/devin` | `docs/_generated/devin/{requirements,technical,design}/` |

- Vì đường dẫn output **khác nhau theo tool** nên khi gộp 3 branch lại **không đụng nhau** → so sánh dễ.
- File name quy ước: `<domain>_<種別>.md`, ví dụ `rorder_要件定義書.md`.

---

## 1. Chuẩn bị (một lần)

Trong terminal thật:

```bash
cd "<repo>/SalesCube"
bash scripts/cleanup-git-locks.sh   # xóa .lock sót từ sandbox
git worktree list                    # xác nhận 3 worktree sạch, không còn 'locked'
```

Chọn **1 domain thử nghiệm chung cho cả 3 tool** để so sánh công bằng. Gợi ý: `rorder` (受注) —
vừa đủ phức tạp (action + service + entity + SQL + JSP). Dùng **cùng domain, cùng prompt** cho cả 3.

---

## 2. Định nghĩa "input chuẩn" (dùng y hệt cho cả 3 tool)

Để so sánh fair, cố định prompt. Prompt mẫu (tiếng Nhật, khớp AGENTS.md):

> AGENTS.md と docs/templates/ に従い、業務ドメイン `rorder`（受注）をリバースエンジニアリングして、
> 要件定義書・技術仕様書・設計書を日本語で作成してください。
> action/form/service/entity/SQL/JSP を静的解析し、事実はファイルパス・クラス名・テーブル名で裏付け、
> 推測は「（推測）」と明記すること。出力先は各ツール指定の `docs/_generated/<tool>/` 配下。

Ghi lại prompt này vào một file để tái sử dụng: `docs/_generated/_prompt_rorder.txt`.

---

## 3. Chạy từng tool

### 3.1 Claude Code
```bash
cd .worktrees/claude
claude          # mở Claude Code trong worktree này
```
Trong phiên:
- Gõ slash command: `/re-requirements rorder` → `/re-technical rorder` → `/re-design rorder`
  (hoặc dán nguyên prompt chuẩn ở mục 2).
- Kết thúc: gõ `/cost` để xem **token + chi phí ước tính của phiên**.
- Commit: `git add docs/_generated/claude && git commit -m "RE rorder (claude)"`

### 3.2 Cursor
```bash
cursor .worktrees/cursor     # mở Cursor trong worktree này
```
Trong Agent/Composer:
- Dán prompt chuẩn ở mục 2. Rule `.mdc` tự áp dụng.
- Commit tương tự: `git add docs/_generated/cursor && git commit -m "RE rorder (cursor)"`

### 3.3 Devin
- Trong Devin web app: connect repo, chọn branch `re/devin`.
- Dán nội dung `.devin/knowledge.md` vào Knowledge (một lần).
- Giao task bằng prompt chuẩn ở mục 2.
- Devin tự commit/push lên `re/devin`. Sau đó ở local: `git fetch && git worktree add .worktrees/devin re/devin` (nếu chưa) hoặc `cd .worktrees/devin && git pull`.

---

## 4. Đo token / chi phí (mỗi tool đo bằng đơn vị riêng)

3 tool KHÔNG dùng chung đơn vị. Ghi lại theo bảng, và quy về **USD + thời gian** để so sánh chéo.

| Tool | Cách xem | Đơn vị gốc | Ghi chú |
|---|---|---|---|
| **Claude Code** | `/cost` (phiên) hoặc `/usage`; `npx ccusage` cho báo cáo ngày/tháng từ log local; billing chuẩn ở Claude Console | input/output **tokens** + $ ước tính | `/cost` tính $ tại chỗ, có thể lệch nhẹ so với hóa đơn |
| **Cursor** | Settings → Usage dashboard (hoặc dashboard cursor.com / admin API) | **tokens** tổng hợp theo kỳ + số request + $ | Không hiện token từng request inline; xem tổng theo phiên/kỳ |
| **Devin** | Session view + Billing page trong Devin | **ACU** (1 ACU ≈ 15 phút Devin làm việc) + $ | Chỉ tính khi VM đang chạy; ~$2.25/ACU (pay-as-you-go) |

**Mẹo so sánh chéo:** vì đơn vị khác nhau, dùng 3 cột chung: **(a) chi phí USD**, **(b) thời gian wall-clock**, **(c) điểm chất lượng** (mục 6). Token chỉ so trực tiếp được giữa Claude Code và Cursor (cùng khái niệm token); Devin quy theo ACU → USD.

---

## 5. Gộp 3 kết quả về một chỗ để so sánh

Vì output path khác nhau nên merge sạch:
```bash
cd "<repo>/SalesCube"
git checkout master
git checkout -b re/compare
git merge --no-ff re/claude re/cursor re/devin -m "gather RE outputs for comparison"
# 3 thư mục cùng xuất hiện:
ls docs/_generated/claude docs/_generated/cursor docs/_generated/devin
```
Giờ có thể mở song song 3 file `rorder_要件定義書.md` để so sánh trực tiếp.

Xem khác biệt nhanh giữa 2 tool bất kỳ:
```bash
diff docs/_generated/claude/requirements/rorder_要件定義書.md \
     docs/_generated/cursor/requirements/rorder_要件定義書.md
```

---

## 6. Rubric chấm chất lượng (điểm 1–5 mỗi tiêu chí)

Chấm cùng 1 domain cho cả 3 tool:

| Tiêu chí | Ý nghĩa |
|---|---|
| **Độ đầy đủ (coverage)** | Có đủ画面一覧/機能一覧/テーブル定義 không? Bỏ sót action/entity nào? |
| **Độ chính xác (accuracy)** | Mỗi khẳng định có dẫn file path/class/table đúng không? Kiểm tra ngược vào source. |
| **Tỉ lệ "ảo" (hallucination)** | Có bịa class/table không tồn tại? Có trung thực gắn「（推測）」khi không chắc? |
| **Bám template** | Đúng cấu trúc `docs/templates/` không? |
| **Chiều sâu nghiệp vụ** | Có nêu được business rule (tính tiền, 在庫引当, 締め処理…) không? |
| **DB mapping** | Entity ↔ bảng ↔ cột có đúng và đầy đủ không? |

Cách verify accuracy nhanh: lấy 5–10 khẳng định ngẫu nhiên trong tài liệu, `grep` lại trong source để xác nhận class/table có thật.

---

## 7. Bảng tổng hợp so sánh (điền sau khi chạy)

| Hạng mục | Claude Code | Cursor | Devin |
|---|---|---|---|
| Domain / prompt | rorder / (chuẩn) | rorder / (chuẩn) | rorder / (chuẩn) |
| Thời gian hoàn thành | | | |
| Chi phí (USD) | | | |
| Token (nếu có) | tokens | tokens | — (ACU) |
| ACU | — | — | |
| Coverage (1–5) | | | |
| Accuracy (1–5) | | | |
| Hallucination (1–5) | | | |
| Bám template (1–5) | | | |
| Chiều sâu nghiệp vụ (1–5) | | | |
| DB mapping (1–5) | | | |
| **Tổng điểm / Nhận xét** | | | |

> Lặp lại quy trình với vài domain khác (`sales`, `stock`, `bill`) để có kết luận ổn định,
> tránh kết luận từ 1 mẫu duy nhất.
