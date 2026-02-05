/**
 * Simulates expensive render-phase work (e.g. heavy list, complex derived data).
 * Used to demonstrate when re-renders cause real jank vs when they're harmless.
 */
const ITERATIONS = 80_000

export function simulateExpensiveWork(): number {
  const start = performance.now()
  let sum = 0
  for (let i = 0; i < ITERATIONS; i++) {
    sum += Math.sqrt(i) * Math.random()
  }
  return performance.now() - start
}
