import { useState } from 'react'
import { useRenderLog } from '../re-render/useRenderLog'

/**
 * When stabilizing identity is NOT worth it:
 * - Child is not memoized: inline object/array does not cause "cascade" (child would re-render anyway).
 * - Callback only used in onClick and not in any dependency array: no need for useCallback.
 * - Cheap component: the cost of useMemo/useCallback (deps, mental overhead) may exceed the cost of re-rendering.
 */
function CheapChild({ label }: { label: string }) {
  useRenderLog('CheapChild (not memoized)')
  return <div className="identity-block identity-block--child">{label}</div>
}

export function StabilizeNotWorthIt() {
  const [count, setCount] = useState(0)
  useRenderLog('StabilizeNotWorthIt (parent)')

  return (
    <div className="identity-scenario identity-scenario--neutral">
      <div className="identity-scenario__header">
        <h3>5. When stabilizing identity is NOT worth it</h3>
        <p>
          Child is not memoized; we pass inline style/callback. Child re-renders every time anyway
          (parent re-rendered). Adding
          useMemo/useCallback here adds complexity without benefit.
        </p>
      </div>
      <div className="identity-scenario__measure">
        Click “Increment”. Child re-renders because parent re-rendered, not because props
        identity changed. Stabilizing would not reduce re-renders; only memoizing the child would
        (and then we’d need stable props). For cheap children, often not worth it.
      </div>
      <button type="button" className="identity-btn" onClick={() => setCount((c) => c + 1)}>
        Increment ({count})
      </button>
      <CheapChild
        label={`Count: ${count}. Inline style/callback — no memo, so no gain from useMemo here.`}
      />
      <div className="identity-hint identity-hint--neutral">
        <strong>Rule of thumb:</strong> Stabilize when the value is used by something that
        compares by reference (memo child, useEffect deps, Context). If the child is not memoized
        or the callback is not in a dependency array, stabilizing adds cost (deps to maintain)
        without reducing re-renders. Measure first; don’t useMemo/useCallback everywhere by default.
      </div>
    </div>
  )
}
