export interface DashboardItem {
  id: string
  name: string
  status: 'active' | 'archived'
  updatedAt: string
}

export interface DashboardFilters {
  status: 'all' | 'active' | 'archived'
  search: string
}

export interface DashboardApiResponse {
  items: DashboardItem[]
  total: number
  /** Params this response was fetched for (for logging/demo). */
  requestedFor: DashboardFilters
}

export interface UserProfile {
  id: string
  name: string
  role: string
}
