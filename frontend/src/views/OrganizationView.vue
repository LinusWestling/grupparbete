<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../services/api'

const prospects = ref([])
const searchQuery = ref('')
const selectedMinLevel = ref(0)
const loading = ref(true)
const error = ref(null)

const selectedProspectDetails = ref(null)
const loadingDetails = ref(false)
const requestingId = ref(null)
const topics = ref([])
const testSettings = ref({ topicId: '', difficulty: 1, limit: 10 })
const assigning = ref(false)
const assignmentMessage = ref('')
const assignmentError = ref('')
const testReport = ref(null)

async function assignTest() {
  assigning.value = true
  assignmentError.value = ''
  assignmentMessage.value = ''
  try {
    const id = selectedProspectDetails.value.id
    const result = await api.assignTest(id, testSettings.value)
    selectedProspectDetails.value = await api.getProspectDetails(id)
    assignmentMessage.value = `Test #${result.quiz_id} tilldelat: ${result.total_questions} frågor på nivå ${result.difficulty}.`
  } catch (err) {
    assignmentError.value = err.message
  } finally {
    assigning.value = false
  }
}

async function inspectAssignedTest(quizId) {
  assignmentError.value = ''
  try {
    testReport.value = await api.getAssignedTestReport(selectedProspectDetails.value.id, quizId)
  } catch (err) {
    assignmentError.value = err.message
  }
}

function answerText(question) {
  if (question.is_skipped || !question.is_answered) return 'Överhoppad'
  if (question.question_type === 'matching' && question.submitted_answer) {
    return (question.answers || [])
      .map(
        (a) =>
          `${a.answer_text} → ${question.submitted_answer[a.id] ?? question.submitted_answer[String(a.id)] ?? '—'}`,
      )
      .join(' | ')
  }
  return (
    question.free_text_answer ??
    question.answers.find((a) => a.id === question.chosen_answer_id)?.answer_text ??
    'Inget svar'
  )
}

function correctAnswerForQuestion(question) {
  if (question.question_type === 'matching') {
    return (question.answers || []).map((a) => `${a.answer_text} → ${a.match_text}`).join(' | ')
  }
  return question.answers
    .filter((a) => a.is_correct)
    .map((a) => a.answer_text)
    .join(', ')
}

onMounted(() => {
  fetchProspects()
})

let searchTimeout = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProspects()
  }, 300)
})

async function fetchProspects() {
  try {
    loading.value = true
    error.value = null
    prospects.value = await api.getProspects(searchQuery.value)
  } catch (err) {
    error.value = 'Kunde inte hämta kandidater: ' + err.message
  } finally {
    loading.value = false
  }
}

const filteredProspects = computed(() => {
  if (!selectedMinLevel.value) return prospects.value
  return prospects.value.filter(
    (p) => p.access_status === 'approved' && p.overall_level >= Number(selectedMinLevel.value),
  )
})

async function requestAccess(prospect) {
  if (requestingId.value) return
  try {
    requestingId.value = prospect.id
    const res = await api.requestProspectAccess(prospect.id)
    prospect.access_status = res.access_status || 'pending'
  } catch (err) {
    alert('Kunde inte begära åtkomst: ' + err.message)
  } finally {
    requestingId.value = null
  }
}

async function inspectProspect(prospectId) {
  try {
    loadingDetails.value = true
    assignmentMessage.value = ''
    assignmentError.value = ''
    testReport.value = null
    topics.value = await api.getTopics()
    selectedProspectDetails.value = await api.getProspectDetails(prospectId)
  } catch (err) {
    alert('Kunde inte hämta kandidatuppgifter: ' + err.message)
  } finally {
    loadingDetails.value = false
  }
}

function closeDetailsModal() {
  selectedProspectDetails.value = null
}
</script>

