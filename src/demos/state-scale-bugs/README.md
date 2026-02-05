# State Placement Bugs at Scale

## What kinds of bugs appear when state is placed incorrectly as the app scales?

An implementation that **works for small scale** (e.g. List + Detail, selectedId in parent) can break when you add features (Favorites, Recently viewed). Incorrect state ownership leads to:

- **Stale UI:** A child keeps its own copy of “which item is selected” (e.g. highlightedId). When the parent’s selectedId changes (user selects from another list), the child’s copy doesn’t update — the child shows the wrong highlight.
- **Inconsistent data:** A child has local state that overrides display (e.g. “Clear selection” sets local “cleared”) but the parent still has the old value. List shows selected, Detail shows “Select an item”.
- **Unnecessary re-renders:** All state in one parent; any action re-renders every child (List, Detail, FavoritesSidebar, RecentList). Console shows 5+ `[render]` logs per click.

## Three variants in the demo

| Variant | What it shows |
|--------|----------------|
| **Initial (small scale)** | List + Detail, selectedId in parent. Works. Single source of truth. No extra features. |
| **Scaled with bugs** | Favorites sidebar + Recently viewed added. **Stale UI:** Recent list has its own highlightedId — select from main List, Recent list still shows old highlight. **Inconsistent:** Detail “Clear selection” only sets local state — List still shows item selected. **Re-renders:** Any action re-renders 5+ components. |
| **Refactored (scalable)** | Single source of truth: selectedId, favorites, recentIds in Dashboard. Recent list uses **parent selectedId** for highlight (no local highlightedId). Detail “Clear” calls **onClearSelection()** so parent updates. FavoritesSidebar and RecentList memoized to reduce re-renders. |

## What you see in the demo

1. **Initial:** Click item → detail updates. Clean.
2. **Scaled with bugs:** Select an item from the main List → Recent list does **not** update its highlight (stale). Click “Clear selection” in Detail → Detail shows “Select an item” but List still shows the item as selected (inconsistent). Check console: every action logs 5+ `[render]`.
3. **Refactored:** Select from main List → Recent list highlight updates. “Clear selection” → List and Detail both clear. Fewer re-renders (memo on sidebar and recent list).

## Run

From project root: `npm run dev`, open **“State bugs at scale”**, open the console, and switch between the three tabs. Reproduce stale UI and inconsistent data in “Scaled with bugs”, then compare with “Refactored”.
