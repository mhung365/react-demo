# Senior PR Review: Context and Re-renders Demo

## What’s good

- **Three variants tell a clear story:** Unstable value (new object every render → all consumers re-render) → Memo no help (memo(ThemeDisplay) still re-renders when context value identity changes) → Refactored (split CountContext, ThemeContext → ThemeDisplay doesn’t re-render on increment). Each variant demonstrates a concrete behavior.
- **Explicit render logs:** useRenderLog in Provider and every consumer so one click shows exactly who re-renders. Proves that ThemeDisplay (memo, only needs theme) re-renders on increment in “Memo no help” and does not in “Refactored.”
- **Concepts block explains propagation:** Provider value change (by reference) → React re-renders all consumers; object identity; memo doesn’t help; refactor (split, memo value).

---

## Common misconceptions about Context and memoization

1. **“If I memo the consumers, they won’t re-render when context changes.”** Wrong. memo skips re-render when **props** are referentially equal. Context-triggered re-renders are caused by the **context value** (from the nearest Provider) changing. When the value identity changes, React re-renders every consumer; memo does not block that. **Demo:** MemoizedConsumersNoHelp — ThemeDisplay is memo but still re-renders on increment.

2. **“React only re-renders consumers that ‘use’ the changed part.”** Wrong. React does not track “which part of the value this consumer read.” It only compares the value by reference (Object.is). If the value object is new, **all** consumers re-render. **Fix:** Split contexts so each context has a narrow slice; then only consumers of the changed context re-render.

3. **“If I use useMemo for the Provider value, consumers won’t re-render when unrelated state changes.”** Partially right. useMemo stabilizes the value **identity** when the dependency array hasn’t changed. So when only “unrelated” state (e.g. in a sibling) changes and the Provider doesn’t re-render, value stays the same. But when the Provider **does** re-render (e.g. its own state — count — changed), useMemo will produce a new value (deps changed) → all consumers re-render. So useMemo avoids “value new every render” but does not avoid “all consumers re-render when this context’s slice changes.” **Fix:** Split contexts so consumers that don’t need count don’t subscribe to CountContext.

4. **“Context is cheap; re-rendering a few extra components is fine.”** It can be, but when the context value changes frequently (e.g. every keystroke) and many consumers are under that Provider, you get a large re-render tree. Cost scales with tree size and update frequency. **Fix:** Split contexts; scope Provider to the subtree that needs it; or use alternative patterns (e.g. subscription) for high-frequency updates.

5. **“I’ll put everything in one context and use selectors later.”** React Context has no built-in “selectors.” The value is one object; when it changes (by reference), all consumers re-render. Libraries (e.g. Zustand, Jotai) that offer selectors do so by not using React Context for the subscription or by splitting internally. **Fix:** Split contexts by concern so each Provider’s value is narrow.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useMemo for Provider value | Value identity stable when deps unchanged; avoids “new object every render” re-renders | When deps (e.g. count) change, value is new → all consumers still re-render |
| Split contexts (CountContext, ThemeContext) | Only consumers of the changed context re-render; ThemeDisplay doesn’t re-render on count change | More Providers and context types; more boilerplate |
| memo(Consumer) | Can help when re-render is caused by **parent** re-render with same props | Does **not** help when re-render is caused by **context value** change |

---

## When Context should be avoided

- **High-frequency updates:** Context value changes every keystroke or every frame → all consumers re-render that often. Prefer local state, refs, or a subscription-based store (e.g. Zustand) for high-frequency data.
- **Large consumer tree:** Many components use the same context and the value changes often → large re-render blast radius. Split contexts or scope Provider to a smaller subtree.
- **Need “selective” re-renders:** You want “only the component that reads field X to re-render when X changes.” Context doesn’t support that natively; one value, one identity. Split contexts so each context’s value is a single “slice” (e.g. count only, theme only).
- **Single consumer or shallow tree:** If only one component or a small path needs the data, props or local state may be simpler and more predictable.

---

## When Context is acceptable

- **Low-frequency updates:** Theme, user, locale — change rarely. Re-rendering all consumers on theme toggle or login is usually acceptable.
- **Narrow value:** Context holds a single slice (e.g. theme only) so when it changes, “all consumers” is exactly the set that needs to update.
- **Scoped Provider:** Provider wraps only the subtree that needs that value so unrelated branches don’t re-render when this context changes.

**Rule of thumb:** Context compares value by **reference**. Unstable value (new object every render) → all consumers re-render every time. Memoizing consumers does **not** prevent Context-triggered re-renders. Split contexts (or scope Provider) to reduce blast radius; use useMemo for Provider value to avoid unnecessary identity churn when deps haven’t changed.
