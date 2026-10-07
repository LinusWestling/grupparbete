<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const user = ref(null)
const progress = ref(null)
const loading = ref(true)
const loginEmail = ref('admin@skillswap.se')
const loginPassword = ref('password')
const loginError = ref(null)

onMounted(async () => {
  await loadUserData()
})

async function loadUserData() {
  try {
    loading.value = true
    user.value = await api.getMe()
    if (user.value) {
      progress.value = await api.getUserProgress(user.value.id)
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
    progress.value = await api.getUserProgress(user.value.id)
  } catch (err) {
    loginError.value = 'Login failed: ' + err.message
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">USER PROFILE & PROGRESS</p>
        <h1>My Account & Achievements</h1>
        <p class="heading-description">Track your earned XP, quiz level, and progress across all learning topics.</p>
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
            {{ progress.total_answered > 0 ? Math.round((progress.total_correct / progress.total_answered) * 100) : 0 }}%
          </span>
          <span class="label">Accuracy</span>
        </div>
      </div>

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
    </div>

    <!-- Login form -->
    <div v-else class="login-card">
      <h2>Log in to your account</h2>
      <p class="text-muted">Test authentication endpoints connected to MySQL users table.</p>

      <div v-if="loginError" class="error-banner">⚠️ {{ loginError }}</div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email Address:</label>
          <input type="email" v-model="loginEmail" required />
        </div>
        <div class="form-group">
          <label>Password:</label>
          <input type="password" v-model="loginPassword" required />
        </div>
        <button type="submit" class="button button-accent">Log In 🔑</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-page { display: flex; flex-direction: column; gap: 1.5rem; }
.profile-card, .login-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
.user-header { display: flex; align-items: center; gap: 1.25rem; }
.avatar-large { width: 60px; height: 60px; background: #2563eb; color: #fff; font-size: 1.75rem; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.progress-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
.stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center; }
.stat-card .value { font-size: 1.75rem; font-weight: bold; color: #2563eb; display: block; }
.stat-card .label { font-size: 0.85rem; color: #6b7280; }
.progress-bar { background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 0.5rem; }
.progress-fill { background: #2563eb; height: 100%; transition: width 0.3s ease; }
.tp-item { margin-bottom: 1rem; }
.tp-info { display: flex; justify-content: space-between; font-size: 0.95rem; }
.login-form { display: flex; flex-direction: column; gap: 1rem; max-width: 400px; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group input { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
.error-banner { background: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 6px; }
</style>
