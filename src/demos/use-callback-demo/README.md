# useCallback: root cause vs symptoms

This demo teaches whether useCallback **solves the root cause** of re-renders or **only treats symptoms**, and when it adds complexity with no benefit.

## What you'll see

- **Unstable callback:** Parent passes inline callback to memoized child. Every render = new function reference → child re-renders every time. Console: callback identity **NEW** every render; MemoizedChild render count increases on each Increment.
- **useCallback necessary:** Same parent + memoized child, but onAction = useCallback(..., []). Same reference every render → child skips re-render when only count changes. Console: callback identity **SAME**; child render count stays 1.
- **No benefit useCallback:** Parent uses useCallback but child is **not memoized**. Child re-renders when parent re-renders anyway. useCallback adds complexity (dependency array) with no perf benefit.
- **Simplified (no useCallback):** Same scenario (child not memoized) but we pass inline onClick. Simpler code, same behavior. Removing useCallback improves readability with no perf loss.
- **Refactor (context):** Child gets onAction from **context**, not from parent. No useCallback in parent. Parent re-renders don't change context value → child skips re-render. Architecture change removes the need for useCallback entirely.

## How to run

1. Start the app and open **"useCallback"**.
2. Open DevTools → Console.
3. **Unstable:** Click Increment — callback identity NEW every time; MemoizedChild re-renders every time.
4. **useCallback necessary:** Click Increment — callback identity SAME; MemoizedChild does NOT re-render.
5. **No benefit:** Click Increment — PlainChild re-renders every time (not memoized). useCallback doesn't change that.
6. **Simplified:** Same as no benefit — simpler code without useCallback.
7. **Refactor:** Click Increment — parent re-renders but child gets callback from context (stable); child does NOT re-render. No useCallback in parent.

## Concepts

| Term | Meaning |
|------|--------|
| **Function identity** | Inline `() => { ... }` creates a new function every render → new reference. useCallback with stable deps returns same reference. |
| **useCallback fixes a real issue** | Memoized child receives callback; useCallback stabilizes reference so memo can skip when parent re-renders for unrelated state. |
| **useCallback no benefit** | Child not memoized → child re-renders when parent re-renders regardless of callback identity. Removing useCallback: simpler, same perf. |
| **Refactor removes need** | Context (or other architecture) provides the callback so parent doesn't pass it — no useCallback in parent. |
| **Root cause vs symptom** | Root cause: parent re-renders (state changed). useCallback doesn't stop that. It fixes the symptom: unstable callback reference so memoized child doesn't re-render unnecessarily. |

## Files

- `UseCallbackDemo.tsx` — Shell and tabs.
- `useCallbackIdentityLog.ts` — Logs callback identity (SAME vs NEW) each render.
- `MemoizedChild.tsx` — Memoized child that receives onAction; re-renders when prop reference changes.
- `UnstableCallbackParent.tsx` / `StableCallbackParent.tsx` — Unstable vs useCallback (necessary).
- `NoBenefitUseCallback.tsx` / `NoBenefitSimplified.tsx` — useCallback with no benefit vs simplified (no useCallback).
- `RefactorNoCallback.tsx` — Context provides callback; no useCallback in parent.
