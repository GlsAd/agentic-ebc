export type Role = 'user' | 'model'

export type Turn = { role: Role; content: string }

export type Stage = 'welcome' | 'tp1' | 'tp2' | 'tp3' | 'composing' | 'concept' | 'error'

export type ChatRequest =
  | { mode: 'touchpoint'; touchpointIndex: 0 | 1 | 2; transcript: Turn[] }
  | { mode: 'concept'; transcript: Turn[] }

export type TouchpointResponse = { scene: string }

export type ConceptResult = {
  story: string
  concept_name: string
  what_the_agent_handles: string
  what_alex_becomes: string
  the_orchestration_moment: string
}

export type ChatResponse = TouchpointResponse | ConceptResult | { error: string }
