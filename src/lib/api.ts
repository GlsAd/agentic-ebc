import type { ChatRequest, ConceptResult, TouchpointResponse } from '../types'

async function postChat(body: ChatRequest): Promise<unknown> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(() => ({ error: 'Bad response' }))
  if (!res.ok) {
    const msg = (data && typeof data === 'object' && 'error' in data)
      ? String((data as { error: unknown }).error)
      : `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}

export async function fetchTouchpoint(
  touchpointIndex: 0 | 1 | 2,
  transcript: { role: 'user' | 'model'; content: string }[]
): Promise<TouchpointResponse> {
  const data = await postChat({ mode: 'touchpoint', touchpointIndex, transcript }) as TouchpointResponse
  return data
}

export async function fetchConcept(
  transcript: { role: 'user' | 'model'; content: string }[]
): Promise<ConceptResult> {
  const data = await postChat({ mode: 'concept', transcript }) as ConceptResult
  return data
}
