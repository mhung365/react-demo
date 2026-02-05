# Senior PR Review: State Classification (UI / Client / Server)

## What’s good

- **Clear taxonomy:** UI state (modal, tabs, form input), client state (preferences), server state (API data) — each with a defined place and tool. Demo shows one wrong and one refactored implementation side by side.
- **Wrong implementation is realistic:** Server data in `useState` + `useEffect`; no cache; loading/error manual. This is how many codebases start; the bugs (refetch on every mount, no shared cache) are visible when you switch tabs or navigate.
- **Refactored uses the right tools:** React Query for server state (query key from filter params; cache, staleTime); local `useState` for UI state; narrow `PreferencesContext` for client state (pageSize). No server data in Context or root state.
- **Production-like scenario:** Dashboard with filters, pagination, selection, modal — same feature set in both variants so the comparison is fair.

---

## Common misclassifications (and how this demo addresses them)

### 1. Treating server data as client/global state

**Mistake:** Fetch in `useEffect`, put result in `useState` or Context. You own loading, error, cache, invalidation, and dedup. Result: no cache (or ad hoc), redundant fetches, stale data, or one global loading that blocks the whole app.

**Demo:** Wrong tab — items in useState, fetch in effect. Every mount or filter change = loading. Refactored — useQuery; same filter = cache hit; loading/error from query.

**Rule:** Server state → React Query (or SWR, Apollo). Don’t store API response as the source of truth in useState/Context.

### 2. Putting UI state in global store or root context

**Mistake:** Modal open, active tab, search input, current page in Redux or one big Context. Any change re-renders all consumers. UI state is ephemeral and local — it doesn’t need to be global.

**Demo:** Refactored keeps modal, tabs, search, page in local useState. Only pageSize (client preference) is in Context. If we put “modalOpen” in the same context as pageSize, every modal toggle would re-render every consumer of that context.

**Rule:** UI state → useState in the component (or minimal ancestor) that needs it. URL for shareable filters if needed.

### 3. Mixing server state and client state in one context

**Mistake:** One “AppContext” with user, theme, and “list items.” Updating theme re-renders components that only care about list items; updating list re-renders theme consumers. Cache and invalidation for server data get mixed with client preferences.

**Demo:** Refactored has two separate things: PreferencesContext (client: pageSize) and useQuery (server: items). No “ItemsContext” holding server data.

**Rule:** One context per concern. Server state doesn’t live in Context as source of truth — it lives in a cache layer (React Query). Client state in narrow context(s).

### 4. “We need one place for all state”

**Mistake:** Putting everything in Redux or one Context “so state is in one place.” Server data, UI state, and client preferences all in one store. Result: re-renders, no cache semantics for server data, and hard invalidation.

**Demo:** Wrong has “one place” (one component’s useState) but no cache and manual lifecycle. Refactored has three “places”: React Query (server), useState (UI), PreferencesContext (client). Each has the right lifecycle and scope.

**Rule:** Classify first. UI → local. Client → narrow context. Server → React Query. “One place” is wrong when it mixes concerns.

### 5. Using useEffect + useState for all server data by default

**Mistake:** Every screen fetches in useEffect and sets state. No shared cache: two components that need the same list each fetch. No staleTime: refetch on every mount. No dedup: same request fired multiple times.

**Demo:** Wrong is exactly that. Refactored: useQuery with the same queryKey across the app returns cached data; staleTime and refetch strategy are configured in one place.

**Rule:** Default for server data = React Query. Use useEffect + useState only when you have a good reason (e.g. one-off submit, no cache needed) and document it.

---

## Trade-offs and scalability

| Decision | Gain | Cost / when it breaks |
|----------|------|------------------------|
| React Query for server state | Cache, dedup, loading/error, invalidation, staleTime. Less custom code. | Extra dependency; team must understand query keys and invalidation. |
| UI state local | Fewer re-renders; clear ownership. | If you later need to share (e.g. deep link to tab), you may lift to URL or small context. |
| Narrow client context (e.g. Preferences) | Only preference consumers re-render when preference changes. | More than one context; need to avoid “context soup” by keeping each context small. |
| Server data in useState/useEffect | No new lib; “simple” at first. | At scale: no cache, redundant fetches, manual invalidation, bugs. Hard to refactor later. |

**Scale:** As features grow, more components need the same server data. With useState/useEffect you either duplicate fetch (no shared cache) or lift to Context (global loading, re-renders, you own cache). With React Query, new components just use the same query key and get cache + consistent loading/error. Client state in narrow context keeps re-render scope small when preferences change.

---

## What to look for in a real PR

1. **Server data:** Is it in useState/useEffect or in useQuery (or similar)? If useState + useEffect, is there a documented reason (e.g. one-off, no cache needed)?
2. **Context contents:** Does the context hold server data? If yes, request refactor to React Query. Does it hold UI state (modal, tab)? Prefer local state unless shared.
3. **Query keys:** Are they stable and descriptive (e.g. `['items', { search, status, page }]`)? Same key = same cache entry.
4. **Loading/error:** For server state, are they coming from the query (or similar) or from local state? Local state for loading/error per screen is a sign of “server state in useState.”

Use this demo as a reference: Wrong = anti-pattern; Refactored = correct classification and tools. In review, point to “server state should be in React Query, not useState” and “UI state should stay local” with links to this demo if helpful.
