import { useState } from 'react'
import { useDashboardData } from './useDashboardData'
import type { DashboardFilters } from './types'
import './effect-logic-testability-demo.css'

/**
 * REFACTORED: Thin component + custom hook + pure business logic.
 *
 * - Component: holds filter state (UI), calls useDashboardData(filters), renders.
 * - useDashboardData: effect orchestration (fetch when filters change, cleanup); calls
 *   processRawItems (pure pipeline from dashboardLogic.ts).
 * - dashboardLogic.ts: validateItems, normalizeToViewModels, sortByUpdatedDesc,
 *   computeSummary, processRawItems — all pure, unit-testable without React.
 *
 * Testing: unit test dashboardLogic.ts (pass input, assert output). Test useDashboardData
 * with renderHook (mock fetchRawDashboard, change filters, assert returned items/summary).
 * Component tests can be shallow or integration.
 */
export function RefactoredPureAndHook() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')

  const filters: DashboardFilters = { status, search }
  const { items, summary, loading, error } = useDashboardData(filters)

  return (
    <section className="effect-logic-section effect-logic-section--refactored">
      <h2>Refactored: pure functions + custom hook</h2>
      <p className="effect-logic-section__hint">
        Business logic in <code>dashboardLogic.ts</code> (unit-testable). Effect orchestration in <code>useDashboardData</code> (testable with renderHook). Component only renders.
      </p>
      <div className="effect-logic-section__controls">
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DashboardFilters['status'])}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          Search
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name"
          />
        </label>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="effect-logic-section__error">{error.message}</p>}
      {!loading && !error && summary && (
        <>
          <p className="effect-logic-section__meta">
            Total: {summary.total} | Active: {summary.activeCount} | Archived: {summary.archivedCount}
            {summary.lastUpdated && ` | Last: ${summary.lastUpdated.toISOString().slice(0, 10)}`}
          </p>
          <ul className="effect-logic-section__list">
            {items.map((item) => (
              <li key={item.id}>{item.displayLabel} — {item.updatedAt.toISOString().slice(0, 10)}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
