import { useState, useEffect } from 'react'
import { useLifecycleLog } from './useLifecycleLog'
import { createChannel } from './createSubscription'
import './effect-lifecycle-demo.css'

const channelA = createChannel('A-broken')
const channelB = createChannel('B-broken')
const channels: Record<string, ReturnType<typeof createChannel>> = { A: channelA, B: channelB }

/**
 * Broken: effect subscribes but does NOT return cleanup (or cleanup doesn't unsubscribe).
 * When channelId changes, React runs the effect again — we subscribe to the new channel
 * without unsubscribing from the old one. Result: double subscription (two listeners
 * when we should have one). Also demonstrates misunderstanding: "cleanup runs on
 * re-render / dep change" — if we don't cleanup, we leak.
 */
export function BrokenEffect() {
  const [channelId, setChannelId] = useState<'A' | 'B'>('A')
  useLifecycleLog('BrokenEffect', [channelId])

  useEffect(() => {
    const channel = channels[channelId]
    channel.subscribe(() => {
      console.log(`[BrokenEffect] notification from channel ${channelId}`)
    })
    // BUG: no return () => unsub() — we never unsubscribe
    // When channelId changes, effect runs again and we add a second listener to the new channel.
    // Old channel still has its listener (we never unsubscribed).
  }, [channelId])

  return (
    <section className="effect-demo-card effect-demo-card--wrong">
      <header className="effect-demo-card__header">
        <h3>Broken: no cleanup</h3>
        <p>
          Effect subscribes to channel <strong>{channelId}</strong> but <strong>does not return cleanup</strong>.
          When you switch channel: effect runs again and we subscribe again. We never unsubscribed from the previous channel — <strong>double subscription / leak</strong>. Console shows &quot;subscribed&quot; twice; listener count grows.
        </p>
      </header>
      <div className="effect-demo-card__actions">
        <button type="button" onClick={() => setChannelId('A')}>
          Channel A
        </button>
        <button type="button" onClick={() => setChannelId('B')}>
          Channel B
        </button>
      </div>
      <p className="effect-demo-card__hint effect-demo-card__hint--wrong">
        Switch A → B: you see &quot;subscribed&quot; again without &quot;unsubscribed&quot; first. Listener count is 2 (bug).
      </p>
    </section>
  )
}
