# Scorecard — So sánh 3 AI agent (Claude / Cursor / Devin)

> **Module pilot:** `estimate` (見積) · **Ngày chấm:** 2026-07-21 · **Thang điểm: /10 mỗi tiêu chí, tổng = trung bình /10.**
> Mọi lỗi/số liệu bên dưới **đã đối chiếu trực tiếp source thật** (`salescube/SalesCube/WEB/.../src/main` + `DB/sql`). Mục 4 là bảng bằng chứng.
> Người chấm là agent nền tảng (không phải bản `claude` được benchmark); để tránh thiên vị, chỉ tính lỗi/điểm khi có bằng chứng đối chiếu.

---

## 1. Bảng điểm /10

| Tiêu chí | claude | cursor | devin |
|----------|:------:|:------:|:-----:|
| 1. Độ đầy đủ (phủ scope) | 8 | 9 | 7 |
| 2. Trung thực dữ liệu (verify) | 7 | 8 | 8 |
| 3. Kiểm soát bịa | 9 | 9 | 9 |
| 4. Chất lượng design TS | 9 | 8 | 7 |
| 5. Nhất quán 3 tài liệu | 9 | 8 | 8 |
| 6. Actionable | 9 | 9 | 8 |
| **Trung bình** | **8.5** | **8.5** | **7.8** |

`claude` và `cursor` đồng hạng nhất với hồ sơ lỗi khác nhau; `devin` sạch lỗi nghiệp vụ nhất nhưng mỏng và dính lỗi trình bày.

---

## 2. Nhược điểm & sai khác dữ liệu — CỤ THỂ

### CLAUDE (8.5) — sâu nhưng có 1 lỗi sự thật + 1 deliverable bị bỏ
| Loại | Chi tiết | Đối chiếu source |
|------|----------|------------------|
| ❌ **Sai dữ liệu** | Requirements **F-02**, cột JSP ghi màn kết quả tìm-AJAX là `estimate/searchEstimate/dispProductPriceList.jsp`. Đây là JSP của màn **tra giá**, không phải kết quả tìm. | JSP đúng tồn tại: `WEB-INF/view/ajax/estimate/searchEstimateResultAjax/result.jsp` |
| ❌ **Tự mâu thuẫn** | Cùng lúc lại đánh dấu tên JSP kết quả AJAX là `[CẦN XÁC NHẬN]` (mục 4 & 10) — trong khi file có thật và thuộc scope. | như trên |
| ⚠️ **Bỏ deliverable** | Không tìm ra DDL. Task card mục "SQL" yêu cầu rõ **"script tạo bảng"**. Claude kết luận *"không có `CREATE TABLE` trong scope src/main"* và hạ `[CẦN XÁC NHẬN]`. | DDL thật: `DB/sql/createtable/CREATE.sql` (ngoài `src/main`). Claude bám literal `src/main` nên miss. |
| ⚠️ **Hệ quả** | Vì thiếu DDL, model design không có độ dài/kiểu cột DB (VARCHAR(32), MEMO 2000, INT UNSIGNED) → kém cụ thể hơn cursor. | — |

> Ghi nhận (không trừ điểm): các claim còn lại của claude **đều đúng khi verify** — số dòng `save()` 613 / `deleteById` 230 / `loadBySlipId` 659; JS `culcCost` 997 / `culcRetailPrice` 1035 / `sum` 1058, file JSP 1713 dòng; chuỗi `@Execute(validate="validate, @, validateAtCreateSlip", stopOnValidationError=false, input="errorInit")`; `PRICE_MIN/MAX = ∓999999999`; JSON `exists` trả `{estimateSheetId}`. Đây là bản trace sâu và chính xác nhất về logic.

