export interface DashboardFilters {
  status: 'all' | 'active' | 'archived'
  search: string
}

export interface DashboardItem {
  id: string
  name: string
  status: 'active' | 'archived'
  updatedAt: string
}

export interface DashboardApiResponse {
  items: DashboardItem[]
  total: number
  requestedFor: DashboardFilters
}
