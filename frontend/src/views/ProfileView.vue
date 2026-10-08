<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()

const user = ref(null)
const progress = ref(null)
const history = ref([])
const selectedQuizDetails = ref(null)
const showLevelModal = ref(false)
const loading = ref(true)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref(null)

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
  return Math.floor(totalXp.value / 100) + 1
})

const xpInCurrentLevel = computed(() => {
  return totalXp.value % 100
})

const xpToNextLevel = computed(() => {
  return 100 - (totalXp.value % 100)
})

onMounted(async () => {
  await loadUserData()
})

async function loadUserData() {
  try {
    loading.value = true
    user.value = await api.getMe()
    if (user.value) {
      const [progData, histData] = await Promise.all([
        api.getUserProgress(user.value.id),
        api.getQuizHistory(),
      ])
      progress.value = progData
      history.value = histData
    }
  } catch (err) {
    // Guest mode
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  try {
    loginError.value = null
    user.value = await api.login(loginEmail.value, loginPassword.value)
    await loadUserData()
  } catch (err) {
    loginError.value = 'Login failed: ' + err.message
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
  const opt = q.answers?.find((a) => a.id === q.chosen_answer_id)
  return opt ? opt.answer_text : q.is_skipped ? 'Skipped' : 'No answer selected'
}

function getCorrectAnswerText(q) {
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

      <!-- XP Progression Overview Bar -->
      <div v-if="progress" class="overall-xp-section">
        <div class="xp-header-row">
          <span class="xp-title">Platform XP Progression</span>
          <span class="xp-value">
            <strong>{{ totalXp }} XP Total</strong> ({{ xpToNextLevel }} XP to Level
            {{ overallLevel + 1 }})
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
                :style="{ '--progress-width': Math.min(tp.xp % 100, 100) + '%' }"
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

    <!-- Login form -->
    <div v-else class="login-card">
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
    </div>
  </div>
</template>
