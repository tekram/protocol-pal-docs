# Calibration Methodology

How the sub-formulas and weights in `sleep-score.md`/`readiness-score.md`/
`activity-score.md` are derived and validated.

## 1. Sub-formula fitting (per-contributor linear regression)

For each sub-score, pull two parallel series from a real, exported Oura
account:

1. The raw sensor/session field (e.g. `total_sleep_duration`)
2. Oura's own real per-contributor value for that night (e.g.
   `DailySleep.contributors.total_sleep`, always 0-100)

Fit an ordinary least-squares line: `contributor ≈ slope × raw + intercept`.
Report `r` (correlation) and convert the fit into a `linearMap(value, inLo,
inHi)` range by solving for the raw values where the fitted line crosses 0
and 100.

**Always validate MAE against the real contributor value**, not just `r` — a
strong correlation can still carry a large constant offset that a raw `r`
figure hides. (This is how the `efficiency` and `restless_periods` unit/scale
bugs were caught — high `r` on the *wrong* formula still produced systematic
15-25 point errors.)

## 2. Weight fitting (ridge regression + leave-one-out cross-validation)

Once sub-formulas are trusted, fit the weights across sub-scores against
Oura's real overall score (`DailySleep.score`, etc.) using ridge regression
(L2-regularized least squares — needed because 5-7 free parameters against
25-30 days of data is thin, and unregularized fitting overfits badly).

Validate with leave-one-out cross-validation: hold out one day, fit on the
rest, predict the held-out day, repeat for every day, average the error.

**Critical pitfall, learned the hard way**: the pipeline clips negative
coefficients to zero and renormalizes to percentages that sum to 100 (weights
must be non-negative and interpretable). An earlier calibration attempt
validated the *raw* ridge coefficients via LOO-CV, looking good — then
clipped and renormalized as a separate, unvalidated final step. The shipped
weights were never actually tested in the form they shipped in. Re-running
with clip+renormalize happening *inside* the CV loop (matching what actually
ships) revealed the honest result: with only 25-26 samples and 7 free
readiness parameters, the original hand-picked weights already beat anything
fittable — the "improvement" from the first pass was an artifact of testing
the wrong thing.

**Rule going forward: any validation loop must reproduce every transformation
the shipped code actually applies, in the same order.** Testing coefficients
before clipping/renormalizing measures a model that doesn't exist in
production.

## 3. When to recalibrate

- After any meaningful jump in available real-night sample size
- If MAE against real contributors drifts upward on a fresh check (see
  `sleep-score.md`'s 2026-09-28 reconfirmation — ranges were re-checked
  against 4 more days and found stable, so no patch was needed that time)
- Never patch a sub-formula or weight without first computing before/after MAE
  against real contributor values — a plausible-looking r or a smaller
  regularization penalty is not sufficient justification on its own
