export type CameraAccess = 'granted' | 'denied' | 'prompt' | 'unknown' | 'unavailable'

export type Platform = 'ios' | 'android' | 'other'

export function isCameraDenied(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
}

export async function cameraStatus(): Promise<PermissionStatus | null> {
  try {
    return await navigator.permissions.query({ name: 'camera' as PermissionName })
  } catch {
    return null
  }
}

export async function requestCamera(): Promise<CameraAccess> {
  if (!navigator.mediaDevices?.getUserMedia) return 'unavailable'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    stream.getTracks().forEach((track) => track.stop())
    return 'granted'
  } catch (error) {
    return isCameraDenied(error) ? 'denied' : 'unavailable'
  }
}

export function platform(): Platform {
  const agent = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(agent) || (/Macintosh/.test(agent) && navigator.maxTouchPoints > 1)) return 'ios'
  return /Android/.test(agent) ? 'android' : 'other'
}
