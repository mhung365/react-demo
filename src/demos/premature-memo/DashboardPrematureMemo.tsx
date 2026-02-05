import { useState, memo, useMemo, useCallback } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import type { MetricItem } from './types'

/**
 * Premature memoization: someone added React.memo, useMemo, useCallback everywhere
 * "for performance" before measuring. Result:
 * - Increased complexity: many useCallback/useMemo with dependency arrays
 * - Harder debugging: which dep broke? Stale closure risk
 * - No measurable gain: we still pass tick (or derived values) to every card,
 *   so memo doesn't skip — same re-renders as Initial
 * - Locks in poor architecture: we "optimized" by piling on memo instead of
 *   colocating state or splitting components
 */
const MetricCard = memo(function MetricCard({ label, value }: MetricItem) {
  useRenderLog('MetricCard (memo)', { label })
  return (
    <div className="premature-metric-card">
      <span className="premature-metric-card__label">{label}</span>
      <span className="premature-metric-card__value">{value}</span>
    </div>
  )
})

export function DashboardPrematureMemo() {
  const [tick, setTick] = useState(0)
  useRenderLog('DashboardPrematureMemo')
  useMeasureRender('DashboardPrematureMemo')

  const onIncrement = useCallback(() => {
    setTick((c) => c + 1)
  }, [])

  const metrics = useMemo<MetricItem[]>(
    () => [
      { label: 'Revenue', value: `$${(tick * 100).toLocaleString()}` },
      { label: 'Users', value: 1000 + tick },
      { label: 'Orders', value: 50 + tick * 2 },
    ],
    [tick]
  )

  return (
    <div className="premature-dashboard premature-dashboard--premature">
      <header className="premature-dashboard__header">
        <h3>Premature: memo everywhere, no gain</h3>
        <p>
          Same dashboard but wrapped in memo/useMemo/useCallback. We still pass <code>tick</code> (via metrics) to every
          card — so memo never skips. More code (deps, callbacks), same re-renders, no measurable improvement. Premature
          memo locks in the same architecture (all state at top) instead of fixing it.
        </p>
      </header>
      <div className="premature-dashboard__actions">
        <button type="button" className="primary" onClick={onIncrement}>
          Increment (tick: {tick})
        </button>
      </div>
      <div className="premature-dashboard__grid">
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
      <p className="premature-hint premature-hint--bad">
        <strong>Console:</strong> Same [render] count as Initial — every card still re-renders (props change every
        click). [measure] similar or slightly worse (memo comparison overhead). Complexity up, gain zero.
      </p>
    </div>
  )
}
