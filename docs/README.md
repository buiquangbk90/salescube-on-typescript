# docs/ — Harness so sánh 3 AI agent trên tác vụ Reverse Engineering

Mục tiêu: reverse-engineer từng module của **SalesCube (Java)** rồi tái hiện dưới dạng tài liệu,
phục vụ viết lại trên stack **TypeScript** (NestJS + Next.js). Đồng thời **so sánh Claude vs Cursor vs Devin**
trên *cùng một input* để đánh giá ưu/nhược của từng cách triển khai.

## Nguyên tắc so sánh công bằng
Cả 3 agent nhận **cùng task card** (`modules/<module>.md`), dùng **cùng bộ template** (`templates/`),
và ghi ra **thư mục riêng** (`_generated/<agent>/`) nên không ghi đè nhau.

## Cấu trúc
```
docs/
├── README.md                     # file này
├── templates/                    # 3 template DÙNG CHUNG cho mọi agent
│   ├── requirements-template.md  # yêu cầu nghiệp vụ (what)
│   ├── technical-template.md     # kỹ thuật hiện trạng Java (as-is)
│   └── design-template.md        # thiết kế bản port TypeScript (to-be)
├── modules/
│   └── estimate.md               # task card cố định cho module pilot
└── _generated/
    ├── claude/{requirements,technical,design}/
    ├── cursor/{requirements,technical,design}/
    └── devin/{requirements,technical,design}/
```

Vì sao 3 loại tài liệu: **requirements (what) → technical (as-is) → design (to-be)** là một mạch logic
cho dự án viết lại — và bậc "design" bộc lộ rõ nhất khả năng suy luận, nên rất tốt để phân biệt agent.

> Lưu ý: `.devin/` (Function Design + Screen Design) là scaffold cũ, chi tiết theo từng class/màn hình.
> Harness này ở tầng module, phục vụ benchmark 3 agent. Agent có thể tái dùng output `.devin/` làm nguyên liệu cho mục Technical.

## Quy trình pilot (module estimate)
1. Clone Java source `salescube/SalesCube` về máy để agent đọc được `WEB/SalesCube/src/main`.
2. Với **từng agent**, đưa `docs/modules/estimate.md` + 3 template làm chỉ dẫn, yêu cầu sinh 3 file
   vào `_generated/<agent>/{requirements,technical,design}/estimate.md`.
3. Chạy độc lập, không cho agent này xem output agent kia.
4. Chấm điểm theo rubric bên dưới, rồi mở rộng sang `rorder` (受注) và `stock` (在庫).

## Rubric chấm điểm (mỗi tiêu chí 1–5)
| # | Tiêu chí | Ý nghĩa |
|---|----------|---------|
| 1 | Độ đầy đủ | Điền hết mục template, không bỏ trống sai cách |
| 2 | Độ trung thực với code | Bám source thật, không suy diễn; số liệu/tên class đúng |
| 3 | Kiểm soát bịa | Dùng `[CẦN XÁC NHẬN]` đúng chỗ thay vì bịa nghiệp vụ |
| 4 | Chất lượng design TS | API/model/mapping Java→TS hợp lý, khả thi trên NestJS/Next.js |
| 5 | Nhất quán 3 tài liệu | Design truy vết được về Requirements + Technical |
| 6 | Tính khả thi (actionable) | Dev đọc xong code được ngay hay không |

**Ghi kết quả** vào bảng tổng (đề xuất tạo `_generated/scorecard.md` sau khi có đủ output 3 agent):

| Agent | Đầy đủ | Trung thực | Bịa | Design TS | Nhất quán | Actionable | Tổng | Ghi chú |
|-------|:------:|:----------:|:---:|:---------:|:---------:|:----------:|:----:|---------|
| claude | | | | | | | | |
| cursor | | | | | | | | |
| devin  | | | | | | | | |

## Ưu/nhược cần quan sát khi so sánh (gợi ý trục đánh giá)
- **Cách nạp context**: mỗi agent xử lý repo lớn thế nào (đọc bao nhiêu file, có lạc scope không).
- **Bám code vs bịa**: tần suất `[CẦN XÁC NHẬN]` hợp lý vs bịa logic.
- **Chất lượng bản port**: hiểu Seasar/S2Struts để map sang NestJS chính xác tới đâu.
- **Chi phí/tốc độ & tính lặp lại**: thời gian, số vòng, độ ổn định giữa các lần chạy.
