# BLE Scoring Methodology — Design Spec

**Date:** 2026-09-26
**Status:** Draft — for review
**Author:** Tashfeen Ekram

---

## Overview

`protocol-pal-docs` is described as covering "how sleep, readiness, and activity
scores are computed from Oura BLE data," but today it only holds the protocol
JSON layer (`protocols/`, `schema/`). The BLE scoring methodology itself —
sub-formulas, weights, and the ridge-regression calibration process behind them
— lives only as private source (`huberman-protocol-pal/src/services/oura/`) and
isn't documented anywhere public. This spec closes that gap: publish the
methodology as static docs, not code, so outside readers can understand and
verify how local BLE scores are derived without needing app source access.

## Goals

- Document each sub-score formula (sleep, readiness, activity) in plain terms:
  input metric, mapped range, and the empirical basis for that range
- Document the calibration methodology (ridge regression + leave-one-out CV
  against real Oura contributor values) as a repeatable recipe, not just results
- Publish current weight tables (sub-score → final score) as data, versioned
  alongside the methodology text
- Make clear these are locally-computed approximations of Oura's proprietary
  scores, not official Oura numbers — same disclosure requirement already used
  in the app's own BLE-direct UI

## Non-Goals

- Publishing the phone-bridge MCP server or any adb/device-access tooling —
  that's a personal dev tool, not user-facing methodology, and stays in the
  private app repo
- Publishing raw calibration data (the 25-night export used to fit the current
  formulas) — methodology and resulting coefficients only, no personal health
  data
- Publishing `oura-analysis`/`open_oura` BLE protocol internals — that's a
  separate concern (ring communication), tracked in the app repo's own
  `PLAN-oura-direct-ble.md`
- A live/interactive calculator — static docs only for this pass

## Architecture

### New content in `protocol-pal-docs`

```
methodology/
├── README.md                    overview + disclosure note
├── sleep-score.md                sub-formulas: total_sleep, efficiency,
│                                  restfulness, rem_sleep, deep_sleep,
│                                  latency, timing — each with mapped range
│                                  + fit quality (r, MAE) vs Oura's real
│                                  contributor values
├── readiness-score.md             same treatment for readiness sub-scores
├── activity-score.md              same treatment for activity sub-scores
├── calibration-methodology.md      ridge regression + LOO-CV recipe: how
│                                  weights are refit against exported Oura
│                                  data, overfit guardrails, when to recalibrate
└── weights.json                  current sub-score weight table (data,
                                   versioned — mirrors `bleWeights.ts`)
```

### Source of truth stays private

`weights.json` and the sub-formula docs are **generated/transcribed from**
`huberman-protocol-pal/src/services/oura/bleScoring.ts` and `bleWeights.ts` —
app repo remains authoritative; docs repo is a published snapshot, manually
synced on recalibration (same cadence as protocol JSON releases).

## Community Workflow

Read-only for most contributors — this documents an existing algorithm, it
isn't a community-editable dataset like `protocols/`. PRs welcome for
clarity/typo fixes; weight/formula changes only land after a real recalibration
in the private app repo, then get mirrored here.

## Risks

- **Drift between repos:** `weights.json` here can silently go stale vs the
  app's `bleWeights.ts` after a recalibration. Mitigate: note the app commit
  hash each snapshot was mirrored from, at the top of `weights.json`.
- **Reverse-engineering concerns:** documenting fit quality against Oura's real
  contributor values could be read as reverse-engineering Oura's proprietary
  scoring. Mitigate: frame explicitly as "our local approximation, not Oura's
  algorithm" — same disclosure the app already uses; publish only our own
  linear-fit coefficients, never Oura's source data or model internals.
- **Support burden:** public methodology invites questions/issues about scoring
  accuracy from users who don't have `open_oura`/BLE context — CONTRIBUTING.md
  should point them at the disclosure note, not promise support.

## Decision Log

| Decision | Rationale |
|----------|----------|
| Methodology as static docs, not code | Repo's existing pattern (protocols) is data/docs, not app logic |
| Exclude phone-bridge MCP tooling | Personal dev tool, no public value, potential security-adjacent surface |
| Manual sync from app repo, not automated | Recalibrations are infrequent and reviewed by hand already |
| No raw calibration data published | Avoid publishing personal health data, even anonymized |

---

**Not yet committed anywhere.** Pushing this to the public `protocol-pal-docs`
repo is a separate, explicit step once you've reviewed the scope above.
