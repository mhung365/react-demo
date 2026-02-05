import { useState, useMemo, useCallback } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type Item } from './types'
import './state-scale-bugs-demo.css'

/**
 * SCALED WITH BUGS: New requirements (Favorites, Recent) added. State placement that seemed fine now causes:
 *
 * 1. STALE UI: Recent list has its own "highlightedId" state. When you select from main List, parent selectedId updates but Recent list's highlightedId doesn't — Recent list still shows the old item as selected. Stale.
 * 2. INCONSISTENT DATA: Detail has "Clear selection" that only sets local state (detailCleared). Detail shows "Select an item" but parent selectedId is unchanged — List still shows an item selected. Inconsistent.
 * 3. UNNECESSARY RE-RENDERS: selectedId, favorites, recentViews all in one parent. Any click (select, favorite) re-renders List, Detail, FavoritesSidebar, RecentList. Check console: 5+ [render] logs per action.
 */

function ListScaled({
  items,
  selectedId,
  favorites,
  onSelect,
  onToggleFavorite,
}: {
  items: Item[]
  selectedId: string | null
  favorites: Set<string>
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  useRenderLog('List (scaled)', { selectedId, favoritesSize: favorites.size })

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
            <button
              type="button"
              className="scale-demo__star"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id) }}
              aria-label={favorites.has(item.id) ? 'Unfavorite' : 'Favorite'}
            >
              {favorites.has(item.id) ? '★' : '☆'}
            </button>
            {item.name} ({item.status})
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * BUG: Detail has local "detailCleared" state. When user clicks "Clear selection",
 * we set detailCleared = true so Detail shows "Select an item" — but parent selectedId
 * is unchanged. List still shows the item as selected. INCONSISTENT DATA.
 */
function DetailScaledWithBug({
  selectedItem,
  onClearSelection,
  onToggleFavorite,
  favorites,
}: {
  selectedItem: Item | null
  onClearSelection: () => void
  onToggleFavorite: (id: string) => void
  favorites: Set<string>
}) {
  const [detailCleared, setDetailCleared] = useState(false)
  useRenderLog('Detail (scaled, bug)', { selectedId: selectedItem?.id, detailCleared })

  const displayItem = detailCleared ? null : selectedItem

  return (
    <div className="scale-demo__detail">
      <h3>Detail</h3>
      {displayItem ? (
        <>
          <p><strong>{displayItem.name}</strong> — {displayItem.status}</p>
          <button
            type="button"
            onClick={() => onToggleFavorite(displayItem.id)}
          >
            {favorites.has(displayItem.id) ? '★ Unfavorite' : '☆ Favorite'}
          </button>
          <button
            type="button"
            className="scale-demo__clear-btn"
            onClick={() => setDetailCleared(true)}
          >
            Clear selection (bug: only local state — List still shows selected)
          </button>
        </>
      ) : (
        <p>Select an item</p>
      )}
      <p className="scale-demo__hint scale-demo__hint--wrong">
        Bug: &quot;Clear selection&quot; only sets local state. List and Detail get out of sync.
      </p>
    </div>
  )
}

function FavoritesSidebar({ favorites, items, onSelect }: {
  favorites: Set<string>
  items: Item[]
  onSelect: (id: string) => void
}) {
  useRenderLog('FavoritesSidebar (scaled)', { count: favorites.size })

  const favorited = useMemo(
    () => items.filter((i) => favorites.has(i.id)),
    [items, favorites]
  )

  return (
    <div className="scale-demo__sidebar">
      <h3>Favorites</h3>
      {favorited.length === 0 ? (
        <p>No favorites</p>
      ) : (
        <ul>
          {favorited.map((item) => (
            <li key={item.id} onClick={() => onSelect(item.id)}>
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * BUG: Recent list has its own "highlightedId" state. When user selects from main List,
 * parent selectedId updates but this component's highlightedId doesn't — we only set
 * highlightedId when user clicks *this* list. So Recent list shows stale highlight.
 * STALE UI.
 */
function RecentListWithBug({
  recentIds,
  items,
  selectedId,
  onSelect,
}: {
  recentIds: string[]
  items: Item[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  useRenderLog('RecentList (scaled, bug)', { recentIds: recentIds.length, highlightedId, selectedId })

  const recentItems = useMemo(
    () => recentIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[],
    [recentIds, items]
  )

  return (
    <div className="scale-demo__recent">
      <h3>Recently viewed</h3>
      <p className="scale-demo__hint scale-demo__hint--wrong">
        Bug: This list has its own &quot;highlightedId&quot;. Select from main List — this list still shows old highlight (stale).
      </p>
      {recentItems.length === 0 ? (
        <p>None yet</p>
      ) : (
        <ul>
          {recentItems.map((item) => (
            <li
              key={item.id}
              className={highlightedId === item.id ? 'selected' : ''}
              onClick={() => {
                onSelect(item.id)
                setHighlightedId(item.id)
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ScaledWithBugs() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [recentIds, setRecentIds] = useState<string[]>([])
  useRenderLog('Dashboard (scaled, bugs)', { selectedId, favoritesSize: favorites.size, recentCount: recentIds.length })

  const selectedItem = useMemo(
    () => MOCK_ITEMS.find((i) => i.id === selectedId) ?? null,
    [selectedId]
  )

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 5)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <section className="scale-demo scale-demo--bugs">
      <header className="scale-demo__section-header">
        <h2>Scaled with bugs</h2>
        <p>
          Added Favorites and Recently viewed. <strong>Stale UI:</strong> Recent list has its own highlightedId — select from main List, Recent list still shows old highlight. <strong>Inconsistent:</strong> Detail &quot;Clear selection&quot; only sets local state — List still shows selected. <strong>Re-renders:</strong> Any action re-renders 5+ components (check console).
        </p>
      </header>
      <div className="scale-demo__layout">
        <FavoritesSidebar favorites={favorites} items={MOCK_ITEMS} onSelect={handleSelect} />
        <div className="scale-demo__main">
          <div className="scale-demo__content">
            <ListScaled
              items={MOCK_ITEMS}
              selectedId={selectedId}
              favorites={favorites}
              onSelect={handleSelect}
              onToggleFavorite={toggleFavorite}
            />
            <DetailScaledWithBug
              selectedItem={selectedItem}
              onClearSelection={() => setSelectedId(null)}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          </div>
          <RecentListWithBug
            recentIds={recentIds}
            items={MOCK_ITEMS}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </section>
  )
}
