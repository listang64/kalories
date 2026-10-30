import { powerById } from './powers'
import { shuffle } from './random'
import type { Camp, Player, Settings } from './types'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 20

export function defaultCounts(players: number): Record<Camp, number> {
  const touriste = players >= 13 ? 2 : players >= 5 ? 1 : 0
  const imposteur = players <= 6 ? 1 : players <= 9 ? 2 : players <= 12 ? 3 : players <= 16 ? 4 : 5
  return { civil: players - touriste - imposteur, imposteur, touriste }
}

export const powerSlots = (settings: Settings) =>
  settings.powers.reduce((sum, id) => sum + powerById(id).holders, 0)

export function setupError(settings: Settings): string | null {
  const { players, counts } = settings
  if (players < MIN_PLAYERS || players > MAX_PLAYERS) return `Il faut entre ${MIN_PLAYERS} et ${MAX_PLAYERS} joueurs.`
  const total = counts.civil + counts.imposteur + counts.touriste
  if (total !== players) return `Les rôles (${total}) doivent faire exactement ${players} joueurs.`
  if (counts.imposteur + counts.touriste < 1) return 'Il faut au moins un Imposteur ou un Touriste.'
  if (counts.civil < 2) return 'Il faut au moins 2 Civils.'
  if (counts.civil <= counts.imposteur) return 'Les Civils doivent être plus nombreux que les Imposteurs.'
  if (powerSlots(settings) > players) return 'Trop de rôles spéciaux pour ce nombre de joueurs.'
  if (settings.manual) {
    const civil = settings.manual.civil.trim().toLowerCase()
    const imposteur = settings.manual.imposteur.trim().toLowerCase()
    if (!civil || !imposteur) return 'Écris les deux mots de la paire.'
    if (civil === imposteur) return 'Les deux mots doivent être différents.'
  }
  return null
}

export function dealRoles(settings: Settings, names: string[]): Player[] {
  const camps = shuffle<Camp>([
    ...Array<Camp>(settings.counts.civil).fill('civil'),
    ...Array<Camp>(settings.counts.imposteur).fill('imposteur'),
    ...Array<Camp>(settings.counts.touriste).fill('touriste'),
  ])
  const players: Player[] = camps.map((camp, seat) => ({
    seat,
    name: names[seat] ?? '',
    camp,
    powers: [],
    alive: true,
    ghost: false,
    out: null,
  }))
  const pool = shuffle(players)
  for (const id of settings.powers) {
    for (let i = 0; i < powerById(id).holders; i++) pool.shift()?.powers.push(id)
  }
  return players
}
