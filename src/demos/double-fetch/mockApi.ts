import type { ListItem, ListFilters, ListApiResponse, AppConfig } from './types'

const MOCK_ITEMS: ListItem[] = [
  { id: '1', name: 'Item Alpha', status: 'active' },
  { id: '2', name: 'Item Beta', status: 'active' },
  { id: '3', name: 'Item Gamma', status: 'archived' },
  { id: '4', name: 'Item Delta', status: 'active' },
]

/** Delay by status: "all" = 600ms (slow), others = 250ms (fast). For race-condition demo. */
function delayMs(filters: ListFilters): number {
  return filters.status === 'all' ? 600 : 250
}

export async function fetchList(filters: ListFilters): Promise<ListApiResponse> {
  const ms = delayMs(filters)
  await new Promise((r) => setTimeout(r, ms))
  const filtered = MOCK_ITEMS.filter((item) => {
    const matchStatus = filters.status === 'all' || item.status === filters.status
    const matchSearch = item.name.toLowerCase().includes(filters.search.toLowerCase())
    return matchStatus && matchSearch
  })
  return { items: filtered, requestedFor: { ...filters } }
}

/** Fixed delay for mount-only fetch (StrictMode double-effect demo). */
export async function fetchConfig(): Promise<AppConfig> {
  await new Promise((r) => setTimeout(r, 350))
  return { theme: 'dark', version: '1.0.0' }
}
