import { useState, useEffect, Profiler } from 'react'
import { ProfilerReportProvider, useProfilerReport, ProfilerReportPanel } from './ProfilerReport'
import { useRenderCount, resetRenderCounts } from './useRenderCount'
import { RenderCountPanel } from './RenderCountPanel'
import type { MetricCardProps, StatRowProps } from './types'

function MetricCard({ label, value, trend }: MetricCardProps) {
  useRenderCount(`MetricCard(${label})`)
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {trend && <span className="metric-card__meta">trend: {trend}</span>}
    </div>
  )
}

function StatRow({ label, value }: StatRowProps) {
  useRenderCount(`StatRow(${label})`)
  return (
    <div className="stat-row">
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value">{value}</span>
    </div>
  )
}

function DashboardContent() {
  const [tick, setTick] = useState(0)
  const { onRender } = useProfilerReport()
  useRenderCount('Dashboard')

  return (
    <Profiler id="root" onRender={(id, phase, actualDuration) => onRender(id, phase, actualDuration)}>
      <div className="dashboard">
        <header className="dashboard__header">
          <h2 className="dashboard__title">False positive: logs look bad, performance is fine</h2>
          <div className="dashboard__actions">
            <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
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

        <RenderCountPanel />
        <ProfilerReportPanel />
        <p className="measure-hint">
          <strong>Expected re-renders:</strong> Render counts go up every click (many components). Profiler shows total
          &lt;2ms — no bottleneck. Don’t optimize based on logs/counts alone; this is a <strong>false positive</strong>.
        </p>
      </div>
    </Profiler>
  )
}

export function DashboardDebugFalsePositive() {
  useEffect(() => {
    resetRenderCounts()
  }, [])

  return (
    <ProfilerReportProvider>
      <DashboardContent />
    </ProfilerReportProvider>
  )
}
