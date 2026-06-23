# FD-CUST-02: Batch Cập Nhật Rank Khách Hàng (得意先ランク更新)

> **Confidence**: HIGH (WF-15 shell + SP narrative) / MEDIUM (SP body chưa trong workspace)  
> **Evidence file**: [`_evidence/FD-CUST-02-batch-rank-update.md`](./_evidence/FD-CUST-02-batch-rank-update.md)  
> **Workflow**: [WF-15 Batch Rank Update](../workflows/WF-15-batch-rank-update.md) § A only  
> **Scope**: `SP_UPDATE_CUSTOMER_RANK` — cập nhật `CUSTOMER_MST.CUSTOMER_RANK_CATEGORY` theo tiêu chí `CUSTOMER_RANK_MST`. **Không HTTP.**

---

## 0. Evidence & Confidence

| Item | Status | Evidence |
|------|--------|----------|
| Legacy trigger | Confirmed | `UpdateCustomerRank.sh` — WF-15 |
| Business logic | Confirmed (SP narrative) | `SP_UPDATE_CUSTOMER_RANK` — WF-15 |
| DDL mapping | Confirmed (via WF) | `CUSTOMER_MST`, `CUSTOMER_RANK_MST` — WF-15 |
| Workflow coverage | Confirmed | WF-15 § A |
| Target design | Target decision | NestJS `@Cron` scheduler hoặc BullMQ worker |

**Confidence: MEDIUM-HIGH** — Shell + SP flow confirmed; SP SQL body cần verify trong `SalesCube/DB/sql/`.

---

## 1. Tổng quan

| Trường | Giá trị | Provenance |
|--------|---------|------------|
| **Chức năng** | Batch hàng tháng: tính RO count + doanh số TB → gán rank KH | LEGACY_CONFIRMED |
| **Module** | `batch` / CUST (cross-cutting master) | LEGACY_CONFIRMED |
| **Actor** | Không có user — DB user `salescube` / system | LEGACY_CONFIRMED |
| **Legacy trigger** | `./DB/batch/salescube_batch/UpdateCustomerRank.sh` | LEGACY_CONFIRMED |
| **Target runtime** | NestJS `@nestjs/schedule` cron hoặc BullMQ worker | TARGET_DECISION |
| **Trigger** | Cron (schedule UNKNOWN) hoặc admin manual job | LEGACY_CONFIRMED / UNKNOWN |

> **Out of scope FD-CUST-02:** `SP_UPDATE_PRODUCT_STATUS_CATEGORY`, `SP_UPDATE_PRODUCT_STOCK_VALUES` (WF-15 § B/C) — xem FD-STOCK-01 / batch P2.

---

## 2. Input

### Legacy — không có user input

| Param | Source | Value | Provenance |
|-------|--------|-------|------------|
| `DOMAIN` | shell script hard-code | `SALES` | LEGACY_CONFIRMED |
| Active customers | SP internal | `CUSTOMER_MST` where active | LEGACY_CONFIRMED |
| Rank criteria | lookup table | `CUSTOMER_RANK_MST` ranges | LEGACY_CONFIRMED |

### Target — `customerRankBatchJobSchema` (internal/admin only)

```typescript
const customerRankBatchJobSchema = z.object({
  domain: z.string().default('SALES'),
  dryRun: z.boolean().default(false),
  triggeredBy: z.enum(['CRON', 'MANUAL', 'ADMIN_API']).default('CRON'),
});
```

| Field | Type | Required | Validation | Provenance |
|-------|------|----------|------------|------------|
| `domain` | string | | tenant key | LEGACY_CONFIRMED → TARGET_DECISION |
| `dryRun` | boolean | | no WRITE if true | TARGET_DECISION |
| `triggeredBy` | enum | | audit | TARGET_DECISION |

---

## 3. Output

### Legacy Output Behavior

| Scenario | Legacy behavior | Evidence |
|----------|-----------------|----------|
| Success | SP COMMIT, shell exit 0 | WF-15 | LEGACY_CONFIRMED |
| No match criteria | Rank unchanged for that KH | WF-15 Status | LEGACY_CONFIRMED |
| SP error | Rollback, MySQL error log | WF-15 Error | LEGACY_CONFIRMED |
| Concurrent run | Race UPDATE — no lock | WF-15 Risks | LEGACY_CONFIRMED |

### Target Response (job result — internal)

```typescript
type CustomerRankBatchResult = {
  jobId: string;
  startedAt: string;
  finishedAt: string;
  customersProcessed: number;
  customersUpdated: number;
  customersUnchanged: number;
  errors: { customerCode: string; message: string }[];
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
};
```

| Field | Provenance |
|-------|------------|
| Job audit log | TARGET_DECISION |
| Metrics counters | TARGET_DECISION |

