export interface SearchResult {
  id: string
  name: string
  category: string
}

export interface SearchApiResponse {
  query: string
  results: SearchResult[]
}
