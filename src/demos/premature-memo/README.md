# Why premature memoization is a mistake

Dashboard demo that grows feature by feature. Four versions show the right sequence: initial → premature memo (mistake) → refactor without memo → justified memo.

- **Initial (no memo):** Simple dashboard with tick state; metric cards show derived values. No React.memo, useMemo, or useCallback. Works fine; [render] and [measure] show cheap re-renders.
- **Premature memo:** Same UI with memo/useMemo/useCallback everywhere. Props still change (tick) so memo never skips. Increased complexity (deps, callbacks), harder debugging, **no measurable gain**. Locks in poor architecture (all state at top, “optimize” with memo instead of fixing structure).
- **Refactor (no memo):** Fix the real issue — colocate state. Only `TickWidget` owns tick; `MetricGrid` shows static data and doesn’t receive tick. When you click Increment, only TickWidget re-renders. Performance improves **without** any memoization.
- **Justified memo:** After refactor, one expensive child (ExpensiveChart) remains; we measured it. We add memo + stable props only for that child. Rest of the dashboard stays simple (no memo). Right sequence: refactor → measure → memo only where needed.

**Implementation:** Explicit render logs ([render]) and measurements ([measure]); version with unnecessary memo; refactor that improves performance without memo; later version where memo is finally justified.

**Usage:** Open the demo, open DevTools Console, switch tabs and click Increment. Compare [render] count and [measure] across Initial, Premature, Refactor, and Justified.

See **LEARNING-GUIDE.md** for study order and **PR-REVIEW.md** for red flags, trade-offs, and how Senior developers sequence optimizations.
