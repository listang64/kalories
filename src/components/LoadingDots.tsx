export function LoadingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      {[0, 160, 320].map((delay) => (
        <span key={delay} className="dot-hop size-1.5 rounded-full bg-current" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  )
}
