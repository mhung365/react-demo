import { useState } from 'react'
import './avoid-use-effect-demo.css'

/**
 * GOOD: Derive during render (or use controlled component with key).
 *
 * - No useEffect. "Display value from prop" = compute during render: same prop → same output.
 * - One source of truth (prop); no extra render; no sync bugs.
 * - If you need editable local state that "resets" when prop changes, use key={userId} so
 *   React remounts the child with fresh state instead of syncing in an effect.
 */
type DeriveOrControlledProps = { userId: string }

export function DeriveOrControlled({ userId }: DeriveOrControlledProps) {
  // Derived: same input (userId) → same output. No state, no effect.
  const displayId = userId

  return (
    <section className="avoid-section avoid-section--good">
      <h2>After: Derive during render</h2>
      <p className="avoid-section__hint">
        No effect. Display value is computed from prop in render. One source of truth; no extra render; predictable.
      </p>
      <p>
        <strong>Prop:</strong> <code>{userId}</code> → <strong>Display:</strong> <code>{displayId}</code>
      </p>
    </section>
  )
}

/**
 * Alternative: controlled component with key.
 * When parent changes selectedId, we pass key={selectedId} so the form remounts with fresh initial state.
 * No "sync state from props" effect needed.
 */
export function EditableWithKeyExample() {
  const [selectedId, setSelectedId] = useState('a')
  return (
    <section className="avoid-section avoid-section--good">
      <h2>After (alternative): Controlled with key</h2>
      <p className="avoid-section__hint">
        Need local editable state that resets when "selected item" changes? Use <code>key=&#123;selectedId&#125;</code> on the child so React remounts it with fresh state. No useEffect sync.
      </p>
      <div className="avoid-section__controls">
        <label>
          Selected ID
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="a">A</option>
            <option value="b">B</option>
          </select>
        </label>
      </div>
      <p>
        Child with <code>key=&#123;selectedId&#125;</code> remounts when selectedId changes → fresh state. No effect.
      </p>
    </section>
  )
}
