<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { quizStore } from '../stores/quizStore'

const route = useRoute()
const router = useRouter()

const challengeId = Number(route.params.id)
const progress = ref(null)
const loading = ref(true)
const error = ref(null)
let pollInterval = null

onMounted(async () => {
  try {
    // Start the challenge quiz (or resume if already started)
    const quiz = await api.startChallengeQuiz(challengeId)
    quizStore.loadQuiz(quiz)

    // Start polling for opponent progress
    await pollProgress()
    pollInterval = setInterval(pollProgress, 5000)
  } catch (err) {
    error.value = 'Failed to start challenge: ' + err.message
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

async function pollProgress() {
  try {
    progress.value = await api.getChallengeProgress(challengeId)

    // If both completed, redirect to result
    if (
      progress.value.your_progress.is_completed &&
      progress.value.opponent_progress.is_completed
    ) {
      clearInterval(pollInterval)
      router.push(`/challenges/${challengeId}/result`)
    }
  } catch (err) {
    console.error('Failed to poll progress:', err)
  }
}

function goToQuiz() {
  router.push('/explore')
}
</script>

<template>
  <div class="challenge-play-view">
    <div v-if="loading" class="loading">Loading challenge...</div>
    <div v-else-if="error" class="error-banner">⚠️ {{ error }}</div>
    <div v-else>
      <!-- Live Progress Header -->
      <div v-if="progress" class="progress-header">
        <h2>Challenge in Progress</h2>
        <div class="progress-comparison">
          <div class="player-progress">
            <h3>You</h3>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width:
                    (progress.your_progress.answered_count /
                      progress.your_progress.total_count) *
                      100 +
                    '%',
                }"
              ></div>
            </div>
            <p>
              {{ progress.your_progress.answered_count }} / {{ progress.your_progress.total_count }}
              questions
            </p>
            <span v-if="progress.your_progress.is_completed" class="badge success">
              ✓ Completed
            </span>
          </div>

          <div class="vs-divider">VS</div>

          <div class="player-progress">
            <h3>Opponent</h3>
            <div class="progress-bar">
              <div
                class="progress-fill opponent"
                :style="{
                  width:
                    (progress.opponent_progress.answered_count /
                      progress.opponent_progress.total_count) *
                      100 +
                    '%',
                }"
              ></div>
            </div>
            <p>
              {{ progress.opponent_progress.answered_count }} /
              {{ progress.opponent_progress.total_count }} questions
            </p>
            <span v-if="progress.opponent_progress.is_completed" class="badge success">
              ✓ Completed
            </span>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <p>
          Click below to start or continue your quiz. Your opponent's progress will update
          automatically.
        </p>
        <button class="button button-accent" @click="goToQuiz">Go to Quiz →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.challenge-play-view {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.progress-header {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.progress-header h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.progress-comparison {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.player-progress {
  flex: 1;
  text-align: center;
}

.player-progress h3 {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: var(--color-background-mute);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.5s ease;
}

.progress-fill.opponent {
  background: var(--color-warning);
}

.vs-divider {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.badge.success {
  background: var(--color-success);
  color: white;
}

.instructions {
  text-align: center;
  padding: 2rem;
}

.instructions p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
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
