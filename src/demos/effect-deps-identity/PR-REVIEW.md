# Senior PR Review: useEffect deps identity demo

## What's good

- **Explicit prev vs next logs:** useDepsCompareLog stores previous deps in a ref and logs "same=false (ref equal=false)" when the effect re-runs because of a new reference. Makes reference identity visible — "values look the same but identity changed."
- **Unstable vs stable side-by-side:** Same effect shape (config, onComplete); unstable uses inline object/function → effect re-runs every render; stable uses useMemo/useCallback → effect runs once. Effect run count proves it.
- **No-effect refactor:** NoEffectRefactored shows that when the sync is "when user clicks Apply," an event handler is the right pattern — no effect, no dependency array, no reference identity issues.
- **Derived value in unstable:** config includes `count` so it's not just "inline object" but "derived object every render" — covers the case where a value is computed from state and accidentally becomes an unstable dep.
- **Concepts:** Object.is, reference identity, and "stabilize or remove effect" are stated clearly.

---

## Common developer misconceptions (and how this demo addresses them)

### 1. "The values are the same, so the effect shouldn't re-run"

**Misconception:** Believing React does a "deep" or "value" comparison of dependencies. React uses Object.is (reference equality). Two objects with the same keys and values but different references (e.g. two `{ theme: 'dark' }` created in different renders) are not "the same" for React — effect re-runs.

**Demo:** UnstableDepsBug: config and onComplete "look" the same every time (theme: 'dark', same callback behavior) but are new references → console shows "same=false" → effect re-runs.

### 2. "I'm not putting an object in deps — I'm putting a variable that holds an object"

**Misconception:** The variable (e.g. config) is the same "name" but may hold a new object every render. What goes into the dependency array is the *value* (the reference). If that value is a new object each time (because you do `const config = { ... }` in render), the dep is "new" every time.

**Demo:** config = { theme: 'dark', count } — same variable name, new object reference every render. useDepsCompareLog shows prev config !== current config.

### 3. "Derived values are safe to put in deps"

**Misconception:** "I derived config from state, so it's correct to list config in deps." If the derivation creates a new object/array/function every time (e.g. `const config = { theme, count }`), the reference changes every render. So the effect re-runs every time. Either stabilize the derivation (useMemo with the right deps) or list the primitives (theme, count) in the effect deps instead of the derived object.

**Demo:** config is derived (includes count); we put config in deps → unstable. Stable refactor uses useMemo so config reference is stable (or we could have put [theme, count] in effect deps and built config inside the effect).

### 4. "I'll just use useMemo/useCallback for everything in deps"

**Misconception:** Stabilizing every object/function with useMemo/useCallback "to be safe" adds cost (memory, comparison, dependency arrays to maintain) and can hide bugs when the value *should* change (e.g. you stabilize with [] but the callback should depend on latest state — now you have a stale closure). Use memo/callback when you need a stable reference for a specific reason (effect deps, memoized child props); don't wrap everything.

**Demo:** Stable refactor uses useMemo/useCallback with [] because we want "run once on mount." If we had wanted "run when theme changes," we'd use useMemo(..., [theme]). PR-REVIEW below explains when stabilizing is a bad idea.

### 5. "The effect has to run when this value changes, so I must put it in deps"

**Misconception:** Sometimes the "sync" doesn't need to be "when this value changes" — it needs to be "when the user does X" (e.g. Apply, Submit). In that case, don't use an effect with that value in deps; use an event handler. Effect is for "sync with external system or run when these values change"; event is for "when user did X."

**Demo:** NoEffectRefactored: sync on Apply click, not on every theme change. No effect; no deps; no identity issue.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useDepsCompareLog stores prev deps in ref | Clear "prev vs current" and "same/ref equal" in console | Extra effect run (same deps as component); dev-only in practice |
| Three tabs (unstable / stable / no effect) | Each pattern focused | More UI |
| config includes count in UnstableDepsBug | Shows derived value = new object when count changes (and even when nothing "meaningful" changes, re-render still creates new refs) | Slightly more complex |

---

## When stabilizing dependencies is a bad idea

- **When the value should change and trigger the effect:** If you stabilize with empty deps (e.g. useCallback(fn, [])) but the callback or object should depend on changing state/props, you've created a stale closure or stale config. The effect won't re-run when it should. Prefer correct deps (and accept re-runs) or ref for "latest" if you explicitly don't want to re-run.
- **When you're wrapping everything "just in case":** useMemo/useCallback have cost (storing the value, comparing deps). Use them when you have a clear reason: effect deps, React.memo props, or referential equality in a child. Don't wrap every object/function in the component.
- **When the right fix is to remove the effect:** If the sync is event-driven (user click, submit), use an event handler. Stabilizing an unnecessary effect still leaves an effect that runs on mount — and if the logic is "on user action," the effect might be the wrong abstraction.
- **When primitives are enough:** If you can put [userId, theme] in the effect deps instead of [config] where config = { userId, theme }, do that. No need to stabilize config; the effect re-runs when userId or theme change, and you build config inside the effect if needed.
- **When it hides bugs:** Stabilizing a callback with [] when it uses state can hide stale-closure bugs. The callback never updates; it always sees initial state. Prefer correct deps or functional updates.

**Rule of thumb:** Stabilize when you need a stable reference for a specific reason (effect deps that would otherwise be new every render, or memoized child props). Don't stabilize to "make the warning go away" without understanding why the reference changes; sometimes the fix is to remove the effect or list different deps (e.g. primitives).

---

## How this can fail or confuse at scale

1. **Overuse of useMemo/useCallback:** Every object and function wrapped → harder to read, dependency arrays everywhere, and risk of stale closures when deps are wrong (e.g. [] when it should be [x]).
2. **Mixing "stable for effect" with "stable for memo":** Effect deps need to reflect "when should this effect re-run." Memo deps need to reflect "when should this value be recomputed." They're not the same. Don't copy-paste the same deps without thinking.
3. **Deep objects:** useMemo(() => ({ a: 1, b: x }), [x]) gives a new object when x changes — correct. If the object is deeply nested or built from many sources, the dependency array for useMemo can get long; consider whether a different structure (e.g. pass primitives to the effect) is simpler.
4. **Ref in deps:** Putting a ref in the dependency array doesn't work as intended — ref.current can change without triggering a re-run (refs don't trigger re-renders). So "stabilizing" by putting ref in deps is wrong. Use state or the actual value if you need the effect to re-run.

**Rule of thumb:** Understand why the effect is re-running (reference identity). If it's because of inline/derived object or function, either stabilize with useMemo/useCallback and the *correct* deps, or remove the effect and use an event handler / different pattern.
