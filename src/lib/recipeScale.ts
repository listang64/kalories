const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 }
const METRIC = /^\s*(k?g|gr|mg|[mcd]?l)\b/i

interface Amount {
  from: number
  to: number | null
  rest: string
}

const decimal = (text: string | undefined) => Number((text ?? '').replace(',', '.'))

function leading(text: string): Amount | null {
  const mixed = /^\s*(\d+)\s+(\d+)\/(\d+)(.*)$/s.exec(text)
  if (mixed) return { from: decimal(mixed[1]) + decimal(mixed[2]) / decimal(mixed[3]), to: null, rest: mixed[4] ?? '' }
  const fraction = /^\s*(\d+)\/(\d+)(.*)$/s.exec(text)
  if (fraction) return { from: decimal(fraction[1]) / decimal(fraction[2]), to: null, rest: fraction[3] ?? '' }
  const glyph = /^\s*(\d+(?:[.,]\d+)?)?\s*([½¼¾⅓⅔])(.*)$/s.exec(text)
  if (glyph) return { from: decimal(glyph[1]) + (FRACTIONS[glyph[2] ?? ''] ?? 0), to: null, rest: glyph[3] ?? '' }
  const plain = /^\s*(\d+(?:[.,]\d+)?)(?:\s*(?:-|à)\s*(\d+(?:[.,]\d+)?))?(.*)$/s.exec(text)
  if (plain) return { from: decimal(plain[1]), to: plain[2] ? decimal(plain[2]) : null, rest: plain[3] ?? '' }
  return null
}

function show(value: number, metric: boolean): string {
  if (metric) {
    const rounded = value >= 100 ? Math.round(value / 5) * 5 : value >= 10 ? Math.round(value) : Math.round(value * 100) / 100
    return String(rounded).replace('.', ',')
  }
  const halves = Math.max(0.5, Math.round(value * 2) / 2)
  const whole = Math.floor(halves)
  if (halves === whole) return String(whole)
  return whole ? `${whole} ½` : '½'
}

export function scaleQuantity(text: string, factor: number): string {
  const amount = factor === 1 ? null : leading(text)
  if (!amount || !Number.isFinite(amount.from)) return text
  const metric = METRIC.test(amount.rest)
  const from = show(amount.from * factor, metric)
  const range = amount.to === null ? from : `${from}-${show(amount.to * factor, metric)}`
  return `${range}${amount.rest}`
}

export function sumQuantities(quantities: string[]): string {
  const filled = quantities.map((quantity) => quantity.trim()).filter(Boolean)
  const amounts = filled.map(leading)
  const unit = (amount: Amount | null) => amount?.rest.trim().toLowerCase()
  const [first] = amounts
  const summable =
    first && amounts.every((amount) => amount && amount.to === null && Number.isFinite(amount.from) && unit(amount) === unit(first))
  if (!first || !summable || filled.length < 2) return filled.join(' + ')
  const total = amounts.reduce((sum, amount) => sum + (amount?.from ?? 0), 0)
  return `${show(total, METRIC.test(first.rest))}${first.rest}`
}

export function totalGrams(quantities: string[]): number | null {
  const grams = quantities.map(leading).map((amount) => {
    const unit = /^\s*(kg|g|gr)\b/i.exec(amount?.rest ?? '')?.[1]?.toLowerCase()
    return amount && unit && amount.to === null ? amount.from * (unit === 'kg' ? 1000 : 1) : 0
  })
  const total = grams.reduce((sum, value) => sum + value, 0)
  return total > 0 ? total : null
}
