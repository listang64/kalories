const MAX_SIDE = 1024
const QUALITY = 0.8

function toJpeg(source: CanvasImageSource, width: number, height: number): string {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', QUALITY)
}

export function captureVideoFrame(video: HTMLVideoElement): string | null {
  if (!video.videoWidth || !video.videoHeight) return null
  return toJpeg(video, video.videoWidth, video.videoHeight)
}

export function fileToJpeg(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve(toJpeg(image, image.naturalWidth, image.naturalHeight))
      URL.revokeObjectURL(url)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible'))
    }
    image.src = url
  })
}

export function base64Of(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}
