/**
 * Shared types for the re-render demo.
 * "Config" is passed as prop — when it's a new object reference every render,
 * memoized children still re-render (reference identity).
 */

export interface User {
  id: string
  name: string
}

export interface DashboardConfig {
  theme: string
  locale: string
}
