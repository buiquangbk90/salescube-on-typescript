# Requirement Matrix theo loại Output

Mỗi item: `ID` | `Requirement` | `Severity` (P0/P1/P2)

---

## FD — Function Design (`docs/function-design/FD-<MODULE>-<NN>-*.md`)

| ID | Requirement | Sev |
|----|-------------|-----|
| FD-R00 | §0 Evidence & Confidence + provenance labels | P0 |
| FD-R01 | §1 Tổng quan với provenance per field | P0 |
| FD-R02 | §2 Input — Zod schema + field table + legacy mapping | P0 |
| FD-R03 | §3 Output — legacy behavior + target response | P0 |
| FD-R04 | §4 Business Rules (LEGACY vs TARGET tách bạch) | P0 |
| FD-R05 | §5 Validation Rules + error messages | P0 |
| FD-R06 | §6 Error Handling legacy + target API mapping | P0 |
| FD-R07 | §7 Database I/O read/write + delete/cancel policy | P0 |
| FD-R08 | §8 Implementation Guide (controller/service/prisma) | P1 |
| FD-R09 | §9 Test Cases | P1 |
| FD-R10 | §10 Risked Items | P1 |
| FD-R11 | §11 Open Questions / Target Decisions | P0 |
| FD-R12 | `_evidence/FD-*.md` companion file | P1 |
| FD-R13 | `_inventory/<module>.md` nếu module mới | P2 |
| FD-X01 | Mọi rule có provenance — không ASSUMPTION → LEGACY_CONFIRMED | P0 |
| FD-X02 | WF rules reflected in FD | P0 |
| FD-X03 | Không map Action→REST máy móc (SCREEN_NAVIGATION excluded) | P0 |

---

## WF — Workflow Doc (`output/workflows/WF-*.md`)

| ID | Requirement | Sev |
|----|-------------|-----|
| WF-R00 | §0 Evidence & Confidence | P0 |
| WF-R01 | §1 Tổng quan + provenance | P0 |
| WF-R02 | §2 Entry Points & Components | P0 |
| WF-R03 | §3 Main Flow (mermaid) + steps | P0 |
| WF-R04 | §4 Alternative / Error Flows | P1 |
| WF-R05 | §5 Validation & Permission | P0 |
| WF-R06 | §6 Business Rules & Status | P0 |
| WF-R07 | §7 Database & Side Effects | P0 |
| WF-R08 | §8 Legacy Response Behavior | P1 |
| WF-R09 | §9 Migration Risks | P1 |
| WF-R10 | §10 Open Questions | P0 |
| WF-R11 | `_evidence/WF-*.md` companion | P1 |
| WF-X01 | Coherent use case — không class dump | P0 |

---

## RE — Reverse Engineering

| ID | Requirement | Sev |
|----|-------------|-----|
| RE-R01 | Confidence trên mỗi kết luận quan trọng | P0 |
| RE-R02 | Evidence `file:line` hoặc Unknown | P0 |
| RE-R03 | Actions table (path + permission) | P1 |
| RE-R04 | Business rules có nguồn | P0 |
| RE-R05 | DB read/write | P1 |
| RE-R06 | Risks / unknowns section | P1 |
| RE-X01 | Không kết luận Confirmed khi chỉ Inferred | P0 |

---

## PRISMA — Schema

| ID | Requirement | Sev |
|----|-------------|-----|
| PR-R01 | Type mapping đúng MySQL → Prisma | P0 |
| PR-R02 | `@@map` tên bảng gốc | P0 |
| PR-R03 | `@map` column names | P1 |
| PR-R04 | `deletedAt` cho DEL_DATETM | P1 |
| PR-R05 | Không FK giả khi DDL không có constraint | P0 |
| PR-R06 | `prisma format` pass | P0 |
| PR-X01 | Cross: columns vs DDL / entity list | P0 |

---

## MIGRATION — TypeScript Code

| ID | Requirement | Sev |
|----|-------------|-----|
| MG-R01 | FD/WF tương ứng đã tồn tại hoặc TBD documented | P1 |
| MG-R02 | Zod ↔ controller ↔ form aligned | P0 |
| MG-R03 | Soft-delete filter | P0 |
| MG-R04 | Permission guard (không @Public tùy tiện) | P1 |
| MG-R05 | Business rules comment nguồn Java | P1 |
| MG-R06 | Không mock khi service đã có | P0 |
| MG-X01 | Cross: behavior khớp FD §4 processing | P0 |
| MG-X02 | Cross: fields khớp FD §2 | P1 |

---

## Severity xử lý

| Sev | Gap check | Review |
|-----|-----------|--------|
| P0 MISSING | NEEDS_COMPLETION | Không chạy |
| P1 PARTIAL | Sửa hoặc TBD + READY | Review ghi WARNING |
| P2 MISSING | READY_FOR_REVIEW | Review ghi INFO |
| BLOCKED | TBD + READY hoặc BLOCKED | Review ghi BLOCKED |
