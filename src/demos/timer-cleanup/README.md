# Timer cleanup in React

## What this demo covers

- **Broken:** setInterval for polling with no cleanup. When you switch to another demo tab and back, the old interval keeps running and a new one starts → intervals stack (multiple `[interval] tick` logs per 2s). setState after unmount causes a warning. The interval callback captures `refreshCount` from closure → log shows stale value (e.g. 0 every tick).
- **Correct:** clearInterval in effect cleanup. Use a ref (`refreshCountRef.current`) in the callback to read the latest value; no stale closure. Switch tabs and back: only one interval; no setState after unmount.
- **Alternative:** No setInterval. Use recursive setTimeout: after each fetch, schedule the next with setTimeout. Only one timer is pending at a time; cleanup clears the timeout and sets a cancelled flag. Or use React Query's refetchInterval.

## How to run

1. Run the app and open **Timer cleanup** from the nav.
2. Open DevTools → Console to see `[interval] start` / `[interval] tick` / `[interval] cleanup`.
3. **Broken:** Enable polling, then switch to another demo (e.g. Re-render basics) and back. You'll see multiple ticks per 2s (stacking) and "refreshCount from closure: 0" (stale). Check for "Can't perform a React state update on an unmounted component" warning.
4. **Correct:** Same flow; only one interval; cleanup log when you switch away; ref shows latest value in tick.
5. **Alternative:** Same UX; recursive setTimeout; one timer at a time.

## Files

| File | Purpose |
|------|--------|
| `PollingNoCleanupBroken.tsx` | setInterval, no cleanup; stale closure in callback. |
| `PollingWithCleanupCorrect.tsx` | clearInterval in cleanup; ref for latest value. |
| `AlternativeNoInterval.tsx` | Recursive setTimeout; cancelled flag + clearTimeout in cleanup. |
| `intervalLog.ts` | Log start/tick/cleanup so stacking is visible. |
