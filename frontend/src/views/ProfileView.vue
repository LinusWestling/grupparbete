<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { currentUser, loadCurrentUser, clearCurrentUser } from '../services/auth'

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
const regTouched = ref({
  username: false,
  email: false,
  password: false, 
  confirmPassword: false,
})

function markRegTouched(field) {
  regTouched.value[field] = true
}

const regUsernameError = computed(() => {
  const username = regUsername.value.trim()

  if (!username) return 'Enter a username.'

  if (username.length < 3 || username.length > 50) {
    return 'Username must be 3-50 characters long.'
  }

  return ''
})

const regEmailError = computed(() => {
  const email = regEmail.value.trim()

  if (!email) return 'Enter an email address.'

  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return 'Enter a vailt email address, for example name@example.com.'
  }

  return ''
})

const regPasswordError = computed(() => {
  const password = regPassword.value

  if (!password) return 'Enter a password.'

  if (password.length < 15 || password.length > 128) {
    return 'Password must be 15-128 characters long.'
  }

  return ''
})

const regConfirmPasswordError = computed (() => {
  if (!regConfirmPassword.value) {
    return 'Repeat your password.'
  }

  if (regConfirmPassword.value !== regPassword.value) {
    return 'Password do not match.'
  }

  return ''
})

const levelDefinitions = [
  {
    level: 1,
    name: 'Beginner / Novice',
    xpRequired: 0,
    xpRange: '0 – 99 XP',
    badge: '🔰 Novice Badge',
    quizAccess: 'Level 1 Quizzes',
    benefits: 'Basic quiz taking, track progress, access foundational anatomy & exercise concepts.',
  },
  {
    level: 2,
    name: 'Intermediate',
    xpRequired: 100,
    xpRange: '100 – 199 XP',
    badge: '🥉 Bronze Scholar',
    quizAccess: 'Level 2 Quizzes',
    benefits: 'Unlocks Level 2 intermediate questions & +5% bonus XP reward multiplier.',
  },
  {
    level: 3,
    name: 'Advanced',
    xpRequired: 200,
    xpRange: '200 – 299 XP',
    badge: '🥈 Silver Master',
    quizAccess: 'Level 3 Quizzes',
    benefits: 'Unlocks Level 3 advanced scenarios & custom profile badges and titles.',
  },
  {
    level: 4,
    name: 'Expert',
    xpRequired: 300,
    xpRange: '300 – 399 XP',
    badge: '🥇 Gold Expert',
    quizAccess: 'Level 4 Quizzes',
    benefits: 'Unlocks Level 4 expert challenges & peer question reviewer privileges.',
  },
  {
    level: 5,
    name: 'PT Candidate / Master',
    xpRequired: 400,
    xpRange: '400+ XP',
    badge: '💎 Diamond Legend',
    quizAccess: 'Level 5 Quizzes',
    benefits: 'Unlocks Level 5 PT Candidate exam-level questions & certification readiness status.',
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
    logoutError.value = 'Logout failed: ' + error.message
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
    loginError.value = 'Login failed: ' + err.message
  }
}

async function handleRegister() {
  if (registering.value) return

  regError.value = null
  regSuccess.value = null

  if (regUsername.value.trim().length < 3) {
    regError.value = 'Username must be at least 3 characters long.'
    return
  }
  if (regPassword.value.length < 15) {
    regError.value = 'Password must be at least 15 characters long.'
    return
  }
  if (regPassword.value !== regConfirmPassword.value) {
    regError.value = 'Passwords do not match.'
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
      ? 'Account created! Your organization application is pending admin approval. Logging you in...'
      : 'Account created successfully! Logging you in...'
    user.value = await api.login(regEmail.value.trim(), regPassword.value)
    await loadUserData({ force: true })
  } catch (err) {
    regError.value = 'Registration failed: ' + err.message
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
    alert('Failed to update privacy settings: ' + err.message)
    event.target.checked = !isChecked
  }
}

async function handleAccessRequestResponse(requestId, status) {
  try {
    await api.respondToAccessRequest(requestId, status)
    accessRequests.value = await api.getMyAccessRequests()
  } catch (err) {
    alert('Failed to update organization access request: ' + err.message)
  }
}

