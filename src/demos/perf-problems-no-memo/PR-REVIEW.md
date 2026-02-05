# PR Review: Performance problems memo cannot fix

## What this PR does

Adds a production-style demo that teaches **which performance problems memoization cannot fix** and the correct fixes:

1. **Heavy computation in render** → useDeferredValue + useMemo (not React.memo).
2. **Large DOM tree** → virtualization (not memoizing rows).
3. **Poor state architecture** → colocate state (not memo + useCallback everywhere).

Each scenario has three tabs: Problem, Try memo (fails), Correct fix. Explicit measurements (useMeasureRender, useRenderLog, initial render ms) show that memo doesn’t help in (1) and (2), and is a band-aid in (3).

## Review points

### Strengths

- **Clear problem → try memo → correct fix** flow. Developers see that memo fails (or is a band-aid) and why.
- **Explicit measurements:** Console `[measure]` and `[render]` logs, plus on-screen "Initial list render: Xms" where relevant. No hand-waving.
- **Correct tools:** useDeferredValue for heavy render work; simple useVirtualList for large DOM; colocated state for "everything re-renders".
- **Data architecture:** Heavy list and dashboard state are client/UI state; the demo doesn’t mix in server state.

### Possible improvements

- **Heavy computation:** Could add a small "Last list render: Xms" display using a ref + effect to avoid lifting state into the expensive path. Optional; console is enough for the lesson.
- **Virtual list:** Current implementation is minimal (fixed row height, no dynamic heights). For production, recommend react-window or react-virtuoso; the demo is sufficient to teach "fewer nodes, not memo".
- **Poor state:** FilterAndListColocated contains both header and main; if the list were huge, we’d still re-render the whole component when filter changes. For this demo (50 items, cheap filter) it’s fine. For scale, we could split "filter input" and "filtered list" with a small parent that owns filter and passes to both.

### Anti-patterns avoided

- No server state in Context or Redux here; demo is client/UI only.
- No "memo everything" — we show that memo doesn’t fix (1) and (2), and is a band-aid in (3).
- Correct sequence: identify the problem (heavy work / many nodes / state placement), then apply the right fix (defer / virtualize / colocate), not "add memo first".

### When NOT to use this approach

- If the bottleneck is **re-renders of an expensive child with stable props** → React.memo + stable props is the right tool (see premature-memo / justified memo).
- If the list is small (< 100 items) and not the bottleneck → virtualization adds complexity without benefit; measure first.

## Verdict

**Approve.** The demo clearly shows three performance problems that memo cannot fix (or only band-aids), with measurements and the correct solutions. Fits the "teach through real project" and "right tool for the job" goals.
