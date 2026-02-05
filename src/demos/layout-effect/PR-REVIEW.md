# Senior PR Review: useEffect vs useLayoutEffect demo

## What's good

- **Exact timing with logs:** useEffectVsLayoutTiming logs "useLayoutEffect — BEFORE PAINT", then requestAnimationFrame ("paint"), then "useEffect — AFTER PAINT". Makes the order visible: useLayoutEffect blocks; useEffect doesn't.
- **Visual bug and fix side-by-side:** Same tooltip UI; bug = measure + setState in useEffect (first paint wrong, second paint correct → flicker); fix = measure + setState in useLayoutEffect (one paint with correct position). Clear cause and fix.
- **Bad useLayoutEffect case:** Simulated fetch (setTimeout 300ms) in useLayoutEffect blocks first paint; we show "Paint was blocked for: 300ms". Demonstrates that useLayoutEffect for non-layout work is a bad idea — use useEffect.
- **Concepts:** "useLayoutEffect blocks painting", "use it for measure/DOM so first paint is correct", "useEffect for fetch/subscribe" are stated. Trade-off (block paint vs don't block) is explicit.

---

## Common misuse of useLayoutEffect (and how this demo addresses them)

### 1. Using useLayoutEffect for fetch or subscriptions

**Misuse:** Putting fetch, subscribe, or any async/non-layout work in useLayoutEffect. It runs synchronously and blocks the browser from painting. Until the effect (and any sync state updates it triggers) complete, the user sees a blank or stale frame. Result: janky first paint.

**Demo:** BadUseLayoutEffect simulates a 300ms "fetch" in useLayoutEffect. First paint is delayed by that time. Use useEffect for fetch/subscribe so paint isn't blocked.

### 2. Using useLayoutEffect "to run before useEffect"

**Misuse:** "I want this to run first, so I'll use useLayoutEffect." useLayoutEffect runs before paint; useEffect runs after. The reason to use useLayoutEffect is not "first" in an abstract sense — it's "I need to read layout or mutate DOM so the first paint is correct." If you don't need that, use useEffect and don't block paint.

**Demo:** Timing order shows useLayoutEffect before useEffect, but the demo stresses: use useLayoutEffect only when you need to block paint for a good reason (measure, position). Otherwise useEffect.

### 3. Using useLayoutEffect for logging or one-off setup that doesn't touch layout

**Misuse:** Logging, analytics, or one-off setup that doesn't read getBoundingClientRect or mutate DOM. useLayoutEffect blocks paint; there's no benefit and it can hurt perceived performance. Use useEffect.

**Demo:** Concepts and BadUseLayoutEffect state: use useEffect for "non-visual" side effects so you don't block painting.

### 4. Doing heavy work in useLayoutEffect

**Misuse:** Even when you need to measure or mutate DOM, doing a lot of work (e.g. complex computation, many DOM reads) in useLayoutEffect keeps the main thread busy and delays paint. Keep useLayoutEffect as small as possible: read layout, set state (or mutate DOM); defer heavy logic to useEffect or other work.

**Demo:** BadUseLayoutEffect illustrates "slow work in useLayoutEffect = delayed paint." The same applies to heavy computation in a "correct" useLayoutEffect — keep it minimal.

### 5. Using useEffect when you need to fix a visible flicker

**Misuse:** Measuring and setting position (or similar) in useEffect. First paint shows wrong layout; effect runs after paint; setState; second paint shows correct layout → user sees a jump or flicker. The fix is useLayoutEffect so the measure + setState happen before the first paint.

**Demo:** PositionFlickerBug (useEffect) shows the flicker; PositionFlickerFixed (useLayoutEffect) shows no flicker. Same UI; only the hook and timing differ.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useLayoutEffect for tooltip position | No flicker; first paint correct | Blocks paint until measure + setState complete; keep it fast |
| useEffect for fetch/subscribe | Doesn't block paint; better perceived performance | N/A for layout; useLayoutEffect would block |
| Logging timing with rAF | Approximate "paint" in console | rAF is "before next repaint," not exact; good enough for teaching |
| Simulated 300ms "fetch" in BadUseLayoutEffect | Clearly shows blocked paint | Real fetch is async; the block here is the 300ms delay; message is the same |

---

## When to avoid useLayoutEffect

- **Fetch, subscriptions, logging:** Use useEffect. They don't need to run before paint; blocking paint hurts UX.
- **Heavy computation:** Don't do it in useLayoutEffect. Do minimal work (read layout, set state); do heavy work in useEffect or in a separate pass.
- **When you're not reading layout or mutating DOM for the first frame:** If the side effect doesn't need to change what the user sees in the first paint, use useEffect. Default to useEffect; use useLayoutEffect only when you have a concrete reason (measure, position, scroll, or DOM mutation that must be visible immediately).
- **SSR:** useLayoutEffect does not run on the server. If you have code that runs in useLayoutEffect and also on the server, you'll need a guard or use useEffect. This demo is client-only; the point is timing and when to use which.

**Rule of thumb:** useLayoutEffect = "I need to read layout (getBoundingClientRect, scroll) or mutate DOM so the user never sees a wrong frame." useEffect = "I need to run a side effect that doesn't need to block the first paint (fetch, subscribe, log)." When in doubt, use useEffect; switch to useLayoutEffect only when you've identified a flicker or wrong-first-frame issue that measuring/mutating before paint fixes.

---

## How this can fail or confuse at scale

1. **Many useLayoutEffects:** If several components use useLayoutEffect and each does a bit of work, the combined time can delay first paint. Prefer a single place that measures and positions (e.g. a single tooltip manager) rather than many components each doing useLayoutEffect.
2. **setState in useLayoutEffect causing sync re-render:** When you setState in useLayoutEffect, React flushes that update synchronously (before paint). That's correct for the tooltip case, but if the state update triggers a large re-render tree, the main thread is busy longer and paint is delayed. Keep the state you set in useLayoutEffect minimal (e.g. just position).
3. **Measuring before DOM is ready:** If the ref (trigger) isn't attached yet or the element has zero size, getBoundingClientRect may be wrong. The demo assumes the trigger is in the DOM when visible becomes true; in real code you might need to guard or use a different strategy (e.g. ResizeObserver).
4. **Server rendering:** useLayoutEffect doesn't run on the server. If you use it for something that must also run on the server, you need useEffect or a check for typeof window. This demo is client-only.

**Rule of thumb:** useLayoutEffect is a sharp tool — use it only when the first paint must show the correct layout (measure + position). For everything else, useEffect.
