import { useState, useMemo, useCallback, memo } from 'react'
import { useRenderLog } from './useRenderLog'
import { MOCK_ITEMS, type Item } from './types'
import './state-scale-bugs-demo.css'

/**
 * REFACTORED SCALABLE: Single source of truth, no local overrides.
 *
 * - selectedId, favorites, recentIds live in Dashboard (one place). No duplicate "highlightedId" in Recent list — Recent list uses parent selectedId for highlight. No "detailCleared" in Detail — "Clear selection" calls parent setSelectedId(null).
 * - Stale UI fixed: Recent list receives selectedId and highlights by it.
 * - Inconsistent data fixed: Detail "Clear selection" calls onClearSelection() so parent and List update.
 * - Re-renders: We memo FavoritesSidebar and RecentList so they only re-render when their props change. When only selectedId changes, FavoritesSidebar (receives favorites + items + onSelect) can skip if we pass stable callbacks; when only favorites change, RecentList (receives recentIds, selectedId, onSelect) can skip. Simplest: single source of truth fixes correctness; memo reduces re-renders where props are stable.
 */

function ListRefactored({
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
  useRenderLog('List (refactored)', { selectedId, favoritesSize: favorites.size })

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

function DetailRefactored({
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
  useRenderLog('Detail (refactored)', { selectedId: selectedItem?.id })

  return (
    <div className="scale-demo__detail">
      <h3>Detail</h3>
      {selectedItem ? (
        <>
          <p><strong>{selectedItem.name}</strong> — {selectedItem.status}</p>
          <button type="button" onClick={() => onToggleFavorite(selectedItem.id)}>
            {favorites.has(selectedItem.id) ? '★ Unfavorite' : '☆ Favorite'}
          </button>
          <button type="button" className="scale-demo__clear-btn" onClick={onClearSelection}>
            Clear selection (calls parent — List and Detail stay in sync)
          </button>
        </>
      ) : (
        <p>Select an item</p>
      )}
      <p className="scale-demo__hint scale-demo__hint--correct">
        Single source of truth: &quot;Clear&quot; calls parent. List and Detail stay in sync.
      </p>
    </div>
  )
}

const FavoritesSidebarRefactored = memo(function FavoritesSidebarRefactored({
  favorites,
  items,
  onSelect,
}: {
  favorites: Set<string>
  items: Item[]
  onSelect: (id: string) => void
}) {
  useRenderLog('FavoritesSidebar (refactored, memo)', { count: favorites.size })

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
})

/**
 * FIXED: No local highlightedId. Uses parent selectedId for highlight.
 * When user selects from main List, parent selectedId updates → this component
 * re-renders with new selectedId → highlight is correct. No stale UI.
 */
const RecentListRefactored = memo(function RecentListRefactored({
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
  useRenderLog('RecentList (refactored, memo)', { recentIds: recentIds.length, selectedId })

  const recentItems = useMemo(
    () => recentIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[],
    [recentIds, items]
  )

  return (
    <div className="scale-demo__recent">
      <h3>Recently viewed</h3>
      <p className="scale-demo__hint scale-demo__hint--correct">
        Single source of truth: highlight uses parent selectedId. No stale UI.
      </p>
      {recentItems.length === 0 ? (
        <p>None yet</p>
      ) : (
        <ul>
          {recentItems.map((item) => (
            <li
              key={item.id}
              className={selectedId === item.id ? 'selected' : ''}
              onClick={() => onSelect(item.id)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

export function RefactoredScalable() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [recentIds, setRecentIds] = useState<string[]>([])
  useRenderLog('Dashboard (refactored)', { selectedId, favoritesSize: favorites.size, recentCount: recentIds.length })

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

  const handleClearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  return (
    <section className="scale-demo scale-demo--refactored">
      <header className="scale-demo__section-header">
        <h2>Refactored: scalable state architecture</h2>
        <p>
          Single source of truth: selectedId, favorites, recentIds in Dashboard. Recent list uses <strong>parent selectedId</strong> for highlight (no local highlightedId). Detail &quot;Clear&quot; calls <strong>onClearSelection()</strong> so parent updates and List stays in sync. FavoritesSidebar and RecentList memoized to reduce re-renders when their props don&apos;t change.
        </p>
      </header>
      <div className="scale-demo__layout">
        <FavoritesSidebarRefactored
          favorites={favorites}
          items={MOCK_ITEMS}
          onSelect={handleSelect}
        />
        <div className="scale-demo__main">
          <div className="scale-demo__content">
            <ListRefactored
              items={MOCK_ITEMS}
              selectedId={selectedId}
              favorites={favorites}
              onSelect={handleSelect}
              onToggleFavorite={toggleFavorite}
            />
            <DetailRefactored
              selectedItem={selectedItem}
              onClearSelection={handleClearSelection}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          </div>
          <RecentListRefactored
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
