# useEffect vs useLayoutEffect

This demo teaches the **exact timing difference** (before paint vs after paint) and **when to use useLayoutEffect** (measure DOM, position tooltips) vs **when to avoid it** (fetch, subscribe — blocks paint).

## What you'll see

- **Timing order:** Open console. Log order: useLayoutEffect (before paint) → requestAnimationFrame (paint) → useEffect (after paint). useLayoutEffect runs synchronously and blocks painting.
- **useEffect flicker:** Click "Show tooltip" — tooltip may appear at top-left then jump below the button. useEffect runs after paint, so first paint shows wrong position; then measure + setState → second paint → flicker.
- **useLayoutEffect fix:** Same tooltip; position is measured in useLayoutEffect. Click "Show tooltip" — tooltip appears below the button with no jump. useLayoutEffect runs before paint; React flushes the state update; browser paints once with correct layout.
- **Bad useLayoutEffect:** We simulate a "fetch" (setTimeout 300ms) inside useLayoutEffect. First paint is delayed until the timeout completes — janky. For fetch/subscribe, use useEffect so you don't block paint.

## How to run

1. Start the app and open **"useEffect vs useLayoutEffect"**.
2. Open DevTools → Console.
3. **Timing:** Switch to "Timing order" — see useLayoutEffect → rAF → useEffect in console.
4. **Flicker (useEffect):** "useEffect flicker" → Show tooltip — observe jump/flicker.
5. **Fixed (useLayoutEffect):** "useLayoutEffect fix" → Show tooltip — no jump.
6. **Bad:** "Bad useLayoutEffect" — first paint delayed; "Paint was blocked for: 300ms".

## Concepts

| Hook | When it runs | Blocks paint? | Use for |
|------|---------------|---------------|--------|
| **useLayoutEffect** | After commit, **before** paint. Synchronous. | Yes. | Measure DOM (getBoundingClientRect), scroll, or DOM mutations that must be visible in the first paint (e.g. position tooltip). |
| **useEffect** | After paint. Async. | No. | Fetch, subscriptions, logging — any side effect that doesn't need to change the first frame. |

**Visual bug:** If you measure and set state in useEffect, the first paint shows wrong layout; then effect runs, setState, second paint shows correct layout → flicker. Do measure + setState in useLayoutEffect so the first paint is correct.

**Performance:** useLayoutEffect blocks the browser from painting. Keep it fast. Don't use it for fetch or heavy work — use useEffect.

## Files

- `LayoutEffectDemo.tsx` — Shell and tabs.
- `useEffectVsLayoutTiming.ts` — Logs useLayoutEffect (before paint), rAF (paint), useEffect (after paint).
- `PositionFlickerBug.tsx` — Tooltip positioned in useEffect → flicker.
- `PositionFlickerFixed.tsx` — Tooltip positioned in useLayoutEffect → no flicker.
- `BadUseLayoutEffect.tsx` — Simulated fetch in useLayoutEffect → blocks paint; bad.
- `TimingOrderDemo.tsx` — Minimal timing order demo.
