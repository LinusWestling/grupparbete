// Constants
export const SEARCH_MIN_LENGTH = 2
export const POLL_INTERVAL_MS = 5000
export const COMPLETION_MESSAGE_DELAY_MS = 3000
export const CHALLENGE_EXPIRY_HOURS = 24

// Formatting helpers
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

export function formatTime(seconds) {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export function calculateProgressPercentage(answered, total) {
  if (!total) return 0
  return (answered / total) * 100
}
