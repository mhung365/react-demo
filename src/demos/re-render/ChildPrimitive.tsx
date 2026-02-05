import { useRenderLog } from './useRenderLog'

/**
 * Receives only a primitive. No React.memo.
 * Re-renders every time the parent (Dashboard) re-renders — even if `count` didn't change.
 * This demonstrates: re-render ≠ "props changed". Re-render = "parent (or self) caused this component to run again".
 */
interface Props {
  count: number
}

export function ChildPrimitive({ count }: Props) {
  useRenderLog('ChildPrimitive', {
    reason: 'No memo — parent re-rendered, so this runs every time',
    count,
  })

  return (
    <div className="child child-primitive" data-testid="child-primitive">
      <span className="label">ChildPrimitive (no memo)</span>
      <span className="value">count={count}</span>
    </div>
  )
}
