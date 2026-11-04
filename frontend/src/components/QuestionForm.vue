<script setup>
import { ref, computed, nextTick } from 'vue'
import { api } from '../services/api'
import { QUESTION_TYPE_LABELS } from '../services/questionTypes.js'

// Shared by create and edit. Pass a question (from getAdminQuestion) to edit it.
const props = defineProps({
  question: { type: Object, default: null },
  topics: { type: Array, required: true },
})
const emit = defineEmits(['saved', 'cancel'])

const MAX_ANSWERS = 6
const MAX_SOURCES = 5

const isEdit = computed(() => Boolean(props.question))
// A used question's type is locked by the backend, so lock it here too.
const typeLocked = computed(() => isEdit.value && props.question.usage_count > 0)

function answersFor(type) {
  if (type === 'yes_no') {
    return [
      { id: null, answer_text: 'Ja', match_text: '', is_correct: true },
      { id: null, answer_text: 'Nej', match_text: '', is_correct: false },
    ]
  }
  if (type === 'free_text') return [{ id: null, answer_text: '', match_text: '', is_correct: true }]
  if (type === 'matching') {
    return [
      { id: null, answer_text: '', match_text: '', is_correct: true },
      { id: null, answer_text: '', match_text: '', is_correct: true },
    ]
  }
  return [
    { id: null, answer_text: '', match_text: '', is_correct: true },
    { id: null, answer_text: '', match_text: '', is_correct: false },
  ]
}

function initialForm() {
  const q = props.question
  if (!q) {
    return {
      topic_id: props.topics[0]?.id ?? '',
      question_type: 'multiple_choice',
      difficulty_level: 1,
      allow_typos: false,
      question_text: '',
      answers: answersFor('multiple_choice'),
      sources: [],
    }
  }
  return {
    topic_id: q.topic_id,
    question_type: q.question_type,
    difficulty_level: q.difficulty_level,
    allow_typos: q.question_type === 'free_text' && (q.allow_typos === true || q.allow_typos === 1),
    question_text: q.question_text,
    // Keeping answer ids lets the backend update answers in place.
    answers: q.answers.map((a) => ({
      id: a.id,
      answer_text: a.answer_text,
      match_text: a.match_text || '',
      is_correct: Boolean(a.is_correct),
    })),
    sources: q.sources.map((s) => ({ source_text: s.source_text, url: s.url || '' })),
  }
}

const form = ref(initialForm())
const saving = ref(false)
const errorMessage = ref('')
const fieldErrors = ref([])
const errorBanner = ref(null)

function changeType(type) {
  form.value.question_type = type
  form.value.answers = answersFor(type)
  form.value.allow_typos = false
}

function markCorrect(index) {
  form.value.answers.forEach((a, i) => (a.is_correct = i === index))
}

function addAnswer() {
  form.value.answers.push({
    id: null,
    answer_text: '',
    match_text: '',
    is_correct: form.value.question_type === 'matching' || form.value.question_type === 'free_text',
  })
}

function removeAnswer(index) {
  const [removed] = form.value.answers.splice(index, 1)
  if (removed.is_correct && form.value.answers.length) form.value.answers[0].is_correct = true
}

function addSource() {
  form.value.sources.push({ source_text: '', url: '' })
}

