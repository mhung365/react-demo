# Senior React PR review: Effect race conditions demo

## What was implemented

- **RaceCorrectDepsBroken:** Search-as-you-type with correct deps `[query]`, no cancellation or guard. Request sequence logged with `[request] start #N` / `end #N`. Variable delay (shorter query = faster) so typing "a" → "ab" → "abc" often causes an older response to arrive last and overwrite state. Demonstrates that correct dependencies do not prevent race conditions.
- **FixAbortController:** AbortController in effect; signal passed to fetchSearch; cleanup calls controller.abort(). Older requests reject with AbortError and log end #N (aborted). Only latest request can complete.
- **FixRequestIdGuard:** requestIdRef.current incremented at start of effect; myId captured; in .then we if (myId !== requestIdRef.current) return. Older responses log end #N (ignored). Request still runs to completion.
- **FixIgnoreStale:** Cancelled flag set in cleanup; in .then we only setState if !cancelled. Older responses log end #N (ignored). Same outcome as request-id; no ID.
- **requestLog.ts:** logRequestStart(seq, query), logRequestEnd(seq, query, outcome, detail) so console shows request order vs response order clearly.

---

## PR review (Senior lens)

### What's good

- **Correct deps are explicit:** The broken example uses `[query]` and the copy states that dependencies are correct. That makes it clear the bug is not "wrong deps" but "overlapping requests + out-of-order responses."
- **Request vs response order is visible:** Sequence numbers (#1, #2) and logs make it obvious when "end #1" happens after "end #2" (stale overwrite). Good for teaching and debugging.
- **Three fixes with comparison:** AbortController vs request-id vs ignore-stale are all implemented; LEARNING-GUIDE and PR-REVIEW compare them and list limitations. That answers "which approach when."
- **Variable delay in mock:** Shorter query = faster response so the race is easy to trigger (type "a", "ab", "abc" quickly). Reproducible.

### Things to watch

- **FixRequestIdGuard cleanup:** The effect returns `() => {}` (no cleanup that changes requestIdRef). The "current" ID is implicitly "the latest run's id" because each run does requestIdRef.current += 1 and captures myId. So when response #1 arrives, myId is 1 and requestIdRef.current might already be 2 → we ignore. Correct. No need to set requestIdRef in cleanup.
- **FixIgnoreStale:** We use both seqRef (for logging) and cancelled (for guard). The cancelled flag is the one that prevents setState; seq is only for logRequestEnd. Good.

### Common misconceptions

1. **"If my dependency array is correct, I won't have race conditions."** Wrong. Correct deps mean "we start the right request when deps change." They don't cancel or ignore the previous request. Overlapping requests + out-of-order responses = race. You must mitigate (abort, request-id, or ignore).
2. **"AbortController and ignore-stale are the same."** No. AbortController cancels the request (fetch throws, server may stop). Ignore-stale (and request-id) let the request complete and only discard the result when it arrives. Same UX (no stale overwrite); different network behavior.
3. **"Request ID is overkill; cancelled flag is enough."** For a single in-flight request per effect, they're equivalent in outcome. Request-id is useful when you need to know "which run is current" for more complex flows (e.g. multiple keys or operations). For simple "latest query wins," cancelled flag is simpler.
4. **"I only need to guard setState in .then."** You should also avoid setState in .catch for aborted/ignored runs (e.g. don't set error for AbortError), and in .finally only update loading when the response wasn't ignored/aborted (e.g. if (!cancelled) setLoading(false) or if (myId === requestIdRef.current) setLoading(false)).

### Trade-offs

- **AbortController:** Best when API supports signal. You get real cancellation. Limitation: not all APIs do; you must handle AbortError.
- **Request-id / ignore-stale:** Work with any API; no cancellation. Trade-off: previous requests still run to completion (server/network load). Use when API doesn't support abort or when you want to keep requests in flight (e.g. for caching).
- **React Query:** Handles cancellation or "ignore outdated" for you. Prefer it for server state; use manual abort/guard when the library doesn't apply.

Summary: the demo correctly shows that correct dependencies do not prevent race conditions (overlapping requests, response order ≠ request order), and compares three mitigations (AbortController, request-id, ignore-stale) with clear logs and documented limitations.
