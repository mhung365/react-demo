import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchDashboard } from './mockApi'
import { logFetchStart, logFetchEnd } from './useFetchLog'
import type { DashboardFilters } from './types'
import './data-fetching-demo.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000 },
  },
})

/**
 * REFACTORED: React Query for filter-driven dashboard data.
 *
 * - No manual useEffect: useQuery keys off [filters]; React Query handles fetch, cache, cancellation.
 * - No race: React Query cancels or ignores outdated requests.
 * - No manual loading/error: use isLoading, error from query.
 * - Logs: we log in the queryFn so we still see [fetch] start/end for demo clarity.
 */
function fetchDashboardWithLog(filters: DashboardFilters) {
  logFetchStart('dashboard (React Query)', filters)
  return fetchDashboard(filters).then((res) => {
    logFetchEnd('dashboard (React Query)', res.requestedFor, true, `items=${res.items.length}`)
    return res
  })
}

function DashboardWithReactQuery() {
  const [status, setStatus] = useState<DashboardFilters['status']>('all')
  const [search, setSearch] = useState('')

  const filters: DashboardFilters = { status, search }
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchDashboardWithLog(filters),
  })

  const items = data?.items ?? []

  return (
    <section className="data-fetch-section data-fetch-section--refactored">
      <h2>Refactored: React Query</h2>
      <p className="data-fetch-section__hint">
        useQuery keys off filters; handles fetch, cache, cancellation, loading/error. No manual useEffect. Console: [fetch] start/end from queryFn.
      </p>
      <div className="data-fetch-section__controls">
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
      {isLoading && <p>Loading… (React Query; cached when you switch back)</p>}
      {error && <p className="data-fetch-section__error">{(error as Error).message}</p>}
      {!isLoading && !error && (
        <>
          <p className="data-fetch-section__meta">Showing for status: {status} ({items.length} items)</p>
          <ul className="data-fetch-section__list">
            {items.map((item) => (
              <li key={item.id}>{item.name} — {item.status}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export function RefactoredFetch() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardWithReactQuery />
    </QueryClientProvider>
  )
}
