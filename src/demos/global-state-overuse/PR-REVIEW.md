# Senior PR Review: Global State Overuse Demo

## What’s good

- **Three clear variants:** Global by convenience (one Context, 6+ consumers, any update re-renders all), Refactored (local/feature ownership, smaller blast radius), Global by necessity (only theme in Context, Provider wraps only consumers, UnrelatedPanel outside doesn’t re-render). Each teaches a concrete failure or correct use.
- **Explicit render logs:** `useRenderLog` in every consumer so one keystroke or toggle shows exactly who re-renders. Easy to compare “global by convenience” (many logs) vs “refactored” (few) vs “global by necessity” (only theme consumers).
- **Production-like scenario:** Dashboard with sidebar, step wizard, search, user list/detail is common. Putting all of that in one Context is a real anti-pattern; refactoring to local/feature ownership is a real fix.
- **Global by necessity structure:** ThemeProvider wraps only Header + ThemeToggle; UnrelatedPanel is outside. Demonstrates that “global” state can still limit re-render scope by narrowing the Provider subtree.

---

## Common reasons developers reach for global state too early

1. **“Any component might need it later.”** Putting state in Context “just in case” so any component can read it. Cost: every consumer re-renders on any change; coupling to the whole store. Better: add state when a concrete component needs it; keep it at the lowest level that shares it.

2. **“I don’t want to pass props down.”** Prop drilling feels tedious, so “let’s use Context.” For UI state that only a few levels need, drilling is often simpler and more predictable than a global store. If drilling is deep, consider composition or a **narrow** context (e.g. only theme) rather than one big “app state” context.

3. **“We’ll use Redux/Context from the start so we’re ready to scale.”** Premature abstraction. Most UI state (sidebar, step, search, selection) never needs to be global. Start local; introduce global state only when you have a real need (e.g. theme, user, or cross-route state).

4. **“One place for all state is easier to reason about.”** A single store makes “where is X?” easy but maximizes re-renders and coupling. Reasoning about “who re-renders when I change Y?” becomes harder. Clear ownership (this state lives in this component/block) often scales better.

5. **“Context/Redux is the React way.”** Context is for *passing* data that many distant components need; it’s not the default place for all state. Local state and lifting to minimal ancestor are the default; global state is the exception.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useRenderLog in every consumer | Clear re-render scope in console | Noisy; dev-only in production |
| One AppStoreContext in “global by convenience” | Simple mental model “everything is here” | Every consumer re-renders on any change; hard to optimize without splitting context |
| Refactored: SearchSection owns search + selection | Search and list/detail share state without global store; UserDetail can be memoized | Two state values in one component (fine for this feature block) |
| Global by necessity: Provider wraps only Header + ThemeToggle | UnrelatedPanel doesn’t re-render when theme changes | Must structure tree so “unrelated” UI is outside Provider |

---

## When global state is actually justified

- **Truly app-wide and read by many distant components:** Theme, locale, current user (name, role). Updates are relatively coarse (toggle theme, login/logout).
- **Cross-route or cross-feature state:** e.g. “selected tenant” that affects header, sidebar, and multiple routes. Even then, prefer minimal provider scope (wrap only the subtree that needs it).
- **Server state that many components need:** Prefer React Query / SWR with cache keys; avoid putting raw server data in a single “global” Context that forces all consumers to re-render on every refetch.

---

## When global state is not justified

- **UI state used by one screen or one feature block:** Sidebar open, current step, search query, selected row. Own it in the component or minimal ancestor for that block.
- **“Might need it later”:** Don’t put state in Context until a concrete component needs it. YAGNI.
- **To avoid prop drilling of one or two levels:** Drilling is explicit and easy to trace; a global store hides who depends on what and causes broad re-renders.

---

## How this fails at scale

1. **One big Context:** Every new “global” field re-renders all existing consumers. Adding “notifications open” forces Header, Sidebar, StepWizard, SearchPanel, UserList, UserDetail to re-render when notifications toggle. Fix: split contexts (theme, user, UI) or move UI state to local/feature ownership.

2. **Redux with everything in one store:** Same as above: any dispatch that touches the store can re-render every connected component. Selectors and memoization help only if consumers are memoized and selectors return stable refs; structural fix is to keep UI state out of the global store.

3. **“We’ll optimize later with memo/selectors.”** Memo and selectors can reduce re-renders of leaves but don’t fix the architecture. Components that only need `theme` still subscribe to the whole store; splitting context or moving state to local ownership fixes the root cause.

**Rule of thumb:** For each piece of state, ask: “How many components need to read this, and how far apart are they?” If one component or one subtree → local or minimal ancestor. If many distant components and updates are coarse → global (Context/Redux) with **narrow** provider or store usage. Prefer local until you have a clear need for global.
