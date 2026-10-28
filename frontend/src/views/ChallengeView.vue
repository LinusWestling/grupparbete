<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()

const activeTab = ref('pending') // pending, active, history, create
const loading = ref(false)
const error = ref(null)

// Data
const pendingChallenges = ref([])
const activeChallenges = ref([])
const challengeHistory = ref([])
const topics = ref([])

// Create challenge form
const searchQuery = ref('')
const searchResults = ref([])
const selectedUser = ref(null)
const selectedTopic = ref(null)
const selectedDifficulty = ref(3)
const searching = ref(false)

onMounted(async () => {
  await loadChallenges()
  await loadTopics()
})

async function loadChallenges() {
  loading.value = true
  error.value = null
  try {
    const [pending, active, history] = await Promise.all([
      api.getPendingChallenges(),
      api.getActiveChallenges(),
      api.getChallengeHistory(),
    ])
    pendingChallenges.value = pending
    activeChallenges.value = active
    challengeHistory.value = history
  } catch (err) {
    error.value = 'Failed to load challenges: ' + err.message
  } finally {
    loading.value = false
  }
}

async function loadTopics() {
  try {
    topics.value = await api.getTopics()
  } catch (err) {
    console.error('Failed to load topics:', err)
  }
}

async function searchUsers() {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    searchResults.value = await api.searchUsers(searchQuery.value)
  } catch (err) {
    error.value = 'Search failed: ' + err.message
  } finally {
    searching.value = false
  }
}

function selectUser(user) {
  selectedUser.value = user
  searchQuery.value = user.username
  searchResults.value = []
}

async function createChallenge() {
  if (!selectedUser.value || !selectedTopic.value) {
    error.value = 'Please select a user and topic'
    return
  }

  loading.value = true
  error.value = null
  try {
    await api.createChallenge(selectedUser.value.id, selectedTopic.value, selectedDifficulty.value)
    // Reset form
    selectedUser.value = null
    selectedTopic.value = null
    searchQuery.value = ''
    selectedDifficulty.value = 3
    activeTab.value = 'pending'
    await loadChallenges()
  } catch (err) {
    error.value = 'Failed to create challenge: ' + err.message
  } finally {
    loading.value = false
  }
}

async function acceptChallenge(challengeId) {
  loading.value = true
  error.value = null
  try {
    await api.acceptChallenge(challengeId)
    await loadChallenges()
  } catch (err) {
    error.value = 'Failed to accept challenge: ' + err.message
  } finally {
    loading.value = false
  }
}

async function declineChallenge(challengeId) {
  loading.value = true
  error.value = null
  try {
    await api.declineChallenge(challengeId)
    await loadChallenges()
  } catch (err) {
    error.value = 'Failed to decline challenge: ' + err.message
  } finally {
    loading.value = false
  }
}

async function startChallenge(challengeId) {
  loading.value = true
  error.value = null
  try {
    const quiz = await api.startChallengeQuiz(challengeId)
    // Navigate to explore view with the quiz loaded
    router.push(`/challenges/${challengeId}/play`)
  } catch (err) {
    error.value = 'Failed to start challenge: ' + err.message
  } finally {
    loading.value = false
  }
}

function viewResult(challengeId) {
  router.push(`/challenges/${challengeId}/result`)
}

const pendingCount = computed(() => pendingChallenges.value.length)
const activeCount = computed(() => activeChallenges.value.length)
</script>

