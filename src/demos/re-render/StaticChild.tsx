import { useRenderLog } from './useRenderLog'

/**
 * No props from parent that change. Renders static content.
 * When parent re-renders, this component function still runs (we see [render] log),
 * but the returned JSX is identical to the previous render → React reconciles,
 * finds no diff → no DOM update. So: re-render happened, DOM was NOT updated.
 */
export function StaticChild() {
  useRenderLog('StaticChild', {
    reason: 'Re-render but same output → no DOM update',
  })

  return (
    <div className="child child-static" data-testid="child-static">
      <span className="label">StaticChild (static content)</span>
      <span className="value">I never change. Same JSX every time.</span>
    </div>
  )
}
