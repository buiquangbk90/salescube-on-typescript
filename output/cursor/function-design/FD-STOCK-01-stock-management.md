# FD-STOCK-01: Quản lý Tồn Kho (在庫管理 – Stock Management)

> **Confidence**: MEDIUM (WF-14 — một số Action INFERRED)  
> **Evidence file**: [`_evidence/FD-STOCK-01-stock-management.md`](./_evidence/FD-STOCK-01-stock-management.md)  
> **Workflow**: [WF-14 Stock Management](../workflows/WF-14-stock-management.md)  
> **Scope**: Điều chỉnh tồn kho thủ công, tìm kiếm EAD, chốt kho tháng, xem tồn; auto EAD từ WF-04/WF-08 documented as side-effect

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy Action | Partial | `action/stock/*`, `setting/StockAction` — WF-14 INFERRED |
| Service logic | Confirmed | `ProductStockService`, `InputStock*Service` — WF-14 |
| DDL mapping | Confirmed (via WF) | `EAD_SLIP_TRN`, `PRODUCT_STOCK_TRN` — WF-14 |
| Workflow coverage | Confirmed | WF-14 |
| Target API design | Target decision | NestJS `StockController` + shared `StockEadService` |

**Confidence: MEDIUM** — EAD ledger pattern confirmed; manual `StockAction` class cần verify.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Quản lý tồn kho: điều chỉnh manual, search EAD, chốt tháng, xem tồn | LEGACY_CONFIRMED |
| **Module** | `stock` / STOCK | LEGACY_CONFIRMED |
| **Actor** | Kho — `isMenuUpdate(INPUT_STOCK)` cho điều chỉnh | LEGACY_CONFIRMED |
| **Legacy URLs** | `/stock/inputStock`, `/stock/searchStock`, `/stock/closeStock`, … | LEGACY_CONFIRMED |
| **Target API** | `GET/POST /api/stock/*` | TARGET_DECISION |
| **Trigger** | User action (HTTP); auto EAD từ sales/purchase FDs | LEGACY_CONFIRMED |

---

## 2. Input

### Target — `stockAdjustmentSchema` (Zod)

```typescript
const stockAdjustmentLineSchema = z.object({
  productCode: z.string().min(1),
  rackCode: z.string().min(1),
  quantity: z.number(), // positive enter, negative dispatch; or signed adjust
  warehouseCode: z.string().optional(),
});

const stockAdjustmentSchema = z.object({
  adjustmentDate: z.coerce.date(),
  category: z.enum(['ADJUST', 'ENTER', 'DISPATCH']),
  lines: z.array(stockAdjustmentLineSchema).min(1),
  remarks: z.string().max(2000).optional(),
});

const stockSearchSchema = z.object({
  productCode: z.string().optional(),
  rackCode: z.string().optional(),
  annual: z.number().int().optional(),
  monthly: z.number().int().min(1).max(12).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
});
```

### Input fields (legacy → target)

| Field | Type | Required | Validation | Legacy column | Provenance |
|-------|------|----------|------------|---------------|------------|
| `productCode` | string | ✓ | STOCK_CTL='1' | `PRODUCT_CODE` | LEGACY_CONFIRMED |
| `rackCode` | string | ✓ | exists RACK_MST | `RACK_CODE` | LEGACY_CONFIRMED |
| `quantity` | number | ✓ | >0 or adjust rules | `QUANTITY` | LEGACY_CONFIRMED |
| `annual` / `monthly` | number | | period key | `ANNUAL`, `MONTHLY` | LEGACY_CONFIRMED |
| EAD category | enum | ✓ | 01–05 | `EAD_SLIP_CATEGORY` | LEGACY_CONFIRMED |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Manual adjust save | EAD created + STOCK_NUM updated | WF-14 § B | LEGACY_CONFIRMED |
| Search stock | List `PRODUCT_STOCK_TRN` / EAD history | WF-14 routes | LEGACY_CONFIRMED |
| Stock close | New month row carry-forward | WF-14 § C | LEGACY_CONFIRMED |
| Auto EAD (sales/purchase) | Silent side-effect on other WFs | WF-14 § A | LEGACY_CONFIRMED |

### Target Response

