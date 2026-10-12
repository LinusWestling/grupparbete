<script setup>
import { ref, computed, nextTick } from 'vue'
import { api } from '../services/api'

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
      { id: null, answer_text: 'Ja', is_correct: true },
      { id: null, answer_text: 'Nej', is_correct: false },
    ]
  }
  if (type === 'free_text') return [{ id: null, answer_text: '', is_correct: true }]
  return [
    { id: null, answer_text: '', is_correct: true },
    { id: null, answer_text: '', is_correct: false },
  ]
}

function initialForm() {
  const q = props.question
  if (!q) {
    return {
      topic_id: props.topics[0]?.id ?? '',
      question_type: 'multiple_choice',
      difficulty_level: 1,
      question_text: '',
      answers: answersFor('multiple_choice'),
      sources: [],
    }
  }
  return {
    topic_id: q.topic_id,
    question_type: q.question_type,
    difficulty_level: q.difficulty_level,
    question_text: q.question_text,
    // Keeping answer ids lets the backend update answers in place.
    answers: q.answers.map((a) => ({
      id: a.id,
      answer_text: a.answer_text,
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
}

function markCorrect(index) {
  form.value.answers.forEach((a, i) => (a.is_correct = i === index))
}

function addAnswer() {
  form.value.answers.push({ id: null, answer_text: '', is_correct: false })
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
    errorMessage.value = fieldErrors.value.length ? 'Fix the following and try again:' : err.message
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
      {{ isEdit ? `Edit question #${question.id}` : 'New question' }}
    </h2>
    <p v-if="isEdit && question.usage_count > 0" class="form-hint">
      Used in {{ question.usage_count }} quiz attempt(s). You can fix text, but the type and which
      answer is correct are locked for answers players have chosen.
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
          <label for="q-topic">Topic</label>
          <select id="q-topic" v-model="form.topic_id" required>
            <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="q-type">Type</label>
          <select
            id="q-type"
            :value="form.question_type"
            :disabled="typeLocked"
            @change="changeType($event.target.value)"
          >
            <option value="multiple_choice">Multiple choice</option>
            <option value="yes_no">Yes / no</option>
            <option value="free_text">Free text</option>
          </select>
        </div>

        <div class="form-group">
          <label for="q-difficulty">Difficulty</label>
          <select id="q-difficulty" v-model.number="form.difficulty_level">
            <option v-for="level in 5" :key="level" :value="level">Level {{ level }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="q-text">Question</label>
        <textarea
          id="q-text"
          v-model="form.question_text"
          rows="3"
          maxlength="1000"
          required
        ></textarea>
      </div>

      <fieldset class="form-section">
        <legend>{{ form.question_type === 'free_text' ? 'Model answer' : 'Answers' }}</legend>

        <div v-if="form.question_type === 'free_text'" class="form-group">
          <input
            v-model="form.answers[0].answer_text"
            aria-label="Model answer"
            placeholder="The answer players must type"
            maxlength="500"
            required
          />
          <p class="form-hint">Graded as an exact match, ignoring case and extra spaces.</p>
        </div>

        <template v-else>
          <p class="form-hint">Select the correct answer.</p>
          <div v-for="(answer, index) in form.answers" :key="index" class="answer-row">
            <input
              type="radio"
              name="correct-answer"
              :checked="answer.is_correct"
              :aria-label="`Answer ${index + 1} is correct`"
              @change="markCorrect(index)"
            />
            <input
              v-model="answer.answer_text"
              class="flex-1"
              :aria-label="`Answer ${index + 1}`"
              maxlength="500"
              required
            />
            <button
              v-if="form.question_type === 'multiple_choice'"
              type="button"
              class="button-icon"
              :disabled="form.answers.length <= 2"
              :aria-label="`Remove answer ${index + 1}`"
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
            + Add answer
          </button>
        </template>
      </fieldset>

      <fieldset class="form-section">
        <legend>Sources (optional)</legend>
        <div v-for="(source, index) in form.sources" :key="index" class="answer-row">
          <input
            v-model="source.source_text"
            class="flex-1"
            :aria-label="`Source ${index + 1} description`"
            placeholder="Book, article or page"
            maxlength="255"
          />
          <input
            v-model="source.url"
            type="url"
            class="flex-1"
            :aria-label="`Source ${index + 1} link`"
            placeholder="https://… (optional)"
            maxlength="500"
          />
          <button
            type="button"
            class="button-icon"
            :aria-label="`Remove source ${index + 1}`"
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
          + Add source
        </button>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="button button-accent" :disabled="saving">
          {{ saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create question' }}
        </button>
        <button type="button" class="button button-outline" @click="emit('cancel')">Cancel</button>
      </div>
    </form>
  </section>
</template>
