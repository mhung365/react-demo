import { useState, useCallback } from 'react'

const ROW_HEIGHT = 32
const OVERSCAN = 5

export interface VirtualListProps<T> {
  items: T[]
  containerHeight: number
  getItemKey: (item: T) => string | number
  renderItem: (item: T) => React.ReactNode
}

/**
 * Simple virtual list: only render items in the visible window + overscan.
 * Correct fix for "large DOM" — we keep the same data length but only
 * mount ~20–30 DOM nodes instead of 2000.
 */
export function useVirtualList<T>({
  items,
  containerHeight,
}: {
  items: T[]
  containerHeight: number
  getItemKey?: (item: T) => string | number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  const totalHeight = items.length * ROW_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
  const endIndex = Math.min(items.length, startIndex + visibleCount)
  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  return {
    totalHeight,
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    onScroll,
    rowHeight: ROW_HEIGHT,
  }
}
