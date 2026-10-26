<script setup>
import { computed } from 'vue'
import { browserOnline, backendAvailable } from '../services/connectionStatus.js'
import { quizStore } from '../stores/quizStore.js'

const { hasUnsyncedData, syncState, isSyncing, pendingCompletion, syncError } = quizStore
const unavailable = computed(() => !browserOnline.value || backendAvailable.value === false)
const needsLogin = computed(() => syncError.value?.status === 401)
const needsAttention = computed(() => [400, 403, 409].includes(syncError.value?.status))

function retry() {
  if (pendingCompletion.value) void quizStore.syncCompletion()
  else void quizStore.flushPending()
}
</script>

<template>
  <aside
    class="quiz-sync-status"
    :class="{ 'needs-saving': hasUnsyncedData }"
    aria-label="Quiz connection and saving status"
  >
    <div class="sync-heading" role="status" aria-live="polite">
      <strong>{{ syncState }}</strong>
      <span v-if="!browserOnline">Offline</span>
      <span v-else-if="backendAvailable === false">Server unavailable</span>
    </div>
    <p v-if="unavailable">
      {{ browserOnline ? 'We cannot reach the server right now.' : 'You are offline.' }}
      You can continue this loaded quiz and view its summary. We’ll retry saving when the connection
      returns.
    </p>
    <p v-if="needsLogin">Your login expired. Sign in again to save your quiz to your account.</p>
    <p v-else-if="needsAttention">
      We could not save your quiz to your account: {{ syncError.message }}.
    </p>
    <p v-else-if="syncError && !unavailable">Saving to your account failed; you can retry.</p>
    <p v-if="quizStore.persistenceError.value" class="tab-warning">
      {{ quizStore.persistenceError.value }}
    </p>
    <p v-else-if="hasUnsyncedData">
      Progress and results are saved on this device. Return to this app to sync them when connected.
    </p>
    <p v-else>Your quiz progress is saved to your account.</p>
    <button
      v-if="hasUnsyncedData"
      class="button button-outline"
      :disabled="isSyncing"
      @click="retry"
    >
      {{ isSyncing ? 'Syncing…' : 'Retry saving' }}
    </button>
  </aside>
</template>