---

## 4. Business Rules

| ID | Rule | Provenance | Evidence | Severity |
|----|------|------------|----------|----------|
| BR-01 | Với mỗi KH active: đếm `RO_SLIP_TRN` → RO_COUNT | LEGACY_CONFIRMED | WF-15 § A | Block |
| BR-02 | Tính SUM/AVG `SALES_SLIP_TRN.SALES_PRICE_TOTAL` theo kỳ | LEGACY_CONFIRMED | WF-15 § A | Block |
| BR-03 | Tính `ENROLL_TERM` từ `FIRST_SALES_DATE` | INFERRED | WF-15 § A | Info |
| BR-04 | Match `CUSTOMER_RANK_MST` ranges (RO_COUNT, monthly avg) | LEGACY_CONFIRMED | WF-15 § A | Block |
| BR-05 | UPDATE `CUSTOMER_MST.CUSTOMER_RANK_CATEGORY` = matched RANK_CODE | LEGACY_CONFIRMED | WF-15 | Block |
| BR-06 | Không đủ tiêu chí → không đổi rank | LEGACY_CONFIRMED | WF-15 Status | Info |
| BR-07 | SP atomic COMMIT / rollback | LEGACY_CONFIRMED | WF-15 | Block |
| BR-08 | `DOMAIN=SALES` hard-coded — single tenant legacy | LEGACY_CONFIRMED | WF-15 | Info |
| TD-01 | Target: distributed lock tránh concurrent run | TARGET_DECISION | fix legacy race | Block |
| TD-02 | Target: không gọi MySQL SP — port logic sang TypeScript | TARGET_DECISION | testability | High |

---

## 5. Validation Rules

| ID | Field | Rule | Error | Provenance | Evidence |
|----|-------|------|-------|------------|----------|
| VAL-01 | — | Batch không user input | N/A | LEGACY_CONFIRMED | WF-15 |
| VAL-02 | data | Assume app-layer consistency | log + skip | LEGACY_CONFIRMED | WF-15 |
| VAL-03 | target | `dryRun` skips UPDATE | — | TARGET_DECISION | — |
| VAL-04 | concurrent | Only one job instance | lock wait | TARGET_DECISION | WF-15 risk |

---

## 6. Error Handling

### Legacy

| Tình huống | Handling | Evidence |
|------------|----------|----------|
| MySQL connection fail | Shell exit ≠ 0, no retry | WF-15 |
| SP runtime error | Rollback entire SP | WF-15 |
| Lock wait timeout | MySQL default ~50s | WF-15 |
| Partial per-customer | Không — all or nothing trong SP | WF-15 |

### Target Job Handling

| Tình huống | Handling | Provenance |
|------------|----------|------------|
| DB connection fail | Retry 3x exponential backoff | TARGET_DECISION |
| Single customer calc error | Log + continue (configurable) vs abort | TARGET_DECISION |
| Lock held | Skip run + alert | TARGET_DECISION |
| Job failure | Alert + `batch_job_log` row FAILED | TARGET_DECISION |

---

## 7. Database I/O

### Read

| Bảng | Mục đích | Target | Điều kiện | Provenance |
|------|----------|--------|-----------|------------|
| `CUSTOMER_MST` | All active KH | `customer` | `deletedAt IS NULL` | LEGACY_CONFIRMED |
| `CUSTOMER_RANK_MST` | Rank criteria | `customerRank` | active ranges | LEGACY_CONFIRMED |
| `RO_SLIP_TRN` | COUNT per customer | `roSlip` | by CUSTOMER_CODE | LEGACY_CONFIRMED |
| `SALES_SLIP_TRN` | Revenue aggregates | `salesSlip` | by CUSTOMER_CODE | LEGACY_CONFIRMED |

### Write

| Bảng | Operation | Target | Ghi chú | Provenance |
|------|-----------|--------|---------|------------|
| `CUSTOMER_MST` | UPDATE | `customer.customerRankCategory` | Rank only | LEGACY_CONFIRMED |
| `CUSTOMER_MST_HIST` | INSERT? | TBD | Batch có ghi hist? | UNKNOWN |
| `batch_job_log` | INSERT | new table | Target audit | TARGET_DECISION |

**Transaction:** Per-customer update vs whole-batch — legacy = whole SP transaction; target propose chunked batches with per-chunk `$transaction` — TARGET_DECISION.

---

## 8. Implementation Guide

### NestJS Scheduler / Worker (target) — **không HTTP public**

| Component | Role | Provenance |
|-----------|------|------------|
| `CustomerRankBatchService` | Port SP logic | TARGET_DECISION |
| `CustomerRankBatchScheduler` | `@Cron('0 2 1 * *')` TBD | TARGET_DECISION |
| `CustomerRankBatchProcessor` | BullMQ worker (optional) | TARGET_DECISION |
| `BatchLockService` | Redis/DB advisory lock | TARGET_DECISION |

