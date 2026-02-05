# Performance problems memo cannot fix

## Goal

Learn which performance issues in React **cannot** be fixed by memoization (React.memo, useMemo, useCallback), and what the correct tools are.

## Data classification

- **Heavy computation:** Derived data (filtered list) — still **client state**; the issue is *where* we compute it (during render, on every keystroke).
- **Large list:** List data is **client state**; the issue is *how many* DOM nodes we create.
- **Poor state:** filter, sidebarOpen, selectedId are **UI state**; the issue is *where* they live (too high → full tree re-renders).

## Scenarios

### 1. Heavy computation in render

| Tab | What happens | Why memo fails | Correct fix |
|-----|--------------|----------------|-------------|
| Problem | Filter 8k items on every keystroke inside render. Input and list block. | — | — |
| Try memo | Wrap list in React.memo; parent still passes new `keyword` every keystroke. | Props change every time → memo never skips. The bottleneck is the work *inside* render, not "too many children re-rendering". | — |
| Correct | useDeferredValue(keyword) for the list; useMemo to filter by deferred value. | — | Input stays on critical path; heavy work runs in a deferred render and can be interrupted. |

**Takeaway:** Memo skips re-renders when props are equal. It does **not** move work off the critical path. For heavy work in render: **useDeferredValue** (keep input responsive) and **useMemo** (cache derived data).

### 2. Large DOM tree

| Tab | What happens | Why memo fails | Correct fix |
|-----|--------------|----------------|-------------|
| Problem | Render 2000 list items → 2000 DOM nodes. Slow initial render and layout. | — | — |
| Try memo | Memoize each row. We still mount 2000 components and create 2000 nodes on first render. | Memo only avoids *re*-renders when props are equal. It doesn't reduce the number of components or DOM nodes. | — |
| Correct | Virtual list: only render the visible window (~20–30 items). Same 2000 in data, ~30 in DOM. | — | Fewer nodes → fast initial render and scroll. |

**Takeaway:** Memo doesn't reduce DOM size. For "too many nodes": **virtualization** (react-window, react-virtuoso, or a simple useVirtualList).

### 3. Poor state architecture

| Tab | What happens | Why memo is a band-aid | Correct fix |
|-----|--------------|------------------------|-------------|
| Problem | filter, sidebarOpen, selectedId at root. Any change re-renders Filter, Sidebar, List. | — | — |
| Try memo | React.memo on each section + useCallback for handlers. Fewer re-renders when only one state changes. | We must maintain stable callbacks and memo on every child. Adding new state/props risks breaking memo. | — |
| Correct | Colocate: Sidebar owns `open`; FilterAndList owns `filter` and `selectedId`. Root has no state. | — | Only the component that changed re-renders. No memo, no useCallback. |

**Takeaway:** When "everything re-renders", the right fix is often **colocate state**, not "memo everything". Memo + useCallback can help but add complexity; moving state down removes the cause.

## Measurements

- **Heavy computation:** Console `[measure]` for FilteredList — high ms on every keystroke (problem / try memo); with useDeferredValue, input stays responsive and list updates in a deferred commit.
- **Large DOM:** Initial render ms (problem / try memo ~similar); virtual list shows much lower initial render and only ~20–30 items in DOM.
- **Poor state:** Console `[render]` — problem: all three sections log on every action; try memo: only the section whose prop changed logs; correct: only the component that owns the state logs.

## When NOT to use memo for these

- **Heavy work in render:** Memo doesn't skip the component that does the work when its props (e.g. keyword) change. Use useDeferredValue + useMemo or move work to a worker.
- **Large DOM:** Memo doesn't reduce node count. Use virtualization.
- **State too high:** Memo + useCallback can reduce re-renders but are fragile. Prefer colocating state first; add memo only if you still measure a bottleneck.

## Trade-offs

| Fix | Gain | Cost |
|-----|------|------|
| useDeferredValue | Input responsive; heavy UI can lag slightly behind. | List may show stale value briefly; need to handle "deferred" in UX. |
| Virtualization | Fast initial render and scroll; constant DOM size. | Fixed or measured row height; more complex scroll logic. |
| Colocate state | Fewer re-renders without memo; simpler code. | State may need to move up if another sibling needs it (then consider context or small parent). |

## Common mistakes

- Reaching for memo first when input is laggy → measure; often the cause is heavy work in render (useDeferredValue) or too many nodes (virtualize).
- Memoizing every list row to "fix" a long list → memo doesn't reduce DOM size; virtualize.
- Adding useCallback everywhere to "fix" re-renders → colocate state first; then add memo/useCallback only where you measured a bottleneck.
