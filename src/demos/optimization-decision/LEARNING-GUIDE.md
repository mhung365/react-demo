# When to optimize rendering (decision framework)

## Goal

Learn how Senior/Staff developers **decide** when to optimize rendering and when to ignore re-renders in a large React app: classification (harmless / tolerable / must-fix), why optimizing the wrong layer causes more problems, and how to apply a focused optimization with real user impact.

## Decision criteria (not just techniques)

| Classification | Meaning | Action |
|----------------|--------|--------|
| **Harmless** | Cheap component (simple DOM, no heavy work). Re-renders often but no user-visible cost. | **Ignore.** Do not optimize. |
| **Tolerable** | Moderate cost (e.g. small list). Re-renders may be frequent but not in critical path. | **Monitor.** Optimize only if profiling shows it in the hot path. |
| **Must-fix** | Expensive component (heavy render work). Re-renders cause jank or frame drops. | **Fix:** colocate state, memo + stable props, or move work off critical path. |

## Scenarios in the demo

- **Baseline:** All state at top (theme, selectedTeam, tick). When tick updates, whole tree re-renders. Header, Sidebar, TeamA = harmless. TeamBList = tolerable. TeamCChart = must-fix (expensive work every re-render).
- **Wrong optimization:** Memoize Header, Sidebar, TeamAWidgets, TeamBList; useCallback for handlers. TeamCChart still receives tick from parent → still re-renders. Result: more code, no improvement on the expensive part. **Rejected.**
- **Right optimization:** Colocate tick state in TeamC. When user clicks "Refresh chart", only TeamC re-renders. Header, Sidebar, TeamA, TeamB do not re-render. **Accepted:** focused fix, real user impact.

## Why optimizing the wrong layer causes more problems

- **Memoizing cheap components first:** Header, Sidebar, widgets are cheap. Wrapping them in memo + useCallback adds code and dependency maintenance. The bottleneck (TeamCChart) is unchanged; the user still sees jank.
- **No measurement:** Without profiling or [measure], you don't know which component is expensive. Optimizing by "guess" leads to wasted effort and fragile code.
- **Right order:** (1) Measure (Profiler or useMeasureRender). (2) Identify the must-fix (expensive component in hot path). (3) Fix that layer (colocate state or memo + stable props). (4) Leave harmless/tolerable alone unless data shows otherwise.

## How to communicate these decisions in a real team

- **Document the classification:** In PRs or ADRs, state "Header/Sidebar re-renders are classified harmless; no optimization." So the next dev doesn't "fix" them.
- **Tie optimization to user impact:** "We optimized TeamCChart re-renders by colocating tick state; before, every tick re-rendered the whole tree and caused jank. Now only TeamC re-renders." Outcome > technique.
- **Reject wrong optimizations with data:** "Memoizing Header/Sidebar doesn't improve [measure] or frame time; the bottleneck is TeamCChart. Rejecting this PR; recommend colocating tick in TeamC instead."
- **Criteria over rules:** Share the table (harmless / tolerable / must-fix) and "measure first, fix the hot path" so the team applies the same decision framework.

## Trade-offs

- **Colocating state:** Reduces re-renders of the rest of the tree; state lives closer to the feature. Trade-off: if another part of the app needs that state later, you may lift or use context.
- **Memo + stable props:** Reduces re-renders of the expensive child; requires stable deps. Trade-off: wrong deps → stale closures or unnecessary re-runs; use only where you measured a bottleneck.
