# Senior PR Review: Context — When Better Than Props Drilling, When Not

## What’s good

- **Four variants tell a clear story:** Props drilling noisy (theme + user through 5–6 levels) → Context appropriate (split ThemeContext, UserContext; no drilling) → Context overuse (one AppContext; 6+ re-renders per toggle) → Refactored (split contexts again; scoped design). Each variant demonstrates a concrete case.
- **Explicit render logs:** useRenderLog in every component so “Context overuse” clearly shows 6+ logs per theme toggle (Layout, Sidebar, UserBadge, NavItem, Page, ThemedCard). UserBadge only needs user — unnecessary re-render.
- **Production-like scenario:** Theme + user (and optionally sidebar) in a layout with Sidebar and Main is common. When to use Context vs props and when one big context hurts is directly applicable.

---

## Common mistakes when introducing Context

1. **One context for “app state.”** Putting theme, user, sidebar, locale, etc. in a single AppContext. Any update changes the value object → every consumer re-renders. **Fix:** Split by concern (ThemeContext, UserContext, etc.) so only consumers of the changed slice re-render (and their ancestors up to that Provider).

2. **Context to “avoid props drilling” at shallow depth.** If the tree is only 2–3 levels and the prop list is short, Context adds Provider + useContext in every consumer and hides the data flow. **Fix:** Use Context when drilling is actually painful (many levels or many branches), not preemptively.

3. **Provider wraps the whole app.** Even with split contexts, if ThemeProvider wraps the root, when theme changes the whole subtree re-renders (including components that only use UserContext). **Fix:** Where possible, scope Provider to the subtree that needs that value (e.g. ThemeProvider wraps only the branch that contains theme-dependent UI) so unrelated branches don’t re-render.

4. **Unstable context value.** Passing a new object every render: `value={{ theme, setTheme }}` without useMemo. Every consumer re-renders every time the parent re-renders, even when theme didn’t change. **Fix:** useMemo for the value object with correct dependencies.

5. **Context for high-frequency updates.** Using Context for state that changes very often (e.g. mouse position, scroll) causes broad re-renders. **Fix:** Prefer local state, refs, or subscription patterns for high-frequency data; reserve Context for low-frequency or coarse-grained state (theme, user, locale).

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| Props drilling for theme/user through 5–6 levels | Explicit data flow; easy to trace | Noisy; long prop lists; easy to forget a level |
| Context (split ThemeContext, UserContext) | No drilling; consumers read what they need; concerns separated | Implicit flow; must find Provider and consumers; useMemo for value |
| One AppContext | Single place for “app state” | Any change re-renders every consumer; hard to optimize |
| Split contexts | Each consumer subscribes only to what it needs; clearer boundaries | More Providers and context types to maintain |

---

## When Context should be avoided entirely

- **Shallow tree (e.g. 2–4 levels) and small prop list:** Props are explicit and easy to trace. Context adds indirection without real benefit.
- **High-frequency updates:** Context value changes often → many consumers re-render often. Use local state, refs, or subscriptions instead.
- **Only one consumer:** If only one component needs the data, pass it as a prop or hold state in a common parent. No need for Context.
- **“Might need it later”:** Don’t add Context until you have a real need (many levels, many branches). YAGNI.

---

## When Context is a good choice

- **Same data through many levels (5+):** theme, user, locale passed through Layout → Sidebar → … → leaf. Context removes drilling and keeps signatures small.
- **Many unrelated branches need the same data:** Header, Sidebar, and a deep Form all need “current user.” One UserContext avoids drilling through each branch.
- **Low-frequency or coarse-grained updates:** Theme toggle, login/logout, locale change. Re-renders are acceptable and bounded.
- **Split and scoped:** ThemeContext, UserContext, etc. Each Provider can be scoped to the subtree that needs it (when structure allows) to limit re-renders.

**Rule of thumb:** Use Context when props drilling is **actually** painful (depth or many branches) and when the data is **low-frequency**. Split contexts by concern; avoid one “app state” context. Scope Providers where possible so only the subtree that needs the value re-renders when it changes.
