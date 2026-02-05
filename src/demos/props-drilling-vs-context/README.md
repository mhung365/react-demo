# Props Drilling vs Context

## When is props drilling actually a GOOD choice in React?

For a **small-to-medium** component tree (e.g. 4 levels: Dashboard → FormLayout → FormSection → FieldGroup → Input), **props drilling is often the better choice**:

- **Readability:** Each component’s props show exactly what it receives (`formData`, `setField`). No guessing. With Context, you see `useContext(FormContext)` — you have to open the Provider to know the shape.
- **Traceability:** To find where `formData` is set, follow the tree upward: Dashboard → FormLayout → FormSection → FieldGroup. One path. With Context, search for `FormProvider` and for every `useContext(FormContext)`.
- **Re-renders:** At this depth, both approaches re-render the path when state changes. Context doesn’t reduce re-renders here; it just hides the flow.
- **Avoiding props drilling too early** (e.g. “we’ll use Context from day one”) is a mistake: you add Provider, context type, and `useContext` in every component with **no benefit** at this depth, and you lose readability and traceability.

## Two variants in the demo

| Variant | What it shows |
|--------|----------------|
| **Props drilling** | `formData` and `setField` passed explicitly through FormLayout → FormSection → FieldGroup. Each signature shows what the component receives. Traceability: follow the tree. No Context. |
| **Context** | Same form with `FormContext`. FormProvider wraps; FormLayout, FormSection, FieldGroup, FormSummary use `useContext(FormContext)`. You don’t see `formData`/`setField` in the signature; you have to find the Provider. Unnecessary complexity for 4 levels. |

## What you see in the demo

1. **Props drilling:** Open a component — you see `formData`, `setField` in the props. Type in a field — console shows path re-renders; data flow is explicit.
2. **Context:** Open a component — you see `useContext(FormContext)`. Where is `formData` set? Search for FormProvider. Same re-render count; more mental overhead and harder debugging.

## When props drilling stops being acceptable

- **Many levels** (e.g. 7+): Passing the same props through many intermediates becomes tedious; Context or composition can reduce boilerplate (at the cost of implicit flow).
- **Many unrelated branches** that need the same data: e.g. Header, Sidebar, and a deep Form all need “current user”. Drilling from root through each branch is verbose; Context (or a narrow provider) can help.
- **Until then:** Prefer props drilling for simplicity and traceability.

## Run

From project root: `npm run dev`, open **“Props drilling vs Context”**, open the console, and switch between the two tabs. Compare readability (inspect component props vs useContext) and traceability (follow tree vs search for Provider).