```typescript
@Injectable()
export class CustomerRankBatchScheduler {
  constructor(private readonly batchService: CustomerRankBatchService) {}

  @Cron(process.env.CUSTOMER_RANK_CRON ?? '0 2 1 * *') // 02:00 ngày 1 hàng tháng — ASSUMPTION
  async handleCron() {
    await this.batchService.run({ triggeredBy: 'CRON', domain: 'SALES' });
  }
}
```

```typescript
@Injectable()
export class CustomerRankBatchService {
  async run(opts: CustomerRankBatchJobInput): Promise<CustomerRankBatchResult> {
    return this.lockService.withLock('customer-rank-batch', async () => {
      const customers = await this.prisma.customer.findMany({ where: { deletedAt: null } });
      const criteria = await this.prisma.customerRank.findMany();
      // port SP_UPDATE_CUSTOMER_RANK logic
      for (const c of customers) {
        const roCount = await this.countRoSlips(c.code);
        const monthlyAvg = await this.calcMonthlySalesAvg(c.code);
        const rank = this.matchRank(criteria, { roCount, monthlyAvg, enrollTerm: c.enrollTerm });
        if (rank && !opts.dryRun) {
          await this.prisma.customer.update({
            where: { id: c.id },
            data: { customerRankCategory: rank.code },
          });
        }
      }
      return { status: 'SUCCESS', /* ... */ };
    });
  }
}
```

### Admin trigger (optional, protected)

| Method | Path | Permission | Note |
|--------|------|------------|------|
| POST | `/api/admin/jobs/customer-rank` | `admin.batch.run` | Manual trigger only — TARGET_DECISION |

> **Không** expose như menu 13xx — legacy không có MENU_ID cho batch.

### Cross-reference FD-CUST-01

BR-06 FD-CUST-01: `CUSTOMER_RANK_CATEGORY` chỉ đọc trên UI master; write bởi batch này — LEGACY_CONFIRMED.

---

## 9. Test Cases

| # | Scenario | Input | Expected | Type | Provenance |
|---|----------|-------|----------|------|------------|
| TC-01 | Match rank by RO count | KH với RO trong range | rank updated | Unit | LEGACY_CONFIRMED |
| TC-02 | No criteria match | low activity KH | rank unchanged | Unit | LEGACY_CONFIRMED |
| TC-03 | dryRun | dryRun=true | no DB writes | Unit | TARGET_DECISION |
| TC-04 | Concurrent lock | 2 jobs same time | second skips | Integration | TARGET_DECISION |
| TC-05 | SP parity | same seed data as legacy | same ranks | Characterization | LEGACY_CONFIRMED |
| TC-06 | Cron fires | mock timer | job invoked | Unit | TARGET_DECISION |
| TC-07 | DB failure mid-batch | simulate error | rollback chunk | Integration | TARGET_DECISION |

---

## 10. Risked Items

- [ ] Cron schedule UNKNOWN — không có trong source
- [ ] SP SQL body chưa verify — port logic có thể sai
- [ ] `CUSTOMER_MST_HIST` on batch update — UNKNOWN
- [ ] Legacy race condition khi chạy 2 lần
- [ ] `DOMAIN=SALES` multi-tenant migration
- [ ] `ENROLL_TERM` formula INFERRED

---

## 11. Open Questions / Target Decisions

| ID | Type | Item | Proposed Default | Impact | Status |
|----|------|------|------------------|--------|--------|
| OQ-01 | UNKNOWN | Cron schedule thực tế | `0 2 1 * *` monthly | High | Open |
| OQ-02 | UNKNOWN | Batch có ghi CUSTOMER_MST_HIST? | No unless verified | Medium | Open |
| TD-01 | TARGET_DECISION | Scheduler vs BullMQ worker | Scheduler P1, queue P2 | High | Proposed |
| TD-02 | TARGET_DECISION | Port SP vs call raw SQL | Port to TypeScript | High | Proposed |
| TD-03 | TARGET_DECISION | Admin manual trigger endpoint | Protected POST | Medium | Proposed |
| AS-01 | ASSUMPTION | Monthly avg window = 12 months | Match SP when verified | High | Needs verification |

---

## Cross-reference

| Doc | Link |
|-----|------|
| WF | [WF-15](../workflows/WF-15-batch-rank-update.md) |
| Customer CRUD | [FD-CUST-01](./FD-CUST-01-customer-crud.md) BR-06 |
| Batch jobs RE | [05-background-jobs.md](../05-background-jobs.md) |
| Index | [_index.md](./_index.md) |
