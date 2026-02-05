/**
 * Shared types for the render-optimization dashboard demo.
 * All state is UI state (counters, selected tab) — no server state.
 */

export interface MetricCardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
}

export interface StatRowProps {
  label: string
  value: string | number
}
