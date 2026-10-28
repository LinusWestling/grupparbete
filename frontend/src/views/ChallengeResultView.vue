<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'

const route = useRoute()
const router = useRouter()

const challengeId = Number(route.params.id)
const result = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    result.value = await api.getChallengeResult(challengeId)
  } catch (err) {
    error.value = 'Failed to load result: ' + err.message
  } finally {
    loading.value = false
  }
})

const winner = computed(() => {
  if (!result.value) return null
  if (!result.value.winner_id) return 'tie'
  return result.value.winner_id === result.value.challenger.user_id ? 'challenger' : 'challenged'
})

const winnerName = computed(() => {
  if (winner.value === 'tie') return 'Tie'
  return result.value.winner_username
})

function backToChallenges() {
  router.push('/challenges')
}
</script>

<template>
  <div class="challenge-result-view">
    <div v-if="loading" class="loading">Loading results...</div>
    <div v-else-if="error" class="error-banner">⚠️ {{ error }}</div>
    <div v-else-if="result">
      <!-- Winner Banner -->
      <div class="winner-banner" :class="winner">
        <h1 v-if="winner === 'tie'">🤝 It's a Tie!</h1>
        <h1 v-else>🏆 {{ winnerName }} Wins!</h1>
      </div>

      <!-- Score Comparison -->
      <div class="score-comparison">
        <div class="player-result" :class="{ winner: winner === 'challenger' }">
          <h2>{{ result.challenger?.username || 'Challenger' }}</h2>
          <div class="score-card">
            <div class="score">{{ result.challenger?.score || 0 }}</div>
            <div class="stats">
              <p>
                {{ result.challenger?.correct_answers || 0 }} /
                {{ result.challenger?.total_questions || 0 }} correct
              </p>
              <p v-if="result.challenger?.time_taken_seconds">
                ⏱️ {{ Math.floor(result.challenger.time_taken_seconds / 60) }}:{{
                  String(result.challenger.time_taken_seconds % 60).padStart(2, '0')
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="vs-divider">VS</div>

        <div class="player-result" :class="{ winner: winner === 'challenged' }">
          <h2>{{ result.challenged?.username || 'Challenged' }}</h2>
          <div class="score-card">
            <div class="score">{{ result.challenged?.score || 0 }}</div>
            <div class="stats">
              <p>
                {{ result.challenged?.correct_answers || 0 }} /
                {{ result.challenged?.total_questions || 0 }} correct
              </p>
              <p v-if="result.challenged?.time_taken_seconds">
                ⏱️ {{ Math.floor(result.challenged.time_taken_seconds / 60) }}:{{
                  String(result.challenged.time_taken_seconds % 60).padStart(2, '0')
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="button button-accent" @click="backToChallenges">Back to Challenges</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-result-view {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
}

.winner-banner {
  text-align: center;
  padding: 3rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  animation: fadeIn 0.5s;
}

.winner-banner.challenger {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.winner-banner.challenged {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.winner-banner.tie {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.winner-banner h1 {
  font-size: 3rem;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.score-comparison {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.player-result {
  flex: 1;
  text-align: center;
  padding: 2rem;
  background: var(--color-background-soft);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.3s;
}

.player-result.winner {
  border-color: var(--color-success);
  box-shadow: 0 0 20px rgba(72, 187, 120, 0.3);
}

.player-result h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.score-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score {
  font-size: 4rem;
  font-weight: bold;
  color: var(--color-accent);
}

.player-result.winner .score {
  color: var(--color-success);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stats p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.vs-divider {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

.actions {
  text-align: center;
  padding: 2rem;
}

.button {
  padding: 1rem 2rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.button-accent {
  background: var(--color-accent);
  color: white;
}

.button-accent:hover {
  background: var(--color-accent-dark);
  transform: scale(1.05);
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error-banner {
  background: var(--color-error-soft);
  color: var(--color-error);
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}
</style>
