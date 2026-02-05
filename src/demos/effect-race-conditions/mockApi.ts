import type { SearchResult, SearchApiResponse } from './types'

const MOCK_ITEMS: SearchResult[] = [
  { id: '1', name: 'Alpha Widget', category: 'electronics' },
  { id: '2', name: 'Beta Gadget', category: 'electronics' },
  { id: '3', name: 'Gamma Tool', category: 'tools' },
  { id: '4', name: 'Delta Cable', category: 'electronics' },
  { id: '5', name: 'Epsilon Hammer', category: 'tools' },
]

/**
 * Variable delay by query length: shorter query = faster (so "a" can finish after "ab").
 * Enables race: type "a" → "ab" → "abc"; request for "a" might finish last and overwrite.
 */
function delayMs(query: string): number {
  const ms = 750 - query.length * 120
  return Math.max(200, Math.min(750, ms))
}

export async function fetchSearch(
  query: string,
  signal?: AbortSignal
): Promise<SearchApiResponse> {
  const clamped = delayMs(query)

  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, clamped)
    const onAbort = (): void => {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onAbort)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort)
  })

  const lower = query.toLowerCase()
  const results = MOCK_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower)
  )
  return { query, results }
}