<template>
  <div class="challenge-view">
    <div class="page-heading">
      <h1>🏆 Challenges</h1>
      <p>Challenge your friends to head-to-head quiz battles!</p>
    </div>

    <div v-if="error" class="error-banner">⚠️ {{ error }}</div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'pending' }]" @click="activeTab = 'pending'">
        Invitations
        <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
      </button>
      <button :class="['tab', { active: activeTab === 'active' }]" @click="activeTab = 'active'">
        Active
        <span v-if="activeCount > 0" class="badge">{{ activeCount }}</span>
      </button>
      <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">
        History
      </button>
      <button :class="['tab', { active: activeTab === 'create' }]" @click="activeTab = 'create'">
        + Create Challenge
      </button>
    </div>

    <!-- Pending Challenges -->
    <div v-if="activeTab === 'pending'" class="tab-content">
      <h2>Pending Invitations</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="pendingChallenges.length === 0" class="empty-state">
        <p>No pending challenges</p>
      </div>
      <div v-else class="challenge-list">
        <div v-for="challenge in pendingChallenges" :key="challenge.id" class="challenge-card">
          <div class="challenge-info">
            <h3>{{ challenge.challenger_username }} challenges you!</h3>
            <p>Topic: {{ challenge.topic_name }} · Level {{ challenge.difficulty }}</p>
            <p class="text-muted">
              Created {{ new Date(challenge.created_at).toLocaleDateString() }}
            </p>
          </div>
          <div class="challenge-actions">
            <button
              class="button button-accent"
              @click="acceptChallenge(challenge.id)"
              :disabled="loading"
            >
              Accept
            </button>
            <button
              class="button button-outline"
              @click="declineChallenge(challenge.id)"
              :disabled="loading"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Challenges -->
    <div v-if="activeTab === 'active'" class="tab-content">
      <h2>Active Challenges</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="activeChallenges.length === 0" class="empty-state">
        <p>No active challenges</p>
      </div>
      <div v-else class="challenge-list">
        <div
          v-for="challenge in activeChallenges"
          :key="challenge.id"
          class="challenge-card active"
        >
          <div class="challenge-info">
            <h3>{{ challenge.challenger_username }} vs {{ challenge.challenged_username }}</h3>
            <p>{{ challenge.topic_name }} · Level {{ challenge.difficulty }}</p>
            <div class="status-badges">
              <span v-if="challenge.challenger_quiz_status === 'completed'" class="badge success">
                {{ challenge.challenger_username }} finished
              </span>
              <span v-else class="badge warning">
                {{ challenge.challenger_username }} in progress
              </span>
              <span v-if="challenge.challenged_quiz_status === 'completed'" class="badge success">
                {{ challenge.challenged_username }} finished
              </span>
              <span v-else class="badge warning">
                {{ challenge.challenged_username }} in progress
              </span>
            </div>
          </div>
          <div class="challenge-actions">
            <button
              v-if="
                challenge.challenger_quiz_status !== 'completed' &&
                challenge.challenged_quiz_status !== 'completed'
              "
              class="button button-accent"
              @click="startChallenge(challenge.id)"
              :disabled="loading"
            >
              Start Quiz
            </button>
            <button v-else class="button button-accent" @click="viewResult(challenge.id)">
              View Result
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- History -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <h2>Challenge History</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="challengeHistory.length === 0" class="empty-state">
        <p>No completed challenges yet</p>
      </div>
      <div v-else class="challenge-list">
        <div
          v-for="challenge in challengeHistory"
          :key="challenge.id"
          class="challenge-card history"
        >
          <div class="challenge-info">
            <h3>{{ challenge.challenger_username }} vs {{ challenge.challenged_username }}</h3>
            <p>{{ challenge.topic_name }} · Level {{ challenge.difficulty }}</p>
            <p v-if="challenge.winner_username" class="winner">
              🏆 Winner: {{ challenge.winner_username }}
            </p>
            <p v-else class="tie">🤝 Tie</p>
            <p class="text-muted">
              Completed {{ new Date(challenge.completed_at).toLocaleDateString() }}
            </p>
          </div>
          <div class="challenge-actions">
            <button class="button button-outline" @click="viewResult(challenge.id)">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Challenge -->
    <div v-if="activeTab === 'create'" class="tab-content">
      <h2>Create New Challenge</h2>
      <div class="create-form">
        <!-- User Search -->
        <div class="form-group">
          <label>Challenge User</label>
          <input
            v-model="searchQuery"
            @input="searchUsers"
            type="text"
            placeholder="Search by username..."
            class="text-input"
          />
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="search-result-item"
              @click="selectUser(user)"
            >
              {{ user.username }} ({{ user.email }})
            </div>
          </div>
          <p v-if="selectedUser" class="selected-user">
            Selected: <strong>{{ selectedUser.username }}</strong>
          </p>
        </div>

        <!-- Topic Selection -->
        <div class="form-group">
          <label>Topic</label>
          <select v-model="selectedTopic" class="select-input">
            <option :value="null">Select a topic...</option>
            <option v-for="topic in topics" :key="topic.id" :value="topic.id">
              {{ topic.name }}
            </option>
          </select>
        </div>

        <!-- Difficulty Selection -->
        <div class="form-group">
          <label>Difficulty Level</label>
          <div class="difficulty-buttons">
            <button
              v-for="lvl in [1, 2, 3, 4, 5]"
              :key="lvl"
              :class="['diff-btn', { active: selectedDifficulty === lvl }]"
              @click="selectedDifficulty = lvl"
            >
              ⭐ {{ lvl }}
            </button>
          </div>
        </div>

        <button
          class="button button-accent"
          @click="createChallenge"
          :disabled="loading || !selectedUser || !selectedTopic"
        >
          Send Challenge
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-heading h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: 2rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text);
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  color: var(--color-accent);
}

.tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.tab .badge {
  background: var(--color-accent);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.challenge-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
}

.challenge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.challenge-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.challenge-info p {
  margin: 0.25rem 0;
}

.challenge-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.status-badges .badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.badge.success {
  background: var(--color-success);
  color: white;
}

.badge.warning {
  background: var(--color-warning);
  color: white;
}

.winner {
  color: var(--color-success);
  font-weight: bold;
}

.tie {
  color: var(--color-text-muted);
  font-weight: bold;
}

.create-form {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.form-group label {
  font-weight: 600;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: var(--color-background-soft);
}

.selected-user {
  color: var(--color-success);
}

.difficulty-buttons {
  display: flex;
  gap: 0.5rem;
}

.diff-btn {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.diff-btn:hover {
  border-color: var(--color-accent);
}

.diff-btn.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}

.error-banner {
  background: var(--color-error-soft);
  color: var(--color-error);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.text-muted {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-accent {
  background: var(--color-accent);
  color: white;
}

.button-accent:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.button-outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.button-outline:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.text-input,
.select-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.text-input:focus,
.select-input:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
