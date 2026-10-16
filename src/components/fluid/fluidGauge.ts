import { arcLayout } from './arcGeometry'
import { addFluid, isReducedMotion, type FluidItem } from './loop'
import { FRAGMENT, VERTEX } from './shaders'

export type FluidShape = 'bar' | 'arc' | 'orb'

export interface FluidOptions {
  shape: FluidShape
  side: -1 | 1
  margin: number
  thickness: number
}

const SHAPE_ID: Record<FluidShape, number> = { bar: 0, arc: 1, orb: 2 }
const UNIFORMS = [
  'uRes', 'uTime', 'uFill', 'uSlosh', 'uOver', 'uColA', 'uColB', 'uColC', 'uColD',
  'uShape', 'uSide', 'uGeom', 'uDpr', 'uPress', 'uRipple', 'uMargin',
] as const
type UniformName = (typeof UNIFORMS)[number]

const MAX_DPR = 2
const STIFFNESS = 28
const DAMPING = 7.4
const SLOSH_DECAY = 1.5
const RIPPLE_DURATION = 0.7

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

export class FluidGauge implements FluidItem {
  private uniforms = new Map<UniformName, WebGLUniformLocation | null>()
  private colors: string[] = []
  private size = { width: 0, height: 0, dpr: 1 }
  private fill = 0
  private velocity = 0
  private target = 0
  private hasTarget = false
  private slosh = 0
  private over = 0
  private overTarget = 0
  private press = 0
  private pressTarget = 0
  private ripple = -1
  private dirty = true
  private lost = false
  private readonly detach: () => void
  private readonly canvas: HTMLCanvasElement
  private readonly gl: WebGLRenderingContext
  private readonly options: FluidOptions

  constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, options: FluidOptions) {
    this.canvas = canvas
    this.gl = gl
    this.options = options
    canvas.addEventListener('webglcontextlost', this.onLost)
    canvas.addEventListener('webglcontextrestored', this.onRestored)
    this.detach = addFluid(this)
  }

  init(): boolean {
    const { gl } = this
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return false
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    UNIFORMS.forEach((name) => this.uniforms.set(name, gl.getUniformLocation(program, name)))
    gl.uniform1f(this.u('uShape'), SHAPE_ID[this.options.shape])
    gl.uniform1f(this.u('uSide'), this.options.side)
    this.applyColors()
    this.applySize()
    return true
  }

  setTarget(fill: number, over: boolean) {
    if (!this.hasTarget) {
      this.slosh = 0.5
      this.hasTarget = true
    } else if (Math.abs(fill - this.target) > 0.0005) {
      this.slosh = Math.max(this.slosh, fill > this.target ? 1 : 0.6)
    }
    this.target = fill
    this.overTarget = over ? 1 : 0
    this.dirty = true
  }

  setColors(colors: string[]) {
    this.colors = colors
    this.applyColors()
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    this.size = { width, height, dpr }
    this.canvas.width = Math.max(1, Math.round(width * dpr))
    this.canvas.height = Math.max(1, Math.round(height * dpr))
    this.applySize()
  }

  setPressed(pressed: boolean) {
    this.pressTarget = pressed ? 1 : 0
  }

  startRipple() {
    this.ripple = 0
  }

  frame(time: number, dt: number) {
    if (this.lost || !this.size.width) return
    const reduced = isReducedMotion()
    if (reduced) this.settle()
    else this.step(dt)
    if (reduced && !this.dirty) return
    this.dirty = false
    this.draw(time)
  }

  dispose() {
    this.detach()
    this.canvas.removeEventListener('webglcontextlost', this.onLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored)
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  private step(dt: number) {
    for (let left = dt; left > 0; left -= 1 / 120) {
      const h = Math.min(left, 1 / 120)
      this.velocity += (STIFFNESS * (this.target - this.fill) - DAMPING * this.velocity) * h
      this.fill += this.velocity * h
    }
    this.slosh *= Math.exp(-dt * SLOSH_DECAY)
    this.over += (this.overTarget - this.over) * Math.min(1, dt * 3)
    this.press += (this.pressTarget - this.press) * Math.min(1, dt * 18)
    if (this.ripple >= 0) {
      this.ripple += dt / RIPPLE_DURATION
      if (this.ripple > 1) this.ripple = -1
    }
  }

  private settle() {
    this.fill = this.target
    this.velocity = 0
    this.slosh = 0
    this.over = this.overTarget
    this.press = 0
    this.ripple = -1
  }

  private draw(time: number) {
    const { gl } = this
    gl.uniform1f(this.u('uTime'), time)
    gl.uniform1f(this.u('uFill'), this.fill)
    gl.uniform1f(this.u('uSlosh'), this.slosh)
    gl.uniform1f(this.u('uOver'), this.over)
    gl.uniform1f(this.u('uPress'), this.press)
    gl.uniform1f(this.u('uRipple'), this.ripple)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  private applyColors() {
    const [a = '#000000', b = a, c = a, d = b] = this.colors
    ;(['uColA', 'uColB', 'uColC', 'uColD'] as const).forEach((name, i) => {
      this.gl.uniform3fv(this.u(name), hexToRgb([a, b, c, d][i] ?? a))
    })
    this.dirty = true
  }

  private applySize() {
    const { gl } = this
    const { width, height, dpr } = this.size
    if (!width || !height) return
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.uniform2f(this.u('uRes'), this.canvas.width, this.canvas.height)
    gl.uniform1f(this.u('uDpr'), dpr)
    gl.uniform1f(this.u('uMargin'), this.options.margin * dpr)
    gl.uniform4fv(this.u('uGeom'), this.geometry(dpr))
    this.dirty = true
  }

  private geometry(dpr: number): number[] {
    const { width, height } = this.size
    const { shape, margin, thickness, side } = this.options
    if (shape === 'bar') {
      const r = thickness / 2
      return [((width - 2 * margin) / 2 - r) * dpr, r * dpr, 0, 0]
    }
    if (shape === 'arc') {
      const { r, gap } = arcLayout(height - 2 * margin)
      return [r * dpr, (thickness / 2) * dpr, gap, -side * (width / 2 - margin) * dpr]
    }
    return [((Math.min(width, height) - 2 * margin) / 2) * dpr, 0, 0, 0]
  }

  private u(name: UniformName) {
    return this.uniforms.get(name) ?? null
  }

  private onLost = (event: Event) => {
    event.preventDefault()
    this.lost = true
  }

  private onRestored = () => {
    this.lost = !this.init()
  }
}

export function createFluidGauge(canvas: HTMLCanvasElement, options: FluidOptions): FluidGauge | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  })
  if (!gl) return null
  const gauge = new FluidGauge(canvas, gl, options)
  if (gauge.init()) return gauge
  gauge.dispose()
  return null
}
