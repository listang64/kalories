export type PdfFont = 'regular' | 'bold'
export type Rgb = [number, number, number]

export const A4 = { width: 595.28, height: 841.89 }

const REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833,
  722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556,
  556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334,
  260, 334, 584,
]

const BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833,
  722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611,
  556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389,
  280, 389, 584,
]

const SPECIAL: Record<string, number> = {
  '€': 0x80,
  '…': 0x85,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  'Œ': 0x8c,
  'œ': 0x9c,
  'Ÿ': 0x9f,
  ' ': 0x20,
  ' ': 0x20,
}

const SPECIAL_WIDTHS: Record<number, [number, number]> = {
  0x80: [556, 556],
  0x85: [1000, 1000],
  0x91: [222, 278],
  0x92: [222, 278],
  0x93: [333, 500],
  0x94: [333, 500],
  0x95: [350, 350],
  0x96: [556, 556],
  0x97: [1000, 1000],
  0x8c: [1000, 1000],
  0x9c: [944, 944],
  0xa0: [278, 278],
  0xab: [556, 556],
  0xbb: [556, 556],
  0xb0: [400, 400],
  0xb7: [278, 278],
  0xc6: [1000, 1000],
  0xe6: [889, 889],
  0xdf: [611, 611],
}

function code(char: string): number {
  const value = char.charCodeAt(0)
  if (value >= 32 && value <= 126) return value
  if (value >= 0xa0 && value <= 0xff) return value
  return SPECIAL[char] ?? 0x3f
}

function charWidth(value: number, font: PdfFont): number {
  const table = font === 'bold' ? BOLD : REGULAR
  if (value >= 32 && value <= 126) return table[value - 32] ?? 556
  const special = SPECIAL_WIDTHS[value]
  if (special) return special[font === 'bold' ? 1 : 0]
  const base = String.fromCharCode(value).normalize('NFD').charCodeAt(0)
  return base >= 32 && base <= 126 ? (table[base - 32] ?? 556) : 556
}

export function textWidth(text: string, font: PdfFont, size: number): number {
  return ([...text].reduce((sum, char) => sum + charWidth(code(char), font), 0) * size) / 1000
}

export function wrapText(text: string, font: PdfFont, size: number, width: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word
      if (textWidth(next, font, size) <= width) {
        line = next
        continue
      }
      if (line) lines.push(line)
      line = word
      while (textWidth(line, font, size) > width && line.length > 1) {
        let cut = line.length - 1
        while (cut > 1 && textWidth(line.slice(0, cut), font, size) > width) cut -= 1
        lines.push(line.slice(0, cut))
        line = line.slice(cut)
      }
    }
    lines.push(line)
  }
  return lines
}

function escape(text: string): string {
  return [...text]
    .map((char) => {
      const value = code(char)
      if (value === 0x28 || value === 0x29 || value === 0x5c) return `\\${String.fromCharCode(value)}`
      if (value < 32 || value > 126) return `\\${value.toString(8).padStart(3, '0')}`
      return String.fromCharCode(value)
    })
    .join('')
}

const color = ([r, g, b]: Rgb) => `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`
const n = (value: number) => value.toFixed(2)

export class PdfDocument {
  private pages: string[][] = []

  addPage() {
    this.pages.push([])
  }

  get pageCount() {
    return this.pages.length
  }

  private draw(op: string, page = this.pages.length - 1) {
    this.pages[page]?.push(op)
  }

  text(x: number, y: number, text: string, font: PdfFont, size: number, fill: Rgb, page?: number) {
    const name = font === 'bold' ? 'F2' : 'F1'
    this.draw(`BT /${name} ${n(size)} Tf ${color(fill)} rg ${n(x)} ${n(y)} Td (${escape(text)}) Tj ET`, page)
  }

  rect(x: number, y: number, width: number, height: number, fill: Rgb) {
    this.draw(`${color(fill)} rg ${n(x)} ${n(y)} ${n(width)} ${n(height)} re f`)
  }

  line(x1: number, y1: number, x2: number, y2: number, stroke: Rgb, width: number, page?: number) {
    this.draw(`${color(stroke)} RG ${n(width)} w ${n(x1)} ${n(y1)} m ${n(x2)} ${n(y2)} l S`, page)
  }

  toBlob(): Blob {
    const objects: string[] = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      `<< /Type /Pages /Kids [${this.pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${this.pages.length} >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ]
    this.pages.forEach((ops, i) => {
      const stream = ops.join('\n')
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.width} ${A4.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`,
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
      )
    })
    let body = '%PDF-1.4\n'
    const offsets = objects.map((object, i) => {
      const offset = body.length
      body += `${i + 1} 0 obj\n${object}\nendobj\n`
      return offset
    })
    const xref = body.length
    body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    body += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
    body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
    return new Blob([body], { type: 'application/pdf' })
  }
}