### CURSOR (8.5) — phủ scope tốt nhất nhưng 3 sai vặt về số/kiểu
| Loại | Chi tiết | Đối chiếu source |
|------|----------|------------------|
| ❌ **Sai số đếm** | Technical §2 header ghi *"`entity/sql/estimate/*.sql` **(13 file)**"* — sai. Thực tế **14 file** (chính bảng §5 của cursor liệt kê đủ 14 → mâu thuẫn nội bộ). | `ls entity/sql/estimate/*.sql` = 14 |
| ❌ **Thiếu cột** | Technical §5 nói Insert/Update SQL *"chỉ ghi tới `DELIVERY_NAME` + `DELIVERY_ZIP_CODE`"* — thiếu **`DELIVERY_INFO`** (thực tế ghi 3 cột delivery). | `InsertEstimateSheet.sql` ghi `DELIVERY_INFO, DELIVERY_NAME, DELIVERY_ZIP_CODE` |
| ❌ **Sai kiểu** | Design §3 gán `ESTIMATE_LINE_ID` kiểu `string \| number` — mâu thuẫn với chính Technical (`INT UNSIGNED`) → phải là `number`. | `CREATE.sql:1496 ESTIMATE_LINE_ID INT UNSIGNED` |
| ⚠️ **Design nông hơn** | Không nêu vấn đề "tính tiền ở client (không tin được) → đưa về server" như claude; thiết kế đúng nhưng ít sáng kiến kiến trúc. | — |

> Ghi nhận (không trừ điểm): cursor là agent **duy nhất** truy đúng DDL + kiểu cột + bảng `ESTIMATE_*_TRN_HIST` + trigger INS/UPD/DEL, **verify đúng toàn bộ** (`VARCHAR(32)`, `MEMO VARCHAR(2000)`, `INT UNSIGNED`); nhiều business rule nhất (20); JSP kết quả AJAX đúng.

### DEVIN (7.8) — sạch lỗi nghiệp vụ nhất nhưng mỏng + hỏng trình bày
| Loại | Chi tiết | Đối chiếu source |
|------|----------|------------------|
| ❌ **Hỏng dữ liệu (markdown)** | Design §3 bị lỗi escape: tên cột hiển thị sai — `ESTIMATE*SHEET_ID`, `DELIVERY*_ (office/dept...)`, `CTAX*RATE`, `CRE*_/UPD\__` (dấu `_` bị hiểu thành in nghiêng). 4 dòng lỗi → **định danh sai lệch**, dev copy nhầm. | Chính file `devin/design/estimate.md` |
| ⚠️ **Phủ scope mỏng nhất** | Ít business rule nhất (14 vs 20 của cursor); **hoãn** công thức tính dòng/tổng (BR-14 = `[CẦN XÁC NHẬN]`) — trung thực, nhưng claude đã lấp được lỗ này bằng cách trace ra JS trong JSP. | công thức nằm ở JS `inputEstimate.jsp` (claude tìm thấy) |
| ⚠️ **Không cite DDL** | Có nhắc bảng `*_HIST` tồn tại nhưng nói chung chung, không chỉ ra file DDL như cursor. | `DB/sql/createtable/CREATE.sql` |

> Ghi nhận (không trừ điểm): devin có 2 chi tiết chỉ đọc kỹ mới thấy và **verify đúng** — bắt đúng **typo thật** `OLUMN_GROSS_MARGIN_RATE` (thiếu "C") tại `EstimateSheetService.java:147`; dùng đúng message key `errors.notExist` cho copy (`AbstractSlipEditAction.java:368`); claim 2 hàm search "y hệt nhau" khớp Javadoc gốc.

---

## 3. Xếp hạng theo từng tiêu chí (một dòng, không khen chung)

- **Đầy đủ:** cursor > claude > devin — cursor phủ cả DDL/HIST/trigger + 20 BR; claude sâu logic nhưng thiếu DDL; devin ít BR nhất + hoãn totals.
- **Trung thực dữ liệu:** cursor ≈ devin > claude — claude có 1 lỗi sự thật rõ (F-02) + 1 miss (result.jsp), nặng hơn các lỗi số/kiểu vặt của cursor; devin không lỗi nghiệp vụ nhưng dính lỗi trình bày.
- **Kiểm soát bịa:** hòa — không agent nào bịa nghiệp vụ; devin kỷ luật `[CẦN XÁC NHẬN]` cao nhất.
- **Design TS:** claude > cursor > devin — chỉ claude nêu "totals về server làm nguồn sự thật" + 10 quyết định có lý do; devin để ngỏ chỗ tính totals.
- **Nhất quán:** claude > cursor ≈ devin — cả ba trace BR→design; cursor lệch kiểu `estimateLineId`, devin lệch tên cột do markdown.
- **Actionable:** claude ≈ cursor > devin — devin bị trừ vì tên cột hỏng + câu hỏi mở về totals.

