/**
 * Simulated subscription: subscribe returns an unsubscribe function.
 * Used to demonstrate correct cleanup (unsubscribe) vs broken (no cleanup → double subscription).
 */
export type Unsubscribe = () => void

export function createChannel(id: string) {
  const listeners = new Set<() => void>()
  return {
    id,
    subscribe(callback: () => void): Unsubscribe {
      listeners.add(callback)
      console.log(`[channel ${id}] subscribed — listeners: ${listeners.size}`)
      return () => {
        listeners.delete(callback)
        console.log(`[channel ${id}] unsubscribed — listeners: ${listeners.size}`)
      }
    },
    notify() {
      listeners.forEach((cb) => cb())
    },
    getListenerCount() {
      return listeners.size
    },
  }
}
