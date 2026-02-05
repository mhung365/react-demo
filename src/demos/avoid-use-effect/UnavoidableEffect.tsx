import { useRef, useEffect, useState } from 'react'
import './avoid-use-effect-demo.css'

/**
 * GOOD: useEffect when you must synchronize with something outside React.
 *
 * - Focus input on mount: the DOM node is created by React but "focus" is an imperative API.
 *   There is no declarative "focused={true}" that React controls; you have to call .focus() after commit.
 * - Window resize: the browser raises resize events; React doesn't own that. You subscribe in an effect
 *   and unsubscribe in cleanup. This is the correct place for a subscription.
 *
 * These are real side effects: interacting with the DOM or subscribing to an external source.
 * Deriving state from props or reacting to user events in the same handler are not; use render or handlers instead.
 */
export function UnavoidableEffect() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )

  // Unavoidable: focus is imperative; must run after DOM is committed.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Unavoidable: subscribing to external source (window). Must subscribe after mount, unsubscribe on unmount.
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="avoid-section avoid-section--unavoidable">
      <h2>When useEffect is unavoidable</h2>
      <p className="avoid-section__hint">
        Use effect when you must sync with something <strong>outside React</strong>: imperative DOM (focus, scroll), subscriptions (resize, WebSocket), or external stores. Not for deriving from props or reacting to user events — use render or event handlers for those.
      </p>
      <div className="avoid-section__controls">
        <label>
          Focus on mount (imperative DOM)
          <input
            ref={inputRef}
            type="text"
            placeholder="Focused on mount"
            readOnly
            className="avoid-section__input"
            aria-label="Input focused on mount"
          />
        </label>
        <p>
          <strong>Window width:</strong> {windowWidth}px (subscription to window resize; cleanup on unmount).
        </p>
      </div>
    </section>
  )
}
