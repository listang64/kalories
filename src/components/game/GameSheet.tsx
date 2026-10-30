import { useState } from 'react'
import { createGame } from '../../lib/game/engine'
import { useGameStore } from '../../lib/game/store'
import { choosePair, loadPairs } from '../../lib/game/words'
import { BottomSheet } from '../BottomSheet'
import { BoardScreen } from './BoardScreen'
import { GameHome } from './GameHome'
import { GameHistory } from './HistoryScreen'
import { LibraryScreen } from './LibraryScreen'
import { PlayScreen } from './PlayScreen'
import { SetupScreen } from './SetupScreen'

export type GameView = 'home' | 'setup' | 'play' | 'board' | 'history' | 'library'

const TITLES: Record<GameView, string> = {
  home: 'Jeu de l’imposteur',
  setup: 'Nouvelle partie',
  play: 'Jeu de l’imposteur',
  board: 'Classement',
  history: 'Historique',
  library: 'Mots et réglages',
}

export function GameSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const game = useGameStore((s) => s.game)
  const initial: GameView = game && game.phase !== 'end' ? 'play' : 'home'
  const [view, setView] = useState<GameView>(initial)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setView(initial)
  }

  const replay = async () => {
    const { settings, recent, names, apply } = useGameStore.getState()
    const pair = choosePair(settings.manual ? [] : await loadPairs(), settings, recent)
    if (pair) apply(createGame(settings, pair, names))
  }

  return (
    <BottomSheet
      open={open}
      title={TITLES[view]}
      onClose={onClose}
      onBack={view === 'home' ? undefined : () => setView('home')}
    >
      {view === 'play' && game ? (
        <PlayScreen game={game} onReplay={() => void replay()} onBoard={() => setView('board')} />
      ) : view === 'setup' ? (
        <SetupScreen onStart={() => setView('play')} />
      ) : view === 'board' ? (
        <BoardScreen />
      ) : view === 'history' ? (
        <GameHistory />
      ) : view === 'library' ? (
        <LibraryScreen />
      ) : (
        <GameHome onOpen={setView} />
      )}
    </BottomSheet>
  )
}
