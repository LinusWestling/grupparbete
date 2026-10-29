<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { currentUser, loadCurrentUser, clearCurrentUser } from '../services/auth'
import { ROLE_LABELS } from '../services/roles.js'

const router = useRouter()

const user = ref(null)
const progress = ref(null)
const history = ref([])
const accessRequests = ref([])
const selectedQuizDetails = ref(null)
const showLevelModal = ref(false)
const loading = ref(true)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref(null)
const loggingOut = ref(false)
const logoutError = ref('')

const authMode = ref('login')
const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')
const regRequestOrg = ref(false)
const registering = ref(false)
const regError = ref(null)
const regSuccess = ref(null)

const levelDefinitions = [
  {
    level: 1,
    name: 'Nybörjare',
    xpRequired: 0,
    xpRange: '0 – 99 XP',
    badge: '🔰 Nybörjarmärke',
    quizAccess: 'Quiz på nivå 1',
    benefits: 'Gör quiz, följ dina framsteg och lär dig grunderna i anatomi och träningslära.',
  },
  {
    level: 2,
    name: 'Medel',
    xpRequired: 100,
    xpRange: '100 – 199 XP',
    badge: '🥉 Bronslärd',
    quizAccess: 'Quiz på nivå 2',
    benefits: 'Låser upp frågor på medelnivå (nivå 2) och 5 % extra XP.',
  },
  {
    level: 3,
    name: 'Avancerad',
    xpRequired: 200,
    xpRange: '200 – 299 XP',
    badge: '🥈 Silvermästare',
    quizAccess: 'Quiz på nivå 3',
    benefits: 'Låser upp avancerade frågor på nivå 3 samt egna profilmärken och titlar.',
  },
  {
    level: 4,
    name: 'Expert',
    xpRequired: 300,
    xpRange: '300 – 399 XP',
    badge: '🥇 Guldexpert',
    quizAccess: 'Quiz på nivå 4',
    benefits:
      'Låser upp expertutmaningar på nivå 4 och behörighet att granska andra användares frågor.',
  },
  {
    level: 5,
    name: 'PT-kandidat / mästare',
    xpRequired: 400,
    xpRange: '400+ XP',
    badge: '💎 Diamantlegend',
    quizAccess: 'Quiz på nivå 5',
    benefits:
      'Låser upp frågor på PT-provets nivå (nivå 5) och visar om du är redo för certifiering.',
  },
]

const totalXp = computed(() => {
  if (!progress.value || !progress.value.progress_by_topic) return 0
  return progress.value.progress_by_topic.reduce((sum, tp) => sum + (tp.xp || 0), 0)
})

const overallLevel = computed(() => {
  return Math.min(5, Math.floor(totalXp.value / 100) + 1)
})

const xpInCurrentLevel = computed(() => {
  if (overallLevel.value >= 5) return 100
  return totalXp.value % 100
})

const xpToNextLevel = computed(() => {
  if (overallLevel.value >= 5) return 0
  return 100 - (totalXp.value % 100)
})

let profileLoadToken = 0

onMounted(async () => {
  await loadUserData()
})

watch(currentUser, (newUser) => {
  if (!newUser) {
    profileLoadToken++
    user.value = null
    progress.value = null
    history.value = []
    accessRequests.value = []
    selectedQuizDetails.value = null
    showLevelModal.value = false
    loginPassword.value = ''
    regPassword.value = ''
    regConfirmPassword.value = ''
    authMode.value = 'login'
  }
})

async function loadUserData({ force = false } = {}) {
  const token = ++profileLoadToken
  try {
    loading.value = true
    const fetchedUser = await loadCurrentUser({ force })
    if (token !== profileLoadToken) return
    user.value = fetchedUser
    if (fetchedUser) {
      const [progData, histData, reqData] = await Promise.all([
        api.getUserProgress(fetchedUser.id),
        api.getQuizHistory(),
        fetchedUser.role === 'user'
          ? api.getMyAccessRequests().catch(() => [])
          : Promise.resolve([]),
      ])
      if (token !== profileLoadToken || currentUser.value?.id !== fetchedUser.id) return
      progress.value = progData
      history.value = histData
      accessRequests.value = reqData || []
    }
  } catch (err) {
    // Guest mode
  } finally {
    if (token === profileLoadToken) loading.value = false
  }
}

