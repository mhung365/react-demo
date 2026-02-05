# Senior PR Review: State Placement Bugs at Scale Demo

## What’s good

- **Three phases tell a clear story:** Initial (works for small scale) → Scaled with bugs (stale UI, inconsistent data, unnecessary re-renders) → Refactored (single source of truth, no local overrides, memo). Each phase demonstrates a concrete failure or fix.
- **Bugs are reproducible and visible:** Stale UI: select from main List, Recent list doesn’t update highlight. Inconsistent: “Clear selection” in Detail leaves List still showing selected. Re-renders: console shows 5+ logs per action in scaled version.
- **Refactor fixes root cause:** No duplicate “highlightedId” in Recent list (uses parent selectedId). No local “detailCleared” in Detail (calls onClearSelection). Memo on FavoritesSidebar and RecentList to narrow re-render scope.
- **Production-like scenario:** Dashboard with list, detail, favorites, recently viewed is common; adding features without fixing state ownership is a real source of bugs.

---

## Early warning signs of bad state placement

1. **Two places hold “the same” truth.** e.g. parent has selectedId and a child has its own highlightedId or localSelection. As soon as one updates without the other, you get stale UI or inconsistency. **Fix:** One owner (usually parent); children receive via props (or narrow context).

2. **“Clear” / “Reset” / “Cancel” only changes local state.** If the child sets local state so it “looks” cleared but the parent still has the old value, any sibling that reads from the parent will show the old state. **Fix:** Clear must call a parent callback (e.g. onClearSelection) so the single source of truth updates.

3. **Every new feature pushes state higher.** Adding Favorites, Recent, etc. and putting everything in the same parent “so everyone can access it” increases blast radius. **Fix:** Prefer minimal common ancestor; split by feature (e.g. selection in one place, favorites in another) so only the subtree that needs it re-renders.

4. **Child “overrides” display without updating parent.** e.g. Detail shows “Select an item” when detailCleared is true, but parent selectedId is unchanged. That’s an override, not a shared update. **Fix:** No local override for shared state; actions that change shared state must update the owner.

5. **Hard to explain “who owns what.”** If you can’t draw a clear line (“selectedId is owned by Dashboard; List and Detail and RecentList only read/write via props/callbacks”), you likely have duplicated or scattered state. **Fix:** Document or refactor so there is one clear owner per piece of state.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| useRenderLog in every component | Clear re-render scope in console | Noisy; dev-only |
| Single parent for selectedId, favorites, recentIds in refactored version | One source of truth; no stale/inconsistent | Any update still re-renders parent and non-memo children; memo on Sidebar and RecentList reduces but doesn’t eliminate |
| Memo on FavoritesSidebar and RecentList | They skip re-render when their props (favorites, recentIds, selectedId, callbacks) are unchanged | Stable callbacks (useCallback) required; memo adds a bit of complexity |

---

## How to detect these issues early

1. **When adding a new feature that needs “selection” or “current X”:** Ask: “Is there already a selectedId (or similar) elsewhere? If I update it here, will every place that shows selection update?” If the answer is no, you have two sources of truth — fix before shipping.

2. **When adding a “Clear” or “Reset” button:** Ensure it updates the **owner** of the state (e.g. parent selectedId), not only local state. Otherwise List and Detail (or any other consumer) will get out of sync.

3. **After adding a new slice of state:** Run through a quick manual test: change the value from UI A, check if UI B (that should reflect it) updates. If not, trace where each place reads from — you’ll find duplicate or un-synced state.

4. **Use render logs or React DevTools Profiler:** If every user action (click, type) causes 5+ components to re-render, consider splitting state or memoizing so only the subtree that needs the update re-renders.

---

## When the “initial” placement is fine

- **Small scope:** One list, one detail, selectedId in parent. No Favorites, no Recent. Single source of truth, no extra consumers. The initial implementation is correct for that scope.
- **Scaling breaks it:** Adding Favorites and Recent introduced **new consumers** and **new state** (favorites, recentIds). The mistake was not re-evaluating ownership: we added local highlightedId in Recent list (stale) and local “cleared” in Detail (inconsistent) instead of keeping one source of truth and passing callbacks.

**Rule of thumb:** When you add a feature that needs to **read or write** existing state (e.g. “Recently viewed” needs to know selectedId and update recent list), don’t add a **second** copy of that state in the new component. Use the existing owner and pass props/callbacks. When you add an action that should change shared state (e.g. “Clear selection”), that action must update the owner, not only local state.
