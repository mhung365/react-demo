# Senior PR Review: Expensive Child + Reference Equality Demo

## What’s good

- **Broken vs fixed side-by-side:** Inline props (broken) vs `useMemo`/`useCallback` (fixed) makes the cause and fix obvious.
- **Explicit value vs reference logs:** `usePropReferenceLog` logs "value equal" (look the same) and "reference equal" (===) so you see why memo fails with inline props.
- **Expensive child is actually expensive:** Simulated work (loop) makes re-render cost visible; memo’s benefit is measurable.
- **Single memoized child:** Same `ExpensiveChild` used in both parents; only the parent’s prop strategy changes.

---

## Common junior mistakes (and how this demo addresses them)

### 1. “Props didn’t change, so the child shouldn’t re-render”

**Mistake:** Assuming “props didn’t change” means “same values.” React doesn’t do deep compare. For objects/functions, **reference** is what matters for `memo` (and for dependency arrays). Inline `{}` or `() => {}` create new refs every render.

**Demo:** Broken parent passes `config={{ theme: 'dark', pageSize: 10 }}`. Values are the same every time; references are not. Console shows `value equal: true`, `reference equal: false` → child re-renders.

### 2. Wrapping in `memo` but still passing inline object/function

**Mistake:** “I added memo but the child still re-renders.” Memo uses shallow compare: `prevProps.config === nextProps.config`. Inline object → new ref every time → compare fails.

**Demo:** `ExpensiveChild` is memoized. With broken parent it re-runs every time; with fixed parent (stable refs) it skips when only parent state (e.g. count) changes.

### 3. Overusing `useMemo`/`useCallback` everywhere

**Mistake:** Wrapping every object/function in `useMemo`/`useCallback` “for performance.” Adds mental and runtime cost (comparison, dependency arrays). Use only when you have an expensive child (or measured problem) and you’re stabilizing props for memo.

**Demo:** We use them here to **teach** the fix. In a real app you’d add them only after profiling.

### 4. “Same value” vs “same reference” confusion

**Mistake:** Thinking two objects with the same keys/values are “the same” for React. For memo and for `useEffect`/`useMemo` deps, React uses `Object.is` (reference for objects/functions).

**Demo:** Console explicitly logs value equal (e.g. JSON) vs reference equal (===).

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| `usePropReferenceLog` stores prev props in ref + effect | Clear value vs ref comparison | Extra work per render; dev-only in practice |
| Simulated expensive work (loop) | Makes memo benefit visible | Not representative of real app cost |
| Two parents (Broken / Fixed) | Clear before/after | More components to maintain |

---

## When NOT to apply memoization

- **No measured performance issue.** Don’t memoize “just in case.”
- **Child is cheap.** Re-running a tiny component is negligible; memo and stable refs add overhead.
- **Props change every time anyway.** If config/onSubmit truly depend on changing state, stable refs may be wrong (stale closure) or impossible; memo won’t skip often.
- **Shallow compare is wrong for your data.** If you need deep equality, memo’s default compare is insufficient; custom compare has its own cost.

Use React DevTools Profiler to find components that actually take time; then consider memo + stable props for those.

---

## How this optimization can become overkill or harmful at scale

1. **Memo everywhere:** Every component wrapped in memo, every prop wrapped in useMemo/useCallback. Result: more code, dependency arrays to maintain, and comparison cost on every parent re-render. Marginal gains or net loss.

2. **Stale closures:** useCallback with [] deps captures initial state. If the callback needs latest state, you must add deps → new ref when deps change → memo skips less. Over-optimization can force either staleness or lost memo benefit.

3. **Prop drilling + stable refs:** Passing stable config down many layers means either context or drilling the same ref. Context changes trigger all consumers; drilling stable refs is fine but adds boilerplate. At scale, balance “few re-renders” with “simple data flow.”

4. **Wrong granularity:** Memoizing a huge list’s root but not list items often doesn’t help; memoizing each item (with stable props) can. Over-optimization at the wrong level wastes effort.

**Rule of thumb:** Profile first. Add memo + useMemo/useCallback only on the path that’s slow and where props can be kept referentially stable.
