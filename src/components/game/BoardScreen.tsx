import { useState } from 'react'
import { useGameStore } from '../../lib/game/store'
import { ConfirmDialog } from '../ConfirmDialog'
import { BigButton, Hero, Panel, Stage } from './ui'

export function BoardScreen() {
  const board = useGameStore((s) => s.board)
  const resetBoard = useGameStore((s) => s.resetBoard)
  const [confirm, setConfirm] = useState(false)

  if (board.length === 0) {
    return (
      <Stage>
        <Hero emoji="🏆" title="Aucune partie jouée" text="Le classement se remplit à la fin de chaque partie et s’efface quand l’app est fermée." />
      </Stage>
    )
  }

  return (
    <Stage>
      <Panel className="overflow-x-auto p-0">
        <table className="w-full text-[14px] tabular-nums">
          <thead className="text-[12px] text-text-2">
            <tr className="[&>th]:px-2 [&>th]:py-2.5 [&>th]:font-medium">
              <th className="pl-4 text-left">Joueur</th>
              <th>Parties</th>
              <th>V</th>
              <th>D</th>
              <th>%</th>
              <th className="pr-4 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {board.map((entry, index) => (
              <tr key={entry.name} className="border-t border-white/6 text-center [&>td]:px-2 [&>td]:py-2.5">
                <td className="pl-4 text-left font-semibold whitespace-nowrap">
                  {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}
                  {entry.name}
                </td>
                <td>{entry.games}</td>
                <td>{entry.wins}</td>
                <td>{entry.games - entry.wins}</td>
                <td>{Math.round((entry.wins / entry.games) * 100)}</td>
                <td className="pr-4 text-right text-[16px] font-semibold text-accent">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <p className="text-center text-[13px] text-text-2">V victoires · D défaites · % taux de victoire</p>
      <BigButton tone="danger" onClick={() => setConfirm(true)}>
        Réinitialiser le classement
      </BigButton>
      <ConfirmDialog
        open={confirm}
        title="Réinitialiser ?"
        message="Le classement et l’historique des parties seront effacés."
        confirmLabel="Effacer"
        cancelLabel="Annuler"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          resetBoard()
          setConfirm(false)
        }}
      />
    </Stage>
  )
}
