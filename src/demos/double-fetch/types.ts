export interface ListItem {
  id: string
  name: string
  status: 'active' | 'archived'
}

export interface ListFilters {
  status: 'all' | 'active' | 'archived'
  search: string
}

export interface ListApiResponse {
  items: ListItem[]
  requestedFor: ListFilters
}

export interface AppConfig {
  theme: string
  version: string
}
