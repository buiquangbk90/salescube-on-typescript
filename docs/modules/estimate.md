# Module Pilot: estimate (見積 / Báo giá)

> **Task card cố định** — dùng làm INPUT GIỐNG HỆT cho cả 3 agent (Claude / Cursor / Devin).
> Không đổi phạm vi giữa các agent, để so sánh công bằng.

## Vì sao chọn estimate làm pilot
Vertical slice hoàn chỉnh nhưng **nhỏ nhất & ít phụ thuộc nhất** (~1.960 LOC Java): action chỉ gọi
`EstimateSheetService` / `EstimateLineService` + vài master service (Customer, Product, Category, Discount).
Đủ 4 luồng để phân biệt chất lượng agent (search / input / output sheet / check ajax) mà không cần nuốt cả repo.
Là điểm đầu luồng order-to-cash → requirements dễ verify.

## Nguồn (Java source)
Repo gốc: `salescube/SalesCube` — thư mục `WEB/SalesCube/src/main`.
Clone về máy trước khi chạy agent (agent cần đọc source thật, KHÔNG suy diễn từ tên).

## Phạm vi file (scope boundary — không mở rộng)
```
Action  : action/estimate/*                 (Search/Input/DispProductPriceList/
                                              SearchEstimateResultOutput/OutputEstimateSheetSingle)
          action/ajax/estimate/*            (SearchEstimateResultAjax, CheckEstimateSheet)
Form     : form/estimate/*                  (SearchEstimateForm, InputEstimateForm,
                                              DispProductPriceListForm)
DTO      : dto/estimate/*                   (InputEstimateDto, InputEstimateLineDto,
                                              SearchEstimateDto, SearchEstimateResultDto)
Service  : service/EstimateSheetService.java, service/EstimateLineService.java
           (base: AbstractSlipService, AbstractLineService, AbstractService)
Entity   : entity/EstimateSheetTrn.java  (đầu phiếu),
           entity/EstimateLineTrn.java   (dòng chi tiết),
           entity/Discount.java, entity/join/EstimateLineProductJoin.java
View     : WEB-INF/view/estimate/{searchEstimate, inputEstimate,
           searchEstimateResultOutput, dispProductPriceList}
SQL      : script tạo bảng + câu SQL của estimate_sheet_trn / estimate_line_trn
```

## Ngữ cảnh nghiệp vụ (tóm tắt — vẫn phải trace code để chốt)
Báo giá gồm **đầu phiếu** (khách hàng, ngày báo giá, hạn hiệu lực `VALID_DATE`, số phiếu
`ANNUAL/MONTHLY/YM`, điều kiện báo giá, người đề xuất) và **nhiều dòng chi tiết** (sản phẩm, số lượng,
đơn giá, chiết khấu theo bảng `Discount`). Có màn hình xuất phiếu báo giá và tra bảng giá sản phẩm.

## Đầu ra mỗi agent phải nộp (dùng chung 3 template ở `docs/templates/`)
| Tài liệu | Template | Nơi nộp |
|----------|----------|---------|
| Requirements | `templates/requirements-template.md` | `_generated/<agent>/requirements/estimate.md` |
| Technical (as-is) | `templates/technical-template.md` | `_generated/<agent>/technical/estimate.md` |
| Design (to-be TS) | `templates/design-template.md` | `_generated/<agent>/design/estimate.md` |

`<agent>` ∈ `claude | cursor | devin`.

## Luật khi điền (áp dụng cho MỌI agent)
1. Chỉ dựa trên source thật; thiếu thông tin → `[CẦN XÁC NHẬN]`, không bịa (theo `AGENTS.md`).
2. Giữ nguyên thứ tự & tiêu đề mục của template.
3. Viết tiếng Việt; giữ thuật ngữ Nhật gốc trong ngoặc khi cần.
4. Đọc `.devin/overview.md` trước để hiểu quy ước đặt tên & luồng.
5. Không mở rộng ngoài scope file ở trên (dù thấy liên quan) — ghi phần liên quan vào mục "phụ thuộc".
