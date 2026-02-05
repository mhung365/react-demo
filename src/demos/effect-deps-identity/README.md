# useEffect re-runs when deps look unchanged

This demo teaches **reference identity** in effect dependency comparison: why effects re-run even when values "look the same," and how to fix it (stabilize deps or remove the effect).

## What you'll see

- **Unstable deps (bug):** Effect deps are `[config, onComplete]` where `config = { theme: 'dark', count }` and `onComplete = () => {}` — new object and function every render. Each click (re-render) → effect re-runs. Console: "same=false (ref equal=false)". Effect run count increases every time.
- **Stable deps (useMemo/useCallback):** Same effect but `config = useMemo(() => ({ theme: 'dark' }), [])` and `onComplete = useCallback(() => {}, [])`. Same reference every render → effect runs only on mount. Effect run count stays 1.
- **No effect (event handler):** The "sync" is triggered by user click (Apply), not by "config changed." No effect; no dependency array; no reference identity. Apply runs in onClick.

## How to run

1. Start the app and open **"useEffect deps identity"**.
2. Open DevTools → Console.
3. **Unstable:** Click Increment several times — effect run count goes up each time. Console shows "effect ran — deps comparison" and "same=false (ref equal=false)" for config and onComplete.
4. **Stable:** Click Increment — effect run count stays 1. Same references; effect does not re-run.
5. **No effect:** Change theme and click Apply — sync happens on click only.

## Concepts

| Term | Meaning |
|------|--------|
| **Object.is** | React compares each effect dep with its previous value using Object.is. For objects/functions: same reference → true; new {} or () => {} → false → effect re-runs. |
| **Reference identity** | Two values "look the same" (e.g. { theme: 'dark' }) but are different references (new object each render) → Object.is says "changed." |
| **Derived values** | `const config = { theme, count }` creates a new object every render. Putting config in deps → effect re-runs every render. |
| **Stabilize** | useMemo for objects/arrays; useCallback for functions. Same reference until their deps change. Or remove the effect and use an event handler. |

## Files

- `EffectDepsIdentityDemo.tsx` — Shell and tabs.
- `useDepsCompareLog.ts` — Logs prev vs current deps with Object.is (same/ref equal); shows why effect re-ran.
- `UnstableDepsBug.tsx` — Inline config and onComplete → effect re-runs every render.
- `StableDepsRefactored.tsx` — useMemo + useCallback → effect runs once.
- `NoEffectRefactored.tsx` — Apply on click; no effect.
