# BLE Scoring Methodology

How Protocol Pal computes sleep, readiness, and activity scores **locally, from
raw ring/session data**, without Oura's cloud API. This is the algorithm behind
the app's "Direct from Ring" data source (as opposed to "Via Oura Cloud",
which just returns Oura's own official score).

**These are our own local approximations, not Oura's proprietary algorithm.**
Oura's real scoring models are closed-source PyTorch models; nothing here
reverse-engineers them. What's documented is our own from-scratch linear
model, fit against our own account's real Oura contributor values (the 0-100
per-factor breakdowns Oura's cloud API already returns publicly to any
connected app) purely to calibrate our own local approximation's accuracy.

## Structure

- [`sleep-score.md`](./sleep-score.md) — 7 sub-formulas, each fit against Oura's real sleep contributors
- [`readiness-score.md`](./readiness-score.md) — 7 sub-formulas, including two confirmed unfixable with local-only data
- [`activity-score.md`](./activity-score.md) — 5 sub-formulas, plus one known gap
- [`calibration-methodology.md`](./calibration-methodology.md) — the linear-fit and ridge+LOO-CV recipe used to derive both the sub-formulas and their weights
- [`weights.json`](./weights.json) — current weight table, mirrors the app's shipped defaults

## Source of truth

This is a **manually synced snapshot** from the private `huberman-protocol-pal`
app repo, mirrored from commit `e5642dd` (2026-09-28). The app repo is
authoritative — these docs are updated by hand after a real recalibration,
not automatically.

## Disclosure

Scores computed this way are approximations of what Oura's cloud would show,
not Oura's official numbers. Accuracy varies by sub-score — see each file for
real MAE (mean absolute error) figures against Oura's own contributor values.
Some sub-scores (readiness's `recovery_index`, activity's `recovery_time`) are
confirmed to need data this local model structurally can't access, and are
left as neutral defaults rather than faked.
