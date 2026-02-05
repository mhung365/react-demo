# Side effects in React: definition and overuse

## What this demo covers

- **Definition:** What counts as a side effect in React (API, DOM, subscriptions, analytics) vs what does not (derived data, event responses).
- **Overuse:** Data fetch + derived state sync + analytics all in `useEffect` when they belong elsewhere.
- **Wrong placement:** Filtering list in effect (should be render); analytics on “value changed” (should be event handler).
- **Refactor:** Fewer effects; data in React Query; derived in render; analytics in handlers.

## How to run

1. Run the app and open the **Side effects** demo from the nav.
2. Open DevTools → Console.
3. Switch tabs: **Overuse** → **Wrong place** → **Refactored**.
4. In **Overuse**, change filter: you see `[render]` first (sync), then three `[effect]` logs (async after commit).
5. In **Refactored**, change filter: you see only `[render]`; no effect logs for fetch/analytics (React Query + event handlers).

## Files

| File | Purpose |
|------|--------|
| `OveruseOfEffects.tsx` | Data fetch, derived state sync, analytics in three separate `useEffect`s. |
| `LogicInWrongPlace.tsx` | Filtering in effect; analytics on `selectedId` change instead of in click handler. |
| `RefactoredFewerEffects.tsx` | useQuery for data; derived in render; analytics in event handlers; no custom effects. |
| `useRenderLog.ts` | Logs when component body runs (sync). |
| `useEffectRunLog.ts` | Logs when an effect runs (async). |
