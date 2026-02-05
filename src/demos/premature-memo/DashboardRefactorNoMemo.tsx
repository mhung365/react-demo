import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import type { MetricItem } from './types'

/**
 * Refactor: fix the real issue (architecture) without memoization.
 * Colocate state: only the widget that needs "tick" owns it. The metric grid
 * shows static (or independently loaded) data and doesn't receive tick.
 * Result: when we click Increment, only TickWidget re-renders — not the whole
 * dashboard or the metric cards. No React.memo, no useMemo, no useCallback.
 * Performance improved by fixing architecture, not by piling on memo.
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

function MetricGrid() {
  useRenderLog('MetricGrid')
  useMeasureRender('MetricGrid')

  const metrics: MetricItem[] = [
    { label: 'Revenue', value: '$12,000' },
    { label: 'Users', value: 1000 },
    { label: 'Orders', value: 50 },
  ]

  return (
    <div className="premature-dashboard__grid">
      {metrics.map((m) => (
        <MetricCard key={m.label} label={m.label} value={m.value} />
      ))}
    </div>
  )
}

function TickWidget() {
  const [tick, setTick] = useState(0)
  useRenderLog('TickWidget')
  useMeasureRender('TickWidget')

  return (
    <div className="premature-dashboard__actions">
      <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
        Increment (tick: {tick})
      </button>
    </div>
  )
}

export function DashboardRefactorNoMemo() {
  useRenderLog('DashboardRefactorNoMemo')

  return (
    <div className="premature-dashboard premature-dashboard--refactor">
      <header className="premature-dashboard__header">
        <h3>Refactor: fix architecture, no memo</h3>
        <p>
          State colocation: <code>TickWidget</code> owns <code>tick</code>; <code>MetricGrid</code> shows static data
          and does not receive tick. When you click Increment, only <strong>TickWidget</strong> re-renders — not
          Dashboard, not MetricGrid, not MetricCards. No memoization; we fixed the real issue (who needs the state).
        </p>
      </header>
      <TickWidget />
      <MetricGrid />
      <p className="premature-hint premature-hint--good">
        <strong>Console:</strong> Click Increment. Only [render] TickWidget (and [measure] TickWidget). No [render]
        MetricGrid or MetricCard. Fewer re-renders without any memo — architecture fix.
      </p>
    </div>
  )
}
