# useEffect: when it runs, when cleanup runs

This demo teaches the **full render → commit → effect lifecycle** and **when cleanup runs** (on re-render / dependency change / unmount).

## What you'll see

- **Order:** Minimal component with effect depending on `[count]`. Console shows exact order: `1. render` → `2. commit (DOM updated)` → `3. effect ran`. Click Increment: `1. render` → `2b. layout cleanup` → `2. commit` → `3b. effect cleanup` → `3. effect ran`.
- **Correct effect + cleanup:** Subscription to a "channel"; effect subscribes, cleanup unsubscribes. When you switch channel: cleanup runs first (unsubscribe from old), then effect runs (subscribe to new). No double subscription.
- **Broken (no cleanup):** Same subscription but effect does not return cleanup. When you switch channel: effect runs again and subscribes again without unsubscribing — double subscription / leak. Console shows "subscribed" without "unsubscribed" first.
- **Unmount cleanup:** Toggle that mounts/unmounts a child. When you unmount the child: effect cleanup (and layout cleanup) runs; no new "effect ran" after.

## How to run

1. Start the app and open the **"useEffect lifecycle"** demo.
2. Open DevTools → Console.
3. **Order:** Click "Increment" and watch the log order: render → commit → effect; on each click after: cleanup → effect.
4. **Correct:** Switch "Channel A" / "Channel B"; see unsubscribed → subscribed. Listener count stays correct.
5. **Broken:** Switch channels; see "subscribed" again without "unsubscribed"; listener count grows (leak).
6. **Unmount:** Click "Unmount child"; see effect cleanup for the child; click "Mount child" to mount again.

## Concepts

| When | What happens |
|------|--------------|
| **useEffect runs** | After React commits to the DOM and the browser has painted. Order: render (component function) → commit (DOM updated) → useLayoutEffect → paint → useEffect. |
| **Cleanup on re-render / dep change** | Before the *next* run of the same effect. React runs the previous effect's cleanup, then (if deps changed) the new effect. |
| **Cleanup on unmount** | When the component is removed from the tree, React runs the effect cleanup (and layout cleanup). No new effect runs after. |
| **Bug: no cleanup** | If effect subscribes (or sets up something) but doesn't return a cleanup that unsubscribes, when deps change you run the effect again and add a second subscription — double subscription / leak. |

## Files

- `EffectLifecycleDemo.tsx` — Shell and tabs (Order / Correct / Broken / Unmount).
- `useLifecycleLog.ts` — Logs render, commit (useLayoutEffect), effect, and both cleanups with a consistent label.
- `EffectOrderDemo.tsx` — Minimal order demo: effect depends on `[count]`; click to see cleanup → effect.
- `CorrectEffect.tsx` — Subscription with proper cleanup; dep change → cleanup then effect.
- `BrokenEffect.tsx` — Subscription without cleanup; dep change → effect runs again → double subscription.
- `UnmountDemo.tsx` — Toggle mount; unmount shows cleanup.
- `createSubscription.ts` — Simulated channel (subscribe/unsubscribe) for correct vs broken examples.
