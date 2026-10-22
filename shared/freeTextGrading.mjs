export function normalizeFreeText(value) {
  if (typeof value != 'string') return ''

  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase()
}

export function matchAcceptedAnswer(userAnswer, acceptedAnswers, { allowTypos = false } = {}) {
  const input = normalizeFreeText(userAnswer)

  if (!input) return false

  const normalizedAnswers = acceptedAnswers.map(normalizeFreeText).filter(Boolean)

  // Exakta matchningar godkänns alltid
  if (normalizedAnswers.includes(input)) return true

  // Stavfelstolerans måste uttryckligen aktiveras.
  if (allowTypos !== true) return false

  function canUseTypoTolerance(text) {
    const letters = Array.from(text.replace(/\s/gu, ''))

    return letters.length >= 8 && /^[\p{L}\p{M} ]+$/u.test(text)
  }

  if (!canUseTypoTolerance(input)) return false

  return normalizedAnswers.some(
    (expected) => canUseTypoTolerance(expected) && isWIthinOneEdit(input, expected),
  )
}

export function isWIthinOneEdit(first, second) {
  const a = Array.from(first)
  const b = Array.from(second)

  if (Math.abs(a.length - b.length) > 1) return false

  let i = 0
  let j = 0
  let differenes = 0

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    differenes++

    if (differenes > 1) return false

    if (a.length > b.length) {
      i++
    } else if (b.length > a.length) {
      j++
    } else {
      i++
      j++
    }
  }

  if (i < a.length || j < b.length) differenes++

  return differenes <= 1
}
