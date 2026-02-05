# Senior PR Review: State Object vs Multiple useState

## What's good

- **Concrete scenario:** Filter panel (search, status, page, pageSize) — production-like form. Same UI in all variants so the comparison is fair.
- **Explicit render logs:** `useRenderLog` in parent and children. Single object: child re-renders every keystroke. Multiple useState: child receiving only `pageSize` doesn't re-render when search changes. Console proves the difference.
- **Effect dependency demonstrated:** Single object → `useEffect([filter])` runs every update (ref logged). Multiple useState → `useEffect([search, status, page, pageSize])` runs only when those values change.
- **Refactored and "when beneficial":** Refactored shows multiple useState + useMemo when we need one object (API, reset). "When beneficial" shows justified use of one object (atomic reset, single consumer of whole object).

---

## Common developer mistakes with state objects

### 1. Grouping state "to keep things together" without considering re-renders

**Mistake:** Putting all form fields in one `useState({ ... })` because it "looks cleaner" or "matches the API shape." Every keystroke creates a new object; any child receiving that object re-renders every time. If the child only needs one field (e.g. pageSize for a label), the re-renders are unnecessary.

**Demo:** Single state object — FilterSummarySingle receives `filter` and re-renders on every change. Multiple useState — PageSizeDisplay receives only `pageSize` and doesn't re-render when search changes.

**Fix:** Prefer multiple useState when children need a subset of state. Pass only the props each child needs. If you need one object for API/submit, derive it with useMemo from the individual state values.

### 2. Using the whole state object in useEffect dependency array

**Mistake:** `useEffect(() => { fetchData(state); }, [state])`. Since `state` is an object, every setState gives a new reference, so the effect runs on every update. You wanted "run when state changes" but you get "run on every keystroke." If the effect is expensive or triggers API calls, this causes redundant work.

**Demo:** Single state object — effect run count increments on every field change. Multiple useState — effect runs only when search, status, page, or pageSize value changes.

**Fix:** Use primitive deps: `useEffect(() => { fetchData({ search, status, page, pageSize }); }, [search, status, page, pageSize])`. Or keep multiple useState so you naturally have primitives to depend on.

### 3. Passing the whole state object to children "for convenience"

**Mistake:** `<Child filter={filter} />` so the child can use `filter.search`, `filter.pageSize`, etc. The child re-renders whenever any field changes, even if it only displays one field. At scale, many such children cause a large re-render blast radius.

**Demo:** FilterSummarySingle receives `filter` and re-renders on every change. PageSizeDisplay receives only `pageSize` and re-renders only when pageSize changes.

**Fix:** Pass only the props the child needs. If the child needs several fields, pass them as separate props (primitives) so React can skip re-renders when unrelated fields change. Use memo if the child is expensive.

### 4. Mutating the state object instead of replacing it

**Mistake:** `state.search = e.target.value; setState(state)` or `setState(prev => { prev.search = value; return prev })`. Mutating and returning the same reference doesn't trigger a re-render (React uses Object.is). UI appears stuck.

**Demo:** Not shown in this demo, but it's the flip side of "object state": if you mutate, you don't get a new reference, so React doesn't re-render. Always return a new object: `setState(prev => ({ ...prev, search: value }))`.

**Fix:** Never mutate state. Always return a new object when updating object state.

### 5. Assuming "one object" is better for reset or API

**Mistake:** "We need to reset the form and send the whole filter to the API, so we must use one state object." You can have multiple useState and still reset (multiple setState or useReducer) and still send one object (useMemo or inline `{ search, status, page, pageSize }` when calling API).

**Demo:** Refactored — reset via multiple setState; filterAsObject from useMemo when we need one object. When beneficial — one object is fine when reset atomic and single consumer; but you could still use multiple state and derive.

**Fix:** Prefer multiple useState for minimal re-renders and clear effect deps; derive one object with useMemo when you need it for API or reset. Use one state object only when the above doesn't matter (e.g. no children with subset needs, no effect that should run on specific fields).

---

## Trade-offs and when grouping is justified

| Approach | Pros | Cons |
|----------|------|------|
| **Single state object** | One setState for reset; one variable to pass; matches "form shape" or API. | New reference every update → children re-render; useEffect([state]) runs every time; can't depend on "one field" in effect. |
| **Multiple useState** | Primitive deps in effects; pass only needed props → fewer re-renders; predictable. | More state variables; reset = multiple setState (or useReducer). |
| **Multiple useState + useMemo(object)** | Best of both: minimal re-renders, clear effect deps, and one object when needed (API, persist). | Slightly more code (useMemo). |

**When grouping state is justified:**

- You have **no children** that need only a subset of the state (or the only consumer uses all fields).
- You want **atomic reset** and one setState is clearer than multiple setState or a reducer.
- You **don't rely on effect deps** on this state (e.g. no useEffect([state]) that should run only when specific fields change).

**When to prefer multiple useState (or useReducer):**

- Children need **only some fields** → pass those as props to avoid unnecessary re-renders.
- You have **useEffect** that should run only when **specific fields** change → use those as deps, not the whole object.
- You want **predictable re-render scope** and explicit dependency arrays.

---

## What to look for in a real PR

1. **State shape:** Is form/filter state one big object? If yes, are there children that receive it and only use one field? If yes, suggest splitting state or passing only needed props.
2. **Effect deps:** Is the dependency the whole state object? If yes, effect runs on every update. Suggest primitive deps or explain the cost.
3. **Reset logic:** If "reset" is multiple setState, that's fine. If they insist on one object for reset only, one state object is acceptable if there are no children with subset needs and no effect([state]).
4. **API/submit:** Do they need one object for the request? They can derive it with useMemo from multiple state; they don't have to store one object in state.

Use this demo as reference: Single object = unnecessary re-renders and effect runs; Multiple useState (and useMemo when needed) = clearer, more predictable, better for scale.
