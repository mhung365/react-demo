const PREFIX = '[fetch]'

export function logFetchStart(label: string, params: unknown): void {
  console.log(`${PREFIX} start — ${label}`, params, `\n  → Request started.`)
}

export function logFetchEnd(
  label: string,
  params: unknown,
  outcome: 'ok' | 'aborted' | 'error',
  detail?: string
): void {
  console.log(
    `${PREFIX} end (${outcome}) — ${label}`,
    params,
    detail ? `\n  → ${detail}` : ''
  )
}
