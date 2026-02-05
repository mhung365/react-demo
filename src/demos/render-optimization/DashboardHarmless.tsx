import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import type { MetricCardProps, StatRowProps } from './types'

/**
 * Cheap presentational components — no memo.
 * Each re-renders when parent state changes; each render is trivial (simple JSX).
 */
function MetricCard({ label, value, trend }: MetricCardProps) {
  useRenderLog('MetricCard', { label })
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {trend && (
        <span className="metric-card__meta">trend: {trend}</span>
      )}
    </div>
  )
}

function StatRow({ label, value }: StatRowProps) {
  useRenderLog('StatRow', { label })
  return (
    <div className="stat-row">
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value">{value}</span>
    </div>
  )
}

/**
 * Dashboard with many children, all cheap to render.
 * Parent state (tick) updates frequently → many re-renders, but each render is ~0ms.
 * This is "render noise": lots of [render] logs, no measurable perf issue.
 */
export function DashboardHarmless() {
  const [tick, setTick] = useState(0)
  useRenderLog('DashboardHarmless')
  useMeasureRender('DashboardHarmless')

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h2 className="dashboard__title">Harmless re-renders (no optimization)</h2>
        <div className="dashboard__actions">
          <button
            type="button"
            className="primary"
            onClick={() => setTick((c) => c + 1)}
          >
            Increment (tick: {tick})
          </button>
        </div>
      </header>

      <div className="dashboard__grid">
        <MetricCard label="Revenue" value={`$${(tick * 100).toLocaleString()}`} trend="up" />
        <MetricCard label="Users" value={1000 + tick} trend="neutral" />
        <MetricCard label="Orders" value={50 + tick * 2} trend="up" />
        <MetricCard label="Conversion" value={`${2.5 + tick * 0.1}%`} trend="down" />
      </div>

      <div className="dashboard__row" style={{ marginTop: '1rem' }}>
        <StatRow label="Avg. order value" value={`$${120 + tick}`} />
        <StatRow label="Bounce rate" value={`${32 - tick}%`} />
        <StatRow label="Sessions" value={5000 + tick * 10} />
      </div>

      <p className="measure-hint">
        <strong>Console:</strong> You’ll see many <code>[render]</code> and <code>[measure]</code> logs per click.
        Each render is cheap (~0–0.5ms). This is <strong>render noise</strong> — no need to optimize.
      </p>
    </div>
  )
}
