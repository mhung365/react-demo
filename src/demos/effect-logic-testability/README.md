# Effect logic and testability

## What this demo covers

- **Heavy logic in useEffect:** Validation, normalization, sort, and summary are inline in the effect callback. To unit test that logic you must render the component, mock fetch, trigger the effect (mount or deps change), wait for async, then assert on state. Logic is not testable in isolation.
- **Refactored:** Business logic in `dashboardLogic.ts` (pure functions: validateItems, normalizeToViewModels, sortByUpdatedDesc, computeSummary, processRawItems). Effect orchestration in `useDashboardData` (when to fetch, cleanup, loading/error). Component is thin (filter state + hook + render).
- **Testing:** Pure functions are unit-tested without React (pass input, assert output). Hook is testable with `renderHook` (mock fetchRawDashboard, change filters, assert returned state). Component tests can be shallow or integration.

## How to run

1. Run the app and open **Effect logic (testability)** from the nav.
2. Switch tabs: **Heavy logic in useEffect** vs **Refactored (pure + hook)**. Same UI; refactored version separates orchestration from business logic.
3. To add tests: unit test `dashboardLogic.ts` (e.g. `processRawItems(raw)` → `{ items, summary }`). Test `useDashboardData` with `@testing-library/react` `renderHook`, mock `fetchRawDashboard`, change filters, assert `result.current.items` and `result.current.summary`.

## Files

| File | Purpose |
|------|--------|
| `HeavyLogicInEffect.tsx` | All logic inline in useEffect; hard to test. |
| `dashboardLogic.ts` | Pure functions: validate, normalize, sort, summary, processRawItems. |
| `useDashboardData.ts` | Custom hook: effect orchestration + calls processRawItems. |
| `RefactoredPureAndHook.tsx` | Thin component: filter state + useDashboardData + render. |
| `mockApi.ts` | fetchRawDashboard(filters) → raw items. |
