/** Filter configuration — often passed as prop or in Context */
export interface FilterConfig {
  theme: 'light' | 'dark'
  pageSize: number
  sortBy: string
}

/** Theme context value shape */
export interface ThemeContextValue {
  theme: string
  setTheme: (theme: string) => void
}
