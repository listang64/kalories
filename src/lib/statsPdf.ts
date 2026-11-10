import { METRICS, type Metric, type MetricMeta } from '../config/metrics'
import { formatInt } from './format'
import { buildHistory, formatDayName, gap, statsFor, valueOf, type DayPoint } from './history'
import type { Meal } from './meals'
import { A4, PdfDocument, textWidth, type PdfFont, type Rgb } from './pdf'
import { goalsOf, type Profile } from './profiles'

const MARGIN = 48
const BOTTOM = 60
const WIDTH = A4.width - MARGIN * 2
const INK: Rgb = [26, 26, 26]
const GRAY: Rgb = [110, 110, 115]
const RULE: Rgb = [228, 228, 230]
const ACCENT: Rgb = [232, 104, 18]
const TINT: Rgb = [255, 241, 230]
const ZEBRA: Rgb = [247, 247, 248]
const ROW = 17

interface Column {
  label: string
  width: number
  align?: 'left' | 'right'
}

interface Cell {
  text: string
  font?: PdfFont
  fill?: Rgb
}

class Sheet {
  readonly doc = new PdfDocument()
  y = 0

  constructor() {
    this.page()
  }

  page() {
    this.doc.addPage()
    this.y = A4.height - MARGIN
  }

  room(height: number) {
    if (this.y - height < BOTTOM) this.page()
  }

  heading(title: string, aside = '') {
    this.room(70)
    this.y -= 26
    this.doc.text(MARGIN, this.y, title.toUpperCase(), 'bold', 11, ACCENT)
    if (aside) this.doc.text(MARGIN + WIDTH - textWidth(aside, 'regular', 9.5), this.y, aside, 'regular', 9.5, GRAY)
    this.y -= 8
    this.doc.line(MARGIN, this.y, MARGIN + WIDTH, this.y, ACCENT, 1)
    this.y -= 2
  }

  note(text: string) {
    this.room(16)
    this.y -= 14
    this.doc.text(MARGIN, this.y, text, 'regular', 9, GRAY)
  }

  table(columns: Column[], rows: Cell[][]) {
    const header = () => {
      this.y -= ROW
      let x = MARGIN
      for (const column of columns) {
        this.cell(x, column, { text: column.label, font: 'bold', fill: GRAY }, 8.5)
        x += column.width
      }
      this.doc.line(MARGIN, this.y - 5, MARGIN + WIDTH, this.y - 5, RULE, 0.8)
      this.y -= 2
    }
    this.room(ROW * 3)
    header()
    rows.forEach((row, index) => {
      if (this.y - ROW < BOTTOM) {
        this.page()
        header()
      }
      this.y -= ROW
      if (index % 2 === 1) this.doc.rect(MARGIN, this.y - 5, WIDTH, ROW, ZEBRA)
      let x = MARGIN
      row.forEach((cell, i) => {
        const column = columns[i]
        if (!column) return
        this.cell(x, column, cell, 10)
        x += column.width
      })
    })
  }

  private cell(x: number, column: Column, cell: Cell, size: number) {
    const font = cell.font ?? 'regular'
    const left = column.align === 'left' ? x + 4 : x + column.width - 4 - textWidth(cell.text, font, size)
    this.doc.text(left, this.y, cell.text, font, size, cell.fill ?? INK)
  }
}

interface Source {
  person: Profile
  meals: Meal[]
  days: string[]
  today: string
}

const amount = (value: number | null, metric: MetricMeta) => (value === null ? '—' : `${formatInt(value)}${metric.suffix || ' kcal'}`)
const plain = (value: number | null) => (value === null ? '—' : formatInt(value))
const longDate = (key: string) => {
  const [y = 1970, m = 1, d = 1] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null)

