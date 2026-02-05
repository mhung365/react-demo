import { useState } from 'react'
import './effect-deps-identity-demo.css'

/**
 * REFACTORED: Remove the effect entirely by changing the pattern.
 *
 * Original: effect ran "when config changes" and did something (e.g. sync to server, set title).
 * Problem: config was unstable → effect re-ran every render.
 *
 * Better: the "side effect" is triggered by a user action (e.g. "Apply settings"), not by "config changed".
 * So we handle it in an event handler. No effect; no dependency array; no reference identity issues.
 *
 * Use this pattern when the sync doesn't need to happen automatically when a value changes — only when the user commits (click, submit).
 */
export function NoEffectRefactored() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lastApplied, setLastApplied] = useState<string | null>(null)

  const handleApply = () => {
    setLastApplied(`theme=${theme} (applied at ${new Date().toISOString().slice(11, 19)})`)
    console.log(
      `[NoEffectRefactored] Apply clicked — syncing theme=${theme}. No effect; event handler. No dependency array.`
    )
  }

  return (
    <section className="identity-demo-card identity-demo-card--correct">
      <header className="identity-demo-card__header">
        <h3>Refactored: no effect</h3>
        <p>
          Instead of an effect that runs &quot;when config changes&quot; (and re-runs every time because config is a new object),
          we run the sync only when the user clicks <strong>Apply</strong>. Event handler; no effect; no dependency array; no reference identity.
        </p>
      </header>
      <div className="identity-demo-card__row">
        <span className="identity-demo-card__label">Theme:</span>
        <strong>{theme}</strong>
      </div>
      <div className="identity-demo-card__row">
        <span className="identity-demo-card__label">Last applied:</span>
        <span className="identity-demo-card__value">{lastApplied ?? '—'}</span>
      </div>
      <div className="identity-demo-card__actions">
        <button type="button" onClick={() => setTheme('dark')}>
          Dark
        </button>
        <button type="button" onClick={() => setTheme('light')}>
          Light
        </button>
        <button type="button" onClick={handleApply}>
          Apply
        </button>
      </div>
      <p className="identity-demo-card__hint">
        Change theme then click Apply. Sync happens on click, not on every render. No effect re-runs.
      </p>
    </section>
  )
}
