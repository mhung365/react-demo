const PREFIX = '[fetch]'

export function logFetchStart(label: string, params: unknown): void {
  console.log(`${PREFIX} start — ${label}`, params, `\n  → Request started.`)
}

export function logFetchEnd(
  label: string,
  params: unknown,
  success: boolean,
  detail?: string
): void {
  const status = success ? 'ok' : 'error'
  console.log(`${PREFIX} end (${status}) — ${label}`, params, detail ? `\n  → ${detail}` : '')
}

export function logEffectRun(label: string, run: 'mount' | 'cleanup' | 're-run'): void {
  console.log(`[effect] ${label} — ${run}`)
}
