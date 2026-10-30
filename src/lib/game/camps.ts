import type { Camp } from './types'

export const CAMPS: Record<Camp, { name: string; plural: string; emoji: string; pitch: string }> = {
  civil: {
    name: 'Civil',
    plural: 'Civils',
    emoji: '🧑‍🤝‍🧑',
    pitch: 'Tu partages le mot de la majorité. Trouve les intrus sans trop en dire.',
  },
  imposteur: {
    name: 'Imposteur',
    plural: 'Imposteurs',
    emoji: '🕵️',
    pitch: 'Ton mot est proche de celui des civils, mais pas le même. Fonds-toi dans la masse.',
  },
  touriste: {
    name: 'Touriste',
    plural: 'Touristes',
    emoji: '🧳',
    pitch: 'Tu débarques sans aucun mot. Écoute les autres, improvise et devine le mot des civils.',
  },
}
