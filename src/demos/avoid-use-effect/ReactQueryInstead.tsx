import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchDashboard } from './mockApi'
import type { DashboardFilters, DashboardItem } from './types'
import './avoid-use-effect-demo.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
})

/**
 * GOOD: React Query (or similar data layer) for server state.
 *
 * - No useEffect for fetching. useQuery keys off [filters]; handles fetch, cache, loading, error, cancellation.
 * - Same UI, less code, predictable cache and refetch behavior. Server state stays out of useState.
 */
function DashboardWithReactQuery() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')
  const filters: DashboardFilters = { status, search }

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchDashboard(filters),
  })

  const items: DashboardItem[] = data?.items ?? []

  return (
    <section className="avoid-section avoid-section--good">
      <h2>After: React Query instead of useEffect</h2>
      <p className="avoid-section__hint">
        useQuery keys off filters; handles fetch, cache, loading, error, cancellation. No manual useEffect. Server state in the data layer, not in component state.
      </p>
      <div className="avoid-section__controls">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as DashboardFilters['status'])}>
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
            placeholder="Search"
          />
        </label>
      </div>
      {isLoading && <p>Loading…</p>}
      {error && <p className="avoid-section__error">{error.message}</p>}
      {!isLoading && !error && (
        <ul className="avoid-section__list">
          {items.map((item) => (
            <li key={item.id}>{item.name} ({item.status})</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ReactQueryInstead() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardWithReactQuery />
    </QueryClientProvider>
  )
}
