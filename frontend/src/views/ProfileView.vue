<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const user = ref(null)
const progress = ref(null)
const history = ref([])
const selectedQuizDetails = ref(null)
const loading = ref(true)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref(null)

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
          <h2>{{ user.username }}</h2>
          <p class="text-muted">{{ user.email }} • Role: {{ user.role }}</p>
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
      </div>

      <!-- Topic Mastery -->
      <div class="topic-progress-section">
        <h3>Topic Mastery</h3>
        <div v-if="progress && progress.progress_by_topic.length > 0" class="progress-list">
          <div v-for="tp in progress.progress_by_topic" :key="tp.id" class="tp-item">
            <div class="tp-info">
              <strong>{{ tp.topic_name }}</strong>
              <span>Level {{ tp.level }} • {{ tp.xp }} XP</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: Math.min(tp.xp % 100, 100) + '%' }"></div>
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
                <td>⭐ Level {{ q.difficulty }}</td>
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
        <p class="meta">
          Topic: <strong>{{ selectedQuizDetails.topic_name }}</strong> | Difficulty: ⭐ Level
          {{ selectedQuizDetails.difficulty }} | Score: +{{ selectedQuizDetails.total_score }} XP
        </p>
        <div class="results-list">
          <div
            v-for="q in selectedQuizDetails.questions"
            :key="q.question_id"
            :class="['result-item', q.is_correct ? 'correct' : 'incorrect']"
          >
            <span class="status-icon">{{ q.is_correct ? '✅' : '❌' }}</span>
            <div>
              <p>
                <strong>Q{{ q.position }}: {{ q.question_text }}</strong>
              </p>
              <p v-if="q.free_text_answer" class="text-muted">
                User Input: "{{ q.free_text_answer }}"
              </p>
              <p v-if="q.sources.length > 0" class="text-muted">
                Source: {{ q.sources[0].source_text }}
              </p>
            </div>
          </div>
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

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.profile-card,
.login-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.user-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.avatar-large {
  width: 60px;
  height: 60px;
  background: #2563eb;
  color: #fff;
  font-size: 1.75rem;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.stat-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}
.stat-card .value {
  font-size: 1.75rem;
  font-weight: bold;
  color: #2563eb;
  display: block;
}
.stat-card .label {
  font-size: 0.85rem;
  color: #6b7280;
}
.progress-bar {
  background: #e5e7eb;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 0.5rem;
}
.progress-fill {
  background: #2563eb;
  height: 100%;
  transition: width 0.3s ease;
}
.tp-item {
  margin-bottom: 1rem;
}
.tp-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}
.table-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.data-table th,
.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.95rem;
}
.data-table th {
  background: #f9fafb;
  font-weight: 600;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 6px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.results-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.result-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
}
.result-item.correct {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.result-item.incorrect {
  background: #fef2f2;
  border: 1px solid #fecaca;
}
</style>
