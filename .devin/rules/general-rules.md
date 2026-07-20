# Quy tắc chung (General Rules) – áp dụng cho MỌI loại tài liệu

## Cấu hình
- **OUTPUT_LANG = vi** (tiếng Việt). Giữ nguyên thuật ngữ Nhật gốc trong ngoặc khi cần,
  vd: "Nhập bán hàng (売上入力)". Nếu đổi sang `ja`, viết toàn bộ mô tả bằng tiếng Nhật.
- **SOURCE_REPO** = (điền URL/đường dẫn repo source SalesCube).

## R1. Trung thực với source
- Chỉ ghi điều đọc được từ code. Không suy diễn nghiệp vụ ngoài code.
- Không rõ → ghi `[CẦN XÁC NHẬN]` kèm lý do ngắn. Tuyệt đối không bịa.

## R2. Tuân thủ template
- Dùng đúng template tương ứng trong `.devin/templates/`.
- Giữ nguyên thứ tự, tiêu đề, số mục. Không tự thêm/bớt mục lớn.

## R3. Thuật ngữ nhất quán (Glossary – dùng thống nhất toàn bộ tài liệu)
| Code | Thuật ngữ dùng trong tài liệu |
|------|-------------------------------|
| Slip | chứng từ (đầu phiếu) |
| Line | dòng chi tiết |
| Trn  | giao dịch (transaction) |
| Master | dữ liệu master |
| sales 売上 | Bán hàng |
| rorder 受注 | Đơn đặt hàng (của khách) |
| porder 発注 | Đơn đặt mua (gửi NCC) |
| purchase 仕入 | Mua hàng/Nhập hàng |
| estimate 見積 | Báo giá |
| bill 請求 | Hóa đơn/Công nợ phải thu |
| deposit 入金 | Thu tiền |
| payment 支払 | Chi tiền |
| stock 在庫 | Tồn kho |

> KHÔNG dùng lẫn lộn: "đơn hàng" cho cả rorder lẫn porder → phải phân biệt rõ.

## R4. Định dạng
- Markdown. Tiêu đề mục dùng `##`. Bảng đúng cú pháp markdown.
- Đường dẫn file đặt trong code span: `action/sales/InputSalesAction.java`.
- Tên class/biến giữ nguyên CamelCase như trong code.

## R5. Đặt tên file output
- Function Design: `.devin/output/function-design/{ClassName}.md` (vd `SearchSalesService.md`).
- Screen Design: `.devin/output/screen-design/{screenId}.md` (vd `inputSales.md`).

## R6. Trích dẫn code
- Trích tối đa đoạn ngắn để minh họa (≤ ~10 dòng), không dán nguyên file.
- Ưu tiên mô tả bằng lời + bảng hơn là dán code dài.

## R7. Tự kiểm trước khi kết thúc mỗi file
- [ ] Đủ tất cả mục của template?
- [ ] Không còn chỗ trống vô lý (đã dùng `[CẦN XÁC NHẬN]`)?
- [ ] Thuật ngữ khớp glossary R3?
- [ ] Tên file đúng R5?
