# Context: When Better Than Props Drilling, When Not

## When is React Context better than props drilling, and when is it not?

- **Props drilling becomes noisy:** When the same data (theme, user) is passed through **many levels** (5–6), prop lists get long and it’s easy to forget a level or pass the wrong prop. **Context improves clarity:** consumers read what they need via `useContext`; no drilling through Layout, Sidebar, Page.
- **Context used appropriately:** Split **ThemeContext** and **UserContext**. Each consumer subscribes only to what it needs. No drilling; concerns are separate.
- **Context overuse (anti-pattern):** One **AppContext** with theme, user, sidebarOpen. When **any** value changes, the context value changes → **every** consumer re-renders. UserBadge only needs user but re-renders on theme toggle. Check console: **6+** `[render]` logs per toggle.
- **Refactored:** Replace one AppContext with **ThemeContext** and **UserContext**. Each consumer subscribes only to what it needs. Safer, scoped design; one big context re-renders everyone on any change.

## Four variants in the demo

| Variant | What it shows |
|--------|----------------|
| **Props drilling (noisy)** | theme + user passed through Layout → Sidebar → NavItem / UserBadge, and Layout → Main → Page → ThemedCard. Long prop lists; easy to miss a level. |
| **Context appropriate** | ThemeContext and UserContext split. No drilling; Layout doesn’t pass theme/user. Consumers use useTheme() or useUser(). |
| **Context overuse** | One AppContext with theme, user, sidebarOpen. Toggle theme → Layout, Sidebar, UserBadge, NavItem, Page, ThemedCard all re-render (6+ logs). UserBadge doesn’t need theme. |
| **Refactored (scoped)** | Split ThemeContext + UserContext. Same UI; each consumer subscribes only to what it needs. One big context would re-render everyone (Overuse). |

## What you see in the demo

1. **Props drilling (noisy):** Every level has theme, user, setTheme in props. Toggle theme — whole path re-renders; data flow is explicit but noisy.
2. **Context appropriate:** No theme/user props on Layout or Sidebar. Consumers use context. Clear.
3. **Context overuse:** Toggle theme. Console: 6+ `[render]` logs (Layout, Sidebar, UserBadge, NavItem, Page, ThemedCard). UserBadge only needs user — unnecessary re-render.
4. **Refactored:** Split contexts; same UI. Overuse = one context = broad re-renders; refactored = split = clearer boundaries.

## Run

From project root: `npm run dev`, open **“Context when good”**, open the console, and switch between the four tabs. Compare props drilling (noisy) vs Context appropriate vs Overuse (6+ logs per toggle) vs Refactored.
