import { describe, it, expect } from 'vitest'
import {
  validateItems,
  normalizeToViewModels,
  sortByUpdatedDesc,
  computeSummary,
  processRawItems,
} from './dashboardLogic'
import type { RawDashboardItem, DashboardViewModel } from './types'

describe('dashboardLogic (pure business logic)', () => {
  const rawValid: RawDashboardItem = {
    id: '1',
    name: 'Item A',
    status: 'active',
    updated_at: '2024-01-15T10:00:00Z',
  }
  const rawInvalid: RawDashboardItem = {
    id: '2',
    name: 'Item B',
    status: 'invalid',
    updated_at: '2024-01-14T09:00:00Z',
  }
  const rawArchived: RawDashboardItem = {
    id: '3',
    name: 'Item C',
    status: 'archived',
    updated_at: '2024-01-13T08:00:00Z',
  }

  describe('validateItems', () => {
    it('filters out items with invalid status', () => {
      const raw = [rawValid, rawInvalid, rawArchived]
      const result = validateItems(raw)
      expect(result).toHaveLength(2)
      expect(result.map((r) => r.id)).toEqual(['1', '3'])
      expect(result.find((r) => r.status === 'invalid')).toBeUndefined()
    })

    it('returns only active and archived', () => {
      const raw = [rawValid, rawArchived]
      const result = validateItems(raw)
      expect(result).toHaveLength(2)
      expect(result.every((r) => ['active', 'archived'].includes(r.status))).toBe(true)
    })

    it('returns empty array when all invalid', () => {
      const result = validateItems([rawInvalid])
      expect(result).toHaveLength(0)
    })
  })

  describe('normalizeToViewModels', () => {
    it('maps raw to view model with camelCase and displayLabel', () => {
      const raw = [rawValid]
      const result = normalizeToViewModels(raw)
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Item A',
        status: 'active',
        displayLabel: 'Item A (active)',
      })
      expect(result[0].updatedAt).toBeInstanceOf(Date)
      expect(result[0].updatedAt.toISOString()).toBe('2024-01-15T10:00:00.000Z')
    })
  })

  describe('sortByUpdatedDesc', () => {
    it('sorts by updatedAt descending (newest first)', () => {
      const a: DashboardViewModel = {
        id: '1',
        name: 'A',
        status: 'active',
        updatedAt: new Date('2024-01-10T00:00:00Z'),
        displayLabel: 'A (active)',
      }
      const b: DashboardViewModel = {
        id: '2',
        name: 'B',
        status: 'active',
        updatedAt: new Date('2024-01-15T00:00:00Z'),
        displayLabel: 'B (active)',
      }
      const result = sortByUpdatedDesc([a, b])
      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('1')
    })

    it('does not mutate input', () => {
      const input = [
        { ...rawValid, id: '1', updated_at: '2024-01-10T00:00:00Z' },
        { ...rawValid, id: '2', updated_at: '2024-01-15T00:00:00Z' },
      ]
      const viewModels = normalizeToViewModels(input as RawDashboardItem[])
      const originalFirst = viewModels[0].id
      sortByUpdatedDesc(viewModels)
      expect(viewModels[0].id).toBe(originalFirst)
    })
  })

  describe('computeSummary', () => {
    it('computes total, activeCount, archivedCount, lastUpdated', () => {
      const items: DashboardViewModel[] = [
        { id: '1', name: 'A', status: 'active', updatedAt: new Date('2024-01-15T10:00:00Z'), displayLabel: 'A (active)' },
        { id: '2', name: 'B', status: 'active', updatedAt: new Date('2024-01-14T09:00:00Z'), displayLabel: 'B (active)' },
        { id: '3', name: 'C', status: 'archived', updatedAt: new Date('2024-01-13T08:00:00Z'), displayLabel: 'C (archived)' },
      ]
      const result = computeSummary(items)
      expect(result.total).toBe(3)
      expect(result.activeCount).toBe(2)
      expect(result.archivedCount).toBe(1)
      expect(result.lastUpdated).toBeInstanceOf(Date)
      expect(result.lastUpdated?.toISOString()).toBe('2024-01-15T10:00:00.000Z')
    })

    it('returns lastUpdated null for empty items', () => {
      const result = computeSummary([])
      expect(result.total).toBe(0)
      expect(result.activeCount).toBe(0)
      expect(result.archivedCount).toBe(0)
      expect(result.lastUpdated).toBeNull()
    })
  })

  describe('processRawItems (full pipeline)', () => {
    it('validate → normalize → sort → summary', () => {
      const raw = [rawInvalid, rawValid, rawArchived]
      const result = processRawItems(raw)
      expect(result.items).toHaveLength(2)
      expect(result.items.map((i) => i.status)).toEqual(expect.arrayContaining(['active', 'archived']))
      expect(result.summary.total).toBe(2)
      expect(result.summary.activeCount).toBe(1)
      expect(result.summary.archivedCount).toBe(1)
    })

    it('items are sorted by updatedAt desc', () => {
      const raw: RawDashboardItem[] = [
        { id: '1', name: 'Old', status: 'active', updated_at: '2024-01-10T00:00:00Z' },
        { id: '2', name: 'New', status: 'active', updated_at: '2024-01-15T00:00:00Z' },
      ]
      const result = processRawItems(raw)
      expect(result.items[0].name).toBe('New')
      expect(result.items[1].name).toBe('Old')
    })

    it('filters invalid status before pipeline', () => {
      const raw = [rawInvalid]
      const result = processRawItems(raw)
      expect(result.items).toHaveLength(0)
      expect(result.summary.total).toBe(0)
      expect(result.summary.lastUpdated).toBeNull()
    })
  })
})
