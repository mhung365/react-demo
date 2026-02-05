import type { ReactNode } from 'react'

export interface CardConfig {
  theme: string
  pageSize: number
}

export interface MemoizedCardProps {
  id: string
  count: number
  config: CardConfig
  onAction: (id: string) => void
  children?: ReactNode
}
