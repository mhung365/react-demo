# Senior React PR review: Request cancellation demo

## What was implemented

- **NoCancellationBroken:** Search-as-you-type; no cleanup; no cancellation. Overlapping requests; whichever finishes last overwrites (stale data). No cleanup → setState-after-unmount possible. Explicit `[fetch] start` / `[fetch] end` logs with params.
- **AbortControllerCorrect:** AbortController created in effect; `signal` passed to `fetchSearch(query, signal)`; cleanup calls `controller.abort()`. Mock API supports signal (rejects with AbortError when aborted). Catch checks `e?.name === 'AbortError'` and skips setState. Only latest request can update state; cleanup prevents setState after unmount.
- **IgnoreResponseVariant:** Cancelled flag in cleanup; in `.then`/`.catch` only setState if `!cancelled`. Same UX as abort; request still runs to completion. Contrast with AbortController (actual cancellation).
- **mockApi:** `fetchSearch(query, signal?)` — delay scales with query length (shorter = faster) for race demo; listens to `signal` and rejects with `DOMException('Aborted', 'AbortError')` when aborted; clears timeout and removes listener on abort.

---

## PR review (Senior lens)

### What’s good

- **Clear “where” and “how”:** Cleanup is the right place; AbortController created per effect run, signal passed to fetch, abort in cleanup. Demo and LEARNING-GUIDE spell this out.
- **Race is reproducible:** Search-as-you-type with variable delay (shorter query = faster) makes it easy to type `a` → `ab` → `abc` and see an older request overwrite. Logs show start/end order.
- **Contrast abort vs ignore:** AbortControllerCorrect vs IgnoreResponseVariant make the difference explicit: abort cancels the request (mock rejects); ignore only discards the result when it arrives.
- **Cleanup and memory leaks:** Concepts section and LEARNING-GUIDE explain that without cleanup, setState can run after unmount or with stale data; cleanup (abort or ignore) prevents both.
- **Mock supports AbortSignal:** fetchSearch accepts optional signal and rejects with AbortError when aborted; good pattern for real fetch (pass `signal` to `fetch()`).

### Things to watch

- **AbortControllerCorrect `.finally`:** We do `if (!signal.aborted) setLoading(false)`. For an aborted request, we don’t clear loading because the “current” run is already the new one (which set loading true). Correct. If we didn’t check, we might clear loading when the aborted request’s finally runs, which could briefly show “not loading” before the new request completes. Good as-is.
- **IgnoreResponseVariant:** Doesn’t pass signal to fetchSearch; the mock still runs to completion. That’s intentional to show “request completes but we ignore result.” No change needed.
- **Real fetch:** In production, use `fetch(url, { signal })`. When aborted, fetch throws with `name === 'AbortError'`. The demo mock mirrors that behavior.

### Common mistakes with aborting requests

1. **Aborting the same controller in the next run:** Create a **new** AbortController inside each effect run. Don’t reuse one from a previous run or from outside the effect; otherwise you might abort a request that belongs to the current run.

2. **Treating AbortError as a real error:** In `.catch`, check `e?.name === 'AbortError'` and return (or log and return). Don’t set error state or show a user-facing error for abort; it’s an expected outcome of cleanup.

3. **Forgetting to pass signal:** If you create a controller but don’t pass `signal` to fetch (or to your API wrapper), calling `controller.abort()` doesn’t cancel the request; the promise still resolves/rejects when the server responds. The API must accept and use the signal.

4. **Aborting after unmount only:** You must abort (or ignore) when **deps change** as well, not only on unmount. So cleanup must run when the effect is re-run (new query), not only when the component unmounts. Returning a cleanup that aborts (or sets cancelled) does both.

5. **setState in .finally without checking aborted:** If you do `setLoading(false)` in .finally without checking `signal.aborted`, the aborted request’s finally can run and clear loading while the new run is in progress. Check aborted (or cancelled) before updating state in finally.

### Trade-offs and when manual cancellation becomes unmanageable

- **Manual AbortController per effect:** Full control; works with any fetch/API that supports signal. Cost: you must create controller, pass signal, handle AbortError, and clean up in every place that fetches. Easy to forget one step.

- **Ignore response (cancelled flag):** Works with any API; no need for signal support. Cost: request still runs to completion (server/network still do work). Good fallback when API doesn’t support abort.

- **React Query (or similar):** Library handles cancellation (or ignoring outdated queries), loading/error, and cache. You give up fine-grained control over exactly when a request is aborted in exchange for less code and fewer bugs. For server state (search, filters, pagination), prefer a data library; use manual AbortController when the library doesn’t apply (e.g. one-off fetch in a small component).

- **When it becomes unmanageable:** Many endpoints, many components, or complex flows (retries, dedupe, cache). Then centralize in a hook or move to React Query (or similar).

Summary: the demo correctly shows where (effect cleanup) and how (AbortController + signal, or ignore response) to handle request cancellation, contrasts abort vs ignore, and explains how cleanup prevents memory leaks. LEARNING-GUIDE and PR-REVIEW cover alternatives and common mistakes.
