import { dateFromKey } from '../dates'
import { A4, PdfDocument, textWidth, type PdfFont, type Rgb } from '../pdf'
import {
  dayOf,
  daysOfMonth,
  entryMinutes,
  expectedMinutes,
  monthLabel,
  monthMinutes,
  templateFor,
  weekdayOf,
  type DayEntry,
  type HoursSettings,
  type MonthDays,
} from './model'
import { completeSlots, formatClock, formatDuration } from './time'

const MARGIN = 40
const WIDTH = A4.width - MARGIN * 2
const INK: Rgb = [26, 26, 26]
const GRAY: Rgb = [110, 110, 115]
const RULE: Rgb = [228, 228, 230]
const ACCENT: Rgb = [232, 104, 18]
const RED: Rgb = [208, 38, 38]
const TINT: Rgb = [255, 241, 230]
const BEIGE: Rgb = [246, 241, 232]
const ROW = 17.5
const SIZE = 9
const SHORT_DAYS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']

export interface HoursPdfSource {
  name: string
  month: string
  today: string
  settings: HoursSettings
  months: Record<string, MonthDays>
}

interface Piece {
  text: string
  fill: Rgb
}

const longDate = (key: string) =>
  dateFromKey(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function fit(text: string, font: PdfFont, size: number, width: number): string {
  if (textWidth(text, font, size) <= width) return text
  let cut = text.length
  while (cut > 1 && textWidth(`${text.slice(0, cut)}…`, font, size) > width) cut -= 1
  return `${text.slice(0, cut).trimEnd()}…`
}

interface Column {
  label: string
  width: number
  align: 'left' | 'right' | 'center'
}

const COLUMNS: Column[] = [
  { label: 'Jour', width: 58, align: 'left' },
  { label: 'Plages horaires', width: 206, align: 'left' },
  { label: 'Total', width: 50, align: 'right' },
  { label: 'Repas', width: 46, align: 'center' },
  { label: 'Remarque', width: WIDTH - 360, align: 'left' },
]

function put(doc: PdfDocument, x: number, y: number, column: Column, pieces: Piece[], font: PdfFont, wanted: number) {
  const room = column.width - 10
  let size = wanted
  const measure = () => pieces.reduce((sum, piece) => sum + textWidth(piece.text, font, size), 0)
  while (size > 6.5 && measure() > room) size -= 0.25
  const width = measure()
  let left = column.align === 'left' ? x + 5 : column.align === 'right' ? x + column.width - 5 - width : x + (column.width - width) / 2
  for (const piece of pieces) {
    doc.text(left, y, piece.text, font, size, piece.fill)
    left += textWidth(piece.text, font, size)
  }
}

interface Cell {
  pieces: Piece[]
  font?: PdfFont
  size?: number
}

const cell = (text: string, fill: Rgb = INK, font?: PdfFont, size?: number): Cell => ({ pieces: [{ text, fill }], font, size })

function row(doc: PdfDocument, y: number, cells: Cell[]) {
  let x = MARGIN
  cells.forEach((item, i) => {
    const column = COLUMNS[i]
    if (!column) return
    put(doc, x, y, column, item.pieces, item.font ?? 'regular', item.size ?? SIZE)
    x += column.width
  })
}

function plages(settings: HoursSettings, date: string, entry: DayEntry | undefined): Piece[] {
  const template = templateFor(settings, date)
  const expected = template ? completeSlots(template.slots) : []
  if (!entry) return [{ text: '—', fill: GRAY }]
  if (entry.off) return [{ text: 'Non travaillé', fill: expected.length ? RED : GRAY }]
  return completeSlots(entry.slots).flatMap((slot, i) => {
    const model = expected[i]
    return [
      ...(i ? [{ text: '  ·  ', fill: GRAY }] : []),
      { text: formatClock(slot.start), fill: model?.start === slot.start ? INK : RED },
      { text: '–', fill: INK },
      { text: formatClock(slot.end), fill: model?.end === slot.end ? INK : RED },
    ]
  })
}

export function hoursPdf({ name, month, today, settings, months }: HoursPdfSource): Blob {
  const doc = new PdfDocument()
  doc.addPage()
  const days = months[month] ?? {}
  const done = monthMinutes(days)
  const entries = Object.values(days)
  const meals = entries.filter((entry) => entry.meal && !entry.off).length
  const worked = entries.filter((entry) => entryMinutes(entry) > 0).length
  let y = A4.height - MARGIN

  doc.text(MARGIN, y - 10, 'RELEVÉ D’HORAIRES', 'bold', 9.5, ACCENT)
  doc.text(MARGIN, y - 36, fit(name, 'bold', 21, WIDTH - 190), 'bold', 21, INK)
  const title = monthLabel(month)
  doc.text(MARGIN + WIDTH - textWidth(title, 'bold', 16), y - 36, title, 'bold', 16, ACCENT)
  y -= 50

  doc.rect(MARGIN, y - 46, WIDTH, 46, TINT)
  const stats: [string, string][] = [
    [formatDuration(done), 'Heures effectuées'],
    [String(worked), 'Jours travaillés'],
    [String(meals), 'Repas pris au travail'],
  ]
  stats.forEach(([value, label], i) => {
    const x = MARGIN + 14 + (i * WIDTH) / stats.length
    doc.text(x, y - 21, value, 'bold', 13, INK)
    doc.text(x, y - 35, label, 'regular', 8, GRAY)
  })
  y -= 68

  row(doc, y, COLUMNS.map((column) => cell(column.label, GRAY, 'bold', 8)))
  doc.line(MARGIN, y - 5.5, MARGIN + WIDTH, y - 5.5, ACCENT, 0.8)

  daysOfMonth(month).forEach((date, index) => {
    y -= ROW
    if (index % 2 === 0) doc.rect(MARGIN, y - 6, WIDTH, ROW, BEIGE)
    const weekday = Number(weekdayOf(date))
    const entry = days[dayOf(date)]
    const minutes = entryMinutes(entry)
    const working = minutes > 0
    const changed = working && minutes !== expectedMinutes(settings, date)
    row(doc, y, [
      cell(`${SHORT_DAYS[weekday - 1] ?? ''} ${dayOf(date)}`, INK, weekday >= 6 ? 'regular' : 'bold'),
      { pieces: plages(settings, date, entry) },
      cell(working ? formatDuration(minutes) : '—', changed ? RED : working ? INK : GRAY, working ? 'bold' : 'regular'),
      cell(working ? (entry?.meal ? 'Oui' : 'Non') : '—', !working ? GRAY : entry?.meal !== (templateFor(settings, date)?.meal ?? false) ? RED : INK),
      cell(fit(entry?.note.replace(/\s+/g, ' ') ?? '', 'regular', 8, (COLUMNS[4]?.width ?? 150) - 10), entry?.off ? INK : GRAY, 'regular', 8),
    ])
  })

  doc.line(MARGIN, y - 6, MARGIN + WIDTH, y - 6, RULE, 0.6)
  y -= ROW + 2
  row(doc, y, [
    cell('Total', INK, 'bold'),
    cell(`${worked} jour${worked > 1 ? 's' : ''} travaillé${worked > 1 ? 's' : ''}`, GRAY),
    cell(formatDuration(done), ACCENT, 'bold'),
    cell(String(meals), INK, 'bold'),
    cell(''),
  ])

  doc.text(MARGIN, 56, 'En rouge : écart avec l’horaire type.', 'regular', 8, RED)
  doc.line(MARGIN, 42, MARGIN + WIDTH, 42, RULE, 0.6)
  doc.text(MARGIN, 30, `Édité le ${longDate(today)} · Kalories`, 'regular', 8, GRAY)
  return doc.toBlob()
}

export const hoursFileName = (name: string, month: string) =>
  `horaires-${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${month}.pdf`
