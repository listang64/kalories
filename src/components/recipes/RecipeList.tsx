import { useRef, useState, type ChangeEvent } from 'react'
import { RECIPE_CATEGORIES, type RecipeCategory } from '../../config/recipes'
import { fileToJpeg } from '../../lib/image'
import type { Recipe } from '../../lib/recipes'
import { useAppStore } from '../../store/appStore'
import { CameraIcon } from '../icons/CameraIcon'
import { ChefHatIcon } from '../icons/ChefHatIcon'
import { PlusIcon } from '../icons/PlusIcon'
import { SearchIcon } from '../icons/SearchIcon'
import { RecipeRow } from './RecipeRow'

interface Props {
  recipes: Recipe[]
  loaded: boolean
  partner: string | null
  onOpen: (id: string) => void
  uid: string
  onNew: () => void
  onPhoto: (src: string) => void
  onFavorite: (recipe: Recipe) => void
}

type Filter = RecipeCategory | 'all' | 'favorites'

const CHIP = 'press flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[14px] transition-colors'

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')

function matches(recipe: Recipe, search: string): boolean {
  const haystack = fold([recipe.name, ...recipe.ingredients.map((ingredient) => ingredient.name)].join(' '))
  return fold(search)
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}

export function RecipeList({ recipes, loaded, partner, uid, onOpen, onNew, onPhoto, onFavorite }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const cameraRef = useRef<HTMLInputElement>(null)
  const isFavorite = (recipe: Recipe) => recipe.favoriteOf.includes(uid)
  const found = recipes.filter((recipe) => matches(recipe, search))
  const shown = filter === 'favorites' ? found.filter(isFavorite) : found
  const grouped = filter === 'all' || filter === 'favorites'
  const groups = RECIPE_CATEGORIES.filter((category) => grouped || category.value === filter)
    .map((category) => ({ ...category, recipes: shown.filter((recipe) => recipe.category === category.value) }))
    .filter((group) => group.recipes.length > 0)
  const shoot = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      onPhoto(await fileToJpeg(file))
    } catch {
      useAppStore.getState().showToast('Photo illisible')
    }
  }

  const chips: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'Tout', count: found.length },
    { value: 'favorites', label: '♥ Favoris', count: found.filter(isFavorite).length },
    ...RECIPE_CATEGORIES.map((category) => ({
      value: category.value,
      label: category.plural,
      count: found.filter((recipe) => recipe.category === category.value).length,
    })),
  ]

  return (
    <div className="flex h-full flex-col">
      {recipes.length > 0 && (
        <>
          <label className="flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-surface-2 px-4 focus-within:border-white/20">
            <span className="text-text-2">
              <SearchIcon size={18} />
            </span>
            <input
              aria-label="Rechercher une recette"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une recette"
              enterKeyHint="search"
              className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-2"
            />
          </label>
          <div className="-mx-5 mt-3 flex shrink-0 gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
            {chips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                aria-pressed={filter === chip.value}
                onClick={() => setFilter(chip.value)}
                className={`${CHIP} ${filter === chip.value ? 'border-accent bg-accent/12 text-text' : 'border-line bg-surface-2 text-text-2'}`}
              >
                {chip.label}
                <span className={`tabular-nums ${filter === chip.value ? 'text-accent' : ''}`}>{chip.count}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="-mx-5 mt-4 min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {recipes.length === 0 ? (
          loaded && (
            <div className="flex flex-col items-center gap-3 pt-14 text-center">
              <span className="text-text-2">
                <ChefHatIcon size={40} />
              </span>
              <p className="text-[17px] font-semibold">Aucune recette pour l’instant</p>
              <p className="max-w-72 text-[15px] text-text-2">
                {partner ? `Note vos recettes, ${partner} les verra aussitôt.` : 'Note tes recettes préférées.'} Ou
                touche « Photo » et prends une page de livre : l’IA remplit tout.
              </p>
            </div>
          )
        ) : groups.length === 0 ? (
          <p className="pt-10 text-center text-[15px] text-text-2">
            {filter === 'favorites' && !search.trim()
              ? 'Aucun favori : touche le cœur d’une recette pour l’ajouter.'
              : 'Aucune recette ne correspond.'}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <section key={group.value}>
                {grouped && <h3 className="label mb-2 px-1">{group.plural}</h3>}
                <ul className="flex flex-col gap-2">
                  {group.recipes.map((recipe) => (
                    <RecipeRow
                      key={recipe.id}
                      recipe={recipe}
                      favorite={isFavorite(recipe)}
                      onOpen={() => onOpen(recipe.id)}
                      onFavorite={() => onFavorite(recipe)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
      <div className="grid shrink-0 grid-cols-[auto_1fr] gap-2.5 pt-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="press flex h-14 items-center gap-2 rounded-full bg-white/8 px-5 text-[15px] font-semibold whitespace-nowrap text-accent max-[359px]:px-4"
        >
          <CameraIcon size={20} />
          Photo
        </button>
        <button
          type="button"
          onClick={onNew}
          className="press flex h-14 items-center justify-center gap-1.5 rounded-full bg-accent text-[16px] font-semibold whitespace-nowrap text-black shadow-accent max-[359px]:text-[15px]"
        >
          <PlusIcon size={20} strokeWidth={2} />
          Nouvelle recette
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label="Photo d’une recette"
        onChange={(e) => void shoot(e)}
      />
    </div>
  )
}
