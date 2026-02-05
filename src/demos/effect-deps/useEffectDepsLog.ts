import { useRef, useEffect } from 'react'

/**
 * Logs when an effect runs and why (mount vs deps changed).
 * React compares previous deps with current deps using Object.is; if any differ, effect re-runs.
 *
 * Use to show: "effect ran because deps changed: [userId]" or "effect ran (mount)".
 */
export function useWhyEffectRan(componentName: string, deps: unknown[], depNames: string[]): void {
  const prevDepsRef = useRef<unknown[] | null>(null)
  const isFirstRun = prevDepsRef.current === null

  useEffect(() => {
    const prev = prevDepsRef.current
    if (prev === null) {
      console.log(
        `[${componentName}] effect ran — reason: mount (first run). deps: ${JSON.stringify(depNames.map((n, i) => `${n}=${deps[i]}`))}`
      )
    } else {
      const changed = depNames.filter((_, i) => !Object.is(prev[i], deps[i]))
      if (changed.length > 0) {
        console.log(
          `[${componentName}] effect ran — reason: deps changed (React compared with Object.is). changed: [${changed.join(', ')}]. ` +
            `prev: ${JSON.stringify(prev)}, current: ${JSON.stringify(deps)}`
        )
      }
    }
    prevDepsRef.current = [...deps]
  }, deps)
}