<template>
  <div class="org-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">REKRYTERING OCH KANDIDATÖVERSIKT</p>
        <h1>Översikt över kandidaternas kunskaper</h1>
        <p class="heading-description">
          Hitta användare som valt att synas som kandidater och begär tillstånd att se deras
          quizresultat. Granska ämneskunskaper och testhistorik för kandidater som godkänt din
          förfrågan.
        </p>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="search-filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Sök kandidater efter användarnamn…"
        aria-label="Sök kandidater"
      />
      <div class="filter-group">
        <label for="level-filter" class="text-sm font-semibold"
          >Lägsta nivå med godkänd åtkomst:</label
        >
        <select id="level-filter" v-model="selectedMinLevel" class="filter-select">
          <option :value="0">Alla kandidater</option>
          <option :value="1">Godkänd åtkomst, nivå 1+</option>
          <option :value="2">Godkänd åtkomst, nivå 2+</option>
          <option :value="3">Godkänd åtkomst, nivå 3+</option>
          <option :value="4">Godkänd åtkomst, nivå 4+</option>
          <option :value="5">Godkänd åtkomst, nivå 5 (PT-mästare)</option>
        </select>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">⚠️ {{ error }}</div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-muted text-center">Hämtar kandidater…</div>

    <!-- Empty State -->
    <div v-else-if="filteredProspects.length === 0" class="empty-state">
      <p>Inga kandidater matchar dina sökkriterier.</p>
    </div>

    <!-- Prospects Cards Grid -->
    <div v-else class="prospects-grid">
      <div v-for="p in filteredProspects" :key="p.id" class="prospect-card">
        <div class="prospect-header">
          <div class="prospect-avatar">
            {{ p.username ? p.username[0].toUpperCase() : 'K' }}
          </div>
          <div class="prospect-info">
            <span class="prospect-name">{{ p.username }}</span>
            <span :class="['status-pill', p.access_status]">
              {{
                p.access_status === 'approved'
                  ? '✅ Åtkomst godkänd'
                  : p.access_status === 'pending'
                    ? '⏳ Väntar på godkännande'
                    : p.access_status === 'rejected'
                      ? '✕ Åtkomst avslagen'
                      : '🔒 Resultaten är låsta'
              }}
            </span>
          </div>
        </div>

        <!-- Approved Candidate View -->
        <template v-if="p.access_status === 'approved'">
          <div class="prospect-stats-row">
            <div class="p-stat">
              <span class="p-val">Nivå {{ p.overall_level }}</span>
              <span class="p-lbl">Övergripande nivå</span>
            </div>
            <div class="p-stat">
              <span class="p-val">{{ p.quizzes_completed }}</span>
              <span class="p-lbl">Quiz</span>
            </div>
            <div class="p-stat">
              <span class="p-val">{{ p.accuracy_percentage }}%</span>
              <span class="p-lbl">Andel rätta svar</span>
            </div>
          </div>

          <div v-if="p.topic_progress && p.topic_progress.length > 0" class="topic-pills">
            <span v-for="tp in p.topic_progress" :key="tp.topic_id" class="topic-pill">
              {{ tp.topic_name }}: ⭐ Nivå {{ tp.level }}
            </span>
          </div>

          <button @click="inspectProspect(p.id)" class="button button-outline button-sm">
            Visa fullständig rapport ↗
          </button>
        </template>

        <!-- Unapproved / Locked Candidate View -->
        <template v-else>
          <div class="prospect-locked-box">
            <p class="text-muted">
              Detaljerade quizresultat och ämnesutveckling är privata tills
              <strong>{{ p.username }}</strong> godkänner din organisations förfrågan.
            </p>
          </div>

          <button
            v-if="p.access_status === 'pending'"
            class="button button-outline button-sm"
            disabled
          >
            ⏳ Väntar på kandidatens godkännande
          </button>
          <button
            v-else
            @click="requestAccess(p)"
            class="button button-accent button-sm"
            :disabled="requestingId === p.id"
          >
            {{
              requestingId === p.id
                ? 'Skickar förfrågan…'
                : p.access_status === 'rejected'
                  ? 'Begär åtkomst igen 🔒'
                  : 'Begär åtkomst till resultat 🔒'
            }}
          </button>
        </template>
      </div>
    </div>

    <!-- Inspect Prospect Modal -->
    <div v-if="selectedProspectDetails" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Kandidat: {{ selectedProspectDetails.username }}</h2>
          <button @click="closeDetailsModal" class="button-text">✕ Stäng</button>
        </div>

        <div class="modal-body">
          <section class="details-section assign-test-section">
            <div class="assign-test-card">
              <h3>Tilldela ett test</h3>
              <form class="assign-test-form" @submit.prevent="assignTest">
                <label class="form-group">
                  <span class="form-label">Ämne</span>
                  <select v-model="testSettings.topicId" required class="filter-select">
                    <option disabled value="">Välj ämne</option>
                    <option v-for="topic in topics" :key="topic.id" :value="topic.id">
                      {{ topic.name }}
                    </option>
                  </select>
                </label>
                <label class="form-group">
                  <span class="form-label">Svårighetsgrad</span>
                  <select v-model="testSettings.difficulty" class="filter-select">
                    <option v-for="level in 5" :key="level" :value="level">{{ level }}</option>
                  </select>
                </label>
                <label class="form-group">
                  <span class="form-label">Antal frågor</span>
                  <input
                    v-model.number="testSettings.limit"
                    type="number"
                    min="1"
                    max="50"
                    required
                  />
                </label>
                <button class="button button-accent" :disabled="assigning">
                  {{ assigning ? 'Tilldelar…' : 'Tilldela test' }}
                </button>
              </form>
              <p class="text-muted form-help-text">
                Antalet frågor beror på hur många som finns tillgängliga. Om den valda nivån saknar
                frågor används den närmaste tillgängliga nivån.
              </p>
              <p v-if="assignmentMessage" role="status" class="success-banner">
                {{ assignmentMessage }}
              </p>
              <p v-if="assignmentError" role="alert" class="error-banner">{{ assignmentError }}</p>
            </div>

            <div class="assigned-tests-section">
              <h3>Tilldelade test</h3>
              <p v-if="!selectedProspectDetails.assignments?.length" class="text-muted">
                Inga test har tilldelats ännu.
              </p>
              <div v-else class="assigned-tests-list">
                <div
                  v-for="test in selectedProspectDetails.assignments"
                  :key="test.quiz_id"
                  class="assigned-test-card"
                >
                  <div class="assigned-test-header">
                    <div class="assigned-test-badges">
                      <strong>#{{ test.quiz_id }}</strong>
                      <span class="badge">{{ test.topic_name }}</span>
                      <span class="chip">⭐ Nivå {{ test.difficulty }}</span>
                    </div>
                    <span
                      :class="['status-pill', test.status === 'completed' ? 'approved' : 'pending']"
                    >
                      {{ test.status === 'completed' ? '✅ Slutfört' : '⏳ Väntar på slutförande' }}
                    </span>
                  </div>
                  <p class="assigned-test-meta">
                    {{ test.total_cnt }} frågor
                    <template v-if="test.status === 'completed'">
                      · {{ test.correct_cnt }} rätt · {{ test.total_cnt - test.correct_cnt }} fel
                      (inklusive överhoppade)
                    </template>
                  </p>
                  <button
                    v-if="test.status === 'completed'"
                    class="button button-outline button-sm"
                    @click="inspectAssignedTest(test.quiz_id)"
                  >
                    Visa svar
                  </button>
                </div>
              </div>
            </div>

            <section
              v-if="testReport"
              class="assigned-test-report"
              aria-label="Resultat för tilldelat test"
            >
              <div class="assigned-report-header">
                <div>
                  <h3>Resultat för test #{{ testReport.quiz_id }}</h3>
                  <p class="text-muted">
                    {{ testReport.correct_cnt }} rätt ·
                    {{ testReport.total_cnt - testReport.correct_cnt }} fel (inklusive överhoppade)
                  </p>
                </div>
                <button type="button" class="button-text" @click="testReport = null">
                  ✕ Dölj svar
                </button>
              </div>
              <div class="results-list">
                <div
                  v-for="question in testReport.questions"
                  :key="question.question_id"
                  :class="['result-item', question.is_correct ? 'correct' : 'incorrect']"
                >
                  <span class="status-icon">{{
                    question.is_skipped || !question.is_answered
                      ? '⏭️'
                      : question.is_correct
                        ? '✅'
                        : '❌'
                  }}</span>
                  <div class="result-details">
                    <strong>{{ question.position }}. {{ question.question_text }}</strong>
                    <p>
                      {{
                        question.is_correct
                          ? 'Rätt'
                          : question.is_skipped || !question.is_answered
                            ? 'Fel (överhoppad)'
                            : 'Fel'
                      }}
                      · Kandidatens svar: {{ answerText(question) }}
                    </p>
                    <p>
                      Rätt svar:
                      {{ correctAnswerForQuestion(question) }}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </section>
          <div class="prospect-meta-grid">
            <div class="stat-card">
              <span class="value">Nivå {{ selectedProspectDetails.overall_level }}</span>
              <span class="label">Övergripande kvalifikationsnivå</span>
            </div>
            <div class="stat-card">
              <span class="value">{{ selectedProspectDetails.total_xp }} XP</span>
              <span class="label">Totalt intjänade XP</span>
            </div>
            <div class="stat-card">
              <span class="value">{{ selectedProspectDetails.accuracy_percentage }}%</span>
              <span class="label">Total andel rätta svar</span>
            </div>
            <div class="stat-card">
              <span class="value">{{ selectedProspectDetails.total_answered }}</span>
              <span class="label">Besvarade frågor</span>
            </div>
          </div>

          <!-- Topic Mastery -->
          <div class="details-section">
            <h3>Ämnesöversikt och kunskapsnivå</h3>
            <div v-if="selectedProspectDetails.topic_progress.length > 0" class="progress-list">
              <div
                v-for="tp in selectedProspectDetails.topic_progress"
                :key="tp.id || tp.topic_id"
                class="tp-item"
              >
                <div class="tp-info">
                  <div class="tp-title">
                    <strong>{{ tp.topic_name }}</strong>
                    <span class="badge">⭐ Nivå {{ tp.level }}</span>
                  </div>
                  <span>{{ tp.xp }} XP</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ '--progress-width': (tp.level >= 5 ? 100 : tp.xp % 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <p v-else class="text-muted">Inga ämnesframsteg har registrerats för denna kandidat.</p>
          </div>

          <!-- Quiz History -->
          <div class="details-section">
            <h3>Historik över genomförda quiz</h3>
            <div v-if="selectedProspectDetails.quiz_history.length > 0" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Quiz #</th>
                    <th>Ämne</th>
                    <th>Svårighetsgrad</th>
                    <th>Poäng / andel rätta svar</th>
                    <th>Slutförandedatum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in selectedProspectDetails.quiz_history" :key="q.quiz_id">
                    <td>#{{ q.quiz_id }}</td>
                    <td>
                      <span class="badge">{{ q.topic_name }}</span>
                    </td>
                    <td>⭐ Nivå {{ q.difficulty }}</td>
                    <td>
                      <strong>{{ q.correct_cnt }} / {{ q.total_cnt }}</strong>
                      <span class="text-muted">
                        ({{
                          q.total_cnt > 0 ? Math.round((q.correct_cnt / q.total_cnt) * 100) : 0
                        }}%)
                      </span>
                    </td>
                    <td>{{ new Date(q.completed_at).toLocaleString('sv-SE') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted">Inga genomförda quiz hittades för denna kandidat.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailsModal" class="button button-outline">Stäng rapport</button>
        </div>
      </div>
    </div>
  </div>
</template>
