# Senior React PR review: Data fetching in useEffect

## What was implemented

- **AcceptableUseEffectFetch:** One-off fetch on mount (user profile); empty deps; cancelled flag in cleanup; explicit `[fetch]` start/end logs.
- **BrokenUseEffectFetch:** Filter-driven fetch without cancellation; variable delay in mock (All slow, Active/Archived fast) so rapid filter change causes older response to overwrite newer (race).
- **StaleParamsFetch:** Same filters in UI but effect has `[]` deps; fetch runs once; changing filters does nothing (stale params).
- **FixedRaceUseEffectFetch:** Same as broken but with cancelled flag and correct deps; only latest request updates state; older responses log "(ignored: superseded)".
- **RefactoredFetch:** React Query for dashboard; queryKey = `['dashboard', filters]`; no manual useEffect; logs in queryFn for demo.

---

## PR review (Senior lens)

### What’s good

- **Clear “acceptable” case:** Mount-only, empty deps, single responsibility (profile), proper cleanup. Good teaching example for when useEffect fetch is fine.
- **Race condition is reproducible:** Variable delay in mock (All = 700ms, others = 300ms) makes the bug obvious: switch All → Active quickly and the wrong data wins without cancellation.
- **Stale params example:** Empty deps with filters in the effect body is a common mistake; the demo makes it visible (change filters, no refetch).
- **Fixed version shows minimal fix:** Cancelled flag + correct deps; no new libs. Good for teams that can’t adopt React Query yet.
- **Refactor uses React Query correctly:** queryKey includes filters; queryFn is pure; loading/error from query. Reduces complexity and avoids manual effect/cancellation.

### Things to watch

- **StaleParamsFetch:** The effect body uses `status` and `search` but deps are `[]`. ESLint exhaustive-deps would warn; the demo is intentionally wrong to illustrate the bug. In real code, fix the deps or refactor.
- **Double fetch in Strict Mode:** AcceptableUseEffectFetch and FixedRaceUseEffectFetch still issue a second request on mount in Strict Mode (cleanup runs, then effect runs again). They don’t update state from the first request (cancelled), but the network request is still sent. To avoid the second request entirely, you’d use AbortController and pass the signal to fetch; the demo doesn’t do that to keep focus on “ignore result” vs “cancel request.”

### Common misconceptions about data fetching in React

1. **“Fetch in useEffect whenever you need data.”**  
   Only when the trigger is simple (mount or stable deps) and you implement cleanup. For “when filters/params change,” either do cancellation + correct deps or use a data library.

2. **“Empty deps [] is fine if I only want to fetch once.”**  
   Only if the request truly has no parameters (or fixed params). If the request depends on props/state (e.g. filters) and you use `[]`, you fetch once with initial values and never refetch = stale data when the user changes filters.

3. **“I don’t need to cancel; the last request will just overwrite.”**  
   The last *response* to arrive overwrites, not the last request sent. With variable latency, an older request can finish after a newer one and overwrite with wrong data. You must ignore outdated responses (cancelled flag) or cancel the request (AbortController).

4. **“React Query is overkill for one screen.”**  
   It’s not just “one fetch”: you get cache, loading/error, and no race/stale bugs from manual useEffect. For any non-trivial server state (filters, pagination, etc.), the complexity you avoid usually outweighs the dependency.

5. **“Adding every dep causes too many refetches.”**  
   If “every dep” includes unstable values (new object/array every render), you get extra refetches. Fix by using stable values (primitives, or memoized objects). Don’t fix by omitting deps; that causes stale params.

### Trade-offs

- **useEffect + cancellation:** Full control, no new deps. Cost: you must get deps and cleanup right everywhere; easy to miss cancellation or add wrong deps.

- **React Query:** Cache, cancellation, loading/error out of the box; less custom code. Cost: you rely on the library’s semantics (staleTime, refetchOnWindowFocus, etc.); you give up hand-tuned “exactly when” for “good default + config.”

- **Custom hook (useDashboardData with useEffect):** Reuses one pattern across components; still need correct deps and cancellation in the hook. Good middle ground if you can’t use React Query; React Query is still simpler for filter-driven server state.

Summary: the demo correctly separates “acceptable” (mount-only, cleanup) from “broken” (race, stale params) and shows both the minimal fix (cancellation + deps) and the better approach (React Query). Logs make fetch timing and params visible for debugging and teaching.
