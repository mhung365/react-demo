# When to optimize React rendering

Production-style dashboard demo showing:

- **Harmless re-renders:** Many components re-render on state change; each render is cheap. Render logs show "noise" but no performance issue — optimization not needed.
- **Real problem:** Same dashboard with an expensive child (simulated heavy work). Re-renders cause measurable jank — optimization justified.
- **Optimized:** Only the expensive child is memoized with stable props; cheap components are left as-is.
- **Premature optimization:** Everything wrapped in memo/useCallback/useMemo; children still receive changing props, so same re-renders with added complexity and comparison overhead.

**Debug & measure (production-style profiling):**

- **Render counters** per component (`useRenderCount` + `RenderCountPanel`) — who re-renders.
- **Profiler-based analysis** — programmatic `<Profiler onRender>` to show *actualDuration* (last commit).
- **False positive:** Logs/counts look bad (many re-renders); Profiler shows total &lt;2ms — expected, don’t optimize.
- **Real bottleneck:** Profiler shows ExpensiveChartBlock ≥10ms — real performance issue.
- **Wrong optimization:** Someone optimized based on logs only; Profiler shows no improvement.
- **Correct optimization:** Profiler justifies memo on expensive child only; total drops.

**Usage:** Open the demo, switch tabs and click **Increment**. In Debug tabs, use the on-page **Render counts** and **Profiler (last commit)** panels; optionally use React DevTools Profiler for flame graphs.

See **LEARNING-GUIDE.md** for study order, **PR-REVIEW.md** for Senior-level review, and **PROFILING-MISTAKES.md** for common profiling mistakes and when to trust measurements vs intuition.
