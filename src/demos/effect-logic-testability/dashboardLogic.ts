import type { RawDashboardItem, DashboardViewModel, DashboardSummary } from './types'

/**
 * Pure business logic: validate raw items (filter out invalid status).
 * Unit-testable without React: pass input, assert output.
 */
export function validateItems(raw: RawDashboardItem[]): RawDashboardItem[] {
  const validStatuses = new Set(['active', 'archived'])
  return raw.filter((item) => validStatuses.has(item.status))
}

/**
 * Pure business logic: normalize raw items to view models (camelCase, Date, displayLabel).
 * Unit-testable without React.
 */
export function normalizeToViewModels(raw: RawDashboardItem[]): DashboardViewModel[] {
  return raw.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status as 'active' | 'archived',
    updatedAt: new Date(item.updated_at),
    displayLabel: `${item.name} (${item.status})`,
  }))
}

/**
 * Pure business logic: sort by updatedAt descending.
 * Unit-testable without React.
 */
export function sortByUpdatedDesc(items: DashboardViewModel[]): DashboardViewModel[] {
  return [...items].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

/**
 * Pure business logic: compute summary from view models.
 * Unit-testable without React.
 */
export function computeSummary(items: DashboardViewModel[]): DashboardSummary {
  const activeCount = items.filter((i) => i.status === 'active').length
  const archivedCount = items.filter((i) => i.status === 'archived').length
  const lastUpdated =
    items.length > 0
      ? new Date(Math.max(...items.map((i) => i.updatedAt.getTime())))
      : null
  return {
    total: items.length,
    activeCount,
    archivedCount,
    lastUpdated,
  }
}

/**
 * Single pure pipeline: validate → normalize → sort → summary.
 * All business logic in one place; easy to unit test.
 */
export function processRawItems(raw: RawDashboardItem[]): {
  items: DashboardViewModel[]
  summary: DashboardSummary
} {
  const valid = validateItems(raw)
  const viewModels = normalizeToViewModels(valid)
  const sorted = sortByUpdatedDesc(viewModels)
  const summary = computeSummary(sorted)
  return { items: sorted, summary }
}