async function inspectQuizDetails(quizId) {
  try {
    selectedQuizDetails.value = await api.getQuizDetails(quizId)
  } catch (err) {
    alert('Failed to load details for quiz #' + quizId)
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
        ? 'Skipped'
        : 'No answer entered'
  }
  if (q.question_type === 'matching') {
    if (q.is_skipped) return 'Skipped'
    const map =
      q.submitted_answer && typeof q.submitted_answer === 'object' ? q.submitted_answer : null
    if (!map) return 'No answer selected'
    return (q.answers || [])
      .map((a) => `${a.answer_text} → ${map[a.id] ?? map[String(a.id)] ?? '—'}`)
      .join(' | ')
  }
  const opt = q.answers?.find((a) => a.id === q.chosen_answer_id)
  return opt ? opt.answer_text : q.is_skipped ? 'Skipped' : 'No answer selected'
}

function getCorrectAnswerText(q) {
  if (q.question_type === 'matching') {
    return (q.answers || []).map((a) => `${a.answer_text} → ${a.match_text}`).join(' | ')
  }
  const opt = q.answers?.find((a) => a.is_correct)
  return opt ? opt.answer_text : 'N/A'
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
        <p class="eyebrow">USER PROFILE & HISTORY</p>
        <h1>My Progression & Quiz History</h1>
        <p class="heading-description">
          Track your earned XP, difficulty progression (Level 1–5), and view detailed history of
          completed quizzes.
        </p>
      </div>
    </div>

    <!-- Logged in state -->
    <div v-if="user" class="profile-card">
      <p v-if="logoutError" class="error-banner" role="alert">
        {{ logoutError }}
      </p>
      <div class="user-header">
        <div class="avatar-large">{{ user.username ? user.username[0].toUpperCase() : 'U' }}</div>
        <div>
          <div class="user-title-row">
            <h2>{{ user.username }}</h2>
            <button
              class="level-pill-button"
              @click="showLevelModal = true"
              title="Click to view Level diagram & rewards"
            >
              ⭐ Overall Level {{ overallLevel }} ℹ️
            </button>
          </div>
          <p class="text-muted">{{ user.email }} • Role: {{ user.role }}</p>
        </div>
      </div>

      <!-- Organization Account Application Status -->
      <div
        v-if="user.role === 'user' && user.org_request_status === 'pending'"
        class="org-status-banner pending"
      >
        <strong>⏳ Organization Account Application Pending</strong>
        <p class="text-muted">
          Your request to upgrade this account to an Organization account is awaiting administrator
          approval. Once approved, you will gain access to the Prospect Insights portal.
        </p>
      </div>
      <div
        v-else-if="user.role === 'user' && user.org_request_status === 'rejected'"
        class="org-status-banner rejected"
      >
        <strong>✕ Organization Account Application Declined</strong>
        <p class="text-muted">
          Your request for an Organization account was declined by an administrator.
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
          <span>Visible as a prospect candidate to verified organizations</span>
        </label>
        <p class="text-muted">
          When enabled, verified organizations can discover your username and send a request to view
          your quiz results. Your scores and history are only shared with organizations you
          explicitly approve below.
        </p>

        <div class="access-requests-panel">
          <h4>Organization Access Requests & Permissions</h4>
          <div v-if="accessRequests.length > 0" class="access-requests-list">
            <div v-for="req in accessRequests" :key="req.id" class="access-request-item">
              <div class="access-request-info">
                <strong>🏢 {{ req.organization_username }}</strong>
                <span :class="['status-pill', req.status]">
                  {{
                    req.status === 'pending'
                      ? '⏳ Pending Approval'
                      : req.status === 'approved'
                        ? '✅ Approved'
                        : '✕ Declined / Revoked'
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
                  Approve Access ✓
                </button>
                <button
                  v-if="req.status === 'pending'"
                  type="button"
                  class="button button-outline button-sm"
                  @click="handleAccessRequestResponse(req.id, 'rejected')"
                >
                  Decline ✕
                </button>
                <button
                  v-if="req.status === 'approved'"
                  type="button"
                  class="button button-outline button-sm"
                  @click="handleAccessRequestResponse(req.id, 'rejected')"
                >
                  Revoke Access
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">
            No organizations have requested access to your results yet.
          </p>
        </div>
      </div>

      <!-- XP Progression Overview Bar -->
      <div v-if="progress" class="overall-xp-section">
        <div class="xp-header-row">
          <span class="xp-title">Platform XP Progression</span>
          <span class="xp-value">
            <strong>{{ totalXp }} XP Total</strong>
            <template v-if="overallLevel < 5">
              ({{ xpToNextLevel }} XP to Level {{ overallLevel + 1 }})
            </template>
            <template v-else> • <span class="text-success">👑 Max Level Reached!</span> </template>
          </span>
        </div>
        <div class="progress-bar lg">
          <div class="progress-fill" :style="{ '--progress-width': xpInCurrentLevel + '%' }"></div>
        </div>
      </div>

      <div v-if="progress" class="progress-stats">
        <div class="stat-card">
          <span class="value">{{ progress.total_answered }}</span>
          <span class="label">Questions Answered</span>
        </div>
        <div class="stat-card">
          <span class="value">{{ progress.total_correct }}</span>
          <span class="label">Correct Answers</span>
        </div>
        <div class="stat-card">
          <span class="value">
            {{
              progress.total_answered > 0
                ? Math.round((progress.total_correct / progress.total_answered) * 100)
                : 0
            }}%
          </span>
          <span class="label">Overall Accuracy</span>
        </div>
        <div class="stat-card clickable" @click="showLevelModal = true">
          <span class="value">Level {{ overallLevel }}</span>
          <span class="label">Current Tier (Details ℹ️)</span>
        </div>
      </div>

      <!-- Topic Mastery -->
      <div class="topic-progress-section">
        <h3>Topic Mastery</h3>
        <div v-if="progress && progress.progress_by_topic.length > 0" class="progress-list">
          <div v-for="tp in progress.progress_by_topic" :key="tp.id" class="tp-item">
            <div class="tp-info">
              <div class="tp-title">
                <strong>{{ tp.topic_name }}</strong>
                <button
                  class="level-chip-clickable"
                  @click="showLevelModal = true"
                  title="Click to inspect level diagram & benefits"
                >
                  ⭐ Level {{ tp.level }} ℹ️
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
                <strong>{{ 100 - (tp.xp % 100) }} XP</strong> needed to reach Level
                {{ tp.level + 1 }}
              </span>
              <span v-else class="text-success"> 👑 Max Level Reached! </span>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">Take a quiz in Explore skills to start earning XP!</p>
      </div>

      <!-- Quiz History Table -->
      <div class="history-section">
        <h3>Completed Quiz History</h3>
        <div v-if="history.length > 0" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Quiz #</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Score / Accuracy</th>
                <th>Date Completed</th>
                <th>Action</th>
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
                    title="Click for Level diagram"
                  >
                    ⭐ Level {{ q.difficulty }}
                  </button>
                </td>
                <td>
                  <strong>{{ q.correct_cnt }} / {{ q.total_cnt }}</strong>
                  <span class="text-muted">
                    ({{ q.total_cnt > 0 ? Math.round((q.correct_cnt / q.total_cnt) * 100) : 0 }}%)
                    +{{ q.total_score }} XP
                  </span>
                </td>
                <td>{{ new Date(q.completed_at).toLocaleString() }}</td>
                <td>
                  <button
                    @click="inspectQuizDetails(q.quiz_id)"
                    class="button button-outline button-sm"
                  >
                    Inspect Report ↗
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted">
          No completed quizzes found yet. Start a quiz under Explore skills!
        </p>
      </div>
      <button
        type="button"
        class="button button-outline button-logout"
        :disabled="loggingOut"
        @click="handleLogout"
      >
        {{ loggingOut ? 'Logging out...' : 'Log out' }}
      </button>
    </div>

    <!-- Quiz Inspection Modal -->
    <div v-if="selectedQuizDetails" class="modal-overlay" @click.self="selectedQuizDetails = null">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Quiz #{{ selectedQuizDetails.id }} Detailed Report</h2>
          <button @click="selectedQuizDetails = null" class="button-text">✕ Close</button>
        </div>

        <div class="modal-body">
          <div class="meta-row">
            <p class="meta">
              Topic: <strong>{{ selectedQuizDetails.topic_name }}</strong> | Difficulty: ⭐ Level
              {{ selectedQuizDetails.difficulty }} | Score: +{{ selectedQuizDetails.total_score }}
              XP
            </p>
            <button
              @click="retakeQuiz(selectedQuizDetails.topic_id, selectedQuizDetails.difficulty)"
              class="button button-accent button-sm"
            >
              Retake Quiz 🔄
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
                  <strong>Q{{ q.position }}: {{ q.question_text }}</strong>
                </p>

                <div class="answers-comparison">
                  <p>
                    <strong>Your Answer:</strong>
                    <span :class="q.is_correct ? 'text-success' : 'text-danger'">
                      {{ getUserAnswerText(q) }}
                    </span>
                  </p>
                  <p v-if="!q.is_correct" class="correct-answer-line">
                    <strong>Correct Answer:</strong>
                    <span class="text-success">{{ getCorrectAnswerText(q) }}</span>
                  </p>
                </div>

                <!-- Hyperlinked Source(s) -->
                <div v-if="q.sources && q.sources.length > 0" class="source-container">
                  <span class="source-label">📖 Reference Source:</span>
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
            Retake Quiz 🔄
          </button>
          <button @click="selectedQuizDetails = null" class="button button-outline">
            Close Report
          </button>
        </div>
      </div>
    </div>

    <!-- Level Breakdown & Progression Diagram Modal -->
    <div v-if="showLevelModal" class="modal-overlay" @click.self="showLevelModal = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>🏆 Level Progression & Requirements</h2>
          <button @click="showLevelModal = false" class="button-text">✕ Close</button>
        </div>

        <div class="modal-body">
          <p class="heading-description">
            Earn XP by completing quizzes. Every 100 XP unlocks the next Level tier, granting access
            to higher difficulty questions and platform rewards.
          </p>

          <!-- Visual Step Diagram -->
          <div class="level-diagram-container">
            <h3>Visual Progression Roadmap</h3>
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
                <div class="step-level-num">Level {{ item.level }}</div>
                <div class="step-xp-range">{{ item.xpRange }}</div>
                <div class="step-status">
                  {{
                    overallLevel > item.level
                      ? 'Mastered'
                      : overallLevel === item.level
                        ? 'Current Level'
                        : 'Locked'
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Level Rewards Breakdown -->
          <div class="level-table-container">
            <h3>Level Tiers, Unlocks & Rewards</h3>
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
                    <span class="badge">Level {{ item.level }}</span>
                    <strong class="level-name">{{ item.name }}</strong>
                  </div>
                  <span class="badge-tag">{{ item.badge }}</span>
                </div>
                <p class="xp-range-info">⚡ {{ item.xpRange }} required</p>
                <div class="unlocks-list">
                  <p>🎯 <strong>Quiz Access:</strong> {{ item.quizAccess }}</p>
                  <p>🎁 <strong>Benefits & Rewards:</strong> {{ item.benefits }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showLevelModal = false" class="button button-accent">Got It! 👍</button>
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
          Log In 🔑
        </button>
        <button
          type="button"
          :class="['auth-tab-btn', { active: authMode === 'register' }]"
          @click="authMode = 'register'"
        >
          Create Account ✨
        </button>
      </div>

      <!-- Login Form -->
      <template v-if="authMode === 'login'">
        <h2>Log in to your account</h2>
        <p class="text-muted">Log in to track your quiz history and progression.</p>

        <div v-if="loginError" class="error-banner">⚠️ {{ loginError }}</div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Email Address:</label>
            <input type="email" v-model="loginEmail" placeholder="admin@skillswap.se" required />
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input type="password" v-model="loginPassword" placeholder="••••••••" required />
          </div>
          <button type="submit" class="button button-accent">Log In 🔑</button>
        </form>
      </template>

      <!-- Register Form -->
      <template v-else>
        <h2>Create a new account</h2>
        <p class="text-muted">
          Register to save your quiz scores and track your skill progression.
        </p>

        <div v-if="regError" class="error-banner">⚠️ {{ regError }}</div>
        <div v-if="regSuccess" class="success-banner">✅ {{ regSuccess }}</div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="form-group">
            <label>{{ regRequestOrg ? 'Organization Name / Username:' : 'Username:' }}</label>
            <input
              type="text"
              v-model="regUsername"
              :placeholder="regRequestOrg ? 'e.g. nordic_gym' : 'e.g. johndoe'"
              minlength="3"
              maxlength="50"
              required
            />
          </div>
          <div class="form-group">
            <label>Email Address:</label>
            <input type="email" v-model="regEmail" placeholder="john@example.com" required />
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input
              type="password"
              v-model="regPassword"
              placeholder="Min 15 characters"
              minlength="15"
              required
            />
            <span class="form-help-text">Password must be at least 15 characters long.</span>
          </div>
          <div class="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              v-model="regConfirmPassword"
              placeholder="Repeat password"
              minlength="15"
              required
            />
          </div>
          <div class="org-signup-box">
            <label class="privacy-toggle">
              <input type="checkbox" v-model="regRequestOrg" />
              <span>Apply for an Organization Account (e.g. Gym / Employer)</span>
            </label>
            <span class="form-help-text">
              Organization accounts require administrator sign-off before accessing candidate
              prospect insights.
            </span>
          </div>
          <button type="submit" class="button button-accent" :disabled="registering">
            {{ registering ? 'Registering...' : 'Register & Sign In ✨' }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>
