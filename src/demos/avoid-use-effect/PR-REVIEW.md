# Senior React PR review: When to avoid useEffect

## What was implemented

- **Sync state from props:** Before: `SyncStateFromPropsEffect` uses useEffect to sync local state when `userId` prop changes (extra render, sync smell). After: `DeriveOrControlled` derives display value in render; no effect. Alternative: controlled with `key` when local state must reset.
- **Event reaction:** Before: `EventReactionInEffect` runs tracking in an effect when `selectedId` changes (runs on mount too; cause and reaction decoupled). After: `EventHandlerInstead` does setState + track in the same click handler.
- **Data fetch:** Before: `DataFetchInEffect` uses useEffect to fetch when filters change (manual loading/error, no cache). After: `ReactQueryInstead` uses useQuery; no manual effect.
- **Unavoidable effect:** `UnavoidableEffect` demonstrates focus on mount and window resize subscription with proper cleanup. These are real side effects; effect is correct.

---

## PR review (Senior lens)

### What's good

- **Clear before/after.** Each unnecessary-effect case has a paired refactor (derive, event handler, React Query). The unavoidable example is isolated so the rule "effect only for external sync" is clear.
- **Single source of truth.** Derive during render and event handler patterns keep one place that "owns" the behavior; no "sync when X changes" indirection.
- **Data layer for server state.** React Query replaces manual fetch/loading/error and avoids duplication and race-condition bugs at scale.
- **Unavoidable effect has cleanup.** Resize listener is removed on unmount; no leak.

### Things to watch

- **Sync-state demo parent.** The wrapper passes `userId` from a select; both Before and After receive the same prop. Good for comparing behavior (e.g. change userId and see Before re-run effect + setState vs After just re-render with new prop).
- **React Query scope.** This demo creates a local QueryClient. In a real app you'd have one QueryClient at the root (e.g. via QueryClientProvider). Same pattern; just one provider.
- **UnavoidableEffect ref.** The input that receives focus must be the one with the ref; we use a single input with `ref={inputRef}` and focus it in an effect. Correct.

### Anti-patterns involving useEffect

1. **Syncing state from props in an effect.** "When prop X changes, setState(X)." That's derivation; do it in render (or use key to reset). Effect sync causes extra render and can flicker or get out of sync (e.g. strict mode, async parent updates).

2. **Reacting to user action in an effect.** User did X → you setState → you want to do Y. Putting Y in an effect that runs when that state changes decouples cause and effect, runs Y on mount if initial state is set, and makes the flow harder to follow. Do Y in the same event handler that sets the state.

3. **Data fetching in useEffect as the default.** For server state (API data), prefer a data layer (React Query, etc.). useEffect fetch is acceptable for simple mount-only load (e.g. user profile once); for filter-driven or list data, use a library. Manual loading/error/cache in every component doesn't scale.

4. **No cleanup for subscriptions.** If the effect adds a listener (resize, WebSocket, interval), it must return a cleanup that removes it. Otherwise: memory leak and possibly stale closures.

5. **Heavy logic inside the effect.** If the effect does "fetch then validate/normalize/aggregate," extract the validate/normalize/aggregate into pure functions and call them from the effect (or from a custom hook). Effect should orchestrate (when to run, cleanup); business logic should be testable elsewhere. See effect-logic-testability demo.

### Trade-offs and edge cases

- **Derive vs key:** When the child is a form with local state that must "reset" when the parent switches to another entity, two options: (1) Derive everything from props (fully controlled; no local state). (2) Use `key={entityId}` so the child remounts with fresh state. Option (2) avoids a "sync state from props" effect and is often simpler for complex forms.
- **Event handler + async:** If the reaction (e.g. track) involves an async call, do it in the handler (e.g. `await trackAsync(...)` or fire-and-forget). Don't move it to an effect keyed off state; that reintroduces "when state changes" and can run on mount.
- **React Query vs useEffect fetch:** useEffect fetch is still valid for one-off mount-only load (e.g. feature flags, user profile) when you don't need cache or refetch. For anything that depends on props/state (filters, ids), a data layer is usually better. Trade-off: extra dependency and mental model vs. less boilerplate and fewer bugs.
- **Unavoidable effect and strict mode:** In development, React may run the effect twice (mount → cleanup → mount). Your cleanup must be correct so that the second run doesn't see stale state or duplicate listeners. Always implement cleanup for subscriptions.

Summary: the refactors correctly replace unnecessary effects with derivation, event handlers, and a data layer; the unavoidable effect example shows when effect is the right tool (external sync) and reinforces cleanup. LEARNING-GUIDE and this PR-REVIEW document anti-patterns, trade-offs, and edge cases.
