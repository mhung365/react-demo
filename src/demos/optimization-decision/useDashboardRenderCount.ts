import type { RenderClassification } from './types'

/**
 * Tracks render count per component and optional classification for the decision demo.
 * Used to show "who re-renders" and classify as harmless / tolerable / must-fix.
 */
const counts: Record<string, number> = {}
const classifications: Record<string, RenderClassification> = {}

export function useDashboardRenderCount(
  componentName: string,
  classification?: RenderClassification
): number {
  counts[componentName] = (counts[componentName] ?? 0) + 1
  if (classification !== undefined) {
    classifications[componentName] = classification
  }
  return counts[componentName]
}

export function getDashboardRenderCounts(): Record<string, number> {
  return { ...counts }
}

export function getDashboardClassifications(): Record<string, RenderClassification> {
  return { ...classifications }
}

export function resetDashboardCounts(): void {
  for (const key of Object.keys(counts)) {
    delete counts[key]
  }
  for (const key of Object.keys(classifications)) {
    delete classifications[key]
  }
}
