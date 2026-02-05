# State Classification: UI, Client, Server

## Why classify state?

React doesn’t care what “kind” of state you have — it’s all `useState` or context. **You** must decide where each piece of data lives and which tool to use. Misclassifying state leads to redundant fetches, no cache, mixed ownership, and bugs at scale.

---

## Definitions

| Category | Definition | Where it lives | Tool |
|----------|------------|----------------|------|
| **UI state** | Ephemeral, local to a screen or component. Modal open, active tab, form input, pagination page. | Component (or minimal ancestor that needs it). | `useState` (or URL for shareable filters). |
| **Client state** | Cross-feature app state that is **not** from the server. User preferences (theme, page size), sidebar collapsed, onboarding completed. | Narrow context or `localStorage` + context. | Context (small, focused) or state + sync to storage. |
| **Server state** | Data that comes from the server (API). It’s cached, can be stale, and needs loading/error/refetch/invalidation. | **Not** in React state or global store by default. | **React Query** (or SWR, Apollo). Cache keyed by request; you don’t own the data lifecycle. |

---

## Rules

- **Never store server data in `useState` or Context as the source of truth.** You then own loading, error, cache, invalidation, and dedup — and usually get it wrong. Use a server-state library (React Query) so cache and lifecycle are handled.
- **UI state stays local.** Modal open, tabs, search input, current page — `useState` in the component that needs it. Lifting to root or global store causes unnecessary re-renders and complexity.
- **Client state in narrow context.** One context per “slice” (e.g. `PreferencesContext` for page size). Don’t mix server data and client preferences in the same context.

---

## Demo: two implementations

### 1. Wrong: server data as client state

- **Server state** (API items) in `useState` + fetched in `useEffect`. No cache — every mount refetches; no shared cache; no staleTime/refetch strategy.
- **UI state** (modal, tabs, search, page) and **client state** (page size as preference) mixed in the same component with list data.
- **Bugs:** (1) No cache — same filter refetched on every visit. (2) You own loading/error/invalidation manually. (3) If we lifted “items” to Context, we’d have one global loading that blocks the whole app or we duplicate loading per screen.

### 2. Refactored: correct classification

- **Server state:** `useQuery` (React Query). Keyed by filter params; cache, staleTime, loading/error handled by the library.
- **UI state:** Modal, tabs, search, page — local `useState` in the dashboard component.
- **Client state:** Page size preference — `PreferencesContext` (narrow; could persist to `localStorage`).

---

## What you see in the demo

- **Wrong tab:** Dashboard with filters, pagination, list, modal. Switch to “Filters”, change search/status/page size, then switch to “List” — every time you mount or change filters you see “Loading…” (no cache). Open console: no shared cache when navigating away and back.
- **Refactored tab:** Same UI. React Query caches by query key; when you switch back to a previously loaded filter, data shows from cache (and can refetch in background per staleTime). Page size comes from `PreferencesContext`; list data from `useQuery`.

---

## Run

From project root: `npm run dev`, open **“State classification (UI / client / server)”**, then switch between **Wrong** and **Refactored** and compare loading behavior and cache.
