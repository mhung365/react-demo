import { useRef } from 'react'

/**
 * Logs every time the component function runs (re-render).
 * Use to show Context-triggered re-renders vs props drilling.
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
    `\n  → Context vs props: this component re-rendered.`
  )
}
