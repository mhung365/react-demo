import { useRef } from 'react'

type PropChange = { key: string; refEqual: boolean; valueEqual?: boolean }

/**
 * Logs which props changed compared to previous render (shallow comparison).
 * React.memo uses Object.is(prevProp, nextProp) for each key — so we log
 * "ref equal" (same reference) and optionally "value equal" (same content).
 * When a prop changes by reference but not by value, memo still re-renders.
 */
export function usePropChangeLog(
  componentName: string,
  props: Record<string, unknown>,
  propKeys: string[]
): void {
  const prevPropsRef = useRef<Record<string, unknown> | null>(null)
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  const isFirstRender = prevPropsRef.current === null
  const changes: PropChange[] = []

  if (!isFirstRender && prevPropsRef.current) {
    for (const key of propKeys) {
      const prev = prevPropsRef.current[key] as unknown
      const next = props[key] as unknown
      const refEqual = Object.is(prev, next)
      if (!refEqual) {
        const valueEqual =
          typeof next === 'function' || typeof prev === 'function'
            ? undefined
            : JSON.stringify(prev) === JSON.stringify(next)
        changes.push({
          key: String(key),
          refEqual: false,
          valueEqual,
        })
      }
    }
  }

  if (changes.length > 0) {
    const summary = changes
      .map(
        (c) =>
          `${c.key}: refEqual=false${c.valueEqual !== undefined ? `, valueEqual=${c.valueEqual}` : ''}`
      )
      .join('; ')
    console.log(
      `[props] ${componentName} render #${renderCount} — memo skipped? NO. Prop(s) that broke memo: ${summary}`,
      `\n  → React.memo uses shallow comparison (Object.is). One changing prop invalidates memo.`
    )
  } else if (!isFirstRender) {
    console.log(
      `[props] ${componentName} render #${renderCount} — all props ref-equal. (We still re-rendered — parent re-rendered and passed same refs; memo would have skipped if this were the memo boundary.)`
    )
  }

  // Store current props for next comparison (shallow copy so we don't hold live references)
  prevPropsRef.current = {}
  for (const key of propKeys) {
    prevPropsRef.current[key] = props[key]
  }
}
