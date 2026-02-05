# Race conditions in useEffect (correct deps ≠ no race)

## What this demo covers

- **Broken:** Correct dependency array `[query]`, but rapid typing causes overlapping requests. Response order can differ from request order; whichever response arrives last overwrites state (often stale). Console: `[request] start #1` (a), `start #2` (ab), `end #2` (ab), `end #1` (a) → state shows "a" (wrong).
- **Fix 1: AbortController** — Cleanup aborts previous request. Only the latest request can complete. Older requests log `end #N (aborted)`. Limitation: API must support AbortSignal.
- **Fix 2: Request ID guard** — Each effect run has an ID; we only setState if `myId === currentId` when response arrives. Older responses log `end #N (ignored)`. Request still runs to completion. Works with any API.
- **Fix 3: Ignore stale (cancelled flag)** — Cleanup sets `cancelled = true`; in .then we only setState if `!cancelled`. Same outcome as request-id; no ID tracking. Request still runs to completion.

## How to run

1. Run the app and open **Effect race conditions** from the nav.
2. Open DevTools → Console to see `[request] start #N` / `[request] end #N` (ok | aborted | ignored | error).
3. **Broken:** Type quickly (e.g. `a` → `ab` → `abc`). Shorter query = faster (see mockApi). Whichever response arrives last overwrites — often the older query.
4. **Fixes:** Type quickly; only the latest query updates state. Compare: AbortController logs "aborted"; request-id and ignore log "ignored".

## Files

| File | Purpose |
|------|--------|
| `RaceCorrectDepsBroken.tsx` | Correct deps, no mitigation; race visible. |
| `FixAbortController.tsx` | AbortController in cleanup. |
| `FixRequestIdGuard.tsx` | Request ID guard (myId === currentId). |
| `FixIgnoreStale.tsx` | Cancelled flag; ignore superseded. |
| `mockApi.ts` | fetchSearch(query, signal?) — variable delay by query length. |
