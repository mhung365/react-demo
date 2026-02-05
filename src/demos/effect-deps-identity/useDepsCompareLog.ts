import { useRef, useEffect } from 'react'

/**
 * Logs previous vs current dependency values using Object.is (reference equality).
 * React uses Object.is to decide whether to re-run an effect: if any dep is not Object.is(prev, next),
 * the effect re-runs. Objects, arrays, and functions are compared by reference — new {} or () => {}
 * every render means "changed" even when content looks the same.
 */
export function useDepsCompareLog(
  componentName: string,
  deps: unknown[],
  depNames: string[]
): void {
  const prevDepsRef = useRef<unknown[] | null>(null)

  useEffect(() => {
    const prev = prevDepsRef.current
    const isFirstRun = prev === null

    if (isFirstRun) {
      console.log(
        `[${componentName}] effect ran — first run. deps:`,
        depNames.map((name, i) => `${name}=${typeof deps[i] === 'object' ? 'object' : typeof deps[i]}`)
      )
    } else {
      const comparisons = depNames.map((name, i) => {
        const prevVal = prev[i]
        const currVal = deps[i]
        const same = Object.is(prevVal, currVal)
        const refEqual = prevVal === currVal
        return { name, same, refEqual, prevVal, currVal }
      })
      const anyChanged = comparisons.some((c) => !c.same)
      console.log(
        `[${componentName}] effect ran — deps comparison (Object.is):`,
        comparisons.map((c) => `${c.name}: same=${c.same} (ref equal=${c.refEqual})`)
      )
      if (anyChanged) {
        console.log(
          `[${componentName}] → Effect re-ran because at least one dep had a different reference. ` +
            `Values may "look the same" but identity changed (new object/array/function each render).`
        )
      }
    }
    prevDepsRef.current = [...deps]
  }, deps)
}
