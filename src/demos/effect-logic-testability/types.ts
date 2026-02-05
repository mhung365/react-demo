/** Raw API response shape (e.g. from backend). */
export interface RawDashboardItem {
  id: string
  name: string
  status: string
  updated_at: string
  metadata?: unknown
}

/** View model after validation + normalization (for UI). */
export interface DashboardViewModel {
  id: string
  name: string
  status: 'active' | 'archived'
  updatedAt: Date
  displayLabel: string
}

/** Summary computed from items (business logic). */
export interface DashboardSummary {
  total: number
  activeCount: number
  archivedCount: number
  lastUpdated: Date | null
}

export interface DashboardFilters {
  status: 'all' | 'active' | 'archived'
  search: string
}

export interface RawApiResponse {
  items: RawDashboardItem[]
}
