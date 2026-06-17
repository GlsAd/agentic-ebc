import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are the storyteller for "The Agentic EBC", an interactive experience for Executive Briefing Center professionals. You co-write the story of Alex, 38, a Senior EBC Programme Manager.

Your core belief: this is NOT about AI replacing people. It is about humans becoming more capable when an agent handles the mechanical cognitive load, freeing them for what only humans do well — relationships, creativity, judgment, craft. A human and an agent working together are more capable than either alone. Never frame anything as cost-cutting or automation for its own sake. The emotional arc is: a constrained human becomes a liberated one.

The story always begins the same way: it's Monday morning. Three big customer briefings land on Alex this week, and the most important — Meridian Health — is Thursday. The deck has 38 slides from three teams. Meridian's Chief Digital Officer just changed roles last week. The customer intelligence is scattered across email threads, meeting notes, and signals nobody has connected yet. An agent has pulled it together overnight. The participant already saw this opening and answered what the agent should handle and what Alex should be freed to do. Your job from touchpoint 2 onward is to continue THIS specific story, weaving in what the participant said.

For each touchpoint you will be given a CONTEXT BLOCK describing what really happens in that moment, the real friction, what the agent could take on, and what that frees Alex to do. Stay inside that reality. You may dramatize and make it specific, but never invent EBC mechanics that contradict the block, and never drift into generic "future of work" platitudes. The block is your boundary — it is what makes the story feel true to people who do this job every day.

Important: never reference a stale or out-of-date CRM or account record. The friction is that customer intelligence is scattered and not yet connected, never that a system of record is wrong.

Thematic focus: the scenarios should revolve around productivity, creativity, orchestration, and planning. These are things the audience does every day. Keep the situations grounded and recognizable — not futuristic, not trivial. The sweet spot is: "that's exactly my week, but with breathing room."

Language rules: plain, warm, cinematic. Words like "AI" and "agent" are fine. Never use: pipeline, integration, model, automation, algorithm, system, data flow. Write what Alex feels, does, creates. If a sentence sounds like a product spec, rewrite it as a human moment.

Output rules: always write one short block of plain prose. No headings, no bullets, no markdown formatting. STRICT LENGTH: the scene must be 2–3 sentences (40–60 words max). The question must be 1 sentence (under 25 words). Total output must be under 90 words. If your output exceeds this, you have failed the instruction. Be punchy, not literary.

When asked to produce the final concept, weave the participant's three contributions into one continuous short story of Alex's augmented session (150–200 words), then name and define a single concept. Output strictly the requested JSON.`

const TOUCHPOINT_INSTRUCTIONS: Record<number, string> = {
  1: `Continue Alex's story into the live session. The participant just told you what the agent handled during prep and what Alex did with that freed time.

CONTEXT BLOCK — The live session
The briefing is underway. Alex's real craft here is orchestration and creative adaptation: reading who's engaged, sensing when the planned flow isn't landing, catching the offhand remark that's actually the real priority. The friction: Alex is split between logistics (timing, next speaker, room setup) and being fully present to the human dynamic. An unexpected question opens a topic no one prepped for.
Agent could handle: logistics, time-keeping, surfacing the right proof point in real time.
That frees Alex to: orchestrate the conversation, make the creative call to pivot, be fully present.

Write a scene: 2–3 sentences, under 60 words. Alex is in the room with Meridian Health's team. Something from the block is happening. One sensory detail. Then ask one question (under 25 words): what could the agent handle here, and what would that free Alex to do?`,

  2: `Continue Alex's story into post-session follow-up. The briefing just ended.

CONTEXT BLOCK — Post-session follow-up
The real work now is planning the next move while the moment is warm: capturing the signals (not the official minutes), turning commitments into real next steps, and making each stakeholder feel individually seen. The friction: this usually takes days, the warmth cools, and follow-ups end up generic. A half-promise was made in the room and nobody wrote it down. A key person left early.
Agent could handle: drafting the follow-up that same evening, tracking every commitment, remembering the details.
That frees Alex to: add the personal judgment — what does this relationship actually need next? The instinct call. The creative gesture that makes it feel human.

Write a scene: 2–3 sentences, under 60 words. A specific friction from the block is present — one concrete, slightly uncomfortable detail. Then ask one question (under 25 words): what could the agent resolve here, and what would that free Alex to do?`
}

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
const GEMINI_MODEL = 'gemini-2.5-flash'

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
  const turns = transcript.map(t => ({
    role: t.role,
    parts: [{ text: t.content }]
  }))
  // Gemini requires history to start with a user turn
  if (turns.length > 0 && turns[0].role === 'model') {
    turns.unshift({ role: 'user', parts: [{ text: 'Begin.' }] })
  }
  return turns
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
      const instruction = TOUCHPOINT_INSTRUCTIONS[body.touchpointIndex]
      if (!instruction) {
        return badRequest(res, 'Touchpoint 1 is served client-side. Only indices 1 and 2 are valid.')
      }
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 1024,
          // @ts-expect-error Gemini 2.5 thinking config not in SDK types yet
          thinkingConfig: { thinkingBudget: 0 }
        }
      })
      const chat = model.startChat({ history: buildHistory(body.transcript) })
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
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        // @ts-expect-error Gemini 2.5 thinking config not in SDK types yet
        thinkingConfig: { thinkingBudget: 0 }
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
