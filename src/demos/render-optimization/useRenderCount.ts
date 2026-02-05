/**
 * Module-level render counts per component (for debug panels).
 * Updated during render; panel reads on next paint (same commit).
 * Call resetRenderCounts() when switching debug scenarios so counts don't accumulate.
 */
const renderCounts: Record<string, number> = {}

export function useRenderCount(componentName: string, options?: { log?: boolean }): number {
  renderCounts[componentName] = (renderCounts[componentName] ?? 0) + 1
  const count = renderCounts[componentName]

  if (options?.log) {
    console.log(`[render] ${componentName} #${count}`)
  }

  return count
}

export function getRenderCounts(): Record<string, number> {
  return { ...renderCounts }
}

export function resetRenderCounts(): void {
  for (const key of Object.keys(renderCounts)) {
    delete renderCounts[key]
  }
}
