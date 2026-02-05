# useEffect dependency array: contract and ESLint

This demo teaches **what the dependency array promises to React**, **how React decides to re-run an effect**, and **when ESLint can be satisfied but logic is still wrong**.

## What you'll see

- **Missing deps (bug):** Effect uses `userId` but deps are `[]`. Switch user → "Loaded for" stays on the first user (stale). ESLint warns. Console: effect ran once with initial userId; when you change userId, effect does not re-run.
- **Missing deps (fixed):** Effect uses `userId`, deps `[userId]`. Switch user → cleanup runs → effect re-runs. "Loaded for" updates. No ESLint disable.
- **Unnecessary re-runs:** Effect should run once on mount (e.g. subscribe). We use `count` inside (e.g. log it), so ESLint says add `count`. We do. Effect re-runs on every count change — unnecessary. Refactor: don't use count in effect; deps `[]`.
- **Unnecessary (refactored):** Effect doesn't use count; deps `[]`. Effect runs once. No unnecessary re-runs.
- **Wrong logic (fetch on keystroke):** Requirement: fetch when userId changes OR user clicks Search. We put `[userId, searchQuery]` in deps. Effect runs on every keystroke — wrong. Refactor: effect only `[userId]`; Search → onClick handler.
- **Wrong logic (refactored):** Effect `[userId]` only; Search click handled in onClick. No fetch on keystroke.

## How to run

1. Start the app and open **"useEffect deps"**.
2. Open DevTools → Console.
3. **Missing deps (bug):** Switch user-2 → "Loaded for" stays user-1. Console: effect ran once.
4. **Missing deps (fixed):** Switch user-2 → "Loaded for" updates. Console: cleanup → effect ran; "reason: deps changed".
5. **Unnecessary:** Click Increment → effect run count goes up every time. Refactored: run count stays 1.
6. **Wrong logic:** Type in input → fetch count goes up on every keystroke. Refactored: type doesn't trigger fetch; Search click does.

## Concepts

| Term | Meaning |
|------|--------|
| **Contract** | The dependency array promises React: "Re-run this effect when any of these values change (Object.is)." [] = never re-run after mount. |
| **How React decides** | After commit, React compares each dep with its previous value (Object.is). If any differ, cleanup runs, then effect runs with new values. |
| **ESLint exhaustive-deps** | Warns when you use a value in the effect that isn't in deps. Enforces "contract completeness" but can't know intent. |
| **ESLint satisfied, logic wrong** | (1) Unnecessary re-runs: we added a dep so effect runs when we only wanted mount. (2) Wrong trigger: we added searchQuery so we fetch on every keystroke; we wanted fetch on Search click. |
| **Don't disable the rule** | Fix by correct deps + cleanup, or by a different pattern (event handler, ref, derived state). |

## Files

- `EffectDepsDemo.tsx` — Shell and tabs.
- `useEffectDepsLog.ts` — useWhyEffectRan: logs "effect ran — reason: mount | deps changed" and which deps changed.
- `MissingDepsBug.tsx` / `MissingDepsFixed.tsx` — Stale vs correct.
- `AllDepsUnnecessaryRuns.tsx` / `AllDepsUnnecessaryRefactored.tsx` — Unnecessary re-runs vs run once.
- `AllDepsWrongLogic.tsx` / `AllDepsWrongLogicRefactored.tsx` — Fetch on keystroke vs fetch on Search click.
