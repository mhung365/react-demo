import type { ReactNode } from 'react'

/**
 * Types for React.memo demo.
 * ChildConfig: when parent passes inline {}, new reference every render → memo fails.
 */
export interface ChildConfig {
  theme: string
  pageSize: number
}

export interface ExpensiveChildProps {
  config: ChildConfig
  onSubmit: (value: string) => void
  children?: ReactNode
}
