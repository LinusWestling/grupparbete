<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { api } from '../services/api'
import QuestionForm from '../components/QuestionForm.vue'
import { QUESTION_TYPE_LABELS } from '../services/questionTypes.js'
import { ROLE_LABELS } from '../services/roles.js'

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
    error.value = 'Det gick inte att läsa in ämnen: ' + err.message
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
        ? 'Organisationskontot har godkänts.'
        : 'Ansökan om organisationskonto har avslagits eller åtkomsten har återkallats.'
    await loadOrgRequests()
  } catch (err) {
    error.value = 'Det gick inte att uppdatera organisationsansökan: ' + err.message
  } finally {
    updatingOrgId.value = null
  }
}

async function loadQuestions() {
  loading.value = true
  try {
    questions.value = await api.getAdminQuestions(filters.value)
  } catch (err) {
    error.value = 'Det gick inte att läsa in frågor: ' + err.message
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
    error.value = 'Det gick inte att öppna frågan: ' + err.message
  }
}

async function onSaved(saved) {
  successMsg.value =
    editing.value === 'new' ? `Fråga #${saved.id} har skapats.` : `Fråga #${saved.id} har sparats.`
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
    successMsg.value = `Fråga #${pendingDelete.value.id} har tagits bort.`
    if (editing.value?.id === pendingDelete.value.id) editing.value = null
    pendingDelete.value = null
    await loadQuestions()
  } catch (err) {
    error.value = 'Det gick inte att ta bort frågan: ' + err.message
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
        <p class="eyebrow">ADMINISTRATION · PLATTFORM OCH QUIZINNEHÅLL</p>
        <h1>Hantera frågor och organisationer</h1>
        <p class="heading-description">
          Granska ansökningar om organisationskonton och lägg till, redigera eller ta bort
          quizfrågor.
        </p>
      </div>
      <button v-if="editing !== 'new'" class="button button-accent" @click="openForm(null)">
        + Ny fråga
      </button>
    </div>

    <div v-if="error" class="banner error-banner" role="alert">{{ error }}</div>
    <div v-if="successMsg" class="banner success-banner" role="status">{{ successMsg }}</div>

    <!-- Admin Organization Account Approval Section -->
    <section class="admin-org-panel" aria-labelledby="org-requests-heading">
      <div class="admin-org-header">
        <div>
          <h2 id="org-requests-heading">Ansökningar om organisationskonton</h2>
          <p class="text-muted">
            Godkänn organisationskonton innan de får tillgång till kandidatöversikten.
          </p>
        </div>
      </div>

      <p v-if="loadingOrgRequests" class="text-muted">Läser in organisationsansökningar…</p>
      <div v-else-if="orgRequests.length > 0" class="table-container">
        <table class="data-table" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader">ID</th>
              <th role="columnheader">Organisation / användarnamn</th>
              <th role="columnheader">E-post</th>
              <th role="columnheader">Status</th>
              <th role="columnheader">Aktiv roll</th>
              <th role="columnheader">Åtgärder</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            <tr v-for="org in orgRequests" :key="org.id" role="row">
              <td role="cell" data-label="ID">#{{ org.id }}</td>
              <td role="cell" data-label="Organisation / användarnamn">
                <strong>{{ org.username }}</strong>
              </td>
              <td role="cell" data-label="E-post">{{ org.email }}</td>
              <td role="cell" data-label="Status">
                <span :class="['status-pill', org.org_request_status]">
                  {{
                    org.org_request_status === 'pending'
                      ? '⏳ Väntar på godkännande'
                      : org.org_request_status === 'approved'
                        ? '✅ Godkänd'
                        : '✕ Avslagen'
                  }}
                </span>
              </td>
              <td role="cell" data-label="Aktiv roll">
                <span class="chip">{{ ROLE_LABELS[org.role] ?? 'Okänd roll' }}</span>
              </td>
              <td role="cell" data-label="Åtgärder" class="row-actions">
                <div class="row-actions-group">
                  <button
                    v-if="org.role !== 'organization'"
                    type="button"
                    class="button button-accent button-sm"
                    :disabled="updatingOrgId === org.id"
                    @click="handleOrgRequest(org.id, 'approve')"
                  >
                    Godkänn organisation ✓
                  </button>
                  <button
                    v-if="org.org_request_status === 'pending' || org.role === 'organization'"
                    type="button"
                    class="button-danger button-sm"
                    :disabled="updatingOrgId === org.id"
                    @click="handleOrgRequest(org.id, 'reject')"
                  >
                    {{ org.role === 'organization' ? 'Återkalla organisationsåtkomst' : 'Avslå ✕' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-muted">
        Inga organisationsansökningar eller organisationskonton hittades.
      </p>
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
        placeholder="Sök i frågetext…"
        aria-label="Sök i frågetext"
      />
      <select v-model="filters.topicId" class="question-filter" aria-label="Filtrera efter ämne">
        <option value="">Alla ämnen</option>
        <option v-for="t in topics" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <select v-model="filters.type" class="question-filter" aria-label="Filtrera efter frågetyp">
        <option value="">Alla frågetyper</option>
        <option v-for="(label, value) in QUESTION_TYPE_LABELS" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
      <select
        v-model="filters.difficulty"
        class="question-filter"
        aria-label="Filtrera efter svårighetsgrad"
      >
        <option value="">Alla nivåer</option>
        <option v-for="level in 5" :key="level" :value="level">Nivå {{ level }}</option>
      </select>
      <button type="button" class="button button-outline button-sm" @click="clearFilters">
        Rensa
      </button>
    </div>

    <p class="text-muted" aria-live="polite">
      {{
        loading
          ? 'Läser in frågor…'
          : `${questions.length} ${questions.length === 1 ? 'fråga' : 'frågor'}`
      }}
    </p>

    <div v-if="!loading && questions.length" class="table-container">
      <table class="data-table" role="table">
        <thead role="rowgroup">
          <tr role="row">
            <th role="columnheader">ID</th>
            <th role="columnheader">Fråga</th>
            <th role="columnheader">Ämne</th>
            <th role="columnheader">Frågetyp</th>
            <th role="columnheader">Nivå</th>
            <th role="columnheader">Användningar</th>
            <th role="columnheader"><span class="sr-only">Åtgärder</span></th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <tr
            v-for="q in questions"
            :key="q.id"
            role="row"
            :class="{ 'is-editing': editing?.id === q.id }"
          >
            <td role="cell" data-label="ID">#{{ q.id }}</td>
            <td role="cell" data-label="Fråga" class="question-col">
              <div>
                {{ q.question_text }}
                <span class="correct-answer">✓ {{ correctAnswerText(q) }}</span>
              </div>
            </td>
            <td role="cell" data-label="Ämne">
              <span class="chip">{{ q.topic_name }}</span>
            </td>
            <td role="cell" data-label="Frågetyp">{{ QUESTION_TYPE_LABELS[q.question_type] }}</td>
            <td role="cell" data-label="Nivå">{{ q.difficulty_level }}</td>
            <td role="cell" data-label="Användningar">{{ q.usage_count }}</td>
            <td role="cell" data-label="Åtgärder" class="row-actions">
              <div class="row-actions-group">
                <button class="button button-outline button-sm" @click="openForm(q)">
                  Redigera
                </button>
                <button class="button-danger button-sm" @click="askDelete(q)">Ta bort</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="empty-state">Inga frågor matchar filtren.</p>

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
            Frågan visas inte längre i nya quiz. Användare som redan har besvarat den behåller den i
            sin quizhistorik.
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
