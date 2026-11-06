// Constants
export const SEARCH_MIN_LENGTH = 2
export const POLL_INTERVAL_MS = 5000
export const COMPLETION_MESSAGE_DELAY_MS = 3000
export const CHALLENGE_EXPIRY_HOURS = 24

/**
 * Format an ISO date string using the Swedish locale.
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('sv-SE')
}

/**
 * Format a duration in seconds as M:SS.
 */
export function formatTime(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return ''
  const totalSeconds = Math.max(0, Math.floor(Number(seconds)))
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

/**
 * Calculate the percentage of answered questions out of total questions.
 */
export function calculateProgressPercentage(answered, total) {
  if (!total) return 0
  return (answered / total) * 100
}
