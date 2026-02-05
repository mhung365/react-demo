export interface Item {
  id: string
  name: string
  status: 'active' | 'archived'
}

export const MOCK_ITEMS: Item[] = [
  { id: '1', name: 'Item Alpha', status: 'active' },
  { id: '2', name: 'Item Beta', status: 'active' },
  { id: '3', name: 'Item Gamma', status: 'archived' },
  { id: '4', name: 'Item Delta', status: 'active' },
  { id: '5', name: 'Item Epsilon', status: 'archived' },
]
