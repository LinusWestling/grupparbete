import { ref } from 'vue'

// Browser connectivity is a hint. A reachable network does not guarantee that
// the API is reachable, so keep these signals separate.
export const browserOnline = ref(globalThis.navigator?.onLine !== false)
export const backendAvailable = ref(null)

export function recordApiResponse(status) {
  backendAvailable.value = status < 500
}

export function recordApiFailure(error) {
  if (['TypeError', 'TimeoutError', 'AbortError'].includes(error.name)) {
    backendAvailable.value = false
  }
}

export function startConnectionTracking(target = globalThis.window) {
  if (!target) return () => {}
  const offline = () => {
    browserOnline.value = false
  }
  const online = () => {
    browserOnline.value = true
    backendAvailable.value = null
  }
  browserOnline.value = target.navigator?.onLine !== false
  target.addEventListener('offline', offline)
  target.addEventListener('online', online)
  return () => {
    target.removeEventListener('offline', offline)
    target.removeEventListener('online', online)
  }
}
