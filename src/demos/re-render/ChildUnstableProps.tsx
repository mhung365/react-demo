import { memo } from 'react'
import { useRenderLog } from './useRenderLog'
import type { DashboardConfig } from './types'

/**
 * React.memo but parent passes inline object: config={{ theme: 'dark', locale: 'en' }}.
 * Shallow compare sees a new object reference every time → memo doesn't prevent re-render.
 * Common junior mistake: wrapping in memo but still passing inline objects/functions.
 */
interface Props {
  config: DashboardConfig
}

function ChildUnstablePropsInner({ config }: Props) {
  useRenderLog('ChildUnstableProps', {
    reason: 'Memo + inline object — new ref every render, so memo is useless here',
    config,
  })

  return (
    <div className="child child-unstable" data-testid="child-unstable-props">
      <span className="label">ChildUnstableProps (memo + inline config)</span>
      <span className="value">{config.theme} / {config.locale}</span>
    </div>
  )
}

export const ChildUnstableProps = memo(ChildUnstablePropsInner)
