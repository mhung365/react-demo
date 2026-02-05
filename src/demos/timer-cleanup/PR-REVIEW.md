# Senior React PR review: Timer cleanup demo

## What was implemented

- **PollingNoCleanupBroken:** setInterval every 2s to poll (fetchPollResult, setResult, setRefreshCount). No cleanup. Interval callback logs `refreshCountFromClosure: refreshCount` — refreshCount is from closure (stale, e.g. 0). When user switches demo tab (unmount) and back (remount), a second interval starts → stacking. Console: multiple `[interval] tick` per 2s; setState-after-unmount warning.
- **PollingWithCleanupCorrect:** clearInterval(id) in effect cleanup. refreshCountRef.current = refreshCount so callback reads latest value from ref. No stacking; no setState after unmount; log shows refreshCountFromRef with current value.
- **AlternativeNoInterval:** Recursive setTimeout: after each fetch, schedule next with setTimeout. Only one timeout pending. Cleanup sets cancelled = true and clearTimeout(timeoutId). Callback checks cancelled before setState and before scheduleNext. No setInterval; no stacking by design.
- **intervalLog.ts:** logIntervalStart, logIntervalTick, logIntervalCleanup so stacking and cleanup are visible.

---

## PR review (Senior lens)

### What's good

- **Stacking is visible:** Switching tabs and back causes remount; broken version gets two intervals; console shows two ticks per 2s. Clear demonstration.
- **Stale closure is explicit:** Broken callback logs refreshCount from closure (always 0 or initial). Correct version logs refreshCountFromRef (current). Good for teaching.
- **Cleanup is correct:** Correct version stores id and returns () => clearInterval(id). Alternative stores timeoutId and clears it in cleanup and uses cancelled so the callback won't schedule again.
- **Alternative design:** Recursive setTimeout is a valid pattern (one timer at a time); LEARNING-GUIDE and PR-REVIEW mention React Query refetchInterval as the preferred alternative for polling server data.

### Things to watch

- **PollingNoCleanupBroken:** We intentionally omit refreshCount from the effect deps so the interval doesn't restart when refreshCount changes (and so the callback keeps seeing stale refreshCount). The comment explains that. No change needed.
- **AlternativeNoInterval:** We clear the timeout in cleanup so the pending callback won't run. We also set cancelled so that if the callback had already been scheduled and runs after cleanup, it won't setState or call scheduleNext. Both are correct.
- **Recursive setTimeout and cleanup:** We must clear the timeout in cleanup; otherwise the last scheduled timeout can still fire after unmount. We do clearTimeout(timeoutId). Good.

### Common misconceptions about timers in React

1. **"setInterval runs once per mount."** No. setInterval runs repeatedly until cleared. If you don't clear it in cleanup, it keeps running after unmount and when you remount you start another one → stacking.
2. **"The callback sees the latest state."** No. The callback closes over the state from when the effect ran. Use a ref (ref.current = value; callback reads ref.current) if you need the latest value inside the callback.
3. **"Functional update (setState(c => c + 1)) fixes stale closure."** It fixes the **update** (we don't need the latest state to compute the next state). It doesn't fix **reading** state inside the callback for logic or logging — that still sees the stale value. Use a ref for reading.
4. **"I only need to clear on unmount."** You must clear whenever the effect is "torn down" — that includes when deps change (effect re-runs, cleanup runs first). So cleanup runs on unmount and when deps change. Always clear in the effect's return.
5. **"Recursive setTimeout is the same as setInterval."** Recursive setTimeout schedules the next run **after** the async work completes. setInterval runs on a fixed period regardless of how long the async work takes. For polling, recursive setTimeout can avoid overlapping requests (next poll only after the previous one finishes). Both need cleanup.

### Trade-offs and when timers should be avoided

- **setInterval + cleanup:** Simple; fixed period. You must clear on cleanup and use a ref if the callback needs latest state. Risk: forgetting cleanup → stacking and setState after unmount.
- **Recursive setTimeout:** One timer at a time; next run only after previous completes. Good when the "tick" is async (e.g. fetch). You must clear the timeout and guard with cancelled. Slightly more code than setInterval.
- **React Query refetchInterval:** No manual timer; library handles cleanup and refetch. Prefer for polling server state. Use manual timers when you're not fetching (e.g. countdown, UI animation) or when you need custom logic the library doesn't support.
- **When to avoid timers:** Prefer WebSocket/SSE for real-time updates. Prefer React Query (or similar) for polling. Use timers only when you need a client-side repeat (countdown, heartbeat, fallback polling).

Summary: the demo correctly shows missing cleanup (stacking, setState after unmount) and stale closure (callback reads stale refreshCount), the correct fix (cleanup + ref), and an alternative (recursive setTimeout). LEARNING-GUIDE and PR-REVIEW explain misconceptions and trade-offs.
