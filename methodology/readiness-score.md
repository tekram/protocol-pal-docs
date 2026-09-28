# Readiness Score — Sub-Formulas

Source: `src/services/oura/bleScoring.ts`, `computeReadinessScore`. Unlike sleep,
several readiness contributors depend on data that simply doesn't exist in a
raw BLE session sync (it lives in Oura's cloud-computed `DailyReadiness`
object) — those are documented here as confirmed, structural limitations,
not calibration failures.

| Sub-score | Raw input | Status |
|---|---|---|
| `previous_night` | this account's own sleep score | passthrough of `computeSleepScore` |
| `sleep_balance` | `total_sleep_duration` vs personal 14-day baseline | ratio-based, not contributor-fit |
| `resting_hr` | `lowest_heart_rate` | **fixed 2026-09-28** — see below |
| `hrv_balance` | `average_hrv` vs personal 30-day baseline | ratio-based, not contributor-fit |
| `body_temperature` | — | **neutral default (70)** — structural gap, see below |
| `recovery_index` | `readiness_score_delta` | **confirmed zero signal** — see below |
| `activity_balance` | — | **neutral default (70)** — structural gap, see below |

## `resting_hr` — recalibrated 2026-09-28

The original formula compared `lowest_heart_rate` to a personal 30-day
baseline (`(baseline - recent + 10) / 20 × 100`). Checked against Oura's real
`resting_heart_rate` contributor on 29 real nights: **MAE 34.1 points** — badly
miscalibrated.

A direct linear fit of the same raw input against the real contributor:

```
resting_hr = linearMap(lowest_heart_rate, 62.92, 49.57)  // inverted
```

r = -0.88, **MAE 4.6 points**. Simpler and far more accurate — the baseline-ratio
approach added complexity without benefit.

## `body_temperature` and `activity_balance` — structural gaps, not bugs

Both return a fixed neutral value (70) always. This isn't a stale formula —
it's because the function signature only receives a `SleepSession` (or, for
`activity_balance`, nothing), and neither `temperature_deviation` nor a
same-day activity score exists on that type. Those fields only exist on
`DailyReadiness`/`DailyActivity`, which come from Oura's cloud API — not from
a raw ring BLE sync. **No local recalibration can fix this**; it would require
architecturally passing cloud-only data into a function meant for the
cloud-independent path, which defeats the point.

## `recovery_index` — confirmed zero correlation, left unfit

The current proxy, `readiness_score_delta`, was checked against Oura's real
`recovery_index` contributor on 29 real nights: **r = 0.00** — no correlation
at all. This isn't a formula waiting to be tuned; the raw signal itself
carries no information about this contributor. Oura's real `recovery_index`
likely depends on multi-day trend data not reconstructable from a single
night's raw session fields. Left at its neutral default (70) rather than
fit to noise.

## Weights

See [`weights.json`](./weights.json) `readiness` block. Hand-picked, not
ridge-fit — a 2026-09-24 attempt to fit weights via ridge regression + LOO-CV
against only 25-26 paired days found the original hand-picked weights already
beat anything fittable from that sample size (7 free parameters is too many
for that little data, even with regularization). Revisit if a larger sample
becomes available.
