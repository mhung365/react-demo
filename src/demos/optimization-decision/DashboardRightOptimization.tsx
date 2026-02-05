import { useState } from 'react'
import { useDashboardRenderCount } from './useDashboardRenderCount'
import { useMeasureRender } from '../use-memo-cost/useMeasureRender'
import { simulateExpensiveWork } from '../render-optimization/simulateExpensiveWork'
import { ClassificationPanel } from './ClassificationPanel'
import { TEAMS } from './types'

function Header({ theme }: { theme: string }) {
  useDashboardRenderCount('Header', 'harmless')
  return (
    <header className="opt-dash__header">
      <h1>Enterprise Dashboard</h1>
      <span>Theme: {theme}</span>
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

function TeamAWidgets() {
  useDashboardRenderCount('TeamAWidgets', 'harmless')
  return (
    <div className="opt-dash__widgets">
      <div className="opt-dash__card">Revenue (static)</div>
      <div className="opt-dash__card">Users (static)</div>
      <div className="opt-dash__card">Orders (static)</div>
    </div>
  )
}

function TeamBList({ selectedTeam }: { selectedTeam: string }) {
  useDashboardRenderCount('TeamBList', 'tolerable')
  const items = Array.from({ length: 15 }, (_, i) => `${selectedTeam} item ${i}`)
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

/**
 * TeamC owns tick state. Only TeamC (and its chart) re-renders when tick updates.
 * Header, Sidebar, TeamA, TeamB do not re-render on tick → real user impact (rest of UI stable).
 */
function TeamCWithOwnTick() {
  const [tick, setTick] = useState(0)
  useDashboardRenderCount('TeamCContainer', 'must-fix')

  const ms = simulateExpensiveWork()
  useMeasureRender('TeamCChart (right opt)', (measured) => {
    (window as unknown as { __optChartMs?: number }).__optChartMs = measured
  })

  return (
    <div className="opt-dash__chart">
      <div className="opt-dash__chart-meta">
        <span>Team C chart (tick colocated here)</span>
        <span>~{ms.toFixed(1)}ms this render</span>
      </div>
      <button type="button" onClick={() => setTick((c) => c + 1)}>Refresh chart (tick: {tick})</button>
      <div className="opt-dash__chart-placeholder">Heavy chart (tick: {tick})</div>
    </div>
  )
}

/**
 * Right optimization: colocate tick state in TeamC. When user clicks "Refresh chart",
 * only TeamC re-renders. Header, Sidebar, TeamA, TeamB do not re-render on tick.
 * Focused fix on the layer that mattered; real user impact (smooth shell, only chart updates).
 */
export function DashboardRightOptimization() {
  const [theme, setTheme] = useState('dark')
  const [selectedTeam, setSelectedTeam] = useState<string>(TEAMS[0])
  useDashboardRenderCount('DashboardShell', 'harmless')

  return (
    <div className="opt-dash opt-dash--right">
      <div className="opt-dash__layout">
        <Header theme={theme} />
        <Sidebar selectedTeam={selectedTeam} onSelect={setSelectedTeam} />
        <main className="opt-dash__main">
          <div className="opt-dash__actions">
            <button type="button" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>Toggle theme</button>
          </div>
          <TeamAWidgets />
          <TeamBList selectedTeam={selectedTeam} />
          <TeamCWithOwnTick />
        </main>
      </div>
      <ClassificationPanel variant="right" />
      <p className="opt-dash__hint opt-dash__hint--good">
        Accepted: Tick state lives in TeamC. Click &quot;Refresh chart&quot; — only TeamC re-renders.
        Header, Sidebar, TeamA, TeamB counts do not increase. Console [measure] still shows chart
        cost when chart updates, but the rest of the tree is stable. Focused optimization with
        real user impact.
      </p>
    </div>
  )
}
