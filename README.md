# The Agentic EBC

A mobile-first interactive experience for Executive Briefing Center professionals. Each participant scans a QR code on their phone, co-writes the story of Alex (a Senior EBC Programme Manager) across three touchpoints, and receives one named concept that captures the human + agent orchestration in their version of the story.

Built for a 20–30 min talk audience of ~25 GACEP members.

---

## Stack

- **Frontend:** Vite + React 18 + TypeScript + Framer Motion
- **Backend:** single Vercel Serverless Function at `/api/chat`
- **AI:** Google Gemini (default model: `gemini-2.0-flash`) via `@google/generative-ai`
- **Hosting:** GitHub + Vercel

The Gemini API key lives only on the server. The frontend talks exclusively to `/api/chat` and never sees the key.

---

## Local development

You need Node 18+ and a Gemini API key from Google AI Studio (or your GCP project).

```bash
cd ~/claude_projects/agentic-ebc
npm install
cp .env.local.example .env.local
# edit .env.local and paste your real GEMINI_API_KEY
```

You have two ways to run locally:

### Option A — full stack via Vercel CLI (recommended)

The `/api/chat` function only runs under the Vercel runtime locally.

```bash
npm install -g vercel        # one-time
vercel login                 # one-time
vercel link                  # link this folder to a Vercel project (or accept new)
vercel dev
```

Open the URL it prints (usually `http://localhost:3000`). On a phone on the same Wi-Fi, replace `localhost` with the Mac's LAN IP.

### Option B — frontend only (UI iteration without API)

```bash
npm run dev
```

The UI renders, but `/api/chat` will 404 because Vite doesn't run serverless functions. Use this to iterate on layout, copy, motion. Switch to Option A to test the full flow.

---

## Deploy to Vercel

1. `git init && git add . && git commit -m "Initial commit"`
2. Create a GitHub repo and push.
3. Import the repo on [vercel.com/new](https://vercel.com/new). Framework preset: **Vite**.
4. In Vercel project Settings → Environment Variables, add:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** your Gemini API key
   - **Environments:** Production, Preview, (optional) Development
5. Deploy.

### Lock down the API key

Once you have your Vercel domain (e.g. `agentic-ebc.vercel.app`), go to the [GCP Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) and on the API key:

- **Application restrictions:** none (the key is only ever called server-to-server from Vercel; HTTP referrer restriction would not apply, but you can restrict by IP if you want).
- **API restrictions:** restrict to **Generative Language API** only.

This is defense in depth. The key is not exposed to the browser; the bundle does not contain it.

---

## Project layout

```
api/
  chat.ts                ← serverless function (server-side key)
public/
  brand/                 ← Salesforce logos, Astro stills, storytelling icons
src/
  App.tsx                ← stage machine + transcript state
  components/            ← Welcome, Touchpoint, ConceptCard
  components/ui/         ← BrandFrame, ProgressDots, LoadingScene
  lib/api.ts             ← thin POST client to /api/chat
  content.ts             ← UI strings + Gemini system prompt + per-call instructions
  theme.css              ← Salesforce palette + globals
  types.ts
  main.tsx
```

---

## Changing the model

Edit one constant at the top of `api/chat.ts`:

```ts
const GEMINI_MODEL = 'gemini-2.0-flash'
```

---

## What's intentionally out of scope

- No analytics, accounts, or persistence.
- No internationalization (English only).
- No rate limiting. With ~25 expected participants and a single live session this is fine. If reused at scale, add an Upstash rate limit in `api/chat.ts`.
- No automated tests. Manual verification only — this is a one-shot demo.
