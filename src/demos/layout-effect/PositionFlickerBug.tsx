import { useState, useRef, useEffect } from 'react'
import './layout-effect-demo.css'

/**
 * BUG: We position a "tooltip" below the trigger using useEffect.
 *
 * Timing: React commits DOM with tooltip at initial position (e.g. top: 0) →
 * browser PAINTS (user sees tooltip in wrong place) →
 * useEffect runs → we measure trigger, setState with correct position →
 * re-render → commit → paint again (user sees tooltip jump to correct place).
 *
 * Result: visible flicker / layout shift. useEffect runs AFTER paint, so the first
 * paint shows wrong layout; the fix happens in the next paint.
 */
export function PositionFlickerBug() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)

  const show = () => setVisible(true)
  const hide = () => {
    setVisible(false)
    setPosition(null)
  }

  // BUG: useEffect runs AFTER paint. First paint shows tooltip at (0,0) or wrong place; then we measure and update → second paint → flicker.
  useEffect(() => {
    if (!visible || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    })
    console.log(
      `[PositionFlickerBug] useEffect ran — AFTER PAINT. Measured and set position. ` +
        `User may have already seen tooltip in wrong place (first paint).`
    )
  }, [visible])

  return (
    <section className="layout-demo-card layout-demo-card--wrong">
      <header className="layout-demo-card__header">
        <h3>useEffect: visible flicker</h3>
        <p>
          Tooltip position is measured in <strong>useEffect</strong>. Order: commit → <strong>paint</strong> (user sees tooltip at wrong position) → useEffect runs → setState → re-render → paint again (tooltip jumps). Result: layout shift / flicker.
        </p>
      </header>
      <div className="layout-demo-card__row">
        <button ref={triggerRef} type="button" onClick={visible ? hide : show} className="layout-demo-card__trigger">
          {visible ? 'Hide' : 'Show'} tooltip
        </button>
        {visible && (
          <div
            className="layout-demo-card__tooltip"
            style={
              position
                ? { top: position.top, left: position.left }
                : { top: 0, left: 0 }
            }
            role="tooltip"
          >
            Tooltip (positioned {position ? 'after measure' : 'before measure — wrong'})
          </div>
        )}
      </div>
      <p className="layout-demo-card__hint layout-demo-card__hint--wrong">
        Click &quot;Show tooltip&quot; — you may see it jump from top-left to below the button. useEffect ran after first paint.
      </p>
    </section>
  )
}
