# Object & array identity in React

## Goal

Understand why creating new objects or arrays on every render causes problems (broken memoization, unnecessary useEffect re-runs, Context consumer re-renders) and when to stabilize identities (useMemo/useCallback) vs when not to.

## Why “same content” ≠ “same reference”

React compares objects and arrays by **reference** (identity), not by value:

- `prevProps.config === nextProps.config` → memo skips only if same reference.
- `useEffect(..., [config])` → effect runs when config reference changes (Object.is).
- Context compares provider value by reference → consumers re-render when value reference changes.

Inline `{ theme: 'dark' }` or `[1, 2, 3]` creates a **new** object/array every render → new reference → memo never skips, effect runs every time, Context consumers re-render every time. Values “look the same” but identities differ.

## Scenarios

### 1. Inline breaks memoization

- Parent passes `config` and `items` created inline to a memoized child.
- Every parent re-render creates new references → child always re-renders.
- **Logs:** [identity] config/items = NEW reference; [render] MemoizedFilterPanel runs every time.

### 2. Inline triggers useEffect re-runs

- `useEffect(..., [config])` with config created inline.
- New config reference every render → effect runs every time (e.g. re-fetch on every render).
- **Logs:** [identity] config = NEW reference; [effect] runs on every parent re-render.

### 3. Inline Context value re-renders consumers

- `ThemeContext.Provider value={{ theme, setTheme }}` — new object every render.
- All consumers re-render whenever the provider’s parent re-renders, even if theme did not change.
- **Logs:** [identity] Context value = NEW reference; [render] ThemeConsumer runs every time.

### 4. Refactor: stable identities

- useMemo for config and items; useCallback for onApply; useMemo for Context value.
- Same references when content has not changed → memo skips, effect runs only when deps change, consumers re-render only when theme changes.
- **Logs:** [identity] same reference; [render] memo child and consumer do not run when only count changes.

### 5. When NOT to stabilize

- Child is not memoized; callback is not in any dependency array; component is cheap.
- Stabilizing adds cost (deps to maintain) without reducing re-renders. Measure first; don’t useMemo/useCallback everywhere by default.

## Common mistakes

- **“I passed the same object”** — You passed an object with the same *content*; React sees a new *reference* because you created it inline.
- **Stabilizing everything** — useMemo/useCallback on every prop/callback even when the child is not memoized or the value is not in effect deps. Adds complexity without benefit.
- **Forgetting Context value** — Provider value inline → all consumers re-render on every parent re-render. useMemo(value, [theme]) (and stable setTheme) fixes it.

## Trade-offs

| Stabilize (useMemo/useCallback) | Gain | Cost |
|--------------------------------|------|------|
| When passed to memo child / effect deps / Context | Memo skips; effect runs only when needed; consumers re-render only when value content changes. | Must maintain correct deps; stale deps cause bugs. |
| When child is not memoized / callback not in deps | None (child re-renders anyway). | Extra code and mental overhead. |

**Rule of thumb:** Stabilize when the value is used by something that compares by reference (memo, useEffect deps, Context). Otherwise, only add useMemo/useCallback when you’ve measured a bottleneck.
