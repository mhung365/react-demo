import { useState } from 'react'
import { ReRenderDemo } from './demos/re-render'
import { ExpensiveChildDemo } from './demos/expensive-child'
import { SnapshotDemo } from './demos/render-snapshot'
import { RefVsStateDemo } from './demos/ref-vs-state'
import { EffectLifecycleDemo } from './demos/effect-lifecycle'
import { EffectDepsDemo } from './demos/effect-deps'
import { EffectDepsIdentityDemo } from './demos/effect-deps-identity'
import { LayoutEffectDemo } from './demos/layout-effect'
import { UseMemoCostDemo } from './demos/use-memo-cost'
import { UseCallbackDemo } from './demos/use-callback-demo'
import { StatePlacementDemo } from './demos/state-placement'
import { GlobalStateDemo } from './demos/global-state-overuse'
import { StateScaleBugsDemo } from './demos/state-scale-bugs'
import { PropsDrillingDemo } from './demos/props-drilling-vs-context'
import { ContextWhenGoodDemo } from './demos/context-when-good'
import { ContextReRendersDemo } from './demos/context-re-renders'
import { StateClassificationDemo } from './demos/state-classification'
import { StateObjectTradeoffsDemo } from './demos/state-object-tradeoffs'
import { SideEffectsDemo } from './demos/side-effects'
import { DataFetchingDemo } from './demos/data-fetching-use-effect'
import { FetchDuringRenderDemo } from './demos/fetch-during-render'
import { DoubleFetchDemo } from './demos/double-fetch'
import { RequestCancellationDemo } from './demos/request-cancellation'
import { EffectLogicTestabilityDemo } from './demos/effect-logic-testability'
import { EffectRaceConditionsDemo } from './demos/effect-race-conditions'
import { TimerCleanupDemo } from './demos/timer-cleanup'
import { AvoidUseEffectDemo } from './demos/avoid-use-effect'
import { RenderOptimizationDemo } from './demos/render-optimization'
import { MemoDemo } from './demos/react-memo-demo'
import { MemoPropsChangeDemo } from './demos/memo-props-change'
import { PrematureMemoDemo } from './demos/premature-memo'
import { PerfProblemsNoMemoDemo } from './demos/perf-problems-no-memo/PerfProblemsNoMemoDemo'
import { ObjectIdentityDemo } from './demos/object-identity/ObjectIdentityDemo'
import { OptimizationDecisionDemo } from './demos/optimization-decision/OptimizationDecisionDemo'
import './App.css'

type DemoId = 're-render' | 'expensive-child' | 'render-snapshot' | 'ref-vs-state' | 'effect-lifecycle' | 'effect-deps' | 'effect-deps-identity' | 'layout-effect' | 'use-memo-cost' | 'use-callback' | 'state-placement' | 'global-state' | 'state-scale-bugs' | 'props-drilling' | 'context-when-good' | 'context-re-renders' | 'state-classification' | 'state-object-tradeoffs' | 'side-effects' | 'data-fetching' | 'fetch-during-render' | 'double-fetch' | 'request-cancellation' | 'effect-logic-testability' | 'effect-race-conditions' | 'timer-cleanup' | 'avoid-use-effect' | 'render-optimization' | 'react-memo' | 'memo-props-change' | 'premature-memo' | 'perf-problems-no-memo' | 'object-identity' | 'optimization-decision'

const DEMO_OPTIONS: { group: string; options: { id: DemoId; label: string }[] }[] = [
  {
    group: 'I: React state & render fundamentals',
    options: [
      { id: 're-render', label: 'Re-render basics' },
      { id: 'expensive-child', label: 'Expensive child (reference equality)' },
      { id: 'render-snapshot', label: 'Render snapshot & closures' },
      { id: 'ref-vs-state', label: 'useRef vs useState' },
      { id: 'effect-lifecycle', label: 'useEffect lifecycle' },
      { id: 'effect-deps', label: 'useEffect deps' },
      { id: 'effect-deps-identity', label: 'useEffect deps identity' },
      { id: 'layout-effect', label: 'useEffect vs useLayoutEffect' },
      { id: 'use-memo-cost', label: 'useMemo cost' },
      { id: 'use-callback', label: 'useCallback' },
      { id: 'state-placement', label: 'State colocation vs lift' },
      { id: 'global-state', label: 'Global state overuse' },
      { id: 'state-scale-bugs', label: 'State bugs at scale' },
      { id: 'props-drilling', label: 'Props drilling vs Context' },
      { id: 'context-when-good', label: 'Context when good' },
      { id: 'context-re-renders', label: 'Context re-renders' },
      { id: 'state-classification', label: 'State classification (UI / client / server)' },
      { id: 'state-object-tradeoffs', label: 'State object vs multiple useState' },
    ],
  },
  {
    group: 'II: Side effects & server state',
    options: [
      { id: 'side-effects', label: 'Side effects (definition & overuse)' },
      { id: 'data-fetching', label: 'Data fetching (useEffect)' },
      { id: 'fetch-during-render', label: 'Fetch during render (pure render)' },
      { id: 'double-fetch', label: 'Double fetch (StrictMode & deps)' },
      { id: 'request-cancellation', label: 'Request cancellation (AbortController)' },
      { id: 'effect-logic-testability', label: 'Effect logic & testability' },
      { id: 'effect-race-conditions', label: 'Effect race conditions (correct deps ≠ no race)' },
      { id: 'timer-cleanup', label: 'Timer cleanup (setInterval / setTimeout)' },
      { id: 'avoid-use-effect', label: 'When to avoid useEffect (patterns instead)' },
    ],
  },
  {
    group: 'III: Memoization & performance',
    options: [
      { id: 'render-optimization', label: 'When to optimize rendering (noise vs problem)' },
      { id: 'react-memo', label: 'What React.memo prevents (and does not)' },
      { id: 'memo-props-change', label: 'Memoized child with changing props (prop shape & refactor)' },
      { id: 'premature-memo', label: 'Why premature memoization is a mistake' },
      { id: 'perf-problems-no-memo', label: "Performance problems memo can't fix" },
      { id: 'object-identity', label: 'Object/array identity (memo, effect, Context)' },
      { id: 'optimization-decision', label: 'When to optimize rendering (decision framework)' },
    ],
  },
]

