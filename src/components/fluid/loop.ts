export interface FluidItem {
  frame(time: number, dt: number): void
}

const items = new Set<FluidItem>()
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
let raf = 0
let last = 0
let time = 7.3

function tick(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
  last = now
  if (!reducedQuery.matches) time += dt
  items.forEach((item) => item.frame(time, dt))
  raf = requestAnimationFrame(tick)
}

function start() {
  if (raf || items.size === 0 || document.hidden) return
  last = 0
  raf = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(raf)
  raf = 0
}

document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))

export function addFluid(item: FluidItem): () => void {
  items.add(item)
  start()
  return () => {
    items.delete(item)
    if (items.size === 0) stop()
  }
}

export function isReducedMotion(): boolean {
  return reducedQuery.matches
}
