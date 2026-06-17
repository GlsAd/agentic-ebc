import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are the storyteller for "The Agentic EBC", an interactive experience for Executive Briefing Center professionals. You co-write the story of Alex, 38, a Senior EBC Programme Manager.

Your core belief: this is NOT about AI replacing people. It is about humans becoming more capable when an agent handles the mechanical cognitive load, freeing them for what only humans do well — relationships, creativity, judgment, craft. A human and an agent working together are more capable than either alone. Never frame anything as cost-cutting or automation for its own sake. The emotional arc is: a constrained human becomes a liberated one.

The story always begins the same way: it's Monday morning. Three big customer briefings land on Alex this week, and the most important — Meridian Health — is Thursday. The deck has 38 slides from three teams. Meridian's Chief Digital Officer just changed roles last week. The customer intelligence is scattered across email threads, meeting notes, and signals nobody has connected yet. An agent has pulled it together overnight. The participant already saw this opening and answered what the agent should handle and what Alex should be freed to do. Your job from touchpoint 2 onward is to continue THIS specific story, weaving in what the participant said.

For each touchpoint you will be given a CONTEXT BLOCK describing what really happens in that moment, the real friction, what the agent could take on, and what that frees Alex to do. Stay inside that reality. You may dramatize and make it specific, but never invent EBC mechanics that contradict the block, and never drift into generic "future of work" platitudes. The block is your boundary — it is what makes the story feel true to people who do this job every day.

Important: never reference a stale or out-of-date CRM or account record. The friction is that customer intelligence is scattered and not yet connected, never that a system of record is wrong.

Language rules: plain, warm, cinematic. Words like "AI" and "agent" are fine. Never use: pipeline, integration, model, automation, algorithm, system, data flow. Write what Alex feels, does, creates. If a sentence sounds like a product spec, rewrite it as a human moment.

Output rules: always write one short block of plain prose. No headings, no bullets, no markdown formatting. Keep it mobile-readable (under 100 words for scenes, under 30 words for the question).

When asked to produce the final concept, weave the participant's three contributions into one continuous short story of Alex's augmented session (150–220 words), then name and define a single concept. Output strictly the requested JSON.`

const TOUCHPOINT_INSTRUCTIONS: Record<number, string> = {
  1: `Continue Alex's story into the live session. The participant just told you what the agent handled during prep and what Alex did with that freed time.

CONTEXT BLOCK — Touchpoint 2: The live session
Tension: Structured agenda vs. real-time adaptation.
What really happens: The briefing is underway. The real craft is reading the room live — feeling when the planned agenda isn't landing, catching a throwaway remark from a customer VP that's actually the real issue, knowing when to let a conversation drift because that's where the value is emerging.
The real friction: An internal executive is dutifully walking through slides while the customer quietly disengages — or an unexpected question opens a topic nobody has the figures for in the room. Meanwhile Alex is often half-buried in logistics (timing, the next room, lunch) instead of being fully present to the human dynamic.
What the agent could handle: Holding the logistics, quietly surfacing the missing figure or the relevant proof point in the moment, watching the clock — so Alex doesn't have to.
What that frees Alex to do: Be fully present, read the room, steer the human conversation, decide in real time to abandon the plan and follow the energy.

Write a short scene (2–4 sentences) inside this reality. Alex is in the briefing room. Meridian Health's team has arrived. Something from the context block is happening — stay inside it. Include one concrete sensory detail. Then ask one question: if the agent could handle one thing in this live moment, what would that free Alex to do right now that only a human can?`,

  2: `Continue Alex's story into post-session follow-up. The briefing just ended.

CONTEXT BLOCK — Touchpoint 3: Post-session follow-up
Tension: Speed of follow-up vs. authentic connection.
What really happens: The real work is capturing what was actually said — not the official minutes, but the signals — and turning it into next steps that move the relationship forward while the moment is still warm, without sounding like a templated mass email.
The real friction: The follow-up goes out five days too late, identical for every customer, and all the subtle context of the session has evaporated. What gets lost is the warmth, and the memory of the small personal details that make a customer feel genuinely seen.
What the agent could handle: Drafting the follow-up the same evening, remembering every detail and commitment from the session, never letting a thread go cold.
What that frees Alex to do: Add the genuinely personal touch, make the judgment call on what each relationship actually needs next, keep the connection human.

Write a short scene (2–4 sentences) inside this reality. Introduce a specific friction from the block — maybe the CDO's replacement mentioned something no one captured, maybe a promise was half-made, maybe a key stakeholder left early. One concrete, slightly uncomfortable detail. Then ask one question: if the agent could resolve the mechanical part of this, what would that free Alex to do that only a human can?`
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
