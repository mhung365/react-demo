import { useState, useEffect } from 'react'
import { useLifecycleLog } from './useLifecycleLog'
import './effect-lifecycle-demo.css'

/**
 * Child that logs lifecycle. When parent unmounts it, we see:
 * (parent re-render) → child layout cleanup → child effect cleanup.
 * No "effect ran" after unmount — cleanup runs, then the component is gone.
 */
function ChildWithEffect() {
  useLifecycleLog('UnmountChild', [])

  useEffect(() => {
    return () => {
      console.log('[UnmountChild] effect cleanup — component unmounting')
    }
  }, [])

  return <div className="effect-demo-card__child">I am mounted. Unmount me to see cleanup.</div>
}

/**
 * Toggle mount: when we unmount the child, React runs its effect cleanup.
 * Order: parent re-render (child no longer in tree) → child effect cleanup runs.
 */
export function UnmountDemo() {
  const [mounted, setMounted] = useState(true)
  useLifecycleLog('UnmountParent', [mounted])

  return (
    <section className="effect-demo-card effect-demo-card--unmount">
      <header className="effect-demo-card__header">
        <h3>Cleanup on unmount</h3>
        <p>
          When the child unmounts, React runs its <strong>effect cleanup</strong> (and layout cleanup).
          There is no new &quot;effect ran&quot; — the component is gone. Open console and click &quot;Unmount child&quot;.
        </p>
      </header>
      <button type="button" onClick={() => setMounted((m) => !m)}>
        {mounted ? 'Unmount child' : 'Mount child'}
      </button>
      {mounted && <ChildWithEffect />}
      <p className="effect-demo-card__hint">
        Click &quot;Unmount child&quot;: you see effect cleanup (and layout cleanup) for UnmountChild; no effect ran after.
      </p>
    </section>
  )
}
