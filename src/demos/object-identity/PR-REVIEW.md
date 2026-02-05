# PR Review: Object & array identity in React

## What this PR does

Adds a demo that teaches **problems caused by creating new objects or arrays on every render**:

1. **Memoization broken** — Inline config/items passed to memoized child; [identity] logs show NEW reference every render; child re-renders every time.
2. **useEffect re-runs** — Inline config in effect deps; [effect] runs on every render.
3. **Context consumers re-render** — Inline Provider value; [render] consumer runs on every provider parent re-render.
4. **Refactor: stable identities** — useMemo/useCallback/stable Context value; [identity] same reference; memo and consumer skip when only unrelated state changes.
5. **When NOT to stabilize** — Cheap non-memo child; stabilizing adds cost without benefit.

Explicit logs ([identity], [render], [effect]) show identity changes across renders and when refactor fixes them.

## Review points

### Strengths

- **Clear cause:** “Same content ≠ same reference” is demonstrated with inline objects/arrays and console logs.
- **Three failure modes:** Memo, useEffect deps, and Context value — each has a dedicated scenario and a refactor.
- **When NOT to stabilize:** Avoids “always useMemo” by showing a case where the child is not memoized and stabilizing would not reduce re-renders.
- **useIdentityLog:** Simple hook that logs “same reference” vs “NEW reference” so learners see identity changes explicitly.

### Common mistakes (callouts)

- **Inline object in JSX:** `style={{ color: 'red' }}` or `config={{ theme: 'dark' }}` creates a new reference every render. If passed to a memo child or in effect deps, it breaks.
- **Inline array:** `items={[1, 2, 3]}` or `options={items.filter(...)}` — same issue. useMemo when the value is used by memo/effect/Context.
- **Context value inline:** `value={{ theme, setTheme }}` — most common cause of “all consumers re-render”. useMemo(() => ({ theme, setTheme }), [theme]) (setTheme from useState is already stable).
- **Over-stabilizing:** useMemo/useCallback on every prop when the child is not memoized adds deps to maintain and no perf gain. Stabilize only where reference is compared (memo, deps, Context).

### Trade-offs

- **Stabilize:** Correct deps are critical; wrong deps → stale closures or unnecessary re-runs. When in doubt, depend on primitives (theme, pageSize) instead of the whole object, or useMemo with accurate deps.
- **Don’t stabilize:** Simpler code; child re-renders when parent re-renders. If you later memoize the child, you’ll need stable props — add useMemo/useCallback then.

### When identity stability matters

- **Memoized child:** Props compared by reference → stabilize objects/arrays/callbacks passed as props.
- **useEffect dependency array:** Deps compared with Object.is → stabilize or use primitives.
- **Context value:** Compared by reference → useMemo for the value object.
- **Not in deps / not passed to memo / cheap consumer:** Often not worth stabilizing; measure first.

## Verdict

**Approve.** The demo clearly shows how new object/array identities break memo, trigger effect re-runs, and re-render Context consumers, with explicit logs and a refactor plus a “when not to stabilize” scenario. Fits the “teach through real project” and “right tool for the job” goals.
