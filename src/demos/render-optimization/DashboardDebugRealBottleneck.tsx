import { useState, useEffect, useRef, Profiler } from 'react'
import { ProfilerReportProvider, useProfilerReport, ProfilerReportPanel } from './ProfilerReport'
import { useRenderCount, resetRenderCounts } from './useRenderCount'
import { RenderCountPanel } from './RenderCountPanel'
import { simulateExpensiveWork } from './simulateExpensiveWork'
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

function ExpensiveChartBlock({ onRender }: { onRender: (id: string, phase: string, actualDuration: number) => void }) {
  const renderCount = useRef(0)
  renderCount.current += 1
  useRenderCount('ExpensiveChartBlock')

  const ms = simulateExpensiveWork()

  return (
    <Profiler id="ExpensiveChartBlock" onRender={(id, phase, actualDuration) => onRender(id, phase, actualDuration)}>
      <div className="expensive-block">
        <div className="expensive-block__meta">
          <span className="label">ExpensiveChartBlock (heavy work)</span>
          <span className="render-count">Render #{renderCount.current}</span>
          <span className="ms">~{ms.toFixed(2)}ms this render</span>
        </div>
        <div className="expensive-block__placeholder">Chart / heavy list (simulated)</div>
      </div>
    </Profiler>
  )
}

function DashboardContent() {
  const [tick, setTick] = useState(0)
  const { onRender } = useProfilerReport()
  useRenderCount('Dashboard')

  return (
    <Profiler id="root" onRender={(id, phase, actualDuration) => onRender(id, phase, actualDuration)}>
      <div className="dashboard dashboard--problem">
        <header className="dashboard__header">
          <h2 className="dashboard__title">Real bottleneck: Profiler shows slow component</h2>
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

        <ExpensiveChartBlock onRender={onRender} />

        <div className="dashboard__row" style={{ marginTop: '1rem' }}>
          <StatRow label="Avg. order value" value={`$${120 + tick}`} />
          <StatRow label="Bounce rate" value={`${32 - tick}%`} />
          <StatRow label="Sessions" value={5000 + tick * 10} />
        </div>

        <RenderCountPanel />
        <ProfilerReportPanel />
        <p className="measure-hint">
          <strong>Problematic re-renders:</strong> Profiler shows <code>ExpensiveChartBlock</code> ≥10ms. This is a
          real performance issue — fix with memo + stable props (see Correct optimization).
        </p>
      </div>
    </Profiler>
  )
}

export function DashboardDebugRealBottleneck() {
  useEffect(() => {
    resetRenderCounts()
  }, [])

  return (
    <ProfilerReportProvider>
      <DashboardContent />
    </ProfilerReportProvider>
  )
}
