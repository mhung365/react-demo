import { useState, memo, useMemo, useCallback, useRef } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { simulateExpensiveWork } from '../render-optimization/simulateExpensiveWork'
import type { MetricItem, ChartConfig } from './types'

/**
 * Justified memoization: after refactoring (colocated state), we have one
 * expensive child (ExpensiveChart). We measured that it causes jank when it
 * re-renders. So we add memo + stable props only for that child. The rest
 * of the dashboard stays simple (no memo). This is the right sequence:
 * 1) Initial (no memo), 2) Refactor (fix architecture), 3) Measure, 4) Add memo
 * only where we measured a bottleneck.
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

const ExpensiveChart = memo(function ExpensiveChart({
  config,
  onRefresh,
}: {
  config: ChartConfig
  onRefresh: () => void
}) {
  const renderCount = useRef(0)
  renderCount.current += 1
  useRenderLog('ExpensiveChart (memo)')
  const ms = simulateExpensiveWork()
  useMeasureRender('ExpensiveChart (memo)')
  return (
    <div className="premature-chart-block">
      <div className="premature-chart-block__meta">
        <span className="label">ExpensiveChart (memo, stable props)</span>
        <span className="render-count">Render #{renderCount.current}</span>
        <span className="ms">~{ms.toFixed(2)}ms</span>
        <span>theme={config.theme}</span>
      </div>
      <div className="premature-chart-block__placeholder">Heavy chart (simulated)</div>
      <button type="button" onClick={onRefresh} style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
        Refresh (stable callback)
      </button>
    </div>
  )
})

function TickWidgetWithChart() {
  const [tick, setTick] = useState(0)
  useRenderLog('TickWidgetWithChart')
  useMeasureRender('TickWidgetWithChart')

  const config = useMemo<ChartConfig>(() => ({ theme: 'dark', pageSize: 10 }), [])
  const onRefresh = useCallback(() => console.log('Refresh chart'), [])

  return (
    <>
      <div className="premature-dashboard__actions">
        <button type="button" className="primary" onClick={() => setTick((c) => c + 1)}>
          Increment (tick: {tick})
        </button>
      </div>
      <ExpensiveChart config={config} onRefresh={onRefresh} />
    </>
  )
}

function MetricGridStatic() {
  useRenderLog('MetricGridStatic')
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

export function DashboardJustifiedMemo() {
  useRenderLog('DashboardJustifiedMemo')

  return (
    <div className="premature-dashboard premature-dashboard--justified">
      <header className="premature-dashboard__header">
        <h3>Justified: memo only where we measured</h3>
        <p>
          After refactor (colocated state), we have one <strong>expensive</strong> child (ExpensiveChart). We
          measured that it causes jank. So we add <strong>memo + stable props</strong> only for ExpensiveChart
          (useMemo config, useCallback onRefresh). TickWidget re-renders on Increment but ExpensiveChart does not
          (same refs). MetricGrid stays simple (no memo). Right sequence: refactor first, measure, then memo only
          the bottleneck.
        </p>
      </header>
      <TickWidgetWithChart />
      <MetricGridStatic />
      <p className="premature-hint premature-hint--good">
        <strong>Console:</strong> Click Increment. [render] TickWidgetWithChart runs; [render] ExpensiveChart does
        <strong> not</strong> (memo skip). Only the expensive child is memoized; the rest is plain. Memo justified.
      </p>
    </div>
  )
}
