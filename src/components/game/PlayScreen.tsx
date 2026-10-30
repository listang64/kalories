import type { Game } from '../../lib/game/types'
import { EliminationScreen } from './EliminationScreen'
import { EndScreen } from './EndScreen'
import { ResolveScreen } from './ResolveScreen'
import { RevealFlow } from './RevealFlow'
import { SummaryScreen } from './SummaryScreen'

export function PlayScreen({ game, onReplay, onBoard }: { game: Game; onReplay: () => void; onBoard: () => void }) {
  switch (game.phase) {
    case 'reveal':
      return <RevealFlow game={game} />
    case 'resolve':
      return <ResolveScreen game={game} />
    case 'summary':
      return <SummaryScreen game={game} />
    case 'end':
      return <EndScreen game={game} onReplay={onReplay} onBoard={onBoard} />
    default:
      return <EliminationScreen game={game} />
  }
}
