export function normalizeFreeText(value) {
  if (typeof value != 'string') return ''

  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase()
}

export function matchAcceptedAnswer(userAnswer, acceptedAnswers) {
  const normalizedInput = normalizeFreeText(userAnswer)

  if (!normalizedInput) return false

  return acceptedAnswers.some((acceptedAnswer) => {
    const normalizedAnswer = normalizeFreeText(acceptedAnswer)

    return normalizedAnswer !== '' && normalizedInput === normalizedAnswer
  })
}
