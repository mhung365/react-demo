# When to avoid useEffect and what to use instead

This demo shows **common cases where useEffect is overused** and **better patterns** that are more predictable.

## Examples

1. **Sync state from props** — Before: `useEffect` syncs local state when prop changes (extra render, can flicker). After: derive during render or use controlled component with `key`.
2. **Event reaction** — Before: user selects item → state updates → effect runs to track. After: do tracking in the same event handler that sets state.
3. **Data fetch** — Before: `useEffect` fetches when filters change (manual loading/error, no cache). After: React Query (or similar data layer); no manual effect.
4. **Unavoidable effect** — Focus on mount, window resize subscription. These are real side effects (imperative DOM, external subscription); `useEffect` with cleanup is correct.

## Run

- Select **When to avoid useEffect** from the app demo dropdown.
- Switch tabs to see before/after for each pattern and the unavoidable-effect example.

## Docs

- **LEARNING-GUIDE.md** — Why these patterns are more predictable; when effect is still required.
- **PR-REVIEW.md** — Senior PR lens: anti-patterns, trade-offs, edge cases.
