import { useRenderLog } from './useRenderLog'
import type { DashboardConfig } from './types'

/**
 * Receives an object prop created inline in parent: config={{ theme: 'dark', locale: 'en' }}.
 * New object reference on every parent render → prop identity changes every time.
 * So this component re-renders every time parent re-renders (and would re-render even with memo,
 * because props are not referentially equal).
 */
interface Props {
  config: DashboardConfig
}

export function ChildInlineObject({ config }: Props) {
  useRenderLog('ChildInlineObject', {
    reason: 'Inline object in parent → new ref every render',
    config,
  })

  return (
    <div className="child child-inline" data-testid="child-inline-object">
      <span className="label">ChildInlineObject (inline config)</span>
      <span className="value">{config.theme} / {config.locale}</span>
    </div>
  )
}
