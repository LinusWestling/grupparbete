<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { formatTime } from '../utils/challengeHelpers'

const route = useRoute()
const router = useRouter()

const challengeId = Number(route.params.id)
const result = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    result.value = await api.getChallengeResult(challengeId)
    // Mark that this user has viewed the result
    try {
      await api.markChallengeResultViewed(challengeId)
    } catch (err) {
      console.error('Failed to mark result viewed:', err)
    }
  } catch (err) {
    error.value = 'Det gick inte att hämta resultatet: ' + err.message
  } finally {
    loading.value = false
  }
})

const winner = computed(() => {
  if (!result.value || result.value.status !== 'completed') return null
  if (!result.value.winner_id) return 'tie'
  return result.value.winner_id === result.value.challenger.user_id ? 'challenger' : 'challenged'
})

const winnerName = computed(() => {
  if (winner.value === 'tie') return 'Oavgjort'
  return result.value.winner_username
})

function backToChallenges() {
  router.push('/challenges')
}
</script>

<template>
  <div class="challenge-page">
    <div v-if="loading" class="loading-state">Läser in resultat…</div>
    <div v-else-if="error" class="error-banner" role="alert">
      <span role="img" aria-label="Varning">⚠️</span> {{ error }}
    </div>
    <div v-else-if="result" class="challenge-section">
      <!-- Waiting state for non-completed challenges -->
      <div v-if="result.status !== 'completed'" class="waiting-banner">
        <h1><span role="img" aria-label="Timglas">⏳</span> Väntar på att utmaningen slutförs…</h1>
        <p class="text-muted">Slutresultatet visas när båda spelarna har slutfört sina quiz.</p>
      </div>

      <!-- Winner Banner -->
      <div v-else class="winner-banner" :class="winner">
        <h1 v-if="winner === 'tie'"><span role="img" aria-label="Handslag">🤝</span> Oavgjort!</h1>
        <h1 v-else><span role="img" aria-label="Pokal">🏆</span> {{ winnerName }} vinner!</h1>
      </div>

      <!-- Score Comparison -->
      <div class="score-comparison">
        <div class="player-result" :class="{ winner: winner === 'challenger' }">
          <h2>{{ result.challenger?.username || 'Utmanare' }}</h2>
          <div class="score-card">
            <div v-if="result.challenger?.is_completed" class="stat-value">
              {{ result.challenger?.correct_answers || 0 }} /
              {{ result.challenger?.total_questions || 0 }}
            </div>
            <div v-else class="score-placeholder">Pågår…</div>
            <div class="stats">
              <p v-if="result.challenger?.time_taken_seconds != null" class="text-muted">
                <span role="img" aria-label="Tidtagarur">⏱️</span>
                {{ formatTime(result.challenger.time_taken_seconds) }}
              </p>
            </div>
          </div>
        </div>

        <div class="vs-divider">MOT</div>

        <div class="player-result" :class="{ winner: winner === 'challenged' }">
          <h2>{{ result.challenged?.username || 'Utmanad' }}</h2>
          <div class="score-card">
            <div v-if="result.challenged?.is_completed" class="stat-value">
              {{ result.challenged?.correct_answers || 0 }} /
              {{ result.challenged?.total_questions || 0 }}
            </div>
            <div v-else class="score-placeholder">Pågår…</div>
            <div class="stats">
              <p v-if="result.challenged?.time_taken_seconds != null" class="text-muted">
                <span role="img" aria-label="Tidtagarur">⏱️</span>
                {{ formatTime(result.challenged.time_taken_seconds) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="challenge-result-actions">
        <button class="button button-accent" @click="backToChallenges">
          Tillbaka till utmaningar
        </button>
      </div>
    </div>
  </div>
</template>