---

## 4. Bằng chứng kiểm chứng (đối chiếu source)

| # | Claim | Source thật | claude | cursor | devin |
|---|-------|-------------|:------:|:------:|:-----:|
| 1 | Số file SQL | `ls` = **14** | ✅ 14 | ❌ "13" (bảng lại 14) | ✅ 14 |
| 2 | JSP kết quả tìm-AJAX | `view/ajax/estimate/searchEstimateResultAjax/result.jsp` tồn tại | ❌ ghi `dispProductPriceList.jsp` + `[CẦN XÁC NHẬN]` | ✅ | ✅ |
| 3 | Typo hằng số | `EstimateSheetService.java:147 = OLUMN_GROSS_MARGIN_RATE` | – | – | ✅ bắt đúng |
| 4 | DDL/kiểu cột/HIST/trigger | `CREATE.sql`: `VARCHAR(32)`, `INT UNSIGNED`, `MEMO VARCHAR(2000)`; HIST + trigger INS/UPD/DEL | ❌ không tìm ra | ✅ đúng toàn bộ | ~ nhắc chung |
| 5 | Cột DELIVERY_* được ghi khi INSERT | `InsertEstimateSheet.sql` = `DELIVERY_INFO, DELIVERY_NAME, DELIVERY_ZIP_CODE` | ~ | ❌ nói chỉ 2 (thiếu INFO) | ~ |
| 6 | `deliveryZipCode = customerZipCode` | `EstimateSheetService.java` save() | ✅ | ✅ | ✅ |
| 7 | 2 hàm search "y hệt" | Javadoc: *"...と同一の処理を行います"* | ✅ | ~ | ✅ |
| 8 | Số dòng Service/JSP + validate string + PRICE_MIN/MAX + exists JSON | verify khớp | ✅ | – | ✅ (dòng Service) |
| 9 | copy → message | `errors.notExist` (`AbstractSlipEditAction:368`) | ~ mô tả chữ | – | ✅ đúng key |
| 10 | Default `様`/deliveryName | `PREFIX_SAMA`, `labels.deliveryDefault` | ✅ | ✅ | ✅ |

(✅ đúng · ❌ sai · ~ nửa đúng/chung chung · – không đề cập)

---

## 5. Điểm mù CHUNG của cả 3 (cần chốt trước khi code TS)

Không agent nào giải quyết trọn, bất kể chọn output nào:
1. **Nơi & công thức tính tiền** dòng/tổng nằm trong JS `inputEstimate.jsp` — claude trace được vị trí, nhưng cả 3 đều không port hoá công thức đầy đủ.
2. **Quy tắc làm tròn** `taxFractCategory` / `priceFractCategory` — cả 3 đều `[CẦN XÁC NHẬN]`.
3. **Engine PDF `0000B` + Excel** — chưa ai chỉ ra thư viện/template đích.
4. **Multi-tenant** (hậu tố bảng `_<domainId>`) — cả 3 để ngỏ chiến lược.

---

## 6. Khuyến nghị
1. **Nền triển khai `estimate`:** lấy **Technical + DDL của cursor** (chính xác nhất về dữ liệu) ghép **Design TS của claude** (kiến trúc sắc nhất). Sửa trước: đếm lại 14 file SQL, kiểu `estimateLineId=number`, bổ sung `DELIVERY_INFO`.
2. **Sửa gấp trong bản devin:** fix escape markdown tên cột ở Design §3 trước khi dùng.
3. **Sửa gấp trong bản claude:** đính chính F-02 (`result.jsp`) và bổ sung DDL từ `DB/sql/createtable/CREATE.sql`.
4. **Cập nhật task card** cho vòng `rorder`/`stock`: nói rõ DDL nằm ở `DB/sql` (ngoài `src/main`) và totals tính ở client — đây là 2 nguồn gây lỗi/bỏ sót nhiều nhất vòng này.
