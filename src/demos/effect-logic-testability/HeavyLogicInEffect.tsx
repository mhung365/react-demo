import { useState, useEffect } from 'react'
import { fetchRawDashboard } from './mockApi'
import type {
  RawDashboardItem,
  DashboardViewModel,
  DashboardSummary,
  DashboardFilters,
} from './types'
import './effect-logic-testability-demo.css'

/**
 * ANTI-PATTERN: Heavy business logic lives inside useEffect.
 *
 * - Validation, normalization, sorting, and summary are all inline in the effect callback.
 * - To unit test "validate" or "normalize" you would have to: render the component, mock
 *   fetchRawDashboard, trigger the effect (mount or deps change), wait for async, then
 *   assert on state. You cannot test the logic in isolation.
 * - The effect is long, coupled to React lifecycle, and hard to reason about. Mental
 *   model: "when filters change, run this big block of code" — the "big block" mixes
 *   side-effect orchestration (fetch, setState) with pure logic (validate, normalize, sort).
 */
export function HeavyLogicInEffect() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<DashboardViewModel[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const filters: DashboardFilters = { status, search }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchRawDashboard(filters)
      .then((res) => {
        if (cancelled) return

        // BAD: Business logic inline in effect. Hard to unit test; coupled to React.
        const validStatuses = new Set(['active', 'archived'])
        const valid = res.items.filter((item: RawDashboardItem) =>
          validStatuses.has(item.status)
        )
        const viewModels: DashboardViewModel[] = valid.map((item: RawDashboardItem) => ({
          id: item.id,
          name: item.name,
          status: item.status as 'active' | 'archived',
          updatedAt: new Date(item.updated_at),
          displayLabel: `${item.name} (${item.status})`,
        }))
        const sorted = [...viewModels].sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        )
        const activeCount = sorted.filter((i) => i.status === 'active').length
        const archivedCount = sorted.filter((i) => i.status === 'archived').length
        const lastUpdated =
          sorted.length > 0
            ? new Date(Math.max(...sorted.map((i) => i.updatedAt.getTime())))
            : null
        const summaryResult: DashboardSummary = {
          total: sorted.length,
          activeCount,
          archivedCount,
          lastUpdated,
        }

        setItems(sorted)
        setSummary(summaryResult)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [status, search])

  return (
    <section className="effect-logic-section effect-logic-section--heavy">
      <h2>Heavy logic inside useEffect</h2>
      <p className="effect-logic-section__hint">
        Validation, normalize, sort, and summary are inline in the effect. To test them you must render the component, mock fetch, and assert on state. Logic is not unit-testable in isolation.
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
