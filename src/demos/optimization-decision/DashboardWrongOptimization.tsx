import { useState, memo, useCallback } from 'react'
import { useDashboardRenderCount } from './useDashboardRenderCount'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { simulateExpensiveWork } from '../render-optimization/simulateExpensiveWork'
import { ClassificationPanel } from './ClassificationPanel'
import { TEAMS } from './types'

const Header = memo(function Header({ theme, tick }: { theme: string; tick: number }) {
  useDashboardRenderCount('Header (memo)', 'harmless')
  return (
    <header className="opt-dash__header">
      <h1>Enterprise Dashboard</h1>
      <span>Theme: {theme} · Tick: {tick}</span>
    </header>
  )
})

const Sidebar = memo(function Sidebar({ selectedTeam, onSelect }: { selectedTeam: string; onSelect: (t: string) => void }) {
  useDashboardRenderCount('Sidebar (memo)', 'harmless')
  return (
    <aside className="opt-dash__sidebar">
      <p>Teams</p>
      {TEAMS.map((t) => (
        <button
          key={t}
          type="button"
          className={selectedTeam === t ? 'active' : ''}
          onClick={() => onSelect(t)}
        >
          {t}
        </button>
      ))}
    </aside>
  )
})

const TeamAWidgets = memo(function TeamAWidgets({ tick }: { tick: number }) {
  useDashboardRenderCount('TeamAWidgets (memo)', 'harmless')
  return (
    <div className="opt-dash__widgets">
      <div className="opt-dash__card">Revenue: ${(tick * 100).toLocaleString()}</div>
      <div className="opt-dash__card">Users: {1000 + tick}</div>
      <div className="opt-dash__card">Orders: {50 + tick * 2}</div>
    </div>
  )
})

const TeamBList = memo(function TeamBList({ selectedTeam, tick }: { selectedTeam: string; tick: number }) {
  useDashboardRenderCount('TeamBList (memo)', 'tolerable')
  const items = Array.from({ length: 15 }, (_, i) => `${selectedTeam} item ${i + tick}`)
  return (
    <div className="opt-dash__list">
      <p>List for {selectedTeam}</p>
      <ul>
        {items.slice(0, 8).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
})

function TeamCChart({ tick }: { tick: number }) {
  useDashboardRenderCount('TeamCChart (not memo)', 'must-fix')
  const ms = simulateExpensiveWork()
  useMeasureRender('TeamCChart (wrong opt)', (measured) => {
    (window as unknown as { __optChartMs?: number }).__optChartMs = measured
  })
  return (
    <div className="opt-dash__chart">
      <div className="opt-dash__chart-meta">
        <span>Team C chart (expensive)</span>
        <span>~{ms.toFixed(1)}ms this render</span>
      </div>
      <div className="opt-dash__chart-placeholder">Heavy chart (tick: {tick})</div>
    </div>
  )
}

/**
 * Wrong optimization: memoize Header, Sidebar, TeamAWidgets, TeamBList; useCallback for onSelect.
 * TeamCChart is NOT memoized and still receives tick from parent → still re-renders on every tick.
 * Result: more code (memo + useCallback everywhere), no improvement on the expensive chart.
 * Optimizing the wrong layer: we reduced re-renders of cheap components but the must-fix
 * (TeamCChart) still runs expensive work every time.
 */
export function DashboardWrongOptimization() {
  const [theme, setTheme] = useState('dark')
  const [selectedTeam, setSelectedTeam] = useState<string>(TEAMS[0])
  const [tick, setTick] = useState(0)
  useDashboardRenderCount('DashboardShell', 'harmless')
  const onSelect = useCallback((t: string) => setSelectedTeam(t), [])

  return (
    <div className="opt-dash opt-dash--wrong">
      <div className="opt-dash__layout">
        <Header theme={theme} tick={tick} />
        <Sidebar selectedTeam={selectedTeam} onSelect={onSelect} />
        <main className="opt-dash__main">
          <div className="opt-dash__actions">
            <button type="button" onClick={() => setTick((c) => c + 1)}>Refresh (tick)</button>
            <button type="button" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>Toggle theme</button>
          </div>
          <TeamAWidgets tick={tick} />
          <TeamBList selectedTeam={selectedTeam} tick={tick} />
          <TeamCChart tick={tick} />
        </main>
      </div>
      <ClassificationPanel variant="wrong" />
      <p className="opt-dash__hint opt-dash__hint--bad">
        Rejected: We memoized cheap components (Header, Sidebar, widgets, list). TeamCChart still
        re-renders because it receives <code>tick</code> from parent. Console [measure] still
        ~10–30ms per click. More code, no user impact. Right fix: move tick state down so only
        TeamC re-renders.
      </p>
    </div>
  )
}
