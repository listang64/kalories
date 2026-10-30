export const randomInt = (max: number) => Math.floor(Math.random() * max)

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    const swap = copy[i] as T
    copy[i] = copy[j] as T
    copy[j] = swap
  }
  return copy
}

export const pickOne = <T>(items: T[]): T | undefined => items[randomInt(items.length)]
