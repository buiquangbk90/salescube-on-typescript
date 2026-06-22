# WF-02 – Quản lý Khách hàng (Customer Management)

**Confidence**: HIGH – Xác nhận từ entity class, service class, SQL files  
**Loại**: Master data CRUD workflow

---

## Entry Route
```
GET  /master/searchCustomer/index           → Màn hình tìm kiếm KH
POST /master/searchCustomer/find            → Tìm kiếm
GET  /master/inputCustomer/index            → Tạo KH mới
GET  /master/inputCustomer/edit/{id}        → Sửa KH
POST /master/inputCustomer/register         → Lưu KH (tạo/cập nhật)
POST /master/inputCustomer/delete           → Xóa KH (soft-delete)
GET  /master/inputCustomer/copy             → Copy KH
```

## User Role
- Yêu cầu role có quyền menu `CUSTOMER_MST` (MENU_ID từ MENU_MST)
- `userDto.isMenuUpdate()` – kiểm tra quyền cập nhật
- `userDto.isMenuValid()` – kiểm tra quyền truy cập

---

## Main Code Path

```
GET /master/inputCustomer/index
  → (inferred) CustomerMasterAction.index()
    → CustomerService.findByPk(customerCode) [nếu edit]
    → CategoryService.findByCategoryId() [dropdowns]
    → CustomerRankService.findAll() [rank list]
    → Render inputCustomer.jsp

POST /master/inputCustomer/register
  → CustomerMasterAction.register()
    → validate form (required fields)
    → CustomerService.insert() or update()
      → SeqMakerService.getNextSeqId("CUSTOMER_MST") [nếu insert]
      → INSERT/UPDATE CUSTOMER_MST
      → INSERT CUSTOMER_MST_HIST (snapshot)
    → return inputCustomer.jsp (success message)
```

---

## Controllers / Services / Models

| Layer | Class | Vai trò |
|-------|-------|---------|
| Action | `action/master/*CustomerAction` | CRUD controller |
| Service | `CustomerService` | Business logic |
| Service | `CustomerRelService` | Quan hệ KH (parent-child) |
| Service | `CustomerRankService` | Danh sách rank |
| Service | `CustomerHistoryService` | Lịch sử thay đổi |
| Service | `CategoryService` | Dropdown values |
| Service | `DeliveryService` | Địa chỉ giao hàng của KH |
| Entity | `Customer` (CUSTOMER_MST) | Main entity |
| Entity | `CustomerRel` (CUSTOMER_REL) | Quan hệ KH |
| Entity | `CustomerHist` (CUSTOMER_MST_HIST) | Audit trail |
| SQL files | `entity/sql/customer/` | 21 named SQL queries |

---

## Database Tables

**READ**:
- `CUSTOMER_MST` – tìm kiếm, xem chi tiết
- `CUSTOMER_REL` – quan hệ KH
- `CUSTOMER_RANK_MST` – danh sách rank (dropdown)
- `CATEGORY_MST` / `CATEGORY_TRN` – business/job category dropdowns
- `DELIVERY_MST` – địa chỉ giao hàng liên kết

**WRITE**:
- `CUSTOMER_MST` – INSERT / UPDATE / soft-delete (DEL_DATETM)
- `CUSTOMER_MST_HIST` – snapshot sau mỗi thay đổi
- `CUSTOMER_REL` – thêm/xóa quan hệ KH
- `SEQ_MAKER` – lấy next ID khi INSERT

---

## Validation Rules

1. `CUSTOMER_CODE` – required, max 15 chars, alphanumeric
2. `CUSTOMER_NAME` – required, max 60 chars
3. `CUSTOMER_CODE` phải unique (check duplicate trước INSERT)
4. `CUSTOMER_TEL` – format validation (15 chars)
5. `CUSTOMER_EMAIL` – format validation
6. `MAX_CREDIT_LIMIT` – numeric, >= 0
7. `CUTOFF_GROUP` – required, phải có trong CATEGORY_TRN
8. `CUSTOMER_RANK_CATEGORY` – phải có trong CUSTOMER_RANK_MST
9. Không thể xóa KH đang có phiếu bán hàng chưa đóng (check SALES_SLIP_TRN)

---

## Status Transitions

```
[Không tồn tại]
    │ POST register (new)
    ▼
[Active] (DEL_DATETM IS NULL)
    │
    │ POST register (update) → CUSTOMER_MST_HIST ghi snapshot
    │
    │ POST delete
    ▼
[Soft-deleted] (DEL_DATETM IS NOT NULL)
```

**CUSTOMER_RANK_CATEGORY** – cập nhật tự động bởi batch:
```
Batch SP_UPDATE_CUSTOMER_RANK
→ Tính toán từ SALES_SLIP_TRN + CUSTOMER_RANK_MST criteria
→ UPDATE CUSTOMER_MST.CUSTOMER_RANK_CATEGORY
```

---

## External Integrations

- **Japan Post ZIP**: Khi nhập `ZIP_CODE`, lookup `ZIP_MST` để auto-fill `ADDRESS_1`
  - AJAX call → `/master/ajax/.../zip` → ZipService
- **Không có CRM integration** – standalone master data

---

## Error Handling

| Lỗi | Xử lý |
|-----|-------|
| Duplicate `CUSTOMER_CODE` | "errors.duplicate" |
| KH có giao dịch đang mở | "errors.cannotDelete" (inferred) |
| ServiceException | Log + "errors.system" |
| ValidationError | Hiển thị inline errors, giữ form data |
| UnabledLockException | "errors.lock" – record bị lock bởi user khác |

---

## Evidence

| File | Lines | Nội dung |
|------|-------|---------|
| `entity/Customer.java` | all | 59 fields entity class |
| `service/CustomerService.java` | all | Business logic (~30KB) |
| `service/CustomerHistoryService.java` | all | Audit trail |
| `service/CustomerRelService.java` | all | KH relationship |
| `entity/sql/customer/` | all | 21 SQL files (findByCode, findByName, etc.) |
| `DB/sql/createtable/CREATE.sql` | 560-685 | CUSTOMER_MST DDL |
| `docs/spec/02-entity-list.md` | 110-158 | Customer fields đã reverse-engineer |
