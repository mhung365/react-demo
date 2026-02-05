/**
 * Log helpers for fetch timing and params. Use in components to show
 * [fetch] start/end and parameters so we can see race conditions and stale params.
 */
const LOG_PREFIX = '[fetch]'

export function logFetchStart(label: string, params: unknown): void {
  console.log(
    `${LOG_PREFIX} start — ${label}`,
    params,
    `\n  → Request started. Params above.`
  )
}

export function logFetchEnd(
  label: string,
  params: unknown,
  success: boolean,
  detail?: string
): void {
  const status = success ? 'ok' : 'error'
  console.log(
    `${LOG_PREFIX} end (${status}) — ${label}`,
    params,
    detail ? `\n  → ${detail}` : ''
  )
}
