const buildDate = new Date(__BUILD_DATE__).toLocaleString('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function AppVersion({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-text-2 tabular-nums ${className}`}>
      Version {__APP_VERSION__} · {buildDate}
    </p>
  )
}