function getDemoInfo(id: DemoId): { group: string; label: string } | null {
  for (const { group, options } of DEMO_OPTIONS) {
    const option = options.find((o) => o.id === id)
    if (option) return { group, label: option.label }
  }
  return null
}

export default function App() {
  const [demo, setDemo] = useState<DemoId>('re-render')
  const demoInfo = getDemoInfo(demo)

  return (
    <div className="app">
      <nav className="app-nav">
        <label htmlFor="demo-select" className="sr-only">
          Choose demo
        </label>
        <select
          id="demo-select"
          value={demo}
          onChange={(e) => setDemo(e.target.value as DemoId)}
          className="app-nav-select"
          aria-label="Choose demo"
        >
          {DEMO_OPTIONS.map(({ group, options }) => (
            <optgroup key={group} label={group}>
              {options.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {demoInfo && (
          <div className="app-nav-title">
            <strong>{demoInfo.group}</strong>
            <span>{demoInfo.label}</span>
          </div>
        )}
      </nav>
      {/* I: REACT STATE & RENDER FUNDAMENTALS */}
      {demo === 're-render' && <ReRenderDemo />}
      {demo === 'expensive-child' && <ExpensiveChildDemo />}
      {demo === 'render-snapshot' && <SnapshotDemo />}
      {demo === 'ref-vs-state' && <RefVsStateDemo />}
      {demo === 'effect-lifecycle' && <EffectLifecycleDemo />}
      {demo === 'effect-deps' && <EffectDepsDemo />}
      {demo === 'effect-deps-identity' && <EffectDepsIdentityDemo />}
      {demo === 'layout-effect' && <LayoutEffectDemo />}
      {demo === 'use-memo-cost' && <UseMemoCostDemo />}
      {demo === 'use-callback' && <UseCallbackDemo />}
      {demo === 'state-placement' && <StatePlacementDemo />}
      {demo === 'global-state' && <GlobalStateDemo />}
      {demo === 'state-scale-bugs' && <StateScaleBugsDemo />}
      {demo === 'props-drilling' && <PropsDrillingDemo />}
      {demo === 'context-when-good' && <ContextWhenGoodDemo />}
      {demo === 'context-re-renders' && <ContextReRendersDemo />}
      {demo === 'state-classification' && <StateClassificationDemo />}
      {demo === 'state-object-tradeoffs' && <StateObjectTradeoffsDemo />}
      {/* II: SIDE EFFECTS & SERVER STATE */}
      {demo === 'side-effects' && <SideEffectsDemo />}
      {demo === 'data-fetching' && <DataFetchingDemo />}
      {demo === 'fetch-during-render' && <FetchDuringRenderDemo />}
      {demo === 'double-fetch' && <DoubleFetchDemo />}
      {demo === 'request-cancellation' && <RequestCancellationDemo />}
      {demo === 'effect-logic-testability' && <EffectLogicTestabilityDemo />}
      {demo === 'effect-race-conditions' && <EffectRaceConditionsDemo />}
      {demo === 'timer-cleanup' && <TimerCleanupDemo />}
      {demo === 'avoid-use-effect' && <AvoidUseEffectDemo />}
      {/* III: MEMOIZATION & PERFORMANCE */}
      {demo === 'render-optimization' && <RenderOptimizationDemo />}
      {demo === 'react-memo' && <MemoDemo />}
      {demo === 'memo-props-change' && <MemoPropsChangeDemo />}
      {demo === 'premature-memo' && <PrematureMemoDemo />}
      {demo === 'perf-problems-no-memo' && <PerfProblemsNoMemoDemo />}
      {demo === 'object-identity' && <ObjectIdentityDemo />}
      {demo === 'optimization-decision' && <OptimizationDecisionDemo />}
      {/* IV: REACT QUERY (SERVER STATE) */}
    </div>
  )
}
