import type { DashboardItem, FilterParams, ApiResponse } from './types'

const MOCK_ITEMS: DashboardItem[] = [
  { id: '1', name: 'Item Alpha', status: 'active', updatedAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Item Beta', status: 'active', updatedAt: '2024-01-14T09:00:00Z' },
  { id: '3', name: 'Item Gamma', status: 'archived', updatedAt: '2024-01-13T08:00:00Z' },
  { id: '4', name: 'Item Delta', status: 'active', updatedAt: '2024-01-12T07:00:00Z' },
  { id: '5', name: 'Item Epsilon', status: 'archived', updatedAt: '2024-01-11T06:00:00Z' },
  { id: '6', name: 'Item Zeta', status: 'active', updatedAt: '2024-01-10T05:00:00Z' },
]

/**
 * Simulates an API that returns items with optional filter and pagination.
 * Delay simulates network; in real app this would be fetch/axios.
 */
export async function fetchItems(params: FilterParams): Promise<ApiResponse> {
  await new Promise((r) => setTimeout(r, 400))

  let filtered = MOCK_ITEMS.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(params.search.toLowerCase())
    const matchStatus = params.status === 'all' || item.status === params.status
    return matchSearch && matchStatus
  })

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const items = filtered.slice(start, start + params.pageSize)

  return { items, total }
}
