import { useState, memo, useRef } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { simulateExpensiveWork } from './simulateExpensiveWork'
import type { MetricCardProps, StatRowProps } from './types'

/**
 * Cheap presentational components — still no memo.
 * Optimizing these would be premature; we only memo the expensive child.
 */
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
 * Expensive child — memoized. Receives no props that change with parent state,
 * so when parent re-renders (tick), React skips this component (shallow compare: same props).
 */
const ExpensiveChartBlock = memo(function ExpensiveChartBlock() {
  const renderCount = useRef(0)
  renderCount.current += 1
  useRenderLog('ExpensiveChartBlock (memo)')

  const ms = simulateExpensiveWork()
  useMeasureRender('ExpensiveChartBlock (memo)')

  return (
    <div className="expensive-block">
      <div className="expensive-block__meta">
        <span className="label">ExpensiveChartBlock (memo, stable props)</span>
        <span className="render-count">Render #{renderCount.current}</span>
        <span className="ms">~{ms.toFixed(2)}ms this render</span>
      </div>
      <div className="expensive-block__placeholder">Chart / heavy list (simulated)</div>
    </div>
  )
})

/**
 * Same layout as Problem, but ExpensiveChartBlock is memo and gets no changing props.
 * Increment → parent + cheap children re-render; ExpensiveChartBlock does not.
 * Only optimize where we measured a problem.
 */
export function DashboardOptimized() {
  const [tick, setTick] = useState(0)
  useRenderLog('DashboardOptimized')
  useMeasureRender('DashboardOptimized')

  return (
    <div className="dashboard dashboard--optimized">
      <header className="dashboard__header">
        <h2 className="dashboard__title">Optimized: memo only where justified</h2>
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
        <strong>Console:</strong> <code>[render] ExpensiveChartBlock</code> and <code>[measure] ExpensiveChartBlock</code> do
        <strong> not</strong> run on Increment — only on mount. Cheap cards still re-render; we didn’t memo them (unnecessary).
      </p>
    </div>
  )
}
