import { getDashboardRenderCounts, getDashboardClassifications } from './useDashboardRenderCount'
import type { RenderClassification } from './types'

const LABELS: Record<RenderClassification, string> = {
  harmless: 'Harmless',
  tolerable: 'Tolerable',
  'must-fix': 'Must-fix',
}

export function ClassificationPanel({ variant }: { variant: 'baseline' | 'wrong' | 'right' }) {
  const counts = getDashboardRenderCounts()
  const classes = getDashboardClassifications()
  const entries = Object.entries(counts)
    .map(([name]) => [name, counts[name], classes[name] ?? 'harmless'] as const)
    .sort((a, b) => b[1] - a[1])

  if (entries.length === 0) {
    return (
      <div className="opt-decision-panel">
        <h3>Classification</h3>
        <p className="opt-decision-panel__hint">Interact with the dashboard; counts and classifications will appear.</p>
      </div>
    )
  }

  return (
    <div className="opt-decision-panel">
      <h3>Re-render classification</h3>
      <table className="opt-decision-panel__table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Renders</th>
            <th>Classification</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, count, cl]) => (
            <tr key={name} data-classification={cl}>
              <td><code>{name}</code></td>
              <td>{count}</td>
              <td><span className={`opt-decision-panel__badge opt-decision-panel__badge--${cl}`}>{LABELS[cl]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {variant === 'wrong' && (
        <p className="opt-decision-panel__verdict opt-decision-panel__verdict--bad">
          Rejected: Memoizing cheap components (Header, Sidebar, widgets) does not fix the expensive chart re-render. More code, no user impact.
        </p>
      )}
      {variant === 'right' && (
        <p className="opt-decision-panel__verdict opt-decision-panel__verdict--good">
          Accepted: Colocating tick state in TeamC so only TeamC re-renders on tick. Rest of tree stable; real user impact.
        </p>
      )}
    </div>
  )
}
