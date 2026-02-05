# When and why double fetching happens

## What this demo covers

- **StrictMode double effect:** In dev, React runs effect → cleanup → effect again on mount. Two `[fetch] start` logs. Dev-only; fix is cleanup (cancelled flag), not disabling StrictMode.
- **Unstable deps (bug):** Effect depends on `[filters]` where `filters` is an object literal → new reference every render → effect runs every render → multiple fetches. Real bug in production.
- **Fixed:** Primitive deps `[status, search]` + cancellation → one fetch per filter change.
- **Race:** Overlapping fetches without cancellation; older response can overwrite newer (All slow, Active fast; switch quickly to see wrong data).

## How to run

1. Run the app (StrictMode is on in main.tsx) and open **Double fetch** from the nav.
2. Open DevTools → Console.
3. **StrictMode:** See two `[effect] mount` and two `[fetch] start`; one response "(ignored: cleanup ran)".
4. **Unstable deps:** Change status or search; see repeated `[fetch] start` (effect runs every render).
5. **Fixed:** Change filters; one fetch per change.
6. **Race:** Set status to All, then quickly to Active; see Active finish first, then All overwrite.

## Files

| File | Purpose |
|------|--------|
| `StrictModeDoubleEffect.tsx` | Mount-only fetch; shows double effect in Strict Mode; cleanup ignores first run. |
| `UnstableDepsDoubleFetch.tsx` | Object in deps → effect every render → real double-fetch bug. |
| `FixedUnstableDeps.tsx` | Primitive deps + cancellation. |
| `RaceConditionOverlapping.tsx` | No cancellation; overlapping fetches; older can overwrite. |
