import { useState, useMemo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type Item } from './types'
import './state-scale-bugs-demo.css'

/**
 * INITIAL (small scale): List + Detail. Parent holds selectedId.
 *
 * Works fine: click item → detail shows. One source of truth. No extra features yet.
 * This placement seems fine and is correct for this scope.
 */
function ListSmall({ items, selectedId, onSelect }: {
  items: Item[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  useRenderLog('List (small scale)', { selectedId })

  return (
    <div className="scale-demo__list">
      <h3>List</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            className={selectedId === item.id ? 'selected' : ''}
            onClick={() => onSelect(item.id)}
          >
            {item.name} ({item.status})
          </li>
        ))}
      </ul>
    </div>
  )
}

function DetailSmall({ selectedItem }: { selectedItem: Item | null }) {
  useRenderLog('Detail (small scale)', { selectedId: selectedItem?.id })

  return (
    <div className="scale-demo__detail">
      <h3>Detail</h3>
      {selectedItem ? (
        <p><strong>{selectedItem.name}</strong> — {selectedItem.status}</p>
      ) : (
        <p>Select an item</p>
      )}
    </div>
  )
}

export function InitialSmallScale() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useRenderLog('Dashboard (small scale)', { selectedId })

  const selectedItem = useMemo(
    () => MOCK_ITEMS.find((i) => i.id === selectedId) ?? null,
    [selectedId]
  )

  return (
    <section className="scale-demo scale-demo--initial">
      <header className="scale-demo__section-header">
        <h2>Initial: works for small scale</h2>
        <p>
          One list, one detail panel. <strong>selectedId</strong> lives in the parent. Click item → detail updates. Single source of truth. No bugs. This placement is correct for this scope.
        </p>
      </header>
      <div className="scale-demo__content">
        <ListSmall
          items={MOCK_ITEMS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <DetailSmall selectedItem={selectedItem} />
      </div>
    </section>
  )
}
