import { useEffect, useState } from 'react'

type Props = { lines: string[] }

export function LoadingScene({ lines }: Props) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (lines.length <= 1) return
    const id = window.setInterval(() => setIdx(i => (i + 1) % lines.length), 2400)
    return () => window.clearInterval(id)
  }, [lines.length])
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <img className="loading-icon" src="/brand/icons/sparkle.png" alt="" />
      <div className="loading-text">{lines[idx]}</div>
    </div>
  )
}
