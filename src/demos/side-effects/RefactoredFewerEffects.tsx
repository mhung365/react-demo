import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { fetchProducts } from './mockApi'
import { useRenderLog } from './useRenderLog'
import type { Product, ProductFilters } from './types'
import './side-effects-demo.css'

function mockAnalytics(event: string, payload: Record<string, unknown>): void {
  console.log(`[analytics] ${event}`, payload)
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000 },
  },
})

/**
 * REFACTORED: Fewer, clearer side effects.
 *
 * - Data: useQuery (React Query) — no useEffect for fetch; cache, loading, error handled.
 * - Derived state: computed in render (displayLabel); no useEffect to "sync".
 * - Analytics: in event handlers (user changed filter, user clicked product); no useEffect watching state.
 *
 * Only remaining effect (if we had one): e.g. subscription or DOM (e.g. document.title). Here we have zero custom effects.
 * Console: [render] on each render; no [effect] for fetch/sync/analytics.
 */
function DashboardRefactored() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [minPrice, setMinPrice] = useState(0)

  useRenderLog('RefactoredFewerEffects', { categoryFilter, minPrice })

  const filters: ProductFilters = { category: categoryFilter, minPrice }
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  })

  const products = data?.products ?? []

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    mockAnalytics('filter_changed', { category: value, minPrice })
  }

  const handleMinPriceChange = (value: number) => {
    setMinPrice(value)
    mockAnalytics('filter_changed', { category: categoryFilter, minPrice: value })
  }

  const handleProductClick = (product: Product) => {
    mockAnalytics('product_view', { productId: product.id })
  }

  return (
    <section className="side-effects-section side-effects-section--refactored">
      <h2>Refactored: render + event handlers; minimal effects</h2>
      <p className="side-effects-section__hint">
        No useEffect for fetch (React Query), derived state (computed in render), or analytics (event handlers). Console: only [render] logs.
      </p>
      <div className="side-effects-section__controls">
        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="tools">Tools</option>
          </select>
        </label>
        <label>
          Min price
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => handleMinPriceChange(Number(e.target.value) || 0)}
          />
        </label>
      </div>
      {isLoading && <p>Loading… (React Query; cached when you switch back)</p>}
      {error && <p className="side-effects-section__error">{(error as Error).message}</p>}
      {!isLoading && !error && (
        <ul className="side-effects-section__list">
          {products.map((p) => {
            // Derived during render — no useEffect, no extra state
            const displayLabel = `${p.name} (${p.category})`
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="side-effects-section__item-btn"
                  onClick={() => handleProductClick(p)}
                >
                  {displayLabel} — ${p.price}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function RefactoredFewerEffects() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardRefactored />
    </QueryClientProvider>
  )
}
