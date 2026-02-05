export type Theme = 'light' | 'dark'

export interface User {
  id: string
  name: string
  role: string
}

export const MOCK_USER: User = {
  id: '1',
  name: 'Alice',
  role: 'Admin',
}
