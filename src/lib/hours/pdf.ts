import { dateFromKey } from '../dates'
import { A4, PdfDocument, textWidth, type PdfFont, type Rgb } from '../pdf'
import {
  balanceAt,
  balanceWord,
  dayOf,
  daysOfMonth,
  entryMinutes,
  monthLabel,
  monthMinutes,
  weekdayOf,
  type HoursSettings,
  type MonthDays,
} from './model'
import { completeSlots, formatDuration, formatSlot } from './time'

const MARGIN = 40
const WIDTH = A4.width - MARGIN * 2
const INK: Rgb = [26, 26, 26]
const GRAY: Rgb = [110, 110, 115]
const RULE: Rgb = [228, 228, 230]
const ACCENT: Rgb = [232, 104, 18]
const TINT: Rgb = [255, 241, 230]
const WEEKEND: Rgb = [244, 244, 246]
const ROW = 17
const SHORT_DAYS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']

export interface HoursPdfSource {
  name: string
  month: string
  at: string
  today: string
  settings: HoursSettings
  months: Record<string, MonthDays>
}

const pdfText = (value: string) => value.replace(/−/g, '-')
const duration = (minutes: number, signed = false) => pdfText(formatDuration(minutes, signed))
const longDate = (key: string) =>
  dateFromKey(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function fit(text: string, font: PdfFont, size: number, width: number): string {
  if (textWidth(text, font, size) <= width) return text
  let cut = text.length
  while (cut > 1 && textWidth(`${text.slice(0, cut)}…`, font, size) > width) cut -= 1
  return `${text.slice(0, cut).trimEnd()}…`
}

function shrink(text: string, font: PdfFont, size: number, width: number): number {
  let current = size
  while (current > 6.5 && textWidth(text, font, current) > width) current -= 0.25
  return current
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

function put(doc: PdfDocument, x: number, y: number, column: Column, text: string, font: PdfFont, size: number, fill: Rgb) {
  const width = textWidth(text, font, size)
  const left = column.align === 'left' ? x + 5 : column.align === 'right' ? x + column.width - 5 - width : x + (column.width - width) / 2
  doc.text(left, y, text, font, size, fill)
}

function row(doc: PdfDocument, y: number, cells: { text: string; font?: PdfFont; fill?: Rgb; size?: number }[]) {
  let x = MARGIN
  cells.forEach((cell, i) => {
    const column = COLUMNS[i]
    if (!column) return
    put(doc, x, y, column, cell.text, cell.font ?? 'regular', cell.size ?? 9, cell.fill ?? INK)
    x += column.width
  })
}

function summary(doc: PdfDocument, y: number, items: [string, string][]) {
  doc.rect(MARGIN, y - 46, WIDTH, 46, TINT)
  const width = WIDTH / items.length
  items.forEach(([value, label], i) => {
    const x = MARGIN + 12 + i * width
    doc.text(x, y - 21, value, 'bold', 13, i === 2 ? ACCENT : INK)
    doc.text(x, y - 35, label, 'regular', 8, GRAY)
  })
}

function balanceBox(doc: PdfDocument, x: number, width: number, label: string, minutes: number) {
  doc.rect(x, 66, width, 48, TINT)
  doc.text(x + 12, 99, label, 'regular', 8.5, GRAY)
  const value = duration(minutes, true)
  doc.text(x + 12, 78, value, 'bold', 17, minutes < 0 ? ACCENT : INK)
  doc.text(x + 18 + textWidth(value, 'bold', 17), 78, balanceWord(minutes), 'regular', 10, GRAY)
}

export function hoursPdf({ name, month, at, today, settings, months }: HoursPdfSource): Blob {
  const doc = new PdfDocument()
  doc.addPage()
  const days = months[month] ?? {}
  const target = settings.targets[month]
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

  summary(doc, y, [
    [duration(done), 'Heures effectuées'],
    [target === undefined ? '—' : duration(target * 60), 'Objectif du mois'],
    [target === undefined ? '—' : duration(done - target * 60, true), 'Écart du mois'],
    [String(worked), 'Jours travaillés'],
    [String(meals), 'Repas pris au travail'],
  ])
  y -= 66

  row(doc, y, COLUMNS.map((column) => ({ text: column.label, font: 'bold', fill: GRAY, size: 8 })))
  doc.line(MARGIN, y - 5, MARGIN + WIDTH, y - 5, ACCENT, 0.8)

  for (const date of daysOfMonth(month)) {
    y -= ROW
    const weekday = Number(weekdayOf(date))
    if (weekday >= 6) doc.rect(MARGIN, y - 5.5, WIDTH, ROW, WEEKEND)
    const entry = days[dayOf(date)]
    const slots = entry && !entry.off ? completeSlots(entry.slots) : []
    const plages = entry?.off ? 'Non travaillé' : slots.length ? slots.map((slot) => formatSlot(slot, '–')).join('  ·  ') : '—'
    const minutes = entryMinutes(entry)
    const plagesWidth = (COLUMNS[1]?.width ?? 200) - 10
    row(doc, y, [
      { text: `${SHORT_DAYS[weekday - 1] ?? ''} ${dayOf(date)}`, font: weekday >= 6 ? 'regular' : 'bold' },
      { text: plages, fill: slots.length ? INK : GRAY, size: shrink(plages, 'regular', 9, plagesWidth) },
      { text: minutes ? duration(minutes) : '—', font: minutes ? 'bold' : 'regular', fill: minutes ? INK : GRAY },
      { text: slots.length ? (entry?.meal ? 'Oui' : 'Non') : '—', fill: slots.length ? INK : GRAY },
      { text: fit(entry?.note.replace(/\s+/g, ' ') ?? '', 'regular', 8, (COLUMNS[4]?.width ?? 150) - 10), size: 8, fill: entry?.off ? INK : GRAY },
    ])
    doc.line(MARGIN, y - 5.5, MARGIN + WIDTH, y - 5.5, RULE, 0.4)
  }

  y -= ROW
  row(doc, y, [
    { text: 'Total', font: 'bold' },
    { text: `${worked} jour${worked > 1 ? 's' : ''} travaillé${worked > 1 ? 's' : ''}`, fill: GRAY },
    { text: duration(done), font: 'bold', fill: ACCENT },
    { text: `${meals}`, font: 'bold' },
    { text: '' },
  ])

  const half = (WIDTH - 10) / 2
  balanceBox(doc, MARGIN, half, `Solde au ${longDate(at)}`, balanceAt(settings, months, at))
  balanceBox(doc, MARGIN + half + 10, half, `Solde à ce jour (${longDate(today)})`, balanceAt(settings, months, today))
  const base = settings.balance ? `report au ${longDate(settings.balance.date)} + ` : ''
  doc.text(MARGIN, 54, pdfText(`Solde = ${base}écart de chaque mois terminé (heures effectuées − objectif).`), 'regular', 7.5, GRAY)

  doc.line(MARGIN, 42, MARGIN + WIDTH, 42, RULE, 0.6)
  doc.text(MARGIN, 30, `Édité le ${longDate(today)} · Kalories`, 'regular', 8, GRAY)
  return doc.toBlob()
}

export const hoursFileName = (name: string, month: string) =>
  `horaires-${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${month}.pdf`
