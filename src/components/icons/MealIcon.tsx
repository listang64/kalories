import type { MealType } from '../../config/meals'
import { Icon } from './Icon'

const PATHS: Record<MealType, string[]> = {
  breakfast: [
    'M10 2v2',
    'M14 2v2',
    'M6 2v2',
    'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1',
  ],
  lunch: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
  ],
  dinner: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  snack: [
    'M12 6.528V3a1 1 0 0 1 1-1',
    'M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21',
  ],
}

export function MealIcon({ type, size = 28 }: { type: MealType; size?: number }) {
  return (
    <Icon size={size}>
      {PATHS[type].map((d) => (
        <path key={d} d={d} />
      ))}
    </Icon>
  )
}
