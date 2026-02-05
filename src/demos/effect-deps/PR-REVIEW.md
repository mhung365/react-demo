# Senior PR Review: useEffect dependency array demo

## What's good

- **Contract and React's decision:** Concepts explain that the dependency array is a promise to React ("re-run when any of these change, Object.is") and that React compares previous vs current deps. useWhyEffectRan logs "reason: mount" or "reason: deps changed" and which deps changed — makes the decision visible.
- **Missing deps (bug + fixed):** Same UI; bug has [] but uses userId → stale. Fixed has [userId] + cleanup. No eslint-disable in the fixed path; refactor satisfies ESLint and fixes logic.
- **ESLint satisfied, logic wrong:** Two scenarios: (1) Unnecessary re-runs — we add count to deps because we use it in the effect, but we only wanted mount; refactor removes count from effect so deps = []. (2) Wrong trigger — we add searchQuery to deps so we "fetch" on every keystroke; product wanted fetch on Search click; refactor uses effect [userId] only and onClick for Search.
- **Explicit logs:** Each example logs why the effect ran (mount vs deps changed) and what the bug or fix is. useWhyEffectRan compares prev/current deps with Object.is and logs "changed: [depNames]".
- **Refactors without disabling ESLint:** MissingDepsFixed adds deps + cleanup. AllDepsUnnecessaryRefactored doesn't use count in effect. AllDepsWrongLogicRefactored uses event handler for Search; effect only [userId]. All satisfy exhaustive-deps with correct behavior.

---

## Common mid-level mistakes with dependency arrays (and how this demo addresses them)

### 1. "I'll add eslint-disable so the warning goes away"

**Mistake:** Disabling react-hooks/exhaustive-deps when the linter complains. That hides real bugs: if you use a value in the effect and don't list it, the effect won't re-run when that value changes — stale closure. Fix by adding the correct dep (and cleanup if you subscribe or set up something).

**Demo:** MissingDepsBug intentionally has [] and uses userId; we show the bug (stale). MissingDepsFixed adds [userId] and cleanup; no disable.

### 2. "I added everything ESLint wanted, so it's correct"

**Mistake:** Assuming "all deps included" means "logic is correct." ESLint only checks "every value used in the effect is in the list." It doesn't know your intent. Adding searchQuery because you use it in the effect can mean "fetch on every keystroke" when you wanted "fetch on Search click." Adding count because you log it can mean "effect runs on every count change" when you wanted "run once on mount."

**Demo:** AllDepsWrongLogic has [userId, searchQuery]; fetch runs on every keystroke. AllDepsUnnecessaryRuns has [count]; effect runs on every count change. Refactors fix the intent (event handler for Search; remove count from effect).

### 3. "Empty array [] means run once"

**Mistake:** [] means "run after mount and never re-run (until unmount)." So cleanup still runs on unmount. And if you use a value from render inside the effect with [], that value is stale when it changes — so [] is only correct when the effect truly doesn't depend on any changing value (or you use a ref for "latest").

**Demo:** MissingDepsBug has [] but uses userId — stale. So [] was wrong. MissingDepsFixed has [userId] because we depend on userId.

### 4. "I need to fetch when the user clicks Search, so I'll put searchQuery in the effect deps"

**Mistake:** "Fetch when user clicks Search" is an **event** — handle it in onClick. Putting searchQuery in effect deps means "re-run effect when searchQuery changes" (e.g. every keystroke). Effect is for "sync with external system or run when these values change"; "when user clicks" is event-driven.

**Demo:** AllDepsWrongLogic has searchQuery in deps → fetch on keystroke. Refactored: effect [userId] only; handle Search in onClick with current searchQuery.

### 5. "I use count in the effect so I have to add count to deps"

**Mistake:** If you only needed count for a log or for a callback that runs later (e.g. notification handler), you might not want the effect to re-run when count changes. Options: (1) Don't use count in the effect (run once). (2) Use a ref to hold "latest count" and read ref.current in the callback — then you don't add count to deps and the effect doesn't re-run. Adding count to deps is correct for "when count changes, do X"; wrong for "run once on mount and have access to latest count in a callback."

**Demo:** AllDepsUnnecessaryRuns uses count in the effect and adds [count] → effect runs every time. Refactored: effect doesn't use count; deps []; runs once.

### 6. "Object.is vs ===" 

**Mistake:** React uses Object.is for dep comparison. For primitives it's like ===. For objects/functions, same reference → same; new {} or () => {} every render → "changed" every time. So stable refs (useMemo/useCallback) matter if you put objects/functions in deps.

**Demo:** useWhyEffectRan logs "React compared with Object.is" and shows prev vs current deps. Other demos (expensive-child) cover reference equality for props.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useWhyEffectRan stores prev deps in ref | Clear "reason: mount vs deps changed" and which deps changed | Extra effect run (same deps as component); dev-only in practice |
| Six tabs (bug, fixed, unnecessary, refactored, wrong logic, refactored) | Each scenario focused | More UI; could group bug+fixed and wrong+refactored |
| Intentional eslint-disable in MissingDepsBug | Shows the bug without ESLint noise in that one file | Could be confusing; comment explains it's demo-only |
| Simulated "fetch" (setState only) | No real API; focus on when effect runs | Doesn't show abort/cancel; could extend with fake fetch + cleanup |

---

## When a different pattern is better than useEffect

| Need | Prefer | Why |
|------|--------|-----|
| **Fetch when userId changes** | useEffect with [userId] + cleanup (or React Query) | Effect syncs with "userId" as external input. |
| **Fetch when user clicks Search** | onClick handler | Event-driven; not "when searchQuery changes." |
| **Derive value from state/props** | Compute in render or useMemo | Don't useEffect + setState; causes extra render and can flicker. |
| **Subscribe to external store** | useEffect subscribe + cleanup with [store] or [] | Depends on whether subscription depends on props/state. |
| **Run once on mount** | useEffect with [] | No deps = run after mount only. Don't put values you use in the effect if they change and you don't want re-run — use ref for "latest" if needed. |
| **Sync with URL** | useEffect with [pathname/searchParams] or router API | Effect syncs with external (URL). |
| **Form submit** | onSubmit handler | Event; not effect. |
| **Server cache / fetch** | React Query, SWR, or framework data APIs | They handle deps, cache, dedup; don't reimplement in useEffect. |

**Rule of thumb:** Effect = "sync with something external or run when these values change." Event = "when user did X" → handler. Derivation = "compute from state/props" → render or useMemo. Don't disable exhaustive-deps; fix the contract or change the pattern.

---

## Why "just disable the rule" is usually a bad idea

1. **Hides stale bugs:** The most common bug is missing a dep — effect uses a value but doesn't list it, so when the value changes the effect doesn't re-run and the UI or side effect is stale. Disabling the rule means you won't be warned and the bug will ship.
2. **No incentive to fix the design:** Disabling encourages "make the warning go away" instead of "why does the effect need this value? Should it be in deps, or should this be an event handler / derived state / ref?"
3. **Team habit:** If one place disables, others copy. Soon many effects have missing deps and subtle bugs.
4. **Rare valid disable:** Sometimes you intentionally want "run once and I know this value might be stale in a callback" (e.g. you use a ref for latest). That's a deliberate choice; document it. Blanket disable is not.

**Rule of thumb:** Fix by (1) adding the correct deps and cleanup, or (2) changing the pattern (event handler, useMemo, ref). Disable only when you've explicitly decided "run once, stale is OK here" and you've documented it.
