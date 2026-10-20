import { categoryLabel } from '../config/recipes'
import { formatInt } from './format'
import { A4, PdfDocument, textWidth, wrapText, type PdfFont, type Rgb } from './pdf'
import { formatMinutes, groupItems, type Ingredient, type RecipeInput } from './recipes'

const MARGIN = 56
const BOTTOM = 64
const WIDTH = A4.width - MARGIN * 2
const INK: Rgb = [26, 26, 26]
const GRAY: Rgb = [110, 110, 115]
const RULE: Rgb = [228, 228, 230]
const ACCENT: Rgb = [232, 104, 18]
const TINT: Rgb = [255, 241, 230]

class Layout {
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

  lines(text: string, x: number, width: number, font: PdfFont, size: number, fill: Rgb, leading = size * 1.35) {
    for (const line of wrapText(text, font, size, width)) {
      this.room(leading)
      this.y -= leading
      this.doc.text(x, this.y + leading - size, line, font, size, fill)
    }
  }

  heading(title: string, aside = '') {
    this.room(44)
    this.y -= 22
    this.doc.text(MARGIN, this.y, title.toUpperCase(), 'bold', 11, ACCENT)
    if (aside) this.doc.text(MARGIN + WIDTH - textWidth(aside, 'regular', 10), this.y, aside, 'regular', 10, GRAY)
    this.y -= 8
    this.doc.line(MARGIN, this.y, MARGIN + WIDTH, this.y, ACCENT, 1)
    this.y -= 4
  }

  subheading(title: string) {
    if (!title) return
    this.room(48)
    this.y -= 22
    this.doc.text(MARGIN, this.y, title, 'bold', 12.5, INK)
    this.y -= 2
  }
}

function details(recipe: RecipeInput): string {
  return [
    recipe.prepMinutes && `Préparation ${formatMinutes(recipe.prepMinutes)}`,
    recipe.cookMinutes && `Cuisson ${formatMinutes(recipe.cookMinutes)}`,
    recipe.servings && `${recipe.servings} personne${recipe.servings > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join('   ·   ')
}

function nutrition(layout: Layout, recipe: RecipeInput) {
  const values = recipe.nutrition
  if (!values) return
  const portion = recipe.servings ? values.grams / recipe.servings : null
  const macros = [
    `Glucides ${formatInt(values.carbs100)} g`,
    `Lipides ${formatInt(values.fat100)} g`,
    `Protéines ${formatInt(values.protein100)} g`,
  ].join('   ·   ')
  const part = portion
    ? `Une part d’environ ${formatInt(portion)} g : ${formatInt((portion * values.kcal100) / 100)} kcal`
    : `Le plat entier pèse environ ${formatInt(values.grams)} g`
  layout.room(84)
  layout.y -= 16
  layout.doc.rect(MARGIN, layout.y - 66, WIDTH, 66, TINT)
  layout.doc.text(MARGIN + 14, layout.y - 24, `${formatInt(values.kcal100)} kcal / 100 g`, 'bold', 16, ACCENT)
  layout.doc.text(MARGIN + 14, layout.y - 42, macros, 'regular', 10.5, INK)
  layout.doc.text(MARGIN + 14, layout.y - 57, part, 'regular', 10.5, GRAY)
  layout.y -= 66
}

function ingredientRow(layout: Layout, { name, quantity }: Ingredient) {
  const quantityWidth = quantity ? textWidth(quantity, 'bold', 11.5) : 0
  const rows = wrapText(name, 'regular', 11.5, WIDTH - 24 - quantityWidth)
  layout.room(rows.length * 15 + 7)
  layout.y -= 4
  const top = layout.y
  layout.doc.text(MARGIN + 2, top - 12, '•', 'bold', 12, ACCENT)
  rows.forEach((row, i) => layout.doc.text(MARGIN + 16, top - 12 - i * 15, row, 'regular', 11.5, INK))
  if (quantity) layout.doc.text(MARGIN + WIDTH - quantityWidth, top - 12, quantity, 'bold', 11.5, INK)
  layout.y = top - rows.length * 15 - 3
  layout.doc.line(MARGIN + 16, layout.y, MARGIN + WIDTH, layout.y, RULE, 0.6)
}

function ingredients(layout: Layout, recipe: RecipeInput) {
  if (recipe.ingredients.length === 0) return
  layout.heading('Ingrédients', recipe.servings ? `pour ${recipe.servings} pers.` : '')
  for (const group of groupItems(recipe.ingredients)) {
    layout.subheading(group.title)
    group.items.forEach((ingredient) => ingredientRow(layout, ingredient))
  }
}

function steps(layout: Layout, recipe: RecipeInput) {
  if (recipe.steps.length === 0) return
  layout.heading('Préparation', `${recipe.steps.length} étape${recipe.steps.length > 1 ? 's' : ''}`)
  let number = 0
  for (const group of groupItems(recipe.steps)) {
    layout.subheading(group.title)
    for (const step of group.items) {
      number += 1
      layout.room(26)
      layout.y -= 7
      layout.doc.text(MARGIN, layout.y - 11.5, `${number}.`, 'bold', 12, ACCENT)
      layout.lines(step.text, MARGIN + 24, WIDTH - 24, 'regular', 11.5, INK, 16)
    }
  }
}

function cooking(layout: Layout, recipe: RecipeInput) {
  const rows = [
    recipe.cookTemp ? ['Température', `${formatInt(recipe.cookTemp)} °C`] : null,
    recipe.cookMinutes ? ['Durée', formatMinutes(recipe.cookMinutes)] : null,
    recipe.cookNote ? ['Mode', recipe.cookNote] : null,
  ].filter((row): row is string[] => row !== null)
  if (rows.length === 0) return
  layout.heading('Cuisson')
  for (const [label = '', value = ''] of rows) {
    layout.room(19)
    layout.y -= 17
    layout.doc.text(MARGIN, layout.y + 4, label, 'regular', 11.5, GRAY)
    layout.doc.text(MARGIN + 110, layout.y + 4, value, 'bold', 11.5, INK)
  }
}

export function recipePdf(recipe: RecipeInput, author: string): Blob {
  const layout = new Layout()
  layout.doc.text(MARGIN, layout.y - 10, categoryLabel(recipe.category).toUpperCase(), 'bold', 10, ACCENT)
  layout.y -= 18
  layout.lines(recipe.name, MARGIN, WIDTH, 'bold', 24, INK, 29)
  const meta = details(recipe)
  if (meta) {
    layout.y -= 6
    layout.lines(meta, MARGIN, WIDTH, 'regular', 11, GRAY)
  }
  nutrition(layout, recipe)
  ingredients(layout, recipe)
  steps(layout, recipe)
  cooking(layout, recipe)
  const total = layout.doc.pageCount
  for (let page = 0; page < total; page += 1) {
    const footer = author ? `Recette de ${author} · Kalories` : 'Recette Kalories'
    layout.doc.line(MARGIN, 44, MARGIN + WIDTH, 44, RULE, 0.6, page)
    layout.doc.text(MARGIN, 30, footer, 'regular', 9, GRAY, page)
    const count = `${page + 1} / ${total}`
    layout.doc.text(MARGIN + WIDTH - textWidth(count, 'regular', 9), 30, count, 'regular', 9, GRAY, page)
  }
  return layout.doc.toBlob()
}

export function recipeFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'recette'}.pdf`
}
