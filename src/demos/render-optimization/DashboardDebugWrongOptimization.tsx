import { useState, useEffect, memo, useCallback, useMemo, Profiler } from 'react'
import { ProfilerReportProvider, useProfilerReport, ProfilerReportPanel } from './ProfilerReport'
import { useRenderCount, resetRenderCounts } from './useRenderCount'
import { RenderCountPanel } from './RenderCountPanel'
import type { MetricCardProps, StatRowProps } from './types'

/**
 * Wrong optimization: memo/useCallback/useMemo everywhere because "render counts were high".
 * Children still receive changing props (tick) → memo doesn't skip → same re-renders.
 * Profiler shows no improvement (or slightly worse due to comparison overhead).
 */
const MetricCard = memo(function MetricCard({ label, value, trend }: MetricCardProps) {
  useRenderCount(`MetricCard(${label})`)
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {trend && <span className="metric-card__meta">trend: {trend}</span>}
    </div>
  )
})

const StatRow = memo(function StatRow({ label, value }: StatRowProps) {
  useRenderCount(`StatRow(${label})`)
  return (
    <div className="stat-row">
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value">{value}</span>
    </div>
  )
})

function DashboardContent() {
  const [tick, setTick] = useState(0)
  const { onRender } = useProfilerReport()
  useRenderCount('Dashboard')

  const onIncrement = useCallback(() => setTick((c) => c + 1), [])

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
    <Profiler id="root" onRender={(id, phase, actualDuration) => onRender(id, phase, actualDuration)}>
      <div className="dashboard dashboard--premature">
        <header className="dashboard__header">
          <h2 className="dashboard__title">Wrong optimization: based on logs only</h2>
          <div className="dashboard__actions">
            <button type="button" className="primary" onClick={onIncrement}>
              Increment (tick: {tick})
            </button>
          </div>
        </header>

        <div className="dashboard__grid">
          {metricCards.map((card) => (
            <MetricCard key={card.label} label={card.label} value={card.value} trend={card.trend} />
          ))}
        </div>

        <div className="dashboard__row" style={{ marginTop: '1rem' }}>
          {statRows.map((row) => (
            <StatRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>

        <RenderCountPanel />
        <ProfilerReportPanel />
        <p className="measure-hint">
          <strong>Incorrect optimization:</strong> Someone saw high render counts and memo’d everything. Props still
          change every click → same re-renders. Profiler shows no gain (or worse). Always validate with Profiler.
        </p>
      </div>
    </Profiler>
  )
}

export function DashboardDebugWrongOptimization() {
  useEffect(() => {
    resetRenderCounts()
  }, [])

  return (
    <ProfilerReportProvider>
      <DashboardContent />
    </ProfilerReportProvider>
  )
}
