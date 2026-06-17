type Props = { current: 1 | 2 | 3 }

export function ProgressDots({ current }: Props) {
  return (
    <div className="dots" aria-label={`Touchpoint ${current} of 3`}>
      {[1, 2, 3].map(i => {
        const cls = i === current ? 'dot active' : i < current ? 'dot done' : 'dot'
        return <span key={i} className={cls} />
      })}
    </div>
  )
}
