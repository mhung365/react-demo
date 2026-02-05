import { useState, useEffect } from 'react'
import { useLifecycleLog } from './useLifecycleLog'
import { createChannel } from './createSubscription'
import './effect-lifecycle-demo.css'

const channelA = createChannel('A')
const channelB = createChannel('B')
const channels: Record<string, ReturnType<typeof createChannel>> = { A: channelA, B: channelB }

/**
 * Correct: effect subscribes; cleanup unsubscribes. When channelId changes,
 * React runs cleanup (unsubscribe from old channel) then effect (subscribe to new channel).
 * No double subscription; no stale subscription.
 */
export function CorrectEffect() {
  const [channelId, setChannelId] = useState<'A' | 'B'>('A')
  useLifecycleLog('CorrectEffect', [channelId])

  useEffect(() => {
    const channel = channels[channelId]
    const unsub = channel.subscribe(() => {
      console.log(`[CorrectEffect] notification from channel ${channelId}`)
    })
    return () => {
      unsub()
    }
  }, [channelId])

  return (
    <section className="effect-demo-card effect-demo-card--correct">
      <header className="effect-demo-card__header">
        <h3>Correct: effect + cleanup</h3>
        <p>
          Effect subscribes to channel <strong>{channelId}</strong>. Cleanup unsubscribes.
          When you switch channel: <strong>cleanup runs first</strong> (unsubscribe from old),
          then <strong>effect runs</strong> (subscribe to new). Console shows unsubscribed → subscribed.
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
      <p className="effect-demo-card__hint">
        Switch A → B: you see &quot;unsubscribed&quot; (A) then &quot;subscribed&quot; (B). Listener count stays 1.
      </p>
    </section>
  )
}
