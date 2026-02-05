# Data fetching: when useEffect is acceptable vs when it hurts

## What this demo covers

- **Acceptable:** Fetch once on mount (e.g. user profile) with empty deps and cleanup (cancelled flag).
- **Broken (race):** Filter-driven fetch without cancellation — older response can overwrite newer; variable delay in mock (All = 700ms, Active/Archived = 300ms).
- **Broken (stale params):** Empty deps `[]` so filters never trigger refetch; UI shows data for initial filters only.
- **Fixed:** Same as broken but with cancelled flag + correct deps; only latest request updates state.
- **Refactored:** React Query for filter-driven data; no manual useEffect, cache, cancellation.

## How to run

1. Run the app and open **Data fetching (useEffect)** from the nav.
2. Open DevTools → Console to see `[fetch] start` / `[fetch] end` and params.
3. **Acceptable:** Loads user profile once; unmount to see cleanup log.
4. **Broken (race):** Set status to All, then quickly to Active; All is slow, Active fast — All can finish last and overwrite.
5. **Stale params:** Change status/search; no refetch (empty deps).
6. **Fixed:** Change status quickly; only latest request updates; older responses log "(ignored: superseded)".
7. **Refactored:** React Query; change filters; no race; cached when you switch back.

## Files

| File | Purpose |
|------|--------|
| `AcceptableUseEffectFetch.tsx` | Mount-only fetch with cleanup; empty deps. |
| `BrokenUseEffectFetch.tsx` | Filter-driven fetch, no cancellation → race. |
| `StaleParamsFetch.tsx` | Empty deps → stale params. |
| `FixedRaceUseEffectFetch.tsx` | Same as broken + cancelled flag + correct deps. |
| `RefactoredFetch.tsx` | useQuery for dashboard; no manual effect. |
| `mockApi.ts` | Variable delay by filter for race demo; fetchUserProfile for acceptable. |
