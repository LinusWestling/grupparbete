import { ref, computed } from 'vue'
import { api } from './api'

// Shared login state, so the router guard and navigation agree on who is logged in.
// This only hides UI; the backend enforces admin access on every request.
export const currentUser = ref(null)
export const authResolved = ref(false)
export const authState = ref('pending')
export const offlineAccountId = ref(null)
const rememberedAccountKey = 'skillswap.offline-account.v1'

function rememberAccount(id) {
  offlineAccountId.value = id
  try {
    if (id == null) globalThis.window?.localStorage.removeItem(rememberedAccountKey)
    else globalThis.window?.localStorage.setItem(rememberedAccountKey, JSON.stringify(id))
  } catch {
    // Storage availability must not change the authentication result.
  }
}
export const isAdmin = computed(() => currentUser.value?.role === 'admin')
export const isOrganization = computed(
  () => currentUser.value?.role === 'organization' || currentUser.value?.role === 'admin',
)

let pending = null

// Cached after the first call; pass force after login/logout to refresh.
export function loadCurrentUser({ force = false } = {}) {
  if (!pending || force) {
    authResolved.value = false
    pending = api
      .getMe()
      .then((user) => {
        currentUser.value = user
        authState.value = user?.id != null ? 'authenticated' : 'signed-out'
        rememberAccount(user?.id ?? null)
        return user
      })
      .catch((error) => {
        if ([401, 403].includes(error.status)) {
          currentUser.value = null
          authState.value = 'signed-out'
          rememberAccount(null)
        } else {
          authState.value = 'unavailable'
          if (offlineAccountId.value == null) {
            try {
              const id = JSON.parse(
                globalThis.window?.localStorage.getItem(rememberedAccountKey) || 'null',
              )
              if (typeof id === 'string' || typeof id === 'number') offlineAccountId.value = id
            } catch {
              // Leave stored quiz data intact if the remembered account cannot be read.
            }
          }
        }
        return currentUser.value
      })
      .finally(() => (authResolved.value = true))
  }
  return pending
}
