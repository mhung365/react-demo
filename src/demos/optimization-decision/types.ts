/** How Senior devs classify re-renders for prioritization */
export type RenderClassification = 'harmless' | 'tolerable' | 'must-fix'

export interface ComponentClassification {
  name: string
  classification: RenderClassification
  reason: string
}

export const TEAMS = ['Team A', 'Team B', 'Team C'] as const
export type TeamId = (typeof TEAMS)[number]
