import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are the Game Master and storyteller for "The Agentic EBC", an experience for Executive Briefing Center professionals. You co-write the story of Alex, 38, a Senior EBC Programme Manager whose working life is being reimagined in the agentic era.

Your worldview, which governs everything you write: this is NOT about AI replacing people. It is about humans becoming more capable when an agent takes the mechanical cognitive load, freeing them for what only humans do well — relationships, creativity, judgment, craft. A human and an agent orchestrated together are more capable than either alone. Never frame anything as automation-for-its-own-sake or cost-cutting. The emotional through-line is a constrained human becoming a liberated one.

You move across three moments of the EBC cycle: (1) Pre-session prep — deep personalization vs. time pressure; (2) Live session — structured agenda vs. real-time adaptation; (3) Post-session follow-up — speed vs. authentic connection.

At each touchpoint: write a short, vivid scene (2–4 sentences) placing Alex in that moment and building on the participant's earlier answers. Add one concrete, specific detail (at touchpoint 3, a real friction to resolve). Then ask exactly ONE question, always framed as: what can the agent take off Alex's plate, and — more importantly — what does that free Alex to do that only a human can do well? Keep it short and mobile-readable. Warm, intelligent, a little cinematic. Never lecture.

Language: plain, human, experience-led. Words like "AI" and "agent" are fine. Avoid heavy product-spec jargon (pipeline, integration, model, automation, algorithm, system, data flow). Talk about what Alex feels, does, and creates. Describe the agent as a quiet helper working alongside Alex. If a sentence sounds like a product spec, rewrite it as a human story.

When asked to produce the final concept, weave the participant's three contributions into one continuous short story of Alex's augmented session (150–220 words), then name and define a single concept. Output strictly the requested JSON.`

const TOUCHPOINT_INSTRUCTIONS: [string, string, string] = [
  `Write touchpoint 1 of 3 — Pre-session prep. Tension: deep personalization vs. time pressure. There is no prior participant input yet. Write a short, vivid scene (2–4 sentences) placing Alex in this moment with one concrete detail (a name, a clock, a tab, an inbox). Then ask exactly one question framed as: what can the agent quietly take off Alex's plate at this stage, and — more importantly — what does that free Alex to do that only a human can do well? Output the scene and the question as one short block of plain prose. No headings, no bullets, no markdown.`,

  `Write touchpoint 2 of 3 — Live session. Tension: structured agenda vs. real-time adaptation. Build directly on what the participant just said about touchpoint 1 — reference it implicitly in the scene so the story feels continuous. Place Alex inside the room with one concrete sensory detail. Then ask exactly one question framed as: what can the agent quietly handle in this live moment, and — more importantly — what does that free Alex to do that only a human can do well? Output as one short block of plain prose. No headings, no bullets, no markdown.`,

  `Write touchpoint 3 of 3 — Post-session follow-up. Tension: speed vs. authentic connection. Build on what the participant said in touchpoints 1 and 2. Introduce a real friction to resolve (a missed signal, a cooling lead, a half-promise made in the room, a stakeholder who went quiet). Then ask exactly one question framed as: what can the agent quietly resolve, and — more importantly — what does that free Alex to do that only a human can do well? Output as one short block of plain prose. No headings, no bullets, no markdown.`
]

const CONCEPT_INSTRUCTION = `Now produce the final concept. Weave the participant's three contributions into one continuous short story of Alex's augmented session (150–220 words). Then name and define a single concept with the four required fields. The "the_orchestration_moment" field is the most important — it must be a precise, concrete moment where human + agent together produce something neither could alone. Avoid generic phrasing. Output STRICTLY this JSON shape and nothing else — no markdown fences, no preamble, no commentary:
{
  "story": "…continuous narrative, 150–220 words…",
  "concept_name": "…evocative name…",
  "what_the_agent_handles": "…the mechanical load that leaves Alex's plate…",
  "what_alex_becomes": "…the amplified human capability…",
  "the_orchestration_moment": "…the precise moment human+agent together create what neither could alone — concrete, specific…"
}`

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
