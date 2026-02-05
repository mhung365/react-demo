import { useRef, useEffect } from 'react'

/**
 * Logs when a useEffect runs, so we can compare execution order:
 * [render] runs during the component function (synchronous).
 * [effect] runs after commit (asynchronous, after paint).
 *
 * Use with useRenderLog to see: render #1 → render #2 → effect (mount) → render #3 → effect (deps changed).
 */
export function useEffectRunLog(componentName: string, effectLabel: string, deps: unknown[]): void {
  const runCount = useRef(0)
  const prevDepsRef = useRef<unknown[] | null>(null)

  useEffect(() => {
    runCount.current += 1
    const count = runCount.current
    const isMount = prevDepsRef.current === null
    const reason = isMount ? 'mount' : 'deps changed'
    console.log(
      `[effect] ${componentName} — "${effectLabel}" #${count} (${reason})`,
      `\n  → Side effect ran after commit. deps:`,
      deps
    )
    prevDepsRef.current = [...deps]
  }, deps)
}
