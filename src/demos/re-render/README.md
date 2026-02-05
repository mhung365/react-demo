# Re-render vs DOM Update — When and Why Components Re-render

## Re-render vs DOM update

| Term | Meaning |
|------|--------|
| **Re-render** | The component **function** ran again. React called your component (e.g. `Dashboard()`). You see a new [render] log. |
| **DOM update** | The **browser DOM** was actually changed (elements added/removed/updated). Happens in the commit phase, only when the new virtual tree differs from the previous one. |

**Important:** A re-render does **not** imply a DOM update. If the component returns the same JSX (same structure and same primitive/ref values), React reconciles and **does not** touch the real DOM. Example: click "Toggle label" — parent re-renders, `StaticChild` and `ChildPrimitive` (when count unchanged) re-render, but their output is identical → no DOM update for those subtrees.

## When does React re-render a component?

1. **State in this component changed** — `setState` (or equivalent) was called; React schedules a re-render for that component.
2. **Parent re-rendered** — By default, when a parent re-renders, React re-renders all its children (the child function runs again). No "prop changed" required.
3. **Context used by this component changed** — A provider’s value changed and this component consumes that context.
4. **Props identity changed (and component is memoized)** — For `memo()` components, React does a shallow prop compare. If any prop reference (or primitive value) changed, the component re-renders.

So: **re-render is not "props changed"**. It’s "this component (or an ancestor) was scheduled to re-run." Props only matter for **skipping** re-renders (e.g. with `memo` + stable props).

## What you see in the demo

- **Increment (parent setState)**  
  Dashboard re-renders → all non-memo children re-render.  
  `ChildStableProps` and `ChildWithCallback` (memo + stable props) do **not** re-render.  
  DOM updates only where the output actually changed (e.g. the displayed count).

- **Toggle label**  
  Same as above: parent re-renders, but `count` is unchanged. So `ChildPrimitive` and `StaticChild` re-render with the **same** output → no DOM update for those nodes.

- **Prop reference identity**  
  `ChildInlineObject` and `ChildUnstableProps` receive a new object every render (`config={{ ... }}`). So they always re-render when the parent re-renders; for `ChildUnstableProps`, `memo` doesn’t help because the prop reference is new every time.

## How to run

```bash
npm install
npm run dev
```

Open the app, open DevTools → Console, then click "Increment (parent setState)" and "Toggle label". Watch the order of `[render]` and `[commit]` logs and which components log.
