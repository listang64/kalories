import type { Game } from '../../lib/game/types'
import { DescribeScreen } from './DescribeScreen'
import { DiscussScreen } from './DiscussScreen'
import { EndScreen } from './EndScreen'
import { ResolveScreen } from './ResolveScreen'
import { RevealFlow } from './RevealFlow'
import { SummaryScreen } from './SummaryScreen'
import { TieScreen } from './TieScreen'
import { VoteScreen } from './VoteScreen'

export function PlayScreen({ game, onReplay, onBoard }: { game: Game; onReplay: () => void; onBoard: () => void }) {
  switch (game.phase) {
    case 'reveal':
      return <RevealFlow game={game} />
    case 'describe':
      return <DescribeScreen game={game} />
    case 'discuss':
      return <DiscussScreen key={game.round} game={game} />
    case 'vote':
      return <VoteScreen key={`${game.round}-${game.vote?.attempt}`} game={game} />
    case 'tie':
      return <TieScreen game={game} />
    case 'resolve':
      return <ResolveScreen game={game} />
    case 'summary':
      return <SummaryScreen game={game} />
    case 'end':
      return <EndScreen game={game} onReplay={onReplay} onBoard={onBoard} />
  }
}
