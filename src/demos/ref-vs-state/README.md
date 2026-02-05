# useRef vs useState: re-render

This demo teaches **why useRef does not trigger a re-render, while useState does**, and when to use each.

## What you'll see

- **State vs Ref (tab 1):**
  - **CounterWithState** — Count in state; each click → setState → re-render → render # and count both increase. Console shows `[render]` on each click.
  - **CounterWithRef** — Count in ref; each click "Increment (ref)" → ref.current++ → no re-render → displayed value does not change. Click "Force re-render" → setState → re-render → UI shows the ref value. Ref mutation did not create a new render snapshot.
- **Correct: ref (interval ID)** — Timer runs every second; state drives the displayed seconds. Interval ID is stored in a ref so we can clear it in useEffect cleanup. Ref does not drive UI; correct use.
- **Bug: ref as state** — Count stored in ref and displayed. Click "Increment" → only ref.current++ → no re-render → UI stays stale. Wrong use.

## How to run

1. Start the app and open the **"useRef vs useState"** demo.
2. Open DevTools → Console.
3. **State vs Ref:** Click "Increment" in the state card — render # and count both go up. Click "Increment (ref)" in the ref card — nothing changes; then "Force re-render" — value jumps. Check console for `[render]` and `[ref]` logs.
4. **Correct ref:** Watch the timer; interval ID lives in a ref; state drives UI.
5. **Bug:** Click "Increment" — the displayed count does not update.

## Concepts

| Term | Meaning |
|------|--------|
| **useState** | setState() tells React state changed → React schedules a re-render → component runs again with new state → new render snapshot → UI updates. |
| **useRef** | A mutable box that persists across renders. Mutating ref.current does NOT tell React to re-render → no new render snapshot → UI does not update. |
| **Correct ref** | Store something you need across renders or in callbacks (interval ID, DOM node, previous value) that should NOT trigger a re-render when it changes. |
| **Wrong ref** | Storing data that must be shown to the user in a ref → UI does not update when the value changes. Use state instead. |

## Files

- `RefVsStateDemo.tsx` — Shell and tabs (State vs Ref / Correct ref / Bug).
- `CounterWithState.tsx` — useState counter; each setState → re-render.
- `CounterWithRef.tsx` — ref "counter"; ref mutation does not re-render; "Force re-render" to see ref value.
- `CorrectRefUsage.tsx` — Interval ID in ref for cleanup; state drives timer display.
- `WrongRefUsage.tsx` — Count in ref and displayed; bug: UI does not update.
- `useRenderCount.ts` — Logs each render and returns render count (uses ref so it doesn't trigger re-render).
