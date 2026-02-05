import { useEffect, useLayoutEffect } from 'react'

/**
 * Logs the exact timing: useLayoutEffect runs BEFORE paint, useEffect runs AFTER paint.
 *
 * Order: render → commit (DOM updated) → useLayoutEffect (synchronous, blocks paint) →
 *        browser paint → useEffect (async, does not block paint).
 *
 * We use requestAnimationFrame to approximate "paint": rAF fires before the next repaint.
 * So we'll see: useLayoutEffect log → then rAF log ("paint") → then useEffect log ("after paint").
 */
export function useEffectVsLayoutTiming(componentName: string): void {
  useLayoutEffect(() => {
    console.log(
      `[${componentName}] useLayoutEffect ran — BEFORE PAINT. React has committed DOM; browser has not painted yet. ` +
        `This runs synchronously and blocks painting.`
    )
    const rafId = requestAnimationFrame(() => {
      console.log(
        `[${componentName}] requestAnimationFrame fired — PAINT (or right before next paint). ` +
          `useLayoutEffect already ran; useEffect will run after this.`
      )
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    console.log(
      `[${componentName}] useEffect ran — AFTER PAINT. Browser has (or is about to) paint. ` +
        `Use this for non-visual side effects (fetch, subscribe) so you don't block painting.`
    )
  }, [])
}
