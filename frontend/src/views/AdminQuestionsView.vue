<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { api } from '../services/api'
import QuestionForm from '../components/QuestionForm.vue'

const TYPE_LABELS = {
  multiple_choice: 'Multiple choice',
  yes_no: 'Yes / no',
  free_text: 'Free text',
  matching: 'Matching (Samband)',
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

const orgRequests = ref([])
const loadingOrgRequests = ref(false)
const updatingOrgId = ref(null)

onMounted(async () => {
  try {
    topics.value = await api.getTopics()
  } catch (err) {
    error.value = 'Could not load topics: ' + err.message
  }
  await Promise.all([loadQuestions(), loadOrgRequests()])
})

async function loadOrgRequests() {
  loadingOrgRequests.value = true
  try {
    orgRequests.value = await api.getOrganizationRequests()
  } catch (err) {
    // Non-blocking if org requests fail
  } finally {
    loadingOrgRequests.value = false
  }
}

async function handleOrgRequest(userId, action) {
  if (updatingOrgId.value) return
  updatingOrgId.value = userId
  error.value = ''
  successMsg.value = ''
  try {
    await api.updateOrganizationRequestStatus(userId, action)
    successMsg.value =
      action === 'approve'
        ? 'Organization account approved.'
        : 'Organization account request declined / revoked.'
    await loadOrgRequests()
  } catch (err) {
    error.value = 'Could not update organization request: ' + err.message
  } finally {
    updatingOrgId.value = null
  }
}

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
  if (question.question_type === 'matching') {
    return question.answers.map((a) => `${a.answer_text} ↔ ${a.match_text}`).join(' · ')
  }
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
        <p class="eyebrow">ADMIN · PLATFORM & QUIZ CONTENT</p>
        <h1>Manage questions & organizations</h1>
        <p class="heading-description">
          Review pending organization account applications, and add, edit or remove quiz questions.
        </p>
      </div>
      <button v-if="editing !== 'new'" class="button button-accent" @click="openForm(null)">
        + New question
      </button>
    </div>

    <div v-if="error" class="banner error-banner" role="alert">{{ error }}</div>
    <div v-if="successMsg" class="banner success-banner" role="status">{{ successMsg }}</div>

    <!-- Admin Organization Account Approval Section -->
    <section class="admin-org-panel" aria-labelledby="org-requests-heading">
      <div class="admin-org-header">
        <div>
          <h2 id="org-requests-heading">Organization Account Applications</h2>
          <p class="text-muted">
            Sign off on organization accounts before they can access candidate prospect insights.
          </p>
        </div>
      </div>

      <p v-if="loadingOrgRequests" class="text-muted">Loading organization requests…</p>
      <div v-else-if="orgRequests.length > 0" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Organization / Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Active Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="org in orgRequests" :key="org.id">
              <td>#{{ org.id }}</td>
              <td>
                <strong>{{ org.username }}</strong>
              </td>
              <td>{{ org.email }}</td>
              <td>
                <span :class="['status-pill', org.org_request_status]">
                  {{
                    org.org_request_status === 'pending'
                      ? '⏳ Pending Sign-Off'
                      : org.org_request_status === 'approved'
                        ? '✅ Approved'
                        : '✕ Declined'
                  }}
                </span>
              </td>
              <td>
                <span class="chip">{{ org.role }}</span>
              </td>
              <td class="row-actions">
                <button
                  v-if="org.role !== 'organization'"
                  type="button"
                  class="button button-accent button-sm"
                  :disabled="updatingOrgId === org.id"
                  @click="handleOrgRequest(org.id, 'approve')"
                >
                  Approve Org ✓
                </button>
                <button
                  v-if="org.org_request_status === 'pending' || org.role === 'organization'"
                  type="button"
                  class="button-danger button-sm"
                  :disabled="updatingOrgId === org.id"
                  @click="handleOrgRequest(org.id, 'reject')"
                >
                  {{ org.role === 'organization' ? 'Revoke Org' : 'Reject ✕' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted">No organization applications or accounts found.</p>
    </section>

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
    <p v-else-if="!loading" class="empty-state">Inga frågor hittades med detta filter.</p>

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
        <div class="modal-header">
          <h2 id="delete-title">Ta bort fråga #{{ pendingDelete.id }}?</h2>
          <button
            type="button"
            class="button-text"
            :disabled="deleting"
            @click="pendingDelete = null"
          >
            ✕ Stäng
          </button>
        </div>
        <div id="delete-description" class="modal-body">
          <p class="delete-question-text">“{{ pendingDelete.question_text }}”</p>
          <p class="text-muted">
            Den kommer inte längre dyka upp i nya quiz. Spelare som redan besvarat den behåller den i sin quizhistorik.
          </p>
        </div>
        <div class="modal-footer">
          <button
            ref="cancelDeleteButton"
            class="button button-outline"
            :disabled="deleting"
            @click="pendingDelete = null"
          >
            Avbryt
          </button>
          <button class="button button-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Tar bort…' : 'Ta bort frågan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
