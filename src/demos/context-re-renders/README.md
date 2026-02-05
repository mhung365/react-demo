# Context and Re-renders

## Why does React Context often cause re-renders across large parts of the tree?

- **Context propagation:** When a Provider’s **value** changes (by reference — React uses `Object.is(prevValue, nextValue)`), React re-renders **all** consumers of that context. Not “only the ones that read the changed slice” — every component that called `useContext(Context)` re-renders.
- **Object identity:** React does **not** deep-compare the value. So `value={{ count, theme }}` without `useMemo` creates a **new object every render** → all consumers re-render every time the Provider re-renders.
- **Memoizing consumers does NOT help:** `memo(Component)` skips re-render when the component’s **props** are referentially equal. Context-triggered re-renders are caused by the **context value** (from the nearest Provider) changing — not by props. So when the context value identity changes, React re-renders the consumer; memo does not block that.
- **Refactor:** Split contexts (e.g. CountContext, ThemeContext) so only consumers of the changed context re-render. Memoize Provider value (`useMemo`) so value identity is stable when dependencies haven’t changed.

## Three variants in the demo

| Variant | What it shows |
|--------|----------------|
| **Unstable value** | Provider value = new object every render (no useMemo). Click Increment: AppProvider, CounterDisplay, CounterButton, **ThemeDisplay** all re-render. ThemeDisplay doesn’t need count. |
| **Memo no help** | Same context; value is useMemo; CounterDisplay, CounterButton, ThemeDisplay wrapped in **memo**. Click Increment: all consumers still re-render. memo does **not** prevent Context-triggered re-renders. |
| **Refactored (split)** | CountContext and ThemeContext split. ThemeDisplay uses useTheme() only. Click Increment: only CountProvider, CounterDisplay, CounterButton re-render. **ThemeDisplay does NOT re-render.** Blast radius reduced. |

## What you see in the demo

1. **Unstable value:** Click Increment. Console: 4 logs (Provider + 3 consumers). ThemeDisplay re-renders even though it only reads theme.
2. **Memo no help:** Click Increment. Console: same 4 logs. ThemeDisplay is memo but still re-renders — Context value identity changed; memo doesn’t help.
3. **Refactored:** Click Increment. Console: 3 logs (CountProvider, CounterDisplay, CounterButton). ThemeDisplay does **not** log.

## Run

From project root: `npm run dev`, open **“Context re-renders”**, open the console, and switch between the three tabs. Click Increment and watch who re-renders.
