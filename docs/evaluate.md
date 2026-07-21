# docs/ — Harness so sánh 3 AI agent trên tác vụ Reverse Engineering

Mục tiêu: reverse-engineer từng module của **SalesCube (Java)** rồi tái hiện dưới dạng tài liệu,
phục vụ viết lại trên stack **TypeScript** (NestJS + Next.js). Đồng thời **so sánh Claude vs Cursor vs Devin**
trên _cùng một input_ để đánh giá ưu/nhược của từng cách triển khai.

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

## Quy trình pilot (module estimate)

1. Clone Java source `salescube/SalesCube` về máy để agent đọc được `WEB/SalesCube/src/main`.
2. Với **từng agent**, đưa `docs/modules/estimate.md` + 3 template làm chỉ dẫn, yêu cầu sinh 3 file
   vào `_generated/<agent>/{requirements,technical,design}/estimate.md`.
3. Chạy độc lập, không cho agent này xem output agent kia.
4. Chấm điểm theo rubric bên dưới, rồi mở rộng sang `rorder` (受注) và `stock` (在庫).

## Rubric chấm điểm (mỗi tiêu chí 1–5)

| #   | Tiêu chí                  | Ý nghĩa                                                       |
| --- | ------------------------- | ------------------------------------------------------------- |
| 1   | Độ đầy đủ                 | Điền hết mục template, không bỏ trống sai cách                |
| 2   | Độ trung thực với code    | Bám source thật, không suy diễn; số liệu/tên class đúng       |
| 3   | Kiểm soát bịa             | Dùng `[CẦN XÁC NHẬN]` đúng chỗ thay vì bịa nghiệp vụ          |
| 4   | Chất lượng design TS      | API/model/mapping Java→TS hợp lý, khả thi trên NestJS/Next.js |
| 5   | Nhất quán 3 tài liệu      | Design truy vết được về Requirements + Technical              |
| 6   | Tính khả thi (actionable) | Dev đọc xong code được ngay hay không                         |

**Kết quả chấm (module pilot `estimate`, ngày 2026-07-21).** Thang **/10 mỗi tiêu chí, tổng = trung bình /10**; đã đối chiếu source thật (`src/main` + `DB/sql`). Nhược điểm & sai khác dữ liệu cụ thể + bằng chứng: xem [`_generated/scorecard.md`](./_generated/scorecard.md).

| Agent  | Đầy đủ | Trung thực | Bịa | Design TS | Nhất quán | Actionable | **TB**  | Sai/nhược chính (đã verify)                                                                                                                                         |
| ------ | :----: | :--------: | :-: | :-------: | :-------: | :--------: | :-----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| claude |   8    |     7      |  9  |     9     |     9     |     9      | **8.5** | Sai F-02: ghi JSP kết quả AJAX = `dispProductPriceList.jsp` (đúng là `result.jsp`, lại để `[CẦN XÁC NHẬN]`); bỏ DDL `CREATE.sql` (scope yêu cầu "script tạo bảng"). |
| cursor |   9    |     8      |  9  |     8     |     8     |     9      | **8.5** | Sai số đếm "13 file" SQL (thực 14); nói INSERT chỉ ghi `DELIVERY_NAME`+`ZIP` (thiếu `DELIVERY_INFO`); design gán `estimateLineId: string\|number` (DB là INT).      |
| devin  |   7    |     8      |  9  |     7     |     8     |     8      | **7.8** | Design §3 hỏng markdown → tên cột sai (`ESTIMATE*SHEET_ID`, `CTAX*RATE`...); ít business rule nhất (14); hoãn công thức totals; không cite DDL.                     |

> `claude`/`cursor` đồng hạng nhất với hồ sơ lỗi khác nhau (claude: 1 lỗi sự thật + bỏ deliverable; cursor: 3 sai vặt số/kiểu). `devin` sạch lỗi nghiệp vụ nhất nhưng mỏng và dính lỗi trình bày dữ liệu.

#
