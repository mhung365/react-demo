export interface FilterState {
  search: string
  status: 'all' | 'active' | 'archived'
  page: number
  pageSize: number
}

export const DEFAULT_FILTER: FilterState = {
  search: '',
  status: 'all',
  page: 1,
  pageSize: 5,
}
