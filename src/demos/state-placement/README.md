# State Colocation vs Lifting Up

## When should state be colocated, and when should it be lifted?

- **Colocate** when only one component needs the state. Keeps re-render scope minimal and avoids prop drilling.
- **Lift to minimal common ancestor** when two or more siblings (or sibling trees) need to read/write the same state. Not “as high as possible” — only as high as necessary.

## When does lifting state up become an anti-pattern?

When state is lifted **too high** (e.g. to the root) and the tree is **deep**:

- **Wide re-renders:** One keystroke re-renders Dashboard, Layout, ContentArea, Filters, List, Detail (6 components). Console shows the blast radius.
- **Prop drilling:** Layout and ContentArea don’t use the state — they only forward 8 props. Brittle: adding state means touching every layer.
- **Memo band-aid:** We add `memo(Detail)` so Detail skips. We didn’t fix the tree: Layout and ContentArea still re-render and drill props. Memo fixes a symptom, not the structure.
- **Refactor:** Move state to **minimal common ancestor** (ContentArea). Dashboard and Layout don’t receive state → they don’t re-render. Blast radius: 3 components instead of 6. No prop drilling through Layout.

---

## Demo: two sections

### 1. Basics (3 variants)

| Variant | State placement | Problem |
|--------|------------------|--------|
| **Colocated too low** | Filters/List/Detail each own local state. | Cannot filter list or show selected in detail. **Prevents feature growth.** |
| **Lifted too high** | All state in one dashboard. | Dashboard, Filters, List, Detail all re-render on every keystroke. |
| **Balanced** | State at minimal ancestor; Detail memoized. | Detail only re-renders when selectedItem changes. |

### 2. Lifting anti-pattern (deep tree)

| Variant | What it shows |
|--------|----------------|
| **Lifted deep (drilling)** | State at Dashboard; Layout and ContentArea forward 8 props. One keystroke → **6 components** re-render. Brittle APIs. |
| **Memo band-aid** | Same tree + `memo(Detail)`. Detail skips; **5 components** still re-render. Prop drilling unchanged. |
| **Refactored (placed correctly)** | State in **ContentArea** (minimal ancestor). Dashboard and Layout don’t re-render. One keystroke → **3 components** (ContentArea, Filters, List). No drilling through Layout. |

## What you see in the demo

- **Basics:** Colocated too low / Lifted too high / Balanced — same as before; console shows who re-renders.
- **Lifting anti-pattern:** Switch to “Lifting anti-pattern”, then “Lifted deep”. Type in search: 6 `[render]` logs. Switch to “Memo band-aid”: 5 logs (Detail skips). Switch to “Refactored”: type in search — only ContentArea, Filters, List (Dashboard and Layout do **not** log).

## Run

From project root: `npm run dev`, open **“State colocation vs lift”**, then **“Basics”** or **“Lifting anti-pattern”**, open the console, and watch `[render]` logs.
