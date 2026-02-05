# Senior PR Review: useMemo cost demo

## What's good

- **Cost of memoization is explicit:** Concepts state that useMemo pays dep comparison every render and storage; when deps are stable we skip the factory; when deps are unstable we recompute every time and never use the cache.
- **Dashboard with explicit measurements:** Dashboard tab shows a production-style layout with shared `tick` state (frequent updates) and four panels. Each panel displays **"Last render: Xms"** so you can compare without opening the console: cheap no-memo (baseline), cheap with useMemo (often slightly higher due to comparison overhead), expensive justified (cache hit keeps render low), unstable deps (recompute every time → high). useMeasureRender now accepts an optional `onMeasured(ms)` callback so the UI can show last render time.
- **Unnecessary vs better without:** Same cheap computation; UnnecessaryUseMemo wraps in useMemo (overhead, no benefit); BetterWithoutUseMemo just computes in render (no memo cost). Clear contrast.
- **Justified useMemo:** Expensive computation (simulated) + memoized child. When parent re-renders for count, useMemo([list]) returns cached result → child skips. Factory doesn't run again; child render count stays 1. Demonstrates when useMemo prevents a real performance issue.
- **Unstable deps:** useMemo with [config] where config is a new object every render. We recompute every time; cache never used. We pay comparison + factory every render — dependency instability nullifies memoization; worse than no useMemo.
- **Explicit logs/measurements:** useMeasureRender logs [measure] render time; factory logs show "useMemo factory ran" and "cache hit" or "deps changed"; JustifiedUseMemo shows child render count. Dashboard adds on-screen "Last render" ms for direct comparison of render time vs memo cost.

---

## Common misuse of useMemo (and how this demo addresses them)

### 1. Using useMemo "just in case" for every derived value

**Misuse:** Wrapping every object, array, or computed value in useMemo "for performance." For cheap computations and when no consumer needs a stable reference, useMemo adds comparison + storage overhead with no benefit. The component re-renders anyway (e.g. parent state changed); the memoized value isn't passed to a memoized child or used in a dependency array where stability matters.

**Demo:** UnnecessaryUseMemo uses useMemo for cheapComputation(); no child needs the stable ref. BetterWithoutUseMemo does the same without useMemo — simpler, no memo overhead.

### 2. Using useMemo with unstable dependencies

**Misuse:** useMemo(() => compute(), [config]) where config = { ... } is created every render. config is a new reference every time → React compares deps with Object.is → "changed" every time → we recompute every time. We never get a cache hit. We pay: comparison every render + factory every render. We're strictly worse than no useMemo (we'd just run the factory in render without the comparison).

**Demo:** UnstableDepsUseMemo has [config] with config = { theme: 'dark' } every render. Factory runs every time; console shows "deps unstable, recomputing." Nullifies memoization.

### 3. Using useMemo when the consumer isn't memoized

**Misuse:** useMemo to "stabilize" a value passed to a child that isn't wrapped in React.memo. The child re-renders when the parent re-renders anyway (same props or not — child doesn't do shallow compare). So the stable reference doesn't prevent any re-render. useMemo only helps when the consumer is memoized (or uses the value in a dependency array where stability matters).

**Demo:** JustifiedUseMemo has a memoized child (ExpensiveListChild) that receives the result. When useMemo returns cached value, same ref → child skips. Without a memoized consumer, useMemo wouldn't prevent child re-renders.

### 4. Using useMemo for primitive or simple computations

**Misuse:** useMemo(() => count * 2, [count]) or useMemo(() => 'dark', []). Primitives are compared by value; the "reference" of a number or string doesn't matter for React.memo (primitives are compared by value). So useMemo for a primitive adds overhead (comparison, storage) with no benefit unless you're returning an object/array and need that reference stable. For primitives, just compute in render.

**Demo:** Conceptually covered — "cheap computation" in UnnecessaryUseMemo is returning an object; the point is "cheap + no stable-ref consumer = skip useMemo." Same idea applies to primitives: no need to memoize.

### 5. Assuming useMemo "caches" without considering deps

**Misuse:** "I added useMemo so it's cached." The cache is invalidated whenever any dep (Object.is) changes. If deps are new every render (inline object/array), we never hit the cache. Memoization only helps when deps are stable across renders.

**Demo:** UnstableDepsUseMemo shows that unstable deps → recompute every time → cache never used.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useMeasureRender with queueMicrotask | Approximate render time in console | Microtask runs after render; not exact "end of render"; good enough for demo |
| Simulated expensive work (loop) | Clear "expensive" vs "cheap" | Not representative of all real work (e.g. filter/sort on large list) |
| Four tabs (unnecessary / better / justified / unstable) | Each scenario focused | More UI |
| JustifiedUseMemo: expensive work in both parent factory and child | Shows child skip when ref stable | In real app you might not want expensive work in child; point is "memo prevents child re-render" |

---

## When NOT to optimize with useMemo

- **No measured performance problem:** Don't add useMemo "just in case." Profile first. Add useMemo when you've measured that (1) the computation is expensive and runs too often, or (2) a memoized child is re-rendering unnecessarily because of an unstable prop.
- **Cheap computation:** If the computation is trivial (e.g. return constant object, simple arithmetic), the cost of useMemo (comparison, storage) can be comparable or more than the computation. Just compute in render.
- **No consumer that needs stable ref:** If you're not passing the value to a memoized child (or using it in useEffect/useMemo deps where stability matters), useMemo doesn't prevent any re-render or re-run. Skip it.
- **Unstable deps:** If the dependency array contains values that change every render (e.g. inline object/array), useMemo will recompute every time and never cache. Fix the deps (e.g. useMemo for the dep, or use primitives) or remove useMemo.
- **Overuse:** Wrapping every derived value in useMemo makes the code harder to read and maintain; dependency arrays can be wrong (stale) or unnecessary. Prefer clarity; add useMemo only where profiling shows a win.

**Rule of thumb:** Default to no useMemo. Add useMemo when (1) you have measured a performance issue (expensive computation or unnecessary child re-renders), and (2) you have stable dependencies. Don't use useMemo for cheap computation with no stable-ref consumer; don't use it with unstable deps.

---

## How this can fail or confuse at scale

1. **Micro-optimization everywhere:** Every component has useMemo on every derived value. Code becomes hard to follow; dependency arrays get out of sync; the "optimization" may not help and can hurt (comparison cost, memory).
2. **Stale deps in useMemo:** If you forget to add a value to the dependency array, the memoized value can be stale. ESLint exhaustive-deps helps; but adding everything can make deps unstable (e.g. inline object) and nullify memoization. Balance correctness and stability.
3. **Expensive work in the wrong place:** JustifiedUseMemo has expensive work in the factory. In a real app, you might also have expensive work in the child (e.g. list render). useMemo prevents recompute and child re-render when deps unchanged; it doesn't remove the cost of the first compute or the first child render. Profile to see where the time actually goes.
4. **Comparing "render vs memo cost" in isolation:** The demo shows "with useMemo" vs "without useMemo" and "unstable deps." In a real app, the win from useMemo is often "child didn't re-render" (fewer component executions, fewer DOM updates). The "cost" of useMemo (comparison) is usually small; the "cost" of unnecessary recompute + child re-render can be large. So useMemo is justified when the avoided work (recompute + child re-render) is greater than the memo overhead. The demo illustrates when there's nothing to avoid (unnecessary) or when we never cache (unstable) — then memo is pure cost.

**Rule of thumb:** useMemo is a tool for when you've measured a problem (expensive computation or unnecessary re-renders) and have stable deps. Don't default to useMemo; default to simple code and add useMemo where profiling shows a clear win.
