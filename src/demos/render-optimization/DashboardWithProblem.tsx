import { useState, useRef } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { simulateExpensiveWork } from './simulateExpensiveWork'
import type { MetricCardProps, StatRowProps } from './types'

function MetricCard({ label, value, trend }: MetricCardProps) {
  useRenderLog('MetricCard', { label })
  return (
    <div className="metric-card">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {trend && <span className="metric-card__meta">trend: {trend}</span>}
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
 * Simulates a heavy child: e.g. chart, virtual list, or complex table.
 * Runs expensive work every time it re-renders → real jank when parent updates.
 */
function ExpensiveChartBlock() {
  const renderCount = useRef(0)
  renderCount.current += 1
  useRenderLog('ExpensiveChartBlock')

  const ms = simulateExpensiveWork()
  useMeasureRender('ExpensiveChartBlock')

  return (
    <div className="expensive-block">
      <div className="expensive-block__meta">
        <span className="label">ExpensiveChartBlock (heavy work)</span>
        <span className="render-count">Render #{renderCount.current}</span>
        <span className="ms">~{ms.toFixed(2)}ms this render</span>
      </div>
      <div className="expensive-block__placeholder">Chart / heavy list (simulated)</div>
    </div>
  )
}

/**
 * Same dashboard as Harmless, but one child does expensive work on every re-render.
 * Each click → parent re-renders → ExpensiveChartBlock re-renders → 10–30ms+ blocked.
 * This is a real render problem: optimize here (memo + stable props) or move state down.
 */
export function DashboardWithProblem() {
  const [tick, setTick] = useState(0)
  useRenderLog('DashboardWithProblem')
  useMeasureRender('DashboardWithProblem')

  return (
    <div className="dashboard dashboard--problem">
      <header className="dashboard__header">
        <h2 className="dashboard__title">Re-renders causing real jank</h2>
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

      <ExpensiveChartBlock />

      <div className="dashboard__row" style={{ marginTop: '1rem' }}>
        <StatRow label="Avg. order value" value={`$${120 + tick}`} />
        <StatRow label="Bounce rate" value={`${32 - tick}%`} />
        <StatRow label="Sessions" value={5000 + tick * 10} />
      </div>

      <p className="measure-hint">
        <strong>Console:</strong> <code>[measure] ExpensiveChartBlock</code> shows ~10–30ms+ per click.
        UI can feel sluggish. This is a <strong>render problem</strong> — optimization is justified.
      </p>
    </div>
  )
}
