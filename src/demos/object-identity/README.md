# Object & array identity in React

A production-style demo (filters, configuration objects, callbacks, Context) that teaches **problems caused by creating new objects or arrays on every render** and when to stabilize identities.

## Structure

- **ObjectIdentityDemo.tsx** — Main demo with tabs: Inline breaks memo / effect / Context, Refactor (stable), When NOT to stabilize.
- **useIdentityLog.ts** — Logs “same reference” vs “NEW reference” for a value across renders.
- **InlineBreaksMemo.tsx** — Inline config/items → memoized child re-renders every time; [identity] and [render] logs.
- **InlineBreaksEffect.tsx** — useEffect([config]) with inline config → effect runs every render; [effect] log.
- **InlineBreaksContext.tsx** — Provider value inline → Context consumer re-renders every time; [identity] and [render] logs.
- **StableIdentities.tsx** — useMemo/useCallback/stable Context value; memo and consumer skip when only count changes.
- **StableIdentitiesEffect.tsx** — useMemo(config) → effect runs only when config reference changes (here once).
- **StabilizeNotWorthIt.tsx** — Non-memo child; stabilizing would not reduce re-renders; when identity stability is not worth it.
- **types.ts** — FilterConfig, ThemeContextValue.
- **object-identity-demo.css** — Layout and scenario styling.

## How to run

Select **“Object/array identity (memo, effect, Context)”** from the app demo dropdown. Use tabs 1–3 to see inline breaking memo/effect/Context; tab 4/4b for refactor; tab 5 for when not to stabilize. Check console for [identity], [render], [effect].

## Learning outcomes

1. **Reference vs value:** React compares objects/arrays by reference; inline `{}` or `[]` creates a new reference every render → “same content” ≠ “same reference”.
2. **Memo:** Inline props break React.memo (shallow comparison). Stabilize with useMemo/useCallback when passing to memoized children.
3. **useEffect:** Inline object in deps → effect runs every render. useMemo(deps) or depend on primitives.
4. **Context:** Inline value → all consumers re-render. useMemo(value, [theme]) (and stable setter).
5. **When not to stabilize:** When the consumer is not memoized or the value is not in effect deps, stabilizing often adds cost without benefit.

See **LEARNING-GUIDE.md** for details and **PR-REVIEW.md** for a senior-level review.