```typescript
type ProductStockDto = {
  productCode: string;
  annual: number;
  monthly: number;
  stockNum: number;
  enterNum: number;
  dispatchNum: number;
  returnNum: number;
};

type EadSlipDto = {
  id: string;
  category: string;
  srcFunc: 'SA' | 'PU' | 'MN';
  lines: { productCode: string; rackCode: string; quantity: number }[];
};

type StockAdjustmentResponse = { success: true; eadSlip: EadSlipDto; stocks: ProductStockDto[] };
```

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | EAD_SLIP append-only — luôn INSERT, không UPDATE | LEGACY_CONFIRMED | WF-14 | Block |
| BR-02 | Manual adjust → EAD category "03" 調整 | LEGACY_CONFIRMED | WF-14 § B | Block |
| BR-03 | Purchase EAD "01" 入庫 — từ FD-PURCHASE-01 | LEGACY_CONFIRMED | WF-14, WF-08 | Block |
| BR-04 | Sales EAD "02" 出庫 — từ WF-04 | LEGACY_CONFIRMED | WF-14 | Block |
| BR-05 | Cancel sales → "04" 返品 | LEGACY_CONFIRMED | WF-14 | Block |
| BR-06 | `STOCK_NUM` không âm sau điều chỉnh | INFERRED | WF-14 VAL #3 | Block |
| BR-07 | `RACK_MULTI_FLAG='0'` → 1 product 1 rack | LEGACY_CONFIRMED | WF-14 VAL #4 | Block |
| BR-08 | Chỉ SP có `STOCK_CTL_CATEGORY='1'` | LEGACY_CONFIRMED | WF-14 VAL #5 | Block |
| BR-09 | Monthly close: new `PRODUCT_STOCK_TRN` row carry-forward | LEGACY_CONFIRMED | WF-14 § C | Block |
| BR-10 | `SRC_FUNC`: SA=Sales, PU=Purchase, MN=Manual | LEGACY_CONFIRMED | WF-14 | Info |
| TD-01 | Shared `StockEadService` cho tất cả EAD writers | TARGET_DECISION | consistency | High |

---

## 5. Validation Rules

| ID | Field | Rule | Error (target) | Provenance | Evidence |
|----|-------|------|----------------|------------|----------|
| VAL-01 | `rackCode` | Required, exists | 404 | LEGACY_CONFIRMED | WF-14 |
| VAL-02 | `quantity` | > 0 for enter/dispatch | 422 | LEGACY_CONFIRMED | WF-14 |
| VAL-03 | adjust | result STOCK_NUM >= 0 | 409 | INFERRED | WF-14 |
| VAL-04 | `productCode` | STOCK_CTL enabled | 422 | LEGACY_CONFIRMED | WF-14 |
| VAL-05 | stock close | correct period not already closed | 409 | INFERRED | WF-14 |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| Rack không tồn tại | `errors.notExist` | WF-14 |
| Stock negative | `errors.stockNegative` | INFERRED |
| No STOCK_CTL | Skip EAD | INFERRED |
| ServiceException | Log + throw | WF-14 |

### Target API Mapping

| Tình huống | HTTP | Code | Provenance |
|------------|------|------|------------|
| Validation | 422 | `VALIDATION_ERROR` | TARGET_DECISION |
| Negative stock | 409 | `INSUFFICIENT_STOCK` | TARGET_DECISION |
| Not found | 404 | `NOT_FOUND` | TARGET_DECISION |
| Forbidden | 403 | `FORBIDDEN` | TARGET_DECISION |
| Close already done | 409 | `PERIOD_ALREADY_CLOSED` | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `PRODUCT_STOCK_TRN` | Current stock | `productStock` | ANNUAL×MONTHLY | LEGACY_CONFIRMED |
| `EAD_SLIP_TRN` / `EAD_LINE_TRN` | Movement history | `eadSlip` / `eadLine` | | LEGACY_CONFIRMED |
| `PRODUCT_MST` | Safety stock, STOCK_CTL | `product` | active | LEGACY_CONFIRMED |
| `RACK_MST` | Rack lookup | `rack` | | LEGACY_CONFIRMED |
| `WAREHOUSE_MST` | Warehouse | `warehouse` | | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `EAD_SLIP_TRN` | INSERT | `eadSlip` | Every movement | LEGACY_CONFIRMED |
| `EAD_LINE_TRN` | INSERT | `eadLine` | Line detail | LEGACY_CONFIRMED |
| `PRODUCT_STOCK_TRN` | UPDATE / INSERT | `productStock` | STOCK/ENTER/DISPATCH/RETURN | LEGACY_CONFIRMED |
| `EAD_*_HIST` | INSERT | TBD | Snapshot | LEGACY_CONFIRMED |
| `SEQ_MAKER` | UPDATE | — | Legacy | LEGACY_CONFIRMED |

