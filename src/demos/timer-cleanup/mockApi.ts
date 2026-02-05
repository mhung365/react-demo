import type { PollResult } from './types'

let counter = 0

/**
 * Simulates a polling endpoint (e.g. dashboard stats). Returns current value and timestamp.
 */
export async function fetchPollResult(): Promise<PollResult> {
  await new Promise((r) => setTimeout(r, 300))
  counter += 1
  return {
    timestamp: new Date().toISOString(),
    value: counter,
  }
}
