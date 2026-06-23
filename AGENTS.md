# SalesCube — Hướng dẫn Agent (Cursor)

> Port workflows từ `.devin/workflows/` → `.cursor/skills/*/reference-workflow.md`

## Đọc trước

| File | Vai trò |
|------|---------|
| `CLAUDE.md` | Domain, module, O2C/P2P, rủi ro migration |
| `AGENT.md` | RE rules, 10 loại output |
| `.cursor/rules/05-agent-rules.mdc` | Quy tắc bất biến agent |
| `.devin/workflows/` | Source workflow gốc (sync với Cursor skills) |

## Cấu trúc output

```
docs/function-design/          FD-<MODULE>-<NN>-*.md (+ _inventory, _evidence)
docs/spec/                     Spec reverse-engineered
docs/spec/gaps/                GAP-XX (cursor gap check)
docs/spec/reviews/             REV-XX (cursor review)
output/cursor/                 RE + WF docs (Cursor workflow — xem README_CURSOR.md)
salescube-ts/docs/migration/   Parity matrix, API contract, test plan
salescube-ts/                  Code TypeScript
.cursor/skills/                /slash commands
.cursor/rules/                 Rules persistent
```

## Skills

| Lệnh | Devin source | Phases chính |
|------|--------------|--------------|
| `/reverse-engineering-java` | `reverse-engineering-java.md` | 0–11 → `output/cursor/` |
| `/generate-workflow-docs` | `generate-workflow-docs.md` | 0–7: route inventory → `output/cursor/workflows/WF-XX` |
| `/generate-function-design` | `generate-function-design.md` | 0–7: inventory → FD-MODULE-NN |
| `/generate-prisma-schema` | `generate-prisma-schema.md` | 0–8: DDL evidence → schema |
| `/migration-typescript` | `migration-typescript.md` | 0–9: parity matrix → implement |
| `/check-gap-requirements` | Phase 6/10 trong mỗi workflow | Trước review |
| `/review-workflow-output` | Phase 7/11 trong mỗi workflow | Sau gap pass |

## Pipeline

```
Generate → … → Gap Check → Review → Hoàn tất
```

## Provenance (chuẩn Devin)

**RE/WF:** `JAVA_CONFIRMED`, `SQL_CONFIRMED`, `CONFIRMED_BY_CODE`, `INFERRED`, `UNKNOWN`

**FD/Migration:** `LEGACY_CONFIRMED`, `TARGET_DECISION`, `ASSUMPTION`, `UNKNOWN`, `PARITY_VERIFIED`

**Prisma:** `DDL_CONFIRMED`, `TARGET_DECISION`

## Quy tắc cứng (tóm tắt)

1. Không sửa `SalesCube/`
2. Không bịa rules — provenance bắt buộc
3. Không map Action→REST / DEL_DATETM→soft-delete / SEQ_MAKER→autoincrement tự động
4. Parity matrix trước khi migrate core logic
5. NestJS backend — không tRPC

## Hướng dẫn người dùng

→ [README_CURSOR.md](README_CURSOR.md) — cách chạy workflow và output tại `output/cursor/`
