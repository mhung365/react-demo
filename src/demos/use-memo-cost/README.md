# When useMemo makes an app slower

This demo teaches the **cost of memoization**, when useMemo adds **overhead with no benefit**, when it **prevents a real performance issue**, and how **dependency instability** nullifies memoization.

## What you'll see

- **Dashboard (measure):** Production-style dashboard with shared `tick` state (frequent updates). Four panels show **"Last render: Xms"** so you can compare without the console: cheap no-memo (baseline), cheap with useMemo (often slightly higher — memo overhead), expensive justified (cache hit keeps render low), unstable deps (recompute every time → high).
- **Unnecessary useMemo:** Cheap computation (return constant object) wrapped in useMemo. No consumer needs a stable ref. We pay dep comparison every render and storage for no benefit. Check console: [measure] and factory run (once; cache hit after).
- **Better without useMemo:** Same cheap computation, no useMemo. Just compute in render. No comparison, no cache. Simpler; compare [measure] time with Unnecessary useMemo.
- **Justified useMemo:** Expensive computation (simulated) + memoized child that receives the result. useMemo([list]): when parent re-renders for count, deps unchanged → cache hit → no recompute, same ref → child skips re-render. Factory does not run again; child render count stays 1.
- **Unstable deps:** useMemo with [config] where config = { theme: 'dark' } every render. New reference every time → recompute every time; cache never used. We pay comparison + factory every render — worse than no useMemo.

## How to run

1. Start the app and open **"useMemo cost"**.
2. **Dashboard:** Click Increment in any panel; compare "Last render" ms across panels (cheap no-memo vs cheap useMemo vs justified vs unstable).
3. Open DevTools → Console for [measure] and factory logs.
4. **Unnecessary:** Click Increment several times — factory runs once (cache hit after). No consumer needs stable ref; memo overhead is wasted.
5. **Better:** Click Increment — no useMemo; compare [measure] with Unnecessary.
6. **Justified:** Click Increment — parent re-renders but useMemo returns cached result; child does NOT re-render. Factory does not run again.
7. **Unstable:** Click Increment — factory runs every time (deps new every render). Cache never used.

## Concepts

| Scenario | Cost | Benefit | Result |
|---------|------|---------|--------|
| **Unnecessary useMemo** | Comparison every render, storage. | None (no memoized consumer). | Overhead with no benefit; skip useMemo. |
| **Better without useMemo** | Just compute in render. | Same result, simpler. | No memo cost; can be faster for cheap computation. |
| **Justified useMemo** | Comparison every render, storage. | Skip expensive work when deps unchanged; stable ref for memoized child. | Real performance win. |
| **Unstable deps** | Comparison + factory every render. | None (never cache hit). | Worse than no useMemo. |

## Files

- `UseMemoCostDemo.tsx` — Shell and tabs (Dashboard, Unnecessary, Better, Justified, Unstable).
- `DashboardUseMemoCost.tsx` — Dashboard with frequent tick updates; four panels with explicit "Last render: Xms".
- `useMeasureRender.ts` — Logs approximate render time ([measure]); optional `onMeasured(ms)` callback for UI.
- `simulateWork.ts` — cheapComputation() and simulateExpensiveWork() for demos.
- `UnnecessaryUseMemo.tsx` / `BetterWithoutUseMemo.tsx` — Cheap computation with vs without useMemo.
- `JustifiedUseMemo.tsx` — Expensive computation + memoized child; useMemo justified.
- `UnstableDepsUseMemo.tsx` — useMemo with unstable deps; nullifies memoization.
