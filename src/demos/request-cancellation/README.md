# Request cancellation in React

## What this demo covers

- **Broken:** Search-as-you-type with no cancellation. Overlapping requests; whichever finishes last overwrites (stale data). No cleanup → setState-after-unmount possible (memory leak).
- **Correct:** AbortController in effect cleanup; pass `signal` to fetch; `controller.abort()` in cleanup. Previous request is aborted; only latest query updates state. Cleanup prevents setState after unmount.
- **Variant:** Ignore outdated responses (cancelled flag). Same UX; request still runs to completion; we only ignore the result when it arrives. No network cancellation.

## How to run

1. Run the app and open **Request cancellation** from the nav.
2. Open DevTools → Console to see `[fetch] start` / `[fetch] end` (ok | aborted | error) and cleanup logs.
3. **Broken:** Type quickly (e.g. `a` → `ab` → `abc`). Shorter queries are faster; whichever request finishes last overwrites — may be stale.
4. **AbortController:** Type quickly; previous request logs `end (aborted)`. Only latest query updates state.
5. **Ignore response:** Same UX; older responses log "(ignored: superseded)"; request still completes.

## Files

| File | Purpose |
|------|--------|
| `NoCancellationBroken.tsx` | No cleanup; race + possible setState after unmount. |
| `AbortControllerCorrect.tsx` | AbortController in cleanup; signal passed to fetchSearch. |
| `IgnoreResponseVariant.tsx` | Cancelled flag; ignore in-flight result. |
| `mockApi.ts` | fetchSearch(query, signal?) — supports AbortSignal; rejects with AbortError when aborted. |
