import { memo } from 'react'
import { useRenderLog } from './useRenderLog'
import type { DashboardConfig } from './types'

/**
 * React.memo + stable config from parent (useMemo).
 * When parent re-renders but stableConfig ref is the same, React skips re-running this component.
 * You will NOT see a [render] log for ChildStableProps when you only increment count.
 */
interface Props {
  config: DashboardConfig
}

function ChildStablePropsInner({ config }: Props) {
  useRenderLog('ChildStableProps', {
    reason: 'Memo + stable config — only re-renders when config ref changes',
    config,
  })

  return (
    <div className="child child-stable" data-testid="child-stable-props">
      <span className="label">ChildStableProps (memo + useMemo config)</span>
      <span className="value">{config.theme} / {config.locale}</span>
    </div>
  )
}

export const ChildStableProps = memo(ChildStablePropsInner)
