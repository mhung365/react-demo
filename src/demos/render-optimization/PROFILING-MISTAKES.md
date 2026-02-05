# Common mistakes when profiling React apps

Use this alongside the **Debug & measure** tabs: False positive, Real bottleneck, Wrong optimization, Correct optimization.

---

## 1. Trusting render logs/counts without Profiler

| Mistake | Why it’s wrong | What to do |
|--------|-----------------|------------|
| “We have 50 re-renders per click, we must optimize.” | Re-render count says nothing about *duration*. 50 components each taking 0.01ms is fine. | Use **Profiler** (DevTools or programmatic) to see *actualDuration* per component. Optimize only where duration is high (e.g. ≥10ms). |
| “Console is full of [render] logs, the app must be slow.” | Logs show *that* a component ran, not *how long* it took. | Treat logs as “who re-renders”; use Profiler for “who is slow”. |
| Optimizing based on “high render count” | You may add memo everywhere and get no improvement (or worse, due to comparison overhead). | **Debug: Wrong optimization** tab: same re-renders, no Profiler improvement. Always validate with Profiler. |

---

## 2. Profiler misuse

| Mistake | Why it’s wrong | What to do |
|--------|-----------------|------------|
| Profiling in development only, ignoring production build | Dev build is slower; minified production can behave differently. | Profile production build when possible (e.g. `npm run build && npm run preview`). |
| Profiling once and assuming it’s representative | One commit might be fast; another might be slow (e.g. after navigation). | Record several commits (e.g. click Increment 3–5 times); look at worst case or average. |
| Ignoring “Why did this render?” (React DevTools) | Profiler shows *duration*; “Why did this render?” shows *cause* (props/state/context). | Use both: duration to find bottleneck, “Why did this render?” to fix (e.g. unstable props). |
| Wrapping the whole app in one Profiler only | You see total time but not which component is slow. | Add nested Profilers around suspected subtrees, or use React DevTools Profiler’s flame graph to drill down. |

---

## 3. Expected vs problematic re-renders

| Type | How it looks | Action |
|------|----------------|--------|
| **Expected** | Many components re-render (counts go up); Profiler total &lt; ~2ms; no jank. | Don’t optimize. This is normal when parent state changes. |
| **Problematic** | One or more components show ≥10ms in Profiler; user notices lag. | Optimize: memo + stable props, or colocate state, or virtualize list. |

**Demo:** **Debug: False positive** = expected (counts high, Profiler fine). **Debug: Real bottleneck** = problematic (ExpensiveChartBlock ≥10ms).

---

## 4. When to trust measurements vs intuition

| Trust measurements when… | Trust intuition with caution when… |
|--------------------------|-------------------------------------|
| You have Profiler data (actualDuration) for the scenario that users report (e.g. “click causes lag”). | You “feel” the app is slow but haven’t recorded a slow commit. |
| You’ve profiled the same action multiple times and see a consistent slow component. | You’re guessing which component is slow without profiling. |
| You’ve compared before/after (e.g. before memo vs after memo) with Profiler. | You assume “fewer re-renders” always means “faster” (wrong optimization tab shows otherwise). |

**Rule:** Optimize only when **measurement** (Profiler) shows a bottleneck. Use intuition to decide *where* to add Profilers or *what* to try first; use measurement to confirm.

---

## 5. Summary

1. **Render counters/logs** → “Who re-renders?” (expected vs noisy).
2. **Profiler** → “Who is slow?” (actualDuration).
3. **False positive** → High counts, low duration → don’t optimize.
4. **Real bottleneck** → High duration on one component → fix that component (memo + stable props, etc.).
5. **Wrong optimization** → Optimized based on logs only → no gain; validate with Profiler.
6. **Correct optimization** → Profiler showed bottleneck → fix → Profiler shows improvement.
