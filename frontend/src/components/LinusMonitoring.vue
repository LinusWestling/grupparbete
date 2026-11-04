<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'
import { monitoringLabels } from '../../../shared/monitoring.mjs'

const events = ref([])
const loading = ref(false)
const error = ref('')
const signInRequired = ref(false)
let disposed = false

async function refresh() {
  if (loading.value || disposed) return
  loading.value = true
  error.value = ''
  signInRequired.value = false
  // Discard the old snapshot, including if a subsequent request is unauthorized.
  events.value = []
  try {
    const result = await api.getMonitoringEvents()
    if (!disposed) events.value = result
  } catch (failure) {
    if (!disposed) {
      signInRequired.value = failure.status === 401
      error.value = signInRequired.value ? 'Log in to read the monitoring log.' : failure.message
    }
  } finally {
    if (!disposed) loading.value = false
  }
}

onMounted(refresh)
onBeforeUnmount(() => {
  disposed = true
})
</script>

<template>
  <section aria-labelledby="monitoring-title">
    <h1 id="monitoring-title">Monitoring</h1>
    <p>
      All logged-in users can read the latest 100 events. Opening or refreshing this log records a
      “Monitoring log read” event for your monitoring ID.
    </p>
    <p>
      IDs are pseudonyms. The account mapping stays in a separate server-side table. Events contain
      no names, real user or quiz IDs, answers, scores, IP addresses or browser data.
    </p>
    <p>
      Quiz start means the server created a quiz session (including assigned tests). Finish means
      the server accepted completion; offline completions appear after synchronization. Times below
      are UTC. This is a snapshot; use Refresh to read again.
    </p>
    <button type="button" :disabled="loading" @click="refresh">Refresh monitoring log</button>
    <p v-if="loading" role="status">Loading monitoring events…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <RouterLink v-if="signInRequired" to="/profile">Go to profile to log in</RouterLink>
    <table v-if="events.length">
      <caption>
        Latest monitoring events, newest first
      </caption>
      <thead>
        <tr>
          <th scope="col">Time (UTC)</th>
          <th scope="col">Monitoring user ID</th>
          <th scope="col">Event</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.id">
          <td>
            <time :datetime="event.occurred_at">{{ event.occurred_at }}</time>
          </td>
          <td>
            <code>{{ event.monitoring_user_id }}</code>
          </td>
          <td>{{ monitoringLabels[event.event_type] || event.event_type }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
