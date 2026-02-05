/**
 * Log request start/end with a sequence number so we can see REQUEST order vs RESPONSE order.
 * Race: start #1 (a), start #2 (ab), end #2 (ab), end #1 (a) → state overwritten by #1 (stale).
 */
const PREFIX = '[request]'

export function logRequestStart(seq: number, query: string): void {
  console.log(
    `${PREFIX} start #${seq} — query="${query}"`,
    `\n  → Request started. Response order may differ from this order!`
  )
}

export function logRequestEnd(
  seq: number,
  query: string,
  outcome: 'ok' | 'aborted' | 'ignored' | 'error',
  detail?: string
): void {
  console.log(
    `${PREFIX} end #${seq} (${outcome}) — query="${query}"`,
    detail ? `\n  → ${detail}` : ''
  )
}
