const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export function formatInt(value: number): string {
  return integer.format(Math.round(value))
}
