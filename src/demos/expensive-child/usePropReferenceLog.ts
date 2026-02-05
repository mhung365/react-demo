import { useRef, useEffect } from 'react'

/**
 * Logs value equality vs reference equality for props.
 * - "Props look the same" = same values (e.g. JSON.stringify(a) === JSON.stringify(b)).
 * - "Props are referentially equal" = same reference (a === b).
 * React.memo uses shallow comparison: it checks reference equality (===) for objects/functions,
 * so inline {} or () => {} in the parent create new refs every render → memo fails.
 */
export function usePropReferenceLog<P extends Record<string, unknown>>(
  componentName: string,
  props: P,
  propKeys: (keyof P)[]
): void {
  const prevPropsRef = useRef<Partial<P> | null>(null)
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  // Value comparison: would "deep equal" say they're the same?
  const valueEqual: Record<string, boolean> = {}
  const refEqual: Record<string, boolean> = {}

  const isFirstRender = prevPropsRef.current === null

  for (const key of propKeys) {
    const current = props[key]
    const prev = prevPropsRef.current?.[key]
    if (isFirstRender) {
      valueEqual[key as string] = false
      refEqual[key as string] = false
    } else {
      const currentVal = typeof current === 'function' ? '[Function]' : JSON.stringify(current)
      const prevVal = typeof prev === 'function' ? '[Function]' : JSON.stringify(prev)
      valueEqual[key as string] = currentVal === prevVal
      refEqual[key as string] = current === prev
    }
  }

  const allRefEqual = !isFirstRender && propKeys.every((k) => refEqual[k as string] === true)

  console.log(
    `[props] ${componentName} render #${renderCount}`,
    isFirstRender ? `\n  (first render — no previous props)` : '',
    `\n  value equal (look the same):    ${JSON.stringify(valueEqual)}`,
    `\n  reference equal (===):         ${JSON.stringify(refEqual)}`,
    `\n  → React.memo uses REFERENCE. Same value but new ref → child re-renders.`,
    allRefEqual
      ? `\n  → All refs same (stable from parent). We still re-rendered because parent re-rendered — wrap in memo to skip.`
      : `\n  → New ref(s) (e.g. inline {} or () => {}). React.memo cannot skip — child re-renders every time.`
  )

  // Update "previous" after commit so next render can compare
  useEffect(() => {
    prevPropsRef.current = { ...props }
  })
}
