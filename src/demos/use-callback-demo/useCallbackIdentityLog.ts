import { useRef } from 'react'

/**
 * Logs whether the callback reference is the same as the previous render.
 * useCallback "fixes" reference instability — same deps → same function reference.
 * Inline () => {} creates a new function every render → identity changes every time.
 */
export function useCallbackIdentityLog(
  componentName: string,
  callback: (...args: unknown[]) => unknown,
  label: string
): void {
  const prevRef = useRef<typeof callback | null>(null)
  const renderCount = useRef(0)
  renderCount.current += 1

  const same = prevRef.current === callback
  prevRef.current = callback

  console.log(
    `[${componentName}] render #${renderCount.current} — callback "${label}" identity: ${same ? 'SAME (stable)' : 'NEW (unstable)'} ` +
      `(prev === current: ${same})`
  )
}
