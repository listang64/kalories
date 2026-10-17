const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]
const BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]
const MAX_VERSION = 10
const FINDER_LIKE = ['10111010000', '00001011101']

type Matrix = boolean[][]

function bit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0
}

function rawModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2
    result -= (25 * align - 10) * align - 55
    if (version >= 7) result -= 36
  }
  return result
}

function dataCodewords(version: number): number {
  return Math.floor(rawModules(version) / 8) - (ECC_PER_BLOCK[version] ?? 0) * (BLOCKS[version] ?? 0)
}

function multiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z
}

function divisor(degree: number): number[] {
  const result = Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = multiply(result[j] ?? 0, root) ^ (result[j + 1] ?? 0)
    }
    root = multiply(root, 2)
  }
  return result
}

function remainder(data: number[], div: number[]): number[] {
  const result = div.map(() => 0)
  for (const byte of data) {
    const factor = byte ^ (result.shift() ?? 0)
    result.push(0)
    div.forEach((coef, i) => (result[i] = (result[i] ?? 0) ^ multiply(coef, factor)))
  }
  return result
}

function encodeData(bytes: Uint8Array): { version: number; codewords: number[] } {
  const version = Array.from({ length: MAX_VERSION }, (_, i) => i + 1).find(
    (v) => 4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= dataCodewords(v) * 8,
  )
  if (!version) throw new Error('Texte trop long pour un QR code')
  const bits: number[] = []
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  push(0b0100, 4)
  push(bytes.length, version < 10 ? 8 : 16)
  bytes.forEach((byte) => push(byte, 8))
  const capacity = dataCodewords(version) * 8
  push(0, Math.min(4, capacity - bits.length))
  push(0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8)
  const codewords = Array.from({ length: bits.length / 8 }, (_, i) =>
    bits.slice(i * 8, i * 8 + 8).reduce((byte, b) => (byte << 1) | b, 0),
  )
  return { version, codewords }
}

function interleave(data: number[], version: number): number[] {
  const blocks = BLOCKS[version] ?? 1
  const eccLength = ECC_PER_BLOCK[version] ?? 0
  const raw = Math.floor(rawModules(version) / 8)
  const shortBlocks = blocks - (raw % blocks)
  const shortLength = Math.floor(raw / blocks)
  const div = divisor(eccLength)
  const parts: number[][] = []
  for (let i = 0, k = 0; i < blocks; i++) {
    const chunk = data.slice(k, k + shortLength - eccLength + (i < shortBlocks ? 0 : 1))
    k += chunk.length
    const ecc = remainder(chunk, div)
    if (i < shortBlocks) chunk.push(0)
    parts.push(chunk.concat(ecc))
  }
  const result: number[] = []
  for (let i = 0; i < (parts[0]?.length ?? 0); i++) {
    parts.forEach((part, j) => {
      if (i !== shortLength - eccLength || j >= shortBlocks) result.push(part[i] ?? 0)
    })
  }
  return result
}

function alignmentPositions(version: number, size: number): number[] {
  if (version === 1) return []
  const count = Math.floor(version / 7) + 2
  const step = Math.floor((version * 8 + count * 3 + 5) / (count * 4 - 4)) * 2
  const result = [6]
  for (let pos = size - 7; result.length < count; pos -= step) result.splice(1, 0, pos)
  return result
}

function build(version: number, codewords: number[]): Matrix {
  const size = version * 4 + 17
  const modules: Matrix = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const reserved: Matrix = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const set = (x: number, y: number, dark: boolean) => {
    const row = modules[y]
    const lock = reserved[y]
    if (!row || !lock || x < 0 || x >= size) return
    row[x] = dark
    lock[x] = true
  }

  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ] as const) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        set(cx + dx, cy + dy, dist !== 2 && dist !== 4)
      }
    }
  }
  const align = alignmentPositions(version, size)
  align.forEach((ay, i) =>
    align.forEach((ax, j) => {
      const last = align.length - 1
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    }),
  )
  drawFormat(set, size, 0)
  if (version >= 7) {
    let rem = version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (version << 12) | rem
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      set(a, b, bit(bits, i))
      set(b, a, bit(bits, i))
    }
  }

  let index = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert
        const row = modules[y]
        if (row && !reserved[y]?.[x] && index < codewords.length * 8) {
          row[x] = bit(codewords[index >>> 3] ?? 0, 7 - (index & 7))
          index++
        }
      }
    }
  }

  let best = 0
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask++) {
    applyMask(modules, reserved, mask)
    drawFormat(set, size, mask)
    const score = penalty(modules)
    if (score < bestScore) {
      best = mask
      bestScore = score
    }
    applyMask(modules, reserved, mask)
  }
  applyMask(modules, reserved, best)
  drawFormat(set, size, best)
  return modules
}

function drawFormat(set: (x: number, y: number, dark: boolean) => void, size: number, mask: number) {
  let rem = mask
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((mask << 10) | rem) ^ 0x5412
  for (let i = 0; i <= 5; i++) set(8, i, bit(bits, i))
  set(8, 7, bit(bits, 6))
  set(8, 8, bit(bits, 7))
  set(7, 8, bit(bits, 8))
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(bits, i))
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(bits, i))
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(bits, i))
  set(8, size - 8, true)
}

function masked(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0
    case 1:
      return y % 2 === 0
    case 2:
      return x % 3 === 0
    case 3:
      return (x + y) % 3 === 0
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

function applyMask(modules: Matrix, reserved: Matrix, mask: number) {
  modules.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (!reserved[y]?.[x] && masked(mask, x, y)) row[x] = !dark
    }),
  )
}

function penalty(modules: Matrix): number {
  const size = modules.length
  const columns = modules.map((_, x) => modules.map((row) => row[x] ?? false))
  let score = 0
  for (const line of [...modules, ...columns]) {
    let run = 1
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) run++
      else {
        if (run >= 5) score += run - 2
        run = 1
      }
    }
    const text = `0000${line.map((dark) => (dark ? '1' : '0')).join('')}0000`
    for (const pattern of FINDER_LIKE) {
      for (let at = text.indexOf(pattern); at !== -1; at = text.indexOf(pattern, at + 1)) score += 40
    }
  }
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y]?.[x]
      if (color === modules[y]?.[x + 1] && color === modules[y + 1]?.[x] && color === modules[y + 1]?.[x + 1]) score += 3
    }
  }
  const dark = modules.flat().filter(Boolean).length
  const total = size * size
  return score + (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10
}

export function qrMatrix(text: string): Matrix {
  const { version, codewords } = encodeData(new TextEncoder().encode(text))
  return build(version, interleave(codewords, version))
}
