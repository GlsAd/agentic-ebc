import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConceptResult, Stage, Turn } from './types'
import { fetchConcept, fetchTouchpoint } from './lib/api'
import { WelcomeScreen } from './components/WelcomeScreen'
import { TouchpointScreen } from './components/TouchpointScreen'
import { ConceptCard } from './components/ConceptCard'
import { LoadingScene } from './components/ui/LoadingScene'
import { BrandFrame } from './components/ui/BrandFrame'
import { CONCEPT_LOADING, ERROR_MESSAGE, RETRY_CTA } from './content'

const TP_INDEX: Record<'tp1' | 'tp2' | 'tp3', 0 | 1 | 2> = { tp1: 0, tp2: 1, tp3: 2 }

export default function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [currentScene, setCurrentScene] = useState('')
  const [concept, setConcept] = useState<ConceptResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [retryHandler, setRetryHandler] = useState<(() => void) | null>(null)

  function fail(handler: () => void) {
    setError(ERROR_MESSAGE)
    setRetryHandler(() => handler)
    setStage('error')
    setLoading(false)
  }

  async function loadTouchpoint(idx: 0 | 1 | 2, nextTranscript: Turn[]) {
    setLoading(true)
    setError(null)
    try {
      const { scene } = await fetchTouchpoint(idx, nextTranscript)
      const updated: Turn[] = [...nextTranscript, { role: 'model', content: scene }]
      setTranscript(updated)
      setCurrentScene(scene)
      const stageKey = (['tp1', 'tp2', 'tp3'] as const)[idx]
      setStage(stageKey)
    } catch {
      fail(() => loadTouchpoint(idx, nextTranscript))
      return
    }
    setLoading(false)
  }

  async function loadConcept(nextTranscript: Turn[]) {
    setStage('composing')
    setLoading(true)
    setError(null)
    try {
      const result = await fetchConcept(nextTranscript)
      setConcept(result)
      setStage('concept')
    } catch {
      fail(() => loadConcept(nextTranscript))
      return
    }
    setLoading(false)
  }

  function handleBegin() {
    void loadTouchpoint(0, [])
  }

  function handleAnswer(answer: string) {
    if (stage !== 'tp1' && stage !== 'tp2' && stage !== 'tp3') return
    const idx = TP_INDEX[stage]
    const next: Turn[] = [...transcript, { role: 'user', content: answer }]
    setTranscript(next)
    if (idx < 2) {
      void loadTouchpoint((idx + 1) as 0 | 1 | 2, next)
    } else {
      void loadConcept(next)
    }
  }

  function handleRestart() {
    setTranscript([])
    setCurrentScene('')
    setConcept(null)
    setError(null)
    setStage('welcome')
  }

  return (
    <AnimatePresence mode="wait">
      {stage === 'welcome' && (
        <motion.div key="welcome">
          <WelcomeScreen onBegin={handleBegin} loading={loading} />
        </motion.div>
      )}

      {(stage === 'tp1' || stage === 'tp2' || stage === 'tp3') && (
        <motion.div key={stage}>
          <TouchpointScreen
            index={TP_INDEX[stage]}
            scene={currentScene}
            onSubmit={handleAnswer}
            submitting={loading}
          />
        </motion.div>
      )}

      {stage === 'composing' && (
        <motion.div key="composing">
          <BrandFrame>
            <LoadingScene lines={[CONCEPT_LOADING]} />
          </BrandFrame>
        </motion.div>
      )}

      {stage === 'concept' && concept && (
        <motion.div key="concept">
          <ConceptCard concept={concept} onRestart={handleRestart} />
        </motion.div>
      )}

      {stage === 'error' && (
        <motion.div key="error">
          <BrandFrame>
            <div className="error-wrap">
              <p className="lead">{error}</p>
              <button
                className="btn-primary"
                onClick={() => {
                  if (retryHandler) retryHandler()
                }}
              >
                {RETRY_CTA}
              </button>
              <button className="btn-link" onClick={handleRestart}>Start over</button>
            </div>
          </BrandFrame>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
