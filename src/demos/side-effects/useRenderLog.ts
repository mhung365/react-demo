import { useRef } from 'react'

/**
 * Logs every time the component function runs (render phase only).
 * Use with useEffectRunLog to compare: [render] runs sync, [effect] runs after commit.
 */
export function useRenderLog(componentName: string, meta?: Record<string, unknown>): void {
  const renderCount = useRef(0)
  renderCount.current += 1
  const count = renderCount.current
  const metaStr = meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : ''
  console.log(
    `[render] ${componentName} #${count}${metaStr}`,
    `\n  → Component body ran (synchronous). No effects have run yet.`
  )
}
