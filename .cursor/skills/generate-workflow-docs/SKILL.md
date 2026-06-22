---
name: generate-workflow-docs
description: Sinh WF-XX evidence-first tại output/workflows/ — route→Action→Service→SQL→DB, provenance JAVA/SQL/DDL_CONFIRMED. Dùng khi document luồng nghiệp vụ legacy SalesCube.
disable-model-invocation: true
---

# Generate Workflow Docs

> **Workflow đầy đủ:** [reference-workflow.md](reference-workflow.md) (port từ `.devin/workflows/generate-workflow-docs.md`)

## Mục tiêu

Một file WF = một **use case** nghiệp vụ (không dump cả class). Trace Route → Action → Service → SQL → DB/side effects.

## Provenance

`JAVA_CONFIRMED` | `SQL_CONFIRMED` | `DDL_CONFIRMED` | `WF_CONFIRMED` | `INFERRED` | `UNKNOWN`

## Output

```text
output/workflows/
├── _index.md
├── _open-questions.md
├── _inventory/routes.md, use-cases.md
├── _evidence/WF-<NN>-<name>.md
├── _reports/WF-<NN>-<name>-review.md
└── WF-<NN>-<kebab-name>.md
```

## Phases

| Phase | Nội dung |
|-------|----------|
| 0 | Repository preflight |
| 1 | Route & use-case inventory |
| 2 | Evidence collection |
| 3 | Trace Route → Action → Service → SQL |
| 4 | Workflow modeling (mermaid) |
| 5 | Generate `WF-<NN>-*.md` |
| 6 | Gap check (`/check-gap-requirements`) |
| 7 | Review → `_reports/` + `/review-workflow-output` |

## Quy tắc cứng

- Không coi mỗi public Action method = một workflow
- Không suy route/HTTP nếu chưa có mapping config
- Không suy side effect (HIST/EAD/SEQ) từ tên
- Evidence anchor: `Action.method() → Service.method() → lines X-Y`

## Tham chiếu

- `AGENT.md` output #8
- `/reverse-engineering-java` (nên chạy trước nếu chưa có inventory)
