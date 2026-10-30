import { readFileSync } from 'node:fs'

const file = new URL('../src/data/word_pairs.json', import.meta.url)
const { pairs } = JSON.parse(readFileSync(file, 'utf8'))
const CATEGORIES = [
  'Animaux', 'Fantastique', 'Médiéval', 'Cuisine', 'Sports', 'Métiers', 'Géographie', 'Technologie',
  'Cinéma et culture', 'Transports', 'Nature', 'Sciences', 'Vie quotidienne', 'Histoire', 'Espace',
  'Horreur et mystère', 'Économie et commerce', 'Loisirs', 'Corps et santé', 'Mythologies et légendes',
  'Univers marin', 'Écologie', 'École et éducation', 'Objets et inventions', 'Culture générale',
]
const DIFFICULTIES = ['facile', 'moyen', 'difficile']
const norm = (word) => word.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const errors = []
const warnings = []
const ids = new Set()
const seen = new Map()
const uses = new Map()

for (const pair of pairs) {
  const where = pair.id ?? JSON.stringify(pair)
  if (!pair.id || ids.has(pair.id)) errors.push(`${where} : identifiant manquant ou en double`)
  ids.add(pair.id)
  if (!pair.word_civil?.trim() || !pair.word_undercover?.trim()) errors.push(`${where} : mot vide`)
  if (!CATEGORIES.includes(pair.category)) errors.push(`${where} : catégorie inconnue « ${pair.category} »`)
  if (!DIFFICULTIES.includes(pair.difficulty)) errors.push(`${where} : difficulté invalide`)
  if (!Array.isArray(pair.tags) || pair.tags.length === 0) errors.push(`${where} : aucun tag`)
  if (!(pair.similarity >= 1 && pair.similarity <= 5)) errors.push(`${where} : similarité hors 1-5`)
  if (typeof pair.enabled !== 'boolean') errors.push(`${where} : enabled manquant`)
  const a = norm(pair.word_civil ?? '')
  const b = norm(pair.word_undercover ?? '')
  if (a === b) errors.push(`${where} : les deux mots sont identiques`)
  const key = [a, b].sort().join(' / ')
  if (seen.has(key)) errors.push(`${where} : doublon de ${seen.get(key)} (${key})`)
  seen.set(key, pair.id)
  for (const word of [a, b]) uses.set(word, [...(uses.get(word) ?? []), pair.id])
}
for (const [word, list] of uses) if (list.length > 1) warnings.push(`« ${word} » apparaît dans ${list.join(', ')}`)

const count = (key) => Object.entries(pairs.reduce((acc, pair) => ({ ...acc, [pair[key]]: (acc[pair[key]] ?? 0) + 1 }), {}))
console.log(`${pairs.length} paires`)
console.log(count('difficulty').map(([k, v]) => `${k} ${v}`).join(' · '))
console.log(count('category').map(([k, v]) => `${k} ${v}`).join(' · '))
warnings.forEach((warning) => console.log(`avertissement : ${warning}`))
errors.forEach((error) => console.error(`erreur : ${error}`))
process.exit(errors.length ? 1 : 0)
