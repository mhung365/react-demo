export type WorkflowStep = 1 | 2 | 3

export interface User {
  id: string
  name: string
  role: string
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice', role: 'Admin' },
  { id: '2', name: 'Bob', role: 'Editor' },
  { id: '3', name: 'Carol', role: 'Viewer' },
]
