import { useRef } from 'react'

/**
 * Logs every time the component function runs (re-render).
 * Use to show difference between single state object vs multiple useState:
 * - When parent updates one field in an object, children receiving the object get new reference → re-render.
 * - When parent updates one of several useState, children receiving only other props don't re-render.
 */
export function useRenderLog(
  componentName: string,
  meta?: Record<string, unknown>
): void {
  const renderCount = useRef(0)
  renderCount.current += 1
  const count = renderCount.current
  const metaStr = meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : ''
  console.log(
    `[render] ${componentName} #${count}${metaStr}`,
    `\n  → State object tradeoffs: this component re-rendered.`
  )
}
