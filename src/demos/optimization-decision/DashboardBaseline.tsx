import { useState } from 'react'
import { useDashboardRenderCount } from './useDashboardRenderCount'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { simulateExpensiveWork } from '../render-optimization/simulateExpensiveWork'
import { ClassificationPanel } from './ClassificationPanel'
import { TEAMS } from './types'

function Header({ theme, tick }: { theme: string; tick: number }) {
  useDashboardRenderCount('Header', 'harmless')
  return (
    <header className="opt-dash__header">
      <h1>Enterprise Dashboard</h1>
      <span>Theme: {theme} · Tick: {tick}</span>
    </header>
  )
}

function Sidebar({ selectedTeam, onSelect }: { selectedTeam: string; onSelect: (t: string) => void }) {
  useDashboardRenderCount('Sidebar', 'harmless')
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
}

function TeamAWidgets({ tick }: { tick: number }) {
  useDashboardRenderCount('TeamAWidgets', 'harmless')
  return (
    <div className="opt-dash__widgets">
      <div className="opt-dash__card">Revenue: ${(tick * 100).toLocaleString()}</div>
      <div className="opt-dash__card">Users: {1000 + tick}</div>
      <div className="opt-dash__card">Orders: {50 + tick * 2}</div>
    </div>
  )
}

function TeamBList({ selectedTeam, tick }: { selectedTeam: string; tick: number }) {
  useDashboardRenderCount('TeamBList', 'tolerable')
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
}

function TeamCChart({ tick }: { tick: number }) {
  useDashboardRenderCount('TeamCChart', 'must-fix')
  const ms = simulateExpensiveWork()
  useMeasureRender('TeamCChart', (measured) => {
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
 * Baseline: all state at top (theme, selectedTeam, tick). When tick updates (e.g. timer or
 * "Refresh" click), the whole tree re-renders. Header, Sidebar, TeamA = harmless (cheap).
 * TeamBList = tolerable. TeamCChart = must-fix (expensive work every re-render).
 */
export function DashboardBaseline() {
  const [theme, setTheme] = useState('dark')
  const [selectedTeam, setSelectedTeam] = useState<string>(TEAMS[0])
  const [tick, setTick] = useState(0)
  useDashboardRenderCount('DashboardShell', 'harmless')

  return (
    <div className="opt-dash opt-dash--baseline">
      <div className="opt-dash__layout">
        <Header theme={theme} tick={tick} />
        <Sidebar selectedTeam={selectedTeam} onSelect={setSelectedTeam} />
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
      <ClassificationPanel variant="baseline" />
      <p className="opt-dash__hint">
        Click &quot;Refresh (tick)&quot;. Console: [measure] TeamCChart ~10–30ms. All components re-render.
        Classify: Header/Sidebar/TeamA = harmless, TeamB = tolerable, TeamCChart = must-fix.
      </p>
    </div>
  )
}
