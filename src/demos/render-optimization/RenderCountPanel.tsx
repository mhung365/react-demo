import { getRenderCounts } from './useRenderCount'

/**
 * Displays per-component render counts (from useRenderCount).
 * Re-renders with the dashboard so it shows counts from the current commit.
 * Distinguishes "many re-renders" (counts high) from "problematic" (only meaningful with Profiler).
 */
export function RenderCountPanel() {
  const counts = getRenderCounts()
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return (
      <div className="debug-panel render-count-panel">
        <h3 className="debug-panel__title">Render counts (this session)</h3>
        <p className="debug-panel__hint">Components using useRenderCount will appear here after first render.</p>
      </div>
    )
  }

  return (
    <div className="debug-panel render-count-panel">
      <h3 className="debug-panel__title">Render counts (this session)</h3>
      <ul className="render-count-panel__list">
        {entries.map(([name, count]) => (
          <li key={name}>
            <strong>{name}</strong>: {count}
          </li>
        ))}
      </ul>
      <p className="debug-panel__hint">
        High counts alone don’t mean “slow”. Check Profiler for actual duration.
      </p>
    </div>
  )
}
