import { useRef, useEffect } from 'react'

/**
 * Tracks which "render snapshot" we're in and logs it.
 * Each render = one snapshot of props/state; closures capture values from that snapshot.
 *
 * Use with a "latest value" ref so async code can compare:
 * - Value from closure (snapshot at creation time)
 * - Value from ref (current at execution time)
 */
export function useSnapshotLog(
  componentName: string,
  snapshotValues: Record<string, unknown>
): void {
  const renderCount = useRef(0)
  renderCount.current += 1
  const snapshotId = renderCount.current

  const valuesStr = Object.entries(snapshotValues)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(', ')

  console.log(
    `[snapshot] ${componentName} #${snapshotId} — this render's snapshot: { ${valuesStr} }`,
    `\n  → Any callback created in this render will "close over" these values.`
  )

  useEffect(() => {
    console.log(
      `[commit] ${componentName} #${snapshotId} — React committed. Callbacks from this snapshot are now "in flight" if any.`
    )
  })
}

/**
 * Returns a ref that is updated every render with the current value.
 * Use in async callbacks to compare "what the closure had" vs "what is current".
 * This is for observability only — do NOT use refs to fix stale closures by default;
 * use functional updates or correct dependencies instead.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}
