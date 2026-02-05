# Test strategy: Effect logic at scale

## Why effect-heavy logic is brittle at scale

When business logic lives inside useEffect across many components:

- **No single place to unit test.** Each component has its own copy of validate/normalize/sort. To test "does invalid status get filtered?" you must render that component, mock fetch, trigger the effect, and assert state. Repeat for every screen that does the same thing.
- **Duplication.** Changing the rule (e.g. add a new valid status) requires finding and updating every effect that inlines that logic. Easy to miss one; no type-level guarantee that all call sites use the same rule.
- **Hard to reason about.** Long effect callbacks mix "when to run" with "what to compute." At scale, many such effects make it unclear where business rules live and how they're tested.
- **Integration-only testing.** You end up testing "component + effect + fetch" together. Slow, flaky (async, mocks), and you still don't get fast, focused tests for a single rule.

Refactoring by separating **pure business logic** (testable in isolation) from **side-effect orchestration** (useEffect in a hook) fixes this: one place for rules, one place for "when to run."

---

## What to test and where

| Layer | What | How | Example |
|-------|------|-----|--------|
| **Pure logic** | validateItems, normalizeToViewModels, sortByUpdatedDesc, computeSummary, processRawItems | Unit tests: pass input, assert output. No React, no mocks. | `dashboardLogic.test.ts` |
| **Hook (orchestration)** | useDashboardData: when filters change, fetch runs; processRawItems applied; loading/error state | renderHook, mock fetchRawDashboard, change filters, assert result.current | Mock module; wait for loading: false; expect items/summary |
| **Component** | Filter state, render list/summary | Shallow render or user events; assert DOM or that hook is called with right filters | Optional; thin component so snapshot or smoke test often enough |

---

## Example: unit tests for pure logic

See `dashboardLogic.test.ts`. Summary:

- **validateItems:** Filter invalid status; only active/archived; empty when all invalid.
- **normalizeToViewModels:** camelCase, Date, displayLabel.
- **sortByUpdatedDesc:** Newest first; does not mutate input.
- **computeSummary:** total, activeCount, archivedCount, lastUpdated; lastUpdated null for empty.
- **processRawItems:** Full pipeline; invalid filtered; items sorted; summary correct.

Run: `npm run test` (or `npm run test:watch`).

---

## Hook test strategy (useDashboardData)

With `@testing-library/react` and `renderHook`:

1. Mock `fetchRawDashboard` (e.g. vi.mock('./mockApi') and return a known RawApiResponse).
2. Render the hook: `const { result } = renderHook(() => useDashboardData({ status: 'all', search: '' }))`.
3. Wait for loading to become false (e.g. await waitFor(() => expect(result.current.loading).toBe(false))).
4. Assert `result.current.items` and `result.current.summary` match the output of `processRawItems(mockRawResponse.items)`.
5. Change filters (rerender with new initialProps or use result.current and a setter if the hook allowed it). Assert refetch and new state.

The hook test does **not** re-test the pure logic (that's in dashboardLogic.test.ts). It only tests that the effect runs, calls fetch, and applies the pipeline to the response.

---

## Separation of concerns

- **Pure logic** = same input → same output; no side effects. Lives in `dashboardLogic.ts`. Test with unit tests.
- **Orchestration** = when to run (deps), cleanup, loading/error. Lives in useEffect inside `useDashboardData`. Test with renderHook + mock fetch.
- **Component** = UI state (filters), call hook, render. Thin; test with render or snapshot if needed.

This keeps tests fast (pure logic) and focused (hook tests don't duplicate business-rule tests).
