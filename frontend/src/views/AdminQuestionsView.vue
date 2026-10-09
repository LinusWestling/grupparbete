<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { api } from '../services/api'
import QuestionForm from '../components/QuestionForm.vue'

const TYPE_LABELS = {
  multiple_choice: 'Multiple choice',
  yes_no: 'Yes / no',
  free_text: 'Free text',
}

const questions = ref([])
const topics = ref([])
const loading = ref(true)
const error = ref('')
const successMsg = ref('')

const filters = ref({ topicId: '', type: '', difficulty: '', search: '' })

// null = form closed, 'new' = create, otherwise the question being edited.
const editing = ref(null)
const formCard = ref(null)

const pendingDelete = ref(null)
const deleting = ref(false)
const cancelDeleteButton = ref(null)

onMounted(async () => {
  try {
    topics.value = await api.getTopics()
  } catch (err) {
    error.value = 'Could not load topics: ' + err.message
  }
  await loadQuestions()
})

async function loadQuestions() {
  loading.value = true
  try {
    questions.value = await api.getAdminQuestions(filters.value)
  } catch (err) {
    error.value = 'Could not load questions: ' + err.message
  } finally {
    loading.value = false
  }
}

// Search waits until typing pauses; the dropdowns reload immediately.
let searchTimeout = null
watch(
  () => filters.value.search,
  () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(loadQuestions, 300)
  },
)
watch(() => [filters.value.topicId, filters.value.type, filters.value.difficulty], loadQuestions)

function clearFilters() {
  filters.value = { topicId: '', type: '', difficulty: '', search: '' }
}

function correctAnswerText(question) {
  return question.answers.find((a) => a.is_correct)?.answer_text ?? '—'
}

async function openForm(question) {
  error.value = ''
  successMsg.value = ''
  try {
    // Fetch fresh data so usage_count and answer ids are current.
    editing.value = question ? await api.getAdminQuestion(question.id) : 'new'
    await nextTick()
    formCard.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    error.value = 'Could not open the question: ' + err.message
  }
}

async function onSaved(saved) {
  successMsg.value =
    editing.value === 'new' ? `Question #${saved.id} created.` : `Question #${saved.id} saved.`
  editing.value = null
  await loadQuestions()
}

async function askDelete(question) {
  pendingDelete.value = question
  await nextTick()
  cancelDeleteButton.value?.focus()
}

async function confirmDelete() {
  deleting.value = true
  error.value = ''
  successMsg.value = ''
  try {
    await api.deleteQuestion(pendingDelete.value.id)
    successMsg.value = `Question #${pendingDelete.value.id} deleted.`
    if (editing.value?.id === pendingDelete.value.id) editing.value = null
    pendingDelete.value = null
    await loadQuestions()
  } catch (err) {
    error.value = 'Could not delete the question: ' + err.message
    pendingDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="admin-questions-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ADMIN · QUIZ CONTENT</p>
        <h1>Manage questions</h1>
        <p class="heading-description">
          Add, edit and remove the questions used in quizzes. Deleted questions disappear from new
          quizzes but stay in players' quiz history.
        </p>
      </div>
      <button v-if="editing !== 'new'" class="button button-accent" @click="openForm(null)">
        + New question
      </button>
    </div>

    <div v-if="error" class="banner error-banner" role="alert">{{ error }}</div>
    <div v-if="successMsg" class="banner success-banner" role="status">{{ successMsg }}</div>

    <div v-if="editing" ref="formCard">
      <QuestionForm
        :key="editing === 'new' ? 'new' : editing.id"
        :question="editing === 'new' ? null : editing"
        :topics="topics"
        @saved="onSaved"
        @cancel="editing = null"
      />
    </div>

    <div class="question-filters" role="search">
      <input
        v-model="filters.search"
        type="search"
        class="question-search"
        placeholder="Search question text…"
        aria-label="Search question text"
      />
      <select v-model="filters.topicId" class="question-filter" aria-label="Filter by topic">
        <option value="">All topics</option>
        <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <select v-model="filters.type" class="question-filter" aria-label="Filter by type">
        <option value="">All types</option>
        <option v-for="(label, value) in TYPE_LABELS" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
      <select
        v-model="filters.difficulty"
        class="question-filter"
        aria-label="Filter by difficulty"
      >
        <option value="">All levels</option>
        <option v-for="level in 5" :key="level" :value="level">Level {{ level }}</option>
      </select>
      <button type="button" class="button button-outline button-sm" @click="clearFilters">
        Clear
      </button>
    </div>

    <p class="text-muted" aria-live="polite">
      {{ loading ? 'Loading questions…' : `${questions.length} question(s)` }}
    </p>

    <div v-if="!loading && questions.length" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Topic</th>
            <th>Type</th>
            <th>Level</th>
            <th>Used</th>
            <th><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in questions" :key="q.id" :class="{ 'is-editing': editing?.id === q.id }">
            <td>#{{ q.id }}</td>
            <td class="question-col">
              {{ q.question_text }}
              <span class="correct-answer">✓ {{ correctAnswerText(q) }}</span>
            </td>
            <td>
              <span class="chip">{{ q.topic_name }}</span>
            </td>
            <td>{{ TYPE_LABELS[q.question_type] }}</td>
            <td>{{ q.difficulty_level }}</td>
            <td>{{ q.usage_count }}</td>
            <td class="row-actions">
              <button class="button button-outline button-sm" @click="openForm(q)">Edit</button>
              <button class="button-danger button-sm" @click="askDelete(q)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="empty-state">No questions match these filters.</p>

    <div
      v-if="pendingDelete"
      class="modal-overlay"
      @click.self="pendingDelete = null"
      @keydown.esc="pendingDelete = null"
    >
      <div
        class="modal-content"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
      >
        <h2 id="delete-title">Delete question #{{ pendingDelete.id }}?</h2>
        <div id="delete-description">
          <p class="delete-question-text">“{{ pendingDelete.question_text }}”</p>
          <p class="text-muted">
            It will no longer appear in new quizzes. Players who already answered it keep it in
            their quiz history.
          </p>
        </div>
        <div class="form-actions">
          <button class="button-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Deleting…' : 'Delete question' }}
          </button>
          <button
            ref="cancelDeleteButton"
            class="button button-outline"
            :disabled="deleting"
            @click="pendingDelete = null"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
