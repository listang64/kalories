export interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>
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

export async function createDetector(formats: ScanOptions['formats']): Promise<Detector> {
  const native = (globalThis as { BarcodeDetector?: NativeDetector }).BarcodeDetector
  if (native) {
    const supported = await native.getSupportedFormats().catch((): string[] => [])
    if (formats.every((format) => supported.includes(format))) return new native({ formats })
  }
  const { createZXingDetector } = await import('./barcodeEngine')
  return createZXingDetector(formats)
}
