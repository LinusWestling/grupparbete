<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { quizStore } from '../stores/quizStore'
import {
  POLL_INTERVAL_MS,
  COMPLETION_MESSAGE_DELAY_MS,
  calculateProgressPercentage,
} from '../utils/challengeHelpers'

const route = useRoute()
const router = useRouter()

const challengeId = Number(route.params.id)
const progress = ref(null)
const loading = ref(true)
const error = ref(null)
const completionMessage = ref(null)
const isUnmounted = ref(false)
let pollInterval = null
let completionTimeout = null
let switchedTurn = false

onMounted(async () => {
  try {
    // Start the challenge quiz (or resume if already started)
    const quiz = await api.startChallengeQuiz(challengeId)

    if (isUnmounted.value) return

    quizStore.loadQuiz(quiz)

    // Start polling for opponent progress
    await pollProgress()

    if (isUnmounted.value) return

    pollInterval = setInterval(pollProgress, POLL_INTERVAL_MS)
  } catch (err) {
    if (isUnmounted.value) return
    error.value = 'Det gick inte att starta utmaningen: ' + err.message
  } finally {
    if (!isUnmounted.value) {
      loading.value = false
    }
  }
})

onUnmounted(() => {
  isUnmounted.value = true
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  if (completionTimeout) {
    clearTimeout(completionTimeout)
  }
})

/**
 * Poll the server for challenge progress and handle turn switching or completion redirects.
 */
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
      return
    }

    // If user completed their quiz, notify backend to switch turns
    if (progress.value.your_progress.is_completed && !switchedTurn) {
      try {
        await api.completeChallengeQuiz(challengeId)
        switchedTurn = true
        completionMessage.value =
          'Bra jobbat! Nu är det din motståndares tur. Du kan se resultatet när båda har slutfört quizet.'
        // Show message then redirect
        completionTimeout = setTimeout(() => {
          clearInterval(pollInterval)
          router.push('/challenges')
        }, COMPLETION_MESSAGE_DELAY_MS)
      } catch (err) {
        console.error('Failed to switch turn:', err)
      }
    }
  } catch (err) {
    console.error('Failed to poll progress:', err)
  }
}

/**
 * Navigate to the explore quiz view to answer challenge questions.
 */
function goToQuiz() {
  router.push('/explore')
}
</script>

<template>
  <div class="challenge-page">
    <div v-if="loading" class="loading-state">Läser in utmaning…</div>
    <div v-else-if="error" class="error-banner" role="alert">⚠️ {{ error }}</div>
    <div v-else-if="completionMessage" class="success-banner" role="status">
      ✓ {{ completionMessage }}
    </div>
    <div v-else class="challenge-section">
      <!-- Live Progress Header -->
      <div v-if="progress" class="progress-header">
        <h2>Utmaning pågår</h2>
        <div class="progress-comparison">
          <div class="player-progress">
            <h3>Du</h3>
            <div class="progress-bar lg">
              <div
                class="progress-fill"
                :style="{
                  '--progress-width':
                    calculateProgressPercentage(
                      progress.your_progress.answered_count,
                      progress.your_progress.total_count,
                    ) + '%',
                }"
              ></div>
            </div>
            <p class="text-muted">
              {{ progress.your_progress.answered_count }} / {{ progress.your_progress.total_count }}
              frågor
            </p>
            <span v-if="progress.your_progress.is_completed" class="status-pill approved">
              ✓ Slutfört
            </span>
          </div>

          <div class="vs-divider">MOT</div>

          <div class="player-progress">
            <h3>Motståndare</h3>
            <div class="progress-bar lg">
              <div
                class="progress-fill opponent"
                :style="{
                  '--progress-width':
                    calculateProgressPercentage(
                      progress.opponent_progress.answered_count,
                      progress.opponent_progress.total_count,
                    ) + '%',
                }"
              ></div>
            </div>
            <p class="text-muted">
              {{ progress.opponent_progress.answered_count }} /
              {{ progress.opponent_progress.total_count }} frågor
            </p>
            <span v-if="progress.opponent_progress.is_completed" class="status-pill approved">
              ✓ Slutfört
            </span>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="challenge-instructions">
        <p>
          Klicka nedan för att starta eller fortsätta ditt quiz. Motståndarens framsteg uppdateras
          automatiskt.
        </p>
        <button class="button button-accent" @click="goToQuiz">Gå till quizet →</button>
      </div>
    </div>
  </div>
</template>
