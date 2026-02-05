import { useRef, useCallback } from 'react'

/**
 * Measures render time and logs it. Use to compare "with useMemo" vs "without useMemo" scenarios.
 * Logs total time for the render phase (component body execution).
 * Optional onMeasured(ms) callback so UI can display "Last render: Xms" for explicit comparison.
 */
export function useMeasureRender(
  componentName: string,
  onMeasured?: (ms: number) => void
): void {
  const renderCount = useRef(0)
  renderCount.current += 1
  const start = performance.now()
  const onMeasuredRef = useRef(onMeasured)
  onMeasuredRef.current = onMeasured

  // We can't measure "end of render" from inside the component without useLayoutEffect.
  // So we use a microtask to log after the current render completes.
  queueMicrotask(() => {
    const elapsed = performance.now() - start
    console.log(
      `[measure] ${componentName} render #${renderCount.current} — ~${elapsed.toFixed(2)}ms (includes children)`
    )
    onMeasuredRef.current?.(elapsed)
  })
}
