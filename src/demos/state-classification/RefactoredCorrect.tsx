import { useState, createContext, useContext, useMemo, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchItems } from './mockApi'
import type { DashboardItem, FilterParams } from './types'
import './state-classification-demo.css'

/**
 * REFACTORED: Correct state classification and tools.
 *
 * - SERVER STATE: useQuery (React Query) for items. Keyed by [filter params] so cache is per filter; staleTime/refetch handled by React Query; loading/error from query; no manual useEffect.
 * - UI STATE: modal open, active tab, search input, page — local to this dashboard (useState). Ephemeral; no need in global store.
 * - CLIENT STATE: page size preference — in a small PreferencesContext (or could be localStorage). Cross-feature preference; not server data.
 *
 * Correct ownership: server state in React Query; UI state local; client state in narrow context.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
})

interface PreferencesContextValue {
  pageSize: number
  setPageSize: (n: number) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('Missing PreferencesProvider')
  return ctx
}

function PreferencesProvider({ children }: { children: ReactNode }) {
  const [pageSize, setPageSize] = useState(5)
  const value = useMemo(() => ({ pageSize, setPageSize }), [pageSize])
  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

function DashboardRefactored() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterParams['status']>('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'filters'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { pageSize, setPageSize } = usePreferences()

  const filterKey = ['items', { search, status: statusFilter, page, pageSize }] as const
  const { data, isLoading, error } = useQuery({
    queryKey: filterKey,
    queryFn: () => fetchItems({ search, status: statusFilter, page, pageSize }),
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <section className="state-class state-class--correct">
      <header className="state-class__section-header">
        <h2>Refactored: UI, client, server correctly classified</h2>
        <p>
          <strong>Server state:</strong> useQuery (React Query) — keyed by filter params; cache, staleTime, loading/error handled. <strong>UI state:</strong> modal, tabs, search, page — local useState. <strong>Client state:</strong> pageSize preference — PreferencesContext. No server data in useState/Context; no mixing.
        </p>
      </header>
      <div className="state-class__layout">
        <div className="state-class__tabs">
          <button type="button" className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>List</button>
          <button type="button" className={activeTab === 'filters' ? 'active' : ''} onClick={() => setActiveTab('filters')}>Filters</button>
        </div>
        {activeTab === 'filters' && (
          <div className="state-class__block">
            <label>Search (UI): <input value={search} onChange={(e) => setSearch(e.target.value)} /></label>
            <label>Status (UI): <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FilterParams['status'])}><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
            <label>Page size (client pref): <input type="number" min={1} max={10} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} /></label>
          </div>
        )}
        {activeTab === 'list' && (
          <div className="state-class__block">
            {isLoading && <p>Loading… (React Query; cached when you switch back)</p>}
            {error && <p className="state-class__error">Error: {(error as Error).message}</p>}
            {!isLoading && !error && (
              <>
                <ul className="state-class__list">
                  {items.map((item) => (
                    <li key={item.id} onClick={() => { setSelectedId(item.id); setModalOpen(true); }}>
                      {item.name} — {item.status}
                    </li>
                  ))}
                </ul>
                <div className="state-class__pagination">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                  <span>Page {page} (total {total})</span>
                  <button type="button" onClick={() => setPage((p) => p + 1)}>Next</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {modalOpen && (
        <div className="state-class__modal" role="dialog" aria-modal="true">
          <div>
            <p>Detail for {selectedId ?? '—'} (UI state: modal)</p>
            <button type="button" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </section>
  )
}

export function RefactoredCorrect() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <DashboardRefactored />
      </PreferencesProvider>
    </QueryClientProvider>
  )
}
