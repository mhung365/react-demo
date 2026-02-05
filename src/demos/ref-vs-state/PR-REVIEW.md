# Senior PR Review: useRef vs useState demo

## What's good

- **Clear contrast:** CounterWithState vs CounterWithRef side-by-side with the same "increment" idea; one uses state (re-render), one uses ref (no re-render). Render count and console logs make the difference obvious.
- **Explicit render counters and logs:** useRenderCount uses a ref so incrementing it in render doesn't cause a loop; every component that uses it logs `[render]` when the component function runs. State path re-renders on each increment; ref path does not until "Force re-render."
- **Correct vs wrong scenarios:** CorrectRefUsage (interval ID in ref for cleanup) and WrongRefUsage (count in ref, displayed in UI) are clearly separated. Correct use is "persist value, don't drive UI"; wrong use is "data that should be shown stored in ref."
- **Concepts section:** Explains that useState participates in the render cycle (setState → schedule re-render → new snapshot → UI update) and useRef does not (ref.current = x → no schedule → no new snapshot → UI unchanged).
- **Force re-render in CounterWithRef:** Shows that ref value is updated (we can read it) but the component didn't run again until we triggered a re-render with setState. Demonstrates "ref mutations do not create a new render snapshot."

---

## Common junior/mid-level misuse of useRef (and how this demo addresses them)

### 1. "I'll use a ref to avoid re-renders" for data that must be shown

**Misuse:** Putting form value, count, or any user-visible data in a ref to "optimize." The value updates but the UI does not, because ref mutation does not trigger re-render.

**Demo:** WrongRefUsage stores count in a ref and displays it. Click Increment — number does not change. The rule: if the UI must update when the value changes, use state.

### 2. "Ref and state are the same, just ref doesn't re-render"

**Misuse:** Treating ref as "state without re-render" and using it for any persistent value. Ref is for values that must persist across renders but should *not* drive the UI (e.g. interval ID, DOM node, previous value for comparison). Using ref for UI-driving data is a bug.

**Demo:** CounterWithRef shows ref persisting across renders; CorrectRefUsage shows ref used for something that must persist (interval ID) but not drive UI; WrongRefUsage shows ref used for UI-driving data → bug.

### 3. Storing interval/timeout IDs in state

**Misuse:** `const [intervalId, setIntervalId] = useState(null)` and `setIntervalId(setInterval(...))`. This causes an extra re-render when you set the ID, and you don't need the ID in the UI. The ID is for cleanup only.

**Demo:** CorrectRefUsage stores the interval ID in a ref. No re-render when we set it; we clear it in useEffect cleanup. Correct.

### 4. Using ref to "fix" stale closure without understanding

**Misuse:** "My callback sees old state, so I'll put the value in a ref and read ref.current." Sometimes correct (e.g. "latest" value in an imperative callback), but often the right fix is functional update or correct deps. Refs add a second source of truth; use deliberately.

**Demo:** This demo doesn't cover stale closure; the render-snapshot demo does. Here we only establish: ref doesn't trigger re-render. Don't replace state with ref just to avoid re-renders when the value must be shown.

### 5. useRenderCount implemented with state (infinite loop)

**Misuse:** `const [renderCount, setRenderCount] = useState(0); setRenderCount(c => c + 1)` in render would schedule a re-render → component runs again → setRenderCount again → infinite loop. Render count must be updated without triggering re-render.

**Demo:** useRenderCount uses a ref: `countRef.current += 1` in render. Ref mutation does not schedule re-render, so we safely count renders without looping.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useRenderCount uses ref | Safe to increment in render without re-render loop; clear proof that ref doesn't trigger re-render | Logs on every render; in production you'd gate or remove |
| CounterWithRef has "Force re-render" | Makes it obvious that ref value was updated but component didn't run until we forced it | Slightly artificial; in real code you wouldn't "force re-render" to see a ref |
| Two cards (State vs Ref) on one tab | Direct comparison | More UI; could be separate tabs |
| CorrectRefUsage: timer with interval | Canonical "interval ID in ref" pattern | Timer runs forever until unmount; no pause button |

---

## When NOT to replace state with refs

- **Data that must be shown to the user.** If the value appears in the UI and should update when it changes, use state. Ref mutation does not trigger re-render; the UI will stay stale.
- **Data that affects the component's output.** If the value is used to decide what to render (e.g. conditional, list length), it must trigger a re-render when it changes — use state (or props).
- **Form inputs (controlled).** The input value should be state so React re-renders and the input reflects the value. Using a ref and reading ref.current only on submit is the uncontrolled pattern; use deliberately, not to "avoid re-renders."
- **Derived data that depends on state.** If you need to recompute when state changes, use state + useMemo or derive during render. Storing in ref and updating in effect creates two sources of truth and easy bugs.
- **When you're "optimizing" without measuring.** Replacing state with ref to reduce re-renders often introduces bugs (stale UI) or complexity (syncing ref and state). Profile first; use ref only when you need "persist across renders, don't drive UI" or "imperative handle."

**Rule of thumb:** Default to state for anything that should be shown or that affects output. Use ref for: (1) imperative handles (DOM node, interval ID, subscription), (2) "previous value" or "latest value" for comparison/callbacks where you explicitly don't want to trigger re-render, (3) observability (e.g. render count). Don't use ref as a drop-in replacement for state to avoid re-renders when the value is user-visible.

---

## How this can fail or confuse at scale

1. **Ref and state both holding "the same" value:** If you store something in a ref and also in state (e.g. to "fix" stale closure), you must keep them in sync. Forgetting to update one path causes subtle bugs. Prefer a single source of truth (state) and functional updates or correct deps.
2. **Overuse of ref for "performance":** Every counter, form field, or list item moved to ref to "avoid re-renders" → UI doesn't update, or you end up with "force update" hacks. Re-renders are normal; optimize only when measured.
3. **Ref in dependency arrays:** ref.current in a useEffect dependency array doesn't work as intended — changing ref.current doesn't trigger the effect. Ref is not reactive. Use state (or a key) when you need "run effect when value changes."
4. **Testing:** Components that rely on ref mutation without re-render are harder to test — you don't see updates until something else causes a re-render. Prefer state for testability when the value is part of the contract.

**Rule of thumb:** When in doubt, use state. Use ref when you have a clear reason: imperative handle, persist without driving UI, or observability. Document why a ref is used so future readers (and you) don't "fix" it by converting to state and breaking the intended behavior.
