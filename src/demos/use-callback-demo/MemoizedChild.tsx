import { memo, useRef } from 'react'

/**
 * Memoized child: re-renders only when props (shallow) change.
 * When parent passes a new callback reference every render (inline () => {}),
 * prevProps.onAction !== nextProps.onAction → child re-renders every time.
 */
interface Props {
  onAction: (value: string) => void
  label: string
}

function MemoizedChildInner({ onAction, label }: Props) {
  const renderCount = useRef(0)
  renderCount.current += 1
  console.log(`[MemoizedChild] render #${renderCount.current} — received onAction (identity may be new or same)`)

  return (
    <div className="callback-demo-card__child">
      <span className="callback-demo-card__label">{label}</span>
      <span className="callback-demo-card__value">Render count: {renderCount.current}</span>
      <button type="button" onClick={() => onAction('clicked')}>
        Invoke callback
      </button>
    </div>
  )
}

export const MemoizedChild = memo(MemoizedChildInner)
