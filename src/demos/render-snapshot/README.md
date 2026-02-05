# Render snapshot & closures

This demo teaches **value equality vs reference equality** in React and how they interact with the **render snapshot model**.

## What you’ll see

- **Broken**: “Increment in 1.5s” uses `count` from the render when the button was clicked. Click 3 times quickly → count becomes 1, not 3. Console logs show which render each value came from and that the closure is stale.
- **Fixed**: Same UI, but the delayed handler uses `setCount(c => c + 1)`. No closure over `count`. Click 3 times quickly → count becomes 3.

## How to run

1. Start the app and open the **“Render snapshot & closures”** demo.
2. Open DevTools → Console.
3. Use the **Broken** tab: click “Increment in 1.5s” several times quickly. Watch `[snapshot]`, `[broken]` logs: handler created in render #N with snapshot count; when timeout runs, “current count” may be higher → stale closure.
4. Switch to **Fixed**: same clicks → count increments correctly. Logs show we use a functional update, so no stale closure.

## Concepts

| Term | Meaning |
|------|--------|
| **Render snapshot** | Each run of the component function sees one immutable view of props and state for that render. |
| **Closure** | A function created during a render keeps the variable values from that render (closure over that snapshot). |
| **Value vs reference** | The *value* (e.g. `count = 0`) was correct for that snapshot. The *reference* (what the closure holds) is stale when we meant “current” at execution time. |
| **Functional update** | `setState(updater)` with `updater(prev => next)` — React passes latest state when the updater runs, so you don’t rely on a closure over state. |

## Files

- `SnapshotDemo.tsx` — Shell and tabs (Broken / Fixed).
- `CounterBroken.tsx` — Stale closure: delayed handler closes over `count`.
- `CounterFixed.tsx` — Same flow with `setCount(c => c + 1)`.
- `useSnapshotLog.ts` — Logs current render snapshot and optional “latest” ref for comparison.
