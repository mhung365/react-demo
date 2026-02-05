import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import type { MetricItem } from './types'

/**
 * Initial version: works fine without memoization.
 * Simple dashboard with tick state; a few metric cards that display derived values.
 * No React.memo, no useMemo, no useCallback. Code is straightforward; re-renders are cheap.
 */
function MetricCard({ label, value }: MetricItem) {
  useRenderLog('MetricCard', { label })
  return (
    <div className="premature-metric-card">
      <span className="premature-metric-card__label">{label}</span>
      <span className="premature-metric-card__value">{value}</span>
    </div>
  )
}

export function DashboardInitial() {
  const [tick, setTick] = useState(0)
  useRenderLog('DashboardInitial')
  useMeasureRender('DashboardInitial')

  const metrics: MetricItem[] = [
    { label: 'Revenue', value: `$${(tick * 100).toLocaleString()}` },
    { label: 'Users', value: 1000 + tick },
    { label: 'Orders', value: 50 + tick * 2 },
  ]

  return (
    <div className="premature-dashboard premature-dashboard--initial">
      <header className="premature-dashboard__header">
        <h3>Initial: no memoization</h3>
        <p>
          Simple dashboard. tick state at top; metric cards display derived values. No memo — code is simple; re-renders
          are cheap. Click Increment: parent + all cards re-render; [measure] shows total time (typically &lt;1ms).
        </p>
      </header>
      <div className="premature-dashboard__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment (tick: {tick})
        </button>
      </div>
      <div className="premature-dashboard__grid">
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
      <p className="premature-hint">
        <strong>Console:</strong> [render] and [measure] on each Increment. Works fine — no need to optimize yet.
      </p>
    </div>
  )
}
