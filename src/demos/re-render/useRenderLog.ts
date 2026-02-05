import { useRef, useEffect } from 'react'

/**
 * Logs every time the component function runs (a "render" in React terms).
 * This runs during the render phase — if you see this log, the component body executed.
 *
 * Re-render = component function was called again.
 * DOM update = browser DOM was actually mutated (happens in commit phase, after reconcile).
 */
export function useRenderLog(
  componentName: string,
  meta?: Record<string, unknown>
): void {
  const renderCount = useRef(0)
  renderCount.current += 1
  const count = renderCount.current

  // Log synchronously during render so we see exact order of execution
  const metaStr = meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : ''
  console.log(
    `[render] ${componentName} #${count}${metaStr}`,
    `\n  → Component function ran (re-render). DOM may or may not be updated.`
  )

  // This runs after commit — so we see "render" first, then "committed"
  useEffect(() => {
    console.log(`[commit] ${componentName} #${count} — React committed to DOM (layout effects run now).`)
  })
}

/**
 * Tracks whether the DOM node was actually updated (e.g. attribute or children changed).
 * Use with a ref on a DOM element; call markDOMUpdate() only when you change something
 * that affects the DOM (e.g. new text content). Compare with useRenderLog: many re-renders
 * can happen without any DOM update when output is referentially/structurally the same.
 */
export function useDOMUpdateLog(componentName: string): () => void {
  const updateCount = useRef(0)
  return () => {
    updateCount.current += 1
    console.log(
      `[DOM update] ${componentName} — browser DOM was mutated (update #${updateCount.current})`
    )
  }
}