async function handleLogout() {
  if (loggingOut.value) return

  loggingOut.value = true
  logoutError.value = ''

  try {
    await api.logout()
    profileLoadToken++

    user.value = null
    progress.value = null
    history.value = []
    accessRequests.value = []
    selectedQuizDetails.value = null
    showLevelModal.value = false

    loginPassword.value = ''
    regPassword.value = ''
    regConfirmPassword.value = ''
    authMode.value = 'login'

    clearCurrentUser()
  } catch (error) {
    logoutError.value = 'Kunde inte logga ut: ' + error.message
  } finally {
    loggingOut.value = false
  }
}

async function handleLogin() {
  try {
    loginError.value = null
    user.value = await api.login(loginEmail.value, loginPassword.value)
    await loadUserData({ force: true })
  } catch (err) {
    loginError.value = 'Kunde inte logga in: ' + err.message
  }
}

async function handleRegister() {
  if (registering.value) return

  regError.value = null
  regSuccess.value = null

  if (regUsername.value.trim().length < 3) {
    regError.value = 'Användarnamnet måste vara minst 3 tecken långt.'
    return
  }
  if (regPassword.value.length < 15) {
    regError.value = 'Lösenordet måste vara minst 15 tecken långt.'
    return
  }
  if (regPassword.value !== regConfirmPassword.value) {
    regError.value = 'Lösenorden stämmer inte överens.'
    return
  }

  registering.value = true
  try {
    await api.register(
      regUsername.value.trim(),
      regEmail.value.trim(),
      regPassword.value,
      regRequestOrg.value,
    )

    regSuccess.value = regRequestOrg.value
      ? 'Kontot har skapats! Din ansökan om organisationskonto väntar på administratörens godkännande. Loggar in…'
      : 'Kontot har skapats! Loggar in…'
    user.value = await api.login(regEmail.value.trim(), regPassword.value)
    await loadUserData({ force: true })
  } catch (err) {
    regError.value = 'Kunde inte skapa kontot: ' + err.message
  } finally {
    registering.value = false
  }
}

async function handlePrivacyToggle(event) {
  const isChecked = event.target.checked
  try {
    await api.updateUserPrivacy(isChecked)
    if (user.value) {
      user.value.is_public_prospect = isChecked
    }
  } catch (err) {
    alert('Kunde inte uppdatera integritetsinställningarna: ' + err.message)
    event.target.checked = !isChecked
  }
}

async function handleAccessRequestResponse(requestId, status) {
  try {
    await api.respondToAccessRequest(requestId, status)
    accessRequests.value = await api.getMyAccessRequests()
  } catch (err) {
    alert('Kunde inte uppdatera organisationens åtkomstförfrågan: ' + err.message)
  }
}

async function inspectQuizDetails(quizId) {
  try {
    selectedQuizDetails.value = await api.getQuizDetails(quizId)
  } catch (err) {
    alert('Kunde inte hämta detaljer för quiz #' + quizId)
  }
}

function retakeQuiz(topicId, difficulty) {
  selectedQuizDetails.value = null
  router.push({
    path: '/explore',
    query: {
      topicId: String(topicId),
      difficulty: String(difficulty),
      autoStart: 'true',
    },
  })
}

function getUserAnswerText(q) {
  if (q.question_type === 'free_text') {
    return q.free_text_answer
      ? `"${q.free_text_answer}"`
      : q.is_skipped
        ? 'Överhoppad'
        : 'Inget svar angivet'
  }
  if (q.question_type === 'matching') {
    if (q.is_skipped) return 'Överhoppad'
    const map =
      q.submitted_answer && typeof q.submitted_answer === 'object' ? q.submitted_answer : null
    if (!map) return 'Inget svar valt'
    return (q.answers || [])
      .map((a) => `${a.answer_text} → ${map[a.id] ?? map[String(a.id)] ?? '—'}`)
      .join(' | ')
  }
  const opt = q.answers?.find((a) => a.id === q.chosen_answer_id)
  return opt ? opt.answer_text : q.is_skipped ? 'Överhoppad' : 'Inget svar valt'
}

function getCorrectAnswerText(q) {
  if (q.question_type === 'matching') {
    return (q.answers || []).map((a) => `${a.answer_text} → ${a.match_text}`).join(' | ')
  }
  const opt = q.answers?.find((a) => a.is_correct)
  return opt ? opt.answer_text : 'Ej tillgängligt'
}

function getSourceUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}
</script>

<template>
  <div class="profile-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">ANVÄNDARPROFIL OCH HISTORIK</p>
        <h1>Mina framsteg och min quizhistorik</h1>
        <p class="heading-description">
          Följ dina intjänade XP och framsteg i svårighetsgrad (nivå 1–5) och se detaljerad historik
          över genomförda quiz.
        </p>
      </div>
    </div>

    <!-- Logged in state -->
    <div v-if="user" class="profile-card">
      <p v-if="logoutError" class="error-banner" role="alert">
        {{ logoutError }}
      </p>
      <div class="user-header">
        <div class="avatar-large">{{ user.username ? user.username[0].toUpperCase() : 'A' }}</div>
        <div>
          <div class="user-title-row">
            <h2>{{ user.username }}</h2>
            <button
              class="level-pill-button"
              @click="showLevelModal = true"
              title="Visa nivåöversikt och belöningar"
            >
              ⭐ Övergripande nivå {{ overallLevel }} ℹ️
            </button>
          </div>
          <p class="text-muted">
            {{ user.email }} • Roll: {{ ROLE_LABELS[user.role] ?? 'Okänd roll' }}
          </p>
        </div>
      </div>

      <!-- Organization Account Application Status -->
      <div
        v-if="user.role === 'user' && user.org_request_status === 'pending'"
        class="org-status-banner pending"
      >
        <strong>⏳ Ansökan om organisationskonto väntar på godkännande</strong>
        <p class="text-muted">
          Din ansökan om att uppgradera kontot till ett organisationskonto väntar på
          administratörens godkännande. När den godkänts får du tillgång till kandidatöversikten.
        </p>
      </div>
      <div
        v-else-if="user.role === 'user' && user.org_request_status === 'rejected'"
        class="org-status-banner rejected"
      >
        <strong>✕ Ansökan om organisationskonto har avslagits</strong>
        <p class="text-muted">
          Din ansökan om organisationskonto har avslagits av en administratör.
        </p>
      </div>

      <!-- Prospect Privacy & Per-Organization Consent (Regular Users) -->
      <div v-if="user.role === 'user'" class="privacy-section">
        <label class="privacy-toggle">
          <input
            type="checkbox"
            :checked="!!user.is_public_prospect"
            @change="handlePrivacyToggle($event)"
          />
          <span>Synlig som kandidat för verifierade organisationer</span>
        </label>
        <p class="text-muted">
          När detta är aktiverat kan verifierade organisationer hitta ditt användarnamn och begära
          att få se dina quizresultat. Dina resultat och din historik delas bara med organisationer
          som du godkänner nedan.
        </p>

        <div class="access-requests-panel">
          <h4>Organisationers åtkomstförfrågningar och behörigheter</h4>
          <div v-if="accessRequests.length > 0" class="access-requests-list">
            <div v-for="req in accessRequests" :key="req.id" class="access-request-item">
              <div class="access-request-info">
                <strong>🏢 {{ req.organization_username }}</strong>
                <span :class="['status-pill', req.status]">
                  {{
                    req.status === 'pending'
                      ? '⏳ Väntar på godkännande'
                      : req.status === 'approved'
                        ? '✅ Godkänd'
                        : '✕ Avslagen / återkallad'
                  }}
                </span>
              </div>
              <div class="access-request-actions">
                <button
                  v-if="req.status !== 'approved'"
                  type="button"
                  class="button button-accent button-sm"
                  @click="handleAccessRequestResponse(req.id, 'approved')"
                >
                  Godkänn åtkomst ✓
                </button>
                <button
                  v-if="req.status === 'pending'"
                  type="button"
                  class="button button-outline button-sm"
                  @click="handleAccessRequestResponse(req.id, 'rejected')"
                >
                  Avslå ✕
                </button>
                <button
                  v-if="req.status === 'approved'"
                  type="button"
                  class="button button-outline button-sm"
                  @click="handleAccessRequestResponse(req.id, 'rejected')"
                >
                  Återkalla åtkomst
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">
            Inga organisationer har begärt åtkomst till dina resultat ännu.
          </p>
        </div>
      </div>

      <!-- XP Progression Overview Bar -->
      <div v-if="progress" class="overall-xp-section">
        <div class="xp-header-row">
          <span class="xp-title">XP-utveckling på plattformen</span>
          <span class="xp-value">
            <strong>{{ totalXp }} XP totalt</strong>
            <template v-if="overallLevel < 5">
              ({{ xpToNextLevel }} XP till nivå {{ overallLevel + 1 }})
            </template>
            <template v-else>
              • <span class="text-success">👑 Högsta nivån uppnådd!</span>
            </template>
          </span>
        </div>
        <div class="progress-bar lg">
          <div class="progress-fill" :style="{ '--progress-width': xpInCurrentLevel + '%' }"></div>
        </div>
      </div>

      <div v-if="progress" class="progress-stats">
        <div class="stat-card">
          <span class="value">{{ progress.total_answered }}</span>
          <span class="label">Besvarade frågor</span>
        </div>
        <div class="stat-card">
          <span class="value">{{ progress.total_correct }}</span>
          <span class="label">Rätta svar</span>
        </div>
        <div class="stat-card">
          <span class="value">
            {{
              progress.total_answered > 0
                ? Math.round((progress.total_correct / progress.total_answered) * 100)
                : 0
            }}%
          </span>
          <span class="label">Total andel rätta svar</span>
        </div>
        <div class="stat-card clickable" @click="showLevelModal = true">
          <span class="value">Nivå {{ overallLevel }}</span>
          <span class="label">Nuvarande nivå (detaljer ℹ️)</span>
        </div>
      </div>

      <!-- Ämneskunskaper -->
      <div class="topic-progress-section">
        <h3>Ämneskunskaper</h3>
        <div v-if="progress && progress.progress_by_topic.length > 0" class="progress-list">
          <div v-for="tp in progress.progress_by_topic" :key="tp.id" class="tp-item">
            <div class="tp-info">
              <div class="tp-title">
                <strong>{{ tp.topic_name }}</strong>
                <button
                  class="level-chip-clickable"
                  @click="showLevelModal = true"
                  title="Visa nivåöversikt och förmåner"
                >
                  ⭐ Nivå {{ tp.level }} ℹ️
                </button>
              </div>
              <span>{{ tp.xp }} XP</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ '--progress-width': (tp.level >= 5 ? 100 : tp.xp % 100) + '%' }"
              ></div>
            </div>
            <div class="xp-next-level">
              <span v-if="tp.level < 5">
                <strong>{{ 100 - (tp.xp % 100) }} XP</strong> behövs för att nå nivå
                {{ tp.level + 1 }}
              </span>
              <span v-else class="text-success"> 👑 Högsta nivån uppnådd! </span>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">Gör ett quiz under Utforska kunskap för att börja samla XP!</p>
      </div>

      <!-- Quiz History Table -->
      <div class="history-section">
        <h3>Historik över genomförda quiz</h3>
        <div v-if="history.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Quiz #</th>
                <th>Ämne</th>
                <th>Svårighetsgrad</th>
                <th>Poäng / andel rätta svar</th>
                <th>Slutförandedatum</th>
                <th>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in history" :key="q.quiz_id">
                <td>#{{ q.quiz_id }}</td>
                <td>
                  <span class="badge">{{ q.topic_name }}</span>
                </td>
                <td>
                  <button
                    class="level-chip-clickable"
                    @click="showLevelModal = true"
                    title="Visa nivåöversikt"
                  >
                    ⭐ Nivå {{ q.difficulty }}
                  </button>
                </td>
                <td>
                  <strong>{{ q.correct_cnt }} / {{ q.total_cnt }}</strong>
                  <span class="text-muted">
                    ({{ q.total_cnt > 0 ? Math.round((q.correct_cnt / q.total_cnt) * 100) : 0 }}%)
                    +{{ q.total_score }} XP
                  </span>
                </td>
                <td>{{ new Date(q.completed_at).toLocaleString('sv-SE') }}</td>
                <td>
                  <button
                    @click="inspectQuizDetails(q.quiz_id)"
                    class="button button-outline button-sm"
                  >
                    Visa rapport ↗
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted">
          Inga genomförda quiz ännu. Starta ett quiz under Utforska kunskap!
        </p>
      </div>
      <button
        type="button"
        class="button button-outline button-logout"
        :disabled="loggingOut"
        @click="handleLogout"
      >
        {{ loggingOut ? 'Loggar ut…' : 'Logga ut' }}
      </button>
    </div>

    <!-- Quiz Inspection Modal -->
    <div v-if="selectedQuizDetails" class="modal-overlay" @click.self="selectedQuizDetails = null">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detaljerad rapport för quiz #{{ selectedQuizDetails.id }}</h2>
          <button @click="selectedQuizDetails = null" class="button-text">✕ Stäng</button>
        </div>

        <div class="modal-body">
          <div class="meta-row">
            <p class="meta">
              Ämne: <strong>{{ selectedQuizDetails.topic_name }}</strong> | Svårighetsgrad: ⭐ Nivå
              {{ selectedQuizDetails.difficulty }} | Poäng: +{{ selectedQuizDetails.total_score }}
              XP
            </p>
            <button
              @click="retakeQuiz(selectedQuizDetails.topic_id, selectedQuizDetails.difficulty)"
              class="button button-accent button-sm"
            >
              Gör quizet igen 🔄
            </button>
          </div>

          <div class="results-list">
            <div
              v-for="q in selectedQuizDetails.questions"
              :key="q.question_id"
              :class="['result-item', q.is_correct ? 'correct' : 'incorrect']"
            >
              <span class="status-icon">{{ q.is_correct ? '✅' : '❌' }}</span>
              <div class="result-details">
                <p class="question-title">
                  <strong>Fråga {{ q.position }}: {{ q.question_text }}</strong>
                </p>

                <div class="answers-comparison">
                  <p>
                    <strong>Ditt svar:</strong>
                    <span :class="q.is_correct ? 'text-success' : 'text-danger'">
                      {{ getUserAnswerText(q) }}
                    </span>
                  </p>
                  <p v-if="!q.is_correct" class="correct-answer-line">
                    <strong>Rätt svar:</strong>
                    <span class="text-success">{{ getCorrectAnswerText(q) }}</span>
                  </p>
                </div>

                <!-- Hyperlinked Source(s) -->
                <div v-if="q.sources && q.sources.length > 0" class="source-container">
                  <span class="source-label">📖 Källa:</span>
                  <span v-for="src in q.sources" :key="src.id || src.source_text">
                    <a
                      v-if="src.url"
                      :href="getSourceUrl(src.url)"
                      target="_blank"
                      rel="noopener"
                      class="source-link"
                    >
                      {{ src.source_text }} ↗
                    </a>
                    <span v-else class="source-text">{{ src.source_text }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="retakeQuiz(selectedQuizDetails.topic_id, selectedQuizDetails.difficulty)"
            class="button button-accent"
          >
            Gör quizet igen 🔄
          </button>
          <button @click="selectedQuizDetails = null" class="button button-outline">
            Stäng rapport
          </button>
        </div>
      </div>
    </div>

    <!-- Level Breakdown & Progression Diagram Modal -->
    <div v-if="showLevelModal" class="modal-overlay" @click.self="showLevelModal = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>🏆 Nivåutveckling och krav</h2>
          <button @click="showLevelModal = false" class="button-text">✕ Stäng</button>
        </div>

        <div class="modal-body">
          <p class="heading-description">
            Samla XP genom att göra quiz. Varje 100 XP låser upp nästa nivå och ger tillgång till
            svårare frågor och belöningar på plattformen.
          </p>

          <!-- Visual Step Diagram -->
          <div class="level-diagram-container">
            <h3>Översikt över din nivåutveckling</h3>
            <div class="level-stepper">
              <div
                v-for="item in levelDefinitions"
                :key="item.level"
                :class="[
                  'step-card',
                  {
                    active: overallLevel === item.level,
                    completed: overallLevel > item.level,
                    locked: overallLevel < item.level,
                  },
                ]"
              >
                <div class="step-badge-icon">
                  {{ overallLevel > item.level ? '✅' : overallLevel === item.level ? '⭐' : '🔒' }}
                </div>
                <div class="step-level-num">Nivå {{ item.level }}</div>
                <div class="step-xp-range">{{ item.xpRange }}</div>
                <div class="step-status">
                  {{
                    overallLevel > item.level
                      ? 'Avklarad'
                      : overallLevel === item.level
                        ? 'Nuvarande nivå'
                        : 'Låst'
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Level Rewards Breakdown -->
          <div class="level-table-container">
            <h3>Nivåer, upplåsningar och belöningar</h3>
            <div class="level-cards-grid">
              <div
                v-for="item in levelDefinitions"
                :key="item.level"
                :class="[
                  'level-info-card',
                  { active: overallLevel === item.level, locked: overallLevel < item.level },
                ]"
              >
                <div class="level-card-header">
                  <div>
                    <span class="badge">Nivå {{ item.level }}</span>
                    <strong class="level-name">{{ item.name }}</strong>
                  </div>
                  <span class="badge-tag">{{ item.badge }}</span>
                </div>
                <p class="xp-range-info">⚡ {{ item.xpRange }} krävs</p>
                <div class="unlocks-list">
                  <p>🎯 <strong>Tillgång till quiz:</strong> {{ item.quizAccess }}</p>
                  <p>🎁 <strong>Förmåner och belöningar:</strong> {{ item.benefits }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showLevelModal = false" class="button button-accent">
            Jag förstår! 👍
          </button>
        </div>
      </div>
    </div>

    <!-- Login / Registration form -->
    <div v-if="!user" class="login-card">
      <div class="auth-tabs">
        <button
          type="button"
          :class="['auth-tab-btn', { active: authMode === 'login' }]"
          @click="authMode = 'login'"
        >
          Logga in 🔑
        </button>
        <button
          type="button"
          :class="['auth-tab-btn', { active: authMode === 'register' }]"
          @click="authMode = 'register'"
        >
          Skapa konto ✨
        </button>
      </div>

      <!-- Login Form -->
      <template v-if="authMode === 'login'">
        <h2>Logga in på ditt konto</h2>
        <p class="text-muted">Logga in för att följa din quizhistorik och dina framsteg.</p>

        <div v-if="loginError" class="error-banner">⚠️ {{ loginError }}</div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>E-postadress:</label>
            <input type="email" v-model="loginEmail" placeholder="admin@skillswap.se" required />
          </div>
          <div class="form-group">
            <label>Lösenord:</label>
            <input type="password" v-model="loginPassword" placeholder="••••••••" required />
          </div>
          <button type="submit" class="button button-accent">Logga in 🔑</button>
        </form>
      </template>

      <!-- Register Form -->
      <template v-else>
        <h2>Skapa ett nytt konto</h2>
        <p class="text-muted">
          Skapa ett konto för att spara dina quizresultat och följa din kunskapsutveckling.
        </p>

        <div v-if="regError" class="error-banner">⚠️ {{ regError }}</div>
        <div v-if="regSuccess" class="success-banner">✅ {{ regSuccess }}</div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="form-group">
            <label>{{
              regRequestOrg ? 'Organisationsnamn / användarnamn:' : 'Användarnamn:'
            }}</label>
            <input
              type="text"
              v-model="regUsername"
              :placeholder="regRequestOrg ? 't.ex. nordiskt_gym' : 't.ex. annasvensson'"
              minlength="3"
              maxlength="50"
              required
            />
          </div>
          <div class="form-group">
            <label>E-postadress:</label>
            <input type="email" v-model="regEmail" placeholder="anna@exempel.se" required />
          </div>
          <div class="form-group">
            <label>Lösenord:</label>
            <input
              type="password"
              v-model="regPassword"
              placeholder="Minst 15 tecken"
              minlength="15"
              required
            />
            <span class="form-help-text">Lösenordet måste vara minst 15 tecken långt.</span>
          </div>
          <div class="form-group">
            <label>Bekräfta lösenord:</label>
            <input
              type="password"
              v-model="regConfirmPassword"
              placeholder="Upprepa lösenord"
              minlength="15"
              required
            />
          </div>
          <div class="org-signup-box">
            <label class="privacy-toggle">
              <input type="checkbox" v-model="regRequestOrg" />
              <span>Ansök om organisationskonto (t.ex. gym eller arbetsgivare)</span>
            </label>
            <span class="form-help-text">
              Organisationskonton måste godkännas av en administratör innan de får tillgång till
              kandidatöversikten.
            </span>
          </div>
          <button type="submit" class="button button-accent" :disabled="registering">
            {{ registering ? 'Skapar konto…' : 'Skapa konto och logga in ✨' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>
