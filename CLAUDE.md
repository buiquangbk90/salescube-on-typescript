# SalesCube - Hệ thống Quản lý Bán hàng (販売管理システム)

> **Mục tiêu hệ thống:** Chuyển đổi từ mô hình "Thủ công - Giấy tờ - Rời rạc" sang "Tự động - Điện tử - Tập trung" cho công ty xuất bản/báo chí Nhật Bản.

---

## 1. Tổng quan Nghiệp vụ

SalesCube là hệ thống quản lý bán hàng tích hợp (All-in-one) cho 3 dòng sản phẩm chính:

| Loại hình | Đặc thù | Quy trình chính |
|-----------|---------|-----------------|
| **Báo chí (新聞)** | Dịch vụ đăng ký định kỳ, đại lý phân phối | Đăng ký → Phát hành → Thu phí |
| **Quảng cáo (広告)** | Hợp đồng theo kỳ, duyệt maket | Đăng ký → Duyệt maket → Đăng tải → Thanh toán |
| **Sách/Ấn phẩm (書籍)** | Hàng hóa vật lý, quản lý kho | Bán hàng → Xuất kho → Giao vận → Thu tiền |

---

## 2. Các Module Nghiệp vụ Chính

### 2.1. Master Data (マスタ管理)

**Master Khách hàng (得意先マスタ)**
- Fuzzy Search: Tìm kiếm không phân biệt Hoa/thường, Toàn/Bán góc
- CRM 360°: Tích hợp lịch sử mua hàng + lịch sử chăm sóc
- Liên lạc số hóa: Email, Social ID (Zalo/LineWorks)
- Validation nhập liệu: Chuẩn hóa ký tự tự động

**Master Sản phẩm (商品マスタ)**
- Cấu trúc mở rộng riêng cho từng loại: Báo (mã vùng, đại lý), Ads (vị trí, kích thước), Sách (ISBN, trọng lượng)
- Lịch sử giá Timeline: Lưu trữ không giới hạn
- Logic Thuế tự động: 8% báo chí, 10% sách/quảng cáo

**Master Nhân viên & Đại lý (社員・販売店マスタ)**
- Đồng bộ User SSO (Active Directory/Office 365)
- API Địa chính (Japan Post Zipcode) tự động cập nhật
- Agent Portal: Đại lý tự cập nhật thông tin

### 2.2. Quản lý Bán hàng (販売管理)

**Đăng ký Báo chí**
- E-form thay thế phiếu giấy 5 bản sao
- Portal đại lý: Tự động thông báo thay đổi số lượng
- Quản lý gia hạn tự động (Auto-renewal Task)

**Hợp đồng Quảng cáo**
- Workflow duyệt maket: Sales → Chế bản → Khách hàng
- Module hóa đơn thông minh: Diễn giải chi tiết, tính chiết khấu combo
- Tích hợp CRM: Xem biểu đồ doanh thu, mẫu quảng cáo cũ

**Bán Sách/Ấn phẩm**
- Mobile Order: Nhập đơn tại hiện trường
- Tích hợp WMS: Booking kho, cảnh báo hết hàng
- QR Code: Thanh toán và theo dõi vận đơn

### 2.3. Thanh toán & Quản lý Công nợ (入金・債権管理)

**Tự động hóa đối soát**
- Virtual Account: Tự động gạch nợ khi tiền về
- Banking API: Lấy sao kê thời gian thực
- QR Code thanh toán trên hóa đơn điện tử

**Quản lý Công nợ**
- Dashboard Tuổi nợ (Aging Report): 1-30, 31-60, >90 ngày
- Hệ thống Nhắc nợ tự động (Dunning System):
  - Level 1: Email/SMS nhắc nợ (3 ngày)
  - Level 2: Tạm dừng dịch vụ (15 ngày)
  - Level 3: Task thu tiền tận nơi (30 ngày)

**Xử lý Nợ xấu**
- Workflow duyệt nợ xấu online với chữ ký số
- Tự động hóa Logic trích nợ (Furikae): Xử lý thất bại, lập lịch trích lại

### 2.4. Quy trình Duyệt (ワークフロー)

**Số hóa phê duyệt**
- Digital Signature & E-Stamp: Dấu điện tử tự động chèn vào PDF
- Mobile Approval: Duyệt qua Web-app mọi lúc mọi nơi
- Proxy Approval: Cơ chế duyệt thay khi lãnh đạo vắng mặt
- Audit Trail: Lưu vết đầy đủ thời gian, người duyệt, ý kiến

**Luồng duyệt đa cấp**
- Nhân viên → Trưởng phòng → Giám đốc chi nhánh → Tổng vụ HQ
- Phân nhánh theo giá trị hợp đồng/mức chiết khấu

### 2.5. Quản lý Kho (在庫管理)

