const key = 'skillswap:quiz-account'

export function rememberQuizAccount(userId) {
  try {
    if (Number.isSafeInteger(userId) && userId > 0)
      globalThis.localStorage.setItem(key, String(userId))
    else globalThis.localStorage.removeItem(key)
  } catch {
    // Offline restoration is unavailable when storage is blocked.
  }
}

export function offlineQuizAccount(error) {
  // HTTP errors are not evidence of an offline connection, especially 401/403.
  if (error.status != null) return null
  try {
    const id = Number(globalThis.localStorage.getItem(key))
    return Number.isSafeInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}
