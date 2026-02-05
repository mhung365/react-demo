import { useState, useMemo, memo, useRef, useCallback } from 'react'
import { useMeasureRender } from './useMeasureRender'
import { cheapComputation, simulateExpensiveWork } from './simulateWork'

/**
 * Dashboard with frequent state updates and derived computations.
 * Explicit measurements: "Last render: Xms" per panel to compare memo overhead vs benefit.
 */

type PanelId = 'cheapNoMemo' | 'cheapWithMemo' | 'expensiveJustified' | 'unstableDeps'

// ----- Panel 1: Cheap derived, NO useMemo — baseline (fast) -----
function PanelCheapNoMemo({
  tick,
  onIncrement,
  onMeasured,
  lastRenderMs,
}: {
  tick: number
  onIncrement: () => void
  onMeasured: (ms: number) => void
  lastRenderMs: number | null
}) {
  useMeasureRender('DashboardCheapNoMemo', onMeasured)
  const derived = cheapComputation()
  return (
    <div className="memo-cost-card memo-cost-card--correct memo-dashboard__panel">
      <header className="memo-cost-card__header">
        <h3>Cheap derived (no useMemo)</h3>
        <p>derived = cheapComputation() in render. No comparison, no cache.</p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Last render:</span>
        <span className="memo-cost-card__value">{lastRenderMs != null ? `${lastRenderMs.toFixed(2)}ms` : '—'}</span>
      </div>
      <div className="memo-cost-card__row">tick: {tick}, theme: {derived.theme}</div>
      <button type="button" onClick={onIncrement}>Increment tick</button>
    </div>
  )
}

// ----- Panel 2: Cheap derived, WITH useMemo — overhead cost -----
function PanelCheapWithMemo({
  tick,
  onIncrement,
  onMeasured,
  lastRenderMs,
}: {
  tick: number
  onIncrement: () => void
  onMeasured: (ms: number) => void
  lastRenderMs: number | null
}) {
  useMeasureRender('DashboardCheapWithMemo', onMeasured)
  const derived = useMemo(() => cheapComputation(), [])
  return (
    <div className="memo-cost-card memo-cost-card--wrong memo-dashboard__panel">
      <header className="memo-cost-card__header">
        <h3>Cheap derived (with useMemo)</h3>
        <p>useMemo(() =&gt; cheapComputation(), []). We pay dep comparison every render for no benefit.</p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Last render:</span>
        <span className="memo-cost-card__value">{lastRenderMs != null ? `${lastRenderMs.toFixed(2)}ms` : '—'}</span>
      </div>
      <div className="memo-cost-card__row">tick: {tick}, theme: {derived.theme}</div>
      <button type="button" onClick={onIncrement}>Increment tick</button>
      <p className="memo-cost-card__hint memo-cost-card__hint--wrong">
        Compare with left panel: same computation but useMemo adds comparison overhead → often slightly higher render time.
      </p>
    </div>
  )
}

// ----- Panel 3: Expensive derived, useMemo justified -----
const ExpensiveChild = memo(function ExpensiveChild({
  result,
}: {
  result: { sum: number; count: number; workMs: number }
}) {
  const renderCount = useRef(0)
  renderCount.current += 1
  const ms = simulateExpensiveWork()
  return (
    <div className="memo-cost-card__child">
      <span>sum={result.sum}, count={result.count}</span>
      <span className="memo-cost-card__value">(child renders: {renderCount.current}, work ~{ms.toFixed(2)}ms)</span>
    </div>
  )
})

function PanelExpensiveJustified({
  tick,
  onIncrement,
  onMeasured,
  lastRenderMs,
}: {
  tick: number
  onIncrement: () => void
  onMeasured: (ms: number) => void
  lastRenderMs: number | null
}) {
  useMeasureRender('DashboardExpensiveJustified', onMeasured)
  const [list] = useState(() => Array.from({ length: 100 }, (_, i) => i))
  const result = useMemo(() => {
    const workMs = simulateExpensiveWork()
    const sum = list.reduce((a, b) => a + b, 0)
    return { sum, count: list.length, workMs }
  }, [list])
  return (
    <div className="memo-cost-card memo-cost-card--correct memo-dashboard__panel">
      <header className="memo-cost-card__header">
        <h3>Expensive derived (useMemo justified)</h3>
        <p>useMemo([list]): when tick changes, deps unchanged → cache hit → no recompute, same ref → child skips.</p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Last render:</span>
        <span className="memo-cost-card__value">{lastRenderMs != null ? `${lastRenderMs.toFixed(2)}ms` : '—'}</span>
      </div>
      <div className="memo-cost-card__row">tick: {tick}</div>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">First compute (cached after):</span>
        <span className="memo-cost-card__value">~{result.workMs.toFixed(2)}ms</span>
      </div>
      <ExpensiveChild result={result} />
      <button type="button" onClick={onIncrement}>Increment tick</button>
      <p className="memo-cost-card__hint">
        Click Increment: parent re-renders but useMemo returns cached result. Child does NOT re-render. Last render stays low (no expensive work).
      </p>
    </div>
  )
}