**Real-time Inventory**
- Tự động trừ tồn kho ngay khi đơn được duyệt
- Cảnh báo Safety Stock
- Barcode/QR quét mã nhập/xuất kho

**E-Stocktake**
- Kiểm kho bằng ứng dụng di động
- Tự động đối soát và tạo phiếu điều chỉnh
- Bin Location: Chỉ rõ kệ/tầng chứa hàng

### 2.6. Phân quyền (RBAC)

| Vai trò | Quyền hạn chính |
|---------|-----------------|
| **Nhân viên Sales** | Tạo đơn hàng, xem khách hàng của mình, xem tồn kho |
| **Trưởng phòng** | Duyệt đơn cấp 1, xem báo cáo phòng, quản lý chiết khấu |
| **Giám đốc** | Duyệt cấp cuối, duyệt xóa nợ xấu, xem báo cáo tổng thể |
| **Tổng vụ** | Quản lý Master dữ liệu, điều phối kho, giám sát vận hành |
| **Kế toán** | Đối soát tiền về, gạch nợ, duyệt yêu cầu tài chính |

### 2.7. Báo cáo (帳票)

**Báo cáo Hàng ngày (日次処理)**
- Biến động hợp đồng: Đăng ký có thu phí, Hợp đồng hủy, Thay đổi nhân viên phụ trách
- Dòng tiền: Danh sách nộp tiền, Bảng tổng hợp tiền gửi hàng ngày
- Công nợ: Danh sách hóa đơn/nộp tiền/chưa thu

**Báo cáo Hàng tháng (月次処理)**
- Doanh thu: Sổ bán hàng chi tiết/tổng hợp, Báo cáo thành tích thu tiền
- Quản lý: Danh sách hợp đồng quảng cáo, Tình trạng nộp phí Web
- Đối chiếu: Bảng đối chiếu cuối tháng (月末対比)

**Báo cáo Hàng năm (年次処理)**
- Danh sách chưa lập hóa đơn, chưa thu được
- Hóa đơn/biên lai thanh toán tạm ứng

---

## 3. Luồng Nghiệp vụ Tích hợp (All-in-one Flow)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Đơn hàng   │ → │ Kiểm tra    │ → │   Duyệt     │ → │   Kho       │ → │ Thanh toán  │
│  (Sales)    │    │  Tồn kho    │    │ (Workflow)  │    │  (Xuất hàng)│    │  (Thu tiền) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                 │                │                │
       ▼                  ▼                 ▼                ▼                ▼
   Mobile Order      Auto-check      E-Stamp/         Barcode/QR       Virtual Acc/
   E-form           Safety Stock    Digital Sig      Real-time        Banking API/
                                                      inventory        Dunning
```

---

## 4. Triết lý Thiết kế

> **"Nhập liệu một lần - Sử dụng nhiều nơi"**
> 
> **"Single Source of Truth"** - Master Data là gốc dữ liệu duy nhất cho toàn bộ phân hệ.

**Nguyên tắc chuyển đổi:**
- ❌ Phiếu giấy 5 bản sao, túi hồ sơ (Back-ben)
- ✅ E-form, Digital Workflow, Cloud Storage

- ❌ Duyệt "miệng", đóng dấu đỏ vật lý
- ✅ Mobile Approval, Chữ ký số, Audit Trail

- ❌ Excel thủ công, đối soát cuối tháng
- ✅ Real-time Dashboard, Auto-Reconciliation

---

## 5. Tích hợp Hệ thống

| Tích hợp với | Mục đích |
|--------------|----------|
| **Active Directory / Office 365** | SSO, đồng bộ user |
| **Japan Post API** | Tự động cập nhật mã bưu điện |
| **Banking API** | Lấy sao kê, Virtual Account |
| **WMS (Warehouse Management)** | Quản lý tồn kho thời gian thực |
| **Vận chuyển (Yamato, Sagawa)** | Theo dõi vận đơn |
| **Raku-Raku Meisai** | Gửi hóa đơn PDF tự động |
| **V-one Cloud** | Đối soát hóa đơn thanh toán |
| **AWS Cloud** | Lưu trữ Digital Asset |

---

## 6. Lợi ích Dự kiến

| Chỉ số | Cải thiện |
|--------|-----------|
| Thời gian xử lý thủ tục | Giảm 50-70% |
| Sai sót nhập liệu | Giảm đáng kể (tự động hóa) |
| Thời gian báo cáo | Real-time thay vì cuối tháng |
| Rủi ro tài chính | Kiểm soát chủ động qua cảnh báo sớm |
| Năng suất Sales | Tập trung tìm kiếm khách hàng thay vì giấy tờ |

---

*Generated from workspace documentation: overview_*.md, Report_Flow_Analysis.md*
