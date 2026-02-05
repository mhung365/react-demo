# Expensive Child + Reference Equality

## Why does a component re-render when props “don’t change”?

Because React (and `React.memo`) care about **reference equality** (===), not “value equality.”

- **Props look the same** = same content (e.g. `{ theme: 'dark' }` vs `{ theme: 'dark' }`). You could compare with JSON or a deep-equal.
- **Props are referentially equal** = same object/function in memory (`prevConfig === nextConfig`). React.memo uses this.

When the parent re-renders and passes **inline** object or function:

```tsx
<ExpensiveChild
  config={{ theme: 'dark', pageSize: 10 }}
  onSubmit={(value) => console.log(value)}
/>
```

every render creates a **new** `config` and a **new** `onSubmit`. So `prevProps.config === nextProps.config` is false → React.memo does not skip → the child re-renders even though the “values” are the same.

## Broken vs fixed

| | Broken | Fixed |
|---|--------|--------|
| Parent | Passes `config={{ ... }}` and `onSubmit={() => {}}` | Passes `config` from `useMemo`, `onSubmit` from `useCallback` |
| Refs | New every render | Same refs across renders (stable deps) |
| Child | Re-runs every time parent re-renders | Memo skips when props are referentially equal |

## What you see in the demo

1. **Broken:** Click “Increment parent state”. Console: ParentBroken re-renders, ExpensiveChild re-renders, `[props]` shows `reference equal: false`, `[expensive]` shows simulated work every time.
2. **Fixed:** Click “Increment parent state”. Console: ParentFixed re-renders, ExpensiveChild does **not** re-render (no `[props]` / `[expensive]` for the child). Memo skipped.

## Run

From project root: `npm run dev`, open the app, switch to “Expensive child” demo (or the tab that shows this demo), open console, and use “Broken” vs “Fixed” and “Increment parent state.”
