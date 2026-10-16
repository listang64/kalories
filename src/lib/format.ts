const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export function formatInt(value: number): string {
  return integer.format(Math.round(value))
}

export function formatBuildDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
