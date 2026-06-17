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

export const BASE_SCENARIO = `It's Monday morning. Three big customer briefings are landing on Alex this week, and the most important one — Meridian Health, a long-courted account — is Thursday. The deck has 38 slides pulled together by three different teams. None of them know that Meridian's Chief Digital Officer just changed roles last week. The real story behind their visit isn't in the official request; it's scattered across a dozen email threads, old meeting notes, and signals nobody has had time to connect. Alex used to spend the next two days just assembling the picture. This week, an agent has already pulled it together overnight — and Alex is sitting down to the part that actually matters.

Here's the question: if the agent handles the assembly work — pulling profiles, flagging outdated slides, surfacing what changed since last contact — what would Alex finally have time to do? What's the human craft that only Alex can bring to this prep?`

export const TOUCHPOINT_CONTEXTS = {
  tp1: {
    tension: 'Deep personalization vs. time pressure',
    reality: 'Alex is preparing for a high-stakes briefing with Meridian Health. The real work isn\'t logistics — it\'s decoding the account: who is actually flying in, what their unspoken business stake is behind the official agenda request, which internal executives should be in the room, and how to build an agenda that doesn\'t feel like a recycled template.',
    friction: 'Three briefings are landing in the same week. The customer intelligence is scattered across a dozen email threads, past meeting notes, and public signals nobody has had time to pull together. The easy move is to reuse the agenda from the last similar session. What gets lost under time pressure is the deep personalization and the intuition about what will truly resonate with this customer.',
    agent_handles: 'Pulling the scattered context together, surfacing what matters about the account, drafting a first-pass agenda — the mechanical assembly.',
    alex_freed: 'The human read — sensing the unspoken stake, choosing the one story that will land, deciding who in the room creates the right chemistry.'
  },
  tp2: {
    tension: 'Structured agenda vs. real-time adaptation',
    reality: 'The briefing is underway. The real craft is reading the room live — feeling when the planned agenda isn\'t landing, catching a throwaway remark from a customer VP that\'s actually the real issue, knowing when to let a conversation drift because that\'s where the value is emerging.',
    friction: 'An internal executive is dutifully walking through slides while the customer quietly disengages — or an unexpected question opens a topic nobody has the figures for in the room. Meanwhile Alex is often half-buried in logistics (timing, the next room, lunch) instead of being fully present to the human dynamic.',
    agent_handles: 'Holding the logistics, quietly surfacing the missing figure or the relevant proof point in the moment, watching the clock — so Alex doesn\'t have to.',
    alex_freed: 'Be fully present, read the room, steer the human conversation, decide in real time to abandon the plan and follow the energy.'
  },
  tp3: {
    tension: 'Speed of follow-up vs. authentic connection',
    reality: 'The real work is capturing what was actually said — not the official minutes, but the signals — and turning it into next steps that move the relationship forward while the moment is still warm, without sounding like a templated mass email.',
    friction: 'The follow-up goes out five days too late, identical for every customer, and all the subtle context of the session has evaporated. What gets lost is the warmth, and the memory of the small personal details that make a customer feel genuinely seen.',
    agent_handles: 'Drafting the follow-up the same evening, remembering every detail and commitment from the session, never letting a thread go cold.',
    alex_freed: 'Add the genuinely personal touch, make the judgment call on what each relationship actually needs next, keep the connection human.'
  }
} as const
