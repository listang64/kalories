export interface Detector {
  detect(source: HTMLVideoElement | ImageBitmap): Promise<{ rawValue: string }[]>
}

interface NativeDetector {
  new (options: { formats: string[] }): Detector
  getSupportedFormats(): Promise<string[]>
}

export interface ScanOptions {
  formats: ('ean_13' | 'ean_8' | 'upc_a' | 'upc_e' | 'qr_code')[]
  accept: (value: string) => string | null
}

export const BARCODE = /^\d{8,14}$/

export const PRODUCT_SCAN: ScanOptions = {
  formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
  accept: (value) => (BARCODE.test(value) ? value : null),
}

export async function readBarcodePhoto(file: File, options: ScanOptions = PRODUCT_SCAN): Promise<string | null> {
  const [detector, image] = await Promise.all([createDetector(options.formats), createImageBitmap(file)])
  try {
    const found = await detector.detect(image)
    return found.map((barcode) => options.accept(barcode.rawValue)).find((value) => value !== null) ?? null
  } finally {
    image.close()
  }
}

export async function createDetector(formats: ScanOptions['formats']): Promise<Detector> {
  const native = (globalThis as { BarcodeDetector?: NativeDetector }).BarcodeDetector
  if (native) {
    const supported = await native.getSupportedFormats().catch((): string[] => [])
    if (formats.every((format) => supported.includes(format))) return new native({ formats })
  }
  const { createZXingDetector } = await import('./barcodeEngine')
  return createZXingDetector(formats)
}
