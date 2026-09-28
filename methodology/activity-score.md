# Activity Score — Sub-Formulas

Source: `src/services/oura/bleScoring.ts`, `computeActivityScore`.

| Sub-score | Raw input |
|---|---|
| `meet_daily_targets` | `meters_to_target`/`target_meters`, falls back to calorie ratio |
| `stay_active` | non-sedentary time ratio |
| `move_every_hour` | neutral default (70) — Oura's per-hour movement alerts aren't in `DailyActivity` |
| `training_frequency` | `high_activity_time` |
| `training_volume` | `equivalent_walking_distance`, falls back to `steps` |

## Known gap: `recovery_time` is entirely unmodeled

Confirmed 2026-09-28 against a fresh export: Oura's real `DailyActivity`
contributors include a **`recovery_time`** field that this scoring model has
no sub-score function for at all — it's silently missing from the weighted
composite (via `weightedScore`'s default-to-50 fallback for unrecognized
contributor keys).

This is deliberately **not patched with a guessed formula**. `DailyActivity`
has no raw field that plausibly represents "time since last hard training" —
inventing a mapping from an unrelated field (e.g. `sedentary_time`) would be a
guess dressed up as a calibration, not a real fit. Revisit only if a raw
signal that actually correlates with this contributor is identified.

## Weights

See [`weights.json`](./weights.json) `activity` block. Calibrated 2026-09-24
via ridge regression + LOO-CV: MAE ±18.65 → ±15.69.
