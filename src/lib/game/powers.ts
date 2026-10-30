import { pickOne } from './random'
import type { Cause, Game, Pending, Player, PowerId } from './types'

export interface PowerContext {
  game: Game
  eliminate: (seat: number, cause: Cause) => void
  enqueue: (pending: Pending) => void
  bonus: (seat: number, points: number) => void
  log: (text: string) => void
}

export interface Power {
  id: PowerId
  name: string
  emoji: string
  rule: string
  secret: string
  holders: 0 | 1 | 2
  onRoundStart?: (game: Game) => void
  onEliminated?: (ctx: PowerContext, player: Player, cause: Cause) => void
  onDesignate?: (ctx: PowerContext, target: Player) => boolean
}

const holders = (game: Game, id: PowerId) => game.players.filter((player) => player.powers.includes(id))
const partnerOf = (game: Game, player: Player, id: PowerId) => holders(game, id).find((other) => other.seat !== player.seat)

const juge: Power = {
  id: 'juge',
  name: 'Le Juge Marteau',
  emoji: '⚖️',
  rule: 'Si le groupe n’arrive pas à se décider, c’est lui qui tranche. Même éliminé, il garde son marteau.',
  secret: 'Tu es aussi le Juge Marteau : si le groupe hésite entre plusieurs joueurs, c’est toi qui tranches.',
  holders: 1,
}

const tourtereaux: Power = {
  id: 'tourtereaux',
  name: 'Les Tourtereaux',
  emoji: '💘',
  rule: 'Deux joueurs liés en secret, peu importe leur camp : si l’un tombe, l’autre le suit.',
  secret: 'Tu es aussi un Tourtereau : quelqu’un t’aime en secret. Si l’un de vous tombe, l’autre le suit.',
  holders: 2,
  onEliminated: (ctx, player) => {
    if (!player.powers.includes('tourtereaux')) return
    const partner = partnerOf(ctx.game, player, 'tourtereaux')
    if (!partner?.alive) return
    ctx.log(`💘 ${partner.name} ne supporte pas l’absence de ${player.name} et part avec.`)
    ctx.eliminate(partner.seat, 'amour')
  },
}

const mime: Power = {
  id: 'mime',
  name: 'Le Mime Marcel',
  emoji: '🤐',
  rule: 'À chaque manche, l’app désigne un joueur différent qui doit donner son indice en mimant.',
  secret: '',
  holders: 0,
  onRoundStart: (game) => {
    const alive = game.players.filter((player) => player.alive).map((player) => player.seat)
    const fresh = alive.filter((seat) => !game.mimed.includes(seat))
    const chosen = pickOne(fresh.length ? fresh : alive) ?? null
    game.mime = chosen
    if (chosen !== null) game.mimed = fresh.length ? [...game.mimed, chosen] : [chosen]
  },
}

const rancuniere: Power = {
  id: 'rancuniere',
  name: 'La Rancunière',
  emoji: '😤',
  rule: 'Quand elle est éliminée, elle emmène un joueur de son choix avec elle.',
  secret: 'Tu es aussi la Rancunière : si tu es éliminé, tu choisis quelqu’un qui part avec toi.',
  holders: 1,
  onEliminated: (ctx, player) => {
    if (!player.powers.includes('rancuniere')) return
    if (ctx.game.players.some((other) => other.alive)) ctx.enqueue({ kind: 'revenge', seat: player.seat })
  },
}

const rivaux: Power = {
  id: 'rivaux',
  name: 'Les Ennemis jurés',
  emoji: '⚔️',
  rule: 'Deux rivaux secrets : le premier des deux éliminé perd des points, l’autre en gagne.',
  secret: 'Tu as aussi un ennemi juré caché parmi vous : si tu tombes avant lui, tu perds des points.',
  holders: 2,
  onEliminated: (ctx, player) => {
    if (!player.powers.includes('rivaux') || ctx.game.flags.duelDone) return
    const rival = partnerOf(ctx.game, player, 'rivaux')
    if (!rival) return
    ctx.game.flags.duelDone = true
    const points = ctx.game.settings.rewards.duel
    ctx.bonus(player.seat, -points)
    ctx.bonus(rival.seat, points)
    ctx.log(`⚔️ ${player.name} tombe avant son ennemi juré ${rival.name}.`)
  },
}

const revenant: Power = {
  id: 'revenant',
  name: 'Le Revenant',
  emoji: '👻',
  rule: 'Une fois éliminé, il continue de débattre et de donner son avis depuis l’au-delà.',
  secret: 'Tu es aussi le Revenant : même éliminé, tu continueras à débattre avec le groupe.',
  holders: 1,
  onEliminated: (ctx, player) => {
    if (!player.powers.includes('revenant')) return
    player.ghost = true
    ctx.log(`👻 ${player.name} revient en Revenant : il continue de débattre.`)
  },
}

const boomerang: Power = {
  id: 'boomerang',
  name: 'Le Retour à l’envoyeur',
  emoji: '🪃',
  rule: 'La première fois que le groupe veut l’éliminer, ça rebondit : il est épargné et ses accusateurs doivent désigner quelqu’un d’autre.',
  secret: 'Tu es aussi le Retour à l’envoyeur : la première fois que le groupe veut t’éliminer, tu es épargné.',
  holders: 1,
  onDesignate: (ctx, target) => {
    if (ctx.game.flags.boomerangUsed || !target.powers.includes('boomerang')) return false
    ctx.game.flags.boomerangUsed = true
    ctx.log(`🪃 Retour à l’envoyeur ! ${target.name} est épargné : ses accusateurs doivent désigner quelqu’un d’autre.`)
    return true
  },
}

const bouffon: Power = {
  id: 'bouffon',
  name: 'Le Bouffon',
  emoji: '🤡',
  rule: 'S’il est le tout premier éliminé par le groupe, il rit le dernier et gagne des points bonus.',
  secret: 'Tu es aussi le Bouffon : si tu es le premier éliminé par le groupe, tu gagnes des points bonus.',
  holders: 1,
  onEliminated: (ctx, player, cause) => {
    if (!player.powers.includes('bouffon') || ctx.game.flags.firstVoteOut) return
    if (cause !== 'vote' && cause !== 'juge') return
    ctx.bonus(player.seat, ctx.game.settings.rewards.bouffon)
    ctx.log(`🤡 ${player.name} était le Bouffon : premier éliminé, il empoche ses points bonus !`)
  },
}

export const POWERS: Power[] = [juge, tourtereaux, mime, rancuniere, rivaux, revenant, boomerang, bouffon]

export const powerById = (id: PowerId) => POWERS.find((power) => power.id === id) as Power

export const activePowers = (game: Game) => POWERS.filter((power) => game.settings.powers.includes(power.id))
