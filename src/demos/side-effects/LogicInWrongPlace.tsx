import { useState, useEffect } from 'react'
import { useRenderLog } from './useRenderLog'
import type { Product } from './types'
import './side-effects-demo.css'

const STATIC_PRODUCTS: Product[] = [
  { id: '1', name: 'Widget A', category: 'electronics', price: 29.99 },
  { id: '2', name: 'Gadget B', category: 'electronics', price: 89.5 },
  { id: '3', name: 'Tool C', category: 'tools', price: 19.99 },
]

function mockAnalytics(event: string, payload: Record<string, unknown>): void {
  console.log(`[analytics] ${event}`, payload)
}

/**
 * WRONG PLACEMENT: Logic that belongs in render or event handlers is inside useEffect.
 *
 * 1. Filtering list in useEffect → filtered list is DERIVED from state; compute during render.
 * 2. "Track view" when user clicks a product — implemented as useEffect watching selectedId:
 *    "when selectedId changes, fire analytics". That fires on mount if selectedId is set, and
 *    conflates "user clicked" with "value changed". Correct: fire analytics in the click handler.
 *
 * Console: [render] runs; then [effect] runs. Filtering in effect causes extra state + extra render.
 */
export function LogicInWrongPlace() {
  const [category, setCategory] = useState<string>('all')
  const [filteredList, setFilteredList] = useState<Product[]>(STATIC_PRODUCTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useRenderLog('LogicInWrongPlace', { category, selectedId })

  // BAD: Filtering is derived data — should be computed during render, not synced in effect.
  useEffect(() => {
    console.log('[effect] LogicInWrongPlace — "sync filtered list" (category changed)')
    const next =
      category === 'all'
        ? STATIC_PRODUCTS
        : STATIC_PRODUCTS.filter((p) => p.category === category)
    setFilteredList(next)
  }, [category])

  // BAD: "Track view" implemented as "when selectedId changes" — fires on mount if selectedId set, and on every programmatic set.
  // Correct: fire analytics in the click handler (user intent).
  useEffect(() => {
    if (selectedId === null) return
    console.log('[effect] LogicInWrongPlace — "analytics product_view" (selectedId changed)')
    mockAnalytics('product_view', { productId: selectedId })
  }, [selectedId])

  return (
    <section className="side-effects-section side-effects-section--wrong">
      <h2>Wrong place: filtering + analytics in useEffect</h2>
      <p className="side-effects-section__hint">
        Filtering should be in render: <code>const filtered = items.filter(...)</code>. Analytics for &quot;user clicked&quot; should be in the click handler, not in an effect watching state.
      </p>
      <div className="side-effects-section__controls">
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="tools">Tools</option>
          </select>
        </label>
      </div>
      <ul className="side-effects-section__list">
        {filteredList.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setSelectedId(p.id)}
              className="side-effects-section__item-btn"
            >
              {p.name} — ${p.price}
            </button>
          </li>
        ))}
      </ul>
      {selectedId && <p>Selected: {selectedId}</p>}
    </section>
  )
}