**Transaction:** EAD + stock update atomic — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS API (target)

| Legacy MENU_ID | Legacy check | Target permission | Operations |
|----------------|--------------|-------------------|------------|
| `1000` (`INPUT_STOCK`) | `isMenuUpdate` | `stock.adjust` | POST adjustment |
| `1001` (`SEARCH_STOCK`) | `isMenuValid` | `stock.read` | GET EAD search |
| `1005` (`CLOSE_STOCK`) | `isMenuUpdate` | `stock.close` | POST monthly close |
| `1006` (`DISP_PRODUCT_STOCK`) | `isMenuValid` | `stock.read` | GET on-hand |
| `1003` (`OUTPUT_STOCK_REPORT`) | `isMenuValid` | `report.stock.read` | GET report → FD-REPORT-01 |
| `1201` (`SETTING_STOCK`) | `isMenuUpdate` | `stock.settings.write` | PATCH safety settings |

> **Evidence:** `03-route-api-inventory.md:140-148`, `171`.

| Method | Path | Legacy | Permission |
|--------|------|--------|------------|
| GET | `/api/stock/on-hand` | `dispProductStockList` | `stock.read` |
| GET | `/api/stock/movements` | `searchStock` | `stock.read` |
| POST | `/api/stock/adjustments` | `inputStock/register` | `stock.adjust` |
| POST | `/api/stock/close` | `closeStock` | `stock.close` |
| PATCH | `/api/stock/settings` | `setting/stock` | `stock.settings.write` |

```typescript
@Injectable()
export class StockEadService {
  async createMovement(
    tx: Prisma.TransactionClient,
    params: { category: EadCategory; srcFunc: SrcFunc; lines: EadLineInput[] },
  ) {
    const slip = await tx.eadSlip.create({ data: { category: params.category, srcFunc: params.srcFunc } });
    for (const line of params.lines) {
      await this.applyStockDelta(tx, line, params.category);
      await tx.eadLine.create({ data: { slipId: slip.id, ...line } });
    }
    return slip;
  }
}
```

### Next.js UI

| Screen | Route | Legacy JSP |
|--------|-------|------------|
| On-hand | `/stock` | `dispProductStockList` |
| Adjust | `/stock/adjust` | `inputStock` |
| Movements | `/stock/movements` | `searchStock` |
| Close | `/stock/close` | `closeStock` |

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Manual adjust + | valid lines | EAD 03 + STOCK up | Integration | LEGACY_CONFIRMED |
| TC-02 | Negative adjust below zero | over-adjust | 409 | Integration | INFERRED |
| TC-03 | Purchase EAD side-effect | via FD-PURCHASE-01 | EAD 01 + ENTER_NUM | Integration | LEGACY_CONFIRMED |
| TC-04 | Monthly close | close endpoint | new period row | Integration | LEGACY_CONFIRMED |
| TC-05 | No STOCK_CTL product | disabled product | 422 / skip | Unit | LEGACY_CONFIRMED |
| TC-06 | Search movements | date range | EAD list | Unit | TARGET_DECISION |
| TC-07 | Permission adjust | no 1000 write | 403 | Unit | LEGACY_CONFIRMED |

---

## 10. Risked Items

- [ ] `StockAction` class name INFERRED — verify `action/stock/*`
- [ ] Entrust stock (1007/1008) — out of P1 scope
- [ ] Stock transfer (1002) — separate FD needed
- [ ] Batch `SP_UPDATE_PRODUCT_*` in WF-15 — overlap with FD-CUST-02 scope split
- [ ] EAD category codes string vs enum — verify DDL

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | INFERRED | Exact `StockAction.close()` implementation | Characterization test | High | Open |
| TD-01 | TARGET_DECISION | `StockEadService` in shared module | `@salescube/stock` package | High | Proposed |
| TD-02 | TARGET_DECISION | Period key: calendar month vs fiscal | Read `MINE_MST.CLOSE_MONTH` | High | Proposed |
| TD-03 | TARGET_DECISION | Product status batch (WF-15) | Separate batch FD P2 | Medium | Proposed |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-14](../workflows/WF-14-stock-management.md) |
| Purchase EAD | [FD-PURCHASE-01](./FD-PURCHASE-01-purchase-receipt.md) |
| Batch product | [WF-15](../workflows/WF-15-batch-rank-update.md) |
| Route | [03-route-api-inventory.md](../03-route-api-inventory.md) §3.9 |
| Index | [_index.md](./_index.md) |
