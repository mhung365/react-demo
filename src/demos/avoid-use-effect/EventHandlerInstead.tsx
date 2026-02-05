import { useState } from 'react'
import './avoid-use-effect-demo.css'

function trackEvent(event: string, payload: Record<string, unknown>): void {
  console.log(`[track] ${event}`, payload)
}

/**
 * GOOD: Do the reaction in the event handler that caused the state change.
 *
 * - User selects item → in the same handler: setState + track. No effect. The "cause" (click) and
 *   the "reaction" (track) are in one place; runs exactly when the user acts; no run on mount.
 * - More predictable: one event → one handler → update state + side effect. No "when state changes" indirection.
 */
const ITEMS = [
  { id: '1', label: 'Item One' },
  { id: '2', label: 'Item Two' },
  { id: '3', label: 'Item Three' },
]

export function EventHandlerInstead() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleSelect(id: string) {
    setSelectedId(id)
    trackEvent('item_selected', { itemId: id })
  }

  return (
    <section className="avoid-section avoid-section--good">
      <h2>After: Event handler instead of effect</h2>
      <p className="avoid-section__hint">
        Same handler: setState + track. No effect. Reaction runs exactly when user clicks; no run on mount; easier to reason about.
      </p>
      <ul className="avoid-section__list">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="avoid-section__item-btn"
              onClick={() => handleSelect(item.id)}
            >
              {item.label}
            </button>
            {selectedId === item.id && ' ✓'}
          </li>
        ))}
      </ul>
      <p className="avoid-section__meta">Console: [track] only when user clicks an item.</p>
    </section>
  )
}
