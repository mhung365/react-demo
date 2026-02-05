import { Dashboard } from './Dashboard'
import './re-render-demo.css'

/**
 * Demo shell: explains re-render vs DOM and wires the Dashboard tree.
 */
export function ReRenderDemo() {
  return (
    <main className="re-render-demo">
      <aside className="concepts">
        <h2>Concepts</h2>
        <ul>
          <li>
            <strong>Re-render</strong> = component function ran again (you see [render] in console).
          </li>
          <li>
            <strong>DOM update</strong> = browser DOM was mutated. Happens in commit phase when
            reconcile found a diff. Many re-renders result in <em>no</em> DOM update (same output).
          </li>
          <li>
            <strong>Parent re-render</strong> → by default all children re-render (their function
            runs). <code>React.memo</code> + stable props can skip that.
          </li>
          <li>
            <strong>Prop identity</strong> → inline objects/functions are new refs every render, so
            memo sees “props changed” and re-renders anyway.
          </li>
        </ul>
      </aside>
      <Dashboard />
    </main>
  )
}
