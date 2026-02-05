# State Object vs Multiple useState

## Why it matters

Grouping multiple pieces of state into a single object (`useState({ a, b, c })`) is convenient, but every update creates a **new object reference**. That leads to:

1. **Unnecessary re-renders:** Children that receive the object get a new reference on every update, so they re-render even when they only care about one field.
2. **Effect dependency issues:** `useEffect([state])` runs every time because `state` is a new reference after any `setState` (even if one field changed). You can't "subscribe" to only one field when the dep is the whole object.
3. **Predictability:** With multiple `useState`, each update is a single primitive; effect deps are explicit; children receive only the props they need.

---

## Demo: four variants

| Tab | What it shows |
|-----|----------------|
| **Single state object** | All fields in one `useState({ search, status, page, pageSize })`. Child receives `filter` → re-renders on every keystroke. `useEffect([filter])` runs every update (object reference changes). |
| **Multiple useState** | One `useState` per field. Child receives only `pageSize` (memo) → re-renders only when pageSize changes. `useEffect([search, status, page, pageSize])` runs only when those values change. |
| **Refactored (clear structure)** | Multiple `useState` + `useMemo` when we need one object (e.g. API call, reset). Children receive only the props they need. Effect deps are primitives. |
| **When grouping is beneficial** | One object is justified when: atomic reset (`setFilter(DEFAULT_FILTER)`), submit/persist whole filter, and the only consumer uses all fields. Don't pass the object to children that only need one field. |

---

## What you see in the demo

- **Single state object:** Type in "Search" → console shows parent + FilterSummarySingle re-render every keystroke; effect runs every time.
- **Multiple useState:** Type in "Search" → parent re-renders; PageSizeDisplay (receives only pageSize) does **not** re-render. Effect runs only when deps change.
- **Refactored:** Same as multiple; plus "Reset" and derived `filterAsObject` via useMemo when you need one object.
- **When beneficial:** One object for atomic reset and submit; single consumer (preview) uses all fields.

---

## Run

From project root: `npm run dev`, open **"State object vs multiple useState"**, open the console, and compare re-renders and effect runs across tabs.
