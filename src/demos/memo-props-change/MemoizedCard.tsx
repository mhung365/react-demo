import { memo, useRef } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { usePropChangeLog } from './usePropChangeLog'
import type { MemoizedCardProps } from './types'

const PROP_KEYS: (keyof MemoizedCardProps)[] = ['id', 'count', 'config', 'onAction', 'children']

/**
 * Memoized card: re-renders only when props fail shallow comparison (Object.is per prop).
 * usePropChangeLog logs which prop(s) changed when we do re-render — so we see "which prop broke memo".
 */
function MemoizedCardInner(props: MemoizedCardProps) {
  const { id, count, config, onAction, children } = props
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  useRenderLog('MemoizedCard', { renderCount })
  usePropChangeLog('MemoizedCard', props as unknown as Record<string, unknown>, PROP_KEYS as string[])

  return (
    <div className="memo-props-card" data-testid="memoized-card">
      <div className="memo-props-card__meta">
        <span className="label">MemoizedCard (React.memo)</span>
        <span className="render-count">Render #{renderCount}</span>
        <span className="config">id={id} count={count} theme={config.theme} pageSize={config.pageSize}</span>
      </div>
      <button type="button" className="memo-props-card__action" onClick={() => onAction(id)}>
        Action
      </button>
      {children != null && <div className="memo-props-card__children">{children}</div>}
    </div>
  )
}

export const MemoizedCard = memo(MemoizedCardInner)
