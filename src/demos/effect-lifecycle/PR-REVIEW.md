# Senior PR Review: useEffect lifecycle demo

## What's good

- **Exact order with logs:** useLifecycleLog logs "1. render", "2. commit (DOM updated)", "3. effect ran", and "2b/3b. cleanup" so the full render → commit → effect lifecycle is visible. Re-render shows cleanup before the next effect run.
- **Correct vs broken side-by-side:** Same subscription pattern; correct returns cleanup (unsubscribe), broken does not. When dep changes: correct path shows unsubscribed → subscribed; broken path shows subscribed again without unsubscribed → double subscription / leak.
- **Unmount scenario:** UnmountDemo toggles mount; when child unmounts we see its effect cleanup (and layout cleanup). No "effect ran" after — component is gone. Clear proof that cleanup runs on unmount.
- **Minimal order demo:** EffectOrderDemo has one state and one effect with [count] dep; no extra logic. Perfect for "click and watch console" to see cleanup → effect on every click after the first.
- **Simulated subscription:** createSubscription gives a real subscribe/unsubscribe API so the correct vs broken difference is about cleanup, not about fake APIs.

---

## Common misconceptions about useEffect (and how this demo addresses them)

### 1. "useEffect runs right after render"

**Misconception:** Thinking effect runs immediately after the component function returns. In reality, effect runs *after* React has committed to the DOM and (for useEffect) after the browser has painted. useLayoutEffect runs after commit but before paint.

**Demo:** useLifecycleLog logs "1. render" then "2. commit (DOM updated)" then "3. effect ran". So effect runs after commit, not "right after" render.

### 2. "Cleanup runs after the new effect"

**Misconception:** Thinking cleanup runs when the component unmounts or "at the end" of the next effect. In reality, cleanup runs *before* the next effect run (when deps change) or on unmount. Order: previous effect's cleanup → (if deps changed) new effect.

**Demo:** EffectOrderDemo: each click (count change) shows "3b. effect cleanup" then "3. effect ran". Cleanup of the previous run happens first.

### 3. "Cleanup only runs on unmount"

**Misconception:** Believing cleanup is only for unmount. Cleanup also runs before the *next* execution of the same effect when dependencies change. If you don't cleanup (e.g. unsubscribe), you get double subscription when deps change.

**Demo:** CorrectEffect: switch channel → cleanup (unsubscribe old) → effect (subscribe new). BrokenEffect: no cleanup → switch channel → effect runs again → second subscription; leak.

### 4. "I don't need to return cleanup for subscriptions"

**Misconception:** "I only subscribe once" or "I'll unsubscribe in the next effect." When deps change, React runs the new effect after running the old effect's cleanup. If you never return a cleanup that unsubscribes, the old subscription is still active when the new one is added — double subscription or leak.

**Demo:** BrokenEffect subscribes without returning cleanup. Switch A → B: we're still subscribed to A and now also to B. Console shows "subscribed" again without "unsubscribed".

### 5. "Effect runs in the same order as declaration"

**Misconception:** Effects run in declaration order, but the important part is: all layout effects (and their cleanups) run in a phase, then all effects (and their cleanups). This demo doesn't stress order between multiple effects; it stresses render → commit → effect and cleanup-before-next-effect.

**Demo:** useLifecycleLog uses both useLayoutEffect and useEffect; we see layout (commit) then effect.

### 6. "Empty deps [] means the effect runs once when the component mounts"

**Misconception:** Mostly correct, but the nuance is: effect runs after the first commit. And when the component unmounts, cleanup runs. So "runs once" is "runs once after mount"; cleanup runs once on unmount. This demo shows that with UnmountDemo.

**Demo:** UnmountDemo child has effect with []; when we unmount, we see effect cleanup. So "runs once" doesn't mean "cleanup never runs" — cleanup runs on unmount.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useLayoutEffect to log "commit" | Makes "after DOM update" explicit | In real code we usually use useEffect for side effects; layout is for DOM measurement or synchronous DOM updates |
| Logging in every phase | Exact order is visible | Console noise; in production you'd remove or gate behind dev |
| Simulated channel (subscribe/unsubscribe) | Realistic pattern; correct vs broken is clear | Not a real WebSocket/API; just in-memory |
| Four tabs (Order / Correct / Broken / Unmount) | Each scenario focused | More UI to maintain |

---

## When NOT to use useEffect at all

- **Deriving state from props/state:** If you're computing something from props or state to display, compute it during render (or useMemo). Don't put it in useEffect and setState — that causes an extra render and can cause flicker or stale UI. Use useEffect for *side effects* (subscriptions, fetch, DOM), not for deriving display data.
- **Responding to user events:** Use event handlers (onClick, onChange). Don't use useEffect to "react" to a click by setting state that you could have set in the handler. useEffect runs after render; events are discrete. Exception: when you need to sync with an external system (e.g. focus an input after mount).
- **Fetching on mount when you have a framework/data library:** In React Query, SWR, or Next.js data APIs, use their primitives. Don't do raw fetch in useEffect for "load on mount" if the app already has a data layer — you duplicate logic and miss cache, dedup, etc.
- **Syncing state to state:** "When A changes, set B" often leads to useEffect with [A] that setState(B). Prefer deriving B during render (useMemo or just compute) so there's one source of truth. Use effect only when B is driven by an *external* system (e.g. URL, subscription).
- **When you need synchronous DOM reads/writes:** useLayoutEffect is the right hook (e.g. measure then update). useEffect runs after paint; layout effect runs after commit, before paint. Don't use useEffect for "measure DOM and set state" if you need to avoid flicker.

**Rule of thumb:** useEffect is for *side effects*: subscribe, fetch, imperative DOM, timers. Not for "derive value from state" or "set state when user clicked" — use render logic and event handlers. And when you do use effect: if you set up something (subscribe, interval, listener), return a cleanup that tears it down.

---

## How this can fail or confuse at scale

1. **Many effects, unclear order:** Multiple effects in one component; when deps change, all cleanups run then all effects run. Order between effects is stable (declaration order) but hard to reason about if effects depend on each other. Prefer one effect per "subscription" or "sync" and clear deps.
2. **Stale closure in effect:** Effect with [] deps that uses a value from render (e.g. userId). That value is stale if it was meant to be "latest". Fix: add the value to deps (and cleanup so you don't double-subscribe) or use ref for "latest" if you explicitly don't want to re-run effect. This demo doesn't show stale closure; render-snapshot demo does.
3. **Cleanup that does too much:** Cleanup should undo what the effect did (unsubscribe, clear interval). Don't put heavy logic or setState in cleanup that could run during re-render — keep cleanup fast and focused.
4. **Effect that setState without cleanup:** If effect fetches and setState, and the component unmounts before the request completes, you may setState on an unmounted component (React 18 strict mode can double-invoke; real unmount still happens). Use abort controller or a "mounted" check in cleanup. This demo doesn't cover async fetch; the subscription pattern is synchronous.

**Rule of thumb:** One effect, one job. Return cleanup that undoes that job. Deps = everything from the effect's closure that the effect depends on. Don't use effect for derivation or event handling.
