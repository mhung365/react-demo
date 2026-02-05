# Global State Overuse

## Why is global state often overused in React?

Developers reach for Context (or Redux) **by convenience**: “I’ll put everything in one place so any component can read it.” That leads to:

- **Wide re-renders:** Any update to the global store re-renders **every** component that uses `useContext(Store)`. Typing in search re-renders Header, Sidebar, StepWizard, UserDetail — even though they don’t need the search value.
- **Coupling:** Every consumer is coupled to the entire store. Adding or changing a field can force updates across many components.
- **Premature abstraction:** UI state (sidebar open, current step, search query, selected item) is often only needed in a small subtree. Putting it in global state is premature.

## Three variants in the demo

| Variant | What it shows |
|--------|----------------|
| **Global by convenience** | One Context holds sidebarOpen, currentStep, searchQuery, selectedUserId. Header, Sidebar, StepWizard, SearchPanel, UserList, UserDetail all consume it. Type in search → **6+ components** re-render. Toggle sidebar → same. |
| **Refactored (local ownership)** | State colocated or at feature level: sidebar in Layout, step in StepWizard, search + selection in SearchSection. Typing re-renders only SearchSection, SearchPanel, UserList (UserDetail memoized). Toggle sidebar → only Layout + Sidebar. |
| **Global by necessity** | Only **theme** is in Context. ThemeProvider wraps only Header + ThemeToggle. UnrelatedPanel is outside the provider and does **not** re-render when theme toggles. Global state is justified when truly app-wide and few consumers. |

## What you see in the demo

1. **Global by convenience:** Type in the search box. Console: `[render]` for Header, Sidebar, StepWizard, SearchPanel, UserList, UserDetail on every keystroke. Toggle sidebar: same blast radius.
2. **Refactored:** Type in search. Only SearchSection, SearchPanel, UserList log (UserDetail skips thanks to memo). Toggle sidebar: only Layout and Sidebar.
3. **Global by necessity:** Toggle theme. Only Header and ThemeToggle log. UnrelatedPanel does not re-render (it’s outside the provider).

## Run

From project root: `npm run dev`, open **“Global state overuse”**, open the console, and switch between the three tabs. Watch `[render]` logs to see how global vs local ownership affects re-render scope.
