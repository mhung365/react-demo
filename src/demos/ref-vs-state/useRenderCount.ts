import { useRef } from 'react'

/**
 * Tracks how many times the component function has run (re-renders).
 * Uses a ref so incrementing the count does NOT trigger another render.
 *
 * useState(count) → setCount(count + 1) would schedule a re-render → infinite loop if done in render.
 * useRef(count).current += 1 in render is safe: ref mutation does not schedule a re-render.
 */
export function useRenderCount(componentName: string): number {
  const countRef = useRef(0)
  countRef.current += 1
  const renderCount = countRef.current

  console.log(
    `[render] ${componentName} — component function ran (render #${renderCount}). ` +
      `useState would have scheduled this; useRef mutations do not.`
  )

  return renderCount
}
