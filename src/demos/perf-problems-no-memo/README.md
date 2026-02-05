# Performance problems memo cannot fix

A production-style demo (dashboard with heavy data, lists, interactions) that teaches **which performance issues cannot be fixed by memoization** and what to use instead.

## Structure

- **PerfProblemsNoMemoDemo.tsx** — Main demo: scenario tabs (Heavy computation, Large DOM, Poor state) and sub-tabs (Problem, Try memo, Correct fix).
- **Heavy computation:** Problem → Try memo → Correct (useDeferredValue + useMemo).
- **Large DOM:** Problem → Try memo → Correct (virtual list via useVirtualList).
- **Poor state:** Problem → Try memo → Correct (colocate state).
- **types.ts** — ListItem, generateItems.
- **useVirtualList.ts** — Simple virtual list hook (fixed row height, visible window + overscan).
- **perf-problems-demo.css** — Layout and scenario styling.

## How to run

Select **"Performance problems memo can't fix"** from the app demo dropdown. Pick a scenario (1–3), then switch between Problem / Try memo / Correct fix. Use the console for `[measure]` and `[render]` logs.

## Learning outcomes

1. **Heavy work in render:** Memo doesn’t move work off the critical path; useDeferredValue and useMemo do.
2. **Large DOM:** Memo doesn’t reduce node count; virtualization does.
3. **Poor state:** Memo + useCallback can reduce re-renders but are fragile; colocating state fixes the cause.

See **LEARNING-GUIDE.md** for details and **PR-REVIEW.md** for a senior-level review.
