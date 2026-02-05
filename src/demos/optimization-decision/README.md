# When to optimize rendering (decision framework)

A production-style demo (enterprise dashboard with multiple teams/features) that teaches **how Senior/Staff developers decide when to optimize rendering and when to ignore re-renders**.

## Structure

- **OptimizationDecisionDemo.tsx** — Main demo: criteria table (harmless / tolerable / must-fix) and tabs (Baseline, Wrong optimization, Right optimization).
- **DashboardBaseline.tsx** — Full tree, all state at top; classification panel; TeamCChart expensive (simulateExpensiveWork + useMeasureRender).
- **DashboardWrongOptimization.tsx** — Memo on Header, Sidebar, TeamA, TeamB; TeamCChart still re-renders; verdict: rejected.
- **DashboardRightOptimization.tsx** — Tick colocated in TeamC; only TeamC re-renders on tick; verdict: accepted.
- **ClassificationPanel.tsx** — Renders table of component render counts and classification (harmless / tolerable / must-fix).
- **useDashboardRenderCount.ts** — Tracks render count and classification per component; reset on tab change.
- **types.ts** — RenderClassification, TEAMS.
- **optimization-decision-demo.css** — Layout and panel styling.

## How to run

Select **"When to optimize rendering (decision framework)"** from the app demo dropdown. Use Baseline → Wrong optimization → Right optimization. Click "Refresh (tick)" or "Refresh chart"; check the classification panel and console [measure].

## Learning outcomes

1. **Classify re-renders:** Harmless (cheap, ignore), tolerable (monitor), must-fix (expensive in hot path, fix).
2. **Wrong optimization:** Memoizing cheap components (Header, Sidebar, widgets) does not fix the expensive chart; more code, no user impact. Reject.
3. **Right optimization:** Colocate state (tick in TeamC) so only the expensive subtree re-renders; focused fix, real impact.
4. **Decision criteria:** Measure first; fix the hot path; leave harmless/tolerable alone unless data says otherwise.
5. **Team communication:** Document classification, tie optimization to user impact, reject wrong optimizations with data, share the criteria table.

See **LEARNING-GUIDE.md** for the decision table and **PR-REVIEW.md** for a Staff/Senior review and communication tips.