function header(sheet: Sheet, { person, days }: Source) {
  sheet.doc.text(MARGIN, sheet.y - 10, 'STATISTIQUES KALORIES', 'bold', 10, ACCENT)
  sheet.doc.text(MARGIN, sheet.y - 40, person.name, 'bold', 26, INK)
  const period = `Du ${longDate(days[0] ?? '')} au ${longDate(days.at(-1) ?? '')} · ${days.length} jours`
  sheet.doc.text(MARGIN, sheet.y - 60, period, 'regular', 11, GRAY)
  sheet.y -= 70
}

function summary(sheet: Sheet, source: Source, history: Record<Metric, DayPoint[]>) {
  const { person, today } = source
  sheet.heading('Résumé', 'jours terminés')
  const rows = METRICS.map((metric) => {
    const goal = goalsOf(person)[metric.key]
    const stats = statsFor(history[metric.key], person.uid, goal, today, metric)
    const diff = stats.average === null ? null : Math.round(stats.average - goal)
    return [
      { text: metric.label, font: 'bold' as const, fill: INK },
      { text: amount(goal, metric) },
      { text: amount(stats.average, metric) },
      { text: diff === null ? '—' : `${diff > 0 ? '+' : ''}${formatInt(diff)}`, fill: diff !== null && gap(goal + diff, goal, metric) > 0 ? ACCENT : INK },
      { text: String(stats.logged) },
      { text: stats.logged ? `${stats.hits} (${Math.round((stats.hits / stats.logged) * 100)} %)` : '—' },
      { text: String(stats.streak) },
    ]
  })
  sheet.table(
    [
      { label: 'Mesure', width: 88, align: 'left' },
      { label: 'Objectif', width: 74 },
      { label: 'Moyenne / jour', width: 86 },
      { label: 'Écart moyen', width: 70 },
      { label: 'Jours saisis', width: 62 },
      { label: 'Dans l’objectif', width: 70 },
      { label: 'Série', width: WIDTH - 450 },
    ],
    rows,
  )
  sheet.note('Objectif : plafond pour les calories, glucides et lipides ; minimum pour les protéines. Série : jours d’affilée dans l’objectif.')
}

function balance(sheet: Sheet, source: Source, history: Record<Metric, DayPoint[]>) {
  const { person, today } = source
  const logged = (metric: Metric) =>
    history[metric]
      .filter((point) => point.date !== today)
      .map((point) => valueOf(point, person.uid))
      .filter((value): value is number => value !== null)
  const kcal = logged('kcal')
  if (kcal.length === 0) return
  const carbs = (average(logged('carbs')) ?? 0) * 4
  const fat = (average(logged('fat')) ?? 0) * 9
  const protein = (average(logged('protein')) ?? 0) * 4
  const total = carbs + fat + protein || 1
  const best = history.kcal.filter((point) => point.date !== today && valueOf(point, person.uid) !== null)
  const sorted = [...best].sort((a, b) => (valueOf(a, person.uid) ?? 0) - (valueOf(b, person.uid) ?? 0))
  const low = sorted[0]
  const high = sorted.at(-1)
  sheet.heading('Équilibre et records')
  sheet.room(88)
  sheet.y -= 12
  sheet.doc.rect(MARGIN, sheet.y - 74, WIDTH, 74, TINT)
  const parts = [
    ['Glucides', carbs],
    ['Lipides', fat],
    ['Protéines', protein],
  ] as const
  parts.forEach(([label, value], i) => {
    const x = MARGIN + 16 + i * 120
    sheet.doc.text(x, sheet.y - 26, `${Math.round((value / total) * 100)} %`, 'bold', 18, ACCENT)
    sheet.doc.text(x, sheet.y - 42, `des calories : ${label.toLowerCase()}`, 'regular', 9, GRAY)
  })
  const x = MARGIN + 16 + 360
  sheet.doc.text(x, sheet.y - 22, `Total : ${formatInt(kcal.reduce((sum, value) => sum + value, 0))} kcal`, 'bold', 10, INK)
  if (high) sheet.doc.text(x, sheet.y - 38, `Jour le plus haut : ${formatInt(valueOf(high, person.uid) ?? 0)}`, 'regular', 9.5, INK)
  if (high) sheet.doc.text(x, sheet.y - 50, formatDayName(high.date), 'regular', 9, GRAY)
  if (low) sheet.doc.text(x, sheet.y - 62, `Plus bas : ${formatInt(valueOf(low, person.uid) ?? 0)} · ${formatDayName(low.date)}`, 'regular', 9, GRAY)
  sheet.y -= 74
}

