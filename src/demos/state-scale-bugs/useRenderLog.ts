import { useRef } from 'react'

/**
 * Logs every time the component function runs (re-render).
 * Use to show impact of state placement at scale: who re-renders when state grows.
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
    `\n  → State at scale: this component re-rendered.`
  )
}
