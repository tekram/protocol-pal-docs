# Sleep Score — Sub-Formulas

Source: `src/services/oura/bleScoring.ts`, `computeSleepScore`. Each sub-formula
maps a raw sensor/session field to a 0-100 sub-score, fit by linear regression
against Oura's real per-night contributor values (`DailySleep.contributors`).

All ranges below were fit on 25-30 real nights (dated per formula) and
reconfirmed stable on 2026-09-28 against 29-30 fresh nights — see
[`calibration-methodology.md`](./calibration-methodology.md).

| Sub-score | Raw input | Mapped range | Fit quality (r, MAE) |
|---|---|---|---|
| `total_sleep` | `total_sleep_duration` (s) | 6487 → 31142 | r=1.00, MAE 0.2 |
| `efficiency` | `efficiency` (%) | 49 → 92 | r=1.00, MAE 0.2 |
| `rem_sleep` | `rem_sleep_duration` (s) | -396 → 7014 | r=0.99, MAE 1.5 |
| `deep_sleep` | `deep_sleep_duration` (s) | 63 → 5222 | r=1.00, MAE 0.3 |
| `latency` | `latency` (s), inverted | 6986 → -1615 | r=-0.56, MAE 9.4 |
| `restfulness` | `restless_periods` (count) | `clamp(78 - v × 0.1)` | r=-0.45, weak but real |
| `timing` | sleep-window midpoint vs 2 AM target | within 1h → 100, ≥3h → 0, linear between | not contributor-fit — a fixed personal-target heuristic |

Notes:

- **`efficiency` bug fix**: Oura does *not* pass its raw efficiency percentage
  straight through as the contributor — it maps a 49–92% range to 0–100. An
  earlier version of this formula assumed a direct pass-through; that was wrong.
- **`restless_periods` unit fix**: Oura's field is a count of restless *epochs*
  across the whole night (observed range ~200-390), not a small 0-10 event
  count. An earlier version assumed the latter and always clamped to 0.
- **`latency` and `restfulness`** are the two weakest fits (r magnitude
  <0.6) — real relationships, but Oura's contributor isn't purely linear in
  the raw value for these two. Still a large improvement over the original
  hand-picked thresholds.
- **`timing`** isn't fit against a contributor at all — Oura doesn't expose a
  timing-specific sleep contributor; this stays a heuristic (distance from a
  personal target midpoint).

## Weights

See [`weights.json`](./weights.json) `sleep` block. Calibrated via ridge
regression + leave-one-out cross-validation, LOO-CV MAE ±2.06 → ±1.45 after
the sub-formula fixes above (previously, weight-only optimization *without*
fixing the sub-formulas found no honest improvement over hand-picked weights
— see [`calibration-methodology.md`](./calibration-methodology.md) for why
that distinction matters).
