import { ref, computed } from 'vue'
import { api } from './api'

// Shared login state, so the router guard and navigation agree on who is logged in.
// This only hides UI; the backend enforces admin access on every request.
export const currentUser = ref(null)
export const isAdmin = computed(() => currentUser.value?.role === 'admin')
export const isOrganization = computed(
  () => currentUser.value?.role === 'organization' || currentUser.value?.role === 'admin',
)

let pending = null

// Cached after the first call; pass force after login/logout to refresh.
export function loadCurrentUser({ force = false } = {}) {
  if (!pending || force) {
    pending = api
      .getMe()
      .then((user) => (currentUser.value = user))
      .catch(() => (currentUser.value = null))
  }
  return pending
}
