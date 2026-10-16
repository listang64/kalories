export type ArcSide = 'left' | 'right'

export const ARC_THICKNESS = 28
const PAD = 8

export function arcLayout(size: number) {
  const r = size / 2 - ARC_THICKNESS / 2 - PAD
  const gap = Math.asin(Math.min(1, (ARC_THICKNESS + size * 0.08) / (2 * r)))
  return { r, gap }
}

export function arcGeometry(side: ArcSide, size: number) {
  const { r, gap } = arcLayout(size)
  const cx = side === 'left' ? size / 2 : 0
  const cy = size / 2
  const start = side === 'left' ? Math.PI + gap : Math.PI - gap
  const end = side === 'left' ? 2 * Math.PI - gap : gap
  const point = (t: number) => `${cx + r * Math.sin(t)} ${cy - r * Math.cos(t)}`
  const sweep = side === 'left' ? 1 : 0
  return {
    d: `M${point(start)}A${r} ${r} 0 0 ${sweep} ${point(end)}`,
    length: r * (Math.PI - 2 * gap),
    top: cy - r,
    bottom: cy + r,
  }
}
