# Gap Check: Workflow Bundle (output/cursor/workflows)

> **Workflow:** `/generate-workflow-docs` từ RE output sẵn có  
> **Date:** 2026-06-23  
> **Scope:** `_index.md`, `_inventory/*`, `_evidence/*`, WF-01..15

---

## Verdict: `READY_FOR_REVIEW`

| Metric | Result |
|--------|--------|
| WF files | 15/15 |
| `_index.md` | MET |
| `_inventory/routes.md` | MET |
| `_inventory/use-cases.md` + Spec-12 matrix | MET |
| `_open-questions.md` | MET |
| `_evidence/WF-*.md` | 15/15 MET (RE-derived; cần spot-check Java) |
| Template §0–§11 per WF | PARTIAL (legacy format) |

---

## Requirement matrix

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| WF-R00 | §0 Evidence & Confidence | PARTIAL | Có trong WF header; chưa bảng §0 chuẩn |
| WF-R01 | §1 Tổng quan | PARTIAL | Legacy headings |
| WF-R02 | §2 Entry Points | MET | Entry Route sections |
| WF-R03 | §3 Main Flow | MET | Main Code Path |
| WF-R04 | §4 Error Flows | MISSING | Ghi OQ-WF; TBD deep trace |
| WF-R05 | §5 Validation & Permission | MET/PARTIAL | WF-07,12 thiếu chi tiết |
| WF-R06 | §6 Business Rules & Status | MET/PARTIAL | |
| WF-R07 | §7 Database & Side Effects | MET | |
| WF-R08 | §8 Legacy Response | MISSING | P2 |
| WF-R09 | §9 Migration Risks | PARTIAL | Trong 10-risks cross-ref |
| WF-R10 | §10 Open Questions | MET | `_open-questions.md` |
| WF-R11 | `_evidence/` companion | MET | 15 files |
| WF-X01 | Coherent use case | MET | |
| WF-X02 | Spec-12 checklist | PARTIAL | Matrix trong use-cases; 6–11/12 per WF |

---

## P0 / P1

| Sev | Item | Action |
|-----|------|--------|
| P1 | WF legacy format vs §0–§11 | Reformat khi touch WF cho FD |
| P1 | WF-R04 error flows MISSING | Trace Java catch/forward on next pass |
| P2 | WF-R08 response behavior | Add from JSP forward names |

---

## Cross-reference

| Check | Status |
|-------|--------|
| RE `08-business-flow-hypotheses` ↔ WF O2C/P2P | OK |
| `03-route-api-inventory` ↔ `_inventory/routes.md` | OK |
| `docs/spec/03-business-rules` ↔ WF status sections | PARTIAL |
| `docs/spec/_index.md` WF path | OK → `output/cursor/workflows/` |

---

## Next step

```text
/review-workflow-output output/cursor/workflows/
```
