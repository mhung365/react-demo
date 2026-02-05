# Memoized component with changing props

Production-style demo: one memoized child (MemoizedCard) receiving multiple props from the parent. Explicit render logs show **which prop(s) broke memo**.

- **Shallow comparison:** React.memo uses `Object.is(prevProp, nextProp)` per prop. Same reference → skip; new reference (or new value for primitives) → re-render.
- **All props unstable:** Inline config, onAction, count={tick}, children → every prop changes every render → memo never skips. Console: [props] lists config, onAction, count, children as breaking memo.
- **Single prop changes:** Only count={tick} changes; config and onAction are stable (useMemo/useCallback). Console: [props] shows **count** as the only prop that broke memo — one changing prop invalidates memoization.
- **Refactor: split props:** MemoizedCard receives only stable props (id, config, onAction; count fixed or omitted). The changing value (tick) is displayed by the parent. When tick changes, parent re-renders but MemoizedCard gets same props → memo skips. No [render] MemoizedCard on Increment.

**Prop shape and responsibility:** Mixing stable and changing props in one component makes memo fragile. Refactoring so the memoized child gets only stable props (prop splitting or restructuring) restores memo effectiveness.

**Usage:** Open the demo, open DevTools Console, switch tabs and click Increment. Compare [render] and [props] logs; see which prop(s) broke memo and that the refactor removes MemoizedCard re-renders.

See **LEARNING-GUIDE.md** for study order and **PR-REVIEW.md** for common mistakes and trade-offs.
