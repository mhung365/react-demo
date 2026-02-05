# Senior PR Review: Props Drilling vs Context Demo

## What’s good

- **Two variants solve the same problem:** Same form (name, email, role) and summary; one uses props drilling (4 levels), one uses Context. Direct comparison of readability, traceability, and re-render behavior.
- **Explicit render logs:** useRenderLog in every component so typing in a field shows who re-renders in both versions. Re-render count is similar; the difference is **mental overhead** (props = follow the tree; Context = find Provider and consumers).
- **Props drilling version is clearly simpler:** No Provider, no context type, no useContext. Each component’s signature shows formData and setField. Traceability: follow the tree upward to find where state lives.
- **Context version shows unnecessary complexity:** For 4 levels, we added FormProvider, FormContext, and useContext in every component. No reduction in re-renders; harder to trace and debug.

---

## Common junior misconceptions about props drilling

1. **“Props drilling is always bad.”** It’s bad when the tree is **deep** (many levels) or when **many unrelated branches** need the same data. For a small-to-medium tree (e.g. 4 levels), props drilling is often **simpler and clearer** than Context. Avoiding it “from day one” with Context adds indirection without benefit.

2. **“Context is the React way to avoid prop drilling.”** Context is **one** way to pass data without drilling through every level; it’s not the default. The default is props. Use Context when you have a real pain (deep tree, many branches); don’t use it preemptively.

3. **“Context reduces re-renders.”** It doesn’t by default. When the context value changes, **every** consumer re-renders. To reduce re-renders you need split contexts or memo + stable props — and you can do the same with props (memo children). At shallow depth, Context often re-renders the same path as props.

4. **“If I’m passing the same prop through 2–3 levels, I should use Context.”** 2–3 levels is usually fine. The prop list is short; the data flow is explicit. Context adds a Provider, a context type, and useContext in every consumer — more code and implicit flow. Use Context when the **depth** or **number of branches** makes drilling painful (e.g. 6+ levels or 5+ components in different branches).

5. **“Props drilling makes refactoring hard.”** Refactoring “move state down” or “move state up” with props is straightforward: change who owns state and adjust the prop chain. With Context, you have to move the Provider and ensure every consumer still has access. For a linear path, props are often easier to refactor because the flow is visible.

---

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| Props drilling for 4 levels | Explicit data flow; easy to trace; no Provider/useContext | Same prop names repeated in signatures (formData, setField) |
| Context for 4 levels | No repeated prop names in intermediate components | Implicit flow; must find Provider and all consumers; more boilerplate (Provider, context type, useContext) |
| useRenderLog in both | Clear comparison of who re-renders | Noisy; dev-only |

---

## When props drilling stops being acceptable

- **Depth:** Passing the same 2–3 props through **6+ levels** is tedious and error-prone. Consider Context (with a narrow provider) or composition (e.g. a wrapper component that owns state and renders children with props).
- **Many branches:** Header, Sidebar, Modal, and a deep Form all need “current user”. Drilling from root through each branch means touching many components; a single UserContext (or similar) can be justified.
- **Frequently changing prop shape:** If the “drilled” object grows (e.g. formData gains 10 fields) and every level only passes it through, TypeScript and refactors get heavier; Context doesn’t fix that by itself, but a single “form context” can avoid listing every field in every signature. Weigh against traceability.

**Rule of thumb:** Start with props. If the tree is shallow (e.g. ≤ 5 levels) and the prop list is small (e.g. 2–4 props), **props drilling is a good choice**. Add Context (or composition) when you feel real pain: “I’m adding the same 5 props to yet another level” or “I have 4 different branches that all need this.” Don’t use Context preemptively to “avoid props drilling” before the tree is deep or the branches are many.
