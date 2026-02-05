export interface DashboardItem {
  id: string
  name: string
  status: 'active' | 'archived'
  updatedAt: string
}

export interface FilterParams {
  search: string
  status: 'all' | 'active' | 'archived'
  page: number
  pageSize: number
}

export interface ApiResponse {
  items: DashboardItem[]
  total: number
}
