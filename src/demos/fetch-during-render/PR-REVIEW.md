# Senior React PR review: Fetch during render demo

## What was implemented

- **FetchDuringRenderBroken:** Unconditional `fetchAppConfig().then(setConfig)` in the component body. Every render starts a new fetch; when one resolves, setState causes re-render → another fetch → infinite loop. Explicit `[render]` and "fetch during render" logs.
- **ConditionalFetchDuringRender:** Fetch only when `!config`. No infinite loop but render is still impure; illustrates double-fetch in Strict Mode and "conditional doesn't fix impurity."
- **FetchInEffectCorrect:** Same UI; fetch in `useEffect` with cleanup. Render is pure (no fetch, no setState from async in body).
- **LEARNING-GUIDE:** Definition of pure render; why fetch during render causes infinite loop and subtle bugs; why developers try it anyway; contrast with React Query, Suspense, Server Components.

---

## PR review (Senior lens)

### What's good

- **Clear cause-effect:** Unconditional fetch in render → infinite loop is visible in the console (repeated `[render]` and "fetch during render"). No need to explain in theory; the demo proves it.
- **Conditional case:** Shows that "we only fetch when !data" doesn't make render pure; it only avoids the loop. Strict Mode double-render and "any re-render can trigger another fetch" are the right teaching points.
- **Correct version is minimal:** useEffect + cancelled flag; no extra library. Reinforces "side effect goes in effect."
- **Contrast with RQ/Suspense/Server Components:** LEARNING-GUIDE correctly explains that useQuery doesn't run the queryFn during the component's render pass, that Suspense throws a promise (fetch is cache-driven), and that Server Components run on the server (different execution model). That prevents "but React Query looks like fetch during render" confusion.

### Things to watch

- **Broken tab can flood the console:** Infinite loop means many logs. The demo is intentionally broken; consider adding a note in the UI like "Switch to another tab to stop the loop" or a guard that stops after N renders in dev (optional). For teaching, the flood is acceptable.
- **Conditional example:** In production, some codebases do "if (!data) fetch().then(setData)" and "it works." The demo plus LEARNING-GUIDE should make it clear: it's still wrong (impure, double-fetch in Strict Mode, dependent on render count).

### Common misconceptions

1. **"I only fetch once because I have `if (!data)`."**  
   You still started a side effect during render. React may render twice (Strict Mode) or re-render for other reasons before the first request completes → duplicate requests. Render must not start fetches.

2. **"React Query / useQuery is fetching during render."**  
   The component calls `useQuery` during render, but the **queryFn** (the actual fetch) is run by the library in a separate step (effect-like). The component body stays pure; it just returns JSX and asks for data.

3. **"Server Components fetch during render."**  
   They run on the server, once per request. There's no client re-render loop. So "during render" there is a different phase. On the client, you still must not fetch in the component body.

4. **"Async component would fix it."**  
   React components cannot be async (hooks rules). Wrapping in a pattern that "awaits" during render (e.g. throwing a promise for Suspense) doesn't mean you call `fetch()` in the body; the cache/library starts the fetch, and the component suspends.

### Trade-offs

- **Pure render:** You give up "fetch in the component body" and put fetch in useEffect or a library. You gain predictable behavior: no infinite loops, no duplicate fetches from re-renders, and compatibility with Strict Mode and concurrent features.
- **Teaching:** Showing the infinite loop once is worth the console flood; it makes the rule concrete.

Summary: the demo correctly demonstrates why fetch during render is wrong (infinite loop, impure render, duplicate fetch) and contrasts with patterns that look like "fetch during render" but don't violate purity (React Query, Suspense, Server Components). LEARNING-GUIDE and PR-REVIEW spell out the mental model and misconceptions.
