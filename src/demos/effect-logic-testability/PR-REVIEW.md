# Senior React PR review: Effect logic and testability

## What was implemented

- **HeavyLogicInEffect:** Validation, normalization, sort, and summary are inline in the useEffect callback. Same behavior as refactored version; logic is coupled to React and not unit-testable in isolation.
- **dashboardLogic.ts:** Pure functions: validateItems, normalizeToViewModels, sortByUpdatedDesc, computeSummary, processRawItems. All unit-testable without React (pass input, assert output).
- **useDashboardData:** Custom hook that contains the effect (fetch when filters change, cleanup, loading/error). Calls processRawItems(res.items) after fetch; no business logic in the hook. Testable with renderHook (mock fetchRawDashboard, change filters, assert returned state).
- **RefactoredPureAndHook:** Thin component: filter state (status, search), useDashboardData(filters), render. No business logic; no effect in the component.

---

## PR review (Senior lens)

### What's good

- **Clear separation:** Effect orchestration (when to fetch, cleanup, setState) is in the hook. Business logic (validate, normalize, sort, summary) is in pure functions. Component only holds UI state and renders. That separation makes testing and reasoning straightforward.
- **Pure pipeline is testable:** processRawItems and its building blocks can be unit-tested with plain Jest/Vitest. No React, no async, no mocks for the logic itself. Example: `expect(processRawItems([{ id: '1', status: 'invalid', ... }]).items).toHaveLength(0)`.
- **Hook is testable:** useDashboardData can be tested with renderHook: mock fetchRawDashboard to return a known raw response, call useDashboardData({ status: 'all', search: '' }), wait for loading to finish, assert result.current.items and result.current.summary match the output of processRawItems(mockRaw). You're testing "effect + setState" without testing the pure logic (that's already covered by unit tests).
- **Same behavior:** Refactored version produces the same UI and data as the heavy version; we only moved code, not behavior.

### Things to watch

- **useDashboardData deps:** The hook takes `filters` but uses `[filters.status, filters.search]` in the effect deps. That's correct (stable primitives). If the caller passed a new object every render, we'd still only refetch when status or search change. Good.
- **mockApi:** Raw items include one with `status: 'invalid'` so that validateItems (and the heavy inline version) filter it out. Good for demonstrating validation.

### Architectural smells related to effect logic

- **Fat effect:** Effect callback is long (e.g. 30+ lines) or does more than "run side effect then setState." Smell: mixing "when to run" with "what to compute." Fix: extract business logic to pure functions; keep effect thin (fetch → processRawItems → setState).
- **Logic in effect:** Validation, normalization, sorting, or aggregation live inside the effect. Smell: you cannot unit test that logic without rendering or mocking React. Fix: move to a pure module; effect only orchestrates (calls the pure pipeline).
- **Duplicated logic across components:** Several components each have their own "fetch + validate + normalize" in an effect. Smell: same rule in many places; changing the rule means hunting every effect. Fix: single pure pipeline (e.g. processRawItems) and a shared hook (e.g. useDashboardData).
- **Effect as the only place that "knows" the rule:** Business rule (e.g. "only active/archived") exists only inside an effect. Smell: no single source of truth; no way to test the rule in isolation. Fix: extract rule to pure function; effect calls it.
- **Testing by full render + DOM:** To verify business logic you render the whole component and assert DOM or state after the effect. Smell: slow, flaky, and doesn't scale when you have many rules. Fix: unit test pure functions; use renderHook for the hook; keep component tests for user flows.

### Common anti-patterns related to effect logic

1. **Putting validation/transformation/business rules inside the effect body.** That logic is hard to unit test and mixes "when to run" with "what to compute." Extract to pure functions and call them from the effect (or from a hook that contains the effect).

2. **Long effect callbacks.** If the effect is more than a few lines (fetch → then → setState), consider extracting the "then" logic into a pure function or a small pipeline, and/or moving the whole flow into a custom hook so the component stays thin.

3. **Testing by rendering the full component and asserting DOM.** For business logic, that's slow and brittle. Prefer unit tests for pure functions and renderHook tests for the hook. Use component tests for user flows or snapshots, not for testing "does normalize work?"

4. **Duplicating logic between effect and elsewhere.** If you need the same validation or normalization in an event handler and in an effect, you'll duplicate it unless it lives in a shared pure function. Extract once, reuse everywhere.

5. **Effect that does "fetch + heavy processing" with no extraction.** Even if you don't care about tests, extracting the processing into a pure function improves readability and reuse. The effect should read like "when deps change, fetch, then process and setState," not a 50-line block of validation and mapping.

### Trade-offs and when logic inside useEffect is still acceptable

- **Extracting pure functions:** You gain unit testability, reuse, and a clearer mental model. You add a separate module and the discipline of "no business logic in the effect." For any non-trivial validation/transform/summary, that trade-off is worth it.

- **Custom hook for effect orchestration:** You gain hook testability (renderHook + mock fetch) and reuse (multiple components can use the same hook). You add a hook file and the convention that "effects that fetch + process live in hooks." For fetch-when-deps-change flows, that's a good default.

- **When logic in the effect is acceptable:** Trivial one-liners (e.g. document.title = x). Or "call API with deps and setState" with no real business logic. Or throwaway/exploratory code. As soon as you have "I want to unit test this logic," move it out of the effect.

Summary: the refactor correctly separates business logic (pure functions, unit-testable) from effect orchestration (hook, testable with renderHook) and keeps the component thin. LEARNING-GUIDE and PR-REVIEW explain why logic in useEffect is hard to test, how the refactor improves testing, and when leaving logic in the effect is still acceptable.
