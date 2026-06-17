import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ConceptResult } from '../types'
import { CONCEPT_LABELS, COPY_CTA, COPY_DONE, RESTART_CTA } from '../content'
import { BrandFrame } from './ui/BrandFrame'

type Props = {
  concept: ConceptResult
  onRestart: () => void
}

function buildShareText(c: ConceptResult): string {
  return [
    `THE AGENTIC EBC — ${c.concept_name}`,
    '',
    `${CONCEPT_LABELS.story}`,
    c.story,
    '',
    `${CONCEPT_LABELS.what_the_agent_handles}`,
    c.what_the_agent_handles,
    '',
    `${CONCEPT_LABELS.what_alex_becomes}`,
    c.what_alex_becomes,
    '',
    `${CONCEPT_LABELS.the_orchestration_moment}`,
    c.the_orchestration_moment
  ].join('\n')
}

export function ConceptCard({ concept, onRestart }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText(concept))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <BrandFrame>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="card">
          <div className="concept-hero">
            <img className="astro" src="/brand/astro/astro-pose-2.png" alt="" />
            <div>
              <div className="concept-name-eyebrow">{CONCEPT_LABELS.concept_name}</div>
              <div className="concept-name">{concept.concept_name}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="field-label">
            <img src="/brand/icons/sparkle.png" alt="" />
            {CONCEPT_LABELS.story}
          </div>
          <div className="field-body story">{concept.story}</div>
        </div>

        <div className="card">
          <div className="field-label">{CONCEPT_LABELS.what_the_agent_handles}</div>
          <div className="field-body">{concept.what_the_agent_handles}</div>
        </div>

        <div className="card">
          <div className="field-label">{CONCEPT_LABELS.what_alex_becomes}</div>
          <div className="field-body">{concept.what_alex_becomes}</div>
        </div>

        <div className="card">
          <div className="field-label">
            <img src="/brand/icons/agentforce-fuzzy.png" alt="" />
            {CONCEPT_LABELS.the_orchestration_moment}
          </div>
          <div className="field-body">{concept.the_orchestration_moment}</div>
        </div>

        <div className="concept-actions">
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? COPY_DONE : COPY_CTA}
          </button>
          <button className="btn-link" onClick={onRestart}>{RESTART_CTA}</button>
        </div>
      </motion.div>
    </BrandFrame>
  )
}
