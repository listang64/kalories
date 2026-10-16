export type Point = [number, number]

export function chartScale(peak: number) {
  const step = peak > 2000 ? 1000 : 500
  const max = Math.ceil((peak * 1.08) / step) * step
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step)
  return { max, ticks }
}

export function monotonePath(points: Point[]): string {
  const n = points.length
  const first = points[0]
  if (!first) return ''
  if (n === 1) return `M${first[0]},${first[1]}`
  const px = points.map((p) => p[0])
  const py = points.map((p) => p[1])
  const at = (list: number[], i: number) => list[i] ?? 0
  const dx = px.slice(1).map((x, i) => x - at(px, i))
  const slope = py.slice(1).map((y, i) => (y - at(py, i)) / (at(dx, i) || 1))
  const tangent = px.map((_, i) => {
    if (i === 0) return at(slope, 0)
    if (i === n - 1) return at(slope, n - 2)
    const a = at(slope, i - 1)
    const b = at(slope, i)
    if (a * b <= 0) return 0
    const h0 = at(dx, i - 1)
    const h1 = at(dx, i)
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b)
  })
  let d = `M${first[0]},${first[1]}`
  for (let i = 0; i < n - 1; i += 1) {
    const h = at(dx, i) / 3
    const c1x = at(px, i) + h
    const c1y = at(py, i) + at(tangent, i) * h
    const c2x = at(px, i + 1) - h
    const c2y = at(py, i + 1) - at(tangent, i + 1) * h
    d += `C${c1x},${c1y},${c2x},${c2y},${at(px, i + 1)},${at(py, i + 1)}`
  }
  return d
}

export function runs<T>(values: (T | null)[]): { start: number; items: T[] }[] {
  const result: { start: number; items: T[] }[] = []
  values.forEach((value, i) => {
    if (value === null) return
    const last = result[result.length - 1]
    if (last && last.start + last.items.length === i) last.items.push(value)
    else result.push({ start: i, items: [value] })
  })
  return result
}