async function submit() {
  saving.value = true
  errorMessage.value = ''
  fieldErrors.value = []
  const payload = {
    ...form.value,
    topic_id: Number(form.value.topic_id),
    difficulty_level: Number(form.value.difficulty_level),
  }
  try {
    const saved = isEdit.value
      ? await api.updateQuestion(props.question.id, payload)
      : await api.createQuestion(payload)
    emit('saved', saved)
  } catch (err) {
    fieldErrors.value = err.errors || []
    errorMessage.value = fieldErrors.value.length ? 'Rätta följande och försök igen:' : err.message
    // The banner is above the form; move focus there so the error is seen and announced.
    await nextTick()
    errorBanner.value?.focus()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="form-card" aria-labelledby="question-form-title">
    <h2 id="question-form-title">
      {{ isEdit ? `Redigera fråga #${question.id}` : 'Ny fråga' }}
    </h2>
    <p v-if="isEdit && question.usage_count > 0" class="form-hint">
      Använd i {{ question.usage_count }} quizförsök. Du kan rätta texten, men frågetypen och
      rättningsnyckeln för svar som användare redan har valt är låsta.
    </p>

    <div
      v-if="errorMessage"
      ref="errorBanner"
      class="banner error-banner"
      role="alert"
      tabindex="-1"
    >
      {{ errorMessage }}
      <ul v-if="fieldErrors.length" class="field-errors">
        <li v-for="message in fieldErrors" :key="message">{{ message }}</li>
      </ul>
    </div>

    <form class="question-form" @submit.prevent="submit">
      <div class="form-row">
        <div class="form-group">
          <label for="q-topic">Ämne</label>
          <select id="q-topic" v-model="form.topic_id" required>
            <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="q-type">Frågetyp</label>
          <select
            id="q-type"
            :value="form.question_type"
            :disabled="typeLocked"
            @change="changeType($event.target.value)"
          >
            <option v-for="(label, value) in QUESTION_TYPE_LABELS" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="q-difficulty">Svårighetsgrad</label>
          <select id="q-difficulty" v-model.number="form.difficulty_level">
            <option v-for="level in 5" :key="level" :value="level">Nivå {{ level }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="q-text">Fråga</label>
        <textarea
          id="q-text"
          v-model="form.question_text"
          rows="3"
          maxlength="1000"
          required
        ></textarea>
      </div>

      <fieldset class="form-section">
        <legend>
          {{
            form.question_type === 'free_text'
              ? 'Godkända svar'
              : form.question_type === 'matching'
                ? 'Matchningspar'
                : 'Svar'
          }}
        </legend>

        <div v-if="form.question_type === 'free_text'" class="form-group">
          <label>
            <input type="checkbox" v-model="form.allow_typos" />
            Tillåt mindre stavfel
          </label>

          <p class="form-hint">
            Tillåter en skillnad på ett tecken i svar med minst åtta bokstäver. Gäller inte tal. Låt
            detta vara avstängt för begrepp som lätt förväxlas, till exempel adduktion och
            abduktion.
          </p>

          <p class="form-hint">
            Lägg till godkända svar. Vid rättning ignoreras stora och små bokstäver samt extra
            blanksteg.
          </p>

          <div v-for="(answer, index) in form.answers" :key="index" class="answer-row">
            <input
              v-model="answer.answer_text"
              :aria-label="`Godkänt svar ${index + 1}`"
              placeholder="Ett godkänt svar"
              maxlength="500"
              required
            />

            <button
              type="button"
              class="button-icon"
              :disabled="form.answers.length <= 1"
              :aria-label="`Ta bort godkänt svar ${index + 1}`"
              @click="removeAnswer(index)"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            class="button button-outline button-sm align-start"
            :disabled="form.answers.length >= MAX_ANSWERS"
            @click="addAnswer"
          >
            + Lägg till godkänt svar
          </button>
        </div>

        <template v-else-if="form.question_type === 'matching'">
          <p class="form-hint">
            Ange 2–6 par som hör ihop. Alternativen till höger blandas automatiskt i quizet.
          </p>
          <div v-for="(answer, index) in form.answers" :key="index" class="answer-row">
            <input
              v-model="answer.answer_text"
              class="flex-1"
              :aria-label="`Par ${index + 1}, vänster led`"
              placeholder="Vänster led (t.ex. muskel eller begrepp)"
              maxlength="500"
              required
            />
            <span aria-hidden="true">↔</span>
            <input
              v-model="answer.match_text"
              class="flex-1"
              :aria-label="`Par ${index + 1}, motsvarande led`"
              placeholder="Motsvarande led (t.ex. funktion eller definition)"
              maxlength="500"
              required
            />
            <button
              type="button"
              class="button-icon"
              :disabled="form.answers.length <= 2"
              :aria-label="`Ta bort par ${index + 1}`"
              @click="removeAnswer(index)"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            class="button button-outline button-sm align-start"
            :disabled="form.answers.length >= MAX_ANSWERS"
            @click="addAnswer"
          >
            + Lägg till par
          </button>
        </template>

        <template v-else>
          <p class="form-hint">Välj rätt svar.</p>
          <div v-for="(answer, index) in form.answers" :key="index" class="answer-row">
            <input
              type="radio"
              name="correct-answer"
              :checked="answer.is_correct"
              :aria-label="`Svar ${index + 1} är rätt`"
              @change="markCorrect(index)"
            />
            <input
              v-model="answer.answer_text"
              class="flex-1"
              :aria-label="`Svar ${index + 1}`"
              maxlength="500"
              required
            />
            <button
              v-if="form.question_type === 'multiple_choice'"
              type="button"
              class="button-icon"
              :disabled="form.answers.length <= 2"
              :aria-label="`Ta bort svar ${index + 1}`"
              @click="removeAnswer(index)"
            >
              ✕
            </button>
          </div>
          <button
            v-if="form.question_type === 'multiple_choice'"
            type="button"
            class="button button-outline button-sm align-start"
            :disabled="form.answers.length >= MAX_ANSWERS"
            @click="addAnswer"
          >
            + Lägg till svar
          </button>
        </template>
      </fieldset>

      <fieldset class="form-section">
        <legend>Källor (valfritt)</legend>
        <div v-for="(source, index) in form.sources" :key="index" class="answer-row">
          <input
            v-model="source.source_text"
            class="flex-1"
            :aria-label="`Beskrivning av källa ${index + 1}`"
            placeholder="Bok, artikel eller sida"
            maxlength="255"
          />
          <input
            v-model="source.url"
            type="url"
            class="flex-1"
            :aria-label="`Länk till källa ${index + 1}`"
            placeholder="https://… (valfritt)"
            maxlength="500"
          />
          <button
            type="button"
            class="button-icon"
            :aria-label="`Ta bort källa ${index + 1}`"
            @click="form.sources.splice(index, 1)"
          >
            ✕
          </button>
        </div>
        <button
          type="button"
          class="button button-outline button-sm align-start"
          :disabled="form.sources.length >= MAX_SOURCES"
          @click="addSource"
        >
          + Lägg till källa
        </button>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="button button-accent" :disabled="saving">
          {{ saving ? 'Sparar…' : isEdit ? 'Spara ändringar' : 'Skapa fråga' }}
        </button>
        <button type="button" class="button button-outline" @click="emit('cancel')">Avbryt</button>
      </div>
    </form>
  </section>
</template>
