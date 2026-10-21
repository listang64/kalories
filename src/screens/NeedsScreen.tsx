import { BodyFields } from '../components/needs/BodyFields'
import { DayFields } from '../components/needs/DayFields'
import { EnergyCard } from '../components/needs/EnergyCard'
import { GoalPicker } from '../components/needs/GoalPicker'
import { PlanCard } from '../components/needs/PlanCard'
import { SportList } from '../components/needs/SportList'
import { missingFields, needsInput, useNeedsForm } from '../hooks/useNeedsForm'
import { energyOf, paceFor, planFor, sessionKcal } from '../lib/needs'
import type { Profile } from '../lib/profiles'

export function NeedsScreen({ me }: { me: Profile }) {
  const [form, update] = useNeedsForm(me.uid)
  const input = needsInput(form)
  const energy = input && energyOf(input)
  const pace = paceFor(form.direction, form.pace)

  return (
    <div className="flex flex-col gap-7 pt-1">
      <p className="px-1 text-[15px] leading-snug text-text-2">
        {me.needsSet
          ? 'Calcul détaillé de ta dépense : métabolisme, journée, pas et sport.'
          : 'Commence par calculer tes besoins : ton objectif du jour sera réglé sur toi.'}{' '}
        Tes mesures restent sur ce téléphone.
      </p>
      <BodyFields form={form} onChange={update} />
      <DayFields form={form} onChange={update} />
      <SportList
        sports={form.sports}
        estimate={input && energy ? (session) => sessionKcal(session, input.body.weight, energy.bmr) : null}
        onChange={(sports) => update({ sports })}
      />
      {input && energy ? (
        <>
          <EnergyCard energy={energy} />
          <GoalPicker energy={energy} body={input.body} direction={form.direction} pace={pace} onChange={update} />
          <PlanCard
            me={me}
            plan={planFor(energy, input.body, form.direction, pace)}
            sex={input.body.sex}
            direction={form.direction}
          />
        </>
      ) : (
        <p
          role="status"
          className="rounded-card border border-dashed border-white/15 px-4 py-5 text-center text-[15px] leading-snug text-text-2"
        >
          Pour voir ta dépense et tes objectifs, il manque : {missingFields(form).join(', ')}.
        </p>
      )}
    </div>
  )
}
