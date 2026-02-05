import { useState, useRef, useLayoutEffect } from 'react'
import './layout-effect-demo.css'

/**
 * FIXED: We position the tooltip in useLayoutEffect.
 *
 * Timing: React commits DOM → useLayoutEffect runs (BEFORE paint) →
 * we measure trigger, setState → React flushes the update synchronously →
 * re-render, commit again → then browser paints ONCE with correct position.
 *
 * Result: no flicker. useLayoutEffect runs before paint, so the first (and only)
 * paint the user sees has the correct layout.
 */
export function PositionFlickerFixed() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)

  const show = () => setVisible(true)
  const hide = () => {
    setVisible(false)
    setPosition(null)
  }

  // FIXED: useLayoutEffect runs BEFORE paint. We measure and set position; React flushes sync; then browser paints once with correct layout.
  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) {
      if (!visible) setPosition(null)
      return
    }
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    })
    console.log(
      `[PositionFlickerFixed] useLayoutEffect ran — BEFORE PAINT. Measured and set position. ` +
        `Browser will paint once with correct layout; no flicker.`
    )
  }, [visible])

  return (
    <section className="layout-demo-card layout-demo-card--correct">
      <header className="layout-demo-card__header">
        <h3>useLayoutEffect: no flicker</h3>
        <p>
          Tooltip position is measured in <strong>useLayoutEffect</strong>. Order: commit → useLayoutEffect (measure, setState) → React flushes sync → commit again → <strong>then paint</strong> (user sees correct position once). No layout shift.
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
            Tooltip (positioned before paint)
          </div>
        )}
      </div>
      <p className="layout-demo-card__hint">
        Click &quot;Show tooltip&quot; — it appears below the button with no jump. useLayoutEffect ran before first paint.
      </p>
    </section>
  )
}
