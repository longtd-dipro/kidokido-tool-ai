# Status: smaregi-v2-prepaid-receipt-print

- stage: Dev (task-0 spike đầu tiên)
- spec: draft (7 open questions, 3 assumptions cần verify — chưa được user approve)
- tasks: created (5 tasks: task-0 spike + task-1..4 implementation)
- last_updated: 2026-08-04

## Log
- 2026-08-04 — BA: chạy semantic query (`smaregi`, `prepaid`, `確定販売`, `transaction`, `--dependents smaregi.const.ts`); đọc `smaregi.service.ts`, `smaregi.const.ts`, `smaregi.types.ts`, `smaregiSync.ts:270-375`.
- 2026-08-04 — BA: SPEC.md draft — chọn Kịch bản B (assumption Smaregi API hỗ trợ trigger print) làm default. 7 Open Questions (Q4 & A1 là CRITICAL — chặn implement).
- 2026-08-04 — BA: user yêu cầu tiếp tục sang Techlead dù chưa clarify → BA cảnh báo SPEC còn assumptions; Techlead phân rã task với ghi chú "phase 0 — verify Smaregi API".
- 2026-08-04 — Techlead: chạy `--dependents smaregi.service.ts/smaregiSync.ts/smaregi.types.ts/useSmaregiEnabled.ts` (kết quả nghèo → fallback grep). Xác định 7 file gián tiếp phụ thuộc (`scan.ts`, `status.ts`, `cancel/[id].ts`, `rollback-scan.ts`, `smaregiTransaction.ts`, `reconcile-smaregi-transactions.ts` + core `smaregiSync.ts`).
- 2026-08-04 — Techlead: cắt 5 task theo INVEST — task-0 SPIKE (block toàn bộ), task-1 service client, task-2 auto-in flow, task-3 reprint API, task-4 UI. Dependency: 0→1→(2 ∥ 3)→4.

## Task graph
```
task-0 (SPIKE, S) → task-1 (service, S) → task-2 (auto-in, S-M)  [AC1, AC4, AC5]
                                        → task-3 (API, S-M)       [AC2, AC3, AC5]  → task-4 (UI, M)  [AC2 UI, AC3 UI, AC5]
```

## Blocking issues
- **Q4 (CRITICAL):** Smaregi Platform API có endpoint print receipt không? → task-0 phải trả lời trước khi task-1+ start. Nếu KHÔNG có, toàn bộ 4 task sau phải re-plan sang Kịch bản A (đổi terminalId).
- **Q1:** Vị trí nút "In lại receipt" — block task-4.
- **Q3:** In lại được sau khi cancel/refund? — chỉ ảnh hưởng 1 guard trong task-3, không block start.
- **Q7:** Auto in hay chỉ manual? — nếu chốt "chỉ manual" thì task-2 bị hủy.
