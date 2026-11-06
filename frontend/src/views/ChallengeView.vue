<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { currentUser } from '../services/auth'
import { SEARCH_MIN_LENGTH, formatDate } from '../utils/challengeHelpers'
import { quizStore } from '../stores/quizStore'

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

let pollingTimer = null
let currentSearchId = 0
let isUnmounted = false

onMounted(async () => {
  await loadChallenges()
  await loadTopics()

  if (isUnmounted) return

  pollingTimer = setInterval(async () => {
    try {
      const active = await api.getActiveChallenges()
      activeChallenges.value = active
    } catch (err) {
      console.error('Polling failed:', err)
    }
  }, 30000) // Poll every 30 seconds
})

onUnmounted(() => {
  isUnmounted = true
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
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
    error.value = 'Det gick inte att hämta utmaningar: ' + err.message
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
  const requestId = ++currentSearchId
  if (searchQuery.value.length < SEARCH_MIN_LENGTH) {
    searchResults.value = []
    currentSearchId = requestId // Invalidate previous pending
    return
  }

  searching.value = true
  try {
    const results = await api.searchUsers(searchQuery.value)
    if (requestId === currentSearchId) {
      searchResults.value = results
    }
  } catch (err) {
    if (requestId === currentSearchId) {
      error.value = 'Sökningen misslyckades: ' + err.message
    }
  } finally {
    if (requestId === currentSearchId) {
      searching.value = false
    }
  }
}

function selectUser(user) {
  currentSearchId++ // Invalidate pending requests
  selectedUser.value = user
  searchQuery.value = user.username
  searchResults.value = []
}

async function createChallenge() {
  if (!selectedUser.value || !selectedTopic.value) {
    error.value = 'Välj både en användare och ett ämne.'
    return
  }

  try {
    quizStore.assertCanReplaceQuiz()
  } catch (err) {
    error.value = err.message
    return
  }

  loading.value = true
  error.value = null
  try {
    const response = await api.createChallenge(
      selectedUser.value.id,
      selectedTopic.value,
      selectedDifficulty.value,
    )

    // Load the quiz into the store and navigate to quiz view
    quizStore.loadQuiz(response.quiz)

    // Navigate to explore view to take the quiz
    router.push('/explore')
  } catch (err) {
    error.value = 'Det gick inte att skapa utmaningen: ' + err.message
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
    error.value = 'Det gick inte att acceptera utmaningen: ' + err.message
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
    error.value = 'Det gick inte att avböja utmaningen: ' + err.message
  } finally {
    loading.value = false
  }
}

function startChallenge(challengeId) {
  error.value = null
  router.push(`/challenges/${challengeId}/play`)
}

function viewResult(challengeId) {
  router.push(`/challenges/${challengeId}/result`)
}

function isMyTurn(challenge) {
  if (!currentUser.value || !challenge.current_turn_user_id) return false
  return challenge.current_turn_user_id === currentUser.value.id
}

function getTurnUsername(challenge) {
  if (challenge.current_turn_user_id === challenge.challenger_user_id) {
    return challenge.challenger_username
  }
  return challenge.challenged_username
}

const pendingCount = computed(() => pendingChallenges.value.length)
const activeCount = computed(() => activeChallenges.value.length)
</script>

<template>
  <div class="challenge-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">TÄVLA MED VÄNNER</p>
        <h1><span role="img" aria-label="Pokal">🏆</span> Utmaningar</h1>
        <p class="heading-description">Utmana dina vänner i kunskapsdueller!</p>
      </div>
    </div>

    <div v-if="error" class="error-banner" role="alert">
      <span role="img" aria-label="Varning">⚠️</span> {{ error }}
    </div>

    <!-- Tabs -->
    <div class="auth-tabs">
      <button
        :class="['auth-tab-btn', { active: activeTab === 'pending' }]"
        @click="activeTab = 'pending'"
      >
        Inbjudningar
        <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
      </button>
      <button
        :class="['auth-tab-btn', { active: activeTab === 'active' }]"
        @click="activeTab = 'active'"
      >
        Pågående
        <span v-if="activeCount > 0" class="badge">{{ activeCount }}</span>
      </button>
      <button
        :class="['auth-tab-btn', { active: activeTab === 'history' }]"
        @click="activeTab = 'history'"
      >
        Historik
      </button>
      <button
        :class="['auth-tab-btn', { active: activeTab === 'create' }]"
        @click="activeTab = 'create'"
      >
        + Skapa utmaning
      </button>
    </div>

    <!-- Pending Challenges -->
    <div v-if="activeTab === 'pending'" class="challenge-section">
      <h2>Väntande inbjudningar</h2>
      <div v-if="loading" class="loading-state">Läser in…</div>
      <div v-else-if="pendingChallenges.length === 0" class="empty-state">
        <p>Inga väntande utmaningar</p>
      </div>
      <div v-else class="challenge-list">
        <div v-for="challenge in pendingChallenges" :key="challenge.id" class="challenge-card">
          <div class="challenge-info">
            <h3>{{ challenge.challenger_username }} utmanar dig!</h3>
            <p>Ämne: {{ challenge.topic_name }} · Nivå {{ challenge.difficulty }}</p>
            <p class="text-muted">Skapad {{ formatDate(challenge.created_at) }}</p>
          </div>
          <div class="challenge-actions">
            <button
              class="button button-accent"
              @click="acceptChallenge(challenge.id)"
              :disabled="loading"
            >
              Acceptera
            </button>
            <button
              class="button button-outline"
              @click="declineChallenge(challenge.id)"
              :disabled="loading"
            >
              Avböj
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Challenges -->
    <div v-if="activeTab === 'active'" class="challenge-section">
      <h2>Pågående utmaningar</h2>
      <div v-if="loading" class="loading-state">Läser in…</div>
      <div v-else-if="activeChallenges.length === 0" class="empty-state">
        <p>Inga pågående utmaningar</p>
      </div>
      <div v-else class="challenge-list">
        <div
          v-for="challenge in activeChallenges"
          :key="challenge.id"
          class="challenge-card active"
        >
          <div class="challenge-info">
            <h3>{{ challenge.challenger_username }} mot {{ challenge.challenged_username }}</h3>
            <p>{{ challenge.topic_name }} · Nivå {{ challenge.difficulty }}</p>
            <p class="turn-info" v-if="challenge.current_turn_user_id">
              <span role="img" aria-label="Tur">🔄</span>
              <strong v-if="isMyTurn(challenge)">Din tur!</strong>
              <span v-else>{{ getTurnUsername(challenge) }}s tur</span>
            </p>
            <div class="status-badges">
              <span
                v-if="challenge.challenger_quiz_status === 'completed'"
                class="status-pill approved"
              >
                {{ challenge.challenger_username }} klar
              </span>
              <span v-else class="status-pill pending">
                {{ challenge.challenger_username }} väntar
              </span>
              <span
                v-if="challenge.challenged_quiz_status === 'completed'"
                class="status-pill approved"
              >
                {{ challenge.challenged_username }} klar
              </span>
              <span v-else class="status-pill pending">
                {{ challenge.challenged_username }} väntar
              </span>
            </div>
          </div>
          <div class="challenge-actions">
            <button
              v-if="
                challenge.challenger_quiz_status === 'completed' &&
                challenge.challenged_quiz_status === 'completed'
              "
              class="button button-accent"
              @click="viewResult(challenge.id)"
            >
              Visa resultat!
            </button>
            <button
              v-else
              class="button button-accent"
              @click="startChallenge(challenge.id)"
              :disabled="
                loading ||
                !isMyTurn(challenge) ||
                (challenge.status === 'pending' && challenge.challenged_user_id === currentUser?.id)
              "
              :title="!isMyTurn(challenge) ? 'Vänta på din tur' : ''"
            >
              {{ isMyTurn(challenge) ? 'Starta quiz' : 'Väntar…' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- History -->
    <div v-if="activeTab === 'history'" class="challenge-section">
      <h2>Utmaningshistorik</h2>
      <div v-if="loading" class="loading-state">Läser in…</div>
      <div v-else-if="challengeHistory.length === 0" class="empty-state">
        <p>Inga avslutade utmaningar ännu</p>
      </div>
      <div v-else class="challenge-list">
        <div
          v-for="challenge in challengeHistory"
          :key="challenge.id"
          class="challenge-card history"
        >
          <div class="challenge-info">
            <h3>{{ challenge.challenger_username }} mot {{ challenge.challenged_username }}</h3>
            <p>{{ challenge.topic_name }} · Nivå {{ challenge.difficulty }}</p>
            <p v-if="challenge.winner_username" class="text-success">
              <span role="img" aria-label="Pokal">🏆</span> Vinnare: {{ challenge.winner_username }}
            </p>
            <p v-else class="text-muted">
              <span role="img" aria-label="Handslag">🤝</span> Oavgjort
            </p>
            <p class="text-muted">Slutförd {{ formatDate(challenge.completed_at) }}</p>
          </div>
          <div class="challenge-actions">
            <button class="button button-outline" @click="viewResult(challenge.id)">
              Visa detaljer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Challenge -->
    <div v-if="activeTab === 'create'" class="challenge-section">
      <h2>Skapa ny utmaning</h2>
      <div class="create-form">
        <!-- User Search -->
        <div class="form-group">
          <label>Utmana användare</label>
          <input
            v-model="searchQuery"
            @input="searchUsers"
            type="text"
            placeholder="Sök efter användarnamn…"
            class="text-input"
          />
          <div v-if="searchResults.length > 0" class="search-results">
            <button
              v-for="user in searchResults"
              :key="user.id"
              type="button"
              class="search-result-item"
              @click="selectUser(user)"
            >
              {{ user.username }}
            </button>
          </div>
          <p v-if="selectedUser" class="text-success">
            Vald användare: <strong>{{ selectedUser.username }}</strong>
          </p>
        </div>

        <!-- Topic Selection -->
        <div class="form-group">
          <label>Ämne</label>
          <select v-model="selectedTopic" class="form-select">
            <option :value="null">Välj ett ämne…</option>
            <option v-for="topic in topics" :key="topic.id" :value="topic.id">
              {{ topic.name }}
            </option>
          </select>
        </div>

        <!-- Difficulty Selection -->
        <div class="form-group">
          <label>Svårighetsgrad</label>
          <div class="difficulty-options">
            <button
              v-for="lvl in [1, 2, 3, 4, 5]"
              :key="lvl"
              type="button"
              :class="['diff-btn', { active: selectedDifficulty === lvl }]"
              @click="selectedDifficulty = lvl"
            >
              <span role="img" aria-label="Stjärna">⭐</span> Nivå {{ lvl }}
            </button>
          </div>
        </div>

        <button
          class="button button-accent"
          @click="createChallenge"
          :disabled="loading || !selectedUser || !selectedTopic"
        >
          Starta utmaning
        </button>
      </div>
    </div>
  </div>
</template>
