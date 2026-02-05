import type { SearchResult, SearchApiResponse } from './types'

const MOCK_ITEMS: SearchResult[] = [
  { id: '1', name: 'Alpha Widget', category: 'electronics' },
  { id: '2', name: 'Beta Gadget', category: 'electronics' },
  { id: '3', name: 'Gamma Tool', category: 'tools' },
  { id: '4', name: 'Delta Cable', category: 'electronics' },
  { id: '5', name: 'Epsilon Hammer', category: 'tools' },
]

/**
 * Simulates search-as-you-type API. Accepts AbortSignal so we can cancel in-flight requests.
 * Delay scales with query length so short queries can finish after long ones (race demo).
 */
export async function fetchSearch(
  query: string,
  signal?: AbortSignal
): Promise<SearchApiResponse> {
  const delayMs = 800 - query.length * 150
  const clamped = Math.max(200, Math.min(800, delayMs))

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
