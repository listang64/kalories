import { useState } from 'react'
import { useGameStore } from '../../lib/game/store'
import { ConfirmDialog } from '../ConfirmDialog'
import type { GameView } from './GameSheet'
import { BigButton, Hero, Stage } from './ui'

export function GameHome({ onOpen }: { onOpen: (view: GameView) => void }) {
  const game = useGameStore((s) => s.game)
  const abandon = useGameStore((s) => s.abandon)
  const [confirm, setConfirm] = useState(false)
  const running = game !== null && game.phase !== 'end'

  return (
    <Stage>
      <Hero
        emoji="🕵️"
        title="Jeu de l’imposteur"
        text="Un seul téléphone, des mots secrets presque identiques… et des intrus à démasquer."
      />
      {running && <BigButton onClick={() => onOpen('play')}>Reprendre la partie · manche {Math.max(1, game.round)}</BigButton>}
      <BigButton tone={running ? 'soft' : 'accent'} onClick={() => (running ? setConfirm(true) : onOpen('setup'))}>
        Nouvelle partie
      </BigButton>
      <BigButton tone="soft" onClick={() => onOpen('board')}>
        🏆 Classement
      </BigButton>
      <BigButton tone="soft" onClick={() => onOpen('history')}>
        📚 Historique des parties
      </BigButton>
      <BigButton tone="soft" onClick={() => onOpen('library')}>
        ⚙️ Mots et réglages
      </BigButton>
      <Rules />
      <ConfirmDialog
        open={confirm}
        title="Abandonner la partie ?"
        message="La partie en cours sera perdue et ne comptera pas au classement."
        confirmLabel="Abandonner"
        cancelLabel="Garder"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          abandon()
          setConfirm(false)
          onOpen('setup')
        }}
      />
    </Stage>
  )
}

function Rules() {
  return (
    <details className="rounded-card border border-line bg-surface-2 p-4 text-[14px] leading-relaxed text-text-2">
      <summary className="cursor-pointer text-[16px] font-semibold text-text">Comment on joue ?</summary>
      <p className="mt-2">🧑‍🤝‍🧑 Les Civils partagent le même mot. Ils gagnent en éliminant tous les intrus.</p>
      <p className="mt-1">🕵️ Les Imposteurs ont un mot proche. Ils gagnent quand ils sont autant que les Civils.</p>
      <p className="mt-1">🧳 Le Touriste n’a aucun mot. Éliminé, il peut gagner seul en devinant le mot des Civils.</p>
      <p className="mt-1">À chaque manche : un indice chacun, un débat, puis un vote secret pour éliminer un joueur.</p>
    </details>
  )
}
