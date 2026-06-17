import { motion } from 'framer-motion'
import { WELCOME } from '../content'
import { BrandFrame } from './ui/BrandFrame'

type Props = { onBegin: () => void; loading: boolean }

export function WelcomeScreen({ onBegin, loading }: Props) {
  return (
    <BrandFrame>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="eyebrow">{WELCOME.eyebrow}</div>
        <h1 className="title">{WELCOME.title}</h1>
        <p className="lead">{WELCOME.subhead}</p>
        <div className="astro-welcome">
          <motion.img
            src="/brand/astro/astro-pose-1.png"
            alt=""
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.55, ease: 'easeOut' }}
          />
        </div>
        <p className="body">{WELCOME.body}</p>
        <button className="btn-primary" onClick={onBegin} disabled={loading}>
          {loading ? 'Starting…' : WELCOME.cta}
        </button>
      </motion.div>
    </BrandFrame>
  )
}
