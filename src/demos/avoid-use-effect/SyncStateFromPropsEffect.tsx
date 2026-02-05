import { useState, useEffect } from 'react'
import './avoid-use-effect-demo.css'

/**
 * BAD: Syncing local state from props via useEffect.
 *
 * - When userId prop changes, effect runs and setState causes an extra render.
 * - You get: render (with stale local state) → commit → effect → setState → render again.
 * - If parent re-renders with same userId but new object ref, or async updates, you can get
 *   out-of-sync or flicker. Logic is "when prop changes, update state" — that's derivation, not a side effect.
 */
type SyncStateFromPropsEffectProps = { userId: string }

export function SyncStateFromPropsEffect({ userId }: SyncStateFromPropsEffectProps) {
  const [localUserId, setLocalUserId] = useState(userId)

  useEffect(() => {
    setLocalUserId(userId)
  }, [userId])

  return (
    <section className="avoid-section avoid-section--bad">
      <h2>Before: Syncing state from props with useEffect</h2>
      <p className="avoid-section__hint">
        Effect runs when <code>userId</code> changes and calls setState → extra render. Derivation (prop → display) is not a side effect; it causes unnecessary work and can flicker.
      </p>
      <p>
        <strong>Prop:</strong> <code>{userId}</code> → <strong>Local state:</strong> <code>{localUserId}</code>
      </p>
    </section>
  )
}
