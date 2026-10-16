export type Aisle = 'produce' | 'fresh' | 'nonfood' | 'grocery' | 'cleaning' | 'other'

export const AISLES: { id: Aisle; label: string }[] = [
  { id: 'produce', label: 'Fruits et légumes' },
  { id: 'fresh', label: 'Frais' },
  { id: 'nonfood', label: 'Non alimentaire' },
  { id: 'grocery', label: 'Épicerie' },
  { id: 'cleaning', label: 'Produits d’entretien' },
  { id: 'other', label: 'Autre' },
]

export function isAisle(value: unknown): value is Aisle {
  return AISLES.some((aisle) => aisle.id === value)
}
