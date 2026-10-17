import { useMemo } from 'react'
import { qrMatrix } from '../lib/qr'

const QUIET = 4

export function QrCode({ text, label }: { text: string; label: string }) {
  const matrix = useMemo(() => qrMatrix(text), [text])
  const size = matrix.length + QUIET * 2
  const path = matrix
    .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x + QUIET} ${y + QUIET}h1v1h-1z` : '')))
    .join('')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges" className="block w-full">
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  )
}
