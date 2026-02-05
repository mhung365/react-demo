import { useRef } from 'react'

/**
 * Logs every time the component function runs (render phase).
 * Use to show: repeated [render] logs = re-renders; if fetch runs during render, we see fetch start on every render.
 */
export function useRenderLog(componentName: string, meta?: Record<string, unknown>): void {
  const renderCount = useRef(0)
  renderCount.current += 1
  const count = renderCount.current
  const metaStr = meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : ''
  console.log(
    `[render] ${componentName} #${count}${metaStr}`,
    `\n  → Component body ran. Side effects (e.g. fetch) must NOT run here.`
  )
}
