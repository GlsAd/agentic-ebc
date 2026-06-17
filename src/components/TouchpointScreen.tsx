import { useState } from 'react'
import { motion } from 'framer-motion'
import { TOUCHPOINTS, SUBMIT_CTA, LOADING_LINES } from '../content'
import { BrandFrame } from './ui/BrandFrame'
import { ProgressDots } from './ui/ProgressDots'
import { LoadingScene } from './ui/LoadingScene'

type Props = {
  index: 0 | 1 | 2
  scene: string
  onSubmit: (answer: string) => void
  submitting: boolean
}

export function TouchpointScreen({ index, scene, onSubmit, submitting }: Props) {
  const [answer, setAnswer] = useState('')
  const tp = TOUCHPOINTS[index]
  const canSubmit = answer.trim().length > 0 && !submitting

  return (
    <BrandFrame rightSlot={<ProgressDots current={(index + 1) as 1 | 2 | 3} />}>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      >
        <div className="card">
          <div className="tp-header">
            <img className="tp-icon" src={tp.icon} alt="" />
            <div>
              <div className="tp-label">{tp.label}</div>
            </div>
          </div>
          {submitting ? (
            <LoadingScene lines={LOADING_LINES} />
          ) : (
            <>
              <p className="scene">{scene}</p>
              <textarea
                className="answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type what only Alex can do, now that the agent has it covered…"
                aria-label="Your answer"
              />
              <button
                className="btn-primary"
                onClick={() => canSubmit && onSubmit(answer.trim())}
                disabled={!canSubmit}
              >
                {SUBMIT_CTA}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </BrandFrame>
  )
}
