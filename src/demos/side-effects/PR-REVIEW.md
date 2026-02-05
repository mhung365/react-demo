# Senior React PR review: Side effects demo

## What was implemented

- **OveruseOfEffects:** Data fetch, derived state sync, and analytics in three separate `useEffect`s; explicit `[render]` and `[effect]` logs.
- **LogicInWrongPlace:** Filtering list in effect; analytics on `selectedId` change instead of in click handler.
- **RefactoredFewerEffects:** useQuery for data; derived in render; analytics in event handlers; zero custom effects for fetch/analytics/derived.

---

## PR review (Senior lens)

### What’s good

- **Clear separation of “effect” vs “render”:** The logs make the execution order visible. That’s exactly what you want when teaching or debugging: render runs first (sync), then effects (async after commit).
- **Refactor reduces surface area:** Moving fetch to React Query, derived state to render, and analytics to handlers removes three custom effects. Fewer effects ⇒ fewer dependency bugs and a simpler mental model.
- **Correct cleanup in OveruseOfEffects:** The fetch effect uses a `cancelled` flag and returns a cleanup that sets it, so in-flight requests don’t update state after unmount. That’s the right pattern when you do keep a manual fetch in an effect.

### Things to watch

- **useRenderLog in RefactoredFewerEffects:** It runs on every render (including those triggered by React Query). For teaching it’s fine; in production you’d remove or gate it. No functional issue.
- **Analytics in RefactoredFewerEffects:** We call analytics in the same handler that updates state (`handleCategoryChange`). If analytics were async or slow, you might not want to block the state update. In that case you’d still do it in the handler but fire-and-forget (e.g. `queueMicrotask` or a non-blocking call). The point stands: “user did X” ⇒ handle in the handler, not in an effect watching state.

### Common misconceptions (callouts)

1. **“When state changes, use useEffect.”**  
   Only if the reaction is a **side effect** (API, DOM, subscription). If it’s “derive new data from state,” do it in render. If it’s “user did something,” do it in the event handler.

2. **“I need an effect to sync state from props.”**  
   Usually you don’t. Either derive during render (`const derived = f(props)`) or, if you truly need “reset when props change” (e.g. form draft from server), use a key or the pattern “initialize/update from props” sparingly. Default is: derive in render.

3. **“Analytics should run when X changes.”**  
   Often the real trigger is “user did something that caused X to change.” In that case, fire analytics in the handler that performs the action. Effect-based analytics is easy to get wrong (e.g. firing on mount or on programmatic updates).

4. **“Data fetching belongs in useEffect.”**  
   For one-off or simple cases it can work, but you then own loading, error, cache, and deduplication. React Query (or similar) is the standard approach for server state; the component stays declarative and you have fewer custom effects.

### Trade-offs

- **React Query:** You rely on a library for fetch timing, cache, and refetch. You gain less custom effect code and fewer bugs; you give up fine-grained control over exactly when a request fires. For most apps, that’s acceptable.
- **Analytics in handlers:** You tie tracking to user actions. You might miss “value changed by code” — usually that’s desirable (you care about user intent). If you ever need “whenever X changes regardless of cause,” then an effect is appropriate; document why.

### When side effects are unavoidable

- **Subscriptions:** WebSocket, intervals, global listeners — use `useEffect` with cleanup.
- **DOM:** Focus, scroll, `document.title` — use `useEffect` (or `useLayoutEffect` when you need pre-paint).
- **Third-party integrations:** Use effects as the escape hatch when the library needs run-after-mount or run-when-value-changes behavior.

Summary: the demo correctly shows overuse, wrong placement, and a refactor that minimizes custom effects and keeps side-effect surface area small and explicit.