// ----- Panel 4: Unstable deps — memoization nullified -----
function PanelUnstableDeps({
  tick,
  onIncrement,
  onMeasured,
  lastRenderMs,
}: {
  tick: number
  onIncrement: () => void
  onMeasured: (ms: number) => void
  lastRenderMs: number | null
}) {
  useMeasureRender('DashboardUnstableDeps', onMeasured)
  const config = { theme: 'dark' as const }
  const result = useMemo(() => {
    const workMs = simulateExpensiveWork()
    return { theme: config.theme, workMs }
  }, [config])
  return (
    <div className="memo-cost-card memo-cost-card--wrong memo-dashboard__panel">
      <header className="memo-cost-card__header">
        <h3>Unstable deps (memo nullified)</h3>
        <p>useMemo([config]) but config = {`{}`} every render → new ref → recompute every time. Cache never used.</p>
      </header>
      <div className="memo-cost-card__row">
        <span className="memo-cost-card__label">Last render:</span>
        <span className="memo-cost-card__value">{lastRenderMs != null ? `${lastRenderMs.toFixed(2)}ms` : '—'}</span>
      </div>
      <div className="memo-cost-card__row">tick: {tick}, theme: {result.theme}</div>
      <button type="button" onClick={onIncrement}>Increment tick</button>
      <p className="memo-cost-card__hint memo-cost-card__hint--wrong">
        Each click → new config ref → useMemo recomputes (expensive). Worse than no useMemo (comparison + factory every time).
      </p>
    </div>
  )
}

// ----- Dashboard container -----
export function DashboardUseMemoCost() {
  const [tick, setTick] = useState(0)
  const [lastRenderMs, setLastRenderMs] = useState<Record<PanelId, number | null>>({
    cheapNoMemo: null,
    cheapWithMemo: null,
    expensiveJustified: null,
    unstableDeps: null,
  })

  const setCheapNoMemoMs = useCallback((ms: number) => {
    setLastRenderMs((prev) => ({ ...prev, cheapNoMemo: ms }))
  }, [])
  const setCheapWithMemoMs = useCallback((ms: number) => {
    setLastRenderMs((prev) => ({ ...prev, cheapWithMemo: ms }))
  }, [])
  const setExpensiveJustifiedMs = useCallback((ms: number) => {
    setLastRenderMs((prev) => ({ ...prev, expensiveJustified: ms }))
  }, [])
  const setUnstableDepsMs = useCallback((ms: number) => {
    setLastRenderMs((prev) => ({ ...prev, unstableDeps: ms }))
  }, [])
  const increment = useCallback(() => setTick((t) => t + 1), [])

  return (
    <section className="memo-dashboard">
      <header className="memo-dashboard__header">
        <h2>Dashboard: render time vs memo cost</h2>
        <p>
          Shared <strong>tick</strong> state — click Increment to trigger frequent re-renders. Compare &quot;Last render&quot; ms:
          cheap no-memo (baseline) vs cheap with useMemo (overhead) vs expensive justified (cache hit) vs unstable deps (recompute every time).
        </p>
        <p className="memo-dashboard__tick">tick: {tick}</p>
      </header>
      <div className="memo-dashboard__grid">
        <PanelCheapNoMemo
          tick={tick}
          onIncrement={increment}
          onMeasured={setCheapNoMemoMs}
          lastRenderMs={lastRenderMs.cheapNoMemo}
        />
        <PanelCheapWithMemo
          tick={tick}
          onIncrement={increment}
          onMeasured={setCheapWithMemoMs}
          lastRenderMs={lastRenderMs.cheapWithMemo}
        />
        <PanelExpensiveJustified
          tick={tick}
          onIncrement={increment}
          onMeasured={setExpensiveJustifiedMs}
          lastRenderMs={lastRenderMs.expensiveJustified}
        />
        <PanelUnstableDeps
          tick={tick}
          onIncrement={increment}
          onMeasured={setUnstableDepsMs}
          lastRenderMs={lastRenderMs.unstableDeps}
        />
      </div>
    </section>
  )
}
