import { useState, useEffect } from 'react'
import './avoid-use-effect-demo.css'

function trackEvent(event: string, payload: Record<string, unknown>): void {
  console.log(`[track] ${event}`, payload)
}

/**
 * BAD: Reacting to state change in useEffect when the cause was a user event.
 *
 * - User selects an item → setState(selectedId) → render → commit → effect runs → track(selectedId).
 * - The "reaction" (track) is delayed and decoupled from the actual user action. If you need to
 *   run something when the user selects an item, do it in the same event handler that sets the state.
 * - Predictability: "user clicked X" → do Y. Putting Y in an effect makes it "when selectedId changes"
 *   which can also run on mount or when state is set from elsewhere.
 */
const ITEMS = [
  { id: '1', label: 'Item One' },
  { id: '2', label: 'Item Two' },
  { id: '3', label: 'Item Three' },
]

export function EventReactionInEffect() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedId) {
      trackEvent('item_selected', { itemId: selectedId })
    }
  }, [selectedId])

  return (
    <section className="avoid-section avoid-section--bad">
      <h2>Before: Reacting to selection in useEffect</h2>
      <p className="avoid-section__hint">
        User selects item → state updates → effect runs → track. The reaction is delayed and runs on mount too if initial state is set. Do tracking in the click handler instead.
      </p>
      <ul className="avoid-section__list">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="avoid-section__item-btn"
              onClick={() => setSelectedId(item.id)}
            >
              {item.label}
            </button>
            {selectedId === item.id && ' ✓'}
          </li>
        ))}
      </ul>
      <p className="avoid-section__meta">Console: [track] when selectedId changes (including initial if non-null).</p>
    </section>
  )
}
