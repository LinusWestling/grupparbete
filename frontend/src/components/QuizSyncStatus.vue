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
    aria-label="Anslutning och sparstatus för quizet"
  >
    <div class="sync-heading" role="status" aria-live="polite">
      <strong>{{ syncState }}</strong>
      <span v-if="!browserOnline">Ingen internetanslutning</span>
      <span v-else-if="backendAvailable === false">Servern är inte tillgänglig</span>
    </div>
    <p v-if="unavailable">
      {{ browserOnline ? 'Vi kan inte nå servern just nu.' : 'Du saknar internetanslutning.' }}
      Du kan fortsätta med det inlästa quizet och se sammanfattningen. Vi försöker spara igen när
      anslutningen återkommer.
    </p>
    <p v-if="needsLogin">
      Din session har gått ut. Logga in igen för att spara quizet på ditt konto.
    </p>
    <p v-else-if="needsAttention">
      Det gick inte att spara quizet på ditt konto: {{ syncError.message }}
    </p>
    <p v-else-if="syncError && !unavailable">
      Det gick inte att spara på ditt konto. Du kan försöka igen.
    </p>
    <p v-if="quizStore.persistenceError.value" class="tab-warning">
      {{ quizStore.persistenceError.value }}
    </p>
    <p v-else-if="hasUnsyncedData">
      Framsteg och resultat är sparade på den här enheten. Återvänd till appen för att synkronisera
      dem när du har anslutning.
    </p>
    <p v-else>Dina quizframsteg är sparade på ditt konto. Du kan återvända senare och fortsätta.</p>
    <button
      v-if="hasUnsyncedData"
      class="button button-outline"
      :disabled="isSyncing"
      @click="retry"
    >
      {{ isSyncing ? 'Synkroniserar…' : 'Försök spara igen' }}
    </button>
  </aside>
</template>
