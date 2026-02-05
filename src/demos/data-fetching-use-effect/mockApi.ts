import type {
  DashboardItem,
  DashboardFilters,
  DashboardApiResponse,
  UserProfile,
} from './types'

const MOCK_ITEMS: DashboardItem[] = [
  { id: '1', name: 'Item Alpha', status: 'active', updatedAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Item Beta', status: 'active', updatedAt: '2024-01-14T09:00:00Z' },
  { id: '3', name: 'Item Gamma', status: 'archived', updatedAt: '2024-01-13T08:00:00Z' },
  { id: '4', name: 'Item Delta', status: 'active', updatedAt: '2024-01-12T07:00:00Z' },
  { id: '5', name: 'Item Epsilon', status: 'archived', updatedAt: '2024-01-11T06:00:00Z' },
]

/**
 * Variable delay by filter so we can simulate race conditions:
 * "all" = 700ms (slow), "active" / "archived" = 300ms (fast).
 * If user switches from "all" to "active" quickly, "active" finishes first;
 * without cancellation, "all" can finish later and overwrite = stale/wrong.
 */
function getDelayForFilters(filters: DashboardFilters): number {
  if (filters.status === 'all') return 700
  return 300
}

/**
 * Fetch dashboard items by filter. Delay varies by filter for race-condition demo.
 */
export async function fetchDashboard(
  filters: DashboardFilters
): Promise<DashboardApiResponse> {
  const delayMs = getDelayForFilters(filters)
  await new Promise((r) => setTimeout(r, delayMs))

  const filtered = MOCK_ITEMS.filter((item) => {
    const matchStatus =
      filters.status === 'all' || item.status === filters.status
    const matchSearch = item.name
      .toLowerCase()
      .includes(filters.search.toLowerCase())
    return matchStatus && matchSearch
  })

  return {
    items: filtered,
    total: filtered.length,
    requestedFor: { ...filters },
  }
}

/**
 * Fetch current user once (e.g. on app init). Fixed delay.
 * Used for "acceptable" mount-only useEffect fetch.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  await new Promise((r) => setTimeout(r, 400))
  return { id: 'u1', name: 'Jane Doe', role: 'admin' }
}
