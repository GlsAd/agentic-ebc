import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  SYSTEM_PROMPT,
  TOUCHPOINT_INSTRUCTIONS,
  CONCEPT_INSTRUCTION
} from '../src/content'

// Single editable model constant. Default per the brief; swap to a confirmed
// model id once Adrien validates against his GCP key.
const GEMINI_MODEL = 'gemini-2.0-flash'

type Role = 'user' | 'model'
type Turn = { role: Role; content: string }

type RequestBody =
  | { mode: 'touchpoint'; touchpointIndex: 0 | 1 | 2; transcript: Turn[] }
  | { mode: 'concept'; transcript: Turn[] }

type VercelRequest = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => VercelResponse
  setHeader: (name: string, value: string) => void
  end: () => void
}

function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).json({ error: msg })
}

function parseBody(raw: unknown): RequestBody | null {
  let obj: unknown = raw
  if (typeof raw === 'string') {
    try { obj = JSON.parse(raw) } catch { return null }
  }
  if (!obj || typeof obj !== 'object') return null
  const r = obj as Record<string, unknown>
  if (r.mode !== 'touchpoint' && r.mode !== 'concept') return null
  if (!Array.isArray(r.transcript)) return null
  const transcript = r.transcript.filter(
    (t): t is Turn =>
      !!t && typeof t === 'object'
      && (t as Turn).role !== undefined
      && ((t as Turn).role === 'user' || (t as Turn).role === 'model')
      && typeof (t as Turn).content === 'string'
  )
  if (r.mode === 'touchpoint') {
    const idx = r.touchpointIndex
    if (idx !== 0 && idx !== 1 && idx !== 2) return null
    return { mode: 'touchpoint', touchpointIndex: idx, transcript }
  }
  return { mode: 'concept', transcript }
}

// Strip ``` fences and any leading/trailing prose around a JSON object.
function extractJson(text: string): string {
  let t = text.trim()
  // strip markdown fences ```json ... ```
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fence) t = fence[1].trim()
  // grab the first { ... last } block defensively
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1)
  }
  return t
}

function buildHistory(transcript: Turn[]) {
  return transcript.map(t => ({
    role: t.role,
    parts: [{ text: t.content }]
  }))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' })
  }

  const body = parseBody(req.body)
  if (!body) return badRequest(res, 'Invalid request body.')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)

    if (body.mode === 'touchpoint') {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 320
        }
      })
      const chat = model.startChat({ history: buildHistory(body.transcript) })
      const instruction = TOUCHPOINT_INSTRUCTIONS[body.touchpointIndex]
      const result = await chat.sendMessage(instruction)
      const scene = result.response.text().trim()
      if (!scene) return res.status(502).json({ error: 'Empty scene returned.' })
      return res.status(200).json({ scene })
    }

    // concept mode
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 900,
        responseMimeType: 'application/json'
      }
    })
    const chat = model.startChat({ history: buildHistory(body.transcript) })
    const result = await chat.sendMessage(CONCEPT_INSTRUCTION)
    const raw = result.response.text()
    const cleaned = extractJson(raw)
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(cleaned)
    } catch (err) {
      console.error('Concept JSON parse failure:', err, '\nRAW:', raw)
      return res.status(502).json({ error: 'Could not read the final concept.' })
    }
    const required = ['story', 'concept_name', 'what_the_agent_handles', 'what_alex_becomes', 'the_orchestration_moment'] as const
    for (const key of required) {
      if (typeof parsed[key] !== 'string' || !(parsed[key] as string).trim()) {
        return res.status(502).json({ error: 'The concept came back incomplete.' })
      }
    }
    return res.status(200).json({
      story: parsed.story,
      concept_name: parsed.concept_name,
      what_the_agent_handles: parsed.what_the_agent_handles,
      what_alex_becomes: parsed.what_alex_becomes,
      the_orchestration_moment: parsed.the_orchestration_moment
    })
  } catch (err) {
    console.error('Gemini call failed:', err)
    return res.status(502).json({ error: 'The story stalled. Please try again.' })
  }
}
