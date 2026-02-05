import { useState, memo, useCallback, useMemo } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import type { MetricCardProps, StatRowProps } from './types'

/**
 * Premature optimization: memo + useCallback + useMemo everywhere,
 * even though every child receives changing props (tick) and render is cheap.
 * Result: same number of re-renders (we pass tick), but we pay comparison overhead
 * and added code complexity. No measurable benefit — often slightly worse.
 */

const MetricCard = memo(function MetricCard({ label, value, trend }: MetricCardProps) {
  useRenderLog('MetricCard (memo)', { label })
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {trend && <span className="metric-card__meta">trend: {trend}</span>}
    </div>
  )
})

const StatRow = memo(function StatRow({ label, value }: StatRowProps) {
  useRenderLog('StatRow (memo)', { label })
  return (
    <div className="stat-row">
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value">{value}</span>
    </div>
  )
})

export function DashboardPremature() {
  const [tick, setTick] = useState(0)
  useRenderLog('DashboardPremature')
  useMeasureRender('DashboardPremature')

  const onIncrement = useCallback(() => {
    setTick((c) => c + 1)
  }, [])

  const metricCards = useMemo(
    () => [
      { label: 'Revenue', value: `$${(tick * 100).toLocaleString()}`, trend: 'up' as const },
      { label: 'Users', value: 1000 + tick, trend: 'neutral' as const },
      { label: 'Orders', value: 50 + tick * 2, trend: 'up' as const },
      { label: 'Conversion', value: `${2.5 + tick * 0.1}%`, trend: 'down' as const },
    ],
    [tick]
  )

  const statRows = useMemo(
    () => [
      { label: 'Avg. order value', value: `$${120 + tick}` },
      { label: 'Bounce rate', value: `${32 - tick}%` },
      { label: 'Sessions', value: 5000 + tick * 10 },
    ],
    [tick]
  )

  return (
    <div className="dashboard dashboard--premature">
      <header className="dashboard__header">
        <h2 className="dashboard__title">Premature optimization (don’t do this)</h2>
        <div className="dashboard__actions">
          <button type="button" className="primary" onClick={onIncrement}>
            Increment (tick: {tick})
          </button>
        </div>
      </header>

      <div className="dashboard__grid">
        {metricCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="dashboard__row" style={{ marginTop: '1rem' }}>
        {statRows.map((row) => (
          <StatRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>

      <p className="measure-hint">
        <strong>Console:</strong> Same many re-renders as &quot;Harmless&quot; — we pass <code>tick</code> into every child,
        so memo doesn’t skip. We added memo/useCallback/useMemo everywhere but get <strong>no benefit</strong>;
        we only pay comparison overhead and more code to maintain.
      </p>
    </div>
  )
}
