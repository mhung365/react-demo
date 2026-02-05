import { useState, useEffect } from 'react'
import { fetchProducts } from './mockApi'
import { useRenderLog } from './useRenderLog'
import type { Product, ProductFilters } from './types'
import './side-effects-demo.css'

/**
 * OVERUSE: Multiple useEffects that could be render, event handlers, or a data library.
 *
 * - Data fetch in useEffect → server state in useState; loading/error manually; no cache.
 * - Derived state (displayName) synced in useEffect → should be computed during render.
 * - Analytics in useEffect when filter changes → could be in onChange handler.
 *
 * Console: [render] runs first (sync); then [effect] runs after commit (async).
 * Every filter change causes: 1+ renders, then 3 effects (fetch, sync displayNames, analytics).
 */
function mockAnalytics(event: string, payload: Record<string, unknown>): void {
  console.log(`[analytics] ${event}`, payload)
}

export function OveruseOfEffects() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [minPrice, setMinPrice] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({})

  useRenderLog('OveruseOfEffects', { categoryFilter, minPrice })

  // Effect 1: Data fetch — SERVER STATE. Should be React Query, not useEffect + useState.
  useEffect(() => {
    console.log('[effect] OveruseOfEffects — "fetch products" (mount or deps changed)')
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProducts({ category: categoryFilter, minPrice })
      .then((res) => {
        if (!cancelled) setProducts(res.products)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [categoryFilter, minPrice])

  // Effect 2: "Sync" derived state from products — NOT A SIDE EFFECT. Should be computed in render.
  useEffect(() => {
    console.log('[effect] OveruseOfEffects — "sync displayNames" (mount or products changed)')
    const next: Record<string, string> = {}
    products.forEach((p) => {
      next[p.id] = `${p.name} (${p.category})`
    })
    setDisplayNames(next)
  }, [products])

  // Effect 3: Analytics when filter changes — Could be in event handler (user chose filter) instead.
  useEffect(() => {
    console.log('[effect] OveruseOfEffects — "analytics filter_changed" (mount or deps changed)')
    mockAnalytics('filter_changed', { category: categoryFilter, minPrice })
  }, [categoryFilter, minPrice])

  return (
    <section className="side-effects-section side-effects-section--overuse">
      <h2>Overuse: data + derived state + analytics in useEffect</h2>
      <p className="side-effects-section__hint">
        Open console. Change filter: you see [render] first, then three [effect] logs. Derived state and analytics could live in render / event handlers.
      </p>
      <div className="side-effects-section__controls">
        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
          />
        </label>
      </div>
      {loading && <p>Loading… (fetch in useEffect; no cache)</p>}
      {error && <p className="side-effects-section__error">{error.message}</p>}
      {!loading && !error && (
        <ul className="side-effects-section__list">
          {products.map((p) => (
            <li key={p.id}>{displayNames[p.id] ?? p.name} — ${p.price}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
