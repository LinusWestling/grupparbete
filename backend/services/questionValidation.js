// Validates question payloads for POST and PUT. Both require the full question,
// so the rules are the same. Returns cleaned data or throws a 400 error that
// lists every problem, so the admin form can show them all at once.

const QUESTION_TYPES = ['multiple_choice', 'yes_no', 'free_text', 'matching']
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
    errors.push('Svaren måste vara en lista')
    return []
  }

  const cleaned = []
  answers.forEach((answer, index) => {
    const label = `Svar ${index + 1}`
    if (!answer || typeof answer !== 'object') {
      errors.push(`${label} är ogiltigt`)
      return
    }
    if (answer.id !== undefined && answer.id !== null && !isPositiveInteger(answer.id)) {
      errors.push(`${label} har ett ogiltigt ID`)
    }
    const text = typeof answer.answer_text === 'string' ? answer.answer_text.trim() : ''
    if (!text) errors.push(`${label} behöver en text`)
    else if (text.length > MAX_ANSWER_LENGTH) {
      errors.push(`${label} får innehålla högst ${MAX_ANSWER_LENGTH} tecken`)
    }
    const matchText = typeof answer.match_text === 'string' ? answer.match_text.trim() : ''
    if (type === 'matching') {
      if (!matchText) errors.push(`${label} behöver en matchande text`)
      else if (matchText.length > MAX_ANSWER_LENGTH) {
        errors.push(
          `Den matchande texten för ${label.toLowerCase()} får innehålla högst ${MAX_ANSWER_LENGTH} tecken`,
        )
      }
    }
    if (type !== 'free_text' && type !== 'matching' && typeof answer.is_correct !== 'boolean') {
      errors.push(`Ange om ${label.toLowerCase()} är rätt eller fel`)
    }
    cleaned.push({
      id: answer.id ? Number(answer.id) : null,
      answer_text: text,
      match_text: type === 'matching' ? matchText : null,
      // Free text and matching answers always represent the correct model/pair.
      is_correct: type === 'free_text' || type === 'matching' ? true : answer.is_correct === true,
    })
  })

  const correctCount = cleaned.filter((a) => a.is_correct).length
  if (type === 'multiple_choice') {
    if (cleaned.length < 2 || cleaned.length > MAX_ANSWERS) {
      errors.push(`Flervalsfrågor behöver 2–${MAX_ANSWERS} svar`)
    }
    if (correctCount !== 1) errors.push('Flervalsfrågor behöver exakt ett rätt svar')
  } else if (type === 'yes_no') {
    if (cleaned.length !== 2) errors.push('Ja/nej-frågor behöver exakt två svar')
    if (correctCount !== 1) errors.push('Ja/nej-frågor behöver exakt ett rätt svar')
  } else if (type === 'free_text') {
    if (cleaned.length < 1 || cleaned.length > MAX_ANSWERS) {
      errors.push(`Fritextfrågor behöver 1–${MAX_ANSWERS} godkända svar`)
    }
  } else if (type === 'matching') {
    if (cleaned.length < 2 || cleaned.length > MAX_ANSWERS) {
      errors.push(`Matchningsfrågor behöver 2–${MAX_ANSWERS} par`)
    }
    const matchTexts = cleaned.map((a) => (a.match_text || '').toLowerCase()).filter(Boolean)
    if (new Set(matchTexts).size !== matchTexts.length) {
      errors.push('De matchande alternativen måste vara olika')
    }
  }

  // Players pick between these options, so two with the same text make no sense.
  if (type !== 'free_text') {
    const texts = cleaned.map((a) => a.answer_text.toLowerCase()).filter(Boolean)
    if (new Set(texts).size !== texts.length) errors.push('Svaren måste vara olika')
  }

  const ids = cleaned.map((a) => a.id).filter(Boolean)
  if (new Set(ids).size !== ids.length) errors.push('Samma svars-ID används två gånger')

  return cleaned
}

function validateSources(sources, errors) {
  if (sources === undefined || sources === null) return []
  if (!Array.isArray(sources)) {
    errors.push('Källorna måste vara en lista')
    return []
  }

  // Empty rows from the form are dropped instead of rejected.
  const filled = sources.filter(
    (s) =>
      s &&
      typeof s === 'object' &&
      (String(s.source_text ?? '').trim() || String(s.url ?? '').trim()),
  )
  if (filled.length > MAX_SOURCES) errors.push(`Ange högst ${MAX_SOURCES} källor`)

  return filled.map((source, index) => {
    const label = `Källa ${index + 1}`
    const text = typeof source.source_text === 'string' ? source.source_text.trim() : ''
    const url = typeof source.url === 'string' ? source.url.trim() : ''
    if (!text) errors.push(`${label} behöver en beskrivning`)
    else if (text.length > MAX_SOURCE_TEXT_LENGTH) {
      errors.push(`${label} får innehålla högst ${MAX_SOURCE_TEXT_LENGTH} tecken`)
    }
    if (url && (url.length > MAX_URL_LENGTH || !isHttpUrl(url))) {
      errors.push(`${label} behöver en giltig HTTP- eller HTTPS-länk`)
    }
    return { source_text: text, url: url || null }
  })
}

function validateQuestion(body) {
  const data = body && typeof body === 'object' ? body : {}
  const errors = []

  if (!isPositiveInteger(data.topic_id)) errors.push('Välj ett ämne')

  const type = data.question_type
  if (!QUESTION_TYPES.includes(type)) {
    errors.push('Välj en frågetyp: flervalsfråga, ja/nej-fråga, fritextfråga eller matchningsfråga')
  }

  const text = typeof data.question_text === 'string' ? data.question_text.trim() : ''
  if (!text) errors.push('Frågan behöver en text')
  else if (text.length > MAX_QUESTION_LENGTH) {
    errors.push(`Frågan får innehålla högst ${MAX_QUESTION_LENGTH} tecken`)
  }

  const difficulty = Number(data.difficulty_level)
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    errors.push('Svårighetsgraden måste vara ett heltal mellan 1 och 5')
  }

  if (data.allow_typos !== undefined && typeof data.allow_typos !== 'boolean') {
    errors.push('Stavningstoleransen måste vara på eller av')
  }

  if (type !== 'free_text' && data.allow_typos === true) {
    errors.push('Stavningstolerans kan bara användas för fritextfrågor')
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
    allow_typos: type === 'free_text' && data.allow_typos === true,
    answers,
    sources,
  }
}

module.exports = { validateQuestion, QUESTION_TYPES }
