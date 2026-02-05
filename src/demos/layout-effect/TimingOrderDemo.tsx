import { useEffectVsLayoutTiming } from './useEffectVsLayoutTiming'
import './layout-effect-demo.css'

/**
 * Logs the exact order: useLayoutEffect (before paint) → rAF (paint) → useEffect (after paint).
 * Open console to see timing. useLayoutEffect blocks painting; useEffect does not.
 */
export function TimingOrderDemo() {
  useEffectVsLayoutTiming('TimingOrderDemo')

  return (
    <section className="layout-demo-card layout-demo-card--order">
      <header className="layout-demo-card__header">
        <h3>Timing: before paint vs after paint</h3>
        <p>
          Open console. Order: <strong>useLayoutEffect</strong> runs first (before paint, blocks), then{' '}
          <strong>requestAnimationFrame</strong> (paint), then <strong>useEffect</strong> (after paint). useLayoutEffect is synchronous and blocks the browser from painting until it (and any state updates it triggers) complete.
        </p>
      </header>
      <p className="layout-demo-card__hint">
        Check DevTools → Console for the exact log order. useLayoutEffect = before paint; useEffect = after paint.
      </p>
    </section>
  )
}