const COLUMNS: Column[] = [
  { label: 'Période', width: 155, align: 'left' },
  { label: 'Calories', width: 90 },
  { label: 'Glucides (g)', width: 85 },
  { label: 'Lipides (g)', width: 85 },
  { label: 'Protéines (g)', width: WIDTH - 415 },
]

function weeks(sheet: Sheet, { person, today }: Source, history: Record<Metric, DayPoint[]>) {
  const points = history.kcal
  const rows: Cell[][] = []
  for (let end = points.length; end > 0; end -= 7) {
    const slice = points.slice(Math.max(0, end - 7), end).filter((point) => point.date !== today)
    if (slice.length === 0) continue
    const dates = new Set(slice.map((point) => point.date))
    const mean = (metric: Metric) =>
      average(
        history[metric]
          .filter((point) => dates.has(point.date))
          .map((point) => valueOf(point, person.uid))
          .filter((value): value is number => value !== null),
      )
    rows.push([
      { text: `${formatDayName(slice[0]?.date ?? '')} – ${formatDayName(slice.at(-1)?.date ?? '')}`, fill: INK },
      ...METRICS.map((metric) => ({ text: plain(mean(metric.key)) })),
    ])
  }
  if (rows.length === 0) return
  sheet.heading('Moyennes par semaine', 'par jour saisi')
  sheet.table(COLUMNS, rows)
}

function daily(sheet: Sheet, { person, today }: Source, history: Record<Metric, DayPoint[]>) {
  const goals = goalsOf(person)
  sheet.heading('Détail jour par jour', 'en orange : hors objectif')
  const rows = [...history.kcal].reverse().map((point) => [
    { text: `${formatDayName(point.date)}${point.date === today ? ' (en cours)' : ''}` },
    ...METRICS.map((metric) => {
      const value = valueOf(history[metric.key].find((item) => item.date === point.date) ?? point, person.uid)
      const off = value !== null && point.date !== today && gap(value, goals[metric.key], metric) > 0
      return { text: plain(value), fill: off ? ACCENT : value === null ? GRAY : INK, font: off ? ('bold' as const) : undefined }
    }),
  ])
  sheet.table([{ ...COLUMNS[0], label: 'Jour' } as Column, ...COLUMNS.slice(1)], rows)
}

export function statsPdf(source: Source): Blob {
  const sheet = new Sheet()
  const history = Object.fromEntries(METRICS.map((metric) => [metric.key, buildHistory(source.meals, source.days, metric.key)])) as Record<Metric, DayPoint[]>
  header(sheet, source)
  summary(sheet, source, history)
  balance(sheet, source, history)
  weeks(sheet, source, history)
  daily(sheet, source, history)
  const total = sheet.doc.pageCount
  const stamp = `Édité le ${longDate(source.today)} · Kalories`
  for (let page = 0; page < total; page += 1) {
    sheet.doc.line(MARGIN, 40, MARGIN + WIDTH, 40, RULE, 0.6, page)
    sheet.doc.text(MARGIN, 27, stamp, 'regular', 8.5, GRAY, page)
    const count = `${page + 1} / ${total}`
    sheet.doc.text(MARGIN + WIDTH - textWidth(count, 'regular', 8.5), 27, count, 'regular', 8.5, GRAY, page)
  }
  return sheet.doc.toBlob()
}

export const statsFileName = (name: string, today: string) =>
  `statistiques-${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}-${today}.pdf`
