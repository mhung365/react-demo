import type { RawApiResponse, DashboardFilters } from './types'

const MOCK_RAW = [
  { id: '1', name: 'Item Alpha', status: 'active', updated_at: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Item Beta', status: 'active', updated_at: '2024-01-14T09:00:00Z' },
  { id: '3', name: 'Item Gamma', status: 'archived', updated_at: '2024-01-13T08:00:00Z' },
  { id: '4', name: 'Item Delta', status: 'invalid' as string, updated_at: '2024-01-12T07:00:00Z' },
  { id: '5', name: 'Item Epsilon', status: 'archived', updated_at: '2024-01-11T06:00:00Z' },
]

/**
 * Simulates API returning raw items (snake_case, possibly invalid status).
 * Business logic (validate, normalize, sort, summary) should live outside the effect.
 */
export async function fetchRawDashboard(filters: DashboardFilters): Promise<RawApiResponse> {
  await new Promise((r) => setTimeout(r, 400))
  const filtered = MOCK_RAW.filter((item) => {
    const matchStatus =
      filters.status === 'all' || item.status === filters.status
    const matchSearch = item.name.toLowerCase().includes(filters.search.toLowerCase())
    return matchStatus && matchSearch
  })
  return { items: filtered }
}
