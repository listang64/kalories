export interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>
}

interface NativeDetector {
  new (options: { formats: string[] }): Detector
  getSupportedFormats(): Promise<string[]>
}

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'] as const

export const BARCODE = /^\d{8,14}$/

export async function createDetector(): Promise<Detector> {
  const native = (globalThis as { BarcodeDetector?: NativeDetector }).BarcodeDetector
  if (native) {
    const supported = await native.getSupportedFormats().catch((): string[] => [])
    if (FORMATS.every((format) => supported.includes(format))) return new native({ formats: [...FORMATS] })
  }
  const { createZXingDetector } = await import('./barcodeEngine')
  return createZXingDetector([...FORMATS])
}
