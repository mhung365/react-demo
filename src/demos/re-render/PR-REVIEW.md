# Senior PR Review: Re-render Demo

## What’s good

- **Clear separation:** `useRenderLog` is a dedicated hook; logging is not scattered inside components.
- **Realistic tree:** Parent with state, multiple children with different prop strategies (primitive, inline object, stable `useMemo`/`useCallback`, memo vs no memo).
- **Teaching intent is explicit:** Comments and README explain re-render vs DOM and prop identity. Good for onboarding.

---

## Common junior mistakes (and how this demo avoids or highlights them)

### 1. Assuming “re-render = props changed”

**Mistake:** “My child only depends on `count`; when I change `label`, the child shouldn’t re-render.”  
**Reality:** In React, when the parent re-renders, **all** children re-render by default. Props don’t “cause” the re-render; the parent’s re-render does. Props only matter when you use `memo` (or similar) to **skip** a re-render.

**Demo:** `ChildPrimitive` receives only `count`. When you click “Toggle label”, parent re-renders and `ChildPrimitive` still runs (you see its [render] log). Same props, but still a re-render.

### 2. Using `memo` but passing inline objects/functions

**Mistake:** Wrapping a component in `React.memo` but passing `config={{ theme: 'dark' }}` or `onClick={() => doSomething()}`. Every parent render creates a new object/function reference, so shallow compare fails and the child re-renders anyway.

**Demo:** `ChildUnstableProps` is memoized but receives inline `config={{ ... }}`. It re-renders on every parent re-render. Compare with `ChildStableProps` (parent uses `useMemo` for config) and `ChildWithCallback` (parent uses `useCallback`).

### 3. Confusing re-render with DOM update

**Mistake:** “We’re re-rendering too much; the DOM must be thrashing.”  
**Reality:** Re-render = component function ran. DOM update = React committed a **diff** to the real DOM. Many re-renders produce the same tree → no DOM writes.

**Demo:** `StaticChild` and `ChildPrimitive` (when only `label` changes) re-render but return the same JSX. You see [render] logs but no corresponding DOM mutation for those subtrees.

### 4. Optimizing too early

**Mistake:** Putting `memo` / `useMemo` / `useCallback` everywhere “for performance.”  
**Reality:** Re-renders are cheap unless you measure a problem. Memo adds cost (comparison, mental overhead). Use memo when you have measured slow renders or a deep tree with expensive children.

**Trade-off in this demo:** We use `memo` and stable refs **for teaching**. In a real app you’d add them only after profiling.

---

## Trade-offs in this implementation

| Decision | Gain | Cost |
|----------|------|------|
| `useRenderLog` runs during render (sync log) | Exact order of component execution visible | Console can be noisy; in production you’d strip or gate behind a flag |
| Multiple small components (ChildA, ChildB, …) | Each scenario is isolated and easy to follow | More files and props wiring |
| Logging in every demo child | Clear which component re-rendered | Not suitable for production; use React DevTools Profiler or conditional logging |

---

## When NOT to optimize re-renders

- **No measured performance issue.** Don’t memoize “just in case.”
- **Leaf components are cheap.** Re-running a tiny component is negligible.
- **Data changes often.** If props change every time, `memo` doesn’t skip renders and only adds comparison cost.
- **You’re not stabilizing props.** Memo without stable props (useMemo/useCallback for objects/functions) is pointless for those props.

Use React DevTools Profiler to find components that actually take time; then consider `memo`, `useMemo`, or `useCallback` for those paths.

---

## Summary

- **Re-render** = component function ran again (see [render] in console).
- **DOM update** = React applied a diff to the real DOM (can be zero after a re-render if output is unchanged).
- **Parent re-render** → by default all children re-render; use `memo` + stable props to skip when appropriate.
- **Prop identity** → inline objects/functions break memo; use `useMemo`/`useCallback` when you need stable refs for memoized children.
