# Senior React PR review: Double fetch demo

## What was implemented

- **StrictModeDoubleEffect:** Mount-only fetch in useEffect. In Strict Mode: effect → cleanup → effect again; two `[effect] mount` and two `[fetch] start`. Cleanup sets `cancelled` so the first run's result is ignored. Explains dev-only and why disabling StrictMode is wrong.
- **UnstableDepsDoubleFetch:** Effect deps `[filters]` where `filters = { status, search }` (object literal). New reference every render → effect runs every render → multiple fetches. Genuine bug (production too).
- **FixedUnstableDeps:** Primitive deps `[status, search]` + cancelled flag in cleanup. One fetch per filter change; safe with StrictMode.
- **RaceConditionOverlapping:** Fetch on `[status]`, no cancellation. Variable delay (all = 600ms, active = 250ms). User switches All → Active quickly; Active finishes first, then All overwrites. Logs show order of `[fetch] end`.

---

## PR review (Senior lens)

### What's good

- **Clear dev vs prod:** StrictMode double effect is explicitly labeled dev-only; unstable deps and race are called out as real production bugs. That prevents "we only see double fetch in dev" confusion.
- **Fix is correct:** FixedUnstableDeps uses primitive deps and cancellation. No suggestion to disable StrictMode; LEARNING-GUIDE explains why that's wrong.
- **Logs are explicit:** `[effect] mount/cleanup`, `[fetch] start/end` with params make the sequence visible. Good for teaching and debugging.
- **Race demo is reproducible:** Variable delay (all slow, active fast) makes it easy to trigger "wrong data wins" by switching quickly.

### Things to watch

- **UnstableDepsDoubleFetch:** The eslint-disable for exhaustive-deps is intentional (we're demonstrating the bug). In real code, exhaustive-deps would warn about `filters`; the fix is to use `[status, search]` and build `filters` inside the effect.
- **StrictModeDoubleEffect:** We still send two network requests in dev (both fetches are started). The "fix" is that we ignore the first result (cleanup). To avoid sending the second request at all you'd need AbortController and abort the first request in cleanup — the demo focuses on "ignore result" which is the minimal correct behavior.

### Common developer misconceptions about double fetching

1. **"Double fetch only happens in dev because of StrictMode."**  
   StrictMode causes a double *effect run* in dev, so you see two fetches on mount. But **unstable deps** (e.g. object in dependency array) cause the effect to run every render in both dev and production — so double/multiple fetch can be a real production bug.

2. **"I'll fix it by removing StrictMode."**  
   Wrong. That hides the double run but doesn't fix missing cleanup or wrong dependencies. Your effect should tolerate being run twice and must clean up. Disabling StrictMode also loses other checks (e.g. impure render).

3. **"Adding the object to deps is correct because ESLint said so."**  
   ESLint wants every value used inside the effect in the deps list. If that value is an object literal created in render, you get a new reference every time → effect runs every render. Fix: put **primitives** in deps (e.g. `status`, `search`) or memoize the object with `useMemo` so the reference is stable when its contents haven't changed.

4. **"We don't need cleanup for fetch; we just setState when it resolves."**  
   Without cleanup, when the effect re-runs (StrictMode, or deps change) or the component unmounts, the previous request's callback can still run and call setState. That causes race (old data overwrites new) or setState-after-unmount. Always ignore or cancel in-flight work in cleanup.

5. **"Production build doesn't double-invoke, so we're fine."**  
   StrictMode double-invoke is dev-only, but **concurrent React** can re-run effects when components go offscreen and back, or when React needs to. If your effect isn't written with cleanup, you can still get bugs in production.

### Trade-offs and designing fetch logic safely

- **Manual useEffect + cleanup:** Full control over when the request runs and how cancellation works. You must get deps right (primitives or stable refs) and always clean up. Good for one-off or simple flows.
- **React Query (or similar):** Library manages cache, cancellation, and loading state; you pass queryKey and queryFn. You give up fine-grained control over exact request timing in exchange for fewer bugs (no manual deps/cleanup). Prefer this for server state that depends on filters/params.
- **StrictMode:** Keep it. Treat double-invoke as "my effect must be correct under re-run and cleanup." Design fetch logic so it doesn't rely on "effect runs exactly once."

Summary: the demo correctly separates StrictMode double effect (dev-only, fix = cleanup) from unstable-deps double fetch (real bug, fix = primitive deps) and race (fix = cancellation). LEARNING-GUIDE and PR-REVIEW explain why disabling StrictMode is wrong and how to design fetch logic safely.
