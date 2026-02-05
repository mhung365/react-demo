import type { DashboardFilters, DashboardApiResponse } from './types'

const MOCK_ITEMS = [
  { id: '1', name: 'Item Alpha', status: 'active' as const, updatedAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Item Beta', status: 'active' as const, updatedAt: '2024-01-14T09:00:00Z' },
  { id: '3', name: 'Item Gamma', status: 'archived' as const, updatedAt: '2024-01-13T08:00:00Z' },
]

export async function fetchDashboard(filters: DashboardFilters): Promise<DashboardApiResponse> {
  await new Promise((r) => setTimeout(r, 400))
  const filtered = MOCK_ITEMS.filter((item) => {
    const matchStatus = filters.status === 'all' || item.status === filters.status
    const matchSearch = item.name.toLowerCase().includes(filters.search.toLowerCase())
    return matchStatus && matchSearch
  })
  return { items: filtered, total: filtered.length, requestedFor: { ...filters } }
}
