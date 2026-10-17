import { useState } from 'react'
import { ActionSheet } from '../components/ActionSheet'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CorrectDialog } from '../components/day/CorrectDialog'
import { DayHeader } from '../components/day/DayHeader'
import { MealGroup } from '../components/day/MealGroup'
import { PlusIcon } from '../components/icons/PlusIcon'
import { MEAL_TYPES, type MealType } from '../config/meals'
import { useMeals } from '../hooks/useMeals'
import { useToday } from '../hooks/useToday'
import { deleteMeal, type Meal } from '../lib/meals'
import { mealTotals, sumTotals } from '../lib/nutrition'
import { goalsOf, type Profile } from '../lib/profiles'
import { useAppStore } from '../store/appStore'

interface Props {
  me: Profile
  people: Profile[]
}

export function DayDetailScreen({ me, people }: Props) {
  const today = useToday()
  const [date, setDate] = useState(today)
  const [viewedUid, setViewedUid] = useState(me.uid)
  const [selected, setSelected] = useState<Meal | null>(null)
  const [correcting, setCorrecting] = useState<Meal | null>(null)
  const [deleting, setDeleting] = useState<Meal | null>(null)
  const openAdd = useAppStore((s) => s.openAdd)
  const startEdit = useAppStore((s) => s.startEdit)
  const showToast = useAppStore((s) => s.showToast)
  const viewed = people.find((person) => person.uid === viewedUid) ?? me
  const goal = goalsOf(viewed).kcal
  const meals = useMeals([viewed.uid], date)
  const totals = sumTotals(meals.map((meal) => mealTotals(meal.items)))
  const own = viewed.uid === me.uid

  const progressWithout = (meal?: Meal) => ({
    kcal: totals.kcal - (meal ? mealTotals(meal.items).kcal : 0),
    goal,
  })
  const add = (type?: MealType) => openAdd(type, { date, progress: progressWithout() })
  const remove = (meal: Meal) => {
    setDeleting(null)
    deleteMeal(meal).catch(() => showToast('Suppression impossible'))
  }

  return (
    <div className="flex h-full flex-col">
      <DayHeader
        people={people}
        viewed={viewed.uid}
        onViewed={setViewedUid}
        date={date}
        today={today}
        onDate={setDate}
        totals={totals}
        goal={goal}
      />
      <div className="-mx-5 mt-5 min-h-0 flex-1 overflow-y-auto px-5 pb-3">
        {meals.length === 0 ? (
          <p className="pt-10 text-center text-[15px] text-text-2">Aucun repas enregistré ce jour-là.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {MEAL_TYPES.map(({ value }) => {
              const group = meals.filter((meal) => meal.type === value)
              if (group.length === 0) return null
              return (
                <MealGroup
                  key={value}
                  type={value}
                  meals={group}
                  onAdd={own ? () => add(value) : undefined}
                  onActions={setSelected}
                />
              )
            })}
          </div>
        )}
      </div>
      {own && (
        <button
          type="button"
          onClick={() => add()}
          className="press mt-3 flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-accent text-[17px] font-semibold text-black shadow-accent"
        >
          <PlusIcon size={22} strokeWidth={2} />
          Ajouter
        </button>
      )}
      <ActionSheet
        open={selected !== null}
        title={selected ? selected.items.map((item) => item.name).join(', ') : ''}
        onClose={() => setSelected(null)}
        actions={[
          { label: 'Modifier', onSelect: () => selected && startEdit(selected, progressWithout(selected)) },
          { label: 'Corriger avec l’IA', onSelect: () => setCorrecting(selected) },
          { label: 'Supprimer', tone: 'danger', onSelect: () => setDeleting(selected) },
        ]}
      />
      <CorrectDialog
        meal={correcting}
        onClose={() => setCorrecting(null)}
        onCorrected={(meal, items) => {
          setCorrecting(null)
          startEdit(meal, progressWithout(meal), items)
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce repas ?"
        message={people.length > 1 ? 'Il disparaîtra aussi du téléphone de l’autre.' : 'Il sera supprimé définitivement.'}
        confirmLabel="Supprimer"
        cancelLabel="Garder"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
    </div>
  )
}
