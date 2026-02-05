# What React.memo prevents (and does not)

Production-style demo: one expensive child wrapped in React.memo, with explicit render logs.

- **Memo works:** Parent passes stable refs (useMemo/useCallback) → memo skips re-render; only Parent logs on Increment.
- **Memo fails: props ref** — Parent passes inline `config={{}}` and `onSubmit={() => {}}` → new refs every render → [props] reference equal: false; memo does not skip.
- **Memo fails: Context** — Child uses `useContext(ThemeContext)`; when context value changes, consumer re-renders; memo does not prevent Context-triggered re-renders.
- **Memo fails: children** — Parent passes `<ExpensiveChild><span>{tick}</span></ExpensiveChild>` → `children` is a new React element every render → memo does not skip.

**How memo works:** Shallow comparison — `Object.is(prevProp, nextProp)` for each prop. Same reference → skip; new reference → re-render. Memo does **not** stop re-renders triggered by state or Context.

**Usage:** Open the demo, open DevTools Console, switch tabs and click the action button. Compare [render], [props], and [expensive] logs.

See **LEARNING-GUIDE.md** for study order and **PR-REVIEW.md** for misconceptions and trade-offs.
