import { useEffect, useLayoutEffect } from 'react'

/**
 * Logs the full lifecycle: render → commit (DOM updated) → effect → cleanup.
 *
 * Order:
 * - "render" = component function ran (during React's render phase).
 * - "commit (DOM updated)" = useLayoutEffect ran — React has committed to the DOM.
 * - "effect ran" = useEffect ran — after paint (browser has painted).
 *
 * On re-render or unmount:
 * - "layout cleanup" runs first (useLayoutEffect cleanup).
 * - "effect cleanup" runs second (useEffect cleanup).
 * Then, if the effect runs again (deps changed): "effect ran".
 * On unmount: only cleanups run; no new effect.
 */
export function useLifecycleLog(componentName: string, deps?: unknown[]): void {
  // Log synchronously during render
  console.log(`[${componentName}] 1. render — component function ran (render phase)`)

  useLayoutEffect(() => {
    console.log(`[${componentName}] 2. commit (DOM updated) — useLayoutEffect ran`)
    return () => {
      console.log(`[${componentName}] 2b. layout cleanup — before next commit or unmount`)
    }
  }, deps ?? [])

  useEffect(() => {
    console.log(`[${componentName}] 3. effect ran — useEffect ran (after paint)`)
    return () => {
      console.log(`[${componentName}] 3b. effect cleanup — before next effect run or unmount`)
    }
  }, deps ?? [])
}
