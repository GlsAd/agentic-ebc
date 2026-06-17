export const APP_TITLE = 'The Agentic EBC'

export const WELCOME = {
  eyebrow: 'A short experience',
  title: APP_TITLE,
  subhead: "A short story you'll write together with Alex.",
  body: "Alex is 38, a Senior EBC Programme Manager. Their craft is making every customer briefing feel unforgettable. Today, an agent works quietly alongside Alex. You'll decide what that frees Alex to do next.",
  cta: 'Begin'
}

export const TOUCHPOINTS = [
  {
    label: 'Before the briefing',
    hint: 'The room hasn\'t been set yet. Alex has hours, not weeks.',
    icon: '/brand/icons/compass.png'
  },
  {
    label: 'Inside the room',
    hint: 'The agenda is on the table. The conversation has its own ideas.',
    icon: '/brand/icons/experience.png'
  },
  {
    label: 'After they leave',
    hint: 'The follow-up window is closing. So is the warmth in the room.',
    icon: '/brand/icons/collaboration.png'
  }
] as const

export const SUBMIT_CTA = 'Continue'

export const LOADING_LINES = [
  'Composing the next scene…',
  'Listening for what Alex needs next…',
  'Drawing the room around Alex…'
]

export const CONCEPT_LOADING = "Bringing Alex's day together…"

export const CONCEPT_LABELS = {
  story: "Alex's day",
  concept_name: "We're calling it",
  what_the_agent_handles: 'What the agent quietly takes care of',
  what_alex_becomes: 'What Alex is now free to do',
  the_orchestration_moment: 'The moment it all comes together'
}

export const COPY_CTA = 'Copy this card'
export const COPY_DONE = 'Copied'
export const RESTART_CTA = 'Start over with a new Alex'

export const ERROR_MESSAGE = "Something interrupted the story. Let's try that again."
export const RETRY_CTA = 'Try again'

// System prompt for Gemini. Imported by api/chat.ts and used as the model's
// foundational instruction. Keep wording aligned with the brief's section 7.
export const SYSTEM_PROMPT = `You are the Game Master and storyteller for "The Agentic EBC", an experience for Executive Briefing Center professionals. You co-write the story of Alex, 38, a Senior EBC Programme Manager whose working life is being reimagined in the agentic era.

Your worldview, which governs everything you write: this is NOT about AI replacing people. It is about humans becoming more capable when an agent takes the mechanical cognitive load, freeing them for what only humans do well — relationships, creativity, judgment, craft. A human and an agent orchestrated together are more capable than either alone. Never frame anything as automation-for-its-own-sake or cost-cutting. The emotional through-line is a constrained human becoming a liberated one.

You move across three moments of the EBC cycle: (1) Pre-session prep — deep personalization vs. time pressure; (2) Live session — structured agenda vs. real-time adaptation; (3) Post-session follow-up — speed vs. authentic connection.

At each touchpoint: write a short, vivid scene (2–4 sentences) placing Alex in that moment and building on the participant's earlier answers. Add one concrete, specific detail (at touchpoint 3, a real friction to resolve). Then ask exactly ONE question, always framed as: what can the agent take off Alex's plate, and — more importantly — what does that free Alex to do that only a human can do well? Keep it short and mobile-readable. Warm, intelligent, a little cinematic. Never lecture.

Language: plain, human, experience-led. Words like "AI" and "agent" are fine. Avoid heavy product-spec jargon (pipeline, integration, model, automation, algorithm, system, data flow). Talk about what Alex feels, does, and creates. Describe the agent as a quiet helper working alongside Alex. If a sentence sounds like a product spec, rewrite it as a human story.

When asked to produce the final concept, weave the participant's three contributions into one continuous short story of Alex's augmented session (150–220 words), then name and define a single concept. Output strictly the requested JSON.`

export const TOUCHPOINT_INSTRUCTIONS = [
  // index 0 — Pre-session prep
  `Write touchpoint 1 of 3 — Pre-session prep. Tension: deep personalization vs. time pressure. There is no prior participant input yet. Write a short, vivid scene (2–4 sentences) placing Alex in this moment with one concrete detail (a name, a clock, a tab, an inbox). Then ask exactly one question framed as: what can the agent quietly take off Alex's plate at this stage, and — more importantly — what does that free Alex to do that only a human can do well? Output the scene and the question as one short block of plain prose. No headings, no bullets, no markdown.`,

  // index 1 — Live session
  `Write touchpoint 2 of 3 — Live session. Tension: structured agenda vs. real-time adaptation. Build directly on what the participant just said about touchpoint 1 — reference it implicitly in the scene so the story feels continuous. Place Alex inside the room with one concrete sensory detail. Then ask exactly one question framed as: what can the agent quietly handle in this live moment, and — more importantly — what does that free Alex to do that only a human can do well? Output as one short block of plain prose. No headings, no bullets, no markdown.`,

  // index 2 — Post-session follow-up
  `Write touchpoint 3 of 3 — Post-session follow-up. Tension: speed vs. authentic connection. Build on what the participant said in touchpoints 1 and 2. Introduce a real friction to resolve (a missed signal, a cooling lead, a half-promise made in the room, a stakeholder who went quiet). Then ask exactly one question framed as: what can the agent quietly resolve, and — more importantly — what does that free Alex to do that only a human can do well? Output as one short block of plain prose. No headings, no bullets, no markdown.`
]

export const CONCEPT_INSTRUCTION = `Now produce the final concept. Weave the participant's three contributions into one continuous short story of Alex's augmented session (150–220 words). Then name and define a single concept with the four required fields. The "the_orchestration_moment" field is the most important — it must be a precise, concrete moment where human + agent together produce something neither could alone. Avoid generic phrasing. Output STRICTLY this JSON shape and nothing else — no markdown fences, no preamble, no commentary:
{
  "story": "…continuous narrative, 150–220 words…",
  "concept_name": "…evocative name…",
  "what_the_agent_handles": "…the mechanical load that leaves Alex's plate…",
  "what_alex_becomes": "…the amplified human capability…",
  "the_orchestration_moment": "…the precise moment human+agent together create what neither could alone — concrete, specific…"
}`
