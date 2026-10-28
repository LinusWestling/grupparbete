const { createHash } = require('node:crypto')

/**
 * Seeded random number generator using a simple LCG (Linear Congruential Generator)
 * Returns a function that generates pseudo-random numbers between 0 and 1
 */
function createSeededRandom(seed) {
  // Convert seed to a number if it's not already
  let state = typeof seed === 'number' ? seed : parseInt(createHash('sha256').update(String(seed)).digest('hex').slice(0, 8), 16)

  // LCG parameters (same as used in glibc)
  const a = 1103515245
  const c = 12345
  const m = 2 ** 31

  return function random() {
    state = (a * state + c) % m
    return state / m
  }
}

/**
 * Shuffle an array deterministically using a seed value
 * Same seed will always produce the same shuffle order
 *
 * @param {Array} array - Array to shuffle
 * @param {number|string} seed - Seed value for deterministic shuffling
 * @returns {Array} - New shuffled array (original array is not modified)
 */
function deterministicShuffle(array, seed) {
  if (!array || array.length === 0) return []

  const shuffled = [...array]
  const random = createSeededRandom(seed)

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Generate a deterministic order for quiz questions using challenge ID as seed
 * This ensures both players get the same questions in the same order
 *
 * @param {Array} questions - Array of question objects
 * @param {number} challengeId - Challenge ID to use as seed
 * @returns {Array} - Shuffled questions
 */
function shuffleQuestionsForChallenge(questions, challengeId) {
  if (!challengeId) {
    // No challenge ID = normal random shuffle (for regular quizzes)
    return questions
  }

  return deterministicShuffle(questions, challengeId)
}

module.exports = {
  deterministicShuffle,
  shuffleQuestionsForChallenge,
  createSeededRandom,
}
