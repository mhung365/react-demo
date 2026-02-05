/**
 * Log interval ticks so we can see stacking (multiple logs per period when cleanup is missing).
 */
const PREFIX = '[interval]'

export function logIntervalTick(label: string, meta: Record<string, unknown>): void {
  console.log(`${PREFIX} tick — ${label}`, meta, `\n  → If you see multiple ticks per period, intervals are stacking.`)
}

export function logIntervalStart(label: string): void {
  console.log(`${PREFIX} start — ${label}`, `\n  → Interval started. Cleanup must clear it on unmount or deps change.`)
}

export function logIntervalCleanup(label: string): void {
  console.log(`${PREFIX} cleanup — ${label}`, `\n  → clearInterval called.`)
}
