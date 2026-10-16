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
    <p v-if="needsLogin">
      Your login expired. Sign in again to save your quiz. Your progress is still in this tab.
    </p>
    <p v-else-if="needsAttention">
      We could not save your quiz: {{ syncError.message }}. Your progress is still in this tab.
    </p>
    <p v-else-if="syncError && !unavailable">
      Saving failed. Your progress is still in this tab; you can retry.
    </p>
    <p v-if="hasUnsyncedData" class="tab-warning">
      Keep this tab open. Do not refresh or close it until the status says Saved; unsaved progress
      and results exist only in this tab.
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
