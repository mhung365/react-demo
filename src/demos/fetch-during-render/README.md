# Why fetching during render is wrong

## What this demo covers

- **Broken:** Unconditional fetch in the component body → setState on resolve → re-render → fetch again → **infinite loop**. Console: repeated `[render]` and "fetch during render".
- **Conditional:** Fetch only when `!data` — no infinite loop but render is still **impure**; Strict Mode can trigger two renders → two fetches.
- **Correct:** Fetch in `useEffect`; render is **pure** (no side effects). Console: two renders (initial + when data arrives), no fetch during render.

## How to run

1. Run the app and open **Fetch during render** from the nav.
2. Open DevTools → Console.
3. **Broken:** Watch `[render]` #1, #2, #3, … and "fetch started during render" every time (infinite loop).
4. **Conditional:** See two `[render]` logs in Strict Mode; render is still impure.
5. **Correct:** See `[render]` #1, then #2 when data arrives; fetch runs in effect, not during render.

## Files

| File | Purpose |
|------|--------|
| `FetchDuringRenderBroken.tsx` | Fetch in render (unconditional) → infinite loop. |
| `ConditionalFetchDuringRender.tsx` | Fetch in render when `!config` — no loop but impure. |
| `FetchInEffectCorrect.tsx` | Fetch in useEffect; pure render. |
| `useRenderLog.ts` | Logs each render so we see repeated runs. |
