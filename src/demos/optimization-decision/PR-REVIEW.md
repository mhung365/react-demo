# PR Review: When to optimize rendering (decision framework)

## What this PR does

Adds a demo that teaches **how Senior/Staff developers decide when to optimize rendering and when to ignore re-renders** in a large React app:

1. **Baseline:** Enterprise-style dashboard (Shell, Header, Sidebar, TeamA widgets, TeamB list, TeamC chart). All state at top; tick update re-renders whole tree. Classification panel shows harmless / tolerable / must-fix per component. TeamCChart is expensive (simulateExpensiveWork + useMeasureRender).
2. **Wrong optimization (rejected):** Memoize Header, Sidebar, TeamAWidgets, TeamBList; useCallback for onSelect. TeamCChart still re-renders (receives tick from parent). More code, no improvement on the bottleneck. Demonstrates "optimizing the wrong layer."
3. **Right optimization (accepted):** Colocate tick state in TeamC. Only TeamC re-renders on "Refresh chart". Rest of tree stable; focused fix with real user impact.

Explicit classification (harmless / tolerable / must-fix), render counts in a panel, and [measure] for TeamCChart. Decision criteria table and verdicts (rejected / accepted) with justification.

## Staff/Senior review points

### Decision-making criteria (not just techniques)

- **Harmless:** Cheap components (Header, Sidebar, widgets). Ignore; do not optimize. The demo explicitly classifies them so learners see "many re-renders" but "no action."
- **Tolerable:** TeamBList (moderate cost). Monitor; optimize only if profiling shows it in hot path. Demo does not optimize it in the "right" path — we focus on the must-fix.
- **Must-fix:** TeamCChart (expensive work every re-render). Fix by colocating state so only TeamC re-renders. Measure before/after (console [measure]) to justify.

### Why wrong optimization is rejected

- Memoizing cheap components (Header, Sidebar, widgets, list) does not fix the expensive chart. TeamCChart still receives `tick` from parent → still re-renders → still runs simulateExpensiveWork. Result: more code (memo + useCallback everywhere), no user impact. Communicating this in a real PR: "Optimizing the wrong layer; the bottleneck is TeamCChart. Recommend colocating tick in TeamC instead."

### Why right optimization is accepted

- Colocating tick in TeamC: when user clicks "Refresh chart", only TeamC re-renders. Header, Sidebar, TeamA, TeamB do not re-render (classification panel shows counts stable). Real user impact: rest of UI stays responsive; only the chart area updates. Focused fix on the layer that mattered.

### How to communicate in a real team

- **In PR description:** "Classification: Header/Sidebar/TeamA = harmless (no change). TeamBList = tolerable (no change). TeamCChart = must-fix. Fix: colocate tick in TeamC; only TeamC re-renders on tick. Before: [measure] whole tree. After: [measure] only TeamC."
- **When rejecting a memo-everything PR:** "Render counts for cheap components are not the bottleneck; [measure] shows TeamCChart is. Rejecting memo on Header/Sidebar; please colocate tick in TeamC and re-measure."
- **Criteria doc:** Share the harmless / tolerable / must-fix table so the team applies the same framework; "measure first, fix the hot path" avoids optimization theater.

### Possible improvements

- Add a "Criteria only" tab that is just the table + one paragraph on communication, for quick reference.
- In production, you'd use React DevTools Profiler (actualDuration) instead of or in addition to useMeasureRender; the demo is consistent with other demos in the repo.

## Verdict

**Approve.** The demo clearly shows multiple re-render scenarios, classifies them, demonstrates a rejected optimization (wrong layer) and an accepted one (focused fix), and explains decision criteria and team communication. Fits Staff/Senior "decision framework" and "communicate in a real team" goals.
