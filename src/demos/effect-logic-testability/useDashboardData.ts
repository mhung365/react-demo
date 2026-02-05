import { useState, useEffect } from 'react'
import { fetchRawDashboard } from './mockApi'
import { processRawItems } from './dashboardLogic'
import type { DashboardViewModel, DashboardSummary, DashboardFilters } from './types'

export interface UseDashboardDataResult {
  items: DashboardViewModel[]
  summary: DashboardSummary | null
  loading: boolean
  error: Error | null
}

/**
 * Custom hook: effect orchestration only. Business logic lives in pure functions.
 *
 * - Effect: when filters change, fetch raw data, then call processRawItems (pure pipeline).
 * - processRawItems = validate → normalize → sort → summary (all in dashboardLogic.ts).
 * - Hook is testable with renderHook: mock fetchRawDashboard, change filters, assert returned state.
 * - Pure functions (processRawItems, validateItems, etc.) are unit-tested without React.
 */
export function useDashboardData(filters: DashboardFilters): UseDashboardDataResult {
  const [items, setItems] = useState<DashboardViewModel[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchRawDashboard(filters)
      .then((res) => {
        if (cancelled) return
        const { items: processedItems, summary: processedSummary } = processRawItems(res.items)
        setItems(processedItems)
        setSummary(processedSummary)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [filters.status, filters.search])

  return { items, summary, loading, error }
}
