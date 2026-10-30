import { useEffect, useState } from 'react'
import { CAMPS } from '../../lib/game/camps'
import { nameTaken, revealDone } from '../../lib/game/engine'
import { powerById } from '../../lib/game/powers'
import { startRound } from '../../lib/game/rounds'
import { useGameStore } from '../../lib/game/store'
import type { Game } from '../../lib/game/types'
import { BigButton, Hero, Panel, Stage } from './ui'

type Step = 'pass' | 'confirm' | 'show' | 'done'

export function RevealFlow({ game }: { game: Game }) {
  const apply = useGameStore((s) => s.apply)
  const seat = game.revealed
  const player = game.players[seat]
  const [step, setStep] = useState<Step>('pass')
  const [name, setName] = useState(player?.name ?? '')

  useEffect(() => {
    const hide = () => document.hidden && setStep((current) => (current === 'show' ? 'confirm' : current))
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [])

  if (!player) {
    return (
      <Stage>
        <Hero emoji="🤫" title="Tout le monde connaît son rôle" text="Posez le téléphone au milieu : la première manche peut commencer." />
        <BigButton onClick={() => apply(startRound(game))}>Commencer la partie</BigButton>
      </Stage>
    )
  }

  const clean = name.trim()
  const taken = clean !== '' && nameTaken(game, seat, clean)

  if (step === 'done') {
    const next = game.players[seat + 1]
    return (
      <Stage key="done">
        <Hero emoji="🙈" title="Rôle caché" text={next ? 'Passe le téléphone au joueur suivant.' : 'C’était le dernier joueur.'} />
        <BigButton
          onClick={() => {
            setName(next?.name ?? '')
            setStep('pass')
            apply(revealDone(game, seat, clean))
          }}
        >
          {next ? 'Joueur suivant' : 'Continuer'}
        </BigButton>
      </Stage>
    )
  }

  if (step === 'show') return <RoleCard game={game} seat={seat} name={clean} onDone={() => setStep('done')} />

  if (step === 'confirm') {
    return (
      <Stage key="confirm">
        <Hero emoji="👀" title={`${clean}, personne ne regarde ?`} text="Ton rôle va s’afficher. Cache bien l’écran." />
        <BigButton onClick={() => setStep('show')}>Découvrir mon rôle</BigButton>
        <BigButton tone="soft" onClick={() => setStep('pass')}>
          Retour
        </BigButton>
      </Stage>
    )
  }

  return (
    <Stage key={`pass-${seat}`}>
      <Hero
        emoji="📱"
        title={player.name ? `Passe le téléphone à ${player.name}` : `Joueur ${seat + 1}, à toi !`}
        text={`${seat + 1} / ${game.players.length} · écris ton prénom pour découvrir ton rôle.`}
      />
      <input
        aria-label="Ton prénom"
        placeholder="Ton prénom"
        value={name}
        autoCapitalize="words"
        enterKeyHint="done"
        onChange={(e) => setName(e.target.value.slice(0, 16))}
        className="w-full rounded-card border border-line bg-surface-2 px-4 py-4 text-center text-[22px] font-semibold outline-none focus:border-white/25"
      />
      {taken && <p className="text-center text-[14px] text-accent">Ce prénom est déjà pris.</p>}
      <BigButton onClick={() => setStep('confirm')} disabled={!clean || taken}>
        Je suis prêt
      </BigButton>
    </Stage>
  )
}

function RoleCard({ game, seat, name, onDone }: { game: Game; seat: number; name: string; onDone: () => void }) {
  const player = game.players[seat]
  if (!player) return null
  const camp = CAMPS[player.camp]
  const word = player.camp === 'civil' ? game.pair.civil : player.camp === 'imposteur' ? game.pair.imposteur : null

  return (
    <Stage key="show">
      <Hero emoji={camp.emoji} title={`${name}, tu es ${camp.name.toUpperCase()}`} text={camp.pitch} />
      <Panel className="text-center">
        {word ? (
          <>
            <p className="label text-text-2">Ton mot secret</p>
            <p className="mt-2 text-[34px] leading-tight font-bold text-accent">{word}</p>
          </>
        ) : (
          <p className="text-[17px] leading-snug">Tu n’as aucun mot. Observe les autres et tente de deviner.</p>
        )}
      </Panel>
      {player.powers.map((id) => (
        <Panel key={id} className="flex items-start gap-3">
          <span className="text-[26px] leading-none">{powerById(id).emoji}</span>
          <p className="text-[15px] leading-snug">{powerById(id).secret}</p>
        </Panel>
      ))}
      <BigButton onClick={onDone}>J’ai mémorisé mon rôle</BigButton>
    </Stage>
  )
}
