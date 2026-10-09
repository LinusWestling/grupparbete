// Validates question payloads for POST and PUT. Both require the full question,
// so the rules are the same. Returns cleaned data or throws a 400 error that
// lists every problem, so the admin form can show them all at once.

const QUESTION_TYPES = ['multiple_choice', 'yes_no', 'free_text']
const MAX_QUESTION_LENGTH = 1000
const MAX_ANSWER_LENGTH = 500
const MAX_ANSWERS = 6
const MAX_SOURCES = 5
const MAX_SOURCE_TEXT_LENGTH = 255
const MAX_URL_LENGTH = 500

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateAnswers(type, answers, errors) {
  if (!Array.isArray(answers)) {
    errors.push('answers must be a list')
    return []
  }

  const cleaned = []
  answers.forEach((answer, index) => {
    const label = `Answer ${index + 1}`
    if (!answer || typeof answer !== 'object') {
      errors.push(`${label} is invalid`)
      return
    }
    if (answer.id !== undefined && answer.id !== null && !isPositiveInteger(answer.id)) {
      errors.push(`${label} has an invalid id`)
    }
    const text = typeof answer.answer_text === 'string' ? answer.answer_text.trim() : ''
    if (!text) errors.push(`${label} needs text`)
    else if (text.length > MAX_ANSWER_LENGTH) {
      errors.push(`${label} can be at most ${MAX_ANSWER_LENGTH} characters`)
    }
    if (type !== 'free_text' && typeof answer.is_correct !== 'boolean') {
      errors.push(`${label} must say whether it is correct (true/false)`)
    }
    cleaned.push({
      id: answer.id ? Number(answer.id) : null,
      answer_text: text,
      // A free text question's only answer is the model answer.
      is_correct: type === 'free_text' ? true : answer.is_correct === true,
    })
  })

  const correctCount = cleaned.filter((a) => a.is_correct).length
  if (type === 'multiple_choice') {
    if (cleaned.length < 2 || cleaned.length > MAX_ANSWERS) {
      errors.push(`Multiple choice needs 2-${MAX_ANSWERS} answers`)
    }
    if (correctCount !== 1) errors.push('Multiple choice needs exactly one correct answer')
    const texts = cleaned.map((a) => a.answer_text.toLowerCase()).filter(Boolean)
    if (new Set(texts).size !== texts.length) errors.push('Answers must be different')
  } else if (type === 'yes_no') {
    if (cleaned.length !== 2) errors.push('Yes/no needs exactly two answers')
    if (correctCount !== 1) errors.push('Yes/no needs exactly one correct answer')
  } else if (type === 'free_text') {
    if (cleaned.length !== 1) errors.push('Free text needs exactly one model answer')
  }

  const ids = cleaned.map((a) => a.id).filter(Boolean)
  if (new Set(ids).size !== ids.length) errors.push('The same answer id is used twice')

  return cleaned
}

function validateSources(sources, errors) {
  if (sources === undefined || sources === null) return []
  if (!Array.isArray(sources)) {
    errors.push('sources must be a list')
    return []
  }

  // Empty rows from the form are dropped instead of rejected.
  const filled = sources.filter(
    (s) =>
      s &&
      typeof s === 'object' &&
      (String(s.source_text ?? '').trim() || String(s.url ?? '').trim()),
  )
  if (filled.length > MAX_SOURCES) errors.push(`At most ${MAX_SOURCES} sources`)

  return filled.map((source, index) => {
    const label = `Source ${index + 1}`
    const text = typeof source.source_text === 'string' ? source.source_text.trim() : ''
    const url = typeof source.url === 'string' ? source.url.trim() : ''
    if (!text) errors.push(`${label} needs a description`)
    else if (text.length > MAX_SOURCE_TEXT_LENGTH) {
      errors.push(`${label} can be at most ${MAX_SOURCE_TEXT_LENGTH} characters`)
    }
    if (url && (url.length > MAX_URL_LENGTH || !isHttpUrl(url))) {
      errors.push(`${label} needs a valid http(s) link`)
    }
    return { source_text: text, url: url || null }
  })
}

function validateQuestion(body) {
  const data = body && typeof body === 'object' ? body : {}
  const errors = []

  if (!isPositiveInteger(data.topic_id)) errors.push('Choose a topic')

  const type = data.question_type
  if (!QUESTION_TYPES.includes(type)) {
    errors.push(`question_type must be one of: ${QUESTION_TYPES.join(', ')}`)
  }

  const text = typeof data.question_text === 'string' ? data.question_text.trim() : ''
  if (!text) errors.push('The question needs text')
  else if (text.length > MAX_QUESTION_LENGTH) {
    errors.push(`The question can be at most ${MAX_QUESTION_LENGTH} characters`)
  }

  const difficulty = Number(data.difficulty_level)
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    errors.push('Difficulty must be a whole number from 1 to 5')
  }

  const answers = QUESTION_TYPES.includes(type) ? validateAnswers(type, data.answers, errors) : []
  const sources = validateSources(data.sources, errors)

  if (errors.length) {
    throw Object.assign(new Error(errors.join('. ')), { status: 400, errors })
  }

  return {
    topic_id: Number(data.topic_id),
    question_type: type,
    question_text: text,
    difficulty_level: difficulty,
    answers,
    sources,
  }
}

module.exports = { validateQuestion, QUESTION_TYPES }
