# Senior PR Review: useCallback demo

## What's good

- **Explicit callback identity logs:** useCallbackIdentityLog stores previous callback in ref and logs "identity: SAME (stable)" vs "NEW (unstable)" each render. Makes function identity across renders visible.
- **Re-render caused by unstable callback:** UnstableCallbackParent passes inline callback → new reference every render → MemoizedChild shallow-compare fails → child re-renders every time. Clear cause (unstable ref) and effect (child re-renders).
- **useCallback necessary:** StableCallbackParent uses useCallback → same reference when deps unchanged → child skips re-render when only count changes. Demonstrates when useCallback fixes a real issue (memoized child needs stable ref).
- **No benefit + simplified:** NoBenefitUseCallback uses useCallback but child is not memoized → child re-renders anyway. NoBenefitSimplified removes useCallback — simpler code, same behavior. "Removing useCallback improves readability with no perf loss."
- **Refactor removes need:** RefactorNoCallback provides callback via context. Parent doesn't pass a callback; child gets it from useContext. No useCallback in parent; architecture change removes the need. Distinguishes "fixing reference instability" (useCallback) vs "fixing architecture" (context).
- **Root cause vs symptom:** Copy states that useCallback doesn't fix the root cause (parent re-renders when state changes); it fixes the symptom (unstable callback reference so memoized child doesn't re-render unnecessarily).

---

## Common misuse of useCallback (and how this demo addresses them)

### 1. Using useCallback for every function "for performance"

**Misuse:** Wrapping every callback in useCallback "just in case." useCallback only helps when the callback is passed to a **memoized** child (or used in a dependency array where stability matters). If the child isn't memoized, the child re-renders when the parent re-renders regardless of callback identity. useCallback adds dependency array and mental overhead with no benefit.

**Demo:** NoBenefitUseCallback uses useCallback but PlainChild is not memoized → child re-renders every time. NoBenefitSimplified removes useCallback — same behavior, simpler code.

### 2. Assuming useCallback "stops re-renders"

**Misuse:** "I added useCallback so the child won't re-render." useCallback doesn't stop the parent from re-rendering (root cause: parent state changed). It stabilizes the callback reference so that a **memoized** child can skip re-render (symptom: child was re-rendering because prop reference changed). If the child isn't memoized, useCallback doesn't prevent child re-renders.

**Demo:** Concepts and copy state that useCallback fixes reference instability (symptom), not the root cause (parent re-renders). StableCallbackParent: parent still re-renders when count changes; child skips because callback ref is stable.

### 3. Using useCallback without a memoized consumer

**Misuse:** useCallback for a callback passed to a child that isn't wrapped in React.memo. The child re-renders when the parent re-renders anyway (same props or not — child doesn't do shallow compare). So the stable reference doesn't prevent any re-render.

**Demo:** NoBenefitUseCallback: child is not memoized; useCallback doesn't change child re-render behavior. Removing useCallback (NoBenefitSimplified) improves readability with no perf loss.

### 4. Overusing useCallback when architecture could remove the need

**Misuse:** Adding useCallback everywhere a callback is passed down. Sometimes the better fix is to change architecture: e.g. context provides the callback so the parent doesn't pass it. Then no useCallback in the parent; the "callback" comes from context (stable in the provider).

**Demo:** RefactorNoCallback: child gets onAction from context. Parent doesn't pass a callback — no useCallback in parent. Architecture change removes the need.

### 5. useCallback with wrong or unstable deps

**Misuse:** useCallback(fn, []) when the callback uses state/props that change — stale closure. Or useCallback(fn, [obj]) when obj is a new object every render — callback is recreated every time, so useCallback doesn't stabilize. Same pitfalls as useMemo: unstable deps nullify the benefit.

**Demo:** Conceptually covered in effect-deps-identity (unstable deps). Here we focus on "when useCallback is necessary" vs "when it's no benefit" vs "when refactor removes the need."

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useCallback when memoized child receives callback | Child skips re-render when parent re-renders for unrelated state | Dependency array to maintain; risk of stale closure if deps wrong |
| No useCallback when child not memoized | Simpler code, no dependency array | N/A — same behavior |
| Refactor with context | No useCallback in parent; callback from context (stable in provider) | Context adds a layer; not every app wants context for every callback |
| useCallbackIdentityLog | Clear "SAME vs NEW" in console | Logs every render; dev-only |

---

## When NOT to use useCallback

- **Child is not memoized:** If the component that receives the callback isn't wrapped in React.memo, it re-renders when the parent re-renders regardless of callback identity. useCallback adds complexity with no benefit. Skip useCallback; use inline function.
- **No measured performance problem:** Don't add useCallback "just in case." Profile first. Add useCallback when you've measured that a memoized child is re-rendering unnecessarily because of an unstable callback prop.
- **Callback is not passed to a memoized child or used in deps:** If the callback isn't passed to a memoized child (or used in useEffect/useMemo dependency array where stability matters), useCallback doesn't prevent any re-render or re-run. Skip it.
- **Architecture can provide the callback instead:** If you can provide the callback via context (or another pattern) so the parent doesn't pass it, you remove the need for useCallback in the parent. Consider refactoring before adding useCallback everywhere.
- **Overuse:** Wrapping every callback in useCallback makes the code harder to read and maintain; dependency arrays can be wrong (stale closure) or unnecessary. Prefer clarity; add useCallback only where profiling shows a clear win (memoized child re-rendering unnecessarily).

**Rule of thumb:** Default to no useCallback (inline function). Add useCallback when (1) you have a memoized child that receives the callback, and (2) you want the child to skip re-render when the parent re-renders for unrelated state. Don't use useCallback when the child isn't memoized; consider refactoring (e.g. context) to remove the need for useCallback in the parent.

---

## How this can fail or confuse at scale

1. **useCallback everywhere:** Every parent wraps every callback in useCallback. Code becomes noisy; dependency arrays get out of sync (stale closure). Many of those callbacks are passed to non-memoized children — no benefit.
2. **Stale closure in useCallback:** useCallback(fn, []) when fn uses state → fn always sees initial state. useCallback(fn, [state]) when state changes often → callback recreated often → memoized child may still re-render. Balance "stable ref" with "correct deps."
3. **Context vs useCallback:** Context is a good fit when many components need the same callback (or when you want to avoid prop drilling). It's not always the right trade-off for a single parent–child pair; useCallback in the parent can be simpler. Use context when the architecture benefit (e.g. many consumers, or clearer data flow) justifies it.
4. **Root cause vs symptom:** useCallback "treats the symptom" (unstable ref). Sometimes the root cause is "too much state in the parent" or "wrong component boundaries" — splitting state or moving it down might reduce parent re-renders and make useCallback less critical. Consider both: fix reference instability (useCallback) and fix architecture (state placement, context) where appropriate.

**Rule of thumb:** useCallback is a tool for when you have a memoized child that receives a callback and you want to prevent unnecessary child re-renders. It doesn't fix the root cause (parent re-renders); it fixes the symptom (unstable ref). Don't default to useCallback; add it where profiling shows a clear win, or refactor so you don't need it.
