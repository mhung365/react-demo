/**
 * Simulates expensive computation (e.g. filter + sort on large list).
 * Used to show when useMemo saves real work vs when it adds overhead.
 */
const ITERATIONS = 50_000

export function simulateExpensiveWork(): number {
  const start = performance.now()
  let sum = 0
  for (let i = 0; i < ITERATIONS; i++) {
    sum += Math.sqrt(i) * Math.random()
  }
  return performance.now() - start
}

/**
 * Very cheap computation — e.g. return a constant config.
 * Wrapping this in useMemo adds comparison overhead with no benefit if nothing needs stable ref.
 */
export function cheapComputation(): { theme: string } {
  return { theme: 'dark' }
}
