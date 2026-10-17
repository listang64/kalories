import { BarcodeDetector, prepareZXingModule, type BarcodeFormat } from 'barcode-detector/ponyfill'
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

prepareZXingModule({
  overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
})

export function createZXingDetector(formats: BarcodeFormat[]) {
  return new BarcodeDetector({ formats })
}
