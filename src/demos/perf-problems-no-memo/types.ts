export interface ListItem {
  id: number
  name: string
  value: number
}

/** Generate a large list for filter/list demos */
export function generateItems(count: number): ListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i} ${String.fromCharCode(65 + (i % 26))}`,
    value: i * 10,
  }))
}
