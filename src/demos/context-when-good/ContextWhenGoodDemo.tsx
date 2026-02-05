import { useState } from 'react'
import { PropsDrillingNoisy } from './PropsDrillingNoisy'
import { ContextAppropriate } from './ContextAppropriate'
import { ContextOveruse } from './ContextOveruse'
import { ContextRefactored } from './ContextRefactored'
import './context-when-good-demo.css'

type Section = 'noisy' | 'appropriate' | 'overuse' | 'refactored'

/**
 * Demo: When is React Context better than props drilling, and when is it not?
 *
 * - Props drilling noisy: theme + user through 5–6 levels — noisy, error-prone. Context improves clarity here.
 * - Context appropriate: Split ThemeContext and UserContext; no drilling; each consumer subscribes to what it needs.
 * - Context overuse: One AppContext with theme, user, sidebar — any change re-renders every consumer. Unnecessary re-renders.
 * - Refactored: Split contexts (ThemeContext, UserContext) so design is scoped and safer; fewer unnecessary re-renders than one big context.
 */
export function ContextWhenGoodDemo() {
  const [section, setSection] = useState<Section>('noisy')

  return (
    <main className="context-when-good-demo">
      <header className="context-when-good-demo__header">
        <h1>Context: when better than props drilling, when not</h1>
        <p className="context-when-good-demo__subtitle">
          When <strong>theme</strong> and <strong>user</strong> are drilled through many levels, props become noisy and error-prone — Context improves clarity. When Context is <strong>one big store</strong> (theme + user + sidebar), any change re-renders every consumer — split contexts for a scoped, safer design. Open the console to see <code>[render]</code> logs.
        </p>
        <div className="context-when-good-demo__tabs">
          <button
            type="button"
            className={section === 'noisy' ? 'active' : ''}
            onClick={() => setSection('noisy')}
          >
            Props drilling (noisy)
          </button>
          <button
            type="button"
            className={section === 'appropriate' ? 'active' : ''}
            onClick={() => setSection('appropriate')}
          >
            Context appropriate
          </button>
          <button
            type="button"
            className={section === 'overuse' ? 'active' : ''}
            onClick={() => setSection('overuse')}
          >
            Context overuse
          </button>
          <button
            type="button"
            className={section === 'refactored' ? 'active' : ''}
            onClick={() => setSection('refactored')}
          >
            Refactored (scoped)
          </button>
        </div>
      </header>

      <section className="context-when-good-demo__concepts">
        <h2>When Context is better vs when it is not</h2>
        <ul>
          <li>
            <strong>Props drilling noisy:</strong> Same data (theme, user) through 5–6 levels — long prop lists, easy to forget a level. Context removes drilling and improves clarity; consumers read what they need.
          </li>
          <li>
            <strong>Context appropriate:</strong> Split ThemeContext and UserContext. Each consumer subscribes only to what it needs. Clear, scoped.
          </li>
          <li>
            <strong>Context overuse:</strong> One AppContext with theme, user, sidebarOpen. Any update changes the value → every consumer re-renders. UserBadge only needs user but re-renders on theme toggle. Check console: 6+ logs per toggle.
          </li>
          <li>
            <strong>Refactored:</strong> Split into ThemeContext and UserContext. Safer, scoped design; theme change only affects theme consumers (and their ancestors). When possible, scope Provider to the subtree that needs it to reduce re-renders further.
          </li>
        </ul>
      </section>

      {section === 'noisy' && <PropsDrillingNoisy />}
      {section === 'appropriate' && <ContextAppropriate />}
      {section === 'overuse' && <ContextOveruse />}
      {section === 'refactored' && <ContextRefactored />}
    </main>
  )
}
