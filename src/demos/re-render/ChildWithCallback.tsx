import { memo } from 'react'
import { useRenderLog } from './useRenderLog'

/**
 * Memo + stable callback (parent uses useCallback).
 * If parent passed onClick={() => {}} inline, new function ref every render → memo wouldn't help.
 */
interface Props {
  onAction: () => void
}

function ChildWithCallbackInner({ onAction }: Props) {
  useRenderLog('ChildWithCallback', {
    reason: 'Memo + useCallback in parent — stable ref, skips re-render when parent re-renders',
  })

  return (
    <div className="child child-callback" data-testid="child-callback">
      <span className="label">ChildWithCallback (memo + useCallback)</span>
      <button type="button" onClick={onAction}>
        Fire callback
      </button>
    </div>
  )
}

export const ChildWithCallback = memo(ChildWithCallbackInner)
