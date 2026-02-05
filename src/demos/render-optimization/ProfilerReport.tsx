import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/**
 * Last commit timings from React Profiler (id -> actualDuration in ms).
 * Updated by onRender callbacks; panel displays "expected" vs "problematic" re-renders.
 */
type ProfilerReport = Record<string, number>

type ContextValue = {
  report: ProfilerReport
  onRender: (id: string, _phase: string, actualDuration: number) => void
  clearReport: () => void
}

const ProfilerReportContext = createContext<ContextValue | null>(null)

export function ProfilerReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<ProfilerReport>({})

  const onRender = useCallback((id: string, _phase: string, actualDuration: number) => {
    setReport((prev) => ({ ...prev, [id]: actualDuration }))
  }, [])

  const clearReport = useCallback(() => setReport({}), [])

  return (
    <ProfilerReportContext.Provider value={{ report, onRender, clearReport }}>
      {children}
    </ProfilerReportContext.Provider>
  )
}

export function useProfilerReport(): ContextValue {
  const ctx = useContext(ProfilerReportContext)
  if (!ctx) throw new Error('useProfilerReport must be used inside ProfilerReportProvider')
  return ctx
}

/**
 * Displays last Profiler commit timings. Use with <Profiler id="..." onRender={onRender}>.
 * Distinguishes "expected" (total &lt; ~2ms) vs "problematic" (a component &gt; ~10ms).
 */
export function ProfilerReportPanel() {
  const { report } = useProfilerReport()
  const entries = Object.entries(report)
  const total = report['root'] ?? entries[0]?.[1] ?? 0
  const slowThresholdMs = 10
  const slowEntries = entries.filter(([, ms]) => ms >= slowThresholdMs)
  const isProblematic = slowEntries.length > 0

  if (entries.length === 0) {
    return (
      <div className="debug-panel profiler-panel">
        <h3 className="debug-panel__title">Profiler (last commit)</h3>
        <p className="debug-panel__hint">Click Increment to record a commit.</p>
      </div>
    )
  }

  return (
    <div className={`debug-panel profiler-panel ${isProblematic ? 'profiler-panel--problem' : ''}`}>
      <h3 className="debug-panel__title">Profiler (last commit)</h3>
      <div className="debug-panel__row">
        <span className="debug-panel__label">Total (root):</span>
        <span className="debug-panel__value">{total.toFixed(2)}ms</span>
      </div>
      {entries
        .filter(([id]) => id !== 'root')
        .map(([id, ms]) => (
          <div key={id} className="debug-panel__row">
            <span className="debug-panel__label">{id}:</span>
            <span className={ms >= slowThresholdMs ? 'debug-panel__value--slow' : 'debug-panel__value'}>
              {ms.toFixed(2)}ms
            </span>
          </div>
        ))}
      {isProblematic && (
        <p className="debug-panel__badge">Problematic: component(s) ≥ {slowThresholdMs}ms</p>
      )}
      {!isProblematic && total < 2 && (
        <p className="debug-panel__badge debug-panel__badge--ok">Expected: total &lt; 2ms</p>
      )}
    </div>
  )
}
